# Getting Started

<a id="source-tanstack-react-table-getting-started"></a>

Published skill · `@tanstack/react-table@9.2.4`.

[Topic index](../framework-react.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).
Prerequisite: [Table Features](./tanstack-table-core-table-features-d2215548.md).

This skill builds on `@tanstack/table-core#core` and `@tanstack/table-core#table-features`. Read them first for the headless model and explicit feature registration.

## Setup

```tsx
import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

type Person = { name: string; age: number }
const features = tableFeatures({})
const helper = createColumnHelper<typeof features, Person>()
const columns = helper.columns([
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age' }),
])

export function PeopleTable() {
  const [data] = useState<Person[]>([{ name: 'Ada', age: 36 }])
  const table = useTable({ features, columns, data })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
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

Table produces models and state; React owns the semantic markup, styles, event affordances, and accessibility.

## Core Patterns

### Add only the feature the table uses

```tsx
import {
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/react-table'

const sortableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
```

Row-model slots belong inside `tableFeatures`, after their prerequisite feature.

### Keep static inputs outside render

```tsx
const features = tableFeatures({})
const data: Person[] = [{ name: 'Ada', age: 36 }]
```

Use state, memoization, or query results for changing data; avoid a new fallback array every render.

## Common Mistakes

### HIGH Copying the v8 table constructor

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

V9 uses `useTable`; optional row models are registered as feature slots rather than table options.

Source: `docs/framework/react/guide/migrating.md`

### HIGH Assuming feature APIs are global

Wrong:

```tsx
const features = tableFeatures({})
```

Correct:

```tsx
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
```

Sorting state and methods do not exist until the sorting feature is registered.

Source: `packages/table-core/src/TableFeatures.ts`

### MEDIUM Recreating fallback data each render

Wrong:

```tsx
const table = useTable({ features, columns, data: response.data ?? [] })
```

Correct:

```tsx
// module scope
const EMPTY_DATA: Person[] = []
const table = useTable({ features, columns, data: response.data ?? EMPTY_DATA })
```

A fresh fallback invalidates data-dependent models on every render.

Source: `docs/framework/react/guide/data.md`

## API Discovery

Inspect `node_modules/@tanstack/react-table/dist/index.d.ts` first, then the exported `useTable.d.ts`, `FlexRender.d.ts`, or core feature source. Use installed declarations so names match the consumer's exact v9 version.
