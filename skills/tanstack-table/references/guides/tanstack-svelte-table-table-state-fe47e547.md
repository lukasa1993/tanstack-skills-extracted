# Table State

<a id="source-tanstack-svelte-table-table-state"></a>

Published skill · `@tanstack/svelte-table@9.2.8`.

[Topic index](../framework-svelte.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Table State](./tanstack-table-core-table-state-2001cb1f.md).

# Svelte table state

Before starting, run `intent load @tanstack/table-core#table-state` for shared ownership, initialization, updates, and resets.

## Read reactive state

In Svelte 5, `table.atoms.<slice>.get()`, `table.store.get()`, and Table API reads track dependencies inside templates, `$derived`, `$derived.by`, or `$effect`. Outside those contexts they return snapshots. Prefer a slice read; a whole-store read reruns for every registered state change.

`createTable` and `createAppTable` take only options. There is no selected `table.state`, `subscribeTable`, or `SubscribeSource`. Use native `$derived` projections.

## Control a slice

Keep features and columns stable. Expose changing data and controlled runes through getters, and resolve both forms of `Updater`:

```svelte
<script lang="ts">
  import {
    createTable,
    rowPaginationFeature,
    tableFeatures,
    type PaginationState,
  } from '@tanstack/svelte-table'

  const features = tableFeatures({ rowPaginationFeature })
  const columns = [{ accessorKey: 'name' }]
  let data = $state([{ name: 'Ada' }])
  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const table = createTable({
    features,
    columns,
    get data() {
      return data
    },
    state: {
      get pagination() {
        return pagination
      },
    },
    onPaginationChange: (next) => {
      pagination = typeof next === 'function' ? next(pagination) : next
    },
  })
  const pageSize = $derived(table.atoms.pagination.get().pageSize)
</script>

<button onclick={() => table.setPageSize(50)}>{pageSize} rows per page</button>
```

`createTableState` provides an updater-compatible getter/setter pair when repeating this wiring. For raw external atoms consumed outside table UI, use `useSelector` from `@tanstack/svelte-store`; table UI uses the rune-aware `table.atoms` wrappers.

For `createTableState`, external atoms, broad invalidation, or a page index overwritten by automatic reset, read [reactivity details](../assets/tanstack-svelte-table-table-state/references/reactivity.md). For changes to pagination processing or reset policy, run `intent load @tanstack/table-core#table-features` and read its pagination reference.

## API discovery

Inspect `node_modules/@tanstack/svelte-table/dist/createTable.svelte.d.ts`, `createTableState.svelte.d.ts`, and `createTableHook.svelte.d.ts` for the installed contracts.
