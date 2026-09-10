# Middleware — Pattern: tool-call budget (app-owned)

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.54.0`.

## Pattern: tool-call budget (app-owned)

Not a built-in. Cap fan-out with `onBeforeToolCall` skip + `onShouldContinue`.
See `docs/chat/agentic-cycle.md` ("Tool-call budgets").

```typescript
import {
  chat,
  maxIterations,
  toolDefinition,
  toServerSentEventsResponse,
  type ChatMiddleware,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const weatherTool = toolDefinition({
  name: 'getWeather',
  description: 'Get the current weather for a city',
  inputSchema: z.object({ city: z.string() }),
}).server(async ({ city }) => ({ city, tempC: 21 }))

function toolCallBudget(opts: {
  max?: number
  maxPerTurn?: number
}): ChatMiddleware {
  let perTurn = 0
  return {
    onIteration: () => {
      perTurn = 0
    },
    onToolPhaseComplete: () => {
      perTurn = 0
    },
    onBeforeToolCall: () => {
      if (opts.maxPerTurn == null) return undefined
      if (++perTurn > opts.maxPerTurn) {
        return {
          type: 'skip',
          result: {
            error: `Skipped: exceeded maxToolCallsPerTurn (${opts.maxPerTurn})`,
          },
        }
      }
      return undefined
    },
    onShouldContinue: (_ctx, state) =>
      opts.max != null && state.toolCallCount >= opts.max ? false : undefined,
  }
}

export async function POST(request: Request) {
  const { messages } = await request.json()

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [weatherTool],
    agentLoopStrategy: maxIterations(20),
    middleware: [toolCallBudget({ maxPerTurn: 10, max: 20 })],
  })

  return toServerSentEventsResponse(stream)
}
```
