# Tools, outputs, and middleware

Tool calling, structured output, and middleware.

<a id="source-tanstack-ai-core-middleware"></a>

## Middleware

Source: `tanstack-ai-core-middleware`.

## Middleware

> **Dependency note:** This skill builds on ai-core. Read it first for critical rules.

### Setup — Analytics Tracking Middleware

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  middleware: [
    {
      onStart: (ctx) => {
        console.log('Chat started:', ctx.model)
      },
      onFinish: (ctx, info) => {
        trackAnalytics({ model: ctx.model, tokens: info.usage?.totalTokens })
      },
      onError: (ctx, info) => {
        reportError(info.error)
      },
    },
  ],
})

return toServerSentEventsResponse(stream)
```

### Hooks Reference

Every hook receives a `ChatMiddlewareContext` as its first argument, which provides
`requestId`, `streamId`, `phase`, `iteration`, `chunkIndex`, `model`, `provider`,
`signal`, `abort()`, `defer()`, and more.

| Hook                       | When                                                                                               | Second Argument                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `onConfig`                 | Once at startup (`init`) + once per iteration (`beforeModel`) + once at structured-output boundary | `ChatMiddlewareConfig` (return partial to merge)    |
| `onStructuredOutputConfig` | Once at the structured-output boundary (only when `chat({ outputSchema })`)                        | `StructuredOutputMiddlewareConfig` (return partial) |
| `onStart`                  | Once after initial `onConfig`                                                                      | none                                                |
| `onIteration`              | Start of each agent loop iteration                                                                 | `IterationInfo`                                     |
| `onShouldContinue`         | Whether to start another agent-loop iteration (AND with strategy; `false` stops)                   | `AgentLoopState`                                    |
| `onChunk`                  | Every streamed chunk                                                                               | `StreamChunk` (return void/chunk/chunk[]/null)      |
| `onBeforeToolCall`         | Before each tool executes                                                                          | `ToolCallHookContext` (return decision or void)     |
| `onAfterToolCall`          | After each tool executes                                                                           | `AfterToolCallInfo`                                 |
| `onToolPhaseComplete`      | After all tool calls in an iteration                                                               | `ToolPhaseCompleteInfo`                             |
| `onUsage`                  | When `RUN_FINISHED` includes usage data                                                            | `UsageInfo`                                         |
| `onFinish`                 | Run completed normally                                                                             | `FinishInfo`                                        |
| `onAbort`                  | Run was aborted                                                                                    | `AbortInfo`                                         |
| `onError`                  | Unhandled error occurred                                                                           | `ErrorInfo`                                         |

Terminal hooks (`onFinish`, `onAbort`, `onError`) are **mutually exclusive** -- exactly
one fires per `chat()` invocation.

> **Sampling in `onConfig`:** `temperature`, `topP`, and `maxTokens` are **not**
> first-class fields on `ChatMiddlewareConfig`. To adjust sampling from
> middleware, return a partial that mutates `config.modelOptions` using the
> provider's native key (e.g. OpenAI `temperature` / `max_output_tokens`,
> Anthropic `max_tokens`, Ollama nested `options.num_predict`). Returning a
> top-level `temperature`/`maxTokens` has no effect.

#### Phase values

`ctx.phase` is one of:

| Phase                | When                                                                                                                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'init'`             | Initial setup (before the first `onConfig` snapshot is built).                                                                                                                                                                                 |
| `'beforeModel'`      | Right before each agent-loop adapter call (`onConfig` re-fires here).                                                                                                                                                                          |
| `'modelStream'`      | During model streaming chunks within the agent loop.                                                                                                                                                                                           |
| `'beforeTools'`      | Before tool execution phase.                                                                                                                                                                                                                   |
| `'afterTools'`       | After tool execution phase.                                                                                                                                                                                                                    |
| `'structuredOutput'` | During the final structured-output adapter call (set for all chunks from `adapter.structuredOutputStream` or the synthesized fallback). Triggered only when `chat({ outputSchema })` is invoked; one phase transition per `chat()` invocation. |

**Structured-output lifecycle rules** (when `chat({ outputSchema })` is used):

- `onStructuredOutputConfig` fires **before** `onConfig` at the structured-output boundary.
- `onConfig` re-fires at the same boundary with `ctx.phase === 'structuredOutput'`, receiving the post-`onStructuredOutputConfig` view of the config (minus `outputSchema`).
- `onChunk` and `onUsage` fire for every chunk and usage event emitted by the structured-output call, with `ctx.phase === 'structuredOutput'`.
- `onIteration` does **not** fire for finalization — it is agent-loop-only.
- `onFinish` fires once at the end of the whole `chat()` invocation, **after** the structured-output finalization completes (not after the agent loop). Terminal-hook exclusivity still holds (one of `onFinish` / `onAbort` / `onError`).
- **Terminal `info` and structured-output:** `info.usage` / `info.finishReason` / `info.content` reflect the **agent loop's** terminal state, NOT the finalization step. Finalization state is intentionally segregated to keep agent-loop semantics clean. For a tools-less `chat({ outputSchema })` run, `info.usage` is `undefined` and `info.finishReason` is `null` (no agent-loop iteration produced `RUN_FINISHED`). To capture finalization tokens, use `onUsage` — it fires for both agent-loop iterations and the final call. For the structured-output result itself, observe the `structured-output.complete` CUSTOM event in `onChunk`.

### onStructuredOutputConfig

A dedicated config hook that fires **only** at the structured-output boundary
(when `chat({ outputSchema })` is invoked). Use it to transform the JSON Schema
sent to the provider (inject `$defs`, strip vendor-incompatible keywords) or to
apply structured-output-specific config changes that should not affect the
agent-loop adapter calls.

**Signature:**

```ts
onStructuredOutputConfig?: (
  ctx: ChatMiddlewareContext,
  config: StructuredOutputMiddlewareConfig,
) =>
  | void
  | null
  | Partial<StructuredOutputMiddlewareConfig>
  | Promise<void | null | Partial<StructuredOutputMiddlewareConfig>>
```

**`StructuredOutputMiddlewareConfig` shape:**

```ts
interface StructuredOutputMiddlewareConfig extends Omit<
  ChatMiddlewareConfig,
  'tools'
> {
  outputSchema: JSONSchema // The JSON Schema being sent to the provider
}
```

Note the `Omit<…, 'tools'>`: there is **no `config.tools`** on this hook. The
structured-output call is the final, tool-free call, so reading or returning
`tools` here is a compile error, not a no-op. Transform tools in `onConfig`
instead.

**Ordering rule:**

- `onStructuredOutputConfig` fires **before** `onConfig` at the structured-output boundary.
- `onConfig` re-fires at the same boundary with `ctx.phase === 'structuredOutput'`, receiving the post-`onStructuredOutputConfig` view of the config (minus `outputSchema`).
- Use `onConfig` for general-purpose transforms that apply to every adapter call (agent-loop iterations and the final structured-output call).
- Use `onStructuredOutputConfig` when you need to transform the JSON Schema or apply structured-output-specific behavior.

### Core Patterns

#### Pattern 1: Analytics and Logging Middleware

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

const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  middleware: [analytics],
})

return toServerSentEventsResponse(stream)
```

#### Pattern 2: Tool Interception Middleware

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

#### Pattern 3: Structured-Output Middleware

When `chat({ outputSchema })` is used, the final structured-output adapter call
now flows through the same middleware chain as the agent loop (with
`ctx.phase === 'structuredOutput'`). Before this change, the final call bypassed
middleware entirely — `onChunk`, `onUsage`, `onConfig`, and terminal hooks did
not see it.

**Example A — Observability (tracing every chunk, including finalization):**

```typescript
import type { ChatMiddleware } from '@tanstack/ai'

