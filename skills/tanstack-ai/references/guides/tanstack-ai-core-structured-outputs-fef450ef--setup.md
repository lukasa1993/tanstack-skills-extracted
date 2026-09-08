# Structured Outputs — Setup

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Setup

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const person = await chat({
  adapter: openaiText('gpt-5.2'),
  messages: [{ role: 'user', content: 'John Doe, 30' }],
  outputSchema: z.object({
    name: z.string(),
    age: z.number(),
  }),
})

person.name // string — fully typed, no cast
person.age // number
```

When `outputSchema` is provided, `chat()` returns `Promise<InferSchemaType<TSchema>>` instead of `AsyncIterable<StreamChunk>`. The result is fully typed.

Adding `stream: true` switches the return to `StructuredOutputStream<InferSchemaType<TSchema>>` — incremental JSON deltas plus a terminal validated object. See **Pattern 3** below for direct iteration, **Pattern 4** for the `useChat` shape on the client, **Pattern 5** for multi-turn structured chats, and **Pattern 6** for harness adapters.
