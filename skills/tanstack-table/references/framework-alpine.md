# Alpine adapter

Alpine Table adapter guidance.

<a id="source-tanstack-alpine-table-create-table-hook"></a>

## Create Table Hook

Source: `tanstack-alpine-table-create-table-hook`.

This skill builds on @tanstack/table-core#core plus this package's getting-started and table-state skills.

### Setup

```ts
import Alpine from 'alpinejs'
import { createTableHook, tableFeatures } from '@tanstack/alpine-table'

type Person = { id: string; name: string }
const { createAppTable, createAppColumnHelper } = createTableHook({
  features: tableFeatures({}),
  getRowId: (row: Person) => row.id,
})
const helper = createAppColumnHelper<Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])

Alpine.data('peopleTable', () => {
  const local = Alpine.reactive({
    data: [{ id: '1', name: 'Ada' }] as Array<Person>,
  })
  const table = createAppTable({
    columns,
    get data() {
      return local.data
    },
  })
  return { table }
})
```

### Core Patterns

#### Share infrastructure, keep data local

Bind features, row models, row IDs, and defaults in the factory. Each Alpine component passes its own columns, reactive data getter, and controlled state.

#### Reuse markup with Alpine primitives

Use real templates and `Alpine.bind` bundles for interactive reuse. `createTableHook` intentionally returns no component registry or context hooks.

#### Use the helper to retain feature inference

Columns from `createAppColumnHelper<TData>()` know the factory's registered features without userland feature generics.

### Common Mistakes

#### HIGH Assuming a JSX component registry

Wrong: pass `cellComponents` or `tableComponents` to Alpine `createTableHook`.

Correct: share features/defaults with the hook and build reusable interactive markup with Alpine templates or bind bundles.

The Alpine hook returns only app features, a column helper, and createAppTable.

Source: TanStack/table:packages/alpine-table/src/createTableHook.ts

#### MEDIUM Abstracting a one-off table

Wrong: introduce an app factory for one table with no shared conventions.

Correct: use standalone `createTable` until infrastructure repeats.

The hook is an application reuse boundary, not required setup.

Source: TanStack/table:docs/framework/alpine/guide/composable-tables.md

#### HIGH Reactive data captured as a snapshot

Wrong: `createAppTable({ columns, data: local.data })` when the array will be replaced.

Correct: provide a `get data()` option.

The app factory delegates to Alpine createTable, whose option effect tracks getters.

Source: TanStack/table:packages/alpine-table/src/createTable.ts

### API Discovery

Inspect `node_modules/@tanstack/alpine-table/dist/createTableHook.d.ts`; do not infer component/context APIs from React, Vue, Solid, Svelte, Angular, or Lit adapters.

<a id="source-tanstack-alpine-table-getting-started"></a>

## Getting Started

Source: `tanstack-alpine-table-getting-started`.

This skill builds on @tanstack/table-core#core and @tanstack/table-core#table-features.

### Setup

```ts
import Alpine from 'alpinejs'
import {
  FlexRender,
  createTable,
  tableFeatures,
  type ColumnDef,
} from '@tanstack/alpine-table'

type Person = { id: string; name: string }
const features = tableFeatures({})
const columns: Array<ColumnDef<typeof features, Person>> = [
  { accessorKey: 'name', header: 'Name' },
]

Alpine.data('peopleTable', () => {
  const local = Alpine.reactive({
    data: [{ id: '1', name: 'Ada' }] as Array<Person>,
  })
  const table = createTable({
    features,
    columns,
    get data() {
      return local.data
    },
    getRowId: (row) => row.id,
  })

  return { table, FlexRender }
})

window.Alpine = Alpine
Alpine.start()
```

Render real table structure with `x-for`; use `x-html="FlexRender({ header })"` or `x-html="FlexRender({ cell })"` only for renderer output.

### Core Patterns

#### Pass live options through getters

Wrap changing data in an `Alpine.reactive({ data })` object and read `local.data` through `get data()`. The property read gives the adapter's effect a dependency to track before it calls `table.setOptions`.

#### Read table APIs directly in bindings

The adapter returns a reactive proxy. Expressions such as `x-text="table.getRowModel().rows.length"` update without a Subscribe component.

#### Render interaction controls as real markup

Buttons, inputs, and directives belong in the template. Renderer strings are useful for cell content, but `x-html` does not initialize Alpine directives inside the injected HTML.

### Common Mistakes

#### HIGH Passing a data snapshot

Wrong: `createTable({ features, columns, data: local.data })` when `local.data` will be replaced.

Correct: expose `get data() { return local.data }`.

The adapter tracks option getters; a captured array does not follow later replacements.

Source: TanStack/table:packages/alpine-table/src/createTable.ts

#### HIGH Interactive directives hidden in x-html

Wrong: return `'<button @click="remove()">Remove</button>'` from a cell renderer.

Correct: render the button as real template markup and bind the row action there, or use an `Alpine.bind` bundle.

Alpine does not initialize directives inside content inserted by `x-html`.

Source: TanStack/table:docs/framework/alpine/guide/composable-tables.md

#### HIGH Expecting Table styling

Wrong: enable sizing or pinning and assume widths/sticky positioning appear.

