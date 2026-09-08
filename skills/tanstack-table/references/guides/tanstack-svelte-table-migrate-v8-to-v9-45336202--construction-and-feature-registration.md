# Migrate V8 To V9 — Construction and Feature Registration

[Guide and prerequisites](./tanstack-svelte-table-migrate-v8-to-v9-45336202.md) · Published skill · `@tanstack/svelte-table@9.2.4`.

## Construction and Feature Registration

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

### Row-model mapping

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
