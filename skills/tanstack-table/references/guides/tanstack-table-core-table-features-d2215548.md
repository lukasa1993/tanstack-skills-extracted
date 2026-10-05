# Table Features

<a id="source-tanstack-table-core-table-features"></a>

Published skill · `@tanstack/table-core@9.2.6`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).

# Feature architecture

Read [core](./tanstack-table-core-e5f4d128.md#source-tanstack-table-core) first for the headless model and stable inputs.

## Register the behavior the table uses

<!-- skill-snippet:check -->

```ts
import {
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})
```

Pass the stable `features` object to the installed adapter constructor. The concrete registry determines optional APIs, options, state slices, and their types. The core row model is automatic; a custom core model uses `coreRowModel`.

## Registration rules

- Register each prerequisite feature before its dependent slot in the same `tableFeatures` call. A processing factory alone cannot install that feature's APIs or state.
- Row-model factories use `create*RowModel()` feature slots. Their names and prerequisites are in the feature reference. They take no function-registry arguments.
- `filterFns`, `sortFns`, and `aggregationFns` are feature slots, not table options. They require `columnFilteringFeature`, `rowSortingFeature`, and `rowAggregationFeature`, respectively.
- Import individual built-ins such as `sortFn_alphanumeric` and register their conventional keys. Those keys become typed string names; `'auto'` can resolve only registered functions. Pass a function directly when a column needs no named registry entry. Full registry exports bundle every built-in.
- `columnResizingFeature` requires `columnSizingFeature`; `globalFilteringFeature` requires `columnFilteringFeature`. Check installed `FeatureSlotPrereqs` for other dependencies.
- Use explicit features for normal construction. `stockFeatures` is a deliberate all-features convenience or temporary migration aid, with the corresponding bundle cost.

A missing API can mean missing registration. Check the concrete feature object before casting, recreating an API, or assuming v9 removed it.

## Select references by the requested change

Read only references needed for the requested behavior and its dependencies, including features being added. An unrelated feature already registered on the table does not make its reference necessary.

| Task involves                                                                            | Read                                                      |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Manual modes, server data, mixed row-processing stages, or dataset scope                 | [Client/server ownership](../assets/tanstack-table-core-table-features/references/client-vs-server.md) |
| Totals, multiple aggregations, grouped aggregate values, or custom aggregate definitions | [Aggregation](../assets/tanstack-table-core-table-features/references/aggregation.md)                  |
| Facet option counts, numeric ranges, or incomplete server facets                         | [Column faceting](../assets/tanstack-table-core-table-features/references/column-faceting.md)          |
| Per-column filters, filter functions, metadata, or nested-row filtering                  | [Column filtering](../assets/tanstack-table-core-table-features/references/column-filtering.md)        |
| Group rows, placeholders, or grouping with expansion/pagination                          | [Grouping](../assets/tanstack-table-core-table-features/references/grouping.md)                        |
| Drag ordering or leaf-column order differing from state                                  | [Column ordering](../assets/tanstack-table-core-table-features/references/column-ordering.md)          |
| Sticky column regions, logical start/end, or pinning gaps                                | [Column pinning](../assets/tanstack-table-core-table-features/references/column-pinning.md)            |
| Drag resize handles, gesture events, or resize performance                               | [Column resizing](../assets/tanstack-table-core-table-features/references/column-resizing.md)          |
| Numeric widths, min/max limits, or model/CSS size mismatch                               | [Column sizing](../assets/tanstack-table-core-table-features/references/column-sizing.md)              |
| Hidden columns, visibility-aware rendering, or hiding controls                           | [Column visibility](../assets/tanstack-table-core-table-features/references/column-visibility.md)      |
| A search across columns or global-filter eligibility                                     | [Global filtering](../assets/tanstack-table-core-table-features/references/global-filtering.md)        |
| Hierarchical subrows, detail panels, or expansion/page interaction                       | [Expanding](../assets/tanstack-table-core-table-features/references/expanding.md)                      |
| Page slicing, counts, navigation, or page-index resets                                   | [Pagination](../assets/tanstack-table-core-table-features/references/pagination.md)                    |
| Top/bottom pinned rows or their visibility outside the current page                      | [Row pinning](../assets/tanstack-table-core-table-features/references/row-pinning.md)                  |
| Rectangular cell selection, include/exclude ranges, or drag outlines                     | [Cell selection](../assets/tanstack-table-core-table-features/references/cell-selection.md)            |
| Merged body cells, covered cells, or spans changing with row order                       | [Cell spanning](../assets/tanstack-table-core-table-features/references/cell-spanning.md)              |
| Row checkboxes, select-all, Shift ranges, or IDs across pages                            | [Row selection](../assets/tanstack-table-core-table-features/references/row-selection.md)              |
| Sorting, comparators, undefined values, or sort interaction cycles                       | [Sorting](../assets/tanstack-table-core-table-features/references/sorting.md)                          |

For controlled state or reset behavior, read [shared state](./tanstack-table-core-table-state-2001cb1f.md#source-tanstack-table-core-table-state) and load the installed adapter's state skill for reactive wiring.

## Installed API discovery

Inspect `node_modules/@tanstack/table-core/dist/types/TableFeatures.d.ts` for slots and `FeatureSlotPrereqs`. Follow `dist/features/<feature>/` for exact state, option, and instance declarations. Each reference names its feature directory.
