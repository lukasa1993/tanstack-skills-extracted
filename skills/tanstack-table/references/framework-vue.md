# Vue adapter

Vue Table adapter guidance.

<a id="source-tanstack-vue-table-create-table-hook"></a>

## Create Table Hook

Source: `tanstack-vue-table-create-table-hook`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Use it for recurring app conventions; use `useTable` for a one-off.

### Setup

```ts
import {
  createTableHook,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/vue-table'
import type { RowData, VueTable } from '@tanstack/vue-table'

const features = tableFeatures({ rowSortingFeature })
const hook = createTableHook({ features })
export const useAppTable = hook.useAppTable
export const createAppColumnHelper = hook.createAppColumnHelper
export const useTableContext: <TData extends RowData = RowData>() => VueTable<
  typeof features,
  TData
> = hook.useTableContext
```

The explicit exported context-hook types are important when registered components import the hook module that also imports those components.

### Core Patterns

#### Keep per-table values reactive

```ts
const helper = createAppColumnHelper<Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
const table = useAppTable({ columns, data })
```

Pass refs/computed options through unchanged.

#### Wrap registered component context

Render through `table.AppTable`, `table.AppCell`, or `table.AppHeader`; inside registered components call the corresponding typed context hook instead of prop drilling.

### Common Mistakes

#### HIGH Creating circular inferred exports

Wrong:

```ts
export const { useAppTable, useTableContext } = createTableHook({
  tableComponents: { Pager },
})
```

Correct:

```ts
const hook = createTableHook({ tableComponents: { Pager } })
export const useTableContext: <TData extends RowData = RowData>() => VueTable<
  typeof features,
  TData
> = hook.useTableContext
```

When `Pager` imports `useTableContext`, inferred destructured exports can form a circular inference/import chain.

Source: `docs/framework/vue/guide/composable-tables.md`

#### HIGH Flattening reactive table options

Wrong:

```ts
useAppTable({ columns, data: data.value })
```

Correct:

```ts
useAppTable({ columns, data })
```

The app hook preserves the adapter’s `MaybeRef` option contract.

Source: `packages/vue-table/src/createTableHook.ts`

#### HIGH Using context without App wrappers

Wrong:

```ts
const table = useTableContext()
```

Correct:

```vue
<component :is="table.AppTable"><Pager /></component>
```

The typed context exists only below the corresponding dynamic wrapper.

Source: `packages/vue-table/src/createTableHook.ts`

#### MEDIUM Treating Subscribe children as slots

Wrong:

```tsx
<table.Subscribe>
  {(atoms) => <Pager page={atoms.pagination.get()} />}
</table.Subscribe>
```

Correct:

```tsx
<table.Subscribe
  children={(atoms) => <Pager page={atoms.pagination.get()} />}
/>
```

Vue’s adapter expects an explicit `children` prop in JSX.

Source: `packages/vue-table/src/useTable.ts`

### API Discovery

Inspect `node_modules/@tanstack/vue-table/dist/createTableHook.d.ts` for the returned helpers, wrapper props, registry types, and context contracts.

<a id="source-tanstack-vue-table-devtools"></a>

## Devtools

Source: `tanstack-vue-table-devtools`.

This skill builds on @tanstack/table-core#core and @tanstack/table-devtools#devtools.

### Setup

```vue
<script setup lang="ts">
import { useTable, tableFeatures } from '@tanstack/vue-table'
import { useTanStackTableDevtools } from '@tanstack/vue-table-devtools'

const table = useTable({
  key: 'users-table',
  features: tableFeatures({}),
  columns: [],
  data: [],
})

useTanStackTableDevtools(table)
</script>

<template><div>Users table registered</div></template>
```

Mount the Vue TanStackDevtools host once with `tableDevtoolsPlugin({})`, following `docs/devtools.md`.

### Hooks and Components

The hook accepts a table or ref-like table and tracks replacement. Keep that reactive wrapper intact rather than unwrapping once.

### Common Mistakes

#### HIGH Ref unwrapped before registration

Wrong: read a ref once and register only that snapshot.

Correct: pass the ref/maybe-ref shape accepted by the hook.

The adapter watches the resolved table and cleans up when it changes.

