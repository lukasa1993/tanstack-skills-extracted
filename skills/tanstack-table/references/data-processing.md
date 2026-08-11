# Data processing

Sorting, filtering, faceting, grouping, aggregation, pagination, and client/server boundaries.

<a id="source-tanstack-table-core-aggregation"></a>

## Aggregation

Source: `tanstack-table-core-aggregation`.

This skill builds on `core` and `table-features`. Aggregation is independent
from grouping: use it alone for totals, or combine it with the `grouping` skill
for synthetic grouped rows.

### Setup

<!-- skill-snippet:check -->

```ts
import {
  rowAggregationFeature,
  aggregationFn_mean,
  aggregationFn_sum,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  rowAggregationFeature,
  aggregationFns: {
    mean: aggregationFn_mean,
    sum: aggregationFn_sum,
  },
})
```

### Core Patterns

#### Grand total and selected row scopes

```ts
const grandTotal = salaryColumn.getAggregationValue()
const filteredTotal = salaryColumn.getAggregationValue({
  rows: table.getFilteredRowModel().rows,
})
const childTotal = salaryColumn.getAggregationValue({
  rows: table.getCoreRowModel().rows,
  maxDepth: 1,
})
```

The default uses the pre-grouped row model. Explicit rows can come from any row
model or caller-selected subset. `maxAggregationDepth` defaults to `0`, which
selects the supplied roots; `1` selects direct sub-rows, and `Infinity` selects
terminal rows. Branches that end early contribute their deepest available row.
Default calls are cached; explicit-row calls intentionally are not because array
identity and contents are caller-owned. `table.getMaxSubRowDepth()` returns the
deepest structural depth in the core row model.

#### Multiple aggregations

```ts
columnHelper.accessor('salary', {
  aggregationFn: ['mean', { id: 'range', aggregationFn: 'extent' }],
})

const value = salaryColumn.getAggregationValue<{
  mean: number
  range: [number, number]
}>()
```

A scalar option returns a scalar. An array returns a keyed object. Named
functions use their registry name; descriptors provide a stable `id`, which is
required for inline definitions in an array.

#### Custom definitions

```ts
const weightedMean = constructAggregationFn({
  aggregate: ({ rows, getValue }) => {
    const total = rows.reduce((sum, row) => sum + Number(getValue(row)), 0)
    return rows.length ? total / rows.length : undefined
  },
})
```

The context provides depth-selected `rows`, `maxDepth`, `getValue`, `column`,
`columnId`, `table`, and optional grouped-only `groupingRow` and `subRows`.
Every aggregation configured on a column receives the same row frontier. Add
`merge({ subRowResults, subRows, ...context })` when nested groups can more
efficiently combine already-computed sub-row results; otherwise the engine calls
`aggregate` with both row sets. `subRowResults[i]` corresponds to `subRows[i]`.

#### Manual or remote values

Set a column definition's `getAggregationValue(context)` to return `{ value }`
for requests handled by a server or another execution environment. Returning
`undefined` falls back to the local definition. `manualAggregation: true`
disables that local fallback.

### Common Mistakes

#### [HIGH] Adding grouping for a grand total

Wrong: registering `columnGroupingFeature` solely to total a column.

Correct: register `rowAggregationFeature` and call
`column.getAggregationValue()`. Grouping is only required for grouped rows.

#### [HIGH] Passing a scope label and rows

There is no scope option. Call `getAggregationValue()` for the cached default,
or pass a single options object containing rows from the desired row model and
`maxDepth` when the desired frontier is below those rows.

#### [HIGH] Reusing the legacy callable signature

Wrong: `(columnId, leafRows, childRows) => result`.

Correct: `constructAggregationFn({ aggregate: ({ rows, subRows, getValue }) => result })`.

#### [MEDIUM] Assuming arbitrary totals run in the worker

