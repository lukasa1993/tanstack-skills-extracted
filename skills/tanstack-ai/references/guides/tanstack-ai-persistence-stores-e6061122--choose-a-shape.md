# Stores — Choose a shape

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## Choose a shape

```ts
import { defineAIPersistence } from '@tanstack/ai-persistence'
import type { ChatWithInterruptsPersistence } from '@tanstack/ai-persistence'

// Sparse is fine — only implement what you need.
export const persistence: ChatWithInterruptsPersistence = defineAIPersistence({
  stores: {
    messages, // required for withPersistence / reconstructChat
    runs, // required if you have interrupts
    interrupts,
    // metadata optional
  },
})
```

| Shape                           | Contents                                         |
| ------------------------------- | ------------------------------------------------ |
| `ChatTranscriptPersistence`     | `messages` (+ optional runs/interrupts/metadata) |
| `ChatWithInterruptsPersistence` | `messages` + `runs` + `interrupts`               |
| `ChatPersistence`               | all four chat stores                             |

`defineAIPersistence` preserves exact keys and rejects unknown keys at runtime.

**Annotate your factory with a named shape.** Bare `AIPersistence` is the
all-optional sparse bag, so `withPersistence` and `reconstructChat` reject it
(`stores.messages` is possibly `undefined`). This is the single most common
mistake when writing an adapter.

**`stores` accepts exactly four keys** — `messages`, `runs`, `interrupts`,
`metadata`. Anything else (notably `locks` or sandbox instance maps) throws
`Unknown AIPersistence store key` at runtime and fails to type-check. Locks:
**ai-core/locks** / `@tanstack/ai/locks`. Sandbox instance resume:
`@tanstack/ai-sandbox`.
