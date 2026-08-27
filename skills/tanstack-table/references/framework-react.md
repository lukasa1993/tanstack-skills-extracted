# React adapter

React Table adapter guidance.

<a id="source-tanstack-react-table-create-table-hook"></a>

## Create Table Hook

Source: `tanstack-react-table-create-table-hook`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Use a factory when multiple tables share real conventions; use standalone `useTable` for a one-off.

### Setup

```tsx
import {
  createTableHook,
  rowSelectionFeature,
  tableFeatures,
} from '@tanstack/react-table'

export const { createAppColumnHelper, useAppTable, useTableContext } =
  createTableHook({
    features: tableFeatures({ rowSelectionFeature }),
    getRowId: (row: { id: string }) => row.id,
  })
```

Keep this factory in an infrastructure module. It binds feature types and defaults once while each `useAppTable` call still supplies its own data, columns, state, and initial state.

### Core Patterns

#### Infer columns through the bound helper

```tsx
type Person = { id: string; name: string }
const helper = createAppColumnHelper<Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])

function People({ data }: { data: Person[] }) {
  const table = useAppTable({ data, columns })
  return (
    <table.AppTable>
      <div>{table.getRowModel().rows.length}</div>
    </table.AppTable>
  )
}
```

`AppTable` takes ordinary JSX children when it has no selector. Function children are only valid with a selector:

```tsx
<table.AppTable selector={(state) => state.rowSelection}>
  {(rowSelection) => <output>{Object.keys(rowSelection).length}</output>}
</table.AppTable>
```

#### Read registered context instead of drilling props

```tsx
function RowCount() {
  const table = useTableContext()
  return <output>{table.getRowModel().rows.length}</output>
}
```

Register reusable table/cell/header components in the factory and consume them under their matching `App*` provider.

#### Isolate genuinely nested table setups

The default module-scoped contexts are HMR-stable, and normal provider scoping already isolates sibling tables. Separate `createTableHook` calls still use those shared default contexts, so nested providers can silently resolve a consumer to the inner table. Create scoped contexts only when different table setups are nested:

```tsx
import {
  createTableHook,
  createTableHookContexts,
  rowSelectionFeature,
  tableFeatures,
} from '@tanstack/react-table'

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

Prefer context hooks returned by `createTableHook`; they include the registered component maps in their types. Hooks returned directly by `createTableHookContexts` know only `TFeatures` and are useful from modules that cannot import the completed factory.

### Common Mistakes

#### MEDIUM Factory for a one-off table

Wrong:

```tsx
const { useAppTable } = createTableHook({ features: tableFeatures({}) })
```

Correct:

```tsx
const table = useTable({ features: tableFeatures({}), columns, data })
```

A factory adds an app-wide abstraction; standalone construction is clearer without shared conventions.

Source: `docs/framework/react/guide/composable-tables.md`

#### HIGH Creating the factory during render

Wrong:

```tsx
function People() {
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
function People() {
  const table = app.useAppTable({ data, columns })
  return (
    <table.AppTable>
      <div />
    </table.AppTable>
  )
}
```

Creating a new factory closure during render makes hook configuration and component registries unstable. Keep the factory and its bound hook identity at module scope.

Source: `packages/react-table/src/createTableHook.tsx`

#### HIGH Closing a circular HMR import

Wrong:

```tsx
// table.ts imports RowCount; RowCount.tsx imports useTableContext from table.ts
export const app = createTableHook({ features, tableComponents: { RowCount } })
```

Correct:

```tsx
// components.tsx receives the exported hook through a cycle-free module boundary
export const app = createTableHook({ features })
```

Keep the factory dependency graph acyclic or inject components from a separate composition root; circular registries can break Vite HMR.

Source: `https://github.com/TanStack/table/issues/6348`

### API Discovery

Inspect `node_modules/@tanstack/react-table/dist/createTableHook.d.ts` and `createTableHookContexts.d.ts` for the exact returned helpers, component registries, wrapper props, and scoped context types.

<a id="source-tanstack-react-table-devtools"></a>

## Devtools

Source: `tanstack-react-table-devtools`.

This skill builds on @tanstack/table-core#core and @tanstack/table-devtools#devtools.

### Setup

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useTable, tableFeatures } from '@tanstack/react-table'
import {
  tableDevtoolsPlugin,
  useTanStackTableDevtools,
} from '@tanstack/react-table-devtools'

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