The experimental worker computes grouped row-model aggregates. Public
`getAggregationValue(options?)` totals execute on the main thread, and custom
grouped results sent by the worker must be structured-cloneable.

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/row-aggregation/` and the
Aggregation Guide. Use `Column_RowAggregation`, `AggregationFnDef`,
`AggregationContext`, and `AggregationResult` for the typed public surface.

<a id="source-tanstack-table-core-client-vs-server"></a>

## Client Vs Server

Source: `tanstack-table-core-client-vs-server`.

This skill builds on `core` and `table-features`. Read them first for the model pipeline and plugin slots.

### Setup

```ts
import {
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
})
export const serverOptions = {
  manualSorting: true,
  manualPagination: true,
  rowCount: 12_450,
} as const
```

### Core Patterns

#### Client owns the complete pipeline

```ts
const features = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})
```

Pass the full client dataset so each stage can process all rows.

#### Server owns processing

```ts
const options = {
  data: serverPage.rows,
  manualFiltering: true,
  manualSorting: true,
  manualPagination: true,
  rowCount: serverPage.total,
}
```

Put controlled filter, sorting, and pagination state into the request/query key.

### Common Mistakes

#### [CRITICAL] Treating manual flags as requests

Wrong:

```ts
const options = { manualSorting: true, data: unsortedRows }
```

Correct:

```ts
const sortedPage = await fetchPage({ sorting })
const options = { manualSorting: true, data: sortedPage.rows }
```

`manualSorting` only bypasses client sorting; it never calls a backend.

Source: `packages/table-core/src/features/row-sorting/rowSortingFeature.types.ts`

#### [HIGH] Expecting manual pagination to slice

Wrong:

```ts
const options = { data: allRows, manualPagination: true }
```

Correct:

```ts
const page = await fetchPage({ pageIndex, pageSize })
const options = {
  data: page.rows,
  manualPagination: true,
  rowCount: page.rowCount,
}
```

Manual pagination assumes `data` already represents the intended page. Pass the stable page result directly. If the application deliberately performs custom local slicing instead, derive it with the framework's memo/computed primitive and keep the reference stable until its actual inputs change.

Source: `docs/framework/react/guide/pagination.md#manual-server-side-pagination`

#### [HIGH] Sorting only the loaded page accidentally

Wrong:

```ts
const options = {
  data: serverPage.rows,
  manualPagination: true,
  manualSorting: false,
}
```

Correct:

```ts
const options = {
  data: serverPage.rows,
  manualPagination: true,
  manualSorting: true,
}
```

Client sorting can see only loaded rows, so it cannot produce database-wide order.

Source: `docs/guide/row-models.md`

#### [HIGH] Recreating processed data or columns inline

Wrong:

```ts
const options = {
  data: allRows.filter(matchesFilters).slice(pageStart, pageEnd),
  columns: makeColumns(),
}
```

Correct:

```ts
const processedRows = pageResult.rows
const columns = sharedColumns
const options = { data: processedRows, columns }
```

`data` and `columns` are model inputs. Keep both references stable between meaningful changes with module constants, state, or the adapter's memo/computed primitive; otherwise Table repeatedly invalidates row and column models and some adapters can enter render loops. “Manual” describes processing ownership, not permission to derive new arrays inside table options.

