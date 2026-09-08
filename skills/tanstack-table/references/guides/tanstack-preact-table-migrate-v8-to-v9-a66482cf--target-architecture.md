# Migrate V8 To V9 — Target architecture

[Guide and prerequisites](./tanstack-preact-table-migrate-v8-to-v9-a66482cf.md) · Published skill · `@tanstack/preact-table@9.2.4`.

## Target architecture

```tsx
import {
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/preact-table'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
const table = useTable({ features, columns, data })
```

V8 did not have a first-party Preact adapter; many Preact apps used `@tanstack/react-table` through `preact/compat`. V9 uses native `@tanstack/preact-table`. Remove compatibility aliases that existed only for Table after replacing the imports. Prefer explicit features as the end state; `stockFeatures` is only a kitchen-sink migration shortcut.