const tracing: ChatMiddleware = {
  name: 'tracing',
  onChunk(ctx, chunk) {
    span.addEvent('chunk', { phase: ctx.phase, type: chunk.type })
  },
}
```

This middleware now observes every chunk from the final structured-output call,
attributed to `ctx.phase === 'structuredOutput'`. Before the fix, the final
adapter call bypassed middleware entirely — `tracing` would only see agent-loop
chunks.

**Example B — Schema rewriting (inject shared `$defs`):**

```typescript
import type { ChatMiddleware } from '@tanstack/ai'

const injectDefs: ChatMiddleware = {
  name: 'inject-defs',
  onStructuredOutputConfig(_ctx, config) {
    return {
      outputSchema: { ...config.outputSchema, $defs: { ...sharedDefs } },
    }
  },
}
```

`onStructuredOutputConfig` is the right hook here because it has direct access
to `config.outputSchema` and runs only on the structured-output boundary —
schema rewrites do not leak into the agent-loop adapter calls.

#### Pattern 4: Multiple Middleware Composition

Middleware executes in array order (left-to-right). Ordering matters for hooks that
pipe or short-circuit:

```typescript
import { chat, type ChatMiddleware } from '@tanstack/ai'
import { toolCacheMiddleware } from '@tanstack/ai/middlewares'
import { openaiText } from '@tanstack/ai-openai'

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

const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  tools: [weatherTool, stockTool],
  middleware: [
    logging, // Runs first
    configTransform, // Transforms config second
    toolCacheMiddleware({ ttl: 60_000 }), // Caches tool results third
  ],
})
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

### Pattern: tool-call budget (app-owned)

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

### Built-in: toolCacheMiddleware

Caches tool call results by name + arguments. Import from `@tanstack/ai/middlewares`:

```typescript
import { chat } from '@tanstack/ai'
import { toolCacheMiddleware } from '@tanstack/ai/middlewares'

const stream = chat({
  adapter,
  messages,
  tools: [weatherTool],
  middleware: [
    toolCacheMiddleware({
      ttl: 60_000, // Cache entries expire after 60 seconds
      maxSize: 50, // Max 50 entries (LRU eviction)
      toolNames: ['getWeather'], // Only cache specific tools
    }),
  ],
})
```

Options: `maxSize` (default 100), `ttl` (default Infinity), `toolNames` (default all),
`keyFn` (custom cache key), `storage` (custom backend like Redis). See
`docs/advanced/middleware.md` for custom storage examples.

### Server State Persistence: withPersistence

