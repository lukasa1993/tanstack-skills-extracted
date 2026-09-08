# Migrate V8 To V9 — Complete breaking-change map: Construction and feature registration

[Guide and prerequisites](./tanstack-react-table-migrate-v8-to-v9-d475ddab.md) · Published skill · `@tanstack/react-table@9.2.4`.

## Complete breaking-change map: Construction and feature registration


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
