# Solid adapter

Solid Table adapter guidance.

<a id="source-tanstack-solid-table-create-table-hook"></a>

## Create Table Hook

Source: `tanstack-solid-table-create-table-hook`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Use a factory when tables share policy; keep one-off tables on `createTable`.

### Setup

```tsx
import {
  createTableHook,
  rowSelectionFeature,
  tableFeatures,
} from '@tanstack/solid-table'

export const { createAppColumnHelper, createAppTable, useTableContext } =
  createTableHook({
    features: tableFeatures({ rowSelectionFeature }),
    getRowId: (row: { id: string }) => row.id,
  })
```

### Core Patterns

#### Infer columns with the bound helper

```tsx
type Person = { id: string; name: string }
const helper = createAppColumnHelper<Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
```

#### Preserve per-table reactivity

```tsx
const table = createAppTable({
  columns,
  get data() {
    return data()
  },
})
return <table.AppTable>{() => <RowCount />}</table.AppTable>
```

### Common Mistakes

#### MEDIUM Abstracting a one-off table

Wrong:

```tsx
const app = createTableHook({ features: tableFeatures({}) })
```

Correct:

```tsx
const table = createTable({ features, columns, data })
```

The factory should encode repeated app conventions rather than add ceremony.

Source: `docs/framework/solid/guide/composable-tables.md`

#### HIGH Passing per-table snapshots

Wrong:

```tsx
createAppTable({ columns, data: data() })
```

Correct:

```tsx
createAppTable({
  columns,
  get data() {
    return data()
  },
})
```

The getter preserves Solid tracking when the signal changes.

Source: `examples/solid/composable-tables`

#### HIGH Reading context outside wrappers

Wrong:

```tsx
return <RowCount />
```

Correct:

```tsx
return <table.AppTable>{() => <RowCount />}</table.AppTable>
```

Returned context hooks must run under the matching factory wrapper; use them instead of prop drilling registered components.

Source: `packages/solid-table/src/createTableHook.tsx`

### API Discovery

Inspect `node_modules/@tanstack/solid-table/dist/createTableHook.d.ts` for exact returned names, component binding, context providers, and reactive option merging.

<a id="source-tanstack-solid-table-devtools"></a>

## Devtools

Source: `tanstack-solid-table-devtools`.

This skill builds on @tanstack/table-core#core and @tanstack/table-devtools#devtools.

### Setup

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { createTable, tableFeatures } from '@tanstack/solid-table'
import {
  tableDevtoolsPlugin,
  useTanStackTableDevtools,
} from '@tanstack/solid-table-devtools'

const features = tableFeatures({})

export function App() {
  const table = createTable({
    key: 'users-table',
    features,
    columns: [],
    data: [],
  })
  useTanStackTableDevtools(table)
  return <TanStackDevtools plugins={[tableDevtoolsPlugin()]} />
}
```

### Hooks and Components

Register inside the component's Solid owner. Pass `{ enabled }` to the hook for conditional registration.

### Common Mistakes

#### HIGH Registration created outside an owner

Wrong: call the Solid registration hook at module scope.

Correct: call it in the component that owns the table.

The hook uses Solid reactive cleanup to unregister the target.

Source: TanStack/table:packages/solid-table-devtools/src/useTanStackTableDevtools.ts

#### HIGH Missing or reused table key

Wrong: omit `options.key` or share one key between mounted tables.

Correct: assign a stable unique key per live table.

The target registry skips missing keys and replaces duplicate identities.

Source: TanStack/table:packages/table-devtools/src/tableTarget.ts

#### MEDIUM Production entrypoint assumed active

Wrong: expect normal Devtools exports to inspect a production table.

Correct: keep default guidance development-only; use `/production` only on explicit request.

The package index selects no-op implementations outside development.

Source: TanStack/table:packages/solid-table-devtools/src/index.ts

### API Discovery

Inspect `node_modules/@tanstack/solid-table-devtools/dist/index.d.ts`, `useTanStackTableDevtools.d.ts`, and `production.d.ts`.

<a id="source-tanstack-solid-table-getting-started"></a>

## Getting Started

Source: `tanstack-solid-table-getting-started`.

This skill builds on `@tanstack/table-core#core` and `@tanstack/table-core#table-features`. Solid Table supplies reactive models; the application still renders and styles its own headless markup.

