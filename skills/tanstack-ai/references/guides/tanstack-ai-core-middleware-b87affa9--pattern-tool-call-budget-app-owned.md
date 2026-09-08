# Middleware — Pattern: tool-call budget (app-owned)

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.53.0`.

## Pattern: tool-call budget (app-owned)

Not a built-in. Cap fan-out with `onBeforeToolCall` skip + `onShouldContinue`.
See `docs/chat/agentic-cycle.md` ("Tool-call budgets").

```typescript
import { chat, maxIterations, type ChatMiddleware } from '@tanstack/ai'

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

chat({
  adapter,
  messages,
  tools: [weatherTool],
  agentLoopStrategy: maxIterations(20),
  middleware: [toolCallBudget({ maxPerTurn: 10, max: 20 })],
})
```
