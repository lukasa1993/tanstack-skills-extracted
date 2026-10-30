# Structured Outputs — Core Patterns: Pattern 6: Harness adapters (Claude Code, Codex, OpenCode, Grok Build, ACP)

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@1.0.1`.

## Core Patterns: Pattern 6: Harness adapters (Claude Code, Codex, OpenCode, Grok Build, ACP)


Dedicated harness adapters honor `chat({ outputSchema })` on the same turn. Native harness tools still run. Read the object from `await chat()`, from `useChat().final`, or from the assistant `structured-output` part on `messages[].parts`. Do not parse assistant prose.

A UI endpoint must pass `stream: true`. Without it, `chat()` returns a `Promise`, not SSE.

```typescript
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { claudeCodeText } from '@tanstack/ai-claude-code'
import {
  createSecrets,
  defineSandbox,
  defineWorkspace,
  githubRepo,
  withSandbox,
} from '@tanstack/ai-sandbox'
import { dockerSandbox } from '@tanstack/ai-sandbox-docker'
import { z } from 'zod'

const sandbox = defineSandbox({
  id: 'repo-report',
  provider: dockerSandbox({ image: 'node:22' }),
  workspace: defineWorkspace({
    source: githubRepo({ repo: 'owner/app' }),
    setup: ['npm install -g @anthropic-ai/claude-code --include=optional'],
    secrets: createSecrets({
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
    }),
  }),
})

const ReportSchema = z.object({
  name: z.string(),
  oneLiner: z.string(),
})

export async function POST(request: Request) {
  const { messages, threadId, runId } = await chatParamsFromRequest(request)

  const stream = chat({
    adapter: claudeCodeText('claude-opus-4-8'),
    messages,
    threadId,
    runId,
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
    threadId: 'support-42',
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