### Setup

```tsx
import { For, createSignal } from 'solid-js'
import {
  createColumnHelper,
  createTable,
  tableFeatures,
} from '@tanstack/solid-table'

type Person = { name: string }
const features = tableFeatures({})
const helper = createColumnHelper<typeof features, Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])

export function PeopleTable() {
  const [data] = createSignal<Person[]>([{ name: 'Ada' }])
  const table = createTable({
    features,
    columns,
    get data() {
      return data()
    },
  })
  return (
    <table>
      <thead>
        <For each={table.getHeaderGroups()}>
          {(group) => (
            <tr>
              <For each={group.headers}>
                {(header) => (
                  <th>
                    <table.FlexRender header={header} />
                  </th>
                )}
              </For>
            </tr>
          )}
        </For>
      </thead>
      <tbody>
        <For each={table.getRowModel().rows}>
          {(row) => (
            <tr>
              <For each={row.getAllCells()}>
                {(cell) => (
                  <td>
                    <table.FlexRender cell={cell} />
                  </td>
                )}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}
```

### Core Patterns

#### Expose changing inputs through getters

```tsx
const table = createTable({
  features,
  columns,
  get data() {
    return data()
  },
})
```

#### Keep feature definitions static

```tsx
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
```

### Common Mistakes

#### HIGH Using the v8 constructor

Wrong:

```tsx
const table = createSolidTable({ data: data(), columns })
```

Correct:

```tsx
const table = createTable({
  features,
  columns,
  get data() {
    return data()
  },
})
```

V9 uses `createTable`, explicit features, and reactive option access.

Source: `docs/framework/solid/guide/migrating.md`

#### HIGH Passing a signal snapshot

Wrong:

```tsx
const table = createTable({ features, columns, data: data() })
```

Correct:

```tsx
const table = createTable({
  features,
  columns,
  get data() {
    return data()
  },
})
```

The snapshot is read once; the getter lets the adapter track later signal changes.

Source: `examples/solid/basic-use-table`

#### HIGH Expecting Table to render UI

Wrong:

```tsx
return <div>{table}</div>
```

Correct:

```tsx
return <For each={table.getRowModel().rows}>{(row) => <div>{row.id}</div>}</For>
```

Table is headless; Solid markup, CSS, semantics, and interactions remain renderer-owned.

Source: `packages/solid-table/src/createTable.ts`

### API Discovery

Inspect `node_modules/@tanstack/solid-table/dist/index.d.ts`, then `createTable.d.ts`, `FlexRender.d.ts`, and installed core feature directories.

<a id="source-tanstack-solid-table-migrate-v8-to-v9"></a>

## Migrate V8 To V9

Source: `tanstack-solid-table-migrate-v8-to-v9`.

Read `@tanstack/table-core#migrate-v8-to-v9`, `getting-started`, and `table-state`. Use this as the exhaustive Solid migration checklist. Check the installed declarations before emitting APIs for a different v9 version.

Framework prerequisite: Solid 1.3 or newer (`solid-js >=1.3`).

### Target architecture

```tsx
import {
  createSortedRowModel,
  createTable,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/solid-table'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})

const table = createTable({
  features,
  columns,
  get data() {
    return data()
  },
})
```

Keep static features and columns outside reactive component work. Prefer explicit features as the end state; `stockFeatures` is a kitchen-sink migration shortcut.

### Complete breaking-change map

#### Construction and feature registration

