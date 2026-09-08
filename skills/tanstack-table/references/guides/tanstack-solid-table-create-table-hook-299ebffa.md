# Create Table Hook

<a id="source-tanstack-solid-table-create-table-hook"></a>

Published skill · `@tanstack/solid-table@9.2.4`.

[Topic index](../framework-solid.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).
Prerequisite: [Getting Started](./tanstack-solid-table-getting-started-c05fd401.md).
Prerequisite: [Table State](./tanstack-solid-table-table-state-6d957041.md).

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Use a factory when tables share policy; keep one-off tables on `createTable`.

## Setup

```tsx
import {
  createTableHook,
  rowSelectionFeature,
  tableFeatures,
} from '@tanstack/solid-table'

export const { createAppColumnHelper, createAppTable, useTableContext } =
  createTableHook({
    features: tableFeatures({ rowSelectionFeature }),
    getRowId: (row: { id: string }) => row.id,
  })
```

## Core Patterns

### Infer columns with the bound helper

```tsx
type Person = { id: string; name: string }
const helper = createAppColumnHelper<Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
```

### Preserve per-table reactivity

```tsx
const table = createAppTable({
  columns,
  get data() {
    return data()
  },
})
return <table.AppTable>{() => <RowCount />}</table.AppTable>
```

## Common Mistakes

### MEDIUM Abstracting a one-off table

Wrong:

```tsx
const app = createTableHook({ features: tableFeatures({}) })
```

Correct:

```tsx
const table = createTable({ features, columns, data })
```

The factory should encode repeated app conventions rather than add ceremony.

Source: `docs/framework/solid/guide/composable-tables.md`

### HIGH Passing per-table snapshots

Wrong:

```tsx
createAppTable({ columns, data: data() })
```

Correct:

```tsx
createAppTable({
  columns,
  get data() {
    return data()
  },
})
```

The getter preserves Solid tracking when the signal changes.

Source: `examples/solid/composable-tables`

### HIGH Reading context outside wrappers

Wrong:

```tsx
return <RowCount />
```

Correct:

```tsx
return <table.AppTable>{() => <RowCount />}</table.AppTable>
```

Returned context hooks must run under the matching factory wrapper; use them instead of prop drilling registered components.

Source: `packages/solid-table/src/createTableHook.tsx`

## API Discovery

Inspect `node_modules/@tanstack/solid-table/dist/createTableHook.d.ts` for exact returned names, component binding, context providers, and reactive option merging.
