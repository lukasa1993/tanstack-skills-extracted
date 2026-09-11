# Live Queries — Core Patterns

[Guide and prerequisites](./tanstack-db-core-live-queries-ec3edb95.md) · Published skill · `@tanstack/db@0.9.0`.

## Core Patterns

### 1. Filtering with where + operators

Chain `.where()` calls (ANDed together) using expression operators. Use `and()`, `or()`, `not()` for complex logic.

```ts
import { eq, gt, or, and, not, inArray, like } from '@tanstack/db'

const results = createLiveQueryCollection((q) =>
  q
    .from({ user: usersCollection })
    .where(({ user }) => eq(user.active, true))
    .where(({ user }) =>
      and(
        gt(user.age, 18),
        or(eq(user.role, 'admin'), eq(user.role, 'moderator')),
        not(inArray(user.id, bannedIds)),
      ),
    ),
)
```

Boolean column references work directly:

```ts
.where(({ user }) => user.active)        // bare boolean ref
.where(({ user }) => not(user.suspended)) // negated boolean ref
```

Comparisons follow PostgreSQL semantics. Comparisons involving `null` or
`undefined` are unknown and do not match; use `isNull()` or `isUndefined()`.
`NaN` (and an invalid `Date`) equals itself and sorts after every other
non-null value.

### 2. Joining two collections

Join conditions **must** use `eq()` (equality only -- IVM constraint). Default join type is `left`. Convenience methods: `leftJoin`, `rightJoin`, `innerJoin`, `fullJoin`.

```ts
import { eq } from '@tanstack/db'

const userPosts = createLiveQueryCollection((q) =>
  q
    .from({ user: usersCollection })
    .innerJoin({ post: postsCollection }, ({ user, post }) =>
      eq(user.id, post.userId),
    )
    .select(({ user, post }) => ({
      userName: user.name,
      postTitle: post.title,
    })),
)
```

Multiple joins:

```ts
q.from({ user: usersCollection })
  .join({ post: postsCollection }, ({ user, post }) => eq(user.id, post.userId))
  .join({ comment: commentsCollection }, ({ post, comment }) =>
    eq(post.id, comment.postId),
  )
```

### 3. Aggregation with groupBy + having

Use `groupBy` to group rows, then aggregate in `select`. Filter groups with `having`. The `$selected` namespace lets `having` and `orderBy` reference fields defined in `select`.

```ts
import { count, sum, gt } from '@tanstack/db'

const topCustomers = createLiveQueryCollection((q) =>
  q
    .from({ order: ordersCollection })
    .groupBy(({ order }) => order.customerId)
    .select(({ order }) => ({
      customerId: order.customerId,
      totalSpent: sum(order.amount),
      orderCount: count(order.id),
    }))
    .having(({ $selected }) => gt($selected.totalSpent, 1000))
    .orderBy(({ $selected }) => $selected.totalSpent, 'desc')
    .limit(10),
)
```

Without `groupBy`, aggregates in `select` treat the entire collection as one group:

```ts
const stats = createLiveQueryCollection((q) =>
  q.from({ user: usersCollection }).select(({ user }) => ({
    totalUsers: count(user.id),
    avgAge: avg(user.age),
  })),
)
```

### 4. Standalone derived collection with createLiveQueryCollection

Derived collections are themselves collections. Use one as a source for another query to cache intermediate results:

```ts
// Base derived collection
const activeUsers = createLiveQueryCollection((q) =>
  q.from({ user: usersCollection }).where(({ user }) => eq(user.active, true)),
)

// Second query uses the derived collection as its source
const activeUserPosts = createLiveQueryCollection((q) =>
  q
    .from({ user: activeUsers })
    .join({ post: postsCollection }, ({ user, post }) =>
      eq(user.id, post.userId),
    )
    .select(({ user, post }) => ({
      userName: user.name,
      postTitle: post.title,
    })),
)
```

Create derived collections once at module scope and reuse them. Do not recreate on every render or navigation.

Live query collections default to `gcTime: 5_000`. An explicit `gcTime: 0` is
preserved and disables garbage collection for that derived collection.
