# Svelte adapter

Svelte Table adapter guidance.

<a id="source-tanstack-svelte-table-create-table-hook"></a>

## Create Table Hook

Source: `tanstack-svelte-table-create-table-hook`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Use it when multiple tables share conventions; keep one-off tables on `createTable`.

### Setup

Use the shipped `createTableHook`; its implementation is rune-capable. The app hook module itself may be a normal `.ts` module, as in the maintained example.

```ts
import {
  createTableHook,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/svelte-table'

export const {
  createAppTable,
  createAppColumnHelper,
  useTableContext,
  useCellContext,
  useHeaderContext,
} = createTableHook({
  features: tableFeatures({ rowSortingFeature }),
})
```

```svelte
<script lang="ts">
  import { createAppColumnHelper, createAppTable } from './app-table.svelte'
  type Person = { name: string }
  const helper = createAppColumnHelper<Person>()
  const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
  let data = $state<Person[]>([{ name: 'Ada' }])
  const table = createAppTable({
    columns,
    get data() {
      return data
    },
  })
</script>
```

### Core Patterns

#### Register reusable components once

Pass stable `tableComponents`, `cellComponents`, and `headerComponents` to `createTableHook`. Render them through the returned `AppTable`, `AppCell`, and `AppHeader` wrappers so their typed context hooks have a provider.

#### Prefer context inside registered components

```ts
import { useCellContext } from './app-table.svelte'

const cell = useCellContext<string>()
const value = cell.getValue()
```

This avoids prop drilling and keeps feature/component types bound to the app hook.

### Common Mistakes

#### CRITICAL Reimplementing the rune-aware hook

Wrong:

```ts
// app-table.ts
export function createAppTable(options) {
  return constructTable(options)
}
```

Correct:

```ts
// app-table.ts
export const { createAppTable } = createTableHook({ features })
```

The shipped implementation supplies Svelte rune reactivity, option synchronization, wrappers, and context plumbing that a plain core wrapper omits.

Source: `packages/svelte-table/src/createTableHook.svelte.ts`

#### HIGH Freezing per-table rune inputs

Wrong:

```ts
const table = createAppTable({ columns, data })
```

Correct:

```ts
const table = createAppTable({
  columns,
  get data() {
    return data
  },
})
```

Shared defaults are static, but each table must still expose current reactive values.

Source: `docs/framework/svelte/guide/composable-tables.md`

#### HIGH Reading context outside its wrapper

Wrong:

```ts
const cell = useCellContext()
```

Correct:

```svelte
<table.AppCell {cell}><cell.TextCell /></table.AppCell>
```

Context helpers require the matching App wrapper in the rendered ancestor tree.

Source: `packages/svelte-table/src/createTableHook.svelte.ts`

#### MEDIUM Abstracting a single table too early

Wrong:

```ts
const hook = createTableHook({ features: tableFeatures({}) })
```

Correct:

```ts
const table = createTable({
  features: tableFeatures({}),
  columns,
  get data() {
    return data
  },
})
```

Use the hook for recurring app conventions, not merely to rename standalone construction.

Source: `docs/framework/svelte/guide/composable-tables.md`

### API Discovery

Inspect `node_modules/@tanstack/svelte-table/dist/createTableHook.svelte.d.ts` and the `App*.svelte` wrappers for exact returned helpers and component contracts.

<a id="source-tanstack-svelte-table-getting-started"></a>

## Getting Started

Source: `tanstack-svelte-table-getting-started`.

This skill builds on `@tanstack/table-core#core` and `@tanstack/table-core#table-features`. Read them first for the headless model and feature registration.

### Setup

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

### Core Patterns

#### Add only the processing feature you need

```ts
import {
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from '@tanstack/svelte-table'

export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})
```

The row-model slot follows its prerequisite feature in the same call. Import individual `sortFn_*` built-ins and register only the ones your columns reference; the full `sortFns` registry object still works but bundles every built-in.

#### Treat markup and styles as application code

With core-only `tableFeatures({})`, render `row.getAllCells()`. Use visibility-aware APIs such as `row.getVisibleCells()` only after registering `columnVisibilityFeature`. Call feature APIs from real Svelte event handlers. Table supplies no component-library markup, CSS, or accessibility behavior.

