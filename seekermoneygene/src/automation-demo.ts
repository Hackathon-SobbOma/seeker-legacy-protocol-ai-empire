import { approveTask, buildAutomationPlan, completeTask, type AutomationConfig } from "./automation.js";

const config: AutomationConfig = {
  brand: "SEEKER LEGACY PROTOCOL",
  sourceTitle: "Building owned audience systems with AI",
  coreIdea: "ethical AI-assisted content workflows",
  channels: ["x", "linkedin", "youtube", "newsletter"],
  maxPostsPerDay: 3,
  requireHumanApproval: true,
  disclosure: "AI-assisted drafting. Human review required before publish.",
};

const plan = buildAutomationPlan(config);
console.log(JSON.stringify({
  mode: plan.mode,
  safety: plan.safety,
  offerValid: plan.offer.ok,
  queuedTasks: plan.tasks.map(({ id, type, channel, status, requiresApproval }) => ({ id, type, channel, status, requiresApproval })),
}, null, 2));

approveTask(plan, "publish-x");
completeTask(plan, "publish-x");
console.log("\nApproved and completed one X draft; all other publish tasks remain gated.");
