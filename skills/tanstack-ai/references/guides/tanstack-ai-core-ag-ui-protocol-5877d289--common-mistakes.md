# Ag Ui Protocol — Common Mistakes

[Guide and prerequisites](./tanstack-ai-core-ag-ui-protocol-5877d289.md) · Published skill · `@tanstack/ai@0.54.0`.

## Common Mistakes

### MEDIUM: Proxy buffering breaks SSE streaming

Reverse proxies (nginx, Cloudflare, AWS ALB) buffer SSE responses by default,
causing events to arrive in batches instead of streaming token-by-token.

Fix: Set proxy-bypass headers on the response.

```typescript group=sse-response
toServerSentEventsResponse(stream, {
  headers: {
    'X-Accel-Buffering': 'no', // nginx
    'X-Content-Type-Options': 'nosniff', // Some CDNs
  },
  abortController,
})
```

For Cloudflare Workers, SSE streams automatically. For Cloudflare proxied
origins, ensure "Response Buffering" is disabled in the dashboard.

Source: docs/protocol/sse-protocol.md

### MEDIUM: Assuming all AG-UI events arrive in every response

Not all event types appear in every stream:

- `STEP_STARTED` / `STEP_FINISHED` only appear with thinking-enabled models
  (e.g., `o3`, `claude-sonnet-4-5` with extended thinking). Standard models
  skip these entirely.
- `TOOL_CALL_START` / `TOOL_CALL_ARGS` / `TOOL_CALL_END` only appear when
  the model invokes tools. A text-only response has none.
- `STATE_SNAPSHOT` / `STATE_DELTA` only appear when server code explicitly
  emits them for stateful agent workflows.
- `MESSAGES_SNAPSHOT` only appears when the server explicitly sends a
  full transcript snapshot.
- `CUSTOM` events are application-defined and never emitted by default.

Code that expects a fixed sequence (e.g., always waiting for `STEP_FINISHED`
before processing text) will hang or break on models that don't emit those events.

Source: docs/protocol/chunk-definitions.md