### Common Mistakes

#### HIGH Passing a rune snapshot as data

Wrong:

```ts
const table = createTable({ features, columns, data })
```

Correct:

```ts
const table = createTable({
  features,
  columns,
  get data() {
    return data
  },
})
```

The getter makes `$effect.pre` observe current rune data rather than the value captured at construction.

Source: `packages/svelte-table/src/createTable.svelte.ts`

#### HIGH Using the removed v8 constructor

Wrong:

```ts
const table = createSvelteTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
})
```

Correct:

```ts
const table = createTable({
  features,
  columns,
  get data() {
    return data
  },
})
```

V9 requires Svelte 5, `createTable`, and explicit features; the core row model is automatic.

Source: `docs/framework/svelte/guide/migrating.md`

#### HIGH Omitting a feature behind an API

Wrong:

```ts
const features = tableFeatures({})
table.setSorting([{ id: 'age', desc: true }])
```

Correct:

```ts
const features = tableFeatures({ rowSortingFeature })
```

Feature state and APIs exist only when that feature is registered.

Source: `docs/framework/svelte/guide/migrating.md`

### API Discovery

Inspect `node_modules/@tanstack/svelte-table/dist/index.d.ts`, then the exported implementation. Inspect core and feature APIs through `node_modules/@tanstack/table-core/dist/index.d.ts` and `dist/features/<feature>/`.

<a id="source-tanstack-svelte-table-migrate-v8-to-v9"></a>

## Migrate V8 To V9

Source: `tanstack-svelte-table-migrate-v8-to-v9`.

Use this as the complete breaking-change checklist, not merely a quick start. V9 is treated as the current API. Migrate the app to Svelte 5 before migrating Table; the v9 adapter has no Svelte 3/4 compatibility layer.

Framework prerequisite: Svelte 5 (`svelte ^5.0.0`).

### Recommended Migration Order

1. Upgrade to Svelte 5 and replace v8 stores with runes/getters.
2. Rename `createSvelteTable` to `createTable`.
3. Define explicit `tableFeatures`, then move row models and registries into it.
4. Update state reads/ownership and rendering.
5. Apply every shared API and type rename below.
6. Use `stockFeatures` only as a temporary audit bridge; explicit features are the production target.

```ts
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

const table = createTable({
  features,
  columns,
  get data() {
    return data
  },
})
```

### Construction and Feature Registration

| v8                                           | v9                                                         |
| -------------------------------------------- | ---------------------------------------------------------- |
| `createSvelteTable(options)`                 | `createTable(options)`                                     |
| All features bundled                         | Required `features: tableFeatures({...})`                  |
| `getCoreRowModel()` option                   | Remove; the core row model is automatic                    |
| `get*RowModel()` table options               | `create*RowModel()` slots in `tableFeatures`               |
| `sortingFns` table option                    | `sortFns` feature slot                                     |
| `filterFns` / `aggregationFns` table options | Same-named feature slots                                   |
| Top-level `onStateChange`                    | Per-slice callbacks, external atoms, or store subscription |

Available feature imports are `cellSelectionFeature`, `columnFilteringFeature`, `globalFilteringFeature`, `rowSortingFeature`, `rowPaginationFeature`, `rowSelectionFeature`, `rowExpandingFeature`, `rowPinningFeature`, `columnPinningFeature`, `columnVisibilityFeature`, `columnOrderingFeature`, `columnSizingFeature`, `columnResizingFeature`, `rowAggregationFeature`, `columnGroupingFeature`, and `columnFacetingFeature`. An API does not exist unless its feature is registered. Put a feature before its dependent slot in the same `tableFeatures` call. Aggregation is independent from grouping: register `rowAggregationFeature` for aggregation APIs and add `columnGroupingFeature` only for grouped rows.

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

### Svelte State Migration