| v8                                                        | v9                                                      |
| --------------------------------------------------------- | ------------------------------------------------------- |
| `createSolidTable(options)`                               | `createTable({ ...options, features })`                 |
| Every feature bundled                                     | Register used `*Feature` objects with `tableFeatures()` |
| `getCoreRowModel()` option                                | Remove it; core is automatic                            |
| `getFilteredRowModel()`                                   | `filteredRowModel: createFilteredRowModel()`            |
| `getSortedRowModel()`                                     | `sortedRowModel: createSortedRowModel()`                |
| `getPaginationRowModel()`                                 | `paginatedRowModel: createPaginatedRowModel()`          |
| `getExpandedRowModel()`                                   | `expandedRowModel: createExpandedRowModel()`            |
| `getGroupedRowModel()`                                    | `groupedRowModel: createGroupedRowModel()`              |
| `getFacetedRowModel()`                                    | `facetedRowModel: createFacetedRowModel()`              |
| `getFacetedMinMaxValues()`                                | `facetedMinMaxValues: createFacetedMinMaxValues()`      |
| `getFacetedUniqueValues()`                                | `facetedUniqueValues: createFacetedUniqueValues()`      |
| Table/factory `sortingFns`, `filterFns`, `aggregationFns` | `sortFns`, `filterFns`, `aggregationFns` feature slots  |
| Removed `rowModels: { ... }`                              | Direct named slots in `tableFeatures()`                 |

In the registry slots, register individually imported built-ins (`filterFn_includesString`, `sortFn_alphanumeric`, `aggregationFn_sum`, and so on) under their conventional keys alongside custom functions; the full `filterFns`/`sortFns`/`aggregationFns` registry objects still work but bundle every built-in.

Place each prerequisite feature before its row-model slot. Stock features are `cellSelectionFeature`, `columnFilteringFeature`, `globalFilteringFeature`, `rowSortingFeature`, `rowPaginationFeature`, `rowSelectionFeature`, `rowExpandingFeature`, `rowPinningFeature`, `columnPinningFeature`, `columnVisibilityFeature`, `columnOrderingFeature`, `columnSizingFeature`, `columnResizingFeature`, `rowAggregationFeature`, `columnGroupingFeature`, and `columnFacetingFeature`. Aggregation is independent from grouping: register `rowAggregationFeature` for aggregation APIs and add `columnGroupingFeature` only for grouped rows.

#### Solid state and reactivity

| v8                             | v9                                                                          |
| ------------------------------ | --------------------------------------------------------------------------- |
| `table.getState()`             | `table.atoms.<slice>.get()` in tracked scopes, or broad `table.store.get()` |
| Top-level `onStateChange`      | Per-slice callbacks or `table.store.subscribe()`                            |
| Eager signal values in options | Getters for reactive `data` and controlled state slices                     |
| Whole-state rendering          | Narrow atom reads, `createMemo`, or `table.Subscribe`                       |

```tsx
const [sorting, setSorting] = createSignal<SortingState>([])
const table = createTable({
  features,
  columns,
  get data() {
    return data()
  },
  state: {
    get sorting() {
      return sorting()
    },
  },
  onSortingChange: setSorting,
})
```

`table.Subscribe` passes atoms to its child. A Solid component child body is untracked, so read atoms inside JSX expressions or a thunk invoked by JSX:

```tsx
<table.Subscribe>
  {(atoms) => <span>Page {atoms.pagination.get().pageIndex + 1}</span>}
</table.Subscribe>
```

Use `createAtom`/`useSelector` from `@tanstack/solid-store` for externally owned slices. An external atom wins over `state` for the same slice; do not combine ownership models accidentally.

#### Rendering and composition

- Replace `flexRender(def, context)` with `<FlexRender header={header} />` or `<table.FlexRender cell={cell} />`.
- Use `tableOptions()` for typed reusable option fragments.
- Use `createTableHook({ features, ...defaults })` for repeated conventions; it returns helpers such as `createAppTable` and `createAppColumnHelper`.
- Invoke row/cell/column/header methods through their instance. Prototype methods lose `this` when extracted and are absent from object spread, `Object.keys`, and JSON. Table-instance methods are not affected.

