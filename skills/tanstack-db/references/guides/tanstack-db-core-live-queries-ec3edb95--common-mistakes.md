# Live Queries — Common Mistakes

[Guide and prerequisites](./tanstack-db-core-live-queries-ec3edb95.md) · Published skill · `@tanstack/db@0.8.7`.

## Common Mistakes

### CRITICAL: Using === instead of eq()

JavaScript `===` in a where callback returns a boolean primitive, not an expression object. Throws `InvalidWhereExpressionError`.

```ts
// WRONG
q.from({ user: usersCollection }).where(({ user }) => user.active === true)

// CORRECT
q.from({ user: usersCollection }).where(({ user }) => eq(user.active, true))
```

### CRITICAL: Filtering in JS instead of query operators

JS `.filter()` / `.map()` on the result array throws away incremental maintenance -- the JS code re-runs from scratch on every change.

```ts
// WRONG -- re-runs filter on every change
const { data } = useLiveQuery({
  query: (q) => q.from({ todos: todosCollection }),
})
const active = data.filter((t) => t.completed === false)

// CORRECT -- incrementally maintained
const { data } = useLiveQuery({
  query: (q) =>
    q
      .from({ todos: todosCollection })
      .where(({ todos }) => eq(todos.completed, false)),
})
```

### HIGH: Not using the full operator set

The library provides string functions (`upper`, `lower`, `length`, `concat`),
math (`add`, `subtract`, `multiply`, `divide`), utility functions (`coalesce`,
`caseWhen`), and aggregates (`count`, `sum`, `avg`, `min`, `max`). All are
incrementally maintained. Prefer them over JS equivalents.

```ts
// WRONG
.fn.select((row) => ({
  name: row.user.name.toUpperCase(),
  total: row.order.price + row.order.tax,
}))

// CORRECT
.select(({ user, order }) => ({
  name: upper(user.name),
  total: add(order.price, order.tax),
  displayName: coalesce(user.displayName, user.name, 'Unknown'),
}))
```

Math expressions also work in `orderBy()`. When a computed expression is used
with `limit()`, lazy-loading optimization is skipped and all matching rows load
before sorting. Literal values such as `Date.now()` are captured when the query
is created; recreate the query when the value must advance.

### HIGH: Missing conditional expression helpers

Use `coalesce()` for null/undefined fallbacks and `caseWhen()` for conditional
computed fields. JavaScript operators like `||` or ternaries do not build query
expressions inside standard `.select()` callbacks.

```ts
// WRONG -- document.title is a query ref, not a runtime string
.select(({ document }) => ({
  displayTitle: document.title || 'Untitled document',
}))

// CORRECT -- fallback for null/undefined
.select(({ document }) => ({
  displayTitle: coalesce(document.title, 'Untitled document'),
}))

// CORRECT -- fallback for null/undefined and empty string
.select(({ document }) => ({
  displayTitle: caseWhen(
    eq(coalesce(document.title, ''), ''),
    'Untitled document',
    document.title,
  ),
}))
```

Use `fn.select()` only when you genuinely need arbitrary JavaScript; it cannot
be optimized like expression-based `.select()`.

### HIGH: .distinct() without .select()

`distinct()` deduplicates by the selected columns. Without `select()`, throws `DistinctRequiresSelectError`.

```ts
// WRONG
q.from({ user: usersCollection }).distinct()

// CORRECT
q.from({ user: usersCollection })
  .select(({ user }) => ({ country: user.country }))
  .distinct()
```

### HIGH: .having() without .groupBy()

`having` filters aggregated groups. Without `groupBy`, there are no groups. Throws `HavingRequiresGroupByError`.

```ts
// WRONG
q.from({ order: ordersCollection }).having(({ order }) =>
  gt(count(order.id), 5),
)

// CORRECT
q.from({ order: ordersCollection })
  .groupBy(({ order }) => order.customerId)
  .having(({ order }) => gt(count(order.id), 5))
```

### HIGH: .limit() / .offset() without .orderBy()

Without deterministic ordering, limit/offset results are non-deterministic and cannot be incrementally maintained. Throws `LimitOffsetRequireOrderByError`.

```ts
// WRONG
q.from({ user: usersCollection }).limit(10)

// CORRECT
q.from({ user: usersCollection })
  .orderBy(({ user }) => user.name)
  .limit(10)
```

### HIGH: Join condition using non-eq() operator

The differential dataflow join operator only supports equality joins. Using `gt()`, `like()`, etc. throws `JoinConditionMustBeEqualityError`.

```ts
// WRONG
q.from({ user: usersCollection }).join(
  { post: postsCollection },
  ({ user, post }) => gt(user.id, post.userId),
)

// CORRECT
q.from({ user: usersCollection }).join(
  { post: postsCollection },
  ({ user, post }) => eq(user.id, post.userId),
)
```

### MEDIUM: Passing source directly instead of {alias: collection}

`from()` and `join()` require sources wrapped as `{alias: collection}`. Passing the collection directly throws `InvalidSourceTypeError`.

```ts
// WRONG
q.from(usersCollection)

// CORRECT
q.from({ users: usersCollection })
```

### MEDIUM: Using unsafe select alias paths

Select alias path segments named `__proto__`, `prototype`, or `constructor`
throw `UnsafeAliasPathError`. Use ordinary data-field names; do not suppress
this prototype-pollution guard.
