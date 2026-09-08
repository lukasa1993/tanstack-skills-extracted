# Global Filtering

<a id="source-tanstack-table-core-global-filtering"></a>

Published skill · `@tanstack/table-core@9.2.4`.

[Topic index](../data-processing.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).
Prerequisite: [Table Features](./tanstack-table-core-table-features-d2215548.md).
Prerequisite: [Client Vs Server](./tanstack-table-core-client-vs-server-32e9d046.md).
Prerequisite: [Column Filtering](./tanstack-table-core-column-filtering-4aa17d9e.md).

This skill builds on `core`, `table-features`, `client-vs-server`, and `column-filtering`. Global filtering reuses the column-filtering pipeline.

## Setup

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

## Core Patterns

```ts
const options = {
  globalFilterFn: 'includesString' as const,
  getColumnCanGlobalFilter: (column) => column.id !== 'actions',
}
```

Declare eligibility when product rules differ from default primitive-value detection.

## Common Mistakes

### [CRITICAL] Omitting column-filter prerequisite

Wrong: `tableFeatures({ globalFilteringFeature })`

Correct: `tableFeatures({ columnFilteringFeature, globalFilteringFeature, filteredRowModel: createFilteredRowModel() })`

Global filtering depends on column filtering and needs the filtered model for client processing.

Source: `packages/table-core/src/types/TableFeatures.ts#FeatureSlotPrereqs`

### [HIGH] Assuming every column participates

Wrong: `const options = { globalFilterFn: 'includesString' }`

Correct: `const options = { getColumnCanGlobalFilter: column => column.id !== 'actions' }`

Default eligibility uses the first core row and accepts string or number values.

Source: `packages/table-core/src/features/global-filtering/globalFilteringFeature.ts`

### [HIGH] Keeping manual filter local only

Wrong: `table.setGlobalFilter(search); const options = { manualFiltering: true }`

Correct: `const page = await fetchRows({ search }); const options = { data: page.rows, manualFiltering: true }`

Manual filtering bypasses the client model, so the value must drive the server request.

Source: `docs/framework/react/guide/global-filtering.md#manual-server-side-global-filtering`

## API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/global-filtering/` plus `dist/features/column-filtering/` for shared state and filter functions.
