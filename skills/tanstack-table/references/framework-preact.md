# Preact adapter

Preact Table adapter guidance.

<a id="source-tanstack-preact-table-create-table-hook"></a>

## Create Table Hook

Source: `tanstack-preact-table-create-table-hook`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Use the app hook for repeated conventions; one-off tables should stay with `useTable`.

### Setup

```tsx
import {
  createTableHook,
  rowSelectionFeature,
  tableFeatures,
} from '@tanstack/preact-table'

export const { createAppColumnHelper, useAppTable, useTableContext } =
  createTableHook({
    features: tableFeatures({ rowSelectionFeature }),
    getRowId: (row: { id: string }) => row.id,
  })
```

### Core Patterns

#### Use the factory-bound helper

```tsx
type Person = { id: string; name: string }
const helper = createAppColumnHelper<Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
```

#### Consume typed context under its wrapper

```tsx
function RowCount() {
  const table = useTableContext()
  return <output>{table.getRowModel().rows.length}</output>
}
const table = useAppTable({ data, columns })
return (
  <table.AppTable>
    <RowCount />
  </table.AppTable>
)
```

`AppTable` takes ordinary JSX children without a selector. Use function children only when a selector supplies their value:

```tsx
<table.AppTable selector={(state) => state.rowSelection}>
  {(rowSelection) => <output>{Object.keys(rowSelection).length}</output>}
</table.AppTable>
```

#### Isolate genuinely nested table setups

Default contexts are module-scoped and HMR-stable; sibling tables are already isolated by their providers. Separate `createTableHook` calls still share those defaults, so nested providers can silently resolve a consumer to the inner table. Use fresh contexts only when different table setups are nested:

```tsx
import {
  createTableHook,
  createTableHookContexts,
  rowSelectionFeature,
  tableFeatures,
} from '@tanstack/preact-table'

const features = tableFeatures({ rowSelectionFeature })
const { tableContext, cellContext, headerContext } =
  createTableHookContexts<typeof features>()

export const app = createTableHook({
  features,
  tableContext,
  cellContext,
  headerContext,
})
```

Prefer hooks returned by `createTableHook` because their types include registered component maps. Hooks returned directly by `createTableHookContexts` know only `TFeatures` and support modules that cannot import the completed factory.

### Common Mistakes

#### MEDIUM Abstracting a single table

Wrong:

```tsx
const app = createTableHook({ features: tableFeatures({}) })
```

Correct:

```tsx
const table = useTable({ features, columns, data })
```

The factory is valuable when it centralizes repeated policy, not merely another constructor name.

Source: `docs/framework/preact/guide/composable-tables.md`

#### HIGH Reading outside the matching provider

Wrong:

```tsx
return <RowCount />
```

Correct:

```tsx
return (
  <table.AppTable>
    <RowCount />
  </table.AppTable>
)
```

Factory context hooks require the corresponding `AppTable`, `AppCell`, or `AppHeader` wrapper.

Source: `packages/preact-table/src/createTableHook.tsx`

#### HIGH Recreating contexts per render

Wrong:

```tsx
function Grid() {
  const app = createTableHook({ features })
  const table = app.useAppTable({ data, columns })
  return (
    <table.AppTable>
      <div />
    </table.AppTable>
  )
}
```

Correct:

```tsx
const app = createTableHook({ features })
function Grid() {
  const table = app.useAppTable({ data, columns })
  return (
    <table.AppTable>
      <div />
    </table.AppTable>
  )
}
```

Creating a new factory closure during render makes hook configuration and component registries unstable. Keep the factory and its bound hook identity at module scope.

Source: `packages/preact-table/src/createTableHook.tsx`

### API Discovery

Inspect `node_modules/@tanstack/preact-table/dist/createTableHook.d.ts` and `createTableHookContexts.d.ts` for exact return names, provider props, registries, and scoped context types.

<a id="source-tanstack-preact-table-devtools"></a>

## Devtools

Source: `tanstack-preact-table-devtools`.

This skill builds on @tanstack/table-core#core and @tanstack/table-devtools#devtools.

### Setup

