import { runCycle, type EmpireState as EmpireSnapshot, type StateStore } from "./core";
import { askLLM, type LLMEnv } from "./llm";

type Env = LLMEnv & { EMPIRE_STATE: DurableObjectNamespace; ENVIRONMENT?: string };
type DurableObjectNamespace = { idFromName(name: string): DurableObjectId; get(id: DurableObjectId): DurableObjectStub };
type DurableObjectId = unknown;
type DurableObjectStub = { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
type DurableObjectState = { storage: { get<T>(key: string): Promise<T | undefined>; put<T>(key: string, value: T): Promise<void> } };

class DurableStore implements StateStore {
  constructor(private readonly storage: DurableObjectState["storage"]) {}
  async load() { return (await this.storage.get<EmpireSnapshot>("state")) ?? null; }
  async save(state: EmpireSnapshot) { await this.storage.put("state", state); }
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const dashboard = (state: EmpireSnapshot | null) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AI Empire</title><style>body{font-family:system-ui;background:#09090b;color:#f4f4f5;max-width:1000px;margin:40px auto;padding:0 20px}h1{color:#c084fc}.card{border:1px solid #27272a;border-radius:12px;padding:18px;margin:14px 0;background:#111113}.agent{display:inline-block;border:1px solid #3f3f46;border-radius:10px;padding:12px;margin:6px;min-width:160px}.pass{color:#34d399}.fail{color:#fb7185}.muted{color:#a1a1aa}code{color:#e9d5ff}</style></head><body><h1>AI Empire</h1><p class="muted">Cloudflare Worker · event-driven · bounded execution</p><div class="card"><strong>Run:</strong> ${state?.runId ?? "No run yet"}<br><strong>Phase:</strong> ${state?.phase ?? "IDLE"}<br><strong>Status:</strong> ${state?.status ?? "idle"}<br><strong>Goal:</strong> ${state?.goal ?? "Use POST /api/run to start"}</div><div class="card"><h2>Agent tree</h2>${state?.agents.map((a) => `<div class="agent"><strong>${a.role}</strong> · gen ${a.generation}<br><span class="${a.status === "failed" ? "fail" : "pass"}">${a.status}</span><br><small>${a.result ?? a.objective}</small></div>`).join("") || "<p class=muted>No agents yet.</p>"}</div><div class="card"><h2>Shared memory</h2>${state?.memory.map((m) => `<p><code>${m.kind}</code> ${m.content}</p>`).join("") || "<p class=muted>No memory yet.</p>"}</div><script>setTimeout(()=>location.reload(),15000)</script></body></html>`;

export default { async fetch(request: Request, env: Env) { const url = new URL(request.url); const stub = env.EMPIRE_STATE.get(env.EMPIRE_STATE.idFromName("primary")); if (url.pathname === "/health") return json({ ok: true, service: "ai-empire", environment: env.ENVIRONMENT ?? "unknown", mode: "event-driven" }); if (url.pathname === "/" || url.pathname === "/dashboard") { const response = await stub.fetch("https://state/inspect"); const state = response.ok ? await response.json() : null; return new Response(dashboard(state as EmpireSnapshot | null), { headers: { "content-type": "text/html; charset=utf-8" } }); } if (url.pathname === "/api/state" && request.method === "GET") return stub.fetch("https://state/inspect"); if (url.pathname === "/api/run" && request.method === "POST") { let input: { goal?: string; demoFailure?: boolean } = {}; try { input = await request.json(); } catch { return json({ error: "Expected JSON body" }, 400); } if (!input.goal || input.goal.length < 8 || input.goal.length > 500) return json({ error: "goal must be 8-500 characters" }, 400); return stub.fetch("https://state/run", { method: "POST", body: JSON.stringify(input) }); } if (url.pathname === "/api/llm-check" && request.method === "POST") return json(await askLLM(env, "Return a one-sentence capability plan.")); return json({ error: "Not found" }, 404); }, async scheduled(_event: ScheduledEvent, env: Env) { const stub = env.EMPIRE_STATE.get(env.EMPIRE_STATE.idFromName("primary")); await stub.fetch("https://state/run", { method: "POST", body: JSON.stringify({ goal: "Scheduled health and bounded improvement cycle" }) }); } };

export class EmpireState {
  constructor(private readonly state: DurableObjectState) {}
  async fetch(request: Request) { const store = new DurableStore(this.state.storage); if (new URL(request.url).pathname === "/inspect") { const current = await store.load(); return json(current); } if (new URL(request.url).pathname === "/run" && request.method === "POST") { const body = await request.json() as { goal: string; demoFailure?: boolean }; for (let attempt = 0; attempt < 2; attempt++) { try { return json(await runCycle(store, body.goal, { demoFailure: body.demoFailure })); } catch (error) { if (attempt === 1) return json({ error: error instanceof Error ? error.message : "Execution failed" }, 500); } } } return json({ error: "Not found" }, 404); }
}

type ScheduledEvent = { cron?: string };
type RequestInfo = Request | string;
