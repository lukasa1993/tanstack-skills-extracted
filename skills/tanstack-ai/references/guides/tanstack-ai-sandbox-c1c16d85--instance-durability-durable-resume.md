# Ai Sandbox — Instance durability (durable resume)

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Instance durability (durable resume)

Resume bookkeeping defaults to in-memory (single-process). For cross-process /
multi-replica resume, implement a durable `SandboxInstanceStore` (BYO) and pass
it as `withSandbox(sandbox, { instances })`. Pair multi-replica with a
distributed lock: either `withLocks` from `@tanstack/ai/locks` (ordered
**before** `withSandbox`) or the `locks` option.

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { InMemoryLockStore, withLocks } from '@tanstack/ai/locks'
import { claudeCodeText } from '@tanstack/ai-claude-code'
import { withSandbox } from '@tanstack/ai-sandbox'
// Your `defineSandbox(...)` result.
import { sandbox } from './sandbox'
// Production: your BYO store — docs/sandbox/durability.md
import { instanceStore } from './sandbox-instance-store'

export async function POST(request: Request) {
  const { threadId, messages } = await request.json()

  const stream = chat({
    threadId,
    adapter: claudeCodeText('sonnet'),
    messages,
    middleware: [
      withLocks(new InMemoryLockStore()), // multi-replica: distributed lock
      withSandbox(sandbox, { instances: instanceStore }),
    ],
  })

  return toServerSentEventsResponse(stream)
}
```

The store option takes precedence over an ambient `SandboxInstanceStoreCapability`
(provided by a platform layer via `provideSandboxInstanceStore`), which in turn
beats the in-memory fallback.

Chat transcript durability (`withPersistence`) is independent — compose both
when the app needs history _and_ instance reuse. Prove adapters with
`runSandboxInstanceStoreConformance` from `@tanstack/ai-sandbox/testkit`.
Use `defineSandboxInstanceStore({ get, upsert, delete })` for inline typing of a
BYO store (same pattern as `defineLock` / `defineMessageStore`).