Source: `docs/guide/data.md`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/core/row-models/coreRowModelsFeature.utils.d.ts` for pipeline order and each feature's `.types.d.ts` for its `manual*` contract.

<a id="source-tanstack-table-core-column-faceting"></a>

## Column Faceting

Source: `tanstack-table-core-column-faceting`.

This skill builds on `core`, `table-features`, and `column-filtering`. Faceting derives filter choices; it does not render controls.

### Setup

```ts
import {
  columnFacetingFeature,
  columnFilteringFeature,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  filterFn_includesString,
  filterFn_inNumberRange,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    inNumberRange: filterFn_inNumberRange,
  },
  columnFacetingFeature,
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
})
```

### Core Patterns

```ts
const counts = table.getColumn('status')?.getFacetedUniqueValues() ?? new Map()
const range = table.getColumn('age')?.getFacetedMinMaxValues()
```

Use unique values for discrete controls and min/max only for numeric ranges.
The filtered model makes facets respond to the table's other active filters.
Register individually imported built-ins under their conventional keys so
columns can reference them by string name; a column may instead receive a
filter function directly without registering it. The full `filterFns` registry
object still works but bundles every built-in.

### Common Mistakes

#### [HIGH] Registering APIs without model slots

Wrong: `tableFeatures({ columnFilteringFeature, columnFacetingFeature })`

Correct: `tableFeatures({ columnFilteringFeature, columnFacetingFeature, facetedRowModel: createFacetedRowModel(), facetedUniqueValues: createFacetedUniqueValues() })`

Each faceting getter needs its matching factory slot.

Source: `packages/table-core/src/features/column-faceting/columnFacetingFeature.ts`

#### [MEDIUM] Expecting facet to apply itself

Wrong: `column.getFacetedUniqueValues().get(activeValue) === 0`

Correct: `column.getFacetedUniqueValues().get(activeValue) ?? 0`

A column facet intentionally excludes that column's own filter while applying other filters.

Source: `docs/framework/react/guide/column-faceting.md`

#### [HIGH] Treating page facets as global

Wrong: `const globalCounts = column.getFacetedUniqueValues()`

Correct: `const globalCounts = await fetchFacetCounts(activeFilters)`

With server pagination, client faceting sees only loaded data.

Source: `docs/framework/react/guide/column-faceting.md#custom-server-side-faceting`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/column-faceting/` for exact getters and factory return types.

<a id="source-tanstack-table-core-column-filtering"></a>

## Column Filtering

Source: `tanstack-table-core-column-filtering`.

This skill builds on `core`, `table-features`, and `client-vs-server`. Filtering state, row processing, and filter UI are separate concerns.

### Setup

```ts
import {
  columnFilteringFeature,
  createFilteredRowModel,
  filterFn_includesString,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
})
```

Import individual `filterFn_*` built-ins and register only those your columns
reference by string name or that `filterFn: 'auto'` should resolve for your
data types. The full `filterFns` registry object still works but bundles every
built-in.

### Core Patterns

```ts
const options = {
  filterFromLeafRows: true,
  maxLeafRowFilterDepth: 2,
}
```

Use leaf-first filtering only when a parent should survive because a descendant matches.

### Common Mistakes

#### [HIGH] Combining manual and client filtering

Wrong: `const options = { manualFiltering: true }`

Correct: `const options = { manualFiltering: false }`

Manual mode returns the pre-filtered model; send filter state to the server instead if it is `true`.

Source: `packages/table-core/src/features/column-filtering/columnFilteringFeature.types.ts`

#### [HIGH] Filtering renderer output

Wrong: `helper.accessor(row => ({ label: row.status }), { filterFn: 'includesString' })`

Correct: `helper.accessor('status', { filterFn: 'includesString' })`

Built-in string and numeric filters expect comparable accessor values, not objects or UI nodes.

Source: `docs/framework/react/guide/column-filtering.md#filterfns`

#### [HIGH] Ignoring updater-function callbacks

Wrong: `onColumnFiltersChange: value => { columnFilters = value as ColumnFiltersState }`

Correct: `onColumnFiltersChange: updater => { columnFilters = functionalUpdate(updater, columnFilters) }`

Controlled callbacks receive either a value or a function of previous state.

