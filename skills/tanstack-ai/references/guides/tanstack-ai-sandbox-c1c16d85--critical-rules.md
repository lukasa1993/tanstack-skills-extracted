# Ai Sandbox — Critical rules

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Critical rules

- **Harness adapters require a sandbox.** Always include `withSandbox(...)` in
  `middleware` — without it `chat()` throws a missing-capability error.
- **Secrets** (`workspace.secrets`) are injected into the sandbox env. Their
  raw values are never persisted in snapshots, the sandbox store, or the event
  log. Always create them with `createSecrets(...)` so the values stay hidden
  behind `SecretRef` tokens. The agent binary (`claude`) must exist in the
  sandbox image (install it in `setup` or bake it into the image).
- **Secret-bearing projected files** (e.g. MCP config with resolved header
  values) can be included by default capture. Capture replaces resolved secret
  bytes with zero bytes before it hashes or writes snapshot blobs. Restore runs
  before projection, so projection writes current secret values after restore.
- **chat()-provided `tools` are bridged** into the in-sandbox agent over a
  host-side MCP tool-proxy: the agent calls them as `mcp__tanstack__<tool>` and
  each call is proxied back to the host where the tool's `execute()` runs (with
  its closures / DB / secrets). The agent also has its own native tools
  (Bash/Edit/Read/…). The host bridge binds on the host; the sandbox reaches it
  (localhost, or `host.docker.internal` for Docker), gated by a per-run bearer
  token.
- **Durable runs are one opt-in.** `withSandbox(sandbox, { runs, durability })`
  needs BOTH; pass one and you silently get today's non-durable behavior. Drive
  a resumed run with `sandboxRunDriver`, never by hand-wiring `pipeToRunLog` —
  it owns the claim, the epoch fence (over the log **and** the run record), and
  the quiescence gate. A durable deploy needs a distributed `LockStore`;
  `InMemoryLockStore` (or no lock at all) warns and cannot fence.
- Use `localProcessSandbox()` only in trusted/dev contexts (no isolation).
- Skills/plugins that a CLI lacks (e.g. `agentSkill` on Codex, `plugins` on
  Codex) warn and skip — they do not throw.