```tsx
import { TanStackDevtools } from '@tanstack/preact-devtools'
import { useTable, tableFeatures } from '@tanstack/preact-table'
import {
  tableDevtoolsPlugin,
  useTanStackTableDevtools,
} from '@tanstack/preact-table-devtools'

const features = tableFeatures({})
const columns = [{ accessorKey: 'id' }]
const data: Array<{ id: string }> = []

export function App() {
  const table = useTable({
    key: 'users-table',
    features,
    columns,
    data,
  })
  useTanStackTableDevtools(table)
  return <TanStackDevtools plugins={[tableDevtoolsPlugin()]} />
}
```

### Hooks and Components

Use the native Preact packages throughout. Pass `{ enabled }` rather than conditionally calling the registration hook.

### Common Mistakes

#### HIGH React Devtools package mixed into Preact

Wrong: import the hook from `@tanstack/react-table-devtools` through compat.

Correct: use `@tanstack/preact-table-devtools` with `@tanstack/preact-devtools`.

The native adapter owns Preact effect lifecycle and plugin types.

Source: TanStack/table:docs/devtools.md

#### HIGH Missing or duplicate key

Wrong: omit `key` or reuse `users-table` for multiple mounted tables.

Correct: give each live table one stable unique key.

Keyless registration is skipped; duplicate keys replace targets.

Source: TanStack/table:packages/table-devtools/src/tableTarget.ts

#### MEDIUM Production no-op mistaken for failure

Wrong: expect the default entrypoint to stay active in a production bundle.

Correct: keep Devtools development-only unless an explicit production import is required.

The default index deliberately selects no-op implementations outside development.

Source: TanStack/table:packages/preact-table-devtools/src/index.ts

### API Discovery

Inspect `node_modules/@tanstack/preact-table-devtools/dist/index.d.ts` and `useTanStackTableDevtools.d.ts`; do not copy React adapter imports.

<a id="source-tanstack-preact-table-getting-started"></a>

## Getting Started

Source: `tanstack-preact-table-getting-started`.

This skill builds on `@tanstack/table-core#core` and `@tanstack/table-core#table-features`. Use the native Preact adapter, not React through compat.

### Setup

```tsx
import { useState } from 'preact/hooks'
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/preact-table'

type Person = { name: string }
const features = tableFeatures({})
const helper = createColumnHelper<typeof features, Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])

export function PeopleTable() {
  const [data] = useState<Person[]>([{ name: 'Ada' }])
  const table = useTable({ features, columns, data })
  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id}>
                <table.FlexRender header={header} />
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Core Patterns

#### Register only required plugins

```tsx
import {
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/preact-table'
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
```

#### Keep features and columns module-stable

```tsx
const features = tableFeatures({})
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
```

### Common Mistakes

#### HIGH Importing the React adapter through compat

Wrong:

```tsx
import { useTable } from '@tanstack/react-table'
```

Correct:

```tsx
import { useTable } from '@tanstack/preact-table'
```

The native adapter uses Preact hooks, stores, JSX types, and subscriptions directly.

Source: `docs/framework/preact/guide/migrating.md`

#### HIGH Copying the v8 constructor

Wrong:

```tsx
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
})
```

Correct:

```tsx
const table = useTable({ data, columns, features })
```

V9 uses explicit feature slots rather than v8 row-model table options.

Source: `docs/framework/preact/guide/migrating.md`

#### MEDIUM Recreating static inputs in render

Wrong:

```tsx
const table = useTable({
  features: tableFeatures({}),
  columns: [{ accessorKey: 'name' }],
  data,
})
```

Correct:

```tsx
const table = useTable({ features, columns, data })
```

New feature and column identities cause needless option and model work.

Source: `examples/preact/basic-use-table`

### API Discovery

Inspect `node_modules/@tanstack/preact-table/dist/index.d.ts`, then `useTable.d.ts`, `Subscribe.d.ts`, or `FlexRender.d.ts`; follow core exports into installed `@tanstack/table-core/dist/`.

<a id="source-tanstack-preact-table-migrate-v8-to-v9"></a>

## Migrate V8 To V9

Source: `tanstack-preact-table-migrate-v8-to-v9`.

Read `@tanstack/table-core#migrate-v8-to-v9`, `getting-started`, and `table-state`. Use this as the exhaustive Preact migration checklist. Verify the exact v9 APIs in the installed declarations before assuming a different v9 version has the same surface.

