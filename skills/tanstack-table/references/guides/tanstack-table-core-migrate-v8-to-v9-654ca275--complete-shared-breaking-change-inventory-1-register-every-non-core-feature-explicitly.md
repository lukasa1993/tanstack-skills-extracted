# Migrate V8 To V9 — Complete shared breaking-change inventory: 1. Register every non-core feature explicitly

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete shared breaking-change inventory: 1. Register every non-core feature explicitly


V8 bundled all stock features. V9 exposes an API only when its feature is present in `tableFeatures({...})`.

| Capability                  | V9 feature                |
| --------------------------- | ------------------------- |
| Aggregation                 | `rowAggregationFeature`   |
| Cell selection              | `cellSelectionFeature`    |
| Column faceting             | `columnFacetingFeature`   |
| Column filtering            | `columnFilteringFeature`  |
| Column ordering             | `columnOrderingFeature`   |
| Column pinning              | `columnPinningFeature`    |
| Column sizes and offsets    | `columnSizingFeature`     |
| Column visibility           | `columnVisibilityFeature` |
| Global filtering            | `globalFilteringFeature`  |
| Grouping                    | `columnGroupingFeature`   |
| Interactive column resizing | `columnResizingFeature`   |
| Pagination                  | `rowPaginationFeature`    |
| Row expansion               | `rowExpandingFeature`     |
| Row pinning                 | `rowPinningFeature`       |
| Row selection               | `rowSelectionFeature`     |
| Sorting                     | `rowSortingFeature`       |

The core row model and core table/row/column/header/cell behavior are automatic. `stockFeatures` restores a v8-like all-features surface, but use it as an audit shortcut rather than the default production recommendation.

Honor feature prerequisites in the same `tableFeatures` call:

- `columnResizingFeature` requires `columnSizingFeature`.
- `globalFilteringFeature` requires `columnFilteringFeature`.
- Every row-model or function-registry slot requires its associated feature.
- `aggregationFns` requires `rowAggregationFeature`; grouped aggregation uses both `rowAggregationFeature` and `columnGroupingFeature`.
- Put prerequisite feature properties before dependent slots so inference and diagnostics remain clear.