Source: `packages/table-core/src/features/column-filtering/columnFilteringFeature.types.ts`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/column-filtering/` and `dist/features/column-filtering/filterFns.d.ts` for exact signatures and auto-remove behavior.

<a id="source-tanstack-table-core-global-filtering"></a>

## Global Filtering

Source: `tanstack-table-core-global-filtering`.

This skill builds on `core`, `table-features`, `client-vs-server`, and `column-filtering`. Global filtering reuses the column-filtering pipeline.

### Setup

```ts
import {
  columnFilteringFeature,
  createFilteredRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
})
```

### Core Patterns

```ts
const options = {
  globalFilterFn: 'includesString' as const,
  getColumnCanGlobalFilter: (column) => column.id !== 'actions',
}
```

Declare eligibility when product rules differ from default primitive-value detection.

### Common Mistakes

#### [CRITICAL] Omitting column-filter prerequisite

Wrong: `tableFeatures({ globalFilteringFeature })`

Correct: `tableFeatures({ columnFilteringFeature, globalFilteringFeature, filteredRowModel: createFilteredRowModel() })`

Global filtering depends on column filtering and needs the filtered model for client processing.

Source: `packages/table-core/src/types/TableFeatures.ts#FeatureSlotPrereqs`

#### [HIGH] Assuming every column participates

Wrong: `const options = { globalFilterFn: 'includesString' }`

Correct: `const options = { getColumnCanGlobalFilter: column => column.id !== 'actions' }`

Default eligibility uses the first core row and accepts string or number values.

Source: `packages/table-core/src/features/global-filtering/globalFilteringFeature.ts`

#### [HIGH] Keeping manual filter local only

Wrong: `table.setGlobalFilter(search); const options = { manualFiltering: true }`

Correct: `const page = await fetchRows({ search }); const options = { data: page.rows, manualFiltering: true }`

Manual filtering bypasses the client model, so the value must drive the server request.

Source: `docs/framework/react/guide/global-filtering.md#manual-server-side-global-filtering`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/global-filtering/` plus `dist/features/column-filtering/` for shared state and filter functions.

<a id="source-tanstack-table-core-grouping"></a>

## Grouping

Source: `tanstack-table-core-grouping`.

This skill builds on `core`, `table-features`, and `client-vs-server`. Grouping creates row structure and the renderer chooses grouped-cell UI. Load the separate `aggregation` skill when grouped rows should also calculate values.

### Setup

```ts
import {
  columnGroupingFeature,
  createGroupedRowModel,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  columnGroupingFeature,
  groupedRowModel: createGroupedRowModel(),
})
```

### Core Patterns

```ts
const options = { groupedColumnMode: 'reorder' as const }
const mode = cell.getIsGrouped()
  ? 'grouped'
  : cell.getIsPlaceholder()
    ? 'placeholder'
    : 'value'
```

Render these cell modes deliberately.

### Common Mistakes

#### [HIGH] Registering processing without grouping

Wrong: `tableFeatures({ groupedRowModel: createGroupedRowModel() })`

Correct: `tableFeatures({ columnGroupingFeature, groupedRowModel: createGroupedRowModel() })`

The grouped row-model slot requires `columnGroupingFeature`.

Source: `packages/table-core/src/types/TableFeatures.ts#FeatureSlotPrereqs`

#### [HIGH] Treating rendered rows as underlying records

Wrong: `const leafCount = table.getRowModel().flatRows.filter(row => !row.subRows.length).length`

Correct:

```ts
const countLeafRows = (rows: typeof groupRow.subRows): number =>
  rows.reduce(
    (count, row) =>
      count + (row.subRows.length ? countLeafRows(row.subRows) : 1),
    0,
  )
const leafCount = countLeafRows(groupRow.subRows)
```

Count descendants from one group row rather than the flattened render model,
where group rows and expanded rows may both appear. The current
`table.getRowModel().rows` is render order, while original dataset counts come
from the data owner.

Source: `docs/framework/react/guide/grouping.md`

#### [HIGH] Rendering every cell identically

Wrong: `render(cell.getValue())`

Correct: `render(cell.getIsPlaceholder() ? null : cell.getValue())`

Placeholder cells do not represent ordinary leaf values. Group rows should
only render their grouped cell when aggregation is not enabled.