`withPersistence(persistence)` (from `@tanstack/ai-persistence`) is a
`ChatMiddleware` that persists **state** for `chat()` — thread messages, run
records (status/timing/usage/errors), and interrupt state — to a backend store.
Add it to the `middleware` array like any other middleware. It never mutates the
chunk stream; replaying a dropped/reloaded _stream_ is a separate transport-layer
concern (see ./chat-providers.md#source-tanstack-ai-core-chat-experience resumability, not this middleware).

```typescript
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { withPersistence, memoryPersistence } from '@tanstack/ai-persistence'

// memoryPersistence() is the in-process reference backend (dev/tests). For a
// durable one, implement the store contracts against your database — see the
// @tanstack/ai-persistence skills.
const persistence = memoryPersistence()

export async function POST(request: Request) {
  const params = await chatParamsFromRequest(request)

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages: params.messages,
    threadId: params.threadId,
    runId: params.runId,
    ...(params.resume ? { resume: params.resume } : {}),
    middleware: [withPersistence(persistence)],
  })

  return toServerSentEventsResponse(stream)
}
```

#### Authoritative-history contract

The middleware treats each request's `messages` as the source of truth for the
thread:

- **Non-empty `messages`** → on a successful finish (and at an interrupt
  boundary) the middleware **overwrites** the entire stored thread with that
  array. Post the **complete** transcript, never just the newest message(s) — a
  delta would replace and destroy the stored history.
- **Empty `messages`** → the middleware **loads** the stored thread and runs the
  turn from the server's copy. This is how you continue a conversation without
  resending history from the client.

#### Backends

`@tanstack/ai-persistence` ships **contracts, not a database backend**. It
provides the four store interfaces (`messages`, `runs`, `interrupts`,
`metadata`), the middleware that drives them, `memoryPersistence()` for
dev/tests, and a conformance testkit. For anything durable you implement the
stores against your own database and pass the result to `withPersistence`.

Annotate your factory with a named shape (`ChatPersistence` /
`ChatTranscriptPersistence`) — bare `AIPersistence` is the all-optional bag and
`withPersistence` rejects it.

Locks are separate from state and are **not** a `stores` key: wire a
`LockStore` with `withLocks(lockStore)`.

The `runs` store in that list is typed against `RunStore`, which ships in
`@tanstack/ai` alongside `RunRecord`, `RunStatus`, `TerminalRunStatus`,
`RunError`, `isTerminalRunStatus`, `defineRunStore`, and `InMemoryRunStore`. A
`RunRecord` tracks one run: `runId`, `threadId`, `status`, `startedAt`, plus
optional `finishedAt`, `error`, `usage`, `sandboxKey`, `detachedSince`,
`cancelRequested`, and `driverEpoch`. A backend must round-trip **all** of
them: `cancelRequested` is the durable out-of-band cancel channel
(`requestRunCancel` writes it, `wasCancelRequested` reads it), and
`driverEpoch` is the monotonic fencing token each host bumps when it claims a
run, so a superseded host can discover it lost. Omit either and a durable
sandboxed run loses a mechanism silently — Stop stops reaching a remote
driver, or nothing fences a dead host's writes.
`error` is a structured `RunError` (`{ message: string, code?: string }`), not
a bare string: `message` is the provider's prose, `code` is the stable,
machine-branchable classification a consumer switches on. Only
`createOrResume`, `update`, `get`, and `findActiveRun` are required on a
`RunStore`; `listByThread` and `listReclaimable` are optional, so a backend can
leave either out and callers feature-detect
(`store.listReclaimable?.(opts)`). Shape your own store with
`defineRunStore` for autocomplete without a separate `: RunStore` annotation,
matching `defineLock`; `defineRunStore<const T extends RunStore>(store: T): T`
returns the argument's own type, so an optional method your store implements
stays known-present on the result instead of collapsing to `| undefined`.
`isTerminalRunStatus(status)` is a type predicate narrowing `RunStatus` to
`TerminalRunStatus`, so code inside the guard can pass `status` where a
`TerminalRunStatus` is required without a cast. When a backend omits an
optional `RunStore` method, declare the omission when running the conformance
testkit (`ai-persistence/stores`'s `skipMethods` option) rather than leaving it
undeclared.

#### `StreamDurability.snapshot()`

A `StreamDurability` (the event-log backend `memoryStream` / `durableStream`
implement, and what `@tanstack/ai-sandbox`'s run driver resolves per run — its
`RunDeps.durability` / `sandboxRunDriver({ durability })` is a factory
`(runId) => StreamDurability`, because one log is bound to one run) requires a
`snapshot()` method alongside `append`, `read`, and `close`:

```ts
snapshot: () => Promise<Array<{ offset: TOffset; chunk: StreamChunk }>>
```

It returns everything stored for a run right now, in append order, then
resolves. Use it, not `read()`, when a caller needs to inspect a run's stored
prefix and get an answer back: `read()` tails and only resolves once the log
is terminalized with `close()` or the caller aborts, so it never resolves
against a producer that crashed without calling `close()`, and its log stays
open indefinitely. `snapshot()` resolves immediately with what is stored,
including while the log is still open, and resolves to an empty array for a
run with nothing stored yet.

**Full guidance lives in the package's own skills** — start at
`./persistence-coordination.md#source-tanstack-ai-persistence`,
which routes to the server, client, stores, locks, and adapter-recipe
(Drizzle / Prisma / Cloudflare) sub-skills.

#### Resume reconstruction is the middleware's job (server-authoritative path)

When a thread has pending interrupts, the middleware **records** them and
**gates** new input: a request that carries pending interrupts must include a
`resume` batch that references them, or `onConfig` throws. On a valid resume
batch the middleware also **builds `ChatResumeToolState`** (approvals /
client-tool results) and **clears `config.resume`** so the chat engine skips
its ephemeral reconstruction — that path needs client message history the
persistence flow deliberately omits when the server owns the transcript.
Resumes accepted in `onConfig` are committed (marked resolved/cancelled) only
once the run reaches a successful boundary, so a provider failure between
accepting a resume and finishing leaves the interrupt pending and a retry with
the same resume succeeds.

> A companion `withGenerationPersistence(persistence)` tracks run records for
> non-chat generation activities (image, audio, TTS, video, transcription).

Source: docs/persistence/overview.md

### Sandbox File-Event Hooks (`sandbox` group)

Declare a `sandbox: ChatSandboxHooks` group on `defineChatMiddleware` to react
to every file created/changed/deleted inside a sandbox provided by
`withSandbox` (from `@tanstack/ai-sandbox`). These fire **per-run**,
server-side, and each handler receives the run's `ChatMiddlewareContext` as
the first argument:

```typescript
import { defineChatMiddleware } from '@tanstack/ai'
import { db } from './db'

const auditMiddleware = defineChatMiddleware({
  name: 'audit',
  sandbox: {
    onFile: (ctx, e) => console.log(ctx.runId, e.type, e.path),
    onFileCreate: (ctx, e) => db.log({ run: ctx.runId, event: e }),
  },
})
```

| Hook           | Fires for                  |
| -------------- | -------------------------- |
| `onFile`       | Every create/change/delete |
| `onFileCreate` | File creates only          |
| `onFileChange` | File changes only          |
| `onFileDelete` | File deletes only          |

These are independent of the stream: the engine also emits a `sandbox.file`
`CUSTOM` chunk per change regardless of whether any `sandbox` hooks are
registered, so a client can react to the same edits without middleware. See
`./chat-providers.md#source-tanstack-ai-core-ag-ui-protocol` for reading that chunk (and the opt-in
`sandbox.file.diff` chunk) off `ChatStream`.

#### `before()` / `after()` / `diff()` — lazy, git-backed content accessors

Each hook receives a `SandboxFileHookEvent`: the serializable
`{ type, path, timestamp }` plus three lazy accessors for the file's content:

```ts
interface SandboxFileHookEvent {
  type: 'create' | 'change' | 'delete'
  path: string
  timestamp: number
  before(): Promise<string> // content at the session baseline ('' if new / non-git)
  after(): Promise<string> // current content ('' if deleted)
  diff(): Promise<string> // unified patch vs the baseline
}
```

```typescript
import { defineChatMiddleware } from '@tanstack/ai'
import { db } from './db'

const auditMiddleware = defineChatMiddleware({
  name: 'audit',
  sandbox: {
    onFileChange: async (ctx, e) => {
      const [before, after] = await Promise.all([e.before(), e.after()])
      db.log({ run: ctx.runId, path: e.path, before, after })
    },
  },
})
```

**Lazy — path-only hooks pay nothing.** `before()`, `after()`, and `diff()`
are methods, not fields: each only reads the file or shells out to `git` when
called. A hook that only reads `e.path`/`e.type` (like the `onFile` logger
above) never touches the filesystem or spawns a process.

**Git session baseline.** The sandbox snapshots `git rev-parse HEAD` once at
setup as the session baseline (empty string if the workspace isn't a git repo
or has no commits). `before()` and `diff()` always diff against that same
fixed baseline for the rest of the run, so `onFileChange` reports the file's
**cumulative** change since the run started, not just the delta since the
last poll. `after()` always reads current on-disk content. None of the three
accessors throw: a deleted file resolves `after()` to `''` (it still has
`before()`); a new file resolves `before()` to `''` (it still has `after()`);
a non-git workspace resolves **both** `before()` and `after()` to `''` and
makes `diff()` fall back to a synthesized add-patch built from `after()` —
except for a `delete` event in a non-git workspace, where there's nothing to
synthesize and `diff()` resolves to `''`. In a git workspace a file git
**isn't tracking yet** (a file the agent created, and every later edit to it)
diffs empty because `git diff` ignores untracked files, so `diff()` falls
back to the same synthesized add-patch whenever the file is absent at the
baseline — a create-or-edit of an untracked file never streams an empty diff.
An empty diff for a **tracked** file (identical to the baseline) stays empty,
as it should. A **git-ignored** file is withheld: the file event still fires
(you're notified it changed) but `diff()` returns `''`, so a secret like a
`.env` never has its contents surfaced in the diff feed.

**Failures are logged, not silent.** Every git/exec/fs failure behind these
accessors (and behind the `find`-poll watcher) still falls back to `''`/an
empty snapshot, but logs first: real anomalies (a failed `git diff`, an
unreadable file, a lost `find` poll) under the `errors` category (on by
default); expected-empty conditions (a new file's `before()`, a non-git
baseline) under the `sandbox` debug category.

**Hook errors are swallowed per hook.** A throwing `sandbox` hook is caught
and logged under the `errors` category (on by default) — it cannot break the
run or stop other hooks (or the `sandbox.file` chunk) from continuing.

Source: docs/sandbox/observability.md

### Common Mistakes

#### a. MEDIUM: Trying to modify StreamChunks in middleware

```typescript
// WRONG -- mutating the chunk object directly
const broken: ChatMiddleware = {
  name: 'broken',
  onChunk: (ctx, chunk) => {
    chunk.delta = 'modified' // Mutation does nothing; chunk is not modified in-place
  },
}

// CORRECT -- return a new chunk to replace the original
const correct: ChatMiddleware = {
  name: 'correct',
  onChunk: (ctx, chunk) => {
    if (chunk.type === 'TEXT_MESSAGE_CONTENT') {
      return { ...chunk, delta: chunk.delta.replace(/secret/g, '[REDACTED]') }
    }
    // Return void to pass through unchanged
  },
}
```

Middleware `onChunk` hooks are functional transforms. Return a new chunk, an array
of chunks, null (to drop), or void (to pass through). Mutating the input object
has no effect on the stream output.

Source: docs/advanced/middleware.md

#### b. MEDIUM: Middleware exceptions breaking the stream — in `onChunk` / `onConfig`

Know which hooks the framework already guards. **The terminal hooks
(`onFinish`, `onAbort`, `onError`) are individually wrapped** by core's
`runTerminalHook`: a throw there is logged on the `errors` channel and the next
middleware's terminal hook still runs, so a failed analytics `POST` in `onFinish`
cannot break the stream or replace the abort reason. Guarding those is about
keeping your own bookkeeping intact, not about protecting the run.

**`onChunk` and `onConfig` are NOT guarded, deliberately** — they are transforms
on the data path, where swallowing a throw would forward a chunk or a config the
middleware had decided to reject. A throw from either fails the whole stream. That
is where an unhandled error actually costs you a response:

```typescript
// WRONG -- an unhandled error in onChunk kills the entire streaming response
const fragile: ChatMiddleware = {
  name: 'fragile-chunk-logger',
  onChunk: (ctx, chunk) => {
    // A logger that throws on an unexpected chunk shape takes the stream with it
    logChunk(chunk)
  },
  onConfig: (ctx, config) => {
    // Same for a config transform that reads an env var that is not set
    return { model: requireEnv('MODEL_OVERRIDE') }
  },
}

// CORRECT -- own the failure inside the unguarded hooks
const resilient: ChatMiddleware = {
  name: 'resilient-chunk-logger',
  onChunk: (ctx, chunk) => {
    try {
      logChunk(chunk)
    } catch (err) {
      console.error('Logging failed:', err)
    }
    // Return void to pass through
  },
  onConfig: (ctx, config) => {
    const override = process.env.MODEL_OVERRIDE
    // Decide, do not throw: no override means no transform.
    return override === undefined ? undefined : { model: override }
  },
  onFinish: (ctx, info) => {
    // Already guarded by core — but prefer ctx.defer() anyway, so a slow
    // analytics call does not delay the terminal fan-out at all.
    ctx.defer(
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({ duration: info.duration }),
      }),
    )
  },
}
```

Rule: put the try-catch where the framework has none — `onChunk` and `onConfig`
(and the other transform hooks: `onStructuredOutputConfig`, `onBeforeToolCall`,
`onAfterToolCall`). For async side effects in the terminal hooks, prefer
`ctx.defer()`, which runs after the terminal hook and isolates failures.

Source: docs/advanced/middleware.md, `packages/ai/src/activities/chat/middleware/compose.ts`

### Cross-References

- See also: **./chat-providers.md#source-tanstack-ai-core-chat-experience** -- Middleware hooks into the chat lifecycle
- See also: **./tools-outputs-middleware.md#source-tanstack-ai-core-structured-outputs** -- Middleware now wraps the final structured-output call; use `onStructuredOutputConfig` for JSON-Schema transforms
- See also: **./chat-providers.md#source-tanstack-ai-core-ag-ui-protocol** -- Reading the `sandbox.file` / `sandbox.file.diff` `CUSTOM` chunks the sandbox runtime emits alongside these `sandbox` hooks, via `ChatStream`'s typed `KnownCustomEvent` narrowing
- See also: **`@tanstack/ai-persistence` skills** (`./persistence-coordination.md#source-tanstack-ai-persistence` in that package) -- Full persistence suite (`withPersistence`, client storage, store contracts, adapter recipes, locks). This file only sketches server `withPersistence`.

<a id="source-tanstack-ai-core-structured-outputs"></a>

## Structured Outputs

Source: `tanstack-ai-core-structured-outputs`.

## Structured Outputs

> **Dependency note:** This skill builds on ai-core. Read it first for critical rules. The `useChat` patterns below build on ai-core/chat-experience — read that for the base hook surface, then come back here for the structured-output specifics.

### Setup

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

Adding `stream: true` switches the return to `StructuredOutputStream<InferSchemaType<TSchema>>` — incremental JSON deltas plus a terminal validated object. See **Pattern 3** below for direct iteration, **Pattern 4** for the `useChat` shape on the client, and **Pattern 5** for multi-turn structured chats.

### Decision: which pattern fits

| Building this                                                                                  | Use                                                              |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| One prompt in → one typed object out (script, server endpoint, CLI)                            | Pattern 1 (basic) or 2 (nested)                                  |
| A UI that fills in field by field as the model streams (progressive form, live card)           | Pattern 4 — `useChat({ outputSchema })`                          |
| Direct iteration of the stream in Node or tests                                                | Pattern 3 — async iterable                                       |
| Users iterate on a structured object across multiple turns (recipe builder, ticket refinement) | Pattern 5 — multi-turn structured chat                           |
| Tools that gather info, then return a typed object                                             | Combine any of the above with `tools` — see ai-core/tool-calling |

### Core Patterns

#### Pattern 1: Basic structured output with Zod

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const PersonSchema = z.object({
  name: z.string().meta({ description: "The person's full name" }),
  age: z.number().meta({ description: "The person's age in years" }),
  email: z.string().email().meta({ description: 'Email address' }),
})

// chat() returns Promise<{ name: string; age: number; email: string }>
const person = await chat({
  adapter: openaiText('gpt-5.2'),
  messages: [
    {
      role: 'user',
      content:
        'Extract the person info: John Doe is 30 years old, email john@example.com',
    },
  ],
  outputSchema: PersonSchema,
})

console.log(person.name) // "John Doe"
console.log(person.age) // 30
console.log(person.email) // "john@example.com"
```

#### Pattern 2: Complex nested schemas

```typescript
import { chat } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { z } from 'zod'

const CompanySchema = z.object({
  name: z.string(),
  founded: z.number().meta({ description: 'Year the company was founded' }),
  headquarters: z.object({
    city: z.string(),
    country: z.string(),
    address: z.string().optional(),
  }),
  employees: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      department: z.string(),
    }),
  ),
  financials: z
    .object({
      revenue: z
        .number()
        .meta({ description: 'Annual revenue in millions USD' }),
      profitable: z.boolean(),
    })
    .optional(),
})

