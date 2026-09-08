# Ag Ui Protocol — Core Patterns

[Guide and prerequisites](./tanstack-ai-core-ag-ui-protocol-5877d289.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns

### 1. SSE Format — toServerSentEventsStream / toServerSentEventsResponse

**Wire format:** Each event is `data: <JSON>\n\n`. Stream ends with `data: [DONE]\n\n`.

```typescript
import {
  chat,
  toServerSentEventsStream,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

// Option A: Get a ReadableStream (manual Response construction)
const abortController = new AbortController()
const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  abortController,
})
const sseStream = toServerSentEventsStream(stream, abortController)

const response = new Response(sseStream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  },
})

// Option B: Use the helper (sets headers automatically)
const response2 = toServerSentEventsResponse(stream, { abortController })
// Default headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive
```

**Default response headers set by `toServerSentEventsResponse()`:**

| Header          | Value               |
| --------------- | ------------------- |
| `Content-Type`  | `text/event-stream` |
| `Cache-Control` | `no-cache`          |
| `Connection`    | `keep-alive`        |

Custom headers merge on top (user headers override defaults):

```typescript
toServerSentEventsResponse(stream, {
  headers: {
    'X-Accel-Buffering': 'no', // Disable nginx buffering
    'Cache-Control': 'no-store', // Override default
  },
  abortController,
})
```

**Error handling:** If the stream throws, a `RUN_ERROR` event is emitted
automatically before the stream closes. If the `abortController` is already
aborted, the error event is suppressed and the stream closes silently.

### 2. HTTP Stream (NDJSON) — toHttpStream / toHttpResponse

**Wire format:** Each event is `<JSON>\n` (newline-delimited JSON, no SSE prefix, no `[DONE]` marker).

```typescript
import { chat, toHttpStream, toHttpResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

// Option A: Get a ReadableStream
const abortController = new AbortController()
const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  abortController,
})
const ndjsonStream = toHttpStream(stream, abortController)

const response = new Response(ndjsonStream, {
  headers: {
    'Content-Type': 'application/x-ndjson',
  },
})

// Option B: Use the helper (does NOT set headers automatically)
const response2 = toHttpResponse(stream, { abortController })
// Note: toHttpResponse does NOT set Content-Type automatically.
// You should pass headers explicitly:
const response3 = toHttpResponse(stream, {
  headers: { 'Content-Type': 'application/x-ndjson' },
  abortController,
})
```

**Client-side pairing:** SSE endpoints are consumed by `fetchServerSentEvents()`.
HTTP stream endpoints are consumed by `fetchHttpStream()`. Both are connection
adapters from `@tanstack/ai-react` (or the framework-specific package).

### 3. AG-UI Event Types Reference

All events extend `BaseAGUIEvent` which carries `type`, `timestamp`, optional
`model`, and optional `rawEvent`.

| Event Type             | Description                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `RUN_STARTED`          | First event in a stream. Carries `runId` and optional `threadId`.                                                           |
| `TEXT_MESSAGE_START`   | New text message begins. Carries `messageId` and `role`.                                                                    |
| `TEXT_MESSAGE_CONTENT` | Incremental text token. Carries `messageId` and `delta` (the new text).                                                     |
| `TEXT_MESSAGE_END`     | Text message complete. Carries `messageId`.                                                                                 |
| `TOOL_CALL_START`      | Tool invocation begins. Carries `toolCallId`, `toolName`, and `index`.                                                      |
| `TOOL_CALL_ARGS`       | Incremental tool arguments JSON. Carries `toolCallId` and `delta`.                                                          |
| `TOOL_CALL_END`        | Tool call arguments complete. Carries `toolCallId` and `toolName`.                                                          |
| `STEP_STARTED`         | Thinking/reasoning step begins. Carries `stepId` and optional `stepType`.                                                   |
| `STEP_FINISHED`        | Thinking step complete. Carries `stepId`, `delta`, and optional `content`.                                                  |
| `MESSAGES_SNAPSHOT`    | Full conversation transcript snapshot. Carries `messages: Array<UIMessage>`.                                                |
| `STATE_SNAPSHOT`       | Full application state snapshot. Carries `state: Record<string, unknown>`.                                                  |
| `STATE_DELTA`          | Incremental state update. Carries `delta: Record<string, unknown>`.                                                         |
| `CUSTOM`               | Extension point. Carries `name` (string) and optional `value` (unknown).                                                    |
| `RUN_FINISHED`         | Stream complete. Carries `runId` and `finishReason` (`'stop'` / `'length'` / `'content_filter'` / `'tool_calls'` / `null`). |
| `RUN_ERROR`            | Error during stream. Carries optional `runId` and `error: { message, code? }`.                                              |

**Typical event sequence for a text-only response:**

```
RUN_STARTED -> TEXT_MESSAGE_START -> TEXT_MESSAGE_CONTENT (repeated) -> TEXT_MESSAGE_END -> RUN_FINISHED
```

**Typical event sequence with tool calls:**

```
RUN_STARTED -> TEXT_MESSAGE_START -> TEXT_MESSAGE_CONTENT* -> TEXT_MESSAGE_END
            -> TOOL_CALL_START -> TOOL_CALL_ARGS* -> TOOL_CALL_END
            -> RUN_FINISHED (finishReason: 'tool_calls')
```

**Type aliases:** `StreamChunk` is an alias for `AGUIEvent` (the discriminated
union of all event interfaces). `StreamChunkType` is an alias for `AGUIEventType`
(the string union of all event type literals).

### 4. Typed CUSTOM Events — `ChatStream` and `KnownCustomEvent`

The `CUSTOM` row above describes the raw `StreamChunk` union, where the single
generic `CustomEvent` member types `value` as `any` -- once merged into a
union, that `any` poisons every other member too, so narrowing on `name`
still leaves `value: any`. `chat()` doesn't return raw `StreamChunk`; by
default (no `outputSchema`, `stream` not explicitly `false`) it returns
`ChatStream`, which swaps that generic member for `KnownCustomEvent` -- a
discriminated union of every `CUSTOM` event TanStack AI itself emits, each
with a literal `name` and a concrete `value`. Narrow with a plain `if` --
no helper, no cast:

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
})