#### TypeScript and helper changes

| v8                                                                             | v9                                                                               |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `createColumnHelper<Person>()`                                                 | `createColumnHelper<typeof features, Person>()`                                  |
| Plain nested column arrays                                                     | `columnHelper.columns([...])` for `TValue` inference                             |
| `ColumnDef<TData>`                                                             | `ColumnDef<TFeatures, TData, TValue>`                                            |
| `Column<TData>`, `Row<TData>`, `Table<TData>`                                  | Add `TFeatures` first                                                            |
| `Cell<TData, TValue>`                                                          | `Cell<TFeatures, TData, TValue>`                                                 |
| `TableMeta<TData>` / `ColumnMeta<TData, TValue>`                               | Add `TFeatures`, or use per-table `tableMeta` / `columnMeta` with `metaHelper()` |
| Global `FilterFns`, `SortFns`, `AggregationFns`, and `FilterMeta` augmentation | `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta` slots                 |
| `RowData = unknown`                                                            | Record or array row data                                                         |

Infer with `typeof features`; use `StockFeatures` only when deliberately typing `stockFeatures`.

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

Logical pinning does not implement DOM direction styling; use logical CSS insets. `columnResizeDirection` is unchanged.

| v8                                              | v9                                                                         |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| Table `enablePinning`                           | `enableColumnPinning` plus `enableRowPinning`; column-level option remains |
| Combined sizing/resizing                        | `columnSizingFeature`; add `columnResizingFeature` for interaction         |
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

All other underscore-prefixed internals are removed. `getIsSomeRowsSelected()` and `getIsSomePageRowsSelected()` now mean at least one even when all are selected. Use `getIsSomeRowsSelected() && !getIsAllRowsSelected()` or `getIsSomePageRowsSelected() && !getIsAllPageRowsSelected()` for checkbox indeterminate state.

### Migration procedure

1. Replace `createSolidTable` with `createTable` and inventory used features, processing, state, and APIs.
2. Build `tableFeatures()` in prerequisite order; remove `getCoreRowModel` and old row-model placement.
3. Apply all pinning, sizing, sorting, row, and selection mappings above.
4. Update helpers/types with `typeof features`; migrate meta and function augmentation to per-feature slots where appropriate.
5. Preserve Solid tracking with getters for `data` and controlled state; replace `getState()` and `onStateChange`.
6. Choose internal, controlled-signal, or external-atom ownership per slice.
7. Replace unbound row/cell/column/header methods and migrate rendering.
8. Add `tableOptions`, `table.Subscribe`, or `createTableHook` only where composition or fine-grained rendering calls for them.
9. Type-check and exercise every enabled client- and server-side flow.
10. Audit away `stockFeatures` when production tree-shaking matters.

### Final migration checklist

- [ ] Replace createSolidTable with createTable and preserve reactive inputs through getters.
- [ ] Register every used stock feature explicitly and order prerequisites before slots.
- [ ] Remove `getCoreRowModel`; move all eight optional row models into `tableFeatures`.
- [ ] Move `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta` into feature slots.
- [ ] Replace `table.getState()` and onStateChange with tracked atom/store reads, per-slice callbacks, subscriptions, or external atoms.
- [ ] Audit Solid tracking scopes, controlled getters, atom precedence, and reset ownership.
- [ ] Replace unbound/copied row, cell, column, and header methods.
- [ ] Apply the complete logical pinning map and CSS changes.
- [ ] Split pinning options and sizing/resizing; rename the resizing state, setter, and callback.
- [ ] Apply every sorting rename and remove each listed internal API.
- [ ] Pair some-selected with the matching all-selected predicate.
- [ ] Update TFeatures helpers/types, `columns()`, `StockFeatures`, meta/registry slots, and RowData.
- [ ] Migrate Solid FlexRender and use tableOptions/createTableHook only for repeated conventions.
- [ ] Type-check and exercise every enabled client/manual feature and LTR/RTL layout flow.
- [ ] Audit away temporary stockFeatures usage when explicit tree-shaking is intended.