Use `useTanStackTableDevtools(table, { enabled })` immediately after creating the table. Mount one TanStackDevtools host with `tableDevtoolsPlugin()` near the application root.

### Common Mistakes

#### HIGH Hook receives a keyless table

Wrong: create the table without `key` and expect the hook to infer a name.

Correct: set a unique `key` in table options before calling the hook.

Core target registration skips keyless tables.

Source: TanStack/table:docs/devtools.md

#### HIGH Hook called conditionally

Wrong: call `useTanStackTableDevtools` only inside an `if` branch.

Correct: call it every render and pass `{ enabled: condition }`.

The hook owns React effect registration and cleanup.

Source: TanStack/table:packages/react-table-devtools/src/useTanStackTableDevtools.ts

#### MEDIUM Default import expected in production

Wrong: expect the normal hook/plugin/panel to inspect production tables.

Correct: keep normal guidance development-only; use the `/production` entrypoint only when explicitly required.

The default index selects no-op implementations outside development.

Source: TanStack/table:packages/react-table-devtools/src/index.ts

### API Discovery

Inspect `node_modules/@tanstack/react-table-devtools/dist/index.d.ts` and `useTanStackTableDevtools.d.ts` for the installed lifecycle API.

<a id="source-tanstack-react-table-getting-started"></a>

## Getting Started

Source: `tanstack-react-table-getting-started`.

This skill builds on `@tanstack/table-core#core` and `@tanstack/table-core#table-features`. Read them first for the headless model and explicit feature registration.

### Setup