for await (const chunk of stream) {
  if (chunk.type === 'CUSTOM' && chunk.name === 'sandbox.file.diff') {
    console.log(chunk.value.path, chunk.value.diff) // typed, no helper, no cast
  } else if (
    chunk.type === 'CUSTOM' &&
    chunk.name === 'structured-output.complete'
  ) {
    console.log(chunk.value.object) // typed, no helper, no cast
  }
}
```

**Caveat -- `.endsWith()` (or any non-literal check) does not narrow.**
`SessionIdEvent['name']` is the template-literal type
`` `${string}.session-id` ``. TypeScript's control-flow narrowing only
understands exact comparisons (`===`) and `in`/type-predicate checks against
a discriminant -- a runtime `chunk.name.endsWith('.session-id')` check
doesn't inform the type system, so `chunk.value` stays the union of every
`KnownCustomEvent`'s `value`, not `{ sessionId: string }`. Compare against
the exact literal you expect, or write a user-defined type predicate
(`(c): c is SessionIdEvent => c.name.endsWith('.session-id')`) and call that
in the `if` instead.

**User-emitted `emitCustomEvent` names are typed out of `ChatStream`.** Tools
that call `context.emitCustomEvent('my-app:progress', ...)` still stream a
`CUSTOM` chunk at runtime, but `'my-app:progress'` isn't one of
`KnownCustomEvent`'s literal names, so it's intentionally absent from
`ChatStream`'s type -- including a generic fallback member would reintroduce
the `value: any` poison for every other event on the stream. To read your own
event with a type, annotate the stream as the wider `StreamChunk` instead of
`ChatStream` for that branch; its generic `CUSTOM` member already types
`value` as `any`, so no cast is needed there either.

Source: docs/protocol/custom-events.md
