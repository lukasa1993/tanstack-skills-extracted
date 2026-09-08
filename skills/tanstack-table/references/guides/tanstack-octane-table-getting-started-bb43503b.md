# Getting Started

<a id="source-tanstack-octane-table-getting-started"></a>

Published skill · `@tanstack/octane-table@9.2.4`.

[Topic index](../framework-octane.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).
Prerequisite: [Table Features](./tanstack-table-core-table-features-d2215548.md).

This skill builds on `@tanstack/table-core#core` and `@tanstack/table-core#table-features`. The adapter publishes authored TypeScript and TSRX, so the consuming app must compile it with Octane's integration.

## Setup

```tsrx
import { createRoot, useState } from 'octane'
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/octane-table'

type Person = { name: string }
const features = tableFeatures({})
const helper = createColumnHelper<typeof features, Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])

function PeopleTable() @{
  const [data] = useState<Person[]>([{ name: 'Ada' }])
  const table = useTable({ features, columns, data })

  <table>
    <thead>
      @for (const group of table.getHeaderGroups(); key group.id) {
        <tr>
          @for (const header of group.headers; key header.id) {
            <th><table.FlexRender header={header} /></th>
          }
        </tr>
      }
    </thead>
    <tbody>
      @for (const row of table.getRowModel().rows; key row.id) {
        <tr>
          @for (const cell of row.getAllCells(); key cell.id) {
            <td><table.FlexRender cell={cell} /></td>
          }
        </tr>
      }
    </tbody>
  </table>
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')
createRoot(rootElement).render(PeopleTable)
```

Configure the app with `octane()` in `vite.config.ts` and set the TSRX compiler's JSX import source to `octane`.

## Core Patterns

### Register only required plugins

```tsrx
import {
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/octane-table'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
```

### Keep features and column definitions module-stable

```tsrx
const features = tableFeatures({})
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
```

Use `useMemo` when a definition genuinely depends on component state. Use `String(value)` for text interpolation when the value is not already a renderable string or number.

### Render adapter helpers as components

```tsrx
<table.FlexRender cell={cell} />
```

`FlexRender` preserves numbers including `0`, descriptors, and Octane component functions. Rendering it as a component lets Octane create the correct component scope.

## Common Mistakes

### HIGH Importing a different framework adapter

Wrong:

```tsrx
import { useTable } from '@tanstack/react-table'
```

Correct:

```tsrx
import { useTable } from '@tanstack/octane-table'
```

The Octane adapter uses Octane hooks, TSRX component scopes, and the matching Octane Store binding.

Source: `packages/octane-table/src/useTable.tsrx`

### HIGH Treating TSRX as React JSX

Wrong:

```tsrx
function PeopleTable() {
  return <table />
}
```

Correct:

```tsrx
function PeopleTable() @{
  <table />
}
```

Author Octane components with TSRX component bodies. Prefer keyed `@for` loops for table rows, headers, and cells so identity survives updates.

Source: `examples/octane/basic-use-table`

### MEDIUM Recreating static inputs in render

Wrong:

```tsrx
const table = useTable({
  features: tableFeatures({}),
  columns: [{ accessorKey: 'name' }],
  data,
})
```

Correct:

```tsrx
const table = useTable({ features, columns, data })
```

New feature and column identities cause needless option and row-model work.

Source: `examples/octane/basic-use-table`

## API Discovery

Inspect `node_modules/@tanstack/octane-table/src/index.d.ts`, then the specific `*.tsrx.d.ts` sidecars and `types.ts`. This package intentionally ships authored source; follow core exports into installed `@tanstack/table-core/dist/`.
