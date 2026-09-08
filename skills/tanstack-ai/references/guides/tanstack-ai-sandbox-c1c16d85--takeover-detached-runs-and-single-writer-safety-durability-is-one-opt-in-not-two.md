# Ai Sandbox — Takeover: detached runs and single-writer safety: Durability is ONE opt-in, not two

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.6`.

## Takeover: detached runs and single-writer safety: Durability is ONE opt-in, not two


`withSandbox(sandbox, { runs, durability })`. A run is durable only when **both**
are present: a record with no event log cannot be replayed, and a log with no
record cannot be found, claimed, or reaped. There is no half-configured state —
**pass one and you silently get exactly today's behavior, with no warning**,
because you have not asked for durability. This is the single easiest way to
believe you shipped durable runs and have shipped nothing.

Pass the **same** `RunStore` chat persistence uses (`persistence.stores.runs`),
and hand the **same** `StreamDurability` instance to both `withSandbox` and the
transport, so one record and one log describe the run.

```typescript
import { memoryStream, toServerSentEventsResponse } from '@tanstack/ai'
import { withSandbox } from '@tanstack/ai-sandbox'
import type { AnyChatMiddleware, RunStore } from '@tanstack/ai'
import type { SandboxDefinition } from '@tanstack/ai-sandbox'

export function durableSandboxMiddleware(
  request: Request,
  sandbox: SandboxDefinition,
  runs: RunStore,
): { middleware: AnyChatMiddleware; adapter: ReturnType<typeof memoryStream> } {
  // ONE adapter instance, handed to both the middleware and the transport.
  const adapter = memoryStream(request)
  return {
    adapter,
    middleware: withSandbox(sandbox, {
      runs,
      durability: { adapter },
    }),
  }
}
// …then: toServerSentEventsResponse(stream, { durability: { adapter } })
```

`runId` is also **required** for a durable run: `chatStream` throws
`DurableRunIdRequiredError` when none is passed, because the journal path and
the deterministic id generator are both derived from it and a successor host can
only resume a run whose `runId` it can recompute.
