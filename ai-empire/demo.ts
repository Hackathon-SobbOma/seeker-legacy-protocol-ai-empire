import { MemoryStore, runCycle } from "./src/core";
const state = await runCycle(new MemoryStore(), "Build a secure autonomous task service", { demoFailure: true });
console.log(JSON.stringify({ runId: state.runId, phases: ["PLAN", "SPAWN", "EXECUTE", "TEST", "EVALUATE", "LEARN", "REPLAN"], agents: state.agents.map(({ id, role, generation, status, result }) => ({ id, role, generation, status, result })), memory: state.memory, status: state.status }, null, 2));
if (state.status !== "completed" || !state.agents.some((agent) => agent.role === "repair" && agent.status === "passed")) process.exit(1);
