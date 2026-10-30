# React Db — Common Mistakes

[Guide and prerequisites](./tanstack-react-db-ba0ab260.md) · Published skill · `@tanstack/react-db@1.0.0-rc.1`.

## Common Mistakes

### CRITICAL Using === instead of eq() in .where()

Wrong — throws `InvalidWhereExpressionError` at runtime:

```tsx
const { data } = useLiveQuery({
  query: (q) =>
    q
      .from({ todo: todoCollection })
      .where(({ todo }) => todo.completed === true),
})
```

Correct — use expression functions from `@tanstack/react-db`:

```tsx
import { useLiveQuery, eq } from '@tanstack/react-db'

const { data } = useLiveQuery({
  query: (q) =>
    q
      .from({ todo: todoCollection })
      .where(({ todo }) => eq(todo.completed, true)),
})
```

JavaScript `===`, `!==`, `<`, and `>` evaluate immediately and return a boolean. Use expression functions such as `eq`, `gt`, `gte`, `lt`, `lte`, `and`, `or`, and `not` for structured `.where()` predicates. See ./tanstack-db-core-live-queries-ec3edb95.md#source-tanstack-db-core-live-queries for the full operator reference.

### CRITICAL Assigning useLiveQuery result directly instead of destructuring

Wrong — crashes with "map is not a function":

```tsx
const todos = useLiveQuery({
  query: (q) => q.from({ todo: todoCollection }),
})
return todos.map((t) => <li>{t.text}</li>) // TypeError: todos.map is not a function
```

Correct — destructure `{ data }`:

```tsx
const { data: todos } = useLiveQuery({
  query: (q) => q.from({ todo: todoCollection }),
})
return todos.map((t) => <li key={t.id}>{t.text}</li>)
```

`useLiveQuery` returns an object with `data`, `isLoading`, `status`, and other fields. For queries that can be disabled, use `{ data: todos = [] }` to handle `data` being `undefined`.

### CRITICAL Using opaque query logic without queryKey

Wrong:

```tsx
const { data } = useLiveQuery({
  query: (q) =>
    q.from({ todo: todoCollection }).fn.where(({ todo }) => {
      return fuzzyMatch(todo.title, search)
    }),
})
```

Correct:

```tsx
const { data } = useLiveQuery({
  queryKey: [todoCollection.id, 'search', search],
  query: (q) =>
    q.from({ todo: todoCollection }).fn.where(({ todo }) => {
      return fuzzyMatch(todo.title, search)
    }),
})
```

Structured expressions are hashable by default. Functional query variants are
opaque runtime code, so they need an explicit key to say when identity changes.

Source: docs/framework/react/overview.md

### HIGH useLiveSuspenseQuery without Error Boundary

Wrong:

```tsx
<Suspense fallback={<div>Loading...</div>}>
  <TodoList /> {/* uses useLiveSuspenseQuery */}
</Suspense>
```

Correct:

```tsx
<ErrorBoundary fallback={<div>Error</div>}>
  <Suspense fallback={<div>Loading...</div>}>
    <TodoList />
  </Suspense>
</ErrorBoundary>
```

`useLiveSuspenseQuery` throws errors during rendering. Without an Error Boundary, the entire app crashes.

Source: docs/guides/live-queries.md

### HIGH "Not a Collection" error from duplicate @tanstack/db

If a query-builder alias throws
`InvalidSourceError: The value provided for alias "todo" is not a Collection`,
it can mean two copies of `@tanstack/db` are installed. Direct
`useLiveQuery(preCreatedCollection)` detection is structural and works across
package copies or realms, but `q.from({ todo: collection })` still validates
the source with the core collection class.

In dev mode, TanStack DB also throws `DuplicateDbInstanceError` if two instances are detected.

**Diagnose:**

```bash
pnpm ls @tanstack/db
```

If multiple versions appear, fix with one of:

**pnpm overrides** (in root package.json):

```json
{
  "pnpm": {
    "overrides": {
      "@tanstack/db": "^0.6.17"
    }
  }
}
```

**Vite resolve.alias** (in vite.config.ts):

```ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@tanstack/db': path.resolve('./node_modules/@tanstack/db'),
    },
  },
})
```

The root cause is typically a dependency that bundles its own copy instead of declaring `@tanstack/db` as a `peerDependency`.

### HIGH Tension: Query expressiveness vs. IVM constraints

The query builder looks like SQL but has constraints that SQL doesn't — equality joins only, orderBy required for limit/offset, no distinct without select. Agents write SQL-style queries that violate these constraints. See ./tanstack-db-core-live-queries-ec3edb95.md#source-tanstack-db-core-live-queries § Common Mistakes for all constraints.

See also: ./tanstack-db-core-live-queries-ec3edb95.md#source-tanstack-db-core-live-queries — for query builder API and all operators.

See also: ./tanstack-db-core-mutations-optimistic-9abd33bd.md#source-tanstack-db-core-mutations-optimistic — for mutation patterns.

See also: ./tanstack-db-meta-framework-69f8ef80.md#source-tanstack-db-meta-framework — for preloading in route loaders.
