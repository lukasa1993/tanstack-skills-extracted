# Migrate V8 To V9 — Minimal v9 shape

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Minimal v9 shape

```ts
import {
  createFilteredRowModel,
  createSortedRowModel,
  columnFilteringFeature,
  filterFn_includesString,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric },
})
```

Pass `features` to the adapter's v9 table constructor. Define it statically outside render/setup work when possible.