Source: TanStack/table:packages/vue-table-devtools/src/useTanStackTableDevtools.ts

#### HIGH Missing or duplicate key

Wrong: omit `key` or reuse a key across mounted tables.

Correct: use one descriptive stable key for each target.

The registry skips keyless tables and replaces duplicate targets.

Source: TanStack/table:packages/table-devtools/src/tableTarget.ts

#### MEDIUM Development gate mistaken for broken plugin

Wrong: expect the default panel/plugin/hook in production.

Correct: keep normal Devtools development-only unless explicitly importing `/production`.

The package index selects no-op exports outside development.

Source: TanStack/table:packages/vue-table-devtools/src/index.ts

### API Discovery

Inspect `node_modules/@tanstack/vue-table-devtools/dist/index.d.ts` and `useTanStackTableDevtools.d.ts` for current ref handling.

<a id="source-tanstack-vue-table-getting-started"></a>

## Getting Started

Source: `tanstack-vue-table-getting-started`.

This skill builds on `@tanstack/table-core#core` and `@tanstack/table-core#table-features`. Read them first for the headless model and explicit feature registration.

### Setup

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

### Core Patterns

#### Preserve Vue option shapes

`useTable` accepts refs/computed values and unwraps them while watching dependencies. Keep `data`, controlled state, and other reactive options as refs or computed values; keep static columns/features stable.

#### Add a client row model explicitly

```ts
import {
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from '@tanstack/vue-table'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})
```

The slot follows its prerequisite feature in the same call. Import individual `sortFn_*` built-ins and register only the ones your columns reference; the full `sortFns` registry object still works but bundles every built-in.

### Common Mistakes

#### HIGH Flattening a ref into a snapshot

Wrong:

```ts
const table = useTable({ features, columns, data: data.value })
```

Correct:

```ts
const table = useTable({ features, columns, data })
```

Passing `.value` captures one array instead of letting the adapter watch the ref.

Source: `packages/vue-table/src/useTable.ts`

#### HIGH Using the v8 entrypoint

Wrong:

```ts
const table = useVueTable({ data, columns, getCoreRowModel: getCoreRowModel() })
```

Correct:

```ts
const table = useTable({ features, columns, data })
```

V9 uses `useTable`; core processing is automatic and optional row models live in `tableFeatures`.

Source: `docs/framework/vue/guide/migrating.md`

#### HIGH Assuming headless means prebuilt UI

Wrong:

```vue
<TanStackTable :table="table" />
```

Correct:

```vue
<td
  v-for="cell in row.getAllCells()"
  :key="cell.id"
><FlexRender :cell="cell" /></td>
```

The adapter renders definitions but owns no table component, CSS, or design-system integration.

Source: `examples/vue/basic-use-table/src/App.tsx`

### API Discovery

Inspect `node_modules/@tanstack/vue-table/dist/index.d.ts`, then `useTable.d.ts` and `FlexRender.d.ts`. Inspect core feature APIs in `node_modules/@tanstack/table-core/dist/features/<feature>/`.

<a id="source-tanstack-vue-table-migrate-v8-to-v9"></a>

## Migrate V8 To V9

Source: `tanstack-vue-table-migrate-v8-to-v9`.

Use this as the complete breaking-change checklist. V9 is the current API; do not stop after renaming the Vue composable.

Framework prerequisite: Vue 3.2 or newer (`vue >=3.2`).

### Recommended Migration Order

1. Replace `useVueTable` with `useTable` while preserving reactive inputs.
2. Define explicit features, then move row models and registries into `tableFeatures`.
3. Update state reads, controlled ownership, and rendering.
4. Apply every shared API and type rename below.
5. Use `stockFeatures` only as a temporary audit bridge; explicit features are the production target.

```ts
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})
const data = ref(makeData())
const table = useTable({ features, columns, data })
```

### Construction and Feature Registration

| v8                                           | v9                                                         |
| -------------------------------------------- | ---------------------------------------------------------- |
| `useVueTable(options)`                       | `useTable(options)`                                        |
| All features bundled                         | Required `features: tableFeatures({...})`                  |
| `getCoreRowModel()` option                   | Remove; core row model is automatic                        |
| `get*RowModel()` table options               | `create*RowModel()` slots in `tableFeatures`               |
| `sortingFns` table option                    | `sortFns` feature slot                                     |
| `filterFns` / `aggregationFns` table options | Same-named feature slots                                   |
| Top-level `onStateChange`                    | Per-slice callbacks, external atoms, or store subscription |

