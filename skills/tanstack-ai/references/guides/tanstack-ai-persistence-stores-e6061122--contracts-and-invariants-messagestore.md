# Stores — Contracts and invariants: `MessageStore`

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## Contracts and invariants: `MessageStore`


```ts
interface MessageStore {
  loadThread(threadId: string): Promise<Array<ModelMessage>>
  saveThread(threadId: string, messages: Array<ModelMessage>): Promise<void>
}
```

- `loadThread` → `[]` for unknown threads (never `null`).
- `saveThread` is a **full overwrite**, not append. A one-message payload wipes history.
