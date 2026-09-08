# Migrate V8 To V9 — Complete breaking-change map

[Guide and prerequisites](./tanstack-solid-table-migrate-v8-to-v9-72c72c75.md) · Published skill · `@tanstack/solid-table@9.2.4`.

## Complete breaking-change map

### Construction and feature registration

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

### Solid state and reactivity

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

### Rendering and composition

- Replace `flexRender(def, context)` with `<FlexRender header={header} />` or `<table.FlexRender cell={cell} />`.
- Use `tableOptions()` for typed reusable option fragments.
- Use `createTableHook({ features, ...defaults })` for repeated conventions; it returns helpers such as `createAppTable` and `createAppColumnHelper`.
- Invoke row/cell/column/header methods through their instance. Prototype methods lose `this` when extracted and are absent from object spread, `Object.keys`, and JSON. Table-instance methods are not affected.

### TypeScript and helper changes

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

### Shared API and semantic changes

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