- Reactive option inputs must remain live: use getters for rune values such as `data` and controlled state slices.
- `table.getState().sorting` becomes the narrow `table.atoms.sorting.get()` read. Use `table.store.get()` when code intentionally needs the complete state.
- Table atom, store, and API reads become reactive inside templates, `$derived`, `$derived.by`, and `$effect`; use native `$derived` values for projections.
- Remove second-argument selectors from `createTable` and `createAppTable` (if present from an earlier v9 version), replace `table.state`, and remove `subscribeTable` / `SubscribeSource` imports.
- `SvelteTable` now has two generic parameters, `AppSvelteTable` has five, and `useTableContext` no longer accepts a selected-state generic.
- For Svelte-owned controlled slices, use `createTableState` and matching `onSortingChange`, `onPaginationChange`, and other per-slice callbacks.
- For shared ownership, provide atoms created by `@tanstack/svelte-store` through `atoms`. Never provide both `atoms.pagination` and `state.pagination`.
- Subscribe to `table.store` to observe every state change. Do not port the removed top-level `onStateChange`.
- Treat `table.baseAtoms` as internal writable state; prefer feature APIs or external atoms.

### Rendering and Composition

| v8                                       | v9                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `flexRender(...)` / `<svelte:component>` | `<FlexRender {cell} />`, `<FlexRender {header} />`, or `<FlexRender {footer} />` |
| Component returned directly              | `renderComponent(Component, props)`                                              |
| Svelte snippet content                   | `renderSnippet(snippet, props)`                                                  |
| Repeated raw options                     | `tableOptions(...)` composition                                                  |
| Repeated table conventions               | `createTableHook({ features, ... })` and its pre-bound helpers                   |

`createTableHook` returns a feature-bound table creator and column helper; use it for application-wide conventions, not as a required migration step.

### Complete Shared Breaking-Change Map

#### Instance methods

Row, cell, column, header, and related object methods now live on shared prototypes and use `this`. Call `row.getValue(...)`, `cell.getContext()`, `column.getCanSort()`, and `header.getContext()` on their instances. Do not destructure them or pass them as bare callbacks. They are not own enumerable properties, so object spread, `Object.keys`, and JSON serialization do not preserve them. Table methods are not affected.

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

This is logical region naming, not automatic DOM direction handling. Prefer CSS `inset-inline-start`/`inset-inline-end`. `columnResizeDirection` is unchanged.

#### Feature and state splits

- `enablePinning` splits into `enableColumnPinning` and `enableRowPinning`.
- Interactive resizing requires both `columnSizingFeature` and `columnResizingFeature`; fixed widths need only sizing.
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

All other `_`-prefixed internal APIs are removed, including `_getPinnedRows`, `_getFacetedRowModel`, `_getFacetedMinMaxValues`, and `_getFacetedUniqueValues`; do not seek replacements unless a public API is documented.

`getIsSomeRowsSelected()` and `getIsSomePageRowsSelected()` now mean at least one, including all. For an indeterminate checkbox, combine “some” with `!getIsAllRowsSelected()` or `!getIsAllPageRowsSelected()`.

### TypeScript Migration

- Core types now take `TFeatures` first: `ColumnDef<typeof features, Person>`, `Column<typeof features, Person>`, `Row<typeof features, Person>`, `Table<typeof features, Person>`.
- Replace `createColumnHelper<Person>()` with `createColumnHelper<typeof features, Person>()`; wrap arrays in `columnHelper.columns([...])` for inference.
- With `stockFeatures`, use `StockFeatures` as the feature type.
- `TableMeta` and `ColumnMeta` declaration merging still works only after adding `TFeatures` first. Prefer per-table `tableMeta`/`columnMeta: metaHelper<...>()` slots.
- Replace global `FilterFns`, `SortFns`, `AggregationFns`, and `FilterMeta` augmentation with `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta: metaHelper<...>()` slots. Registered keys become valid string references.
- Prefer explicit object row types; `RowData` is restricted to records or arrays.

### Common Migration Failures

#### CRITICAL: Running v9 on Svelte 3/4

Upgrade to Svelte 5 first. Writable-store-era table setup is not a supported v9 adapter contract.

#### HIGH: Moving the feature but not its row model

