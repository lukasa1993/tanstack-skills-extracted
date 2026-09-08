# Migrate V8 To V9 — Target architecture

[Guide and prerequisites](./tanstack-react-table-migrate-v8-to-v9-d475ddab.md) · Published skill · `@tanstack/react-table@9.2.4`.

## Target architecture

```tsx
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

const table = useTable({ features, columns, data })
```

Prefer explicit features as the end state. `stockFeatures` is a useful kitchen-sink migration shortcut, but bundles every stock feature. Do not target `useLegacyTable`: it is deprecated, React-only, exported from `@tanstack/react-table/legacy`, and intended only to keep an existing migration moving temporarily.
