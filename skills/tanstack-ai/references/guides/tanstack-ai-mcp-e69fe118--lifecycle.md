# Ai Mcp — Lifecycle

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.9`.

## Lifecycle

**The caller owns the lifecycle.** `chat()` never closes the client.

Tools execute lazily while the response stream is consumed — close only after
the stream is drained. In a streaming route handler, `try/finally` around the
`return` (or `await using` at function scope) closes the client before the
body streams; use a middleware terminal hook there instead (see Common
Mistakes below).

```typescript
// Option 1: middleware terminal hooks (streaming route handlers)
const client = await createMCPClient({
  transport: { type: 'http', url: '...' },
})
const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages,
  tools: await client.tools(),
  middleware: [
    {
      name: 'mcp-close',
      onFinish: () => client.close(),
      onAbort: () => client.close(),
      onError: () => client.close(),
    },
  ],
})
return toServerSentEventsResponse(stream)

// Option 2: explicit close after in-scope consumption
const client = await createMCPClient({
  transport: { type: 'http', url: '...' },
})
try {
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: await client.tools(),
  })
  for await (const chunk of stream) {
    // stream fully consumed inside this block
  }
} finally {
  await client.close()
}

// Option 3: await using (TypeScript 5.2+ with Symbol.asyncDispose) —
// same rule: consume the stream before the scope exits.
await using client = await createMCPClient({
  transport: { type: 'http', url: '...' },
})
// ... consume the stream in this scope; close() runs at scope exit
```