Framework prerequisite: Preact 10 or newer (`preact >=10`).

### Target architecture

```tsx
import {
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/preact-table'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
const table = useTable({ features, columns, data })
```

V8 did not have a first-party Preact adapter; many Preact apps used `@tanstack/react-table` through `preact/compat`. V9 uses native `@tanstack/preact-table`. Remove compatibility aliases that existed only for Table after replacing the imports. Prefer explicit features as the end state; `stockFeatures` is only a kitchen-sink migration shortcut.

### Complete breaking-change map

#### Adapter, construction, and features

| v8                                                        | v9                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| `@tanstack/react-table` through `preact/compat`           | Native `@tanstack/preact-table`                                     |
| `useReactTable(options)`                                  | `useTable({ ...options, features })`                                |
| Every feature bundled                                     | Register used `*Feature` objects with `tableFeatures()`             |
| `getCoreRowModel()` option                                | Remove it; core is automatic                                        |
| `getFilteredRowModel()`                                   | `filteredRowModel: createFilteredRowModel()`                        |
| `getSortedRowModel()`                                     | `sortedRowModel: createSortedRowModel()`                            |
| `getPaginationRowModel()`                                 | `paginatedRowModel: createPaginatedRowModel()`                      |
| `getExpandedRowModel()`                                   | `expandedRowModel: createExpandedRowModel()`                        |
| `getGroupedRowModel()`                                    | `groupedRowModel: createGroupedRowModel()`                          |
| `getFacetedRowModel()`                                    | `facetedRowModel: createFacetedRowModel()`                          |
| `getFacetedMinMaxValues()`                                | `facetedMinMaxValues: createFacetedMinMaxValues()`                  |
| `getFacetedUniqueValues()`                                | `facetedUniqueValues: createFacetedUniqueValues()`                  |
| Table/factory `sortingFns`, `filterFns`, `aggregationFns` | `sortFns`, `filterFns`, `aggregationFns` slots in `tableFeatures()` |
| Removed `rowModels: { ... }` object                       | Direct named slots in `tableFeatures()`                             |

In the registry slots, register individually imported built-ins (`filterFn_includesString`, `sortFn_alphanumeric`, `aggregationFn_sum`, and so on) under their conventional keys alongside custom functions; the full `filterFns`/`sortFns`/`aggregationFns` registry objects still work but bundle every built-in.

Register each prerequisite feature before its row-model slot. Stock features are `cellSelectionFeature`, `columnFilteringFeature`, `globalFilteringFeature`, `rowSortingFeature`, `rowPaginationFeature`, `rowSelectionFeature`, `rowExpandingFeature`, `rowPinningFeature`, `columnPinningFeature`, `columnVisibilityFeature`, `columnOrderingFeature`, `columnSizingFeature`, `columnResizingFeature`, `rowAggregationFeature`, `columnGroupingFeature`, and `columnFacetingFeature`. Aggregation is independent from grouping: register `rowAggregationFeature` for aggregation APIs and add `columnGroupingFeature` only for grouped rows.

#### Preact state and subscriptions

| v8                          | v9                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `table.getState()`          | Reactive `table.state`, snapshot `table.store.state`, or `table.atoms.<slice>.get()` |
| Top-level `onStateChange`   | Per-slice callbacks or `table.store.subscribe()`                                     |
| Whole-component state reads | Custom second-argument selector, `table.Subscribe`, or atom source                   |

The default `useTable` selector subscribes the component to all registered state. Pass a selector for `table.state`, or `() => null` and subscribe lower:

```tsx
const table = useTable(options, () => null)

<table.Subscribe source={table.atoms.rowSelection}>
  {selection => <span>{Object.keys(selection).length} selected</span>}
</table.Subscribe>
```

Controlled `state` plus per-slice `on[State]Change` remains supported. For app-owned atoms, use `useCreateAtom`/`useSelector` from `@tanstack/preact-store` and pass them through `options.atoms`. An external atom wins over `state` for the same slice; do not mirror both ownership models.

#### Rendering and composition

