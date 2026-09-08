# Live Queries — Reactive Effects (createEffect)

[Guide and prerequisites](./tanstack-db-core-live-queries-ec3edb95.md) · Published skill · `@tanstack/db@0.8.7`.

## Reactive Effects (createEffect)

Reactive effects respond to query result _changes_ without materializing the full result set. Effects fire callbacks when rows enter, exit, or update within a query result — like a database trigger on an arbitrary live query.

```ts
import { createEffect, eq } from '@tanstack/db'

const effect = createEffect({
  query: (q) =>
    q
      .from({ msg: messagesCollection })
      .where(({ msg }) => eq(msg.role, 'user')),
  skipInitial: true,
  onEnter: async (event, ctx) => {
    await processNewMessage(event.value, { signal: ctx.signal })
  },
  onExit: (event) => {
    console.log('Message left result set:', event.key)
  },
  onError: (error, event) => {
    console.error(`Failed to process ${event.key}:`, error)
  },
})

// Dispose when no longer needed
await effect.dispose()
```

| Use case                        | Approach                                              |
| ------------------------------- | ----------------------------------------------------- |
| Display query results in UI     | Live query collection + `useLiveQuery`                |
| React to changes (side effects) | `createEffect` with `onEnter` / `onUpdate` / `onExit` |
| Inspect full batch of changes   | `createEffect` with `onBatch`                         |

Key options: `id` (optional), `query`, `skipInitial` (skip existing rows on init), `onEnter`, `onUpdate`, `onExit`, `onBatch`, `onError`, `onSourceError`. The `ctx.signal` aborts when the effect is disposed.