Source: `examples/react/grouping/src/main.tsx`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/column-grouping/` for
grouping. Load the `aggregation` skill when totals, multiple aggregations,
grouped aggregate values, or custom definitions are part of the task.

<a id="source-tanstack-table-core-pagination"></a>

## Pagination

Source: `tanstack-table-core-pagination`.

This skill builds on `core`, `table-features`, and `client-vs-server`. Choose client slicing or server pages, never both accidentally.

### Setup

```ts
import {
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})
export const initialState = { pagination: { pageIndex: 0, pageSize: 25 } }
```

### Core Patterns

```ts
const serverOptions = { manualPagination: true, rowCount: response.total }
```

Pass one already-processed page and either `rowCount` or `pageCount`.

### Common Mistakes

#### [CRITICAL] Expecting manual mode to slice

Wrong: `const options = { data: allRows, manualPagination: true }`

Correct: `const options = { data: requestedPageRows, manualPagination: true, rowCount: totalRows }`

Manual pagination trusts the provided data as the current page.

Source: `https://github.com/TanStack/table/issues/4917`

#### [HIGH] Omitting the server total

Wrong: `const options = { data: pageRows, manualPagination: true }`

Correct: `const options = { data: pageRows, manualPagination: true, rowCount: 1234 }`

Without a count, last-page and next-page availability cannot reflect the server dataset.

Source: `packages/table-core/src/features/row-pagination/rowPaginationFeature.types.ts`

#### [HIGH] Fighting automatic page resets

Wrong: `onPaginationChange: setPagination`

Correct: `const options = { onPaginationChange: setPagination, autoResetPageIndex: false }`

Client data and processing changes may reset page index; configure the policy when product state must retain it.

Source: `docs/framework/react/guide/pagination.md#auto-reset-page-index`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/row-pagination/` for reset rules, count calculation, and navigation APIs.

<a id="source-tanstack-table-core-sorting"></a>

## Sorting

Source: `tanstack-table-core-sorting`.

This skill builds on `core`, `table-features`, and `client-vs-server`. Sorting state describes order; client processing requires a sorted model and server processing requires sorted input.

### Setup

```ts
import {
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
})
```

Import individual `sortFn_*` built-ins and register only those your columns
reference by string name or that `sortFn: 'auto'` should resolve for your data
types. The full `sortFns` registry object still works but bundles every
built-in; numeric columns fall back to a basic comparator without registration.

### Core Patterns

```ts
const options = { enableSortingRemoval: false, enableMultiSort: true }
const numericColumn = { sortUndefined: 'last' as const }
```

Configure sort cycles and undefined placement to match the product rather than relying on implicit defaults.

### Common Mistakes

#### [CRITICAL] Expecting manual mode to reorder

Wrong: `const options = { data: unsortedRows, manualSorting: true }`

Correct: `const options = { data: serverSortedRows, manualSorting: true }`

Manual sorting bypasses `sortedRowModel` and trusts incoming order.

Source: `packages/table-core/src/features/row-sorting/rowSortingFeature.types.ts`

#### [HIGH] Reversing inside the comparator

Wrong: `const newest: SortFn<any, any> = (a, b, id) => b.getValue<number>(id) - a.getValue<number>(id)`

Correct: `const numeric: SortFn<any, any> = (a, b, id) => a.getValue<number>(id) - b.getValue<number>(id)`

Return ascending comparison only; Table reverses it when sorting is descending.

Source: `docs/framework/react/guide/sorting.md#custom-sorting-functions`

#### [MEDIUM] Leaving ambiguous sort policy

Wrong: `const options = { enableSortingRemoval: true }`

Correct: `const options = { enableSortingRemoval: false }; const rankColumn = { sortUndefined: 'last' as const }`

Undefined placement and removal cycles can differ from expected product behavior unless configured.

Source: `packages/table-core/src/features/row-sorting/rowSortingFeature.types.ts`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/row-sorting/` and `dist/features/row-sorting/sortFns.d.ts` for current names and comparator contracts.
