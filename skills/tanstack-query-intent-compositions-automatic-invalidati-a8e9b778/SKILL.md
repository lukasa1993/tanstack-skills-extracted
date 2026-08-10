---
name: tanstack-query-intent-compositions-automatic-invalidati-a8e9b778
description: "Use this when designing automatic invalidation policies for TanStack Query mutations with MutationCache callbacks, mutationKey-to-queryKey matching, mutation meta invalidation tags, awaited invalidation, and exclusions for static or unrelated queries."
license: "MIT"
metadata:
  tanstack-library: "TanStack Query"
  tanstack-library-version: "5.101.0"
  tanstack-package: "@tanstack/query-intent"
  tanstack-package-version: "5.101.0"
  tanstack-requires: "[\"tanstack-query-intent-core-write-mutations-and-invalida-1820d5b8\",\"tanstack-query-intent-core-design-query-keys-and-options\"]"
  tanstack-source-ref: "github:TanStack/query@bdfb2605d0c598a8446b612e715200829b035d49#packages/query-intent"
  tanstack-source-skill: "compositions/automatic-invalidation-after-mutations"
  tanstack-sources: "[\"https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations\",\"TanStack/query:docs/framework/react/guides/invalidations-from-mutations.md\",\"TanStack/query:docs/reference/MutationCache.md\",\"TanStack/query:docs/reference/QueryClient.md\"]"
  tanstack-type: "composition"
---

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
