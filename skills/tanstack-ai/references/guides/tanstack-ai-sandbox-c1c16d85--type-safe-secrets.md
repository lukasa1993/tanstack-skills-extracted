# Ai Sandbox — Type-safe secrets

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.6`.

## Type-safe secrets

```typescript
import { createSecrets, bearer } from '@tanstack/ai-sandbox'

const secrets = createSecrets({
  GH: process.env.GH_TOKEN ?? '',
  SENTRY: process.env.SENTRY_TOKEN ?? '',
})
// secrets.GH is a SecretRef — the underlying string is stored in a
// non-enumerable symbol-keyed registry and never logged, snapshotted,
// or written to the sandbox store.
```

Pass `secrets` to `defineWorkspace({ secrets })` so skill and MCP projectors
can resolve them. Use `secret: secrets.GH` in `gitSkill` for private-repo auth
and `secrets.GH` / `bearer(secrets.GH)` in MCP header values:

- `secrets.GH` — resolves to the raw token value.
- `bearer(secrets.GH)` — resolves to `"Bearer <value>"`.