const company = await chat({
  adapter: anthropicText('claude-sonnet-4-5'),
  messages: [
    {
      role: 'user',
      content: 'Extract company info from this article: ...',
    },
  ],
  outputSchema: CompanySchema,
})

// Full type safety on nested properties
console.log(company.headquarters.city)
console.log(company.employees[0].role)
console.log(company.financials?.revenue)
```

#### Pattern 3: Direct stream iteration

Pass `stream: true` alongside `outputSchema` to get an async iterable of standard streaming chunks plus a terminal validated object. Use this when you're a single process end-to-end — Node script, CLI, test, or a server endpoint that responds with one JSON blob. For the in-browser progressive-UI case, jump to Pattern 4 instead.

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const PersonSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
})

const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages: [
    { role: 'user', content: 'Extract: John Doe is 30, john@example.com' },
  ],
  outputSchema: PersonSchema,
  stream: true,
})

for await (const chunk of stream) {
  if (chunk.type === 'CUSTOM' && chunk.name === 'structured-output.complete') {
    // Terminal event. `chunk.value.object` is fully validated and typed
    // against the schema you passed in — no helper or cast required.
    chunk.value.object.name // string
    chunk.value.object.age // number
    chunk.value.reasoning // string | undefined (thinking models only)
  }
}
```

The terminal event is a `CUSTOM` chunk: `{ type: 'CUSTOM', name: 'structured-output.complete', value: { object: T, raw: string, reasoning?: string } }`. The return type of `chat({ outputSchema, stream: true })` carries `T` through, so a plain discriminated narrow (`chunk.type === 'CUSTOM' && chunk.name === 'structured-output.complete'`) is enough — no type guard helper.

**Adapter coverage for streaming:**

