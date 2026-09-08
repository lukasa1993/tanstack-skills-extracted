# Enforce Query Best Practices With Eslint

<a id="source-tanstack-query-intent-compositions-enforce-query-best-p-48bbbabb"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../quality.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Design Query Keys And Options](./tanstack-query-intent-core-design-query-keys-and-options-c4c8f493.md).
Prerequisite: [Fetch And Observe Queries](./tanstack-query-intent-core-fetch-and-observe-queries-d2520b98.md).
Prerequisite: [Shape Data And Render Efficiently](./tanstack-query-intent-framework-shape-data-and-render-e-feb144a6-276ce42a.md).

## Setup

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [...pluginQuery.configs['flat/recommended']]
```

## Core Integration Patterns

### Use strict when generating Query-heavy code

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [...pluginQuery.configs['flat/recommended-strict']]
```

### Prefer option factories

```ts
import { queryOptions, useQuery } from '@tanstack/react-query'

const todosOptions = queryOptions({
  queryKey: ['todos'],
  queryFn: async () => [{ id: 1 }],
})

export function useTodos() {
  return useQuery(todosOptions)
}
```

### Keep inference-sensitive property order

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => ({ nextCursor: pageParam + 1 }),
    initialPageParam: 0,
    getNextPageParam: (page) => page.nextCursor,
  })
}
```

## Common Mistakes

### MEDIUM Strict rule not enabled

Wrong:

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [...pluginQuery.configs['flat/recommended']]
```

Correct:

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [...pluginQuery.configs['flat/recommended-strict']]
```

Strict mode catches option-factory and inference patterns that agents commonly miss.

Source: TanStack/query:docs/eslint/eslint-plugin-query.md

### MEDIUM Infinite option property order

Wrong:

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useFeed() {
  return useInfiniteQuery({
    queryFn: async () => ({ nextCursor: 1 }),
    queryKey: ['feed'],
    getNextPageParam: (page) => page.nextCursor,
    initialPageParam: 0,
  })
}
```

Correct:

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => ({ nextCursor: pageParam + 1 }),
    initialPageParam: 0,
    getNextPageParam: (page) => page.nextCursor,
  })
}
```

Some infinite-query inference depends on stable option ordering.

Source: TanStack/query:docs/eslint/infinite-query-property-order.md

### MEDIUM Mutation option property order

Wrong:

```ts
import { useMutation } from '@tanstack/react-query'

export function useSave() {
  return useMutation({
    onSuccess: () => console.log('saved'),
    mutationFn: async (title: string) => title,
  })
}
```

Correct:

```ts
import { useMutation } from '@tanstack/react-query'

export function useSave() {
  return useMutation({
    mutationFn: async (title: string) => title,
    onSuccess: () => console.log('saved'),
  })
}
```

The mutation property order rule preserves inference for mutation options.

Source: TanStack/query:docs/eslint/mutation-property-order.md

See also: `core/design-query-keys-and-options` for the patterns these rules protect.
