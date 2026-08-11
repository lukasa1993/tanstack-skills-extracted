# Octane adapter

Octane Table adapter guidance.

<a id="source-tanstack-octane-table-create-table-hook"></a>

## Create Table Hook

Source: `tanstack-octane-table-create-table-hook`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Use the app hook for repeated conventions; keep a one-off table on `useTable`.

### Setup

```tsrx
import {
  createTableHook,
  rowSelectionFeature,
  tableFeatures,
} from '@tanstack/octane-table'

export const { createAppColumnHelper, useAppTable, useTableContext } =
  createTableHook({
    features: tableFeatures({ rowSelectionFeature }),
    getRowId: (row: { id: string }) => row.id,
  })
```

Create the factory at module scope. Its wrappers have stable identities and read the latest table facade without remounting their child subtrees.

### Core Patterns

#### Use the factory-bound helper

```tsrx
type Person = { id: string; name: string }
const helper = createAppColumnHelper<Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
```

#### Consume typed context under its wrapper

```tsrx
function RowCount() @{
  const table = useTableContext()
  <output>{String(table.getRowModel().rows.length)}</output>
}

function Grid() @{
  const table = useAppTable({ data, columns })
  <table.AppTable><RowCount /></table.AppTable>
}
```

`AppTable` takes static children without a selector. Use function children when a selector supplies their value:

```tsrx
<table.AppTable selector={(state) => state.rowSelection}>
  {(rowSelection) => <output>{String(Object.keys(rowSelection).length)}</output>}
</table.AppTable>
```

Render `AppTable`, `AppCell`, `AppHeader`, `AppFooter`, and registered components with JSX. The wrappers establish context and independent Octane scopes.

#### Isolate genuinely nested table setups

Default contexts are module-scoped and HMR-stable. Sibling tables are isolated by their providers, but nested factories can resolve a consumer to the inner provider. Create fresh contexts for distinct nested setups:

```tsrx
import {
  createTableHook,
  createTableHookContexts,
  rowSelectionFeature,
  tableFeatures,
} from '@tanstack/octane-table'

const features = tableFeatures({ rowSelectionFeature })
const { tableContext, cellContext, headerContext } =
  createTableHookContexts<typeof features>()

export const app = createTableHook({
  features,
  tableContext,
  cellContext,
  headerContext,
})
```

Prefer hooks returned by `createTableHook` because their types include registered component maps.

### Common Mistakes

#### MEDIUM Abstracting a single table

Wrong:

```tsrx
const app = createTableHook({ features: tableFeatures({}) })
```

Correct:

```tsrx
const table = useTable({ features, columns, data })
```

The factory is valuable when it centralizes repeated policy, registered renderers, or typed context—not merely as another constructor name.

Source: `docs/framework/octane/guide/composable-tables.md`

#### HIGH Reading outside the matching provider

Wrong:

```tsrx
function Grid() @{
  <RowCount />
}
```

Correct:

```tsrx
function Grid() @{
  const table = useAppTable({ data, columns })
  <table.AppTable><RowCount /></table.AppTable>
}
```

Factory context hooks throw actionable errors when the matching `AppTable`, `AppCell`, or `AppHeader` provider is missing.

Source: `packages/octane-table/src/createTableHook.tsrx`

#### HIGH Recreating the factory during render

Wrong:

```tsrx
function Grid() @{
  const app = createTableHook({ features })
  const table = app.useAppTable({ data, columns })
  <table.AppTable />
}
```

Correct:

```tsrx
const app = createTableHook({ features })

function Grid() @{
  const table = app.useAppTable({ data, columns })
  <table.AppTable />
}
```

A factory created during render makes hook configuration, wrappers, contexts, and registered component identities unstable.

Source: `packages/octane-table/src/createTableHook.tsrx`

### API Discovery

Inspect `node_modules/@tanstack/octane-table/dist/createTableHook.d.ts`, `createTableHookContexts.d.ts`, and `types.d.ts` for exact return names, wrapper props, registries, and scoped context types.

<a id="source-tanstack-octane-table-getting-started"></a>

## Getting Started

Source: `tanstack-octane-table-getting-started`.

This skill builds on `@tanstack/table-core#core` and `@tanstack/table-core#table-features`. The adapter publishes authored TypeScript and TSRX, so the consuming app must compile it with Octane's integration.

### Setup

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

### Core Patterns

#### Register only required plugins

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

#### Keep features and column definitions module-stable

```tsrx
const features = tableFeatures({})
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
```

Use `useMemo` when a definition genuinely depends on component state. Use `String(value)` for text interpolation when the value is not already a renderable string or number.

#### Render adapter helpers as components

```tsrx
<table.FlexRender cell={cell} />
```

`FlexRender` preserves numbers including `0`, descriptors, and Octane component functions. Rendering it as a component lets Octane create the correct component scope.

