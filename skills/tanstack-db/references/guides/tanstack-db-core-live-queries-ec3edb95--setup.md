# Live Queries — Setup

[Guide and prerequisites](./tanstack-db-core-live-queries-ec3edb95.md) · Published skill · `@tanstack/db@0.9.0`.

## Setup

Minimal example using the core API (no framework hooks):

```ts
import {
  createCollection,
  createLiveQueryCollection,
  liveQueryCollectionOptions,
  eq,
} from '@tanstack/db'

// Assume usersCollection is already created via createCollection(...)

// Option 1: createLiveQueryCollection shorthand
const activeUsers = createLiveQueryCollection((q) =>
  q
    .from({ user: usersCollection })
    .where(({ user }) => eq(user.active, true))
    .select(({ user }) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    })),
)

// Option 2: full options via liveQueryCollectionOptions
const activeUsers2 = createCollection(
  liveQueryCollectionOptions({
    query: (q) =>
      q
        .from({ user: usersCollection })
        .where(({ user }) => eq(user.active, true))
        .select(({ user }) => ({
          id: user.id,
          name: user.name,
        })),
    getKey: (user) => user.id,
  }),
)

// The result is a live collection -- iterate, subscribe, or use as source
for (const user of activeUsers) {
  console.log(user.name)
}
```
