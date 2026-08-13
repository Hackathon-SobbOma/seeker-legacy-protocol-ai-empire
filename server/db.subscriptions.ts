import { eq, and, desc, lte, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  subscriptionPlans,
  userSubscriptions,
  usageTracking,
  billingRecords,
  InsertSubscriptionPlan,
  InsertUserSubscription,
  InsertUsageTracking,
  InsertBillingRecord,
  SubscriptionPlan,
  UserSubscription,
  UsageTracking,
  BillingRecord,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Subscription Plans
 */
export const DEFAULT_SUBSCRIPTION_PLANS: InsertSubscriptionPlan[] = [
  {
    name: "Explorer",
    description: "Read-only access to market intelligence and portfolio insights.",
    tier: "free",
    monthlyPrice: "0.00",
    yearlyPrice: "0.00",
    maxAgents: 0,
    maxExecutionsPerDay: 0,
    features: ["Market intelligence", "Portfolio visibility", "No automated execution"],
    isActive: true,
  },
  {
    name: "Operator",
    description: "Launch one automated agent with a focused daily execution allowance.",
    tier: "starter",
    monthlyPrice: "29.00",
    yearlyPrice: "290.00",
    maxAgents: 1,
    maxExecutionsPerDay: 100,
    features: ["1 autonomous agent", "100 executions/day", "Solana wallet operations", "Execution queue monitoring"],
    isActive: true,
  },
  {
    name: "Legion",
    description: "Coordinate multiple agents with higher limits and performance analytics.",
    tier: "professional",
    monthlyPrice: "99.00",
    yearlyPrice: "990.00",
    maxAgents: 5,
    maxExecutionsPerDay: 1000,
    features: ["5 autonomous agents", "1,000 executions/day", "Token distribution workflows", "Revenue analytics"],
    isActive: true,
  },
  {
    name: "Protocol",
    description: "Scale agent operations across teams, strategies, and blockchain networks.",
    tier: "enterprise",
    monthlyPrice: "299.00",
    yearlyPrice: "2990.00",
    maxAgents: 25,
    maxExecutionsPerDay: 10000,
    features: ["25 autonomous agents", "10,000 executions/day", "Priority queue processing", "Multi-chain operations", "Dedicated support"],
    isActive: true,
  },
];

async function ensureDefaultSubscriptionPlans(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new Error("Database not available");
  const existing = await db.select({ id: subscriptionPlans.id }).from(subscriptionPlans).limit(1);
  if (existing.length === 0) {
    await db.insert(subscriptionPlans).values(DEFAULT_SUBSCRIPTION_PLANS);
  }
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await ensureDefaultSubscriptionPlans(db);
  return db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true));
}

export async function getSubscriptionPlanById(
  planId: number
): Promise<SubscriptionPlan | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await ensureDefaultSubscriptionPlans(db);
  const result = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId))
    .limit(1);

  return result[0];
}

export async function createSubscriptionPlan(
  plan: InsertSubscriptionPlan
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(subscriptionPlans).values(plan);
}

/**
 * User Subscriptions
 */
export async function getUserSubscription(
  userId: number
): Promise<UserSubscription | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, "active")
      )
    )
    .limit(1);

  return result[0];
}

export async function getUserSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<UserSubscription | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);

  return result[0];
}

export async function getUserSubscriptionHistory(
  userId: number
): Promise<UserSubscription[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .orderBy(desc(userSubscriptions.createdAt));
}

export async function createUserSubscription(
  subscription: InsertUserSubscription
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(userSubscriptions).values(subscription);
}

export async function updateUserSubscription(
  subscriptionId: number,
  updates: Partial<UserSubscription>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userSubscriptions)
    .set(updates)
    .where(eq(userSubscriptions.id, subscriptionId));
}

export async function updateSubscriptionByStripeId(
  stripeSubscriptionId: string,
  updates: Partial<UserSubscription>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userSubscriptions)
    .set(updates)
    .where(eq(userSubscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

export async function cancelUserSubscription(
  subscriptionId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userSubscriptions)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
    })
    .where(eq(userSubscriptions.id, subscriptionId));
}

/**
 * Usage Tracking
 */
export async function trackUsage(
  userId: number,
  usage: Omit<InsertUsageTracking, "userId">
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(usageTracking).values({
    ...usage,
    userId,
  });
}

export async function getTodayUsage(userId: number): Promise<UsageTracking | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await db
    .select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.userId, userId),
        gte(usageTracking.date, today),
        lte(usageTracking.date, tomorrow)
      )
    )
    .limit(1);

  return result[0];
}

export async function updateUsage(
  userId: number,
  updates: Partial<UsageTracking>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await db
    .update(usageTracking)
    .set(updates)
    .where(
      and(
        eq(usageTracking.userId, userId),
        gte(usageTracking.date, today),
        lte(usageTracking.date, tomorrow)
      )
    );
}

export async function getMonthlyUsage(
  userId: number,
  year: number,
  month: number
): Promise<UsageTracking[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return db
    .select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.userId, userId),
        gte(usageTracking.date, startDate),
        lte(usageTracking.date, endDate)
      )
    )
    .orderBy(desc(usageTracking.date));
}

/**
 * Billing Records
 */
export async function createBillingRecord(
  record: InsertBillingRecord
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(billingRecords).values(record);
}

export async function getBillingRecords(userId: number): Promise<BillingRecord[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(billingRecords)
    .where(eq(billingRecords.userId, userId))
    .orderBy(desc(billingRecords.createdAt));
}

export async function getBillingRecord(
  invoiceNumber: string
): Promise<BillingRecord | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(billingRecords)
    .where(eq(billingRecords.invoiceNumber, invoiceNumber))
    .limit(1);

  return result[0];
}

export async function updateBillingRecord(
  recordId: number,
  updates: Partial<BillingRecord>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(billingRecords)
    .set(updates)
    .where(eq(billingRecords.id, recordId));
}

export async function getUnpaidInvoices(userId: number): Promise<BillingRecord[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(billingRecords)
    .where(
      and(
        eq(billingRecords.userId, userId),
        eq(billingRecords.status, "open")
      )
    )
    .orderBy(desc(billingRecords.dueDate));
}

/**
 * Subscription Enforcement
 */
export async function checkSubscriptionLimit(
  userId: number,
  limitType: "agents" | "executions"
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return { allowed: false, current: 0, limit: 0 };
  }

  const plan = await getSubscriptionPlanById(subscription.planId);
  if (!plan) {
    return { allowed: false, current: 0, limit: 0 };
  }

  if (limitType === "agents") {
    // Count user's agents
    const { tradingAgents } = await import("../drizzle/schema");
    const agents = await db
      .select()
      .from(tradingAgents)
      .where(eq(tradingAgents.userId, userId));

    return {
      allowed: agents.length < plan.maxAgents,
      current: agents.length,
      limit: plan.maxAgents,
    };
  } else {
    // Check daily executions
    const usage = await getTodayUsage(userId);
    const current = usage?.agentExecutions || 0;

    return {
      allowed: current < plan.maxExecutionsPerDay,
      current,
      limit: plan.maxExecutionsPerDay,
    };
  }
}
