# Ai Mcp — Lifecycle

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.10`.

## Lifecycle

**The caller owns the lifecycle.** `chat()` never closes the client.

Tools execute lazily while the response stream is consumed — close only after
the stream is drained. In a streaming route handler, `try/finally` around the
`return` (or `await using` at function scope) closes the client before the
body streams; use a middleware terminal hook there instead (see Common
Mistakes below).

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import type { ModelMessage } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

// Option 1: middleware terminal hooks (streaming route handlers)
export async function POST(request: Request) {
  const { messages } = await request.json()
  const client = await createMCPClient({
    transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
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
}

// Option 2: explicit close after in-scope consumption
export async function runToCompletion(messages: Array<ModelMessage>) {
  const client = await createMCPClient({
    transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
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
}

// Option 3: await using (TypeScript 5.2+ with Symbol.asyncDispose) —
// same rule: consume the stream before the scope exits.
export async function runWithUsing(messages: Array<ModelMessage>) {
  await using client = await createMCPClient({
    transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
  })
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: await client.tools(),
  })
  for await (const chunk of stream) {
    // ... consume the stream in this scope; close() runs at scope exit
  }
}
```
