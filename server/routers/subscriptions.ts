import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import Stripe from "stripe";
import {
  getSubscriptionPlans,
  getSubscriptionPlanById,
  getUserSubscription,
  getUserSubscriptionHistory,
  createUserSubscription,
  updateUserSubscription,
  cancelUserSubscription,
  trackUsage,
  getTodayUsage,
  updateUsage,
  getMonthlyUsage,
  createBillingRecord,
  getBillingRecords,
  getBillingRecord,
  updateBillingRecord,
  getUnpaidInvoices,
  checkSubscriptionLimit,
} from "../db.subscriptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-07-29.dahlia",
});

export const subscriptionsRouter = router({
  /**
   * Get all available subscription plans
   */
  getPlans: publicProcedure.query(async () => {
    return getSubscriptionPlans();
  }),

  /**
   * Get current user's active subscription
   */
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    return getUserSubscription(ctx.user.id);
  }),

  /**
   * Get user's subscription history
   */
  getSubscriptionHistory: protectedProcedure.query(async ({ ctx }) => {
    return getUserSubscriptionHistory(ctx.user.id);
  }),

  /**
   * Create checkout session for subscription
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        billingCycle: z.enum(["monthly", "yearly"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await getSubscriptionPlanById(input.planId);
      if (!plan) {
        throw new Error("Plan not found");
      }

      const price =
        input.billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

      try {
        const session = await stripe.checkout.sessions.create({
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: plan.name,
                  description: plan.description || undefined,
                },
                unit_amount: Math.round(Number(price) * 100),
                recurring: {
                  interval: input.billingCycle === "yearly" ? "year" : "month",
                  interval_count: 1,
                },
              },
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${ctx.req.headers.origin}/dashboard?subscription=success`,
          cancel_url: `${ctx.req.headers.origin}/pricing?subscription=cancelled`,
          metadata: {
            user_id: ctx.user.id.toString(),
            plan_id: input.planId.toString(),
            billing_cycle: input.billingCycle,
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
          allow_promotion_codes: true,
        });

        return {
          success: true,
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Checkout session creation failed:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await getUserSubscription(ctx.user.id);
    if (!subscription) {
      throw new Error("No active subscription found");
    }

    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      } catch (error) {
        console.error("Stripe cancellation failed:", error);
      }
    }

    await cancelUserSubscription(subscription.id);

    return {
      success: true,
      message: "Subscription cancelled successfully",
    };
  }),

  /**
   * Track agent execution
   */
  trackExecution: protectedProcedure.mutation(async ({ ctx }) => {
    // Check subscription limit
    const limit = await checkSubscriptionLimit(ctx.user.id, "executions");
    if (!limit.allowed) {
      throw new Error("Execution limit reached for your subscription");
    }

    // Get or create today's usage
    let usage = await getTodayUsage(ctx.user.id);
    if (!usage) {
      await trackUsage(ctx.user.id, {
        date: new Date(),
        agentExecutions: 1,
        apiCalls: 0,
        transactionsProcessed: 0,
        storageUsedMb: "0",
      });
    } else {
      await updateUsage(ctx.user.id, {
        agentExecutions: (usage.agentExecutions || 0) + 1,
      });
    }

    return {
      success: true,
      remaining: limit.limit - (limit.current + 1),
    };
  }),

  /**
   * Get today's usage
   */
  getTodayUsage: protectedProcedure.query(async ({ ctx }) => {
    const usage = await getTodayUsage(ctx.user.id);
    const subscription = await getUserSubscription(ctx.user.id);
    const plan = subscription
      ? await getSubscriptionPlanById(subscription.planId)
      : null;

    return {
      usage: usage || {
        agentExecutions: 0,
        apiCalls: 0,
        transactionsProcessed: 0,
        storageUsedMb: 0,
      },
      limits: plan
        ? {
            maxExecutions: plan.maxExecutionsPerDay,
            maxAgents: plan.maxAgents,
          }
        : null,
    };
  }),

  /**
   * Get monthly usage summary
   */
  getMonthlyUsage: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const usage = await getMonthlyUsage(ctx.user.id, input.year, input.month);

      const totals = usage.reduce(
        (acc, day) => ({
          agentExecutions: acc.agentExecutions + (day.agentExecutions || 0),
          apiCalls: acc.apiCalls + (day.apiCalls || 0),
          transactionsProcessed:
            acc.transactionsProcessed + (day.transactionsProcessed || 0),
          storageUsedMb: acc.storageUsedMb + Number(day.storageUsedMb || 0),
        }),
        {
          agentExecutions: 0,
          apiCalls: 0,
          transactionsProcessed: 0,
          storageUsedMb: 0,
        }
      );

      return {
        daily: usage,
        totals,
      };
    }),

  /**
   * Get billing records
   */
  getBillingRecords: protectedProcedure.query(async ({ ctx }) => {
    return getBillingRecords(ctx.user.id);
  }),

  /**
   * Get unpaid invoices
   */
  getUnpaidInvoices: protectedProcedure.query(async ({ ctx }) => {
    return getUnpaidInvoices(ctx.user.id);
  }),

  /**
   * Check subscription limits
   */
  checkLimits: protectedProcedure
    .input(
      z.object({
        limitType: z.enum(["agents", "executions"]),
      })
    )
    .query(async ({ ctx, input }) => {
      return checkSubscriptionLimit(ctx.user.id, input.limitType);
    }),

  /**
   * Get subscription details with plan info
   */
  getSubscriptionDetails: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getUserSubscription(ctx.user.id);
    if (!subscription) {
      return null;
    }

    const plan = await getSubscriptionPlanById(subscription.planId);
    return {
      subscription,
      plan,
    };
  }),
});