Available feature imports are `cellSelectionFeature`, `columnFilteringFeature`, `globalFilteringFeature`, `rowSortingFeature`, `rowPaginationFeature`, `rowSelectionFeature`, `rowExpandingFeature`, `rowPinningFeature`, `columnPinningFeature`, `columnVisibilityFeature`, `columnOrderingFeature`, `columnSizingFeature`, `columnResizingFeature`, `rowAggregationFeature`, `columnGroupingFeature`, and `columnFacetingFeature`. APIs are feature-gated. Put every feature before its dependent slot in the same `tableFeatures` call. Aggregation is independent from grouping: register `rowAggregationFeature` for aggregation APIs and add `columnGroupingFeature` only for grouped rows.

#### Row-model mapping

| v8 option                  | v9 slot and factory                                                 |
| -------------------------- | ------------------------------------------------------------------- |
| `getFilteredRowModel()`    | `filteredRowModel: createFilteredRowModel()` after column filtering |
| `getSortedRowModel()`      | `sortedRowModel: createSortedRowModel()` after row sorting          |
| `getPaginationRowModel()`  | `paginatedRowModel: createPaginatedRowModel()` after pagination     |
| `getExpandedRowModel()`    | `expandedRowModel: createExpandedRowModel()` after expanding        |
| `getGroupedRowModel()`     | `groupedRowModel: createGroupedRowModel()` after grouping           |
| `getFacetedRowModel()`     | `facetedRowModel: createFacetedRowModel()` after faceting           |
| `getFacetedMinMaxValues()` | `facetedMinMaxValues: createFacetedMinMaxValues()`                  |
| `getFacetedUniqueValues()` | `facetedUniqueValues: createFacetedUniqueValues()`                  |

Factories take no arguments. Register `filterFns`, `sortFns`, and `aggregationFns` as sibling feature slots holding individually imported built-ins (`filterFn_includesString`, `sortFn_alphanumeric`, `aggregationFn_sum`) under their conventional keys. The full registry objects still work but bundle every built-in.

### Vue State Migration

- Pass a `ref` or `computed` as `data`; the adapter unwraps and syncs it. Do not pass `data.value`, which is only a snapshot. A getter returning `data.value` is also supported.
- `table.getState().sorting` becomes the narrow `table.atoms.sorting.get()`. Use `table.store.get()` only for a full snapshot/debug output.
- Wrap atom reads in Vue `computed` when deriving template values.
- In JSX/render functions, `table.Subscribe` provides a fine-grained boundary. Pass the callback as the explicit `children` prop because Vue JSX element children become slots.
- Controlled refs need getter-backed state slices plus per-slice callbacks that resolve value-or-function `Updater`s.
- The top-level `onStateChange` is removed. Use per-slice callbacks, external atoms, or `table.store.subscribe` to observe everything.
- External atoms come from `@tanstack/vue-store` and are supplied through `atoms`. Never provide both `atoms.pagination` and `state.pagination`.
- `table.baseAtoms` is internal writable state; prefer feature APIs or external atoms.

### Rendering and Composition

| v8                                                                               | v9 target                                                  |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `<FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />` | `<FlexRender :cell="cell" />`                              |
| Manual header/footer render props                                                | `<FlexRender :header="header" />` / `:footer="footer"`     |
| Repeated raw options                                                             | `tableOptions(...)` composition                            |
| Repeated table conventions                                                       | `createTableHook({ features, ... })` and pre-bound helpers |

The old `render`/`props` FlexRender shape still compiles, but shorthand is the migration target. `createTableHook` is optional and intended for application-wide conventions.

### Complete Shared Breaking-Change Map

#### Instance methods

Row, cell, column, header, and related methods now live on shared prototypes and use `this`. Call them on their instances. Do not destructure them, pass them bare, or expect them in object spread, `Object.keys`, or JSON. Table methods are not affected.

#### Logical column pinning

