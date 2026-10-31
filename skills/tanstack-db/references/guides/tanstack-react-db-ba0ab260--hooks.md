# React Db — Hooks

[Guide and prerequisites](./tanstack-react-db-ba0ab260.md) · Published skill · `@tanstack/react-db@1.0.0-rc.1.1`.

## Hooks

### useLiveQuery

```tsx
// Preferred config object with derived query identity
const {
  data,
  state,
  collection,
  status,
  isLoading,
  isReady,
  isLoadingError, // the first load failed: nothing to show
  isCrashed, // status 'crashed': local storage broke
  isIdle,
  isCleanedUp,
  isSyncError, // data is shown, but a sync problem is in health
  health, // health tree: one node for the query and one per source
} = useLiveQuery({
  query: (q) =>
    q
      .from({ todo: todoCollection })
      .where(({ todo }) => eq(todo.userId, userId)),
})

// Static query
const { data } = useLiveQuery({
  query: (q) => q.from({ todo: todoCollection }),
  gcTime: 60000,
})

// Pre-created collection (from route loader)
const { data } = useLiveQuery(preloadedTodos)

// Conditional query — derived identity handles enabled/disabled transitions
const { data, status } = useLiveQuery({
  query: (q) => {
    if (!userId) return undefined
    return q
      .from({ todo: todoCollection })
      .where(({ todo }) => eq(todo.userId, userId))
  },
})
// When disabled: status='disabled', data=undefined
```

`isLoadingError` means the first load failed and there is nothing to show; offer `collection.reload()`. `isCrashed` means local storage broke; only `cleanup({ dependents: true })` and a fresh start recover. After the query is ready, sync problems never change `status`: read `isSyncError` or the `health` tree to show stale-data warnings. `isError` and node `phase` were removed.

Many queries of one shape, such as one per list row, can share one partition. Pass `pool: pooledLiveQueries` (from `@tanstack/db`) in the config form: `useLiveQuery({ query, pool: pooledLiveQueries })`. Pooling applies to queries that filter one eager source with `eq(field, literal)`. It is off by default, and Suspense and `DbClient` queries never pool.

### useLiveSuspenseQuery

```tsx
// data is ALWAYS defined — never undefined
// Must wrap in <Suspense> and <ErrorBoundary>
function TodoList() {
  const { data: todos } = useLiveSuspenseQuery({
    query: (q) => q.from({ todo: todoCollection }),
  })

  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.text}</li>
      ))}
    </ul>
  )
}

// Structured captured values are part of the derived identity and re-suspend when changed
const { data } = useLiveSuspenseQuery({
  query: (q) =>
    q
      .from({ todo: todoCollection })
      .where(({ todo }) => eq(todo.category, category)),
})
```

### useLiveInfiniteQuery

```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useLiveInfiniteQuery(
    (q) =>
      q
        .from({ posts: postsCollection })
        .where(({ posts }) => eq(posts.category, category))
        .orderBy(({ posts }) => posts.createdAt, 'desc'),
    {
      pageSize: 20,
    },
  )

// data is the flat array of all loaded pages
// fetchNextPage() loads the next page
// hasNextPage is true when more data is available
```

### usePacedMutations

```tsx
import { usePacedMutations, debounceStrategy } from "@tanstack/react-db"

const mutate = usePacedMutations({
  onMutate: (value: string) => {
    noteCollection.update(noteId, (draft) => {
      draft.content = value
    })
  },
  mutationFn: async ({ transaction }) => {
    await api.notes.update(noteId, transaction.mutations[0].changes)
  },
  strategy: debounceStrategy({ wait: 500 }),
})

// In handler:
<textarea onChange={(e) => mutate(e.target.value)} />
```
