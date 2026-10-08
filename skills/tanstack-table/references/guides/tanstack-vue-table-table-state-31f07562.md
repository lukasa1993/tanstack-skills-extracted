# Table State

<a id="source-tanstack-vue-table-table-state"></a>

Published skill · `@tanstack/vue-table@9.2.7`.

[Topic index](../framework-vue.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Table State](./tanstack-table-core-table-state-2001cb1f.md).

# Vue table state

Before starting, run `intent load @tanstack/table-core#table-state` for shared ownership, initialization, updates, and resets.

## Read reactive state

Vue-backed atom reads track dependencies inside templates, `computed`, `watch`, or a render boundary. `const page = table.atoms.pagination.get()` outside tracking captures a snapshot. Keep reactive option inputs as refs, computed values, or getters; passing `.value` once breaks later synchronization.

`table.Subscribe` is deprecated. Read table APIs or atoms directly inside templates, render functions, computed getters, or watcher sources. Use a child component when reads need a separate component render boundary.

## Control a slice

Keep features and columns stable. Preserve both the reactive value and its matching callback:

```ts
import { computed, ref } from 'vue'
import {
  rowPaginationFeature,
  tableFeatures,
  useTable,
  type PaginationState,
  type Updater,
} from '@tanstack/vue-table'

const features = tableFeatures({ rowPaginationFeature })
const columns = [{ accessorKey: 'name' }]
const data = ref([{ name: 'Ada' }])
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 20 })
const state = computed(() => ({ pagination: pagination.value }))
const table = useTable({
  features,
  columns,
  data,
  state,
  onPaginationChange: (next: Updater<PaginationState>) => {
    pagination.value =
      typeof next === 'function' ? next(pagination.value) : next
  },
})
const pageSize = computed(() => table.atoms.pagination.get().pageSize)
```

Assign the resolved updater result to the ref. For shared atom ownership, use a stable `@tanstack/vue-store` atom in `atoms.<slice>` instead of mirroring the same slice in controlled refs.

For computed-state synchronization failures, updater mistakes, or render boundaries, read [reactivity details](../assets/tanstack-vue-table-table-state/references/reactivity.md). If this task changes processing features, run `intent load @tanstack/table-core#table-features` and read the relevant feature references.

## API discovery

Inspect `node_modules/@tanstack/vue-table/dist/useTable.d.ts` and `reactivity.d.ts`; inspect the matching core feature declarations for the controlled slice.
