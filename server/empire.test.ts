import { describe, expect, it } from "vitest";
import { DEFAULT_EMPIRE_LIMITS, planEmpire, runEmpire } from "./agents/empire";

describe("bounded Empire orchestrator", () => {
  it("creates a bounded simulation plan from a goal", () => {
    const plan = planEmpire("Build a secure marketplace dashboard");
    expect(plan.mode).toBe("simulation");
    expect(plan.roles).toContain("security");
    expect(plan.roles.length).toBeLessThanOrEqual(DEFAULT_EMPIRE_LIMITS.maxTotalAgents - 1);
    expect(plan.safety).toContain("No private-key custody or wallet signing");
  });

  it("never exceeds configured agent and generation limits", () => {
    const run = runEmpire("Build an autonomous multi-chain platform", {
      maxTotalAgents: 4,
      maxGenerationDepth: 1,
      maxConcurrentAgents: 2,
    });
    expect(run.mode).toBe("simulation");
    expect(run.agents.length).toBeLessThanOrEqual(4);
    expect(Math.max(...run.agents.map((agent) => agent.generation))).toBeLessThanOrEqual(1);
    expect(run.agents.every((agent) => agent.result?.simulation === true || agent.role === "master")).toBe(true);
  });

  it("recursively spawns research and coder children under their own parents", () => {
    const run = runEmpire("Build a code platform with research", {
      maxGenerationDepth: 2,
      maxTotalAgents: 12,
      maxConcurrentAgents: 4,
    });
    for (const role of ["researcher", "coder"] as const) {
      const parent = run.agents.find((agent) => agent.role === role && agent.generation === 1);
      expect(parent).toBeDefined();
      const child = run.agents.find((agent) => agent.role === role && agent.generation === 2 && agent.parentId === parent?.agentId);
      expect(child?.result?.simulation).toBe(true);
    }
    expect(Math.max(...run.agents.map((agent) => agent.generation))).toBe(2);
  });
});
