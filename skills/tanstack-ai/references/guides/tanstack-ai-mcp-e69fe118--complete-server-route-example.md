# Ai Mcp — Complete server-route example

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.9`.

## Complete server-route example

```typescript
// src/routes/api.chat.ts
import { createFileRoute } from '@tanstack/react-router'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClients } from '@tanstack/ai-mcp'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
      },
    },
  },
})
```