### Common migration failures

- Calling `createTable({ data: data() })` and freezing the initial array instead of providing a getter.
- Leaving row models in table options or omitting their prerequisite feature.
- Reading atoms in an untracked component child body and expecting Solid updates.
- Supplying controlled state without getter properties or per-slice callbacks.
- Destructuring prototype-backed object methods.
- Updating pinning state names but not CSS and region APIs.
- Treating changed “some selected” semantics as checkbox indeterminate state.

### API discovery

Inspect `node_modules/@tanstack/solid-table/dist/index.d.ts` and `node_modules/@tanstack/table-core/dist/index.d.ts`. Compare v8 names only against the migration guide, not current main-branch assumptions.

<a id="source-tanstack-solid-table-table-state"></a>

## Table State

Source: `tanstack-solid-table-table-state`.

This skill builds on `@tanstack/table-core#core` and `getting-started`. Solid-backed atom reads react only inside a tracked scope; there is no React-style selected `table.state` object.

### State Mental Model

TanStack Table is primarily a state coordinator. Let it own state unless another subsystem needs the value. Without `initialState`, `atoms`, `state`, or `on[State]Change`, all registered slices are internal.

- `table.baseAtoms` are internal writable atoms created from initial state.
- `table.atoms` are readonly derived atoms that resolve the active owner of each slice.
- `table.store` combines registered atoms into one readonly flat store.

The Solid adapter backs core atoms with Solid signals and memos. An atom `.get()` participates in dependency tracking only inside JSX, `createMemo`, `createEffect`, or another tracked owner. State is feature-based: no `rowPaginationFeature` means no pagination state, atom, option, or method. Keep `features` and `columns` stable, and expose changing data through a reactive getter rather than rebuilding model inputs in a tracked computation.

### Setup

```tsx
import { createMemo } from 'solid-js'

const table = createTable({
  features,
  columns,
  get data() {
    return data()
  },
})
const selectedCount = createMemo(
  () => Object.keys(table.atoms.rowSelection.get()).length,
)
return <output>{selectedCount()}</output>
```

### Core Patterns

#### Control with a native signal

```tsx
const [sorting, setSorting] = createSignal([])
const table = createTable({
  features,
  columns,
  get data() {
    return data()
  },
  get state() {
    return { sorting: sorting() }
  },
  onSortingChange: setSorting,
})
```

Solid signal setters already accept either a value or an updater function, so pass the setter directly. Wrap it only when adding validation, transformation, or a side effect:

```tsx
onSortingChange: (updater) =>
  setSorting((old) => {
    const next = typeof updater === 'function' ? updater(old) : updater
    logSortingChange(next)
    return next
  })
```

#### Own a slice with an external atom

```tsx
import { createAtom } from '@tanstack/solid-store'
const pagination = createAtom({ pageIndex: 0, pageSize: 20 })
const table = createTable({ features, columns, data, atoms: { pagination } })
```

### Choose State Ownership

Use one owner for each slice:

- Keep state internal and use feature methods for ordinary table-local interaction.
- Use `initialState` for a starting/reset value. Later changes to that object do not reset state.
- Prefer a stable `@tanstack/solid-store` atom through `atoms` when state is shared; feature methods write it directly.
- Use a Solid signal through a reactive `state` getter plus `on[State]Change` for simple controlled state. Resolve raw values and updater functions.

External atoms take precedence over controlled `state`, which syncs into the internal base atom. Do not configure two owners for one slice. The global v8 `onStateChange` option is gone; observe `table.store` when all state changes matter.

### Initialize, Update, and Reset

Prefer feature APIs such as `table.setSorting`, `table.nextPage`, `column.toggleVisibility`, and `row.toggleSelected`. Write `table.baseAtoms` only as a low-level escape hatch for internally owned state, and write the supplied atom when external `atoms` own the slice.

```tsx
table.resetSorting()
table.resetPagination()
table.resetPagination(true)
```

