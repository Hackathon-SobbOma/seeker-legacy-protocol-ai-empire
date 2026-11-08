import { buildContentPack, type ContentPack } from "./engines/content.js";
import { draftOffer, type DraftOfferResult } from "./engines/monetization.js";
import { runEthicsGate } from "./core/ethics.js";

export type AutomationChannel = "x" | "linkedin" | "youtube" | "newsletter";
export type AutomationTaskType = "research" | "draft_content" | "draft_offer" | "publish" | "analytics";
export type AutomationTaskStatus = "queued" | "approved" | "blocked" | "completed";

export interface AutomationConfig {
  brand: string;
  sourceTitle: string;
  coreIdea: string;
  channels: AutomationChannel[];
  maxPostsPerDay: number;
  requireHumanApproval: boolean;
  disclosure: string;
}

export interface AutomationTask {
  id: string;
  type: AutomationTaskType;
  channel?: AutomationChannel;
  title: string;
  status: AutomationTaskStatus;
  requiresApproval: boolean;
  reason?: string;
}

export interface AutomationPlan {
  mode: "approval-gated";
  generatedAt: string;
  contentPack: ContentPack;
  offer: DraftOfferResult;
  tasks: AutomationTask[];
  safety: {
    noRevenueGuarantees: boolean;
    noAutonomousPublishing: boolean;
    dailyPostLimit: number;
    disclosure: string;
  };
}

const task = (
  id: string,
  type: AutomationTaskType,
  title: string,
  requiresApproval: boolean,
  channel?: AutomationChannel,
  reason?: string,
): AutomationTask => ({
  id,
  type,
  title,
  channel,
  status: reason ? "blocked" : "queued",
  requiresApproval,
  reason,
});

export function buildAutomationPlan(config: AutomationConfig): AutomationPlan {
  const safeLimit = Math.max(0, Math.min(Math.floor(config.maxPostsPerDay), 20));
  const disclosure = config.disclosure.trim() || "AI-assisted drafting. Human review required before publish.";
  const contentPack = buildContentPack(config.sourceTitle, config.coreIdea);
  const offer = draftOffer({
    name: `${config.brand} Value System Setup`,
    priceUsd: 2500,
    recurring: false,
    valueProposition: `Done-with-you implementation of an owned-audience workflow for ${config.coreIdea}.`,
    claims: [
      "Includes documented workflow and review checklist",
      "Customer retains ownership of lists and assets",
      "No revenue guarantees; outcomes depend on execution",
    ],
  });
  const tasks: AutomationTask[] = [
    task("research-1", "research", `Research audience questions about ${config.coreIdea}`, false),
    task("content-1", "draft_content", `Draft a disclosure-first content pack for ${config.coreIdea}`, false),
    task("offer-1", "draft_offer", `Review the ${config.brand} Value System Setup offer`, true),
    task("analytics-1", "analytics", "Collect consented performance metrics and summarize learnings", false),
  ];
  for (const channel of config.channels) {
    tasks.push(
      task(
        `publish-${channel}`,
        "publish",
        `Publish an approved draft to ${channel}`,
        config.requireHumanApproval,
        channel,
        safeLimit === 0 ? "Publishing disabled because daily post limit is zero." : undefined,
      ),
    );
  }
  const safetyText = [contentPack.disclosure, disclosure, ...offer.offer.claims].join(" ");
  const ethics = runEthicsGate(safetyText);
  if (!ethics.ok) {
    for (const item of tasks) {
      if (item.type === "publish" || item.type === "draft_offer") {
        item.status = "blocked";
        item.reason = ethics.reasons.join("; ");
      }
    }
  }
  return {
    mode: "approval-gated",
    generatedAt: new Date().toISOString(),
    contentPack,
    offer,
    tasks,
    safety: {
      noRevenueGuarantees: !/guaranteed|100%|overnight/i.test(safetyText),
      noAutonomousPublishing: config.requireHumanApproval,
      dailyPostLimit: safeLimit,
      disclosure,
    },
  };
}

export function approveTask(plan: AutomationPlan, taskId: string): AutomationPlan {
  const target = plan.tasks.find((item) => item.id === taskId);
  if (!target || target.status === "blocked") return plan;
  if (target.requiresApproval) target.status = "approved";
  return plan;
}

export function completeTask(plan: AutomationPlan, taskId: string): AutomationPlan {
  const target = plan.tasks.find((item) => item.id === taskId);
  if (!target || target.status === "blocked") return plan;
  if (target.requiresApproval && target.status !== "approved") return plan;
  target.status = "completed";
  return plan;
}
