# Tool Calling — Core Patterns: Generic middleware interrupts

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: Generic middleware interrupts


Use `defineInterrupt()` when middleware needs typed data from the client. This
does not replace `needsApproval`. Tool approval asks whether a tool can run.
Generic interrupts ask for application data at a chat lifecycle boundary.

Define the interrupt once. Register it with both `chat({ interrupts })` and
`useChat({ interrupts })`. Emit it only from `onInterruptBoundary`, then read
the typed result in `onInterruptResolution`.

```typescript
import { defineInterrupt, type ChatMiddleware } from '@tanstack/ai'
import { z } from 'zod'

const reviewPlan = defineInterrupt({
  id: 'review-plan',
  payloadSchema: z.object({ title: z.string() }),
  responseSchema: z.object({ approved: z.boolean() }),
})

const reviewMiddleware: ChatMiddleware<unknown, typeof reviewPlan> = {
  onInterruptBoundary(ctx) {
    if (ctx.phase !== 'beforeTools') return
    return {
      interrupts: [
        reviewPlan.interrupt({
          key: 'release-plan',
          reason: 'review-required',
          message: 'Approve this plan?',
          payload: { title: 'Release plan' },
        }),
      ],
    }
  },
  onInterruptResolution(_ctx, resumedInterrupts) {
    for (const result of resumedInterrupts.for(reviewPlan)) {
      if (result.status === 'resolved' && !result.response.approved) {
        return { toolResume: 'stop' }
      }
    }
  },
}
```

Several middleware can request generic interrupts at one boundary. They share
one AG-UI interrupt batch with tool approvals. A continuation starts only after
the client resolves or cancels every bound item. `stop` is more restrictive than
`cancel`, which is more restrictive than `continue`.

Do not emit raw AG-UI interrupt events from middleware. Use the boundary hook
so the engine creates one terminal event and persistence records the batch.