V9 has no `left`/`right` aliases.

| old                                                            | new                                                           |
| -------------------------------------------------------------- | ------------------------------------------------------------- |
| `columnPinning.left` / `.right`                                | `.start` / `.end`                                             |
| `column.pin('left' \| 'right')`                                | `column.pin('start' \| 'end')`                                |
| `getIsPinned() === 'left' \| 'right'`                          | `'start' \| 'end'`                                            |
| `row.getLeftVisibleCells()` / `getRightVisibleCells()`         | `getStartVisibleCells()` / `getEndVisibleCells()`             |
| `getLeftHeaderGroups()` / `getRightHeaderGroups()`             | `getStartHeaderGroups()` / `getEndHeaderGroups()`             |
| `getLeftFooterGroups()` / `getRightFooterGroups()`             | `getStartFooterGroups()` / `getEndFooterGroups()`             |
| `getLeftFlatHeaders()` / `getRightFlatHeaders()`               | `getStartFlatHeaders()` / `getEndFlatHeaders()`               |
| `getLeftLeafHeaders()` / `getRightLeafHeaders()`               | `getStartLeafHeaders()` / `getEndLeafHeaders()`               |
| `getLeftLeafColumns()` / `getRightLeafColumns()`               | `getStartLeafColumns()` / `getEndLeafColumns()`               |
| `getLeftVisibleLeafColumns()` / `getRightVisibleLeafColumns()` | `getStartVisibleLeafColumns()` / `getEndVisibleLeafColumns()` |
| `getLeftTotalSize()` / `getRightTotalSize()`                   | `getStartTotalSize()` / `getEndTotalSize()`                   |
| `column.getStart('left')`                                      | `column.getStart('start')`                                    |
| `column.getAfter('right')`                                     | `column.getAfter('end')`                                      |
| `column.getIndex('left' \| 'right')`                           | `column.getIndex('start' \| 'end')`                           |

Use CSS `inset-inline-start`/`inset-inline-end`; logical names do not automatically set DOM direction. `columnResizeDirection` is unchanged.

#### Pinning, sizing, and resizing

- `enablePinning` splits into `enableColumnPinning` and `enableRowPinning`.
- Interactive resizing requires `columnSizingFeature` plus `columnResizingFeature`; fixed sizing needs only the former.
- `columnSizingInfo` becomes `columnResizing`.
- `setColumnSizingInfo()` becomes `setColumnResizing()`.
- `onColumnSizingInfoChange` becomes `onColumnResizingChange`.

#### Sorting, rows, and selection

| v8                             | v9                            |
| ------------------------------ | ----------------------------- |
| `sortingFn`                    | `sortFn`                      |
| `sortingFns`                   | `sortFns`                     |
| `getSortingFn()`               | `getSortFn()`                 |
| `getAutoSortingFn()`           | `getAutoSortFn()`             |
| `SortingFn` / `SortingFns`     | `SortFn` / `SortFns`          |
| `row._getAllCellsByColumnId()` | `row.getAllCellsByColumnId()` |

Other `_`-prefixed internals are removed, including `_getPinnedRows`, `_getFacetedRowModel`, `_getFacetedMinMaxValues`, and `_getFacetedUniqueValues`.

`getIsSomeRowsSelected()` and `getIsSomePageRowsSelected()` now mean at least one, including all. Indeterminate UI must also check `!getIsAllRowsSelected()` or `!getIsAllPageRowsSelected()`.

### TypeScript Migration

- Add `TFeatures` first: `ColumnDef<typeof features, Person>`, `Column<typeof features, Person>`, `Row<typeof features, Person>`, `Table<typeof features, Person>`.
- Replace `createColumnHelper<Person>()` with `createColumnHelper<typeof features, Person>()`; use `columnHelper.columns([...])` for nested-array inference.
- Use `StockFeatures` when `stockFeatures` is the configuration.
- Existing `TableMeta`/`ColumnMeta` declaration merging must add `TFeatures` first. Prefer per-table `tableMeta`/`columnMeta: metaHelper<...>()` slots.
- Replace global `FilterFns`, `SortFns`, `AggregationFns`, and `FilterMeta` augmentation with registry slots and `filterMeta: metaHelper<...>()`; registered keys become valid strings in column defs.
- `RowData` is restricted to records or arrays; prefer explicit object row types.

