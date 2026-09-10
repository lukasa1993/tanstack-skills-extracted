# Middleware — Setup — Analytics Tracking Middleware

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.54.0`.

## Setup — Analytics Tracking Middleware

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { trackAnalytics, reportError } from './analytics'

export async function POST(request: Request) {
  const { messages } = await request.json()

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    middleware: [
      {
        onStart: (ctx) => {
          console.log('Chat started:', ctx.model)
        },
        onFinish: (ctx, info) => {
          trackAnalytics({ model: ctx.model, tokens: info.usage?.totalTokens })
        },
        onError: (ctx, info) => {
          reportError(info.error)
        },
      },
    ],
  })

  return toServerSentEventsResponse(stream)
}
```