```tsx
import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

type Person = { name: string; age: number }
const features = tableFeatures({})
const helper = createColumnHelper<typeof features, Person>()
const columns = helper.columns([
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age' }),
])

export function PeopleTable() {
  const [data] = useState<Person[]>([{ name: 'Ada', age: 36 }])
  const table = useTable({ features, columns, data })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
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

Table produces models and state; React owns the semantic markup, styles, event affordances, and accessibility.

### Core Patterns

#### Add only the feature the table uses

```tsx
import {
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/react-table'

const sortableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
```

Row-model slots belong inside `tableFeatures`, after their prerequisite feature.

#### Keep static inputs outside render

```tsx
const features = tableFeatures({})
const data: Person[] = [{ name: 'Ada', age: 36 }]
```

Use state, memoization, or query results for changing data; avoid a new fallback array every render.

### Common Mistakes

#### HIGH Copying the v8 table constructor

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

V9 uses `useTable`; optional row models are registered as feature slots rather than table options.

Source: `docs/framework/react/guide/migrating.md`

#### HIGH Assuming feature APIs are global

Wrong:

```tsx
const features = tableFeatures({})
```

Correct:

```tsx
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
```

Sorting state and methods do not exist until the sorting feature is registered.

Source: `packages/table-core/src/TableFeatures.ts`

#### MEDIUM Recreating fallback data each render

Wrong:

```tsx
const table = useTable({ features, columns, data: response.data ?? [] })
```

Correct:

```tsx
// module scope
const EMPTY_DATA: Person[] = []
const table = useTable({ features, columns, data: response.data ?? EMPTY_DATA })
```

A fresh fallback invalidates data-dependent models on every render.

Source: `docs/framework/react/guide/data.md`

### API Discovery

Inspect `node_modules/@tanstack/react-table/dist/index.d.ts` first, then the exported `useTable.d.ts`, `FlexRender.d.ts`, or core feature source. Use installed declarations so names match the consumer's exact v9 version.

<a id="source-tanstack-react-table-migrate-v8-to-v9"></a>

## Migrate V8 To V9

Source: `tanstack-react-table-migrate-v8-to-v9`.

Read `@tanstack/table-core#migrate-v8-to-v9`, `getting-started`, and `table-state`. Use this skill as the exhaustive migration checklist, not as general API documentation. Inspect the installed `src` files before writing APIs for a different v9 version.

Framework prerequisite: React 18 or newer (`react >=18`).

### Target architecture

```tsx
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

const table = useTable({ features, columns, data })
```

Prefer explicit features as the end state. `stockFeatures` is a useful kitchen-sink migration shortcut, but bundles every stock feature. Do not target `useLegacyTable`: it is deprecated, React-only, exported from `@tanstack/react-table/legacy`, and intended only to keep an existing migration moving temporarily.

### Complete breaking-change map

#### Construction and feature registration

| v8                                             | v9                                                              |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `useReactTable(options)`                       | `useTable({ ...options, features })`                            |
| Every feature bundled automatically            | Register used `*Feature` objects with `tableFeatures()`         |
| `getCoreRowModel()` option                     | Remove it; the core row model is automatic                      |
| `getFilteredRowModel()` option                 | `filteredRowModel: createFilteredRowModel()` feature slot       |
| `getSortedRowModel()` option                   | `sortedRowModel: createSortedRowModel()` feature slot           |
| `getPaginationRowModel()` option               | `paginatedRowModel: createPaginatedRowModel()` feature slot     |
| `getExpandedRowModel()` option                 | `expandedRowModel: createExpandedRowModel()` feature slot       |
| `getGroupedRowModel()` option                  | `groupedRowModel: createGroupedRowModel()` feature slot         |
| `getFacetedRowModel()` option                  | `facetedRowModel: createFacetedRowModel()` feature slot         |
| `getFacetedMinMaxValues()` option              | `facetedMinMaxValues: createFacetedMinMaxValues()` feature slot |
| `getFacetedUniqueValues()` option              | `facetedUniqueValues: createFacetedUniqueValues()` feature slot |
| `sortingFns` table option                      | `sortFns` slot in `tableFeatures()`                             |
| `filterFns` table option/factory argument      | `filterFns` slot in `tableFeatures()`                           |
| `aggregationFns` table option/factory argument | `aggregationFns` slot in `tableFeatures()`                      |
| Removed `rowModels: { ... }` object            | Named row-model slots directly in `tableFeatures()`             |

In the registry slots, register individually imported built-ins (`filterFn_includesString`, `sortFn_alphanumeric`, `aggregationFn_sum`, and so on) under their conventional keys alongside custom functions; the full `filterFns`/`sortFns`/`aggregationFns` registry objects still work but bundle every built-in.

Declare each prerequisite feature before its row-model slot in the same `tableFeatures()` call. Available stock features are `cellSelectionFeature`, `columnFilteringFeature`, `globalFilteringFeature`, `rowSortingFeature`, `rowPaginationFeature`, `rowSelectionFeature`, `rowExpandingFeature`, `rowPinningFeature`, `columnPinningFeature`, `columnVisibilityFeature`, `columnOrderingFeature`, `columnSizingFeature`, `columnResizingFeature`, `rowAggregationFeature`, `columnGroupingFeature`, and `columnFacetingFeature`. Aggregation is independent from grouping: register `rowAggregationFeature` for aggregation APIs and add `columnGroupingFeature` only for grouped rows.

#### State and React subscriptions

| v8                        | v9                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `table.getState()`        | `table.state`, `table.store.state`, or `table.atoms.<slice>.get()`                                                                                     |
| Top-level `onStateChange` | Per-slice `onSortingChange`, `onPaginationChange`, etc., or `table.store.subscribe()` for all changes                                                  |
| Broad component updates   | Default `useTable` selector still subscribes to all registered state; narrow with a selector, `table.Subscribe`, or `useSelector(table.atoms.<slice>)` |
| Framework state only      | Optional writable atoms through `options.atoms`                                                                                                        |

Controlled `state` plus per-slice callbacks remains valid:

```tsx
const [sorting, setSorting] = useState<SortingState>([])
const table = useTable({
  features,
  columns,
  data,
  state: { sorting },
  onSortingChange: setSorting,
})
```

For fine-grained rendering, pass a selector as the second `useTable` argument or select closer to the consumer:

```tsx
const table = useTable(options, () => null)

<table.Subscribe selector={state => state.pagination}>
  {pagination => <span>Page {pagination.pageIndex + 1}</span>}
</table.Subscribe>
```

External atoms override the same slice in `state`; table setters write directly to them, and `table.reset()` does not reset them. Do not supply an atom, controlled value, and callback for the same slice without intentionally applying that precedence.

#### Rendering and composition

- `flexRender(def, context)` still works. Prefer `<table.FlexRender cell={cell} />`, `<table.FlexRender header={header} />`, or the standalone `<FlexRender ... />` for the v9 component form.
- Use `tableOptions()` to type reusable partial option objects.
- Use `createTableHook()` only when several tables share features, row models, defaults, and registered components. It returns app-specific helpers such as `useAppTable`, `createAppColumnHelper`, and table/cell/header context hooks; it is not required for one-off tables.
- Invoke row, cell, column, header, and related methods through their instance. Their methods now live on prototypes, so destructuring, object spread, `Object.keys`, and `JSON.stringify` do not preserve/expose them. Table-instance methods are not affected.

#### TypeScript and helper changes

| v8                                                             | v9                                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `createColumnHelper<Person>()`                                 | `createColumnHelper<typeof features, Person>()`                                             |
| Plain column array                                             | Prefer `columnHelper.columns([...])` to preserve each nested column's `TValue`              |
| `ColumnDef<TData>`                                             | `ColumnDef<TFeatures, TData, TValue>`                                                       |
| `Column<TData>`                                                | `Column<TFeatures, TData, TValue>`                                                          |
| `Table<TData>` / `Row<TData>`                                  | `Table<TFeatures, TData>` / `Row<TFeatures, TData>`                                         |
| `Cell<TData, TValue>`                                          | `Cell<TFeatures, TData, TValue>`                                                            |
| Global `TableMeta<TData>` / `ColumnMeta<TData, TValue>`        | Add `TFeatures` first, or register per-table `tableMeta` / `columnMeta` with `metaHelper()` |
| Augment `FilterFns`, `SortFns`, `AggregationFns`, `FilterMeta` | Register `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta` slots                   |
| `RowData = unknown`                                            | Row data must be a record or array                                                          |

Infer `TFeatures` with `typeof features`. If deliberately using `stockFeatures`, use `StockFeatures`. Do not manually propagate generics when a helper can infer them.

#### Shared API and behavior changes

Column pinning now uses logical regions, with no deprecated aliases:

| v8                                                             | v9                                                            |
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

This is logical table positioning, not automatic DOM-direction styling. Use CSS logical inset properties for sticky layouts. `columnResizeDirection` is unchanged.

Other exact changes:

| v8                                        | v9                                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| Table option `enablePinning`              | `enableColumnPinning` plus `enableRowPinning`; per-column `enablePinning` remains |
| Combined `ColumnSizing`                   | `columnSizingFeature`; add `columnResizingFeature` for interaction                |
| `columnSizingInfo`                        | `columnResizing`                                                                  |
| `setColumnSizingInfo()`                   | `setColumnResizing()`                                                             |
| `onColumnSizingInfoChange`                | `onColumnResizingChange`                                                          |
| `sortingFn`                               | `sortFn`                                                                          |
| `column.getSortingFn()`                   | `column.getSortFn()`                                                              |
| `column.getAutoSortingFn()`               | `column.getAutoSortFn()`                                                          |
| `SortingFn` / `SortingFns` / `sortingFns` | `SortFn` / `SortFns` / `sortFns`                                                  |
| `row._getAllCellsByColumnId()`            | `row.getAllCellsByColumnId()`                                                     |
| `table._getPinnedRows()`                  | `getTopRows()`, `getCenterRows()`, or `getBottomRows()`                           |
| `table._getFacetedRowModel()`             | Public faceting APIs on the relevant column/table                                 |
| `table._getFacetedMinMaxValues()`         | `getFacetedMinMaxValues()`                                                        |
| `table._getFacetedUniqueValues()`         | `getFacetedUniqueValues()`                                                        |

All other underscore-prefixed internals are removed. `getIsSomeRowsSelected()` and `getIsSomePageRowsSelected()` now mean **at least one**, including when all are selected. Compute indeterminate state with `getIsSomeRowsSelected() && !getIsAllRowsSelected()` or `getIsSomePageRowsSelected() && !getIsAllPageRowsSelected()`.

### Migration procedure

1. Upgrade imports and replace `useReactTable` with `useTable`.
2. Inventory every used state slice, table/column/row method, row model, function registry, and internal `_` API.
3. Build `tableFeatures()` with the corresponding features first, followed by row-model and registry slots; remove `getCoreRowModel`.
4. Apply every mapping above, including physical-to-logical pinning and the sizing/resizing split.
5. Add `typeof features` to helpers and explicit public types; migrate meta and function registry augmentation.
6. Replace `getState()` and `onStateChange`; choose internal, controlled per-slice, or external-atom ownership deliberately.
7. Audit destructured object methods and shallow clones of rows/cells/columns/headers.
8. Migrate rendering and optionally introduce `tableOptions`, `table.Subscribe`, or `createTableHook` where they solve an actual composition/render boundary.
9. Type-check, then exercise sorting, filtering, grouping, pagination, expansion, pinning, resizing, selection, and controlled/server-side flows that the table uses.
10. Remove `stockFeatures` after the feature audit if bundle specificity matters; remove `useLegacyTable` rather than treating it as the destination.

### Final migration checklist

- [ ] Replace `useReactTable` with `useTable`; remove any temporary `useLegacyTable` endpoint.
- [ ] Register every used stock feature explicitly and put each prerequisite before its dependent slot.
- [ ] Remove `getCoreRowModel`; move all eight optional row-model factories into `tableFeatures`.
- [ ] Move `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta` into feature slots.
- [ ] Replace `table.getState()` and top-level `onStateChange`; choose selectors, per-slice callbacks, store subscription, or external atoms deliberately.
- [ ] Audit external-atom precedence/reset ownership and every controlled slice update path.
- [ ] Replace destructured, spread, serialized, or bare-callback row/cell/column/header methods.
- [ ] Replace every pinning state key, argument, comparison, method family, and sticky CSS use of left/right with start/end.
- [ ] Split `enablePinning`; split sizing/resizing and rename its state, setter, and callback.
- [ ] Apply every sorting option, method, type, interface, and built-in registry rename.
- [ ] Remove each listed underscore-prefixed internal API and use the public replacement.
- [ ] Rebuild indeterminate selection checks with the matching all-selected predicate.
- [ ] Update helpers and explicit public types for `TFeatures`; use `columns()` and `StockFeatures` where applicable.
- [ ] Update meta generics or per-table meta slots; replace function/meta augmentation with registry slots.
- [ ] Ensure `RowData` is a record or array.
- [ ] Migrate FlexRender usage; adopt `tableOptions` or `createTableHook` only where repeated composition warrants it.
- [ ] Type-check and test every enabled client/manual feature flow, including LTR/RTL pinning and resizing.
- [ ] Audit away temporary `stockFeatures` usage when explicit tree-shaking is the intended end state.

### Common migration failures

- An API is missing because its feature was not registered, not because v9 removed it.
- A row model is placed in table options or an obsolete `rowModels` object instead of its feature slot.
- A controlled value is supplied without its matching per-slice callback, freezing that slice.
- A React parent still re-renders for every table update because the default selector was retained while assuming atom reads alone narrowed it.
- An extracted `row.getValue`, `cell.getContext`, or column/header method loses `this`.
- Sticky pinning is renamed in state but not in CSS or every header/row sizing call.
- An indeterminate selection checkbox stays indeterminate when all rows are selected.

### API discovery

Inspect `node_modules/@tanstack/react-table/dist/index.d.ts` and `node_modules/@tanstack/table-core/dist/index.d.ts` for the installed v9 exports and types. Inspect `dist/legacy.d.ts` only to identify temporary bridge code that remains to be removed.

<a id="source-tanstack-react-table-table-state"></a>

## Table State

Source: `tanstack-react-table-table-state`.

This skill builds on `@tanstack/table-core#core` and `getting-started`. Read them first for table construction and feature-owned state.

### State Mental Model

TanStack Table is primarily a state coordinator. Keep state internal unless another subsystem needs to read, persist, validate, or drive it. With no `initialState`, `atoms`, `state`, or `on[State]Change` options, the table owns all registered slices.

- `table.baseAtoms` are the internal writable atoms initialized from resolved initial state.
- `table.atoms` are readonly derived atoms for the active owner of each registered slice.
- `table.store` combines those atoms into one readonly flat store.
- `table.state` is only the value selected by the second `useTable` argument.

State is feature-based. Registering `rowPaginationFeature` creates pagination state and APIs; without it, `pagination` must not exist in `initialState`, `state`, `atoms`, `table.atoms`, `table.store`, or `table.state`. Treat a missing state API as a likely missing feature import, not a typing problem.

Keep `features`, `data`, and `columns` stable. State subscriptions do not compensate for new model-input references on every render.

### Setup

```tsx
import {
  rowSelectionFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

const features = tableFeatures({ rowSelectionFeature })

export function SelectionCount({
  data,
  columns,
}: {
  data: Array<{ id: string }>
  columns: any[]
}) {
  const table = useTable({ features, data, columns }, (state) => ({
    rowSelection: state.rowSelection,
  }))
  return <output>{Object.keys(table.state.rowSelection).length}</output>
}
```

The optional selector controls which state changes rerender the component and which selected fields appear on `table.state`. Omitting it selects all registered slices.

### Core Patterns

#### Subscribe at the expensive boundary

```tsx
function SelectedRows({
  table,
}: {
  table: ReturnType<typeof useTable<typeof features, { id: string }>>
}) {
  return (
    <table.Subscribe selector={(state) => state.rowSelection}>
      {(rowSelection) => <output>{Object.keys(rowSelection).length}</output>}
    </table.Subscribe>
  )
}
```

At a top-level component holding the adapter's table instance, `table.Subscribe` selects from `table.store`. Use this after measuring or when the React Compiler cannot see state reads hidden behind table builder methods.

#### Control a slice with an external atom

```tsx
import { useCreateAtom } from '@tanstack/react-store'

const selection = useCreateAtom<Record<string, boolean>>({})
const table = useTable({
  features,
  columns,
  data,
  atoms: { rowSelection: selection },
})
```

An external atom is both ownership and subscription source; it avoids value-or-updater glue.

#### Control a slice with React state

```tsx
const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
const table = useTable({
  features,
  columns,
  data,
  state: { rowSelection },
  onRowSelectionChange: setRowSelection,
})
```

### Choose State Ownership

Choose exactly one owner for each slice:

1. Use internal state by default and call feature APIs such as `table.setSorting`, `table.nextPage`, `column.toggleVisibility`, or `row.toggleSelected`.
2. Use `initialState.<slice>` only to set the starting and reset value. Changing `initialState` later does not reset the table.
3. Prefer a stable external atom in `atoms.<slice>` when Table, Query, routing, or another component must share the slice. Table APIs write that atom directly; do not also add `on[State]Change`.
4. Use `state.<slice>` plus its matching `on[State]Change` for simple React-controlled state or Table V8-style integrations. Always resolve both raw values and updater functions.

External atoms take precedence over external `state`; external `state` synchronizes into the internal base atom. Do not declare the same slice in multiple ownership options and rely on precedence as application logic. The global Table V8 `onStateChange` callback is gone in Table V9; control slices individually or subscribe to `table.store` to observe all state.

### Initialize, Update, and Reset

Prefer feature methods over direct atom writes because feature methods preserve related behavior. `table.baseAtoms.pagination.set(...)` is a low-level escape hatch only for internally owned state; write the supplied external atom when `atoms.pagination` owns the slice.

Feature reset methods reset to `table.initialState` by default:

```tsx
table.resetSorting()
table.resetPagination()
table.resetPagination(true) // feature blank/default state
```

Slice reset methods flow through that feature's updater and can update an external owner. Core `table.reset()` resets internal base atoms, so it is not the primary reset mechanism for externally owned atoms.

Use feature-specific types for owned slices and infer the full state from the feature set:

```tsx
import type { PaginationState, TableState } from '@tanstack/react-table'

type AppTableState = TableState<typeof features>
const initialPagination: PaginationState = { pageIndex: 0, pageSize: 20 }
```

### Common Mistakes

#### HIGH Treating a snapshot as subscription

Wrong:

```tsx
const count = Object.keys(table.atoms.rowSelection.get()).length
```

Correct:

```tsx
const count = Object.keys(table.state.rowSelection).length
```

`atoms.*.get()` and `table.store.state` return current values but do not subscribe a React render.

Source: `packages/react-table/src/useTable.ts`

#### HIGH Supplying only the change callback

Wrong:

```tsx
const table = useTable({
  features,
  columns,
  data,
  onRowSelectionChange: setRowSelection,
})
```

Correct:

```tsx
const table = useTable({
  features,
  columns,
  data,
  state: { rowSelection },
  onRowSelectionChange: setRowSelection,
})
```

Once a callback takes ownership, the corresponding controlled value must be written back.

Source: `docs/framework/react/guide/table-state.md`

#### HIGH Hiding builder reads from the React Compiler

Wrong:

```tsx
function SelectionCell({ row }) {
  return (
    <input
      type="checkbox"
      checked={row.getIsSelected()}
      onChange={row.getToggleSelectedHandler()}
    />
  )
}
```

Correct:

```tsx
import { Subscribe } from '@tanstack/react-table'

function SelectionCell({ row }) {
  return (
    <Subscribe
      source={row.table.atoms.rowSelection}
      selector={(selection) => selection[row.id]}
    >
      {(selected) => (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={row.getToggleSelectedHandler()}
        />
      )}
    </Subscribe>
  )
}
```

With the default selector, `useTable` returns a fresh React-facing table reference on state changes. The remaining hazard is a nested component receiving only a stable core table, row, cell, column, or header object and hiding a state read behind one of its methods. Keep `Subscribe` inside that component, or pass its selected value to the child as a changing prop. An outer `Subscribe` that ignores the selected value is not enough.

Inside cell and header render contexts, `table` is typed as core `Table`, so import standalone `Subscribe`. Use `source={table.store}` with a selector for multiple slices, or a specific atom for the narrowest boundary.

Source: `docs/framework/react/guide/react-compiler.md`

#### MEDIUM Optimizing every cell preemptively

Wrong:

```tsx
<table.Subscribe source={table.atoms.rowSelection}>
  {() => <Cell cell={cell} />}
</table.Subscribe>
```

Correct:

```tsx
<Cell cell={cell} />
```

Default `useTable` state selection is the simpler starting point; introduce fine-grained boundaries where measurement or compiler behavior justifies them.

Source: `docs/framework/react/guide/table-state.md`

### API Discovery

Inspect `node_modules/@tanstack/react-table/dist/useTable.d.ts` and `Subscribe.d.ts`. Core atom precedence and state slices live under `node_modules/@tanstack/table-core/dist/`.

<a id="source-tanstack-react-table-with-tanstack-query"></a>

## With Tanstack Query

Source: `tanstack-react-table-with-tanstack-query`.

This skill builds on `@tanstack/table-core#client-vs-server`, `getting-started`, and `table-state`. Query owns fetching/cache; Table owns grid state and receives rows already processed by every manual server stage.

### Setup

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCreateAtom, useSelector } from '@tanstack/react-store'
import {
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { PaginationState } from '@tanstack/react-table'

const features = tableFeatures({ rowPaginationFeature })
const emptyRows: Array<{ id: string }> = []

function ServerTable() {
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const pagination = useSelector(paginationAtom, (value) => value)
  const result = useQuery({
    queryKey: ['people', pagination],
    queryFn: async () =>
      fetch(
        `/api/people?page=${pagination.pageIndex}&size=${pagination.pageSize}`,
      ).then(
        (r) =>
          r.json() as Promise<{
            rows: Array<{ id: string }>
            rowCount: number
          }>,
      ),
    placeholderData: keepPreviousData,
  })
  return useTable({
    features,
    columns,
    data: result.data?.rows ?? emptyRows,
    rowCount: result.data?.rowCount,
    atoms: { pagination: paginationAtom },
    manualPagination: true,
  })
}
```

### Core Patterns

#### Put every server-owned slice in the key

```tsx
const result = useQuery({
  queryKey: ['people', pagination, sorting, columnFilters],
  queryFn: () => fetchPeople({ pagination, sorting, columnFilters }),
})
```

#### Feed the query result directly to Table

```tsx
const table = useTable({
  features,
  columns,
  data: result.data?.rows ?? emptyRows,
})
```

### Common Mistakes

#### HIGH Duplicating query rows into state

Wrong:

```tsx
useEffect(() => setRows(result.data?.rows ?? []), [result.data])
const table = useTable({ features, columns, data: rows })
```

Correct:

```tsx
const table = useTable({
  features,
  columns,
  data: result.data?.rows ?? emptyRows,
})
```

The second state layer can lag behind the query cache and creates an extra synchronization path.

Source: `examples/react/with-tanstack-query`

#### HIGH Omitting state from the query key

Wrong:

```tsx
useQuery({ queryKey: ['people'], queryFn: () => fetchPeople({ pagination }) })
```

Correct:

```tsx
useQuery({
  queryKey: ['people', pagination],
  queryFn: () => fetchPeople({ pagination }),
})
```

Query otherwise reuses cache entries for different server requests.

Source: `examples/react/with-tanstack-query`

#### HIGH Expecting manual mode to fetch

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

`manualPagination` only bypasses client pagination; the application must fetch a processed page and provide its total count.

Source: `docs/framework/react/guide/pagination.md`

#### MEDIUM Flashing an empty page during fetch

Wrong:

```tsx
useQuery({
  queryKey: ['people', pagination],
  queryFn: () => fetchPeople({ pagination }),
})
```

Correct:

```tsx
useQuery({
  queryKey: ['people', pagination],
  queryFn: () => fetchPeople({ pagination }),
  placeholderData: keepPreviousData,
})
```

Preserve the previous page intentionally when an empty loading transition is undesirable.

Source: `examples/react/with-tanstack-query`

### API Discovery

Inspect `node_modules/@tanstack/react-table/dist/index.d.ts` and the relevant core feature source; inspect the installed `@tanstack/react-query` source for current query option types.

<a id="source-tanstack-react-table-with-tanstack-virtual"></a>

## With Tanstack Virtual

Source: `tanstack-react-table-with-tanstack-virtual`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Build the Table model first, then virtualize its final rendered rows or visible columns.

### Setup

```tsx
import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualBody({ table }: { table: any }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rows = table.getRowModel().rows
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 36,
    getItemKey: (index) => rows[index].id,
    overscan: 5,
  })
  return (
    <div ref={scrollRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={rows[item.index].id}
            data-index={item.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              transform: `translateY(${item.start}px)`,
              width: '100%',
            }}
          >
            {rows[item.index].getAllCells().map((cell: any) => (
              <span
                key={cell.id}
                style={{
                  display: 'inline-block',
                  width: cell.column.getSize(),
                }}
              >
                <table.FlexRender cell={cell} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Core Patterns

#### Keep the virtualizer near its render loop

```tsx
const rows = table.getRowModel().rows
const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => container.current,
  estimateSize: () => 36,
})
```

This limits unrelated parent updates and keeps count, measurement, and rendered items together.

#### Use Table sizes in renderer CSS

```tsx
<td style={{ width: cell.column.getSize() }}>
  <table.FlexRender cell={cell} />
</td>
```

Table calculates size state; the renderer must apply it.

### Common Mistakes

#### HIGH Registering Virtual as a feature

Wrong:

```tsx
const features = tableFeatures({ rowVirtualizer: useVirtualizer(options) })
```

Correct:

```tsx
const rows = table.getRowModel().rows
const virtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 36,
})
```

Virtual controls rendering geometry and is not a Table feature or row model.

Source: `docs/framework/react/guide/virtualization.md`

#### HIGH Virtualizing raw input data

Wrong:

```tsx
const virtualizer = useVirtualizer({
  count: data.length,
  getScrollElement,
  estimateSize,
})
```

Correct:

```tsx
const rows = table.getRowModel().rows
const virtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement,
  estimateSize,
})
```

Raw data ignores filtering, sorting, expansion, grouping, and pagination already applied by Table.

Source: `examples/react/virtualized-rows`

#### HIGH Measuring against incomplete identity

Wrong:

```tsx
<tr ref={virtualizer.measureElement}>{row.id}</tr>
```

Correct:

```tsx
<tr key={row.id} data-index={item.index} ref={virtualizer.measureElement}>
  {row.id}
</tr>
```

Dynamic measurement needs the virtual index, and stable row identity prevents measurements moving to the wrong row.

Source: `examples/react/virtualized-rows`

#### HIGH Omitting positioning geometry

Wrong:

```tsx
<tbody>{virtualizer.getVirtualItems().map(renderRow)}</tbody>
```

Correct:

```tsx
<tbody
  style={{
    display: 'grid',
    height: virtualizer.getTotalSize(),
    position: 'relative',
  }}
>
  {virtualizer.getVirtualItems().map(renderRow)}
</tbody>
```

Virtual only computes positions; the renderer must provide total spacer size and position items using each virtual start.

Source: `examples/react/virtualized-rows`

### API Discovery

Inspect `node_modules/@tanstack/react-table/dist/index.d.ts` for Table render APIs and installed `node_modules/@tanstack/react-virtual/dist/` for the exact virtualizer options. Copy layout contracts from the maintained example matching rows, columns, or infinite loading.