Feature resets use `table.initialState` unless `true` requests the feature default, and they can update an external owner. Core `table.reset()` resets internal base atoms only. Use `PaginationState` or another slice type for external state; use `TableState<typeof features>` for the complete feature-inferred state.

### Common Mistakes

#### HIGH Reading outside a tracked scope

Wrong:

```tsx
const page = table.atoms.pagination.get().pageIndex
setInterval(() => console.log(page), 1000)
```

Correct:

```tsx
const page = createMemo(() => table.atoms.pagination.get().pageIndex)
setInterval(() => console.log(page()), 1000)
```

An atom read only establishes Solid dependencies inside JSX, a memo, an effect, or another tracked owner.

Source: `docs/framework/solid/guide/table-state.md`

#### MEDIUM Adding broad React-style rerenders

Wrong:

```tsx
createEffect(() => {
  JSON.stringify(table.store.state)
  forceUpdate()
})
```

Correct:

```tsx
const count = createMemo(
  () => Object.keys(table.atoms.rowSelection.get()).length,
)
```

Solid should track the narrow atom reads actually used by the computation.

Source: `packages/solid-table/src/createTable.ts`

### API Discovery

Inspect `node_modules/@tanstack/solid-table/dist/createTable.d.ts` and `reactivity.d.ts`; state slice definitions and atom precedence are in installed `@tanstack/table-core/dist/`.

<a id="source-tanstack-solid-table-with-tanstack-query"></a>

## With Tanstack Query

Source: `tanstack-solid-table-with-tanstack-query`.

This skill builds on `@tanstack/table-core#client-vs-server`, `getting-started`, and `table-state`. Query owns remote data; Table receives already processed rows for each manual stage.

### Setup

```tsx
import { keepPreviousData, useQuery } from '@tanstack/solid-query'
import { createAtom, useSelector } from '@tanstack/solid-store'
import {
  createTable,
  rowPaginationFeature,
  tableFeatures,
} from '@tanstack/solid-table'

const features = tableFeatures({ rowPaginationFeature })
const emptyRows: Array<{ id: string }> = []
const paginationAtom = createAtom({ pageIndex: 0, pageSize: 20 })
const pagination = useSelector(paginationAtom)
const result = useQuery(() => ({
  queryKey: ['people', pagination()],
  queryFn: () => fetchPeople(pagination()),
  placeholderData: keepPreviousData,
}))
const table = createTable({
  features,
  columns,
  get data() {
    return result.data?.rows ?? emptyRows
  },
  get rowCount() {
    return result.data?.rowCount
  },
  atoms: { pagination: paginationAtom },
  manualPagination: true,
})
```

### Core Patterns

#### Track every server-owned slice

```tsx
const result = useQuery(() => ({
  queryKey: ['people', pagination(), sorting()],
  queryFn: () => fetchPeople({ pagination: pagination(), sorting: sorting() }),
}))
```

#### Expose query results through getters

```tsx
const table = createTable({
  features,
  columns,
  get data() {
    return result.data?.rows ?? emptyRows
  },
})
```

### Common Mistakes

#### HIGH Snapshotting the query key

Wrong:

```tsx
useQuery({ queryKey: ['people', pagination()], queryFn: fetchPeople })
```

Correct:

```tsx
useQuery(() => ({
  queryKey: ['people', pagination()],
  queryFn: () => fetchPeople(pagination()),
}))
```

Solid Query's options factory tracks signals read while constructing the key and request.

Source: `examples/solid/with-tanstack-query`

#### HIGH Copying React Query state glue

Wrong:

```tsx
useEffect(() => setRows(result.data?.rows ?? []), [result.data])
```

Correct:

```tsx
get data() { return result.data?.rows ?? emptyRows }
```

Solid getters connect the query result directly without a second synchronization layer.

Source: `examples/solid/with-tanstack-query`

#### HIGH Expecting manual mode to process

Wrong:

```tsx
createTable({ features, columns, data, manualPagination: true })
```

