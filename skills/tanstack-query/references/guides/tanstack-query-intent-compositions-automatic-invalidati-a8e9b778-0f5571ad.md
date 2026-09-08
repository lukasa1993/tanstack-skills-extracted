# Automatic Invalidation After Mutations

<a id="source-tanstack-query-intent-compositions-automatic-invalidati-a8e9b778"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../mutations.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Write Mutations And Invalidate Related Queries](./tanstack-query-intent-core-write-mutations-and-invalida-1820d5b8-d6860664.md).
Prerequisite: [Design Query Keys And Options](./tanstack-query-intent-core-design-query-keys-and-options-c4c8f493.md).

## Core Patterns

Use local mutation callbacks for one-off behavior. Use `MutationCache` callbacks when the app wants a consistent invalidation policy for every mutation.

### Global invalidation after successful mutations

```ts
import { MutationCache, QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      return queryClient.invalidateQueries({
        queryKey: mutation.options.mutationKey,
      })
    },
  }),
})
```

If a mutation has `mutationKey: ['issues']`, this invalidates matching issue queries. If it has no mutation key, this becomes a broad invalidation policy, so only use that deliberately.

### Use meta for explicit invalidation tags

```ts
import { matchQuery, MutationCache, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          mutation.meta?.invalidates?.some((queryKey) =>
            matchQuery({ queryKey }, query),
          ) ?? true,
      })
    },
  }),
})
```

## Common Mistakes

### HIGH Invalidating the whole app for every mutation

Wrong:

```ts
new MutationCache({
  onSuccess: () => queryClient.invalidateQueries(),
})
```

Correct:

```ts
new MutationCache({
  onSuccess: (_data, _variables, _context, mutation) =>
    queryClient.invalidateQueries({ queryKey: mutation.options.mutationKey }),
})
```

Global policies need scope. Reach for mutation keys or meta tags before invalidating everything.

Source: https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations

### HIGH Not returning invalidation when pending UI depends on refetch

Wrong:

```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['todos'] })
}
```

Correct:

```ts
onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
```

Returning the promise keeps the mutation pending until the invalidation refetch completes.

Source: TanStack/query:docs/framework/react/guides/invalidations-from-mutations.md

### MEDIUM Refetching data that should be static

Wrong:

```ts
useQuery({
  queryKey: ['build-info'],
  queryFn: fetchBuildInfo,
  staleTime: Infinity,
})
```

Correct:

```ts
useQuery({
  queryKey: ['build-info'],
  queryFn: fetchBuildInfo,
  staleTime: 'static',
})
```

If a query must not refetch even after broad manual invalidation, mark it with `staleTime: 'static'`.

Source: https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations
