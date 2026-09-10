# Structured Outputs — Common Mistakes

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@0.54.0`.

## Common Mistakes

### HIGH: Filtering `TextPart`s out of `useChat` renderers when using `outputSchema`

Earlier versions of the library routed structured-output JSON deltas through `TextPart`, so renderers had to filter them out:

```tsx group=recipe-renderer
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { z } from 'zod'
import { ReasoningView, ToolCallView, RecipeCard } from './views'

const RecipeSchema = z.object({
  title: z.string(),
  steps: z.array(z.string()),
})

function useRecipeChat() {
  return useChat({
    connection: fetchServerSentEvents('/api/recipes'),
    outputSchema: RecipeSchema,
  })
}

function ObsoleteRenderer() {
  const { messages } = useRecipeChat()
  const last = messages.at(-1)
  // OBSOLETE — this guard was needed only because JSON used to land in a TextPart
  return last?.parts.map((part, i) => {
    if (part.type === 'text') return null // ❌ hides the structured JSON
    return <pre key={i}>{JSON.stringify(part)}</pre>
  })
}
```

That hack is **gone**. With `outputSchema` set, `TEXT_MESSAGE_CONTENT` deltas now route into a dedicated `StructuredOutputPart` (with `raw`, `partial`, `data`, `status`, optional `errorMessage`). Render the structured part directly; let real `TextPart`s through.

```tsx group=recipe-renderer
function RecipeRenderer() {
  const { messages } = useRecipeChat()
  const last = messages.at(-1)
  // CORRECT — find the structured-output part directly; let actual TextParts render
  return last?.parts.map((part, i) => {
    if (part.type === 'thinking')
      return <ReasoningView key={i} text={part.content} />
    if (part.type === 'tool-call') return <ToolCallView key={i} part={part} />
    if (part.type === 'structured-output')
      return <RecipeCard key={i} part={part} />
    if (part.type === 'text') return <p key={i}>{part.content}</p> // ← real text, not JSON
    return null
  })
}
```

If you still have an `if (part.type === 'text') return null` line in a structured-output renderer specifically for "hiding the JSON," delete it.

Source: PR #577 — structured-output became a typed UIMessage part.

### HIGH: Treating `partial` / `final` as sticky state across turns

`partial` and `final` are **derived from the most recent structured-output part after the latest user message**, not a sticky hook-level slot. In a multi-turn chat:

- Between `sendMessage()` and the first chunk, `partial` reads `{}` and `final` reads `null` (no structured-output part after the latest user message yet).
- Once the latest turn completes, `partial === final`. Earlier turns' data is NOT in `partial` / `final` — it lives on the prior assistant messages' parts.

To render history, walk `messages` directly (see Pattern 5). Use `partial` / `final` for a sticky summary of the **most recent** turn only.

```tsx group=recipe-renderer
function RecipeHistory() {
  const { messages, final } = useRecipeChat()

  return (
    <>
      {/* WRONG — `final` only reflects the latest turn; earlier recipes vanish from this view */}
      {final && <h3>{final.title}</h3>}

      {/* CORRECT for history — walk messages, render each structured-output part */}
      {messages.map((m) => {
        if (m.role !== 'assistant') return null
        const part = m.parts.find((p) => p.type === 'structured-output')
        return part ? <RecipeCard key={m.id} part={part} /> : null
      })}
    </>
  )
}
```

Source: PR #577 — partial/final derive from the most recent structured-output part after the latest user message.

### HIGH: Parsing streaming JSON deltas yourself

When iterating `chat({ outputSchema, stream: true })` directly (Pattern 3), the `TEXT_MESSAGE_CONTENT` chunks contain _partial_ JSON fragments — they are not valid JSON until the stream completes. Read the completed typed object from the terminal `structured-output.complete` event. Standard Schema validation remains the consumer's responsibility.

```typescript group=person-stream
// WRONG -- partial JSON, throws SyntaxError mid-stream, no schema validation
for await (const chunk of stream) {
  if (chunk.type === 'TEXT_MESSAGE_CONTENT') {
    const obj = JSON.parse(chunk.delta) // ❌ partial, invalid
  }
}

// CORRECT -- trust the terminal event
for await (const chunk of stream) {
  if (chunk.type === 'CUSTOM' && chunk.name === 'structured-output.complete') {
    const result = chunk.value.object // ✅ complete and typed
  }
}
```

If you need progressive parsed state in a non-React environment, use a partial-JSON parser on the accumulated raw string at render time. Neither that partial state nor the terminal streaming event is Standard Schema validated. In `useChat`, progressive parsing is already done for you through the `partial` field from Pattern 4.

Source: maintainer interview

### HIGH: Trying to implement provider-specific structured output strategies

The adapter already handles provider differences (OpenAI uses `response_format`, Anthropic uses tool-based extraction, Gemini uses `responseSchema`). Never configure this yourself.

```typescript ignore
// WRONG -- do not set provider-specific response format
// (this does not compile: modelOptions has no response-format field)
chat({
  adapter,
  messages,
  modelOptions: {
    responseFormat: { type: 'json_schema', json_schema: mySchema },
  },
})
```

```typescript
// CORRECT -- just pass outputSchema, the adapter handles the rest
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const person = await chat({
  adapter: openaiText('gpt-5.2'),
  messages: [{ role: 'user', content: 'John Doe, 30' }],
  outputSchema: z.object({ name: z.string(), age: z.number() }),
})
```

There is no scenario where you need to know the provider's strategy. Just pass `outputSchema` to `chat()`.

Source: maintainer interview

### HIGH: Passing raw objects instead of using the project's schema library

Agents often generate raw JSON Schema objects or plain TypeScript types instead
of using the schema validation library already in the project (Zod, ArkType,
Valibot). Always check what the project uses and match it.

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const adapter = openaiText('gpt-5.2')
const messages = [{ role: 'user' as const, content: 'John Doe, 30' }]

// WRONG -- raw schema object, no schema-library type inference (result is unknown)
const untyped = await chat({
  adapter,
  messages,
  outputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
    },
    required: ['name', 'age'],
    additionalProperties: false,
  },
})

// CORRECT -- use the project's schema library (e.g. Zod)
const person = await chat({
  adapter,
  messages,
  outputSchema: z.object({
    name: z.string(),
    age: z.number(),
  }),
})
person.name // string
```

Using the project's schema library gives you TypeScript type inference and
correct JSON Schema conversion automatically. The non-streaming
`await chat({ outputSchema })` path also runs Standard Schema validation; the
streaming path leaves validation to the consumer. Check `package.json` for
`zod`, `arktype`, or `valibot` and use whichever is already installed.

Source: maintainer interview
