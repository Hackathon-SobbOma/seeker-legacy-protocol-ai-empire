import { describe, expect, it } from "vitest";
import { DEFAULT_SUBSCRIPTION_PLANS } from "./db.subscriptions";
import { mapStripeStatus } from "./stripe-webhook";

describe("subscription pricing", () => {
  it("defines the Explorer tier as non-executing access", () => {
    const explorer = DEFAULT_SUBSCRIPTION_PLANS.find((plan) => plan.tier === "free");

    expect(explorer).toMatchObject({
      name: "Explorer",
      monthlyPrice: "0.00",
      maxAgents: 0,
      maxExecutionsPerDay: 0,
    });
  });

  it("increases automated capacity across paid tiers", () => {
    const paidPlans = DEFAULT_SUBSCRIPTION_PLANS.filter((plan) => plan.tier !== "free");

    expect(paidPlans.map((plan) => plan.maxAgents)).toEqual([1, 5, 25]);
    expect(paidPlans.map((plan) => plan.maxExecutionsPerDay)).toEqual([100, 1000, 10000]);
    expect(paidPlans.map((plan) => Number(plan.monthlyPrice))).toEqual([29, 99, 299]);
  });

  it("includes user-facing feature descriptions for every tier", () => {
    expect(DEFAULT_SUBSCRIPTION_PLANS).toHaveLength(4);
    for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
      expect(plan.features?.length).toBeGreaterThan(0);
      expect(plan.description).toBeTruthy();
    }
  });
});

describe("Stripe subscription status mapping", () => {
  it("preserves active and trialing access states", () => {
    expect(mapStripeStatus("active")).toBe("active");
    expect(mapStripeStatus("trialing")).toBe("trialing");
  });

  it("maps delinquent subscriptions to past_due", () => {
    expect(mapStripeStatus("past_due")).toBe("past_due");
    expect(mapStripeStatus("unpaid")).toBe("past_due");
  });

  it("maps terminal Stripe states to the local cancelled state", () => {
    expect(mapStripeStatus("canceled")).toBe("cancelled");
    expect(mapStripeStatus("incomplete_expired")).toBe("cancelled");
  });
});