Correct:

```tsx
createTable({
  features,
  columns,
  get data() {
    return result.data?.rows ?? emptyRows
  },
  get rowCount() {
    return result.data?.rowCount
  },
  manualPagination: true,
})
```

Manual pagination bypasses the client row model; it does not fetch, page, or count data.

Source: `docs/framework/solid/guide/pagination.md`

### API Discovery

Inspect installed `node_modules/@tanstack/solid-table/dist/createTable.d.ts` and the relevant core feature source; inspect `@tanstack/solid-query` source for reactive option shapes.

<a id="source-tanstack-solid-table-with-tanstack-virtual"></a>

## With Tanstack Virtual

Source: `tanstack-solid-table-with-tanstack-virtual`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Virtualize the final Table model in the renderer; Virtual is not a Table feature.

### Setup

```tsx
import { createVirtualizer } from '@tanstack/solid-virtual'

let scrollElement: HTMLDivElement | undefined
const rows = () => table.getRowModel().rows
const virtualizer = createVirtualizer({
  get count() {
    return rows().length
  },
  getScrollElement: () => scrollElement ?? null,
  estimateSize: () => 36,
  getItemKey: (index) => rows()[index].id,
  overscan: 5,
})
```

### Core Patterns

#### Keep count reactive

```tsx
const virtualizer = createVirtualizer({
  get count() {
    return rows().length
  },
  getScrollElement,
  estimateSize,
})
```

#### Apply measurement and geometry together

```tsx
<tr
  data-index={item.index}
  ref={(node) => virtualizer.measureElement(node)}
  style={{ position: 'absolute', transform: `translateY(${item.start}px)` }}
/>
```

### Common Mistakes

#### HIGH Snapshotting row count

Wrong:

```tsx
createVirtualizer({ count: rows().length, getScrollElement, estimateSize })
```

Correct:

```tsx
createVirtualizer({
  get count() {
    return rows().length
  },
  getScrollElement,
  estimateSize,
})
```

The getter lets Solid Virtual track changes to the final row model.

Source: `examples/solid/virtualized-rows`

#### HIGH Virtualizing raw data

Wrong:

```tsx
const rows = () => data()
```

Correct:

```tsx
const rows = () => table.getRowModel().rows
```

Raw data excludes Table's current sorting, filtering, grouping, expansion, and pagination.

Source: `docs/framework/solid/guide/virtualization.md`

#### HIGH Separating ref lifecycle from virtualizer

Wrong:

```tsx
const scrollElement = document.querySelector('#rows')
const virtualizer = createVirtualizer({
  getScrollElement: () => scrollElement,
  count: 100,
  estimateSize,
})
```

Correct:

```tsx
let scrollElement: HTMLDivElement | undefined
const virtualizer = createVirtualizer({
  getScrollElement: () => scrollElement ?? null,
  get count() {
    return rows().length
  },
  estimateSize,
})
```

Keep the ref and virtualizer in the same owner so observers attach after JSX assigns the element.

Source: `examples/solid/virtualized-rows`

#### HIGH Omitting renderer geometry

Wrong:

```tsx
<For each={virtualizer.getVirtualItems()}>
  {(item) => <tr>{rows()[item.index].id}</tr>}
</For>
```

Correct:

```tsx
<tbody
  style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
>
  <For each={virtualizer.getVirtualItems()}>
    {(item) => (
      <tr
        style={{
          position: 'absolute',
          transform: `translateY(${item.start}px)`,
        }}
      >
        {rows()[item.index].id}
      </tr>
    )}
  </For>
</tbody>
```

Virtual computes positions; the renderer must apply spacer size, transforms, widths, and sticky CSS.

Source: `examples/solid/virtualized-rows`

### API Discovery

Inspect `node_modules/@tanstack/solid-table/dist/index.d.ts` and installed `node_modules/@tanstack/solid-virtual/dist/`; use the maintained row, column, or infinite example for the matching CSS geometry contract.