### Common Mistakes

#### HIGH Importing a different framework adapter

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

#### HIGH Treating TSRX as React JSX

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

#### MEDIUM Recreating static inputs in render

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

### API Discovery

Inspect `node_modules/@tanstack/octane-table/src/index.d.ts`, then the specific `*.tsrx.d.ts` sidecars and `types.ts`. This package intentionally ships authored source; follow core exports into installed `@tanstack/table-core/dist/`.

<a id="source-tanstack-octane-table-table-state"></a>

## Table State

Source: `tanstack-octane-table-table-state`.

This skill builds on `@tanstack/table-core#core` and `getting-started`. Octane has a render/commit split: options are visible to same-render reads, while controlled state is published only from an accepted layout commit.

### State Mental Model

Keep state internal unless another subsystem must read, persist, or drive it. With no `initialState`, `atoms`, `state`, or `on[State]Change`, the table owns every registered state slice.

- `table.baseAtoms` are internal writable atoms initialized from resolved initial state.
- `table.atoms` are readonly derived atoms for the active owner of each registered slice.
- `table.store` is the readonly flat store assembled from those atoms.
- `table.state` contains only the result of the second `useTable` selector.

Only registered features contribute state and types. If pagination is absent, add `rowPaginationFeature`; do not cast around the missing API.

### Setup

```tsrx
function PageStatus() @{
  const table = useTable(
    { features, columns, data },
    (state) => ({ pagination: state.pagination }),
  )

  <output>Page {String(table.state.pagination.pageIndex + 1)}</output>
}
```

The selector shallow-gates owner rerenders and determines the shape of `table.state`. Omitting it selects all registered state.

### Core Patterns

#### Fine-grained subscription islands

```tsrx
<table.Subscribe source={table.atoms.rowSelection}>
  {(selection) => <output>{String(Object.keys(selection).length)}</output>}
</table.Subscribe>
```

Render every `Subscribe` call site as a component. Each mounted island gets an independent hook scope and still receives the post-commit update when the owner drops its matching redundant notification.

#### External atom ownership

```tsrx
import { useCreateAtom } from '@tanstack/octane-store'

function Grid() @{
  const pagination = useCreateAtom({ pageIndex: 0, pageSize: 20 })
  const table = useTable({ features, columns, data, atoms: { pagination } })
  <button onClick={() => table.nextPage()}>Next</button>
}
```

External atoms are direct synchronous owners. They take precedence over `options.state`, and table API writes reach them.

#### Controlled slice ownership

```tsrx
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
const table = useTable({
  features,
  columns,
  data,
  state: { pagination },
  onPaginationChange: setPagination,
})
```

Staged options and callbacks are available during the same render. Controlled state publication waits for the accepted layout commit, so suspended or abandoned work cannot notify subscribers with speculative state.

### Choose State Ownership

Use one owner per slice:

- Prefer internal state and feature APIs when state is local to the table.
- Use `initialState` for starting/reset values; changing it later does not reset current state.
- Prefer a stable `@tanstack/octane-store` atom in `atoms` when state must be shared. Do not pair it with `on[State]Change`.
- Use `state.<slice>` plus its matching callback for a controlled slice. Feed the next value back and handle value-or-updater semantics.

Use feature methods such as `setSorting`, `nextPage`, `toggleVisibility`, and `toggleSelected` for writes. The v8 global `onStateChange` option is gone.

### Common Mistakes

#### HIGH Reading snapshots as subscriptions

Wrong:

```tsrx
const page = table.store.state.pagination.pageIndex
```

Correct:

```tsrx
const page = table.state.pagination.pageIndex
```

Store and atom `.get()` reads are current snapshots. Selected `table.state` or a rendered `table.Subscribe` connects an Octane render.

Source: `packages/octane-table/src/useTable.tsrx`

#### HIGH Calling Subscribe as a normal function

Wrong:

```tsrx
{table.Subscribe({ source: table.atoms.rowSelection, children: renderCount })}
```

Correct:

```tsrx
<table.Subscribe source={table.atoms.rowSelection}>{renderCount}</table.Subscribe>
```

Direct invocation shares the owner's compiler slots instead of creating an independent component and hook scope.

Source: `packages/octane-table/src/Subscribe.tsrx`

#### HIGH Controlling only the callback

Wrong:

```tsrx
useTable({ features, columns, data, onPaginationChange: setPagination })
```

Correct:

```tsrx
useTable({
  features,
  columns,
  data,
  state: { pagination },
  onPaginationChange: setPagination,
})
```

The callback must write into the value supplied for that controlled slice.

Source: `docs/framework/octane/guide/table-state.md`

### API Discovery

Inspect `node_modules/@tanstack/octane-table/dist/useTable.d.ts`, `Subscribe.d.ts`, and `types.d.ts`. Use `@tanstack/octane-store`, not another framework's Store hooks.
