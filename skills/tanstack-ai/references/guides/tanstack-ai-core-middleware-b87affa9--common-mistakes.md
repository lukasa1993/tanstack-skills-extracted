# Middleware — Common Mistakes

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.53.0`.

## Common Mistakes

### a. MEDIUM: Trying to modify StreamChunks in middleware

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

### b. MEDIUM: Middleware exceptions breaking the stream — in `onChunk` / `onConfig`

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
