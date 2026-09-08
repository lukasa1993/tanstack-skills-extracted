# Middleware — Cross-References

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.53.0`.

## Cross-References

- See also: **./tanstack-ai-core-chat-experience-6cd3502a.md#source-tanstack-ai-core-chat-experience** -- Middleware hooks into the chat lifecycle
- See also: **./tanstack-ai-core-structured-outputs-fef450ef.md#source-tanstack-ai-core-structured-outputs** -- Separate finalization uses `onStructuredOutputConfig` for JSON-Schema transforms; native-combined schema transformation is not exposed through middleware
- See also: **./tanstack-ai-core-ag-ui-protocol-5877d289.md#source-tanstack-ai-core-ag-ui-protocol** -- Reading the `sandbox.file` / `sandbox.file.diff` `CUSTOM` chunks the sandbox runtime emits alongside these `sandbox` hooks, via `ChatStream`'s typed `KnownCustomEvent` narrowing
- See also: **`@tanstack/ai-persistence` skills** (`./tanstack-ai-persistence-2fec28cd.md#source-tanstack-ai-persistence` in that package) -- Full persistence suite (`withPersistence`, client storage, store contracts, adapter recipes, locks). This file only sketches server `withPersistence`.