- Replace React-adapter `flexRender(def, context)` with `<table.FlexRender cell={cell} />` or standalone `<FlexRender ... />`; the function remains for advanced cases.
- Use `tableOptions()` for typed reusable option fragments.
- Use `createTableHook({ features, ...defaults })` for repeated app table conventions; it returns native app helpers such as `useAppTable` and `createAppColumnHelper`.
- Call row/cell/column/header methods on their instance. Prototype methods lose `this` when destructured and do not appear in object spread, `Object.keys`, or JSON. Table-instance methods are not affected.

#### TypeScript and helpers

| v8                                                                             | v9                                                                                     |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `createColumnHelper<Person>()`                                                 | `createColumnHelper<typeof features, Person>()`                                        |
| Plain arrays that widen nested values                                          | `columnHelper.columns([...])`                                                          |
| `ColumnDef<TData>`                                                             | `ColumnDef<TFeatures, TData, TValue>`                                                  |
| `Column<TData>`, `Row<TData>`, `Table<TData>`                                  | Add `TFeatures` first                                                                  |
| `Cell<TData, TValue>`                                                          | `Cell<TFeatures, TData, TValue>`                                                       |
| React module augmentation                                                      | Target `@tanstack/preact-table`                                                        |
| `TableMeta<TData>` / `ColumnMeta<TData, TValue>`                               | Add `TFeatures`, or use per-table `tableMeta` / `columnMeta` slots with `metaHelper()` |
| Global `FilterFns`, `SortFns`, `AggregationFns`, and `FilterMeta` augmentation | `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta` feature slots               |
| `RowData = unknown`                                                            | Record or array row data                                                               |

Infer with `typeof features`; use `StockFeatures` only for deliberate `stockFeatures` typing.

#### Shared API and semantic changes

| v8 pinning                                                     | v9                                                            |
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

Logical pinning does not style DOM direction automatically; use logical CSS insets. `columnResizeDirection` is unchanged.

| v8                                              | v9                                                                         |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| Table `enablePinning`                           | `enableColumnPinning` plus `enableRowPinning`; column-level option remains |
| Combined sizing/resizing                        | `columnSizingFeature` plus `columnResizingFeature` for drag resizing       |
| `columnSizingInfo` / `onColumnSizingInfoChange` | `columnResizing` / `onColumnResizingChange`                                |
| `setColumnSizingInfo()`                         | `setColumnResizing()`                                                      |
| `sortingFn` / `sortingFns`                      | `sortFn` / `sortFns`                                                       |
| `getSortingFn()` / `getAutoSortingFn()`         | `getSortFn()` / `getAutoSortFn()`                                          |
| `SortingFn` / `SortingFns`                      | `SortFn` / `SortFns`                                                       |
| `row._getAllCellsByColumnId()`                  | `row.getAllCellsByColumnId()`                                              |
| `table._getPinnedRows()`                        | `getTopRows()`, `getCenterRows()`, or `getBottomRows()`                    |
| `table._getFacetedRowModel()`                   | Public faceting APIs on the relevant column/table                          |
| `table._getFacetedMinMaxValues()`               | `getFacetedMinMaxValues()`                                                 |
| `table._getFacetedUniqueValues()`               | `getFacetedUniqueValues()`                                                 |

All other underscore-prefixed internals are removed. `getIsSomeRowsSelected()` and `getIsSomePageRowsSelected()` now stay true when all applicable rows are selected. Use `getIsSomeRowsSelected() && !getIsAllRowsSelected()` or `getIsSomePageRowsSelected() && !getIsAllPageRowsSelected()` for indeterminate UI.

### Migration procedure

1. Replace React adapter imports and `useReactTable`; remove Table-only `preact/compat` configuration.
2. Inventory used features, row models, registries, state slices, methods, and `_` internals.
3. Build `tableFeatures()` in prerequisite order; remove `getCoreRowModel` and old row-model placement.
4. Apply all pinning, sizing, sorting, row, and selection mappings above.
5. Update helpers/types with `typeof features`, retarget augmentation, and prefer feature registry/meta slots.
6. Replace `getState()`/`onStateChange`; explicitly choose internal, per-slice controlled, or external-atom ownership.
7. Replace unbound row/cell/column/header methods and migrate rendering.
8. Add `tableOptions`, subscriptions, or `createTableHook` only where reusable composition or render isolation needs them.
9. Type-check and exercise every enabled client- and server-side flow.
10. Audit away `stockFeatures` if the production table should remain tree-shakable.

