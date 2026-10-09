# Getting Started

<a id="source-tanstack-svelte-table-getting-started"></a>

Published skill · `@tanstack/svelte-table@9.2.8`.

[Topic index](../framework-svelte.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).

# Svelte Table setup and integration

Before starting, run `intent load @tanstack/table-core#core` for the shared headless model and stable-input rules.

## Setup

Keep features and columns outside reactive work; expose changing rune values through getters.

```svelte
<script lang="ts">
  import {
    createTable,
    FlexRender,
    tableFeatures,
  } from '@tanstack/svelte-table'

  type Person = { firstName: string; age: number }
  const features = tableFeatures({})
  const columns = [
    { accessorKey: 'firstName', header: 'First name' },
    { accessorKey: 'age', header: 'Age' },
  ]
  let data = $state<Person[]>([{ firstName: 'Ada', age: 36 }])

  const table = createTable({
    features,
    columns,
    get data() {
      return data
    },
  })
</script>

<table>
  <thead>
    {#each table.getHeaderGroups() as group (group.id)}
      <tr
        >{#each group.headers as header (header.id)}<th
            >{#if !header.isPlaceholder}<FlexRender {header} />{/if}</th
          >{/each}</tr
      >
    {/each}
  </thead>
  <tbody>
    {#each table.getRowModel().rows as row (row.id)}
      <tr
        >{#each row.getAllCells() as cell (cell.id)}<td
            ><FlexRender {cell} /></td
          >{/each}</tr
      >
    {/each}
  </tbody>
</table>
```

## Essential constraints

V9 requires Svelte 5 and `createTable`. Expose changing runes through getters; `data` captured once cannot follow reassignment. Keep features and columns outside reactive work and use `$derived` for transformed arrays.

Table owns models and state. The application owns markup, CSS, interactions, and accessibility. Core-only tables use `row.getAllCells()`; visibility-aware methods need `columnVisibilityFeature`. Optional state and APIs require their features. Put row-model slots after their prerequisite features in `tableFeatures()`.

## Load by task

- For repeated features, defaults, typed contexts, or component registries, read [reusable app hooks](../assets/tanstack-svelte-table-getting-started/references/create-table-hook.md).
- For Query-backed data, server pages, sorting, filtering, or request keys, read [TanStack Query integration](../assets/tanstack-svelte-table-getting-started/references/with-tanstack-query.md).
- For virtual rows, columns, dynamic measurement, or infinite scrolling, read [TanStack Virtual integration](../assets/tanstack-svelte-table-getting-started/references/with-tanstack-virtual.md).
- For controlled state, tracked reads, or render subscriptions, read [table state](./tanstack-svelte-table-table-state-fe47e547.md#source-tanstack-svelte-table-table-state).
- For feature registration, missing feature APIs, or processing ownership, run `intent load @tanstack/table-core#table-features` and read only references needed by the task.
- For v8 code, read the [migration checklist](./tanstack-svelte-table-migrate-v8-to-v9-45336202.md#source-tanstack-svelte-table-migrate-v8-to-v9).

## API discovery

Inspect `node_modules/@tanstack/svelte-table/dist/index.d.ts`, then the exported adapter declarations for the installed version. Inspect optional core APIs under `node_modules/@tanstack/table-core/dist/features/`.
