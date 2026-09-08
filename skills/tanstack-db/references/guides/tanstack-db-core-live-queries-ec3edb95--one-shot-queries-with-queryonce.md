# Live Queries — One-Shot Queries with queryOnce

[Guide and prerequisites](./tanstack-db-core-live-queries-ec3edb95.md) · Published skill · `@tanstack/db@0.8.7`.

## One-Shot Queries with queryOnce

For non-reactive, one-time snapshots use `queryOnce`. It creates a live query collection, preloads it, extracts the results, and cleans up automatically.

```ts
import { eq, queryOnce } from '@tanstack/db'

const activeUsers = await queryOnce((q) =>
  q
    .from({ user: usersCollection })
    .where(({ user }) => eq(user.active, true))
    .select(({ user }) => ({ id: user.id, name: user.name })),
)

// With findOne — resolves to T | undefined
const user = await queryOnce((q) =>
  q
    .from({ user: usersCollection })
    .where(({ user }) => eq(user.id, userId))
    .findOne(),
)
```

Use `queryOnce` for scripts, loaders, data export, tests, or AI/LLM context building. For UI bindings and reactive updates, use live queries instead.