### Final migration checklist

- [ ] Replace React-adapter imports/useReactTable with native Preact imports/useTable and remove Table-only compat aliases.
- [ ] Register every used stock feature explicitly and put prerequisites before dependent slots.
- [ ] Remove `getCoreRowModel`; move all eight optional row-model factories into `tableFeatures`.
- [ ] Move `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta` into feature slots.
- [ ] Replace `table.getState()` and top-level `onStateChange`; choose Preact selectors, Subscribe, per-slice callbacks, store subscription, or external atoms.
- [ ] Audit controlled/external ownership and atom precedence.
- [ ] Replace unbound or copied row/cell/column/header methods.
- [ ] Apply the entire left/right to start/end pinning map and logical sticky CSS.
- [ ] Split pinning options and sizing/resizing; rename resizing state, setter, and callback.
- [ ] Apply every sorting option/API/type/registry rename.
- [ ] Remove all listed underscore-prefixed internals and use public replacements.
- [ ] Pair each some-selected check with its all-selected predicate for indeterminate UI.
- [ ] Update TFeatures helpers/types, `columns()`, `StockFeatures`, meta slots, registries, and RowData.
- [ ] Migrate Preact FlexRender and adopt tableOptions/createTableHook only where useful.
- [ ] Type-check and test every enabled client/manual feature plus LTR/RTL layout behavior.
- [ ] Remove temporary stockFeatures after the explicit-feature audit when tree-shaking matters.

### Common migration failures

- Keeping React imports or compatibility aliases after adopting the native Preact adapter.
- Registering a row model without its feature, or leaving it on table options.
- Assuming `table.atoms` narrows parent renders while the default full selector is still active.
- Supplying controlled state without its per-slice change handler.
- Destructuring prototype-backed methods.
- Renaming pinning state without updating sticky CSS and all region APIs.
- Using the changed “some selected” semantics directly as checkbox indeterminate state.

### API discovery

Inspect `node_modules/@tanstack/preact-table/dist/index.d.ts` and `node_modules/@tanstack/table-core/dist/index.d.ts`. Do not copy React adapter APIs merely because the v8 app used `preact/compat`.

<a id="source-tanstack-preact-table-table-state"></a>

## Table State

Source: `tanstack-preact-table-table-state`.

This skill builds on `@tanstack/table-core#core` and `getting-started`. Preact selection resembles React, but imports and store bindings must remain Preact-native.

### State Mental Model

TanStack Table is primarily a state coordinator. Keep state internal unless another subsystem needs to read, persist, or drive it. With no `initialState`, `atoms`, `state`, or `on[State]Change`, the table owns every registered state slice.

- `table.baseAtoms` are internal writable atoms initialized from resolved initial state.
- `table.atoms` are readonly derived atoms for the active owner of each registered slice.
- `table.store` is the readonly flat store assembled from those atoms.
- `table.state` contains only the result of the second `useTable` selector.

Only registered features contribute state and types. If pagination is absent from `table.atoms`, `table.store`, `table.state`, or table options, add `rowPaginationFeature`; do not cast around the missing API. Keep `features`, `data`, and `columns` stable across renders.

### Setup

```tsx
const table = useTable({ features, columns, data }, (state) => ({
  pagination: state.pagination,
}))
return <output>{table.state.pagination.pageIndex + 1}</output>
```

The selector determines rerenders and the shape exposed on `table.state`; omission selects all registered slices.

### Core Patterns

#### Fine-grained Preact subscription

```tsx
return (
  <table.Subscribe source={table.atoms.rowSelection}>
    {(selection) => <output>{Object.keys(selection).length}</output>}
  </table.Subscribe>
)
```

#### External atom ownership

```tsx
import { useCreateAtom } from '@tanstack/preact-store'
const pagination = useCreateAtom({ pageIndex: 0, pageSize: 20 })
const table = useTable({ features, columns, data, atoms: { pagination } })
```

### Choose State Ownership

Use one owner per slice:

