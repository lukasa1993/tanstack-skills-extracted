# Ag Ui Protocol — Setup — Server Endpoint Producing AG-UI Events via SSE

[Guide and prerequisites](./tanstack-ai-core-ag-ui-protocol-5877d289.md) · Published skill · `@tanstack/ai@0.53.0`.

## Setup — Server Endpoint Producing AG-UI Events via SSE

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: openaiText('gpt-5.2'),
    messages,
  })
  return toServerSentEventsResponse(stream)
}
```

`chat()` returns an `AsyncIterable<StreamChunk>`. Each `StreamChunk` is a
typed AG-UI event (discriminated union on `type`). The `toServerSentEventsResponse()`
helper encodes that iterable into an SSE-formatted `Response` with correct headers.
