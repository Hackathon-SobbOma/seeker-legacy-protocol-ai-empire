export interface LLMEnv { LLM_API_URL?: string; LLM_API_KEY?: string; LLM_MODEL?: string; }
export async function askLLM(env: LLMEnv, prompt: string): Promise<{ configured: boolean; text: string }> {
  if (!env.LLM_API_URL || !env.LLM_API_KEY) return { configured: false, text: "No LLM provider configured; deterministic fallback retained." };
  const response = await fetch(env.LLM_API_URL, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${env.LLM_API_KEY}` }, body: JSON.stringify({ model: env.LLM_MODEL ?? "default", messages: [{ role: "user", content: prompt }] }) });
  if (!response.ok) throw new Error(`LLM provider returned HTTP ${response.status}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return { configured: true, text: data.choices?.[0]?.message?.content ?? "Provider returned no text." };
}
