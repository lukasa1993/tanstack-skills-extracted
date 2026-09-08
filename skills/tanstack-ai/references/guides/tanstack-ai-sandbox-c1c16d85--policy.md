# Ai Sandbox — Policy

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.6`.

## Policy

```typescript
import { defineSandboxPolicy } from '@tanstack/ai-sandbox'

// Headless Grok Build / Codex: stay on auto-approve. Isolation is the
// outer sandbox (Docker, Daytona, …), not commands.deny on this policy.
const policy = defineSandboxPolicy({
  default: 'allow',
})
// pass to defineSandbox({ policy }); harness adapters map it to native permissions
```

Claude Code can use `default: 'ask'` plus allow/ask/deny lists. Use Claude Code
when you need command-level deny. Provider privilege rules (non-root users,
network block at create) live in `docs/sandbox/providers.md`.