Register both the feature and its `create*RowModel()` slot. Leaving `get*RowModel` on table options silently leaves the v9 processing pipeline incomplete.

#### HIGH: Snapshotting a rune value

Use `get data() { return data }`; a one-time `data` snapshot does not remain reactive.

#### HIGH: Keeping removed Svelte selectors

Remove second arguments from `createTable` and `createAppTable`, replace selected `table.state` reads with `table.atoms.<slice>.get()` or `table.store.get()`, and remove `subscribeTable`, `SubscribeSource`, and selected-state generic parameters. V9 intentionally has no compatibility layer for these APIs.

#### HIGH: Destructuring instance methods

Keep calls bound to row/cell/column/header instances; shallow copies do not contain prototype methods.

### Final Checklist

- [ ] Svelte is version 5+; old writable-store patterns are removed.
- [ ] `createSvelteTable` is replaced by `createTable`.
- [ ] Explicit features, row models, and function registries are in `tableFeatures`.
- [ ] `getCoreRowModel` and the separate `rowModels` shape are removed.
- [ ] Reactive inputs and controlled slices use getters/runes; state reads use v9 surfaces.
- [ ] Svelte creation selectors, `table.state`, `subscribeTable`, `SubscribeSource`, and selected-state generic parameters are removed.
- [ ] `onStateChange` is replaced; atom/state ownership does not overlap.
- [ ] Rendering uses `FlexRender`, `renderComponent`, or `renderSnippet`.
- [ ] Prototype method calls, pinning, sizing/resizing, sorting, row, and selection semantics are audited.
- [ ] Helpers, types, meta, registries, and `RowData` use the v9 generic/slot shapes.
- [ ] Temporary `stockFeatures` usage has an explicit removal plan.

### API Discovery

Verify the installed target in `node_modules/@tanstack/svelte-table/dist/index.d.ts` and its adapter sources. Verify feature slots and the exact installed v9 APIs in `node_modules/@tanstack/table-core/dist/`; do not reconstruct v9 APIs from v8 memory.

<a id="source-tanstack-svelte-table-table-state"></a>

## Table State

Source: `tanstack-svelte-table-table-state`.

This skill builds on `@tanstack/table-core#core` and `getting-started`. Read them first for table ownership and Svelte construction.

### State Mental Model

TanStack Table is primarily a state coordinator. Keep state internal unless another system must read, persist, or drive it. Without `initialState`, `atoms`, `state`, or `on[State]Change`, the table owns all registered slices.

- `table.baseAtoms` are internal writable atoms initialized from resolved initial state.
- `table.atoms` are readonly derived atoms for the active owner of each registered slice.
- `table.store` is the readonly flat store assembled from those atoms.

The Svelte adapter bridges TanStack Store dependency tracking into Svelte runes. `table.atoms.<slice>.get()`, `table.store.get()`, and table APIs become reactive when called in a template, `$derived`, `$derived.by`, or `$effect`. Outside those contexts they return current snapshots.

Only registered features create state and types. If pagination is missing, register `rowPaginationFeature`; do not add a cast or ad hoc state field. Keep `features` and `columns` stable and pass changing `data` through a getter.

### Setup

Keep state internal unless another subsystem needs to own it. Read only the state slices a component needs.

```svelte
<script lang="ts">
  import {
    createTable,
    rowPaginationFeature,
    tableFeatures,
  } from '@tanstack/svelte-table'

  const features = tableFeatures({ rowPaginationFeature })
  const columns = [{ accessorKey: 'name' }]
  let data = $state([{ name: 'Ada' }])

  const table = createTable({
    features,
    columns,
    get data() {
      return data
    },
  })

  const pagination = $derived(table.atoms.pagination.get())
</script>

<button onclick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
  Page {pagination.pageIndex + 1}
</button>
```

### Core Patterns

#### Read narrow or complete state

```ts
const pagination = $derived(table.atoms.pagination.get())
const pageIndex = $derived(table.atoms.pagination.get().pageIndex)
const rows = $derived(table.getRowModel().rows)
const stateJson = $derived(JSON.stringify(table.store.get(), null, 2))
```