| Adapter                                                         | `outputSchema` + `stream: true`                                                                                                                       |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tanstack/ai-openai` (Responses + Chat Completions)            | **Native combined mode (#605)** — schema wired into the regular `chatStream` call alongside `tools`; engine harvests JSON, no finalization round-trip |
| `@tanstack/ai-anthropic` (Claude 4.5+ only)                     | **Native combined mode (#605)** — `output_config.format` + `tools` in one beta Messages call. Older Claude models fall back                           |
| `@tanstack/ai-gemini` (Gemini 3.x only)                         | **Native combined mode (#605)** — `responseSchema` + `tools` in one `generateContentStream`. Gemini 2.x falls back                                    |
| `@tanstack/ai-grok` (Grok 4 family only)                        | **Native combined mode (#605)** — `response_format: json_schema` + `tools`. Grok 2 / 3 fall back                                                      |
| `@tanstack/ai-openrouter`                                       | Native single-request stream (legacy `structuredOutputStream` path; per-call combined-mode lookup is a follow-up)                                     |
| `@tanstack/ai-groq`                                             | Legacy `structuredOutputStream` only (no tools — Groq's API rejects schema + tools + stream)                                                          |
| All other adapters (ollama, older Claude, Gemini 2.x, Grok 2/3) | Fallback: runs non-streaming `structuredOutput`, emits one `structured-output.complete` event                                                         |

**Native combined mode vs fallback** is signaled by the adapter's
optional `supportsCombinedToolsAndSchema(modelOptions)` method. When
it returns `true`, the engine wires the JSON Schema into the regular
`chatStream` call and harvests the final-turn text — middleware sees
the run through `beforeModel` / `modelStream` as usual, and the
`'structuredOutput'` middleware phase does **not** fire. When it
returns `false` (or is omitted), the engine takes the legacy
finalization path: agent loop, then a separate `structuredOutput` /
`structuredOutputStream` call with `'structuredOutput'` phase tagging.

Consumer code is identical across providers — always read the final object off `structured-output.complete`.

#### Pattern 4: useChat with outputSchema (progressive UI)

Pass `outputSchema` to `useChat` and you get a `partial` field that fills in as JSON streams in, plus a `final` field that snaps to the validated object on the terminal event. No `onChunk` ceremony, no manual JSON accumulation, no `parsePartialJSON` calls.

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
      {final && <pre>Validated: {JSON.stringify(final, null, 2)}</pre>}
    </div>
  )
}
```

- `partial` is `DeepPartial<z.infer<typeof PersonSchema>>` — every property optional, every nested array element optional. Updated from `TEXT_MESSAGE_CONTENT` deltas.
- `final` is `z.infer<typeof PersonSchema> | null` — populated when `structured-output.complete` arrives.
- `outputSchema` is for client-side type inference only. **Validation runs on the server** against the schema you pass to `chat({ outputSchema })` there.
- Same shape works for non-streaming adapters: the fallback path emits one whole-JSON `TEXT_MESSAGE_CONTENT` then the terminal event, so `partial` populates and `final` snaps in the same render tick — same consumer code as the native-streaming providers, just without an intermediate field-by-field reveal.

#### Pattern 5: Multi-turn structured chat

Every assistant turn produced by `useChat({ outputSchema })` carries its own typed `StructuredOutputPart` on `messages[i].parts`. Old turns stay renderable; new turns produce new parts; history is preserved without manual state plumbing. This is what makes the recipe-builder shape ("now make it vegan") work.

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
          return <UserBubble key={m.id} text={text} />
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
  const recipe = part.data ?? part.partial ?? ({} as Partial<Recipe>)
  return <h3>{recipe.title ?? 'Plating up…'}</h3>
}
```

Key behaviors:

- **Per-turn parts.** Each `sendMessage()` produces a new assistant message with its own `StructuredOutputPart`. The previous turn's part is untouched — `messages.map(...)` renders the whole history.
- **Typed by schema.** `messages[i].parts.find(p => p.type === 'structured-output').data` is typed as `Recipe` (no cast, no `unknown`). Works because `useChat<TSchema>` threads `InferSchemaType<TSchema>` down through `UIMessage<TTools, TData>` → `MessagePart<TTools, TData>` → `StructuredOutputPart<TData>`. **In `@tanstack/ai` core** the message types are single-generic (`UIMessage<TData>`); the tools generic lives in `@tanstack/ai-client` and the framework hook packages — import from your framework package or `ai-client`, not from `@tanstack/ai`.
- **`partial` / `final` are derived.** The hook-level `partial` and `final` are NOT singleton state — they're derived from the latest assistant message's part (the one after the most recent user message). Between `sendMessage()` and the first chunk, `partial` reads `{}` and `final` reads `null` because no new assistant turn exists yet.
- **Round-trip preserves history.** When the client sends turn N+1, each prior assistant turn's `structured-output` part is serialized back as `{ role: 'assistant', content: <part.raw> }` so the model sees its own prior structured response. Streaming / errored parts are dropped from the round-trip.

### Common Mistakes

#### HIGH: Filtering `TextPart`s out of `useChat` renderers when using `outputSchema`

Earlier versions of the library routed structured-output JSON deltas through `TextPart`, so renderers had to filter them out:

```tsx
// OBSOLETE — this guard was needed only because JSON used to land in a TextPart
const last = messages.at(-1)
last?.parts.map((part) => {
  if (part.type === 'text') return null // ❌ hides the structured JSON
  // ...
})
```

That hack is **gone**. With `outputSchema` set, `TEXT_MESSAGE_CONTENT` deltas now route into a dedicated `StructuredOutputPart` (with `raw`, `partial`, `data`, `status`, optional `errorMessage`). Render the structured part directly; let real `TextPart`s through.

```tsx
// CORRECT — find the structured-output part directly; let actual TextParts render
last?.parts.map((part, i) => {
  if (part.type === 'thinking')
    return <ReasoningView key={i} text={part.content} />
  if (part.type === 'tool-call') return <ToolCallView key={i} part={part} />
  if (part.type === 'structured-output')
    return <RecipeCard key={i} part={part} />
  if (part.type === 'text') return <p key={i}>{part.content}</p> // ← real text, not JSON
  return null
})
```

If you still have an `if (part.type === 'text') return null` line in a structured-output renderer specifically for "hiding the JSON," delete it.

Source: PR #577 — structured-output became a typed UIMessage part.

#### HIGH: Treating `partial` / `final` as sticky state across turns

`partial` and `final` are **derived from the latest assistant message's `structured-output` part**, not a sticky hook-level slot. In a multi-turn chat:

- Between `sendMessage()` and the first chunk, `partial` reads `{}` and `final` reads `null` (no assistant message after the latest user yet).
- Once the latest turn completes, `partial === final`. Earlier turns' data is NOT in `partial` / `final` — it lives on the prior assistant messages' parts.

To render history, walk `messages` directly (see Pattern 5). Use `partial` / `final` for a sticky summary of the **most recent** turn only.

```tsx
// WRONG — `final` only reflects the latest turn; earlier recipes vanish from this view
{final && <RecipeCard recipe={final} />}

// CORRECT for history — walk messages, render every assistant's structured-output part
{messages.map((m) =>
  m.role === 'assistant'
    ? m.parts.find((p) => p.type === 'structured-output')
      ? <RecipeCard key={m.id} part={...} />
      : null
    : null
)}
```

Source: PR #577 — partial/final derive from the latest assistant turn's part.

#### HIGH: Parsing streaming JSON deltas yourself

When iterating `chat({ outputSchema, stream: true })` directly (Pattern 3), the `TEXT_MESSAGE_CONTENT` chunks contain _partial_ JSON fragments — they are not valid JSON until the stream completes. Always read the validated object from the terminal `structured-output.complete` event. Validation runs once, on the complete payload.

```typescript
// WRONG -- partial JSON, throws SyntaxError mid-stream, no schema validation
for await (const chunk of stream) {
  if (chunk.type === 'TEXT_MESSAGE_CONTENT') {
    const obj = JSON.parse(chunk.delta) // ❌ partial, invalid
  }
}

