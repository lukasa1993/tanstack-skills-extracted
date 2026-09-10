# Middleware — Core Patterns

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns

### Pattern 1: Analytics and Logging Middleware

Use `onStart`, `onFinish`, `onUsage`, and `onError` for comprehensive observability.
Use `ctx.defer()` for non-blocking async side effects that should not block the stream.

```typescript
import {
  chat,
  toServerSentEventsResponse,
  type ChatMiddleware,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const analytics: ChatMiddleware = {
  name: 'analytics',
  onStart: (ctx) => {
    console.log(`[${ctx.requestId}] Chat started — model: ${ctx.model}`)
  },
  onUsage: (ctx, usage) => {
    console.log(`[${ctx.requestId}] Tokens: ${usage.totalTokens}`)
  },
  onFinish: (ctx, info) => {
    ctx.defer(
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({
          requestId: ctx.requestId,
          model: ctx.model,
          duration: info.duration,
          tokens: info.usage?.totalTokens,
          finishReason: info.finishReason,
        }),
      }),
    )
  },
  onError: (ctx, info) => {
    ctx.defer(
      fetch('/api/errors', {
        method: 'POST',
        body: JSON.stringify({
          requestId: ctx.requestId,
          error: String(info.error),
          duration: info.duration,
        }),
      }),
    )
  },
}

export async function POST(request: Request) {
  const { messages } = await request.json()

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    middleware: [analytics],
  })

  return toServerSentEventsResponse(stream)
}
```

### Pattern 2: Tool Interception Middleware

Use `onBeforeToolCall` to validate, gate, or transform tool arguments before execution.
Use `onAfterToolCall` to log results and timing. The first middleware that returns a
non-void decision from `onBeforeToolCall` short-circuits remaining middleware for that call.

```typescript
import type { ChatMiddleware } from '@tanstack/ai'

const toolGuard: ChatMiddleware = {
  name: 'tool-guard',
  onBeforeToolCall: (ctx, hookCtx) => {
    // Block dangerous tools
    if (hookCtx.toolName === 'deleteDatabase') {
      return { type: 'abort', reason: 'Dangerous operation blocked' }
    }

    // Enforce default arguments. `hookCtx.args` is `unknown` — the provider
    // sent it — so narrow before reading it. No `as` casts.
    if (hookCtx.toolName === 'search') {
      const args =
        typeof hookCtx.args === 'object' && hookCtx.args !== null
          ? hookCtx.args
          : {}
      if (!('limit' in args)) {
        return {
          type: 'transformArgs',
          args: { ...args, limit: 10 },
        }
      }
    }

    // Return void to continue normally
  },
  onAfterToolCall: (ctx, info) => {
    if (info.ok) {
      console.log(`${info.toolName} completed in ${info.duration}ms`)
    } else {
      console.error(`${info.toolName} failed:`, info.error)
    }
  },
}
```

**`onBeforeToolCall` decision types:**

| Decision                          | Effect                                                              |
| --------------------------------- | ------------------------------------------------------------------- |
| `void` / `undefined`              | Continue normally, next middleware decides                          |
| `{ type: 'transformArgs', args }` | Replace tool arguments before execution                             |
| `{ type: 'skip', result }`        | Skip execution, use provided result (used by `toolCacheMiddleware`) |
| `{ type: 'abort', reason? }`      | Abort the entire chat run                                           |

### Pattern 3: Structured-Output Middleware

On the separate-finalization path, the final structured-output adapter call
flows through the same middleware chain as the agent loop with
`ctx.phase === 'structuredOutput'`. Native-combined output has no separate
provider call: middleware observes its chunks during `modelStream`, and
`onStructuredOutputConfig` does not fire. Middleware cannot transform the
native-combined schema.

**Example A — Observability (tracing every chunk, including separate finalization):**

```typescript
import type { ChatMiddleware } from '@tanstack/ai'
import { trace } from '@opentelemetry/api'

const tracing: ChatMiddleware = {
  name: 'tracing',
  onChunk(ctx, chunk) {
    trace
      .getActiveSpan()
      ?.addEvent('chunk', { phase: ctx.phase, type: chunk.type })
  },
}
```

