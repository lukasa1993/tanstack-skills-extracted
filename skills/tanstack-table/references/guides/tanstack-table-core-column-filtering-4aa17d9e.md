# Column Filtering

<a id="source-tanstack-table-core-column-filtering"></a>

Published skill · `@tanstack/table-core@9.2.4`.

[Topic index](../data-processing.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).
Prerequisite: [Table Features](./tanstack-table-core-table-features-d2215548.md).
Prerequisite: [Client Vs Server](./tanstack-table-core-client-vs-server-32e9d046.md).

This skill builds on `core`, `table-features`, and `client-vs-server`. Filtering state, row processing, and filter UI are separate concerns.

## Setup

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

## Core Patterns

```ts
const options = {
  filterFromLeafRows: true,
  maxLeafRowFilterDepth: 2,
}
```

Use leaf-first filtering only when a parent should survive because a descendant matches.

## Common Mistakes

### [HIGH] Combining manual and client filtering

Wrong: `const options = { manualFiltering: true }`

Correct: `const options = { manualFiltering: false }`

Manual mode returns the pre-filtered model; send filter state to the server instead if it is `true`.

Source: `packages/table-core/src/features/column-filtering/columnFilteringFeature.types.ts`

### [HIGH] Filtering renderer output

Wrong: `helper.accessor(row => ({ label: row.status }), { filterFn: 'includesString' })`

Correct: `helper.accessor('status', { filterFn: 'includesString' })`

Built-in string and numeric filters expect comparable accessor values, not objects or UI nodes.

Source: `docs/framework/react/guide/column-filtering.md#filterfns`

### [HIGH] Ignoring updater-function callbacks

Wrong: `onColumnFiltersChange: value => { columnFilters = value as ColumnFiltersState }`

Correct: `onColumnFiltersChange: updater => { columnFilters = functionalUpdate(updater, columnFilters) }`

Controlled callbacks receive either a value or a function of previous state.

Source: `packages/table-core/src/features/column-filtering/columnFilteringFeature.types.ts`

## API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/column-filtering/` and `dist/features/column-filtering/filterFns.d.ts` for exact signatures and auto-remove behavior.
