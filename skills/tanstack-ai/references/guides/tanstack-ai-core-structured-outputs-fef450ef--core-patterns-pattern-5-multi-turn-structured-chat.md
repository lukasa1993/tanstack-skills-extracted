# Structured Outputs — Core Patterns: Pattern 5: Multi-turn structured chat

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: Pattern 5: Multi-turn structured chat


Each successfully completed structured-output run adds a typed `StructuredOutputPart` to an assistant message in `messages`. Old responses stay renderable; new completed runs produce new parts; history is preserved without manual state plumbing. This is what makes the recipe-builder shape ("now make it vegan") work.

```tsx
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import type { StructuredOutputPart } from '@tanstack/ai-client'
import { z } from 'zod'

const RecipeSchema = z.object({
  title: z.string(),
  cuisine: z.string(),
  servings: z.number(),
  ingredients: z.array(z.object({ item: z.string(), amount: z.string() })),
  steps: z.array(z.string()),
})
type Recipe = z.infer<typeof RecipeSchema>
type RecipePart = StructuredOutputPart<Recipe>

function RecipeBuilder() {
  const { messages, sendMessage } = useChat({
    outputSchema: RecipeSchema,
    connection: fetchServerSentEvents('/api/recipes'),
  })

  return (
    <div>
      {messages.map((m) => {
        if (m.role === 'user') {
          const text = m.parts
            .filter((p) => p.type === 'text')
            .map((p) => p.content)
            .join('')
          return <p key={m.id}>{text}</p>
        }
        if (m.role === 'assistant') {
          // `data` is `Recipe` because the schema generic flows from
          // `useChat({ outputSchema })` through `messages` to the part.
          const part = m.parts.find(
            (p): p is RecipePart => p.type === 'structured-output',
          )
          if (!part) return null
          return <RecipeCard key={m.id} part={part} />
        }
        return null
      })}
      <button onClick={() => sendMessage('pasta for two')}>Cook</button>
      <button onClick={() => sendMessage('now make it vegan')}>Modify</button>
    </div>
  )
}

function RecipeCard({ part }: { part: RecipePart }) {
  // `data` lands on complete, `partial` fills in while streaming.
  // Both are typed against the schema. No casts.
  const recipe = part.data ?? part.partial
  return <h3>{recipe?.title ?? 'Plating up…'}</h3>
}
```

Key behaviors:

- **Per-turn parts.** Each successfully completed structured-output run adds a structured-output assistant message with its own `StructuredOutputPart`. The separate-finalization path can also produce a plain-text assistant message before it. The previous turn's part is untouched — `messages.map(...)` renders the whole history.
- **Typed by schema.** `messages[i].parts.find(p => p.type === 'structured-output').data` is typed as `Recipe` (no cast, no `unknown`). Works because `useChat<TSchema>` threads `InferSchemaType<TSchema>` down through `UIMessage<TTools, TData>` → `MessagePart<TTools, TData>` → `StructuredOutputPart<TData>`. **In `@tanstack/ai` core** the message types are single-generic (`UIMessage<TData>`); the tools generic lives in `@tanstack/ai-client` and the framework hook packages — import from your framework package or `ai-client`, not from `@tanstack/ai`.
- **`partial` / `final` are derived.** The hook-level `partial` and `final` are NOT singleton state — they're derived from the latest structured-output part after the most recent user message. Between `sendMessage()` and the first chunk, `partial` reads `{}` and `final` reads `null` because no new structured-output part exists yet.
- **Round-trip preserves history.** Completed structured-output parts remain on their UI messages and are mirrored into provider-facing assistant content using `part.raw`. Streaming and errored parts remain UI state but are excluded from model input.