On the separate-finalization path, this middleware observes every chunk from
the final structured-output call with `ctx.phase === 'structuredOutput'`. On
the native-combined path, it observes the structured stream with
`ctx.phase === 'modelStream'`.

**Example B — Schema rewriting (inject shared `$defs`):**

```typescript
import type { ChatMiddleware } from '@tanstack/ai'
import { sharedDefs } from './defs'

const injectDefs: ChatMiddleware = {
  name: 'inject-defs',
  onStructuredOutputConfig(_ctx, config) {
    return {
      outputSchema: { ...config.outputSchema, $defs: { ...sharedDefs } },
    }
  },
}
```

`onStructuredOutputConfig` is the right hook here on the separate-finalization
path because it has direct access to `config.outputSchema`. Native-combined
schema transformation is not exposed through middleware.

### Pattern 4: Multiple Middleware Composition

Middleware executes in array order (left-to-right). Ordering matters for hooks that
pipe or short-circuit:

```typescript
import {
  chat,
  toolDefinition,
  toServerSentEventsResponse,
  type ChatMiddleware,
} from '@tanstack/ai'
import { toolCacheMiddleware } from '@tanstack/ai/middlewares'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const weatherTool = toolDefinition({
  name: 'getWeather',
  description: 'Get the current weather for a city',
  inputSchema: z.object({ city: z.string() }),
}).server(async ({ city }) => ({ city, tempC: 21 }))

const stockTool = toolDefinition({
  name: 'getStock',
  description: 'Get the latest price for a ticker symbol',
  inputSchema: z.object({ symbol: z.string() }),
}).server(async ({ symbol }) => ({ symbol, price: 123.45 }))

const logging: ChatMiddleware = {
  name: 'logging',
  onStart: (ctx) => console.log(`[${ctx.requestId}] started`),
  onChunk: (ctx, chunk) => {
    console.log(`[${ctx.requestId}] chunk: ${chunk.type}`)
  },
  onFinish: (ctx, info) => {
    console.log(`[${ctx.requestId}] done in ${info.duration}ms`)
  },
}

const configTransform: ChatMiddleware = {
  name: 'config-transform',
  onConfig: (ctx, config) => {
    if (ctx.phase === 'init') {
      return {
        systemPrompts: [...config.systemPrompts, 'Always respond in JSON.'],
        // Sampling options are NOT first-class config fields — mutate them
        // through `config.modelOptions` using the provider's native key.
        // (e.g. OpenAI `temperature` / `max_output_tokens`.)
        modelOptions: { ...config.modelOptions, temperature: 0.2 },
      }
    }
  },
}

export async function POST(request: Request) {
  const { messages } = await request.json()

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [weatherTool, stockTool],
    middleware: [
      logging, // Runs first
      configTransform, // Transforms config second
      toolCacheMiddleware({ ttl: 60_000 }), // Caches tool results third
    ],
  })

  return toServerSentEventsResponse(stream)
}
```

**Composition rules by hook:**

| Hook                       | Composition                                   | Effect of Order                            |
| -------------------------- | --------------------------------------------- | ------------------------------------------ |
| `onConfig`                 | **Piped** -- each receives previous output    | Earlier middleware transforms first        |
| `onStructuredOutputConfig` | **Piped** -- each receives previous output    | Earlier middleware transforms first        |
| `onStart`                  | Sequential                                    | All run in order                           |
| `onChunk`                  | **Piped** -- chunks flow through each         | If first drops a chunk, later never see it |
| `onBeforeToolCall`         | **First-win** -- first non-void decision wins | Earlier middleware has priority            |
| `onAfterToolCall`          | Sequential                                    | All run in order                           |
| `onUsage`                  | Sequential                                    | All run in order                           |
| `onFinish/onAbort/onError` | Sequential                                    | All run in order                           |