### Common Migration Failures

#### HIGH: Renaming only the composable

`useTable({ getSortedRowModel: ... })` is still a v8 configuration. Move the row model and its prerequisite feature into `tableFeatures`.

#### HIGH: Unwrapping refs before useTable

Pass `data`, not `data.value`, or use a getter. Preserve the reactive source.

#### HIGH: Passing prototype methods bare

Use `row.getValue('name')`, not `const read = row.getValue`; shallow copies also lose methods.

#### MEDIUM: JSX children as slots

For `table.Subscribe`, use `children={(atoms) => ...}` explicitly.

### Final Checklist

- [ ] `useVueTable` is replaced with `useTable`; refs/computed inputs remain reactive.
- [ ] Features, row models, and registries are in `tableFeatures`; core row model is removed.
- [ ] State reads use atoms/computed or the store intentionally; `onStateChange` is removed.
- [ ] External atom and controlled state ownership do not overlap.
- [ ] FlexRender shorthand is adopted where applicable.
- [ ] Prototype methods, pinning, sizing/resizing, sorting, row, and selection changes are audited.
- [ ] Helpers, types, meta, registries, and `RowData` use v9 shapes.
- [ ] Temporary `stockFeatures` usage has an explicit removal plan.

### API Discovery

Inspect `node_modules/@tanstack/vue-table/dist/index.d.ts` and `useTable.d.ts`; verify feature slots and the exact installed v9 APIs in `node_modules/@tanstack/table-core/dist/`. Do not reconstruct v9 from v8 memory.

<a id="source-tanstack-vue-table-table-state"></a>

## Table State

Source: `tanstack-vue-table-table-state`.

This skill builds on `@tanstack/table-core#core` and `getting-started`. Read them first for state ownership and Vue construction.

### State Mental Model

TanStack Table is primarily a state coordinator. Keep state internal unless another system needs to read, persist, or drive it. Without `initialState`, `atoms`, `state`, or `on[State]Change`, the table owns every registered slice.

- `table.baseAtoms` are internal writable atoms created from resolved initial state.
- `table.atoms` are readonly derived atoms for the active owner of each registered slice.
- `table.store` combines those atoms into one readonly flat store.

The Vue adapter backs atoms with refs/computed values and tracks reactive table options. Atom reads become reactive inside templates, `computed`, `watch`, or `table.Subscribe`; a read cached outside tracking is only a snapshot. State is feature-based, so a missing pagination atom or option means `rowPaginationFeature` was not registered. Keep `features` and `columns` stable; pass reactive `data` as a ref/computed instead of recreating arrays in table options.

### Setup

```ts
import { computed, ref } from 'vue'
import {
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from '@tanstack/vue-table'

const features = tableFeatures({ rowPaginationFeature })
const data = ref([{ name: 'Ada' }])
const columns = [{ accessorKey: 'name' }]
const table = useTable({ features, columns, data })
const pageIndex = computed(() => table.atoms.pagination.get().pageIndex)
```

Internal state is usually enough. Atom reads are reactive only when Vue evaluates them in a tracked template, computed, watch, or render boundary.

### Core Patterns

#### Control a slice without losing updater semantics

```ts
import { computed, ref } from 'vue'
import type { PaginationState } from '@tanstack/vue-table'

const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 20 })
const controlledState = computed(() => ({ pagination: pagination.value }))
const onPaginationChange = (
  next: PaginationState | ((old: PaginationState) => PaginationState),
) => {
  pagination.value = typeof next === 'function' ? next(pagination.value) : next
}
```

Pass `state: controlledState` and `onPaginationChange` to `useTable`.

#### Use Subscribe as a render boundary

```tsx
table.Subscribe({
  children: (atoms) => <span>{atoms.pagination.get().pageIndex + 1}</span>,
})
```

In Vue JSX, `children` is an explicit prop, not a slot child.

### Choose State Ownership

Use exactly one owner per slice:

- Prefer internal state and feature methods for table-local behavior.
- Use `initialState` for starting/reset values; changing it later does not reset current state.
- Prefer a stable `@tanstack/vue-store` atom in `atoms` for cross-system ownership. Feature APIs update it directly, so omit `on[State]Change`.
- Use a ref/computed `state` value plus the matching callback for simple controlled state. Preserve the reactive wrapper and resolve raw values and updater functions.

External atoms take precedence over external `state`, which syncs into the internal base atom. Do not configure multiple owners. The global v8 `onStateChange` option is gone; observe `table.store` if all state changes matter.

### Initialize, Update, and Reset

Use feature methods such as `setSorting`, `nextPage`, `toggleVisibility`, and `toggleSelected`. Direct `baseAtoms` writes are a rare escape hatch for internally owned state; write the external atom when it owns the slice.

```ts
table.resetSorting()
table.resetPagination()
table.resetPagination(true)
```

Feature resets use `table.initialState` unless `true` requests the feature default and can update external owners. Core `table.reset()` only resets internal base atoms. Use slice types such as `PaginationState`; use `TableState<typeof features>` for the complete feature-inferred state.

### Common Mistakes

#### HIGH Reading an untracked snapshot

Wrong:

```ts
const pageIndex = table.atoms.pagination.get().pageIndex
```

Correct:

```ts
const pageIndex = computed(() => table.atoms.pagination.get().pageIndex)
```

The first read is current but does not make its consumer reactive.

Source: `docs/framework/vue/guide/table-state.md`

#### HIGH Passing state.value once

Wrong:

```ts
const table = useTable({
  features,
  columns,
  data,
  state: controlledState.value,
})
```

Correct:

```ts
const table = useTable({ features, columns, data, state: controlledState })
```

The adapter watches the computed ref; a one-time `.value` breaks future option synchronization.

Source: `packages/vue-table/src/useTable.ts`

#### HIGH Assigning updater functions as values

Wrong:

```ts
const onPaginationChange = (next) => {
  pagination.value = next
}
```

Correct:

```ts
const onPaginationChange = (next) => {
  pagination.value = typeof next === 'function' ? next(pagination.value) : next
}
```

Table callbacks accept either a value or a function of the previous value.

Source: `examples/vue/basic-external-state/src/App.tsx`

#### MEDIUM Supplying JSX children as a slot

Wrong:

```tsx
<table.Subscribe>
  {(atoms) => <span>{atoms.pagination.get().pageIndex}</span>}
</table.Subscribe>
```

Correct:

```tsx
<table.Subscribe
  children={(atoms) => <span>{atoms.pagination.get().pageIndex}</span>}
/>
```

The Vue adapter declares `Subscribe(props: { children })` and expects the explicit prop.

Source: `packages/vue-table/src/useTable.ts`

### API Discovery

Inspect `node_modules/@tanstack/vue-table/dist/useTable.d.ts` and `reactivity.d.ts`; inspect the exact state slice in the installed core feature directory.

<a id="source-tanstack-vue-table-with-tanstack-query"></a>

## With Tanstack Query

Source: `tanstack-vue-table-with-tanstack-query`.

This skill builds on `@tanstack/table-core#client-vs-server`, `getting-started`, and `table-state`. Name each client- and server-owned processing stage first.

### Setup

```ts
import { computed, ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import {
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from '@tanstack/vue-table'

const pagination = ref({ pageIndex: 0, pageSize: 20 })
const query = useQuery(() => ({
  queryKey: ['people', pagination.value.pageIndex, pagination.value.pageSize],
  queryFn: () =>
    fetch(
      `/api/people?page=${pagination.value.pageIndex}&size=${pagination.value.pageSize}`,
    ).then((r) => r.json()),
  placeholderData: keepPreviousData,
}))
const data = computed(() => query.data.value?.rows ?? [])
const rowCount = computed(() => query.data.value?.rowCount ?? 0)
const state = computed(() => ({ pagination: pagination.value }))
const table = useTable({
  features: tableFeatures({ rowPaginationFeature }),
  columns,
  data,
  rowCount,
  manualPagination: true,
  state,
  onPaginationChange: (next) => {
    pagination.value =
      typeof next === 'function' ? next(pagination.value) : next
  },
})
```

### Core Patterns

#### Keep query dependencies reactive