- Prefer internal state and feature APIs when state is local to the table.
- Use `initialState` for starting/reset values; changing it later does not reset current state.
- Prefer a stable `@tanstack/preact-store` atom in `atoms` when state must be shared. Do not pair it with `on[State]Change`.
- Use `state.<slice>` and the matching callback for simple controlled state. Feed the next value back and handle value-or-updater semantics.

External atoms win over external `state`, which syncs into the internal base atom. Do not use two owners intentionally. The v8 global `onStateChange` option is gone; control slices individually or subscribe to `table.store`.

### Initialize, Update, and Reset

Use feature methods (`setSorting`, `nextPage`, `toggleVisibility`, `toggleSelected`) for writes. Write `baseAtoms` only as a rare low-level escape hatch for internal state; write the external atom when it owns the slice.

```tsx
table.resetSorting() // reset to table.initialState.sorting
table.resetPagination()
table.resetPagination(true) // reset to the feature default
```

Slice resets can update an external owner. Core `table.reset()` only resets internal base atoms. Import types such as `PaginationState` for one slice and use `TableState<typeof features>` when a full feature-inferred state type is actually needed.

### Common Mistakes

#### HIGH Reading snapshots as subscriptions

Wrong:

```tsx
const page = table.store.state.pagination.pageIndex
```

Correct:

```tsx
const page = table.state.pagination.pageIndex
```

Store and atom `.get()` reads are snapshots; selected `table.state` or `Subscribe` connects a Preact render.

Source: `packages/preact-table/src/useTable.ts`

#### HIGH Controlling only the callback

Wrong:

```tsx
useTable({ features, columns, data, onPaginationChange: setPagination })
```

Correct:

```tsx
useTable({
  features,
  columns,
  data,
  state: { pagination },
  onPaginationChange: setPagination,
})
```

The callback must write into the value supplied for that controlled slice.

Source: `docs/framework/preact/guide/table-state.md`

#### MEDIUM Narrowing away rendered dependencies

Wrong:

```tsx
const table = useTable(options, (state) => ({ pagination: state.pagination }))
return table.getSelectedRowModel().rows.length
```

Correct:

```tsx
const table = useTable(options, (state) => ({
  pagination: state.pagination,
  rowSelection: state.rowSelection,
}))
return table.getSelectedRowModel().rows.length
```

If render output depends on selection, the owning render boundary must subscribe to it directly or via `Subscribe`.

Source: `examples/preact/basic-subscribe`

### API Discovery

Inspect `node_modules/@tanstack/preact-table/dist/useTable.d.ts` and `Subscribe.d.ts`; use `@tanstack/preact-store` rather than React Store hooks.

<a id="source-tanstack-preact-table-with-tanstack-query"></a>

## With Tanstack Query

Source: `tanstack-preact-table-with-tanstack-query`.

This skill builds on `@tanstack/table-core#client-vs-server`, `getting-started`, and `table-state`. Query fetches already processed rows; Table's manual flags only declare that boundary.

### Setup

```tsx
import { keepPreviousData, useQuery } from '@tanstack/preact-query'
import { useCreateAtom, useSelector } from '@tanstack/preact-store'
import {
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from '@tanstack/preact-table'

const features = tableFeatures({ rowPaginationFeature })
const emptyRows: Array<{ id: string }> = []
const paginationAtom = useCreateAtom({ pageIndex: 0, pageSize: 20 })
const pagination = useSelector(paginationAtom, (value) => value)
const result = useQuery({
  queryKey: ['people', pagination],
  queryFn: () => fetchPeople(pagination),
  placeholderData: keepPreviousData,
})
const table = useTable({
  features,
  columns,
  data: result.data?.rows ?? emptyRows,
  rowCount: result.data?.rowCount,
  atoms: { pagination: paginationAtom },
  manualPagination: true,
})
```

### Core Patterns

#### Key requests by every server-owned slice

```tsx
useQuery({
  queryKey: ['people', pagination, sorting],
  queryFn: () => fetchPeople({ pagination, sorting }),
})
```

#### Pass cached rows directly

```tsx
useTable({ features, columns, data: result.data?.rows ?? emptyRows })
```

### Common Mistakes

#### HIGH Importing React Query APIs

Wrong:

