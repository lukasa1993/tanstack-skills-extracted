# Stores — Minimal message store example

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## Minimal message store example

Type each store with its `define*Store` helper (`defineMessageStore`,
`defineRunStore`, `defineInterruptStore`, `defineMetadataStore`): pass the object
literal and get autocomplete + contract checking inline, with no `: MessageStore`
annotation. The result composes into `defineAIPersistence` with exact presence.

```ts
import { defineMessageStore } from '@tanstack/ai-persistence'
import type { ModelMessage } from '@tanstack/ai'

const threads = new Map<string, Array<ModelMessage>>()

export const messages = defineMessageStore({
  async loadThread(threadId) {
    return [...(threads.get(threadId) ?? [])]
  },
  async saveThread(threadId, next) {
    threads.set(threadId, [...next])
  },
})
```

For durable DBs, preserve the same semantics with upserts / full-row replace.
