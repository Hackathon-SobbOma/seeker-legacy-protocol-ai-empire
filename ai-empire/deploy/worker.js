var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/core.ts
var DEFAULT_LIMITS = { MAX_DEPTH: 3, MAX_AGENTS: 12, MAX_RUNTIME_MS: 1e4, MAX_BUDGET_USD: 0.5 };
var now = /* @__PURE__ */ __name(() => (/* @__PURE__ */ new Date()).toISOString(), "now");
var id = /* @__PURE__ */ __name((prefix, n) => `${prefix}-${n}-${Math.random().toString(36).slice(2, 7)}`, "id");
function createState(goal, limits = {}) {
  return { runId: `run-${Date.now()}`, goal, phase: "PLAN", status: "idle", agents: [], memory: [], logs: [], retries: 0, budgetUsedUsd: 0, updatedAt: now(), limits: { ...DEFAULT_LIMITS, ...limits } };
}
__name(createState, "createState");
function remember(state, kind, content) {
  state.memory.push({ id: id("memory", state.memory.length + 1), kind, content, createdAt: now() });
}
__name(remember, "remember");
function log(state, level, event, message, agentId) {
  const entry = { timestamp: now(), level, event, phase: state.phase, message, ...agentId ? { agentId } : {} };
  state.logs.push(entry);
  console.log(JSON.stringify({ runId: state.runId, ...entry }));
}
__name(log, "log");
function spawn(state, role, parentId, generation, objective) {
  if (generation > state.limits.MAX_DEPTH || state.agents.length >= state.limits.MAX_AGENTS) return null;
  const agent = { id: id(role, state.agents.length + 1), parentId, generation, role, objective, status: "queued", startedAt: now() };
  state.agents.push(agent);
  log(state, "info", "agent.spawned", `Spawned ${role} generation ${generation}.`, agent.id);
  return agent;
}
__name(spawn, "spawn");
function runtimeGuard(state, startedAt, store) {
  if (Date.now() - startedAt <= state.limits.MAX_RUNTIME_MS) return false;
  state.phase = "EVALUATE";
  state.status = "failed";
  remember(state, "failure", "Execution terminated by MAX_RUNTIME_MS.");
  log(state, "error", "run.timeout", "Execution terminated by MAX_RUNTIME_MS.");
  state.updatedAt = now();
  void store.save(state);
  return true;
}
__name(runtimeGuard, "runtimeGuard");
async function runCycle(store, goal, options = {}) {
  const startedAt = Date.now();
  const existing = await store.load();
  const state = existing?.status === "running" ? existing : createState(goal, options.limits);
  state.status = "running";
  state.phase = "PLAN";
  state.updatedAt = now();
  log(state, "info", "run.started", `Plan created for: ${goal}`);
  remember(state, "decision", `Plan created for: ${goal}`);
  if (runtimeGuard(state, startedAt, store)) return state;
  state.phase = "SPAWN";
  const master = spawn(state, "master", null, 0, "Coordinate the organization and enforce limits.");
  if (!master) throw new Error("MAX_AGENTS prevents master creation");
  for (const role of ["research", "code", "judge"]) spawn(state, role, master.id, 1, `Deliver the ${role} capability for the goal.`);
  if (runtimeGuard(state, startedAt, store)) return state;
  state.phase = "EXECUTE";
  for (const agent of state.agents) {
    if (runtimeGuard(state, startedAt, store)) return state;
    if (agent.status !== "queued") continue;
    agent.status = "running";
    log(state, "info", "agent.started", `${agent.role} execution started.`, agent.id);
    state.budgetUsedUsd += 0.01;
    if (state.budgetUsedUsd > state.limits.MAX_BUDGET_USD) {
      agent.status = "blocked";
      agent.result = "Blocked by MAX_BUDGET.";
      log(state, "warn", "agent.blocked", "Blocked by MAX_BUDGET.", agent.id);
      continue;
    }
    agent.status = "passed";
    agent.result = `${agent.role} completed a bounded deterministic task.`;
    agent.finishedAt = now();
    log(state, "info", "agent.completed", agent.result, agent.id);
  }
  state.phase = "TEST";
  const codeAgent = state.agents.find((agent) => agent.role === "code");
  if (options.demoFailure && codeAgent && state.retries === 0) {
    codeAgent.status = "failed";
    codeAgent.result = "Test failure: generated implementation missed a required assertion.";
    log(state, "error", "test.failed", codeAgent.result, codeAgent.id);
    state.phase = "EVALUATE";
    remember(state, "failure", "Code worker failed an assertion; a repair specialist is required.");
    state.phase = "LEARN";
    remember(state, "lesson", "Future code workers must run the assertion suite before reporting success.");
    state.retries += 1;
    state.phase = "REPLAN";
    const repair = spawn(state, "repair", codeAgent.parentId, 2, "Repair the failed code worker and rerun the test suite.");
    if (repair) {
      repair.status = "passed";
      repair.result = "Repair applied; the previously failing assertion now passes.";
      repair.finishedAt = now();
      log(state, "info", "agent.repaired", repair.result, repair.id);
      remember(state, "evaluation", "Repair agent fixed the failure and restored the test invariant.");
    }
    state.phase = "TEST";
  }
  if (runtimeGuard(state, startedAt, store)) return state;
  state.phase = "EVALUATE";
  const passed = state.agents.filter((agent) => agent.status === "passed").length;
  const failed = state.agents.filter((agent) => agent.status === "failed").length;
  const judge = state.agents.find((agent) => agent.role === "judge");
  if (judge) {
    judge.score = failed ? 7 : 9;
    judge.result = `Judge score ${judge.score}/10; ${failed ? "failure recorded for repair" : "all bounded workers passed"}.`;
  }
  remember(state, "evaluation", `${passed} agents passed; ${failed} agents failed; retries=${state.retries}.`);
  state.phase = state.retries > 0 ? "REPLAN" : "LEARN";
  remember(state, "lesson", "Operational learning is persisted as memory and evaluation, not model retraining.");
  state.phase = "DONE";
  state.status = "completed";
  state.updatedAt = now();
  log(state, "info", "run.completed", `Run completed with ${state.agents.length} agents.`);
  await store.save(state);
  return state;
}
__name(runCycle, "runCycle");