Use the Vue Query options function and read refs inside it. Include every manual filter/sort/page input in the query key.

#### Pass Query results directly

Expose result fields as computed refs. Introduce a second local data ref only for an explicit editing workflow with a cache-write policy.

### Common Mistakes

#### HIGH Unwrapping before query construction

Wrong:

```ts
const page = pagination.value.pageIndex
useQuery(() => ({ queryKey: ['people', page], queryFn }))
```

Correct:

```ts
useQuery(() => ({ queryKey: ['people', pagination.value.pageIndex], queryFn }))
```

Only reads inside the reactive options function become query dependencies.

Source: `examples/vue/with-tanstack-query/src/App.tsx`

#### HIGH Mirroring Query data locally

Wrong:

```ts
const rows = ref(query.data.value?.rows ?? [])
```

Correct:

```ts
const rows = computed(() => query.data.value?.rows ?? [])
```

A one-time copy drifts from subsequent cache results.

Source: `examples/vue/with-tanstack-query/src/App.tsx`

#### HIGH Omitting server counts

Wrong:

```ts
useTable({ features, columns, data, manualPagination: true })
```

Correct:

```ts
useTable({ features, columns, data, rowCount, manualPagination: true })
```

One returned page cannot tell Table how many pages the server has.

Source: `docs/framework/vue/guide/pagination.md`

### API Discovery

Inspect installed `@tanstack/vue-table/dist/useTable.d.ts`, installed `@tanstack/vue-query/dist/`, and the relevant manual Table feature source for exact option types.

<a id="source-tanstack-vue-table-with-tanstack-virtual"></a>

## With Tanstack Virtual

Source: `tanstack-vue-table-with-tanstack-virtual`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Virtual consumes final Table models; it is not registered in `tableFeatures`.

### Setup

```ts
import { computed, ref } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'

const scrollElement = ref<HTMLElement | null>(null)
const rows = computed(() => table.getRowModel().rows)
const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: rows.value.length,
    getScrollElement: () => scrollElement.value,
    estimateSize: () => 34,
    getItemKey: (index) => rows.value[index]!.id,
    overscan: 5,
  })),
)
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const totalSize = computed(() => rowVirtualizer.value.getTotalSize())
```

### Core Patterns

#### Derive from current visible models

Rows come from `table.getRowModel().rows`; columns come from `table.getVisibleLeafColumns()`. Use computed options so counts and scroll targets update.

#### Implement the geometry

Give the scroll container a bounded height and positioning context, create a spacer using `getTotalSize()`, and translate/measure virtual items. Follow the grid/flex examples for dynamic row heights and sticky headers.

#### Coordinate infinite fetching

Fetch near the last virtual item only while `totalFetched < serverRowCount` and no request is active. Manual sorting means the server must return the sorted order and a sort change normally resets pages.

### Common Mistakes

#### HIGH Passing a plain options snapshot

Wrong:

```ts
useVirtualizer({ count: rows.value.length, getScrollElement })
```

Correct:

```ts
useVirtualizer(computed(() => ({ count: rows.value.length, getScrollElement })))
```

Computed options keep the virtual range synchronized with Vue’s current model.

Source: `examples/vue/virtualized-rows/src/App.vue`

#### HIGH Virtualizing source arrays

Wrong:

```ts
const rows = computed(() => data.value)
```

Correct:

```ts
const rows = computed(() => table.getRowModel().rows)
```

Source arrays do not represent Table’s current filtering, sorting, expansion, or pagination.

Source: `docs/framework/vue/guide/virtualization.md`

#### HIGH Assuming Virtual provides CSS

Wrong:

```vue
<div v-for="item in virtualRows" :key="item.key">{{ rows[item.index].id }}</div>
```

Correct:

```vue
<div :style="{ height: `${totalSize}px`, position: 'relative' }"><div style="position:absolute"></div></div>
```

Virtual provides measurements, not spacer layout, transforms, sticky positioning, or Table column widths.

Source: `examples/vue/virtualized-columns/src/App.vue`

### API Discovery

Inspect installed `@tanstack/vue-table/dist/` and `@tanstack/vue-virtual/dist/`; use the maintained Vue examples for exact row, column, and infinite layout combinations.
