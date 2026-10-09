# Table State

<a id="source-tanstack-alpine-table-table-state"></a>

Published skill · `@tanstack/alpine-table@9.2.8`.

[Topic index](../framework-alpine.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Table State](./tanstack-table-core-table-state-2001cb1f.md).

Load `intent load @tanstack/table-core#table-state` first for shared ownership, initialization, updater, and reset rules.

Alpine's table proxy makes reads inside `x-text`, `x-for`, `x-if`, bound attributes, `x-effect`, and Alpine getters reactive. Event handlers read the current value when invoked. A captured value outside a binding does not become a continuing subscription, and there is no `table.Subscribe` component.

## Controlled getter setup

<!-- skill-snippet:check -->

```ts
import Alpine from 'alpinejs'
import {
  createTable,
  rowPaginationFeature,
  tableFeatures,
  type PaginationState,
} from '@tanstack/alpine-table'

const features = tableFeatures({ rowPaginationFeature })
const columns = [{ accessorKey: 'name' }]
const data = [{ name: 'Ada' }]

Alpine.data('pagedTable', () => {
  const local = Alpine.reactive<{ pagination: PaginationState }>({
    pagination: { pageIndex: 0, pageSize: 10 },
  })
  const table = createTable({
    features,
    columns,
    data,
    state: {
      get pagination() {
        return local.pagination
      },
    },
    onPaginationChange: (next) => {
      local.pagination =
        typeof next === 'function' ? next(local.pagination) : next
    },
  })
  return { table }
})
```

Read `table.atoms.pagination.get().pageIndex` directly in an Alpine binding.

## Reactive boundaries

- A controlled slice needs a getter and callback. `state: { pagination: local.pagination }` captures the old object when the owner later replaces it.
- Expose changing data through `get data()` and keep features, columns, and derived data stable outside reevaluated getters.
- The proxy normally reevaluates all Table-reading bindings for every state change. A narrow atom read does not by itself narrow that broad invalidation.
- For shared state, pass a stable external atom through `atoms`; omit controlled state and its callback for the same slice.

## Read for the task

For advanced reactive boundaries, shared atoms, or detailed subscription examples, read [reactivity](../assets/tanstack-alpine-table-table-state/references/reactivity.md). For construction or rendering setup, read [getting-started](./tanstack-alpine-table-getting-started-37491f6a.md#source-tanstack-alpine-table-getting-started).

## API discovery

This section is an exact duplicate. Read [API discovery in Getting Started](./tanstack-alpine-table-getting-started-37491f6a.md).
