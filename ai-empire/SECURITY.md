# AI Empire Security

- Hard limits are enforced server-side: `MAX_DEPTH`, `MAX_AGENTS`, `MAX_RUNTIME_MS`, and `MAX_BUDGET_USD`.
- The Worker has no arbitrary shell, subprocess, wallet signing, private-key custody, or fund-transfer capability.
- LLM credentials are injected with `wrangler secret put`; they are never committed, returned by the API, or displayed in the dashboard.
- Durable Object state is treated as untrusted application data and should be scoped to the deployment account.
- The HTTP run endpoint validates goal length and the system retries only once before returning a failure.
- GitHub Actions uses read-only repository permissions and a finite timeout.
- The demo deliberately records a failure, creates a repair agent, and verifies the repair. It does not use fake animation or claim that a foundation model was retrained.

## Deployment secrets

```bash
wrangler secret put LLM_API_URL
wrangler secret put LLM_API_KEY
wrangler secret put LLM_MODEL
```

Do not paste secret values into chat, source files, workflow YAML, or issue comments.
