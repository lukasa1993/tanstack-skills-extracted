# Ag Ui Protocol — Setup — Receiving AG-UI RunAgentInput on the Server

[Guide and prerequisites](./tanstack-ai-core-ag-ui-protocol-5877d289.md) · Published skill · `@tanstack/ai@0.54.0`.

## Setup — Receiving AG-UI RunAgentInput on the Server

```typescript
import {
  chat,
  chatParamsFromRequestBody,
  mergeAgentTools,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { serverTools } from './tools'

export async function POST(req: Request) {
  let params
  try {
    params = await chatParamsFromRequestBody(await req.json())
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : 'Bad request',
      { status: 400 },
    )
  }

  const stream = chat({
    adapter: openaiText('gpt-5.6'),
    messages: params.messages,
    tools: mergeAgentTools(serverTools, params.tools),
  })

  return toServerSentEventsResponse(stream)
}
```

`chatParamsFromRequestBody` validates the body against `RunAgentInputSchema` from `@ag-ui/core`. `mergeAgentTools` merges the server's tool registry with client-declared tools (server wins on collision; client-only tools become no-execute stubs that flow through the runtime's `ClientToolRequest` path).

`params.messages` is a mixed array of TanStack `UIMessage` anchors (with `parts`) and AG-UI fan-out duplicates (`{role:'tool',...}`, `{role:'reasoning',...}`). The existing `convertMessagesToModelMessages` (called inside `chat()`) handles dedup automatically.

**Wire shape (POST body):** AG-UI `RunAgentInput` — `{threadId, runId, parentRunId?, state, messages, tools, context, forwardedProps}`. The `messages` array carries TanStack `UIMessage` anchors with their canonical `parts` plus AG-UI mirror fields (`content`, `toolCalls`) inline; tool results and thinking parts are additionally emitted as fan-out `{role:'tool',...}` and `{role:'reasoning',...}` entries.

**`forwardedProps` security:** Don't spread it directly into `chat()` — clients could override `adapter`, `model`, `tools`, etc. Always allowlist specific fields.
