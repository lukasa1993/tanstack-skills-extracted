# Migrate V8 To V9 — Complete breaking-change map

[Guide and prerequisites](./tanstack-preact-table-migrate-v8-to-v9-a66482cf.md) · Published skill · `@tanstack/preact-table@9.2.4`.

## Complete breaking-change map

### Adapter, construction, and features

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

### Preact state and subscriptions

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

### Rendering and composition

- Replace React-adapter `flexRender(def, context)` with `<table.FlexRender cell={cell} />` or standalone `<FlexRender ... />`; the function remains for advanced cases.
- Use `tableOptions()` for typed reusable option fragments.
- Use `createTableHook({ features, ...defaults })` for repeated app table conventions; it returns native app helpers such as `useAppTable` and `createAppColumnHelper`.
- Call row/cell/column/header methods on their instance. Prototype methods lose `this` when destructured and do not appear in object spread, `Object.keys`, or JSON. Table-instance methods are not affected.

### TypeScript and helpers

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