// src/llm.ts
async function askLLM(env, prompt) {
  if (!env.LLM_API_URL || !env.LLM_API_KEY) return { configured: false, text: "No LLM provider configured; deterministic fallback retained." };
  const response = await fetch(env.LLM_API_URL, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${env.LLM_API_KEY}` }, body: JSON.stringify({ model: env.LLM_MODEL ?? "default", messages: [{ role: "user", content: prompt }] }) });
  if (!response.ok) throw new Error(`LLM provider returned HTTP ${response.status}`);
  const data = await response.json();
  return { configured: true, text: data.choices?.[0]?.message?.content ?? "Provider returned no text." };
}
__name(askLLM, "askLLM");

// src/worker.ts
var DurableStore = class {
  constructor(storage) {
    this.storage = storage;
  }
  storage;
  static {
    __name(this, "DurableStore");
  }
  async load() {
    return await this.storage.get("state") ?? null;
  }
  async save(state) {
    await this.storage.put("state", state);
  }
};
var json = /* @__PURE__ */ __name((body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }), "json");
var dashboard = /* @__PURE__ */ __name((state) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AI Empire</title><style>body{font-family:system-ui;background:#09090b;color:#f4f4f5;max-width:1000px;margin:40px auto;padding:0 20px}h1{color:#c084fc}.card{border:1px solid #27272a;border-radius:12px;padding:18px;margin:14px 0;background:#111113}.agent{display:inline-block;border:1px solid #3f3f46;border-radius:10px;padding:12px;margin:6px;min-width:160px}.pass{color:#34d399}.fail{color:#fb7185}.muted{color:#a1a1aa}code{color:#e9d5ff}</style></head><body><h1>AI Empire</h1><p class="muted">Cloudflare Worker \xB7 event-driven \xB7 bounded execution</p><div class="card"><strong>Run:</strong> ${state?.runId ?? "No run yet"}<br><strong>Phase:</strong> ${state?.phase ?? "IDLE"}<br><strong>Status:</strong> ${state?.status ?? "idle"}<br><strong>Goal:</strong> ${state?.goal ?? "Use POST /api/run to start"}</div><div class="card"><h2>Agent tree</h2>${state?.agents.map((a) => `<div class="agent"><strong>${a.role}</strong> \xB7 gen ${a.generation}<br><span class="${a.status === "failed" ? "fail" : "pass"}">${a.status}</span><br><small>${a.result ?? a.objective}</small></div>`).join("") || "<p class=muted>No agents yet.</p>"}</div><div class="card"><h2>Shared memory</h2>${state?.memory.map((m) => `<p><code>${m.kind}</code> ${m.content}</p>`).join("") || "<p class=muted>No memory yet.</p>"}</div><script>setTimeout(()=>location.reload(),15000)<\/script></body></html>`, "dashboard");
var worker_default = { async fetch(request, env) {
  const url = new URL(request.url);
  const stub = env.EMPIRE_STATE.get(env.EMPIRE_STATE.idFromName("primary"));
  if (url.pathname === "/health") return json({ ok: true, service: "ai-empire", environment: env.ENVIRONMENT ?? "unknown", mode: "event-driven" });
  if (url.pathname === "/" || url.pathname === "/dashboard") {
    const response = await stub.fetch("https://state/inspect");
    const state = response.ok ? await response.json() : null;
    return new Response(dashboard(state), { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  if (url.pathname === "/api/state" && request.method === "GET") return stub.fetch("https://state/inspect");
  if (url.pathname === "/api/run" && request.method === "POST") {
    let input = {};
    try {
      input = await request.json();
    } catch {
      return json({ error: "Expected JSON body" }, 400);
    }
    if (!input.goal || input.goal.length < 8 || input.goal.length > 500) return json({ error: "goal must be 8-500 characters" }, 400);
    return stub.fetch("https://state/run", { method: "POST", body: JSON.stringify(input) });
  }
  if (url.pathname === "/api/llm-check" && request.method === "POST") return json(await askLLM(env, "Return a one-sentence capability plan."));
  return json({ error: "Not found" }, 404);
}, async scheduled(_event, env) {
  const stub = env.EMPIRE_STATE.get(env.EMPIRE_STATE.idFromName("primary"));
  await stub.fetch("https://state/run", { method: "POST", body: JSON.stringify({ goal: "Scheduled health and bounded improvement cycle" }) });
} };
var EmpireState = class {
  constructor(state) {
    this.state = state;
  }
  state;
  static {
    __name(this, "EmpireState");
  }
  async fetch(request) {
    const store = new DurableStore(this.state.storage);
    if (new URL(request.url).pathname === "/inspect") {
      const current = await store.load();
      return json(current);
    }
    if (new URL(request.url).pathname === "/run" && request.method === "POST") {
      const body = await request.json();
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          return json(await runCycle(store, body.goal, { demoFailure: body.demoFailure }));
        } catch (error) {
          if (attempt === 1) return json({ error: error instanceof Error ? error.message : "Execution failed" }, 500);
        }
      }
    }
    return json({ error: "Not found" }, 404);
  }
};
export {
  EmpireState,
  worker_default as default
};
//# sourceMappingURL=worker.js.map
