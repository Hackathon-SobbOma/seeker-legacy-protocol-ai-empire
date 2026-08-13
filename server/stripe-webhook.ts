import Stripe from "stripe";
import type { Request, Response } from "express";
import {
  createUserSubscription,
  getSubscriptionPlanById,
  getUserSubscriptionByStripeId,
  updateSubscriptionByStripeId,
  createBillingRecord,
  getBillingRecord,
  updateBillingRecord,
} from "./db.subscriptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-07-29.dahlia",
});

export function mapStripeStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
      return "active" as const;
    case "trialing":
      return "trialing" as const;
    case "past_due":
    case "unpaid":
      return "past_due" as const;
    case "paused":
      return "paused" as const;
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    default:
      return "cancelled" as const;
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    return res.status(400).json({ error: "Missing Stripe signature" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error) {
    console.error("[Stripe] Webhook signature verification failed", error);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = Number(session.metadata?.user_id || session.client_reference_id);
      const planId = Number(session.metadata?.plan_id);
      const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      if (userId && planId && stripeSubscriptionId) {
        const plan = await getSubscriptionPlanById(planId);
        const stripeSubscriptionResponse = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const stripeSubscription = stripeSubscriptionResponse;
        const subscriptionItem = stripeSubscription.items.data[0];
        const existing = await getUserSubscriptionByStripeId(stripeSubscriptionId);

        const record = {
          userId,
          planId,
          stripeSubscriptionId,
          status: mapStripeStatus(stripeSubscription.status),
          billingCycle: session.metadata?.billing_cycle === "yearly" ? "yearly" as const : "monthly" as const,
          currentPeriodStart: new Date((subscriptionItem?.current_period_start ?? Math.floor(Date.now() / 1000)) * 1000),
          currentPeriodEnd: new Date((subscriptionItem?.current_period_end ?? Math.floor(Date.now() / 1000)) * 1000),
          trialEndDate: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
          autoRenew: true,
        };

        if (plan && existing) {
          await updateSubscriptionByStripeId(stripeSubscriptionId, record);
        } else if (plan) {
          await createUserSubscription(record);
        }
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const existing = await getUserSubscriptionByStripeId(subscription.id);
      if (existing) {
        const subscriptionItem = subscription.items.data[0];
        await updateSubscriptionByStripeId(subscription.id, {
          status: mapStripeStatus(subscription.status),
          currentPeriodStart: new Date((subscriptionItem?.current_period_start ?? Math.floor(Date.now() / 1000)) * 1000),
          currentPeriodEnd: new Date((subscriptionItem?.current_period_end ?? Math.floor(Date.now() / 1000)) * 1000),
          trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          autoRenew: !subscription.cancel_at_period_end,
        });
      }
    }

    if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const rawInvoice = invoice as unknown as {
        subscription?: string | { id: string } | null;
        number?: string | null;
        amount_paid?: number;
        total?: number;
        currency?: string;
        period_start?: number;
        period_end?: number;
      };
      const stripeSubscriptionId = typeof rawInvoice.subscription === "string"
        ? rawInvoice.subscription
        : rawInvoice.subscription?.id;
      const subscription = stripeSubscriptionId
        ? await getUserSubscriptionByStripeId(stripeSubscriptionId)
        : undefined;

      if (subscription) {
        const invoiceNumber = rawInvoice.number || invoice.id;
        const existingInvoice = await getBillingRecord(invoiceNumber);
        const invoiceStatus = event.type === "invoice.paid" ? "paid" as const : "open" as const;
        const invoiceData = {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          invoiceNumber,
          stripeInvoiceId: invoice.id,
          amount: ((rawInvoice.amount_paid ?? rawInvoice.total ?? 0) / 100).toFixed(2),
          currency: (rawInvoice.currency || "usd").toUpperCase(),
          status: invoiceStatus,
          billingPeriodStart: new Date((rawInvoice.period_start ?? Math.floor(Date.now() / 1000)) * 1000),
          billingPeriodEnd: new Date((rawInvoice.period_end ?? Math.floor(Date.now() / 1000)) * 1000),
          paidDate: event.type === "invoice.paid" ? new Date() : null,
          description: "SEEKER LEGACY PROTOCOL subscription invoice",
          lineItems: [],
        };

        if (existingInvoice) {
          await updateBillingRecord(existingInvoice.id, invoiceData);
        } else {
          await createBillingRecord(invoiceData);
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const existing = await getUserSubscriptionByStripeId(subscription.id);
      if (existing) {
        await updateSubscriptionByStripeId(subscription.id, {
          status: "cancelled",
          cancelledAt: new Date(),
          autoRenew: false,
        });
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("[Stripe] Webhook processing failed", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