// CORRECT -- trust the terminal event
for await (const chunk of stream) {
  if (chunk.type === 'CUSTOM' && chunk.name === 'structured-output.complete') {
    const result = chunk.value.object // ✅ typed and validated
  }
}
```

If you need progressive parsed state in a non-React environment, use a partial-JSON parser on the accumulated raw string at render time — but do NOT treat the result as schema-validated; only the terminal event is. In `useChat`, this is already done for you (`partial` field on Pattern 4).

Source: maintainer interview

#### HIGH: Trying to implement provider-specific structured output strategies

The adapter already handles provider differences (OpenAI uses `response_format`, Anthropic uses tool-based extraction, Gemini uses `responseSchema`). Never configure this yourself.

```typescript
// WRONG -- do not set provider-specific response format
chat({
  adapter,
  messages,
  modelOptions: {
    responseFormat: { type: 'json_schema', json_schema: mySchema },
  },
})

// CORRECT -- just pass outputSchema, the adapter handles the rest
chat({
  adapter,
  messages,
  outputSchema: z.object({ name: z.string(), age: z.number() }),
})
```

There is no scenario where you need to know the provider's strategy. Just pass `outputSchema` to `chat()`.

Source: maintainer interview

#### HIGH: Passing raw objects instead of using the project's schema library

Agents often generate raw JSON Schema objects or plain TypeScript types instead
of using the schema validation library already in the project (Zod, ArkType,
Valibot). Always check what the project uses and match it.

```typescript
// WRONG -- raw object, no runtime validation, no type inference
chat({
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
import { z } from 'zod'

chat({
  adapter,
  messages,
  outputSchema: z.object({
    name: z.string(),
    age: z.number(),
  }),
})
```

Using the project's schema library gives you runtime validation, TypeScript
type inference on the result, and correct JSON Schema conversion automatically.
Check `package.json` for `zod`, `arktype`, or `valibot` and use whichever is
already installed.

Source: maintainer interview

### Middleware coverage

The final structured-output adapter call runs through the same middleware
pipeline as the agent loop. `onChunk` observes chunks attributed to
`ctx.phase === 'structuredOutput'`; `onUsage` fires for the final call's
tokens; `onFinish` fires once at the end of the whole `chat()` invocation,
after the structured-output result is available.

For schema-aware middleware (e.g., transforming the JSON Schema before the
provider call, stripping system prompts), use the dedicated
`onStructuredOutputConfig` hook. See [middleware skill](./tools-outputs-middleware.md#source-tanstack-ai-core-middleware).

### Cross-References

- See also: **./chat-providers.md#source-tanstack-ai-core-chat-experience** — Base `useChat` surface; the structured-output additions documented here layer on top.
- See also: **./chat-providers.md#source-tanstack-ai-core-adapter-configuration** — Adapter handles structured-output strategy transparently.
- See also: **./tools-outputs-middleware.md#source-tanstack-ai-core-tool-calling** — Combine `tools` with `outputSchema` for an agent loop that runs tools first and returns a typed object. Tool-approval and client-tool flows compose with structured runs without extra wiring; see [docs/structured-outputs/with-tools.md](./tools-outputs-middleware.md#source-tanstack-ai-core-structured-outputs).
- See also: **./tools-outputs-middleware.md#source-tanstack-ai-core-middleware** — `onStructuredOutputConfig` hook and the `structuredOutput` phase for observing/transforming the final structured-output call.

<a id="source-tanstack-ai-core-tool-calling"></a>

## Tool Calling

Source: `tanstack-ai-core-tool-calling`.

## Tool Calling

This skill builds on ai-core. Read it first for critical rules.

### Setup

Complete end-to-end example: shared definition, server tool, client tool, server route, React client.

```typescript
// tools/definitions.ts
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

export const getProductsDef = toolDefinition({
  name: 'get_products',
  description: 'Search for products in the catalog',
  inputSchema: z.object({
    query: z.string().meta({ description: 'Search keyword' }),
    limit: z.number().optional().meta({ description: 'Max results' }),
  }),
  outputSchema: z.object({
    products: z.array(
      z.object({ id: z.string(), name: z.string(), price: z.number() }),
    ),
  }),
})

export const updateCartUIDef = toolDefinition({
  name: 'update_cart_ui',
  description: 'Update the shopping cart UI with item count',
  inputSchema: z.object({ itemCount: z.number(), message: z.string() }),
  outputSchema: z.object({ displayed: z.boolean() }),
})
```

```typescript
// tools/server.ts
import { getProductsDef } from './definitions'

export const getProducts = getProductsDef.server(async ({ query, limit }) => {
  const results = await db.products.search(query, { limit: limit ?? 10 })
  return {
    products: results.map((p) => ({ id: p.id, name: p.name, price: p.price })),
  }
})
```

```typescript
// api/chat/route.ts
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { getProducts } from '@/tools/server'
import { updateCartUIDef } from '@/tools/definitions'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [getProducts, updateCartUIDef], // server tool + client definition
  })
  return toServerSentEventsResponse(stream)
}
```

```typescript
// app/chat.tsx
import {
  useChat,
  fetchServerSentEvents,
  clientTools,
  createChatClientOptions,
  type InferChatMessages,
} from "@tanstack/ai-react";
import { updateCartUIDef } from "@/tools/definitions";
import { useState } from "react";

function ChatPage() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartUI = updateCartUIDef.client((input) => {
    setCartCount(input.itemCount);
    return { displayed: true };
  });

  const tools = clientTools(updateCartUI);
  const chatOptions = createChatClientOptions({
    connection: fetchServerSentEvents("/api/chat"),
    tools,
  });
  const { messages, sendMessage } = useChat(chatOptions);
  // InferChatMessages ties part types to the configured tools when needed:
  // type Messages = InferChatMessages<typeof chatOptions>

  return (
    <div>
      <span>Cart: {cartCount}</span>
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.parts.map((part) => {
            if (part.type === "text") return <p>{part.content}</p>;
            if (part.type === "tool-call") {
              return <div key={part.id}>Tool: {part.name} ({part.state})</div>;
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
}
```

### Core Patterns

#### Pattern 1: Server-Only Tool

Define with `toolDefinition()`, implement with `.server()`, pass to `chat({ tools })`.
The server executes it automatically. The client never runs code for this tool.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

const getUserDataDef = toolDefinition({
  name: 'get_user_data',
  description: 'Look up user by ID',
  inputSchema: z.object({
    userId: z.string().meta({ description: "The user's ID" }),
  }),
  outputSchema: z.object({ name: z.string(), email: z.string() }),
})

const getUserData = getUserDataDef.server(async ({ userId }) => {
  const user = await db.users.findUnique({ where: { id: userId } })
  return { name: user.name, email: user.email }
})

// In your route handler:
const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages,
  tools: [getUserData],
})
```

#### Pattern 2: Client-Only Tool

Pass the bare definition (no `.server()`) to `chat({ tools })` so the LLM knows
about it. Pass the `.client()` implementation to `useChat` via `clientTools()`.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

export const showNotificationDef = toolDefinition({
  name: 'show_notification',
  description: 'Display a toast notification to the user',
  inputSchema: z.object({
    message: z.string(),
    type: z.enum(['success', 'error', 'info']),
  }),
  outputSchema: z.object({ shown: z.boolean() }),
})
```

Server -- pass definition only (no execute function):

```typescript
const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages,
  tools: [showNotificationDef],
})
```

Client -- pass `.client()` implementation:

```typescript
import {
  useChat,
  fetchServerSentEvents,
  clientTools,
  createChatClientOptions,
} from "@tanstack/ai-react";
import { showNotificationDef } from "@/tools/definitions";
import { useState } from "react";

function ChatPage() {
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = showNotificationDef.client((input) => {
    setToast(input.message);
    setTimeout(() => setToast(null), 3000);
    return { shown: true };
  });

  const { messages, sendMessage } = useChat(
    createChatClientOptions({
      connection: fetchServerSentEvents("/api/chat"),
      tools: clientTools(showNotification),
    })
  );

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.parts.map((part) =>
            part.type === "text" ? <p>{part.content}</p> : null
          )}
        </div>
      ))}
    </div>
  );
}
```

#### Pattern 3: Tool with Approval Flow

Set `needsApproval: true` in the definition. Execution pauses with
`RUN_FINISHED.outcome.type === 'interrupt'`. The primary client API is bound
`interrupts` + `resolveInterrupt` / `resolveInterrupts` / `cancel`.
`addToolApprovalResponse` and `pendingInterrupts` remain as deprecated
compatibility shims during migration.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

export const sendEmailDef = toolDefinition({
  name: 'send_email',
  description: 'Send an email to a recipient',
  inputSchema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  outputSchema: z.object({ success: z.boolean(), messageId: z.string() }),
  needsApproval: true,
})

export const sendEmail = sendEmailDef.server(async ({ to, subject, body }) => {
  const result = await emailService.send({ to, subject, body })
  return { success: true, messageId: result.id }
})
```

