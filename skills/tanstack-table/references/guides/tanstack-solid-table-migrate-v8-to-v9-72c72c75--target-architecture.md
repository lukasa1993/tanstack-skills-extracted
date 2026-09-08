# Migrate V8 To V9 — Target architecture

[Guide and prerequisites](./tanstack-solid-table-migrate-v8-to-v9-72c72c75.md) · Published skill · `@tanstack/solid-table@9.2.4`.

## Target architecture

```tsx
import {
  createSortedRowModel,
  createTable,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/solid-table'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})

const table = createTable({
  features,
  columns,
  get data() {
    return data()
  },
})
```

Keep static features and columns outside reactive component work. Prefer explicit features as the end state; `stockFeatures` is a kitchen-sink migration shortcut.