```tsx
import { useQuery } from '@tanstack/react-query'
```

Correct:

```tsx
import { useQuery } from '@tanstack/preact-query'
```

Use native Preact Query and Store integrations throughout the composition.

Source: `examples/preact/with-tanstack-query`

#### HIGH Reusing one cache key

Wrong:

```tsx
useQuery({ queryKey: ['people'], queryFn: () => fetchPeople(pagination) })
```

Correct:

```tsx
useQuery({
  queryKey: ['people', pagination],
  queryFn: () => fetchPeople(pagination),
})
```

Each processed server result needs a key that includes its request state.

Source: `examples/preact/with-tanstack-query`

#### HIGH Expecting manual flags to fetch

Wrong:

```tsx
useTable({ features, columns, data, manualPagination: true })
```

Correct:

```tsx
useTable({
  features,
  columns,
  data: result.data?.rows ?? emptyRows,
  rowCount: result.data?.rowCount,
  manualPagination: true,
})
```

Manual pagination bypasses local processing; it neither calls the backend nor invents totals.

Source: `docs/framework/preact/guide/pagination.md`

### API Discovery

Inspect installed `node_modules/@tanstack/preact-table/dist/index.d.ts` and the relevant core feature source; inspect `@tanstack/preact-query` source for exact query APIs.

<a id="source-tanstack-preact-table-with-tanstack-virtual"></a>

## With Tanstack Virtual

Source: `tanstack-preact-table-with-tanstack-virtual`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Virtual is renderer composition over the final Table model, never a `tableFeatures` slot.

### Setup

```tsx
import { useRef } from 'preact/hooks'
import { useVirtualizer } from '@tanstack/react-virtual' // via preact/compat

const scrollRef = useRef<HTMLDivElement>(null)
const rows = table.getRowModel().rows
const virtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 36,
  getItemKey: (index) => rows[index].id,
  overscan: 5,
})
```

Render a spacer of `getTotalSize()` and position each row from its virtual item's `start`.

### Core Patterns

#### Apply Table's column sizes

```tsx
<td style={{ width: cell.column.getSize() }}>
  <table.FlexRender cell={cell} />
</td>
```

#### Measure dynamic rows by index

```tsx
<div key={row.id} data-index={item.index} ref={virtualizer.measureElement}>
  {row.id}
</div>
```

### Common Mistakes

#### HIGH Looking for a Preact-specific adapter

There is no `@tanstack/preact-virtual` package. In the standard Preact setup that aliases React to `preact/compat`, use the maintained React adapter:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'
```

If the application cannot use the compat alias, integrate the `Virtualizer` class from `@tanstack/virtual-core` directly. That is a lower-level integration with application-owned lifecycle and subscriptions; do not invent Preact hooks around it.

Source: `docs/framework/preact/guide/virtualization.md`

#### HIGH Virtualizing raw data

Wrong:

```tsx
useVirtualizer({ count: data.length, getScrollElement, estimateSize })
```

Correct:

```tsx
const rows = table.getRowModel().rows
useVirtualizer({ count: rows.length, getScrollElement, estimateSize })
```

Raw data omits Table's current filtering, sorting, expansion, grouping, and pagination.

Source: `docs/framework/preact/guide/virtualization.md`

#### HIGH Assuming layout is automatic

Wrong:

```tsx
virtualizer.getVirtualItems().map((item) => <div>{rows[item.index].id}</div>)
```

Correct:

```tsx
virtualizer
  .getVirtualItems()
  .map((item) => (
    <div
      style={{ position: 'absolute', transform: `translateY(${item.start}px)` }}
    >
      {rows[item.index].id}
    </div>
  ))
```

Virtual computes geometry; application markup and CSS must apply it and supply the scroll container/spacer.

Source: `docs/framework/preact/guide/virtualization.md`

### API Discovery

Inspect `node_modules/@tanstack/preact-table/dist/index.d.ts`. For rendering APIs, inspect installed `node_modules/@tanstack/react-virtual/dist/` when using the standard `preact/compat` alias, or `node_modules/@tanstack/virtual-core/dist/` for a direct integration. There is no maintained Preact-specific Virtual package or Table example; start from the Preact guide and translate the maintained React examples only through the compat setup it describes.
