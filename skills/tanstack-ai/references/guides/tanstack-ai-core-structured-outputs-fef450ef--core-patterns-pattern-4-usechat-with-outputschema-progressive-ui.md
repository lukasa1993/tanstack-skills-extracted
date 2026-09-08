# Structured Outputs — Core Patterns: Pattern 4: useChat with outputSchema (progressive UI)

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: Pattern 4: useChat with outputSchema (progressive UI)


Pass `outputSchema` to `useChat` and you get a `partial` field that fills in as JSON streams in, plus a `final` field that snaps to the completed typed object on the terminal event. No `onChunk` ceremony, no manual JSON accumulation, no `parsePartialJSON` calls.

**Server** (same as Pattern 3, just behind an SSE endpoint):

```typescript
// app/api/extract-person/route.ts (or your framework's equivalent)
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const PersonSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
})

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: openaiText('gpt-5.2'),
    messages,
    outputSchema: PersonSchema,
    stream: true,
  })
  return toServerSentEventsResponse(stream)
}
```

**Client:**

```tsx
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { z } from 'zod'

const PersonSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
})

function PersonExtractor() {
  const { sendMessage, isLoading, partial, final } = useChat({
    connection: fetchServerSentEvents('/api/extract-person'),
    outputSchema: PersonSchema,
  })

  return (
    <div>
      <button
        disabled={isLoading}
        onClick={() => sendMessage('Extract: John Doe, 30, john@example.com')}
      >
        Extract
      </button>
      {/* `partial` fills in field by field while streaming. */}
      <p>Name: {partial.name ?? '…'}</p>
      <p>Age: {partial.age ?? '…'}</p>
      <p>Email: {partial.email ?? '…'}</p>
      {final && <pre>Completed: {JSON.stringify(final, null, 2)}</pre>}
    </div>
  )
}
```

- `partial` is `DeepPartial<z.infer<typeof PersonSchema>>` — every property optional, every nested array element optional. Updated from `TEXT_MESSAGE_CONTENT` deltas.
- `final` is `z.infer<typeof PersonSchema> | null` — populated when `structured-output.complete` arrives.
- `outputSchema` in `useChat` is for client-side type inference. The streaming server path does not run Standard Schema validation; validate the completed object in the consumer when required.
- Same shape works for non-streaming adapters: the fallback path emits one whole-JSON `TEXT_MESSAGE_CONTENT` then the terminal event, so `partial` populates and `final` snaps in the same render tick — same consumer code as the native-streaming providers, just without an intermediate field-by-field reveal.
