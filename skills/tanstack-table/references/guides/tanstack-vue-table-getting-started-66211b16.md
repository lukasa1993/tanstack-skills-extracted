# Getting Started

<a id="source-tanstack-vue-table-getting-started"></a>

Published skill · `@tanstack/vue-table@9.2.7`.

[Topic index](../framework-vue.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).

# Vue Table setup and integration

Before starting, run `intent load @tanstack/table-core#core` for the shared headless model and stable-input rules.

## Setup

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FlexRender, tableFeatures, useTable } from '@tanstack/vue-table'

type Person = { name: string; age: number }
const features = tableFeatures({})
const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
]
const data = ref<Person[]>([{ name: 'Ada', age: 36 }])
const table = useTable({ features, columns, data })
</script>

<template>
  <table>
    <thead>
      <tr v-for="group in table.getHeaderGroups()" :key="group.id">
        <th v-for="header in group.headers" :key="header.id">
          <FlexRender v-if="!header.isPlaceholder" :header="header" />
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in table.getRowModel().rows" :key="row.id">
        <td v-for="cell in row.getAllCells()" :key="cell.id">
          <FlexRender :cell="cell" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

## Essential constraints

Use `useTable` with a ref, computed value, or reactive getter for changing data. Passing `data.value` captures one array and loses later updates. Keep static features and columns stable; derive transformed arrays with `computed`.

Table owns models and state. The application owns markup, CSS, interactions, and accessibility. Core-only tables use `row.getAllCells()`; visibility-aware methods need `columnVisibilityFeature`. Optional state and APIs require their features. Put row-model slots after their prerequisite features in `tableFeatures()`.

## Load by task

- For repeated features, defaults, typed contexts, or component registries, read [reusable app hooks](../assets/tanstack-vue-table-getting-started/references/create-table-hook.md).
- For Query-backed data, server pages, sorting, filtering, or request keys, read [TanStack Query integration](../assets/tanstack-vue-table-getting-started/references/with-tanstack-query.md).
- For virtual rows, columns, dynamic measurement, or infinite scrolling, read [TanStack Virtual integration](../assets/tanstack-vue-table-getting-started/references/with-tanstack-virtual.md).
- For controlled state, tracked reads, or render subscriptions, read [table state](./tanstack-vue-table-table-state-31f07562.md#source-tanstack-vue-table-table-state).
- For feature registration, missing feature APIs, or processing ownership, run `intent load @tanstack/table-core#table-features` and read only references needed by the task.
- For v8 code, read the [migration checklist](./tanstack-vue-table-migrate-v8-to-v9-1c6bee18.md#source-tanstack-vue-table-migrate-v8-to-v9).

## API discovery

Inspect `node_modules/@tanstack/vue-table/dist/index.d.ts`, then the exported adapter declarations for the installed version. Inspect optional core APIs under `node_modules/@tanstack/table-core/dist/features/`.
