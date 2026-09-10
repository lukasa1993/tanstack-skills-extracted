# Ai Sandbox — File-event hooks

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## File-event hooks

Watch the workspace for create/change/delete events. Provider-agnostic: native
`fs.watch` on local-process, a portable `find` poll on Docker/exec-only
providers (no extra deps or image changes).

Declare hooks on `defineSandbox({ hooks })` (sandbox-scoped) or on any chat
middleware via the `sandbox` group (run-scoped):

```typescript
import { defineSandbox, withSandbox } from '@tanstack/ai-sandbox'
// `defineChatMiddleware` is core's, not this package's — `@tanstack/ai-sandbox`
// consumes it too (see its own `src/middleware.ts`).
import { chat, defineChatMiddleware } from '@tanstack/ai'
import { claudeCodeText } from '@tanstack/ai-claude-code'
import { dockerSandbox } from '@tanstack/ai-sandbox-docker'
import { db } from './db'
import { metrics } from './metrics'

// Sandbox-scoped hooks (all optional):
const sandbox = defineSandbox({
  id: 'repo-agent',
  provider: dockerSandbox({ image: 'node:22' }),
  hooks: {
    onFile: (e) => console.log(e.type, e.path), // catch-all
    onFileCreate: (e) => console.log('created', e.path),
    onFileChange: (e) => console.log('changed', e.path),
    onFileDelete: (e) => console.log('deleted', e.path),
    onReady: (handle) => console.log('ready', handle.id),
    onError: (err) => console.error(err),
    onDestroy: () => console.log('destroyed'),
  },
  fileEvents: true, // default; set false to disable watching entirely
})

// Run-scoped hooks via chat middleware (ctx is ChatMiddlewareContext):
const auditMiddleware = defineChatMiddleware({
  name: 'audit',
  sandbox: {
    onFile: (ctx, e) => console.log(ctx.runId, e.type, e.path),
    onFileCreate: (ctx, e) => db.log({ run: ctx.runId, event: e }),
    onFileChange: (ctx, e) => metrics.increment('file.change'),
    onFileDelete: (ctx, e) => console.warn('deleted', e.path),
  },
})

// No extra middleware needed — sandbox.file CUSTOM events are emitted
// automatically. Read them from the stream:
const stream = chat({
  threadId: 'thread-1',
  adapter: claudeCodeText('sonnet'),
  messages: [{ role: 'user', content: 'Add a README.' }],
  middleware: [auditMiddleware, withSandbox(sandbox)],
})

for await (const chunk of stream) {
  if (chunk.type === 'CUSTOM' && chunk.name === 'sandbox.file') {
    const value = chunk.value
    if (
      value !== null &&
      typeof value === 'object' &&
      'type' in value &&
      'path' in value
    ) {
      console.log('file event', value) // { type, path, timestamp }
    }
  }
}
```

`watchWorkspace()` is available as a low-level building block for watching
outside a `chat()` run:

```typescript
import { watchWorkspace } from '@tanstack/ai-sandbox'
// Your `defineSandbox(...)` result.
import { sandbox } from './sandbox'

const handle = await sandbox.ensure({ threadId: 'thread-1', runId: 'run-1' })
const watcher = await watchWorkspace(handle, {
  onEvent: (e) => console.log(e.type, e.path),
  ignore: ['.git', 'node_modules'], // default
})
await watcher.stop()
```

Enable the `sandbox` debug category to log watcher start/stop, event dispatch,
and lifecycle transitions:

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { claudeCodeText } from '@tanstack/ai-claude-code'
import { withSandbox } from '@tanstack/ai-sandbox'
import { sandbox } from './sandbox'

export async function POST(request: Request) {
  const { threadId, messages } = await request.json()

  const stream = chat({
    threadId,
    adapter: claudeCodeText('sonnet'),
    messages,
    middleware: [withSandbox(sandbox)],
    debug: { sandbox: true }, // or debug: true to enable all categories
  })

  return toServerSentEventsResponse(stream)
}
```
