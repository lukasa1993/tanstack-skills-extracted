# Structured Outputs — Core Patterns: Pattern 6: Harness adapters (Claude Code, Codex, OpenCode, Grok Build, ACP)

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: Pattern 6: Harness adapters (Claude Code, Codex, OpenCode, Grok Build, ACP)


Dedicated harness adapters honor `chat({ outputSchema })` on the same turn. Native harness tools still run. Read the object from `await chat()`, from `useChat().final`, or from the assistant `structured-output` part on `messages[].parts`. Do not parse assistant prose.

A UI endpoint must pass `stream: true`. Without it, `chat()` returns a `Promise`, not SSE.

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { claudeCodeText } from '@tanstack/ai-claude-code'
import { withSandbox } from '@tanstack/ai-sandbox'
import { z } from 'zod'
import { sandbox } from './sandbox'

const ReportSchema = z.object({
  name: z.string(),
  oneLiner: z.string(),
})

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const messages =
    typeof body === 'object' &&
    body !== null &&
    'messages' in body &&
    Array.isArray(body.messages)
      ? body.messages
      : []

  const stream = chat({
    adapter: claudeCodeText('claude-opus-4-8'),
    messages,
    outputSchema: ReportSchema,
    stream: true,
    middleware: [withSandbox(sandbox)],
  })
  return toServerSentEventsResponse(stream)
}
```

```tsx
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { z } from 'zod'

const ReportSchema = z.object({
  name: z.string(),
  oneLiner: z.string(),
})

function RepoReport() {
  const { final, sendMessage } = useChat({
    connection: fetchServerSentEvents('/api/repo-report'),
    outputSchema: ReportSchema,
  })

  return (
    <div>
      <button onClick={() => sendMessage('Describe this repo')}>Report</button>
      {final && <h2>{final.name}</h2>}
    </div>
  )
}
```

- Claude Code: `--json-schema`. Codex: `--output-schema`. OpenCode, Grok Build, and `acpCompatible`: prompt-and-parse.
- `partial` stays empty until `structured-output.complete`.
- Client tools and `needsApproval` fail fast. The harness cannot pause for a browser round-trip.
- Render live work from `messages[].parts` (`thinking`, `tool-call`, `text`, `structured-output`). `final` is only the latest turn.
- `withPersistence` stores the structured-output part. Distinct event ids become two assistant messages. A reused text id stays on one message. Hydrate with `reconstructChat`.
- See [docs/structured-outputs/harnesses.md](./tanstack-ai-core-structured-outputs-fef450ef.md#source-tanstack-ai-core-structured-outputs).
