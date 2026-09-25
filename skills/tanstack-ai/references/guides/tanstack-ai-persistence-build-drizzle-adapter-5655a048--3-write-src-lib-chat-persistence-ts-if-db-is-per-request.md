# Build Drizzle Adapter — 3. Write `src/lib/chat-persistence.ts`: If `db` is per-request

[Guide and prerequisites](./tanstack-ai-persistence-build-drizzle-adapter-5655a048.md) · Published skill · `@tanstack/ai-persistence@0.6.7`.

## 3. Write `src/lib/chat-persistence.ts`: If `db` is per-request


Workers/D1 and any request-scoped client cannot read a binding at module scope.
Export a factory instead, and call it inside the handler:

```ts ignore
type Db = ReturnType<typeof getDb>

export function chatPersistence(): ChatPersistence {
  const db = getDb()
  return defineAIPersistence({
    stores: {
      messages: createMessageStore(db),
      runs: createRunStore(db),
      interrupts: createInterruptStore(db),
      metadata: createMetadataStore(db),
    },
  })
}
```

The store factories are unchanged — only the export flips from a const to a
function. For D1 specifically, see
**ai-persistence/build-cloudflare-adapter**.
