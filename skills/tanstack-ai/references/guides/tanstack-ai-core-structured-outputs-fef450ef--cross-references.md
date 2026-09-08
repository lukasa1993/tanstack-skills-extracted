# Structured Outputs — Cross-References

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Cross-References

- See also: **./tanstack-ai-core-chat-experience-6cd3502a.md#source-tanstack-ai-core-chat-experience** — Base `useChat` surface; the structured-output additions documented here layer on top.
- See also: **./tanstack-ai-core-adapter-configuration-e2c12fef.md#source-tanstack-ai-core-adapter-configuration** — Adapter handles structured-output strategy transparently.
- See also: **./tanstack-ai-core-tool-calling-e2b5ca3c.md#source-tanstack-ai-core-tool-calling** — Combine `tools` with `outputSchema` for an agent loop that runs tools first and returns a typed object. Tool-approval and client-tool flows compose with structured runs without extra wiring; see [docs/structured-outputs/with-tools.md](./tanstack-ai-core-structured-outputs-fef450ef.md#source-tanstack-ai-core-structured-outputs).
- See also: [docs/structured-outputs/harnesses.md](./tanstack-ai-core-structured-outputs-fef450ef.md#source-tanstack-ai-core-structured-outputs) — dedicated harness adapters and `useChat().final`.
- See also: **./tanstack-ai-core-middleware-b87affa9.md#source-tanstack-ai-core-middleware** — separate-finalization `onStructuredOutputConfig` / `structuredOutput` behavior and native-combined `modelStream` behavior.
