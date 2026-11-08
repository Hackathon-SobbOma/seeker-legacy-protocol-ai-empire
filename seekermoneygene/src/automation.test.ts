import { describe, expect, it } from "vitest";
import { approveTask, buildAutomationPlan, completeTask, type AutomationConfig } from "./automation.js";

const config: AutomationConfig = {
  brand: "SEEKER",
  sourceTitle: "Owned audience systems",
  coreIdea: "ethical AI-assisted content workflows",
  channels: ["x", "linkedin"],
  maxPostsPerDay: 3,
  requireHumanApproval: true,
  disclosure: "AI-assisted drafting. Human review required before publish.",
};

describe("ethical wealth-system automation", () => {
  it("creates a real plan without autonomously publishing", () => {
    const plan = buildAutomationPlan(config);
    expect(plan.mode).toBe("approval-gated");
    expect(plan.safety.noRevenueGuarantees).toBe(true);
    expect(plan.safety.noAutonomousPublishing).toBe(true);
    expect(plan.tasks.find((task) => task.id === "publish-x")?.status).toBe("queued");
    expect(plan.tasks.find((task) => task.id === "publish-x")?.requiresApproval).toBe(true);
  });

  it("requires approval before a publish task can complete", () => {
    const plan = buildAutomationPlan(config);
    expect(completeTask(plan, "publish-x").tasks.find((task) => task.id === "publish-x")?.status).toBe("queued");
    approveTask(plan, "publish-x");
    completeTask(plan, "publish-x");
    expect(plan.tasks.find((task) => task.id === "publish-x")?.status).toBe("completed");
  });

  it("caps the daily posting limit and disables publishing at zero", () => {
    const plan = buildAutomationPlan({ ...config, maxPostsPerDay: 100 });
    expect(plan.safety.dailyPostLimit).toBe(20);
    const disabled = buildAutomationPlan({ ...config, maxPostsPerDay: 0 });
    expect(disabled.tasks.find((task) => task.id === "publish-x")?.status).toBe("blocked");
  });
});
