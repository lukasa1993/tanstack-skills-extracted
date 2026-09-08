# Getting Started

<a id="source-tanstack-preact-table-getting-started"></a>

Published skill · `@tanstack/preact-table@9.2.4`.

[Topic index](../framework-preact.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).
Prerequisite: [Table Features](./tanstack-table-core-table-features-d2215548.md).

This skill builds on `@tanstack/table-core#core` and `@tanstack/table-core#table-features`. Use the native Preact adapter, not React through compat.

## Setup

```tsx
import { useState } from 'preact/hooks'
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/preact-table'

type Person = { name: string }
const features = tableFeatures({})
const helper = createColumnHelper<typeof features, Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])

export function PeopleTable() {
  const [data] = useState<Person[]>([{ name: 'Ada' }])
  const table = useTable({ features, columns, data })
  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id}>
                <table.FlexRender header={header} />
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## Core Patterns

### Register only required plugins

```tsx
import {
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/preact-table'
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
```

### Keep features and columns module-stable

```tsx
const features = tableFeatures({})
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
```

## Common Mistakes

### HIGH Importing the React adapter through compat

Wrong:

```tsx
import { useTable } from '@tanstack/react-table'
```

Correct:

```tsx
import { useTable } from '@tanstack/preact-table'
```

The native adapter uses Preact hooks, stores, JSX types, and subscriptions directly.

Source: `docs/framework/preact/guide/migrating.md`

### HIGH Copying the v8 constructor

Wrong:

```tsx
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
})
```

Correct:

```tsx
const table = useTable({ data, columns, features })
```

V9 uses explicit feature slots rather than v8 row-model table options.

Source: `docs/framework/preact/guide/migrating.md`

### MEDIUM Recreating static inputs in render

Wrong:

```tsx
const table = useTable({
  features: tableFeatures({}),
  columns: [{ accessorKey: 'name' }],
  data,
})
```

Correct:

```tsx
const table = useTable({ features, columns, data })
```

New feature and column identities cause needless option and model work.

Source: `examples/preact/basic-use-table`

## API Discovery

Inspect `node_modules/@tanstack/preact-table/dist/index.d.ts`, then `useTable.d.ts`, `Subscribe.d.ts`, or `FlexRender.d.ts`; follow core exports into installed `@tanstack/table-core/dist/`.
