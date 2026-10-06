import { describe, expect, it } from "vitest";
import { MemoryStore, runCycle } from "../src/core";

describe("AI Empire lifecycle", () => {
  it("runs PLAN through LEARN and repairs a real demo failure", async () => {
    const state = await runCycle(new MemoryStore(), "Build a secure task system", { demoFailure: true });
    expect(state.status).toBe("completed");
    expect(state.retries).toBe(1);
    expect(state.agents.some((agent) => agent.role === "repair" && agent.status === "passed")).toBe(true);
    expect(state.memory.some((entry) => entry.kind === "failure")).toBe(true);
    expect(state.memory.some((entry) => entry.kind === "lesson")).toBe(true);
  });
  it("enforces depth and count limits", async () => {
    const state = await runCycle(new MemoryStore(), "Bounded run", { limits: { MAX_DEPTH: 1, MAX_AGENTS: 2 } });
    expect(state.agents.length).toBeLessThanOrEqual(2);
    expect(Math.max(...state.agents.map((agent) => agent.generation))).toBeLessThanOrEqual(1);
  });

  it("terminates when MAX_RUNTIME_MS is exceeded and records a structured log", async () => {
    const state = await runCycle(new MemoryStore(), "Runtime-limited run", { limits: { MAX_RUNTIME_MS: -1 } });
    expect(state.status).toBe("failed");
    expect(state.memory.some((entry) => entry.content.includes("MAX_RUNTIME_MS"))).toBe(true);
    expect(state.logs.some((entry) => entry.event === "run.timeout" && entry.level === "error")).toBe(true);
    expect(state.logs.every((entry) => entry.timestamp && entry.phase && entry.event)).toBe(true);
  });
});
