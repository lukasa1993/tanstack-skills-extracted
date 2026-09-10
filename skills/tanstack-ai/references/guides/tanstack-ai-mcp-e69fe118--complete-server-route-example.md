# Ai Mcp — Complete server-route example

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.10`.

## Complete server-route example

```typescript
// src/routes/api.chat.ts — mount POST in your framework's route handler
// (TanStack Start server route, Next.js route handler, Hono, ...).
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClients } from '@tanstack/ai-mcp'

export async function POST(request: Request) {
  const { messages } = await request.json()

  const pool = await createMCPClients({
    github: {
      transport: { type: 'http', url: 'https://mcp.github.com/mcp' },
    },
    linear: {
      transport: {
        type: 'http',
        url: 'https://mcp.linear.app/mcp',
        headers: {
          Authorization: `Bearer ${process.env.LINEAR_KEY ?? ''}`,
        },
      },
    },
  })

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: await pool.tools(),
    // Close after the run ends — tools execute while the response streams,
    // so `await using` / try-finally would close the pool too early here.
    middleware: [
      {
        name: 'mcp-close',
        onFinish: () => pool.close(),
        onAbort: () => pool.close(),
        onError: () => pool.close(),
      },
    ],
  })

  return toServerSentEventsResponse(stream)
}
```
