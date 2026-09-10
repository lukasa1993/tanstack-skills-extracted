# Chat Experience — Core Patterns: 5. HTTP Stream Format (Alternative to SSE)

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: 5. HTTP Stream Format (Alternative to SSE)


Use `toHttpResponse` + `fetchHttpStream` for newline-delimited JSON instead of SSE.

**Server:**

```typescript
import { chat, toHttpResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const abortController = new AbortController()

  const stream = chat({
    adapter: openaiText('gpt-5.6'),
    messages,
    abortController,
  })

  return toHttpResponse(stream, { abortController })
}
```

**Client:**

```typescript
import { useChat, fetchHttpStream } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchHttpStream('/api/chat'),
})
```

The only difference is swapping `toServerSentEventsResponse` / `fetchServerSentEvents`
for `toHttpResponse` / `fetchHttpStream`. Everything else stays identical.

This includes resumability: pass the same `durability` adapter to
`toHttpResponse(stream, { durability: { adapter: memoryStream(request) } })` and
each NDJSON line becomes an `{ id, chunk }` envelope. `fetchHttpStream`
auto-reconnects with `Last-Event-ID`, de-dupes the replayed prefix, and exposes
`joinRun(runId)` — the same guarantees as resumable SSE. The XHR adapters
(`xhrServerSentEvents` / `xhrHttpStream`) are resumable too.