Use atom reads for normal UI. A `table.store.get()` read intentionally re-runs for any registered state change, so reserve it for debug output, persistence, or computations that need the whole state.

#### Control a slice with value-or-updater semantics

```ts
import type { PaginationState, Updater } from '@tanstack/svelte-table'

let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 20 })
const updatePagination = (next: Updater<PaginationState>) => {
  pagination = typeof next === 'function' ? next(pagination) : next
}
```

Pass a getter-backed `state.pagination` and `onPaginationChange: updatePagination` to `createTable`.

#### Reduce boilerplate with `createTableState`

```ts
import {
  createTable,
  createTableState,
  rowPaginationFeature,
  tableFeatures,
  type PaginationState,
} from '@tanstack/svelte-table'

const features = tableFeatures({ rowPaginationFeature })
const columns = [{ accessorKey: 'name' }]
const data = [{ name: 'Ada' }]
const [pagination, setPagination] = createTableState<PaginationState>({
  pageIndex: 0,
  pageSize: 20,
})

const table = createTable({
  features,
  columns,
  data,
  state: {
    get pagination() {
      return pagination()
    },
  },
  onPaginationChange: setPagination,
})
```

For better or worse, this resembles a small React `useState` hook: `pagination()` reads the current rune-backed value, while `setPagination` accepts either a value or a functional updater and can be passed directly to `onPaginationChange`.

### Choose State Ownership

Use one owner per slice:

- Prefer internal state plus feature APIs for table-local interaction.
- Use `initialState` for starting/reset values; changing it later does not reset state.
- Use Svelte `$state`, a getter-backed `state` entry, and the matching callback for normal Svelte-owned controlled state.
- Use a stable external atom in `atoms` for state shared as a raw TanStack Store atom. Do not also add its change callback.

External atoms win over controlled `state`, which syncs into the internal base atom. Avoid multiple owners. The global v8 `onStateChange` option is gone; subscribe to `table.store` if every state change must be observed imperatively.

When code outside the table consumes a raw external atom, use `useSelector` from `@tanstack/svelte-store`. Inside table-driven UI, read the rune-aware `table.atoms.<slice>.get()` wrapper.

### Initialize, Update, and Reset

Prefer `setSorting`, `nextPage`, `toggleVisibility`, `toggleSelected`, and other feature APIs over direct state writes. Write a base atom only for rare internal-state needs; write the external atom when `atoms.<slice>` owns it.

```ts
table.resetSorting()
table.resetPagination()
table.resetPagination(true)
```

Feature resets use `table.initialState` unless `true` requests the feature default and can flow to external owners. Core `table.reset()` resets internal base atoms only. Use feature types such as `PaginationState` for a slice and `TableState<typeof features>` for the complete registered state.

### Common Mistakes

#### HIGH Keeping removed adapter selectors

Wrong:

```ts
const table = createTable(options, (state) => state.pagination)
const pageIndex = table.state.pageIndex
```

Correct:

```ts
const table = createTable(options)
const pagination = $derived(table.atoms.pagination.get())
```

In v9, `createTable` and `createAppTable` take only options, `table.state` is absent, and `subscribeTable` and `SubscribeSource` are no longer exported. Use native tracked Svelte reads and `$derived` projections.

Source: `docs/framework/svelte/guide/migrating.md`

#### HIGH Controlling without writing back

Wrong:

```ts
const options = { state: { pagination }, onPaginationChange: console.log }
```

Correct:

```ts
const options = {
  state: {
    get pagination() {
      return pagination
    },
  },
  onPaginationChange: updatePagination,
}
```

A controlled slice is frozen unless every updater is resolved into the owning rune.

Source: `docs/framework/svelte/guide/table-state.md`

#### HIGH Snapshotting outside tracking

Wrong:

```ts
const pageIndex = table.store.get().pagination.pageIndex
```

Correct inside a component:

```ts
const pageIndex = $derived(table.atoms.pagination.get().pageIndex)
```

The first line is only a current snapshot when it runs outside a template or rune. The second line is a narrow native Svelte derivation.

Source: `packages/svelte-table/src/createTable.svelte.ts`

