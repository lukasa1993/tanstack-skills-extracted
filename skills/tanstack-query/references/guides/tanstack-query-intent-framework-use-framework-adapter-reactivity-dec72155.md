# Use Framework Adapter Reactivity

<a id="source-tanstack-query-intent-framework-use-framework-adapter-reactivity"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../frameworks-ui.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Setup Query Client And Providers](./tanstack-query-intent-lifecycle-setup-query-client-and-providers-72d53007.md).
Prerequisite: [Design Query Keys And Options](./tanstack-query-intent-core-design-query-keys-and-options-c4c8f493.md).

This skill builds on `lifecycle/setup-query-client-and-providers` and `core/design-query-keys-and-options`.

## Setup

```ts
import { queryOptions } from '@tanstack/react-query'

export function todoOptions(id: string) {
  return queryOptions({
    queryKey: ['todo', id],
    queryFn: async () => ({ id }),
  })
}
```

## Hooks and Components

### Keep Vue refs in the key

```ts
import { computed, toRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'

export function useTodo(props: { id: string }) {
  const id = toRef(props, 'id')
  return useQuery(
    computed(() => ({
      queryKey: ['todo', id.value],
      queryFn: async () => ({ id: id.value }),
    })),
  )
}
```

### Use Solid option functions

```ts
import { createQuery } from '@tanstack/solid-query'

export function useTodo(id: () => string) {
  return createQuery(() => ({
    queryKey: ['todo', id()],
    queryFn: async () => ({ id: id() }),
  }))
}
```

### Convert Angular Observable clients to promises

```ts
import { injectQuery } from '@tanstack/angular-query-experimental'
import { firstValueFrom, of } from 'rxjs'

export class TodosQuery {
  todos = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => firstValueFrom(of([{ id: 1 }])),
  }))
}
```

## Common Mistakes

### HIGH Vue ref unwrapped

Wrong:

```ts
import { useQuery } from '@tanstack/vue-query'

export function useTodo(id: { value: string }) {
  return useQuery({
    queryKey: ['todo', id.value],
    queryFn: async () => ({ id: id.value }),
  })
}
```

Correct:

```ts
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'

export function useTodo(id: { value: string }) {
  return useQuery(
    computed(() => ({
      queryKey: ['todo', id.value],
      queryFn: async () => ({ id: id.value }),
    })),
  )
}
```

Vue reactive inputs need to stay reactive through the options object or query key.

Source: TanStack/query:docs/framework/vue/reactivity.md

### HIGH Svelte store syntax in v6

Wrong:

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  const query = createQuery({ queryKey: ['todos'], queryFn: async () => [] })
</script>
```

Correct:

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  const query = createQuery(() => ({
    queryKey: ['todos'],
    queryFn: async () => [],
  }))
</script>
```

Svelte Query v6 uses rune-compatible option functions rather than the older store shape.

Source: TanStack/query:docs/framework/svelte/migrate-from-v5-to-v6.md

### HIGH Angular Observable returned directly

Wrong:

```ts
import { injectQuery } from '@tanstack/angular-query-experimental'
import { of } from 'rxjs'

export class TodosQuery {
  todos = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => of([{ id: 1 }]),
  }))
}
```

Correct:

```ts
import { injectQuery } from '@tanstack/angular-query-experimental'
import { firstValueFrom, of } from 'rxjs'

export class TodosQuery {
  todos = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => firstValueFrom(of([{ id: 1 }])),
  }))
}
```

Query functions must resolve data; Angular HttpClient Observables need conversion to promises.

Source: TanStack/query:docs/framework/angular/angular-httpclient-and-other-data-fetching-clients.md

See also: `core/design-query-keys-and-options` for key identity across adapters.
