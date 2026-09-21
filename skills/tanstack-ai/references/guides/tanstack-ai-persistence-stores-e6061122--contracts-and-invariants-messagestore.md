# Stores — Contracts and invariants: `MessageStore`

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.6.2`.

## Contracts and invariants: `MessageStore`


```ts
import type { ModelMessage } from '@tanstack/ai'

interface MessagePage {
  messages: Array<ModelMessage>
  truncated: boolean
  cursor?: string
}

interface MessageStore {
  loadThread: (
    threadId: string,
    options?: { limit?: number; before?: string },
  ) => Promise<Array<ModelMessage> | MessagePage>
  saveThread: (threadId: string, messages: Array<ModelMessage>) => Promise<void>
}
```

- Call `loadThread` with only `threadId` and return the full array (`[]` for
  unknown threads, never `null`). Never a `MessagePage`.
- `limit` and `before` are an optional hydrate hint. Ignore them and return the
  full array, or return a `MessagePage`. `before` is opaque. You mint the cursor.
- `saveThread` is a **full replace** of the merged list, not append. Merge by
  id is `withPersistence`, not this store.
