# Middleware — Built-in: toolCacheMiddleware

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.54.0`.

## Built-in: toolCacheMiddleware

Caches tool call results by name + arguments. Import from `@tanstack/ai/middlewares`:

```typescript
import { chat, toolDefinition, toServerSentEventsResponse } from '@tanstack/ai'
import { toolCacheMiddleware } from '@tanstack/ai/middlewares'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const weatherTool = toolDefinition({
  name: 'getWeather',
  description: 'Get the current weather for a city',
  inputSchema: z.object({ city: z.string() }),
}).server(async ({ city }) => ({ city, tempC: 21 }))

export async function POST(request: Request) {
  const { messages } = await request.json()

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [weatherTool],
    middleware: [
      toolCacheMiddleware({
        ttl: 60_000, // Cache entries expire after 60 seconds
        maxSize: 50, // Max 50 entries (LRU eviction)
        toolNames: ['getWeather'], // Only cache specific tools
      }),
    ],
  })

  return toServerSentEventsResponse(stream)
}
```

Options: `maxSize` (default 100), `ttl` (default Infinity), `toolNames` (default all),
`keyFn` (custom cache key), `storage` (custom backend like Redis). See
`docs/advanced/middleware.md` for custom storage examples.
