# Build Query Abstractions

<a id="source-tanstack-query-intent-core-build-query-abstractions"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Design Query Keys And Options](./tanstack-query-intent-core-design-query-keys-and-options-c4c8f493.md).

## Core Patterns

Prefer a `queryOptions` factory as the base abstraction. Hooks, loaders, prefetches, suspense queries, and `QueryClient` calls can all consume it.

```ts
import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query'

export function invoiceOptions(id: number) {
  return queryOptions({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
    staleTime: 60_000,
  })
}

export function useInvoice(id: number) {
  return useQuery(invoiceOptions(id))
}

export function useSuspenseInvoice(id: number) {
  return useSuspenseQuery(invoiceOptions(id))
}
```

Compose one-off options at the usage site:

```ts
const invoice = useQuery({
  ...invoiceOptions(id),
  select: (data) => data.createdAt,
  throwOnError: true,
})
```

## Common Mistakes

### HIGH Custom hook is the only abstraction

Wrong:

```ts
export function useInvoice(id: number) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
  })
}
```

Correct:

```ts
export function invoiceOptions(id: number) {
  return queryOptions({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
  })
}

export function useInvoice(id: number) {
  return useQuery(invoiceOptions(id))
}
```

Custom hooks cannot run in route loaders, server prefetches, or event handlers. Options factories can.

Source: https://tkdodo.eu/blog/creating-query-abstractions

### HIGH Wide UseQueryOptions wrapper breaks inference

Wrong:

```ts
function useInvoice(id: number, options?: Partial<UseQueryOptions<Invoice>>) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
    ...options,
  })
}
```

Correct:

```ts
useQuery({
  ...invoiceOptions(id),
  select: (invoice) => invoice.createdAt,
})
```

Let `queryOptions` and usage-site composition preserve `select` inference.

Source: https://tkdodo.eu/blog/creating-query-abstractions

### MEDIUM Wrapper hides Query result state

Wrong:

```ts
export function useInvoice(id: number) {
  const { data } = useQuery(invoiceOptions(id))
  return data
}
```

Correct:

```ts
export function useInvoice(id: number) {
  return useQuery(invoiceOptions(id))
}
```

Keep the Query result surface available unless the abstraction owns every loading, error, and refetch behavior.

Source: TanStack/query:docs/framework/react/guides/queries.md