#### MEDIUM Declaring one slice in two owners

Wrong:

```ts
const options = { initialState: { pagination: start }, state: { pagination } }
```

Correct:

```ts
const options = {
  state: {
    get pagination() {
      return pagination
    },
  },
}
```

Controlled `atoms` or `state` wins over `initialState`; choose one owner per slice.

Source: `docs/framework/svelte/guide/table-state.md`

#### MEDIUM Fighting automatic page reset

Wrong:

```ts
table.setPageIndex(4)
data = filteredData
```

Correct:

```ts
const options = { autoResetPageIndex: false }
```

Client row-model changes reset the page by default; disable it only when the application handles invalid empty pages.

Source: `docs/framework/svelte/guide/pagination.md`

### API Discovery

Inspect `node_modules/@tanstack/svelte-table/dist/createTable.svelte.d.ts`, `createTableHook.svelte.d.ts`, and `createTableState.svelte.d.ts`; inspect registered state slices in the matching core feature source.

<a id="source-tanstack-svelte-table-with-tanstack-query"></a>

## With Tanstack Query

Source: `tanstack-svelte-table-with-tanstack-query`.

This skill builds on `@tanstack/table-core#client-vs-server`, `getting-started`, and `table-state`. Decide which row-processing stages the server owns before composing Query.

### Setup

```ts
import { createQuery, keepPreviousData } from '@tanstack/svelte-query'
import {
  createTable,
  rowPaginationFeature,
  tableFeatures,
} from '@tanstack/svelte-table'

const features = tableFeatures({ rowPaginationFeature })
let pagination = $state({ pageIndex: 0, pageSize: 20 })
const defaultData: Array<{ name: string }> = []
const dataQuery = createQuery<{
  rows: Array<{ name: string }>
  rowCount: number
}>(() => ({
  queryKey: ['people', pagination.pageIndex, pagination.pageSize],
  queryFn: () =>
    fetch(
      `/api/people?page=${pagination.pageIndex}&size=${pagination.pageSize}`,
    ).then((r) => r.json()),
  placeholderData: keepPreviousData,
}))
const table = createTable({
  features,
  columns,
  get data() {
    return dataQuery.data?.rows ?? defaultData
  },
  get rowCount() {
    return dataQuery.data?.rowCount ?? 0
  },
  manualPagination: true,
  state: {
    get pagination() {
      return pagination
    },
  },
  onPaginationChange: (next) => {
    pagination = typeof next === 'function' ? next(pagination) : next
  },
})
```

### Core Patterns

#### Put every server-owned stage in the query key

If sorting or filtering is manual too, control those slices and include their serializable values in `queryKey`. Return data already processed in that same order.

#### Keep Query as server-data owner

Expose `dataQuery.data` through Table getters. Copy it into `$state` only when the application explicitly owns an editable draft and defines cache synchronization.

### Common Mistakes

#### HIGH Building a non-reactive query

Wrong:

```ts
const query = createQuery({
  queryKey: ['people', pagination.pageIndex],
  queryFn,
})
```

Correct:

```ts
const query = createQuery(() => ({
  queryKey: ['people', pagination.pageIndex],
  queryFn,
}))
```

The options function lets Svelte Query track the rune read and refetch on page changes.

Source: `examples/svelte/with-tanstack-query/src/App.svelte`

#### HIGH Expecting manual mode to fetch

Wrong:

```ts
const options = { manualPagination: true }
```

Correct:

```ts
const options = {
  manualPagination: true,
  get data() {
    return dataQuery.data?.rows ?? defaultData
  },
}
```

Manual mode only bypasses Table pagination; Query or application code performs the request. Hoist `defaultData` instead of creating a new `[]` from a repeatedly evaluated getter.

Source: `docs/framework/svelte/guide/pagination.md`

#### HIGH Omitting total counts

Wrong:

```ts
const options = { manualPagination: true, data: pageRows }
```

Correct:

```ts
const options = {
  manualPagination: true,
  data: pageRows,
  rowCount: response.rowCount,
}
```

Table cannot derive navigation limits from one server page; provide `rowCount` or `pageCount`.