Server route must forward `resume` / `parentRunId` (via `chatParamsFromRequest`
or equivalent). Client -- render bound interrupts:

```typescript
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";

function ChatPage() {
  const { messages, interrupts, sendMessage } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
  });

  return (
    <div>
      {interrupts.map((interrupt) => {
        if (interrupt.kind !== "tool-approval") return null;
        return (
          <div key={interrupt.id}>
            <p>Approve "{interrupt.toolName}"?</p>
            <pre>{JSON.stringify(interrupt.originalArgs, null, 2)}</pre>
            <button onClick={() => interrupt.resolveInterrupt(true)}>
              Approve
            </button>
            <button onClick={() => interrupt.resolveInterrupt(false)}>
              Deny
            </button>
            <button onClick={() => interrupt.cancel()}>Cancel</button>
          </div>
        );
      })}
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.parts.map((part) =>
            part.type === "text" ? <p key={part.content}>{part.content}</p> : null
          )}
        </div>
      ))}
    </div>
  );
}
```

Batch all pending approvals with `resolveInterrupts` (void — submission is
async; watch `resuming` / `interruptErrors`):

```typescript
// Payloadless tool-approvals only
resolveInterrupts(true)

// Or per-item:
resolveInterrupts((interrupt) => {
  if (interrupt.kind === 'tool-approval') {
    interrupt.resolveInterrupt(true)
  }
})
```

Migration: `pendingInterrupts` aliases `interrupts`; `addToolApprovalResponse`
forwards to the matching bound approval when present. Prefer the bound methods
above for new code. See `docs/interrupts/`.

#### Pattern 4: Lazy Tool Discovery

Set `lazy: true` on rarely-needed tools. The LLM sees their names via a synthetic
`__lazy__tool__discovery__` tool and discovers schemas on demand. Saves tokens.

```typescript
import {
  toolDefinition,
  chat,
  toServerSentEventsResponse,
  maxIterations,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const getProductsDef = toolDefinition({
  name: 'getProducts',
  description: 'List all products',
  inputSchema: z.object({}),
  outputSchema: z.array(
    z.object({ id: z.number(), name: z.string(), price: z.number() }),
  ),
})
const getProducts = getProductsDef.server(async () => db.products.findMany())

const compareProductsDef = toolDefinition({
  name: 'compareProducts',
  description: 'Compare two or more products side by side',
  inputSchema: z.object({ productIds: z.array(z.number()).min(2) }),
  lazy: true, // not sent to LLM upfront
})
const compareProducts = compareProductsDef.server(async ({ productIds }) => {
  return db.products.findMany({ where: { id: { in: productIds } } })
})

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [getProducts, compareProducts],
    // maxIterations bounds model turns, not tool calls. For tool budgets,
    // use middleware onBeforeToolCall + onShouldContinue (see agentic-cycle docs).
    agentLoopStrategy: maxIterations(20),
  })
  return toServerSentEventsResponse(stream)
}
```

The LLM sees `getProducts` and `__lazy__tool__discovery__` upfront.
To compare, it first calls `__lazy__tool__discovery__({ toolNames: ["compareProducts"] })`,
gets the full schema, then calls `compareProducts` directly.
Once discovered, a tool stays available for the conversation.
When all lazy tools are discovered, the discovery tool is removed automatically.

#### Tuning the lazy catalog with `lazyToolsConfig`

By default the discovery-tool catalog lists only bare names (`'none'`). Pass
`lazyToolsConfig` to `chat()` to include more context:

```typescript
const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages,
  tools: [getProducts, compareProducts],
  agentLoopStrategy: maxIterations(20),
  lazyToolsConfig: { includeDescription: 'first-sentence' },
})
```

`includeDescription` values:

| Value              | Catalog entry                                                                            | When to use                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `'none'` (default) | `compareProducts`                                                                        | Smallest prompt; model discovers by name                                           |
| `'first-sentence'` | `compareProducts — Compare two or more products side by side.`                           | Helps the model decide whether to discover without extra tokens                    |
| `'full'`           | `compareProducts — Compare two or more products side by side. Accepts productIds array.` | Use when descriptions are short or the model needs full context to route correctly |

The post-discovery payload always returns the full description and schema regardless of this setting.

### MCP Tools

`@tanstack/ai-mcp` lets a server-side `chat()` call discover and invoke tools
hosted on any MCP server (Streamable HTTP, SSE, or stdio).

**MCP tools and UI resources:** When an MCP tool result carries a `ui://`
resource URI (via `_meta.ui.resourceUri`), TanStack AI surfaces it as a
`UIResourcePart` on the assistant `UIMessage` in the client message list.
`UIResourcePart` is a presentational-only part — it never enters model input.
See the `@tanstack/ai-mcp` skill for the full MCP Apps API
(`createMcpAppCallHandler`, `createMcpAppBridge`, `MCPAppResource`).

#### Basic usage — auto-discovery

```typescript
// src/routes/api.chat.ts
import { createFileRoute } from '@tanstack/react-router'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json()

        // 1. Connect to the MCP server.
        const mcp = await createMCPClient({
          transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
        })

        // 2. Discover all tools from the server (returns ServerTool[]).
        const mcpTools = await mcp.tools()

        // 3. Spread them into chat() — they work exactly like hand-written tools.
        // Caller owns the lifecycle — chat() never closes the client. Tools run
        // while the response streams, so close in a middleware terminal hook
        // (a try/finally around the return would close before tools execute).
        const stream = chat({
          adapter: openaiText('gpt-5.5'),
          messages,
          tools: [...mcpTools],
          middleware: [
            {
              name: 'mcp-close',
              onFinish: () => mcp.close(),
              onAbort: () => mcp.close(),
              onError: () => mcp.close(),
            },
          ],
        })
        return toServerSentEventsResponse(stream)
      },
    },
  },
})
```

#### Typed path — pass toolDefinition instances

Pass bare `toolDefinition()` instances (no `.server()`) to `client.tools([...])`.
The MCP client supplies a `callTool` proxy as the execute function, while
input/output validation and types come from the definitions' Zod schemas.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { createMCPClient } from '@tanstack/ai-mcp'
import { z } from 'zod'

const getWeather = toolDefinition({
  name: 'get_weather',
  description: 'Current weather for a city',
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.object({ temperature: z.number(), conditions: z.string() }),
})

const mcp = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
})

// Returns ServerTool[] typed to the definitions' input/output schemas.
// Throws MCPToolNotFoundError if the server does not expose a tool with that name.
const tools = await mcp.tools([getWeather])

const stream = chat({ adapter: openaiText('gpt-5.5'), messages, tools })
```

#### Multiple servers with `createMCPClients`

```typescript
import { createMCPClients } from '@tanstack/ai-mcp'