Correct: apply widths, logical offsets, overflow, and sticky CSS in the Alpine template.

Table exposes state and geometry; it does not own the renderer.

Source: TanStack/table:docs/overview.md

### API Discovery

Inspect `node_modules/@tanstack/alpine-table/dist/index.d.ts` and `createTable.d.ts`. Exact core APIs live under `node_modules/@tanstack/table-core/dist/`.

<a id="source-tanstack-alpine-table-table-state"></a>

## Table State

Source: `tanstack-alpine-table-table-state`.

This skill builds on @tanstack/table-core#core and this package's getting-started skill.

### State Mental Model

TanStack Table is primarily a state coordinator. Keep state internal unless another system needs to read, persist, or drive it. Without `initialState`, `atoms`, `state`, or `on[State]Change`, the table owns all registered slices.

- `table.baseAtoms` are internal writable atoms initialized from resolved initial state.
- `table.atoms` are readonly derived atoms for the active owner of each registered slice.
- `table.store` combines those atoms into one readonly flat store.

The Alpine adapter proxies the table and subscribes it to the store. Reads inside `x-text`, `x-for`, `x-if`, bound attributes, `x-effect`, or Alpine getters are reactive automatically; event handlers read the current value when invoked. State is feature-based, so missing state or methods usually mean the feature was not registered. Keep `features`, `columns`, and source `data` stable; expose changing reactive data through a getter rather than filtering, mapping, or slicing inside table options.

### Setup

```ts
import Alpine from 'alpinejs'
import {
  createTable,
  rowPaginationFeature,
  tableFeatures,
} from '@tanstack/alpine-table'
import type { PaginationState } from '@tanstack/alpine-table'

const features = tableFeatures({ rowPaginationFeature })

Alpine.data('pagedTable', () => {
  const local = Alpine.reactive<{ pagination: PaginationState }>({
    pagination: { pageIndex: 0, pageSize: 10 },
  })
  const table = createTable({
    features,
    columns: [],
    data: [],
    state: {
      get pagination() {
        return local.pagination
      },
    },
    onPaginationChange: (updater) => {
      local.pagination =
        typeof updater === 'function' ? updater(local.pagination) : updater
    },
  })

  return { table }
})
```

### Core Patterns

#### Read narrow atoms in bindings

Use `table.atoms.pagination.get().pageIndex` for a narrow state read. The proxy registers the binding as reactive.

#### Use a selector only to gate broad proxy updates

The optional second `createTable` argument shallow-compares selected state. Use `() => ({})` only when explicit atom subscriptions handle high-frequency updates such as resizing.

#### Choose one owner per slice

Use either an external atom through `atoms.pagination` or Alpine-controlled `state.pagination` plus `onPaginationChange`. An external atom wins if both are supplied.

### Choose State Ownership

- Prefer internal state and feature APIs for table-local interaction.
- Use `initialState` only for starting/reset values; changing it later does not reset current state.
- Prefer a stable external atom in `atoms` when state is shared. Feature APIs write it directly, so omit `on[State]Change`.
- Use an `Alpine.reactive` value exposed through a getter plus its matching callback for simple controlled state. Resolve raw values and updater functions.

External atoms take precedence over external `state`, which syncs into the internal base atom. Do not rely on multiple owners. The global v8 `onStateChange` option is gone; subscribe to `table.store` to observe the complete state.

### Initialize, Update, and Reset

Prefer feature methods such as `setSorting`, `nextPage`, `toggleVisibility`, and `toggleSelected`. Direct `baseAtoms` writes are a rare escape hatch for internal state; write the external atom when it owns a slice.

```ts
table.resetSorting()
table.resetPagination()
table.resetPagination(true)
```

Feature resets use `table.initialState` unless `true` requests the feature default and can update external owners. Core `table.reset()` resets internal base atoms only. Use feature-specific types such as `PaginationState`; use `TableState<typeof features>` for the full state inferred from registered features.

### Common Mistakes

#### HIGH Inventing a Subscribe component

Wrong: render a nonexistent `table.Subscribe` wrapper.

Correct: read the relevant table API directly in an Alpine binding.

The Alpine adapter makes proxied table reads reactive; it has no component render boundary.

Source: TanStack/table:docs/framework/alpine/guide/table-state.md

#### HIGH Controlled snapshot never refreshes

Wrong: set `state: { pagination: local.pagination }` and later replace `local.pagination`.

Correct: define a getter for the controlled slice and apply each updater back to `local.pagination`.

The adapter effect must read the current reactive value to reapply options.

Source: TanStack/table:packages/alpine-table/src/createTable.ts

#### MEDIUM State and atom owners conflict

Wrong: pass both `state.pagination` and `atoms.pagination` expecting two-way synchronization.

Correct: select one ownership mechanism; when an atom owns the slice, write the external atom.

The derived table atom reads the external atom before controlled or internal state.

Source: TanStack/table:docs/framework/alpine/guide/table-state.md

### API Discovery

Inspect `node_modules/@tanstack/alpine-table/dist/createTable.d.ts` and `reactivity.d.ts`. Inspect `node_modules/@tanstack/table-core/dist/core/table/constructTable.d.ts` for state precedence.
