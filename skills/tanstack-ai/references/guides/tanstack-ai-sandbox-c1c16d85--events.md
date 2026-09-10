# Ai Sandbox — Events

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Events

- `claude-code.session-id` (CUSTOM) — resumable session id → pass back via
  `modelOptions.sessionId`.
- `file.changed` (CUSTOM) — `{ path, diff }` working-tree diff after the run.
- `sandbox.file` (CUSTOM) — `{ type, path, timestamp }` per file create/change/
  delete, emitted automatically when a sandbox is active.
