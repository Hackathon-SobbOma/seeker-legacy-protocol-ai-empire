import { randomUUID } from "node:crypto";
import type { AgentAction, AgentRole, Priority } from "../types.js";
import { runEthicsGate } from "./ethics.js";

const ROLE_INTENTS: Record<AgentRole, string[]> = {
  ceo: [
    "Review weekly system health and prioritize owned-asset growth",
    "Align parallel tracks: Micro-SaaS, content flywheel, agency-lite",
  ],
  growth: [
    "Draft value-first hooks for long-form to short repurposing",
    "Plan email list nurture without spam patterns",
  ],
  automation: [
    "Design one approval-gated automation loop",
    "Reduce manual steps in content pipeline",
  ],
  monetization: [
    "Propose high-margin digital offer with honest claims only",
    "Map membership vs one-time product tradeoffs",
  ],
  ethics: ["Scan pending actions for fidelity and disclosure"],
};

export function proposeAction(role: AgentRole, priority: Priority = "medium"): AgentAction {
  const intents = ROLE_INTENTS[role];
  const intent = intents[Math.floor(Math.random() * intents.length)]!;
  const ethics = runEthicsGate(intent);
  return {
    id: randomUUID(),
    role,
    intent,
    priority,
    requiresApproval: priority === "high" || priority === "critical" || role === "monetization",
    ethicsPassed: ethics.ok,
    result: ethics.ok ? undefined : "Blocked: " + ethics.reasons.join("; "),
    createdAt: new Date().toISOString(),
  };
}

export function runRoleCycle(
  roles: AgentRole[] = ["ceo", "growth", "automation", "monetization", "ethics"]
): AgentAction[] {
  return roles.map((role) => proposeAction(role, role === "monetization" ? "high" : "medium"));
}