Source: `docs/framework/svelte/guide/pagination.md`

### API Discovery

Inspect `node_modules/@tanstack/svelte-table/dist/index.d.ts` for adapter APIs and installed `@tanstack/svelte-query/dist/` for the exact Query version. Table manual-stage options live in the matching core feature source.

<a id="source-tanstack-svelte-table-with-tanstack-virtual"></a>

## With Tanstack Virtual

Source: `tanstack-svelte-table-with-tanstack-virtual`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Virtual is a rendering layer over Table’s final model, never a `tableFeatures` plugin.

### Setup

```svelte
<script lang="ts">
  import { get } from 'svelte/store'
  import { createVirtualizer } from '@tanstack/svelte-virtual'

  let scrollElement = $state<HTMLDivElement>()
  const rows = $derived(table.getRowModel().rows)
  const rowVirtualizer = createVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElement ?? null,
    estimateSize: () => 34,
    getItemKey: (index) => rows[index]!.id,
    overscan: 5,
  })

  // The store adapter does not track getter options. Push reactive inputs.
  $effect(() => {
    get(rowVirtualizer).setOptions({
      count: rows.length,
      getScrollElement: () => scrollElement ?? null,
    })
  })
</script>

<div
  bind:this={scrollElement}
  style="height: 500px; overflow: auto; position: relative"
>
  <div style:height={`${$rowVirtualizer.getTotalSize()}px`}>
    {#each $rowVirtualizer.getVirtualItems() as item (item.key)}
      <div style={`position:absolute;transform:translateY(${item.start}px)`}>
        {rows[item.index].id}
      </div>
    {/each}
  </div>
</div>
```

### Core Patterns

#### Virtualize visible models

Use `table.getRowModel().rows` for rows and `table.getVisibleLeafColumns()` for columns. Recompute counts when filtering, sorting, expansion, or visibility changes.

#### Make CSS geometry agree with measurement

Use one scroll container, a total-size spacer, positioned items, and either fixed estimates or `measureElement`. For semantic tables with dynamic rows, follow the maintained grid/flex examples rather than assuming native table layout will honor transforms.

#### Fetch before the virtual end

In infinite scrolling, compare the last virtual item with fetched row count, then request the next Query page only when more server rows exist and no fetch is active.

### Common Mistakes

#### HIGH Virtualizing raw data

Wrong:

```ts
const rows = data
```

Correct:

```ts
const rows = $derived(table.getRowModel().rows)
```

Raw data ignores Table filtering, sorting, grouping, expansion, and pagination decisions.

Source: `examples/svelte/virtualized-rows/src/App.svelte`

#### HIGH Expecting getter options to stay reactive

Wrong:

```ts
const virtualizer = createVirtualizer({
  get count() {
    return rows.length
  },
  getScrollElement,
})
```

Correct:

```ts
const virtualizer = createVirtualizer({ count: rows.length, getScrollElement })
$effect(() => {
  get(virtualizer).setOptions({
    count: rows.length,
    getScrollElement,
  })
})
```

`createVirtualizer` returns a Svelte store, and its adapter does not track getter options. Push rune-derived counts and the bound scroll element with `$effect` and `get(store).setOptions(...)`.

Source: `examples/svelte/virtualized-rows/src/App.svelte`

#### HIGH Omitting the geometry contract

Wrong:

```svelte
{#each rowVirtualizer.getVirtualItems() as item}<div>
    {rows[item.index].id}
  </div>{/each}
```

Correct:

```svelte
<div style:height={`${$rowVirtualizer.getTotalSize()}px`}>
  <div style="position:absolute"></div>
</div>
```

Virtual supplies ranges and measurements, not spacer height, transforms, sticky regions, or column widths. In markup, call virtualizer methods through the store auto-subscription (`$rowVirtualizer`); use `get(rowVirtualizer)` in script code.

Source: `docs/framework/svelte/guide/virtualization.md`

### API Discovery

Inspect installed `@tanstack/svelte-table/dist/` for Table APIs and `@tanstack/svelte-virtual/dist/` for the exact virtualizer options. Use the maintained Svelte examples for layout combinations.
