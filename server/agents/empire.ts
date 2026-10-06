export type EmpireRole =
  | "master"
  | "researcher"
  | "architect"
  | "coder"
  | "tester"
  | "security"
  | "product"
  | "judge";

export type EmpireAgentStatus = "created" | "running" | "completed" | "blocked";

export interface EmpireLimits {
  maxGenerationDepth: number;
  maxTotalAgents: number;
  maxConcurrentAgents: number;
  maxTaskRuntimeMs: number;
  maxAgentBudgetUsd: number;
}

export const DEFAULT_EMPIRE_LIMITS: EmpireLimits = {
  maxGenerationDepth: 2,
  maxTotalAgents: 8,
  maxConcurrentAgents: 3,
  maxTaskRuntimeMs: 5_000,
  maxAgentBudgetUsd: 0.25,
};

export interface EmpireAgent {
  agentId: string;
  parentId: string | null;
  generation: number;
  role: EmpireRole;
  objective: string;
  status: EmpireAgentStatus;
  result?: {
    testsPassed: boolean;
    confidence: number;
    lessons: string[];
    recommendedNextAction: string;
    simulation: true;
  };
}

export interface EmpireRun {
  runId: string;
  goal: string;
  mode: "simulation";
  status: "completed" | "blocked";
  limits: EmpireLimits;
  agents: EmpireAgent[];
  memory: Array<{ type: "decision" | "lesson" | "evaluation"; content: string }>;
  startedAt: string;
  completedAt: string;
  blockedReason?: string;
}

const runs = new Map<string, EmpireRun>();

function chooseRoles(goal: string): EmpireRole[] {
  const normalized = goal.toLowerCase();
  const roles: EmpireRole[] = ["architect", "researcher", "security", "tester"];

  if (/ui|frontend|product|interface|dashboard/.test(normalized)) roles.push("product");
  if (/code|build|app|marketplace|platform|implement/.test(normalized)) roles.push("coder");
  if (roles.length < 6) roles.push("judge");

  return roles.slice(0, 7);
}

export function planEmpire(goal: string, requestedLimits?: Partial<EmpireLimits>) {
  const limits = { ...DEFAULT_EMPIRE_LIMITS, ...requestedLimits };
  const roles = chooseRoles(goal);
  return {
    mode: "simulation" as const,
    goal,
    limits,
    roles,
    safety: [
      "No arbitrary shell or subprocess execution",
      "No private-key custody or wallet signing",
      "No external API calls from the orchestrator",
      "Bounded depth, agent count, concurrency, runtime, and budget",
      "All worker outputs are labeled simulation",
    ],
  };
}

export function runEmpire(goal: string, requestedLimits?: Partial<EmpireLimits>): EmpireRun {
  const runId = `empire_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const plan = planEmpire(goal, requestedLimits);
  const startedAt = new Date().toISOString();
  const agents: EmpireAgent[] = [];
  const memory: EmpireRun["memory"] = [];

  const addAgent = (role: EmpireRole, parentId: string | null, generation: number, objective: string) => {
    if (generation > plan.limits.maxGenerationDepth || agents.length >= plan.limits.maxTotalAgents) return null;
    const agent: EmpireAgent = {
      agentId: `${role}_${agents.length + 1}`,
      parentId,
      generation,
      role,
      objective,
      status: "running",
    };
    agents.push(agent);
    return agent;
  };

  const master = addAgent("master", null, 0, "Coordinate a bounded team for the requested goal.");
  if (!master) throw new Error("Unable to create master agent within configured limits");

  memory.push({ type: "decision", content: `Master identified ${plan.roles.length} required capabilities.` });

  for (const role of plan.roles) {
    if (agents.filter((agent) => agent.status === "running").length >= plan.limits.maxConcurrentAgents) {
      memory.push({ type: "decision", content: "Concurrency guard reached; workers are evaluated in bounded batches." });
      agents.filter((agent) => agent.status === "running").forEach((agent) => (agent.status = "completed"));
    }
    const worker = addAgent(role, master.agentId, 1, `Provide the ${role} capability for: ${goal}`);
    if (!worker) continue;
    worker.status = "completed";
    worker.result = {
      testsPassed: true,
      confidence: 0.82,
      lessons: [`${role} output recorded in shared memory; no model retraining claimed.`],
      recommendedNextAction: role === "security" ? "Keep signing and external side effects approval-gated." : "Pass structured result to master.",
      simulation: true,
    };
    memory.push({ type: "lesson", content: `${role} completed in simulation mode.` });
  }

  master.status = "completed";
  master.result = {
    testsPassed: true,
    confidence: 0.9,
    lessons: ["Operational learning is represented by memory and evaluation, not foundation-model retraining."],
    recommendedNextAction: "Review the plan, then connect approved capabilities individually.",
    simulation: true,
  };
  memory.push({ type: "evaluation", content: "Run completed with bounded workers and no external side effects." });

  const run: EmpireRun = {
    runId,
    goal,
    mode: "simulation",
    status: "completed",
    limits: plan.limits,
    agents,
    memory,
    startedAt,
    completedAt: new Date().toISOString(),
  };
  runs.set(runId, run);
  return run;
}

export function getEmpireRun(runId: string) {
  return runs.get(runId) ?? null;
}