// Each key becomes the default prefix for that server's tools.
await using pool = await createMCPClients({
  github: { transport: { type: 'http', url: 'https://mcp.github.com/mcp' } },
  linear: { transport: { type: 'http', url: 'https://mcp.linear.app/mcp' } },
})

// Tools auto-prefixed: 'github_search_repos', 'linear_create_issue', etc.
const tools = await pool.tools()

const stream = chat({ adapter: openaiText('gpt-5.5'), messages, tools })
```

Use `pool.clients.<name>` for typed per-server access (resources, prompts, typed
`tools([defs])` overload).

#### `ToolExecutionContext.abortSignal` — cancelling long-running tools

Every server tool's execute function now receives `abortSignal` in its context.
When the chat run aborts (e.g. the client disconnects or calls the run's
`abortController`), the signal fires and any in-flight `callTool` call is
cancelled automatically.

You can also forward it from your own server tools:

```typescript
const longRunningTool = myToolDef.server(async (args, ctx) => {
  // Forward to fetch, a DB query, or an MCP callTool call.
  const response = await fetch('https://slow.api/data', {
    signal: ctx?.abortSignal,
  })
  return response.json()
})
```

MCP tools wire this automatically — `makeMcpExecute` passes `ctx?.abortSignal`
as the `signal` option to `client.callTool(...)`, so MCP server calls cancel
with the chat run without any extra code.

#### stdio transport (Node-only)

```typescript
import { createMCPClient } from '@tanstack/ai-mcp'
import { stdioTransport } from '@tanstack/ai-mcp/stdio'

const mcp = await createMCPClient({
  transport: stdioTransport({ command: 'npx', args: ['-y', 'my-mcp-server'] }),
})
```

Import `stdioTransport` from the `/stdio` subpath only — it contains Node.js
`child_process` imports and must not be bundled for edge runtimes.

#### `chat({ mcp })` — discovery + lifecycle in one prop

Instead of manually calling `client.tools()` and managing `close()`, pass an
`mcp` object and let `chat()` handle discovery and lifecycle.

```typescript
// Prop shape (ChatMCPOptions):
// mcp: {
//   clients: Array<MCPClient | MCPClients>,
//   connection?: 'close' | 'keep-alive',  // default: 'close'
//   lazyTools?: boolean,
//   onDiscoveryError?: (error: unknown, source) => void,
// }
```

- At run start, `chat()` calls `.tools()` on every entry in `clients` and merges
  the results — identical to spreading `await client.tools()` into `tools: [...]`.
- `lazyTools: true` is forwarded to `tools({ lazy: true })`.
- `onDiscoveryError`: throw to fail-fast; return to skip that source.
- `connection: 'close'` (default) closes each client when the run ends (after
  the agent loop completes and the stream is drained). With `'keep-alive'`,
  `chat()` never closes the clients — the caller owns their lifecycle (keep
  connections warm across requests).

**When to use `mcp` vs. the tools spread:**

| Approach                                                | Use when                                                                          |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `chat({ mcp: { clients: [...] } })`                     | Convenience: discovery + lifecycle in one place; untyped tool args are acceptable |
| `tools: [...await client.tools([toolDefinition(...)])]` | Fully-typed tool args/results via Zod schemas                                     |

**Example:**

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json()

        const mcpClient = await createMCPClient({
          transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
        })

        const stream = chat({
          adapter: openaiText('gpt-5.5'),
          messages,
          mcp: {
            clients: [mcpClient],
            connection: 'keep-alive',
            onDiscoveryError: (err, source) => {
              console.warn('MCP discovery failed, skipping source:', err)
              // returning (not throwing) skips this source and continues
            },
          },
        })

        return toServerSentEventsResponse(stream)
      },
    },
  },
})
```

### Provider Skills

> **Not to be confused with `@tanstack/ai-code-mode-skills`**, which are locally-generated TypeScript functions executed client-side. Provider Skills are hosted, provider-managed bundles that the model loads on demand and runs inside the provider's server-side sandbox.

Provider Skills are inert without an execution tool. The execution tool is what activates the sandbox; skills are additional capability bundles that run inside it:

- **Anthropic**: skills require the `code_execution` tool (`@tanstack/ai-anthropic/tools`).
- **OpenAI**: skills live inside the `shell` tool (`@tanstack/ai-openai/tools`) and are Responses API only.

#### Anthropic: `codeExecutionTool` with skills

Import from `@tanstack/ai-anthropic/tools`:

```typescript
import { codeExecutionTool } from '@tanstack/ai-anthropic/tools'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: anthropicText('claude-sonnet-4-6'),
    messages,
    tools: [
      codeExecutionTool(
        { type: 'code_execution_20250825', name: 'code_execution' },
        {
          skills: [{ type: 'anthropic', skill_id: 'pptx', version: 'latest' }],
        },
      ),
    ],
  })
  return toServerSentEventsResponse(stream)
}
```

`AnthropicContainerSkill` shape: `{ type: 'anthropic' | 'custom'; skill_id: string; version?: string }`. Constraints: max 8 skills per request; `skill_id` must be 1–64 characters.

The adapter automatically:

- Lifts the skills into the request's top-level `container.skills` param (the shape Anthropic's API requires).
- Attaches the required beta headers (`code-execution-2025-08-25` plus `skills-2025-10-02` when skills are present). You do not set these manually.

**Deprecation:** Setting skills via `modelOptions.container.skills` is deprecated. Use `codeExecutionTool(config, { skills })` instead — the legacy path bypasses the beta-header wiring.

#### OpenAI: `shellTool` with skills (Responses API only)

Import from `@tanstack/ai-openai/tools`:

```typescript
import { shellTool } from '@tanstack/ai-openai/tools'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [
      shellTool({
        environment: {
          type: 'container_auto',
          skills: [
            { type: 'skill_reference', skill_id: 'skill_abc', version: '2' },
          ],
        },
      }),
    ],
  })
  return toServerSentEventsResponse(stream)
}
```

`SkillReference` shape: `{ type: 'skill_reference'; skill_id: string; version?: string }`. `version` is a string — use a positive integer as a string (e.g. `'2'`) or `'latest'`. This is Responses API only; Chat Completions does not support the shell tool.

#### Scope

Only hosted/managed-by-id skills (`type: 'anthropic'` / `type: 'custom'` for Anthropic; `type: 'skill_reference'` for OpenAI) are wired. Inline bundles, local-path, and upload-API skill creation are not handled by these factories.

### Common Mistakes

#### a. HIGH: Not passing tool definitions to both server and client

Server tools need `chat({ tools })`. Client tools need their definition in
`chat({ tools })` AND their `.client()` in `useChat({ tools: clientTools(...) })`.

Wrong -- tool only on server, client cannot execute:

```typescript
chat({ adapter, messages, tools: [myToolDef] })
useChat({ connection: fetchServerSentEvents('/api/chat') }) // no tools
```

Wrong -- tool only on client, LLM does not know about it:

```typescript
chat({ adapter, messages }); // no tools
useChat({ ..., tools: clientTools(myToolDef.client(() => result)) });
```

Correct:

```typescript
chat({ adapter, messages, tools: [myToolDef] });
useChat({ ..., tools: clientTools(myToolDef.client((input) => ({ success: true }))) });
```

Source: docs/tools/tools.md

### Cross-References

- See also: ./chat-providers.md#source-tanstack-ai-core-chat-experience -- Tools are used within chat
- See also: `@tanstack/ai-code-mode` package skills -- Code Mode is an alternative to tools for complex multi-step operations
