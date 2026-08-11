# Ember adapter

Ember Table adapter guidance.

<a id="source-tanstack-ember-table-create-table-hook"></a>

## Create Table Hook

Source: `tanstack-ember-table-create-table-hook`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Use an app factory when several tables share real features or defaults; keep a one-off table on `useTable`.

### Setup

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import {
  createSortedRowModel,
  createTableHook,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from '@tanstack/ember-table'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

export const { appFeatures, createAppColumnHelper, createAppTable } =
  createTableHook({
    features,
    enableSortingRemoval: false,
  })

type Person = { id: string; name: string }
const columnHelper = createAppColumnHelper<Person>()
const columns = columnHelper.columns([
  columnHelper.accessor('name', { header: 'Name' }),
])

export default class PeopleTable extends Component {
  @tracked data: Person[] = []

  table = createAppTable(() => ({
    columns,
    data: this.data,
  }))
}
```

Create the hook and column helpers at stable module scope. `createAppTable` preserves the `useTable` options thunk, so tracked reads such as `this.data` remain reactive. Do not pass `features` again at the table call site; the factory owns the feature set and binds it into column inference.

### Composition Contract

- Hook options supply stable shared `features` and default table options.
- `createAppColumnHelper<TData>()` binds the feature type while inferring each row type.
- `createAppTable(() => options)` merges shared defaults with table-specific options.
- Table-specific options win over shared defaults, except that the factory remains the feature owner.
- `appFeatures` exposes the exact registered feature set for helper types or reusable utilities.

Shared options intentionally exclude `columns`, `data`, and `state`. Keep model inputs and controlled state at each table call site; share conventions, not one mutable state object across unrelated tables.

Sharing `rowSortingFeature`, `sortedRowModel`, and sorting defaults gives every table sorting capability; it does not make their internal sorting state shared. The factory technically accepts a stable external atom in shared `atoms`, but that deliberately couples tables and their column IDs. Prefer independent state unless synchronized tables are the actual product behavior.

### Render Normally

Ember's factory does not register `AppTable`, `AppCell`, `AppHeader`, context hooks, or reusable component registries. Continue rendering with `FlexRenderCell`, `FlexRenderHeader`, and `FlexRenderFooter`. Continue wrapping receiver-dependent v9 methods in Ember template helpers as described by `getting-started`.

### Common Mistakes

#### HIGH Copying another adapter's component registry

Wrong: expect `table.AppTable`, `useTableContext`, or a `tableComponents` option from React, Solid, Svelte, or Lit examples.

Correct: use the normal Ember FlexRender components and pass the table through ordinary Ember composition when another component truly needs it.

The Ember hook shares features/defaults and type inference only.

#### HIGH Passing features per table

Wrong:

```gts
createAppTable(() => ({ features: otherFeatures, columns, data: this.data }))
```

Correct: define a separate app hook when a table needs a genuinely different feature set. `createAppTable` omits `features` from its call-site type.

#### HIGH Recreating the hook or columns with tracked updates

Wrong: call `createTableHook`, `createAppColumnHelper`, or `columns(...)` inside a component getter or the `createAppTable` thunk.

Correct: create them once at module scope and let the table thunk read only changing inputs.

#### MEDIUM Sharing controlled state as a default

The hook options omit `state`. Put `state` and matching `on[State]Change` callbacks in each `createAppTable` thunk so every table has one clear owner per slice. Use a shared external atom only when tables intentionally coordinate the same compatible slice.

#### MEDIUM Repeating manual feature generics

Use `createAppColumnHelper<Person>()`; do not thread `typeof features` through every column helper after the factory has already captured it.

### API Discovery

Inspect `node_modules/@tanstack/ember-table/declarations/create-table-hook.d.ts` for the installed factory return shape, omitted options, and merge precedence. Inspect `use-table.d.ts` for thunk reactivity and `node_modules/@tanstack/table-core/dist/features/<feature>/` for the shared feature APIs. Do not infer Ember component/context behavior from another adapter's createTableHook.

<a id="source-tanstack-ember-table-getting-started"></a>

## Getting Started

Source: `tanstack-ember-table-getting-started`.

This skill builds on `@tanstack/table-core#core` and `@tanstack/table-core#table-features`. Ember Table is headless: it supplies reactive table models and renderer helpers, while the application owns semantic markup, CSS, accessibility, and design-system components.

The v9 addon requires Ember 5.8 or newer with Embroider or ember-auto-import v2. Prefer `.gts`/`.gjs` template-tag components with Glint.

### Setup

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import {
  FlexRenderCell,
  FlexRenderHeader,
  createColumnHelper,
  tableFeatures,
  useTable,
  type Cell,
  type Row,
} from '@tanstack/ember-table'

type Person = { id: string; name: string }

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, Person>()
const columns = columnHelper.columns([
  columnHelper.accessor('name', { header: 'Name' }),
])
const initialData: Person[] = [{ id: '1', name: 'Ada' }]
const getRowId = (row: Person) => row.id

const getAllCells = (
  row: Row<typeof features, Person>,
): Array<Cell<typeof features, Person>> => row.getAllCells()

export default class PeopleTable extends Component {
  @tracked data = initialData

  table = useTable(() => ({
    features,
    columns,
    data: this.data,
    getRowId,
  }))

  get headerGroups() {
    return this.table.getHeaderGroups()
  }

  get rows() {
    return this.table.getRowModel().rows
  }

  addPerson = () => {
    this.data = [...this.data, { id: '2', name: 'Grace' }]
  }

  <template>
    <button type='button' {{on 'click' this.addPerson}}>Add person</button>
    <table>
      <thead>
        {{#each this.headerGroups as |group|}}
          <tr>
            {{#each group.headers as |header|}}
              <th colspan={{header.colSpan}}>
                {{#unless header.isPlaceholder}}
                  <FlexRenderHeader @header={{header}} />
                {{/unless}}
              </th>
            {{/each}}
          </tr>
        {{/each}}
      </thead>
      <tbody>
        {{#each this.rows as |row|}}
          <tr>
            {{#each (getAllCells row) as |cell|}}
              <td><FlexRenderCell @cell={{cell}} /></td>
            {{/each}}
          </tr>
        {{/each}}
      </tbody>
    </table>
  </template>
}
```

`useTable` takes an options thunk. Tracked properties read by that thunk update table options, and table API reads inside getters/templates participate in Glimmer tracking. Keep `features` and `columns` at stable module or component-lifetime scope; replace `@tracked data` only when data meaningfully changes.

### Ember-Specific Patterns

#### Preserve method receivers in templates

V9 table, column, row, cell, and header methods live on prototypes and require their receiver. Ember templates extract function references, so call methods in a getter or a small module-level helper:

```gts
const getCanSort = (column: Column<typeof features, Person>) =>
  column.getCanSort()

const toggleSort =
  (column: Column<typeof features, Person>) => (event: Event) =>
    column.getToggleSortingHandler()?.(event)
```

Pass `toggleSort header.column` to `{{on}}`; do not pass an extracted Table method directly.

#### Render definitions through the matching component

Use `FlexRenderCell`, `FlexRenderHeader`, and `FlexRenderFooter` with their matching object. A definition may return a primitive or `flexRenderComponent(Component, options)`. The rendered component receives `@ctx` and optional `@options`; Table does not instantiate arbitrary component-library markup for you.

### Common Mistakes

#### HIGH Passing an options object instead of a thunk

Wrong: `useTable({ features, columns, data: this.data })`.

Correct: `useTable(() => ({ features, columns, data: this.data }))`.

The thunk is how tracked option reads are connected to the table.

#### HIGH Passing an unbound prototype method to a template modifier

Wrong: `{{on 'click' header.column.getToggleSortingHandler}}`.

Correct: wrap the call in a helper that invokes the method on `header.column`, as shown above.

An extracted v9 prototype method loses `this` and can throw or silently target the wrong receiver.

#### HIGH Recreating model inputs inside the options thunk

Wrong: `columns: columnHelper.columns(...)` or `data: this.data.slice()` inside `useTable(() => ...)`.

Correct: keep columns stable and pass the tracked data reference directly. The thunk may rerun; it should not manufacture new model inputs on every tracked update.

#### MEDIUM Using a visibility-aware API without its feature

With `tableFeatures({})`, render `row.getAllCells()`. Add `columnVisibilityFeature` before using `row.getVisibleCells()`.

### API Discovery

Inspect `node_modules/@tanstack/ember-table/declarations/index.d.ts` for exports, `use-table.d.ts` for options/reactivity behavior, `FlexRender.d.ts` and `flex-render.d.ts` for renderer contracts, and `node_modules/@tanstack/table-core/dist/features/<feature>/` for feature-gated APIs. Do not substitute React hooks, subscriptions, or component signatures.

<a id="source-tanstack-ember-table-table-state"></a>

## Table State

Source: `tanstack-ember-table-table-state`.

This skill builds on `@tanstack/table-core#core` and `getting-started`. Keep state internal unless another part of the application must read, persist, validate, or drive a slice.

### State Surfaces

State exists only for registered features:

- `table.baseAtoms` are the table's internal writable atoms.
- `table.atoms` are readonly, ownership-aware atoms for each registered slice.
- `table.store.state` exposes the current flat state.
- Feature methods such as `setSorting`, `setPageSize`, and `row.toggleSelected()` are the preferred write path.

Ember's reactivity feature bridges these reads into Glimmer tracking. There is no `table.Subscribe`, no selector argument to `useTable`, and no need to subscribe during rendering. Read the relevant API inside a template-consumed getter:

```gts
get rows() {
  return this.table.getRowModel().rows
}

get pageIndex() {
  return this.table.atoms.pagination.get().pageIndex
}
```

`table.store.subscribe` is not the Ember rendering mechanism. The adapter's store is pull-based; Glimmer tracks individual property and atom reads.

`features` and `atoms` are construct-time inputs in this adapter. Create them once before `useTable`; rerunning the options thunk updates ordinary live options but does not swap the table's feature set or atom owners.

### Choose One Owner Per Slice

For a slice such as pagination, choose one source of truth:

1. Internal `baseAtoms` by default.
2. `initialState.pagination` for an internally owned starting value.
3. An external writable atom in `atoms.pagination`.
4. A `@tracked` value in `state.pagination`, paired with `onPaginationChange`.

Read precedence is `atoms[key]` over `state[key]` over the internal `baseAtoms[key]`. Do not configure multiple owners merely as fallbacks.

### Internal and Initial State

With no `initialState`, `atoms`, `state`, or `on[State]Change`, Table owns registered state internally. Use `initialState` when only the starting/reset value differs:

```gts
table = useTable(() => ({
  features,
  columns,
  data: this.data,
  initialState: {
    pagination: { pageIndex: 0, pageSize: 25 },
  },
}))
```

Changing `initialState` later does not reset existing state. Prefer feature reset methods such as `resetPagination()`; passing `true` requests that feature's blank/default state. Core `table.reset()` resets internal base atoms and is not the primary reset path for externally owned atoms.

### External Ember Atoms

Use the adapter's re-exported `createAtom` when a slice should be shared or read directly outside Table. It satisfies the TanStack Store atom contract and its reads are Glimmer-reactive:

```gts
import {
  createAtom,
  useTable,
  type PaginationState,
} from '@tanstack/ember-table'

paginationAtom = createAtom<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
})

table = useTable(() => ({
  features,
  columns,
  data: this.data,
  atoms: { pagination: this.paginationAtom },
}))

get pagination() {
  return this.paginationAtom.get()
}
```

Feature APIs write through the external atom, so do not add `onPaginationChange` for the same atom-owned slice. Write the external atom itself when using the low-level path.

### Controlled Tracked State

Use `state` plus the matching callback when a `@tracked` property owns a slice. Resolve both raw values and updater functions:

```gts
import {
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  type PaginationState,
} from '@tanstack/ember-table'

const features = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})

@tracked pagination: PaginationState = { pageIndex: 0, pageSize: 10 }

table = useTable(() => ({
  features,
  columns,
  data: this.data,
  state: { pagination: this.pagination },
  onPaginationChange: (updater) => {
    this.pagination =
      typeof updater === 'function' ? updater(this.pagination) : updater
  },
}))
```

The pagination feature owns the state and APIs; the row-model slot enables client-side pagination. For server-owned pagination, keep `rowPaginationFeature`, omit the client row-model slot, and configure the matching manual/server data options. The options thunk must read `this.pagination`; assigning the tracked field reruns the thunk and feeds the controlled value back into Table. V9 has no global `onStateChange` option.

### Low-Level Writes and Types

Use a feature method first. If internally owned state truly needs a low-level update:

```ts
this.table.baseAtoms.pagination.set((old) => ({ ...old, pageIndex: 0 }))
```

Do not write `table.atoms.pagination`; it is readonly and may point at an external owner. Infer the complete registered shape with `TableState<typeof features>` and use feature-specific types such as `PaginationState` or `SortingState` for owned fields.

### Common Mistakes

#### CRITICAL Controlling a slice without writing callbacks back

Wrong:

```gts
state: { pagination: this.pagination },
onPaginationChange: () => {},
```

Correct: apply the value-or-updater to the tracked owner. Otherwise the slice is frozen at the controlled value.

#### HIGH Expecting a snapshot read or subscription component

Wrong: invent `<table.Subscribe>`, call `table.store.subscribe(...)` for rendering, or cache `table.store.state.pagination` outside a tracked getter.

Correct: read `table.atoms.pagination.get()`, `table.store.state.pagination`, or the relevant Table API inside a template-consumed getter.

`table.getState()` is removed v8 API, not an Ember state-read alternative.

#### HIGH Mixing atom and state ownership

If both `atoms.pagination` and `state.pagination` are present, the atom wins. Choose one owner so resets and writes have an unambiguous destination.

#### HIGH Mutating controlled objects in place

Wrong: `this.pagination.pageIndex++`.

Correct: assign a new tracked value or let `table.setPageIndex(...)` invoke the controlled updater. Glimmer and the options thunk need an observable owner update.

#### MEDIUM Writing the internal base atom for an external owner

When `atoms.pagination` owns the slice, changing `baseAtoms.pagination` does not replace the active value. Write the external atom or use the feature API.

### API Discovery

Inspect `node_modules/@tanstack/ember-table/declarations/use-table.d.ts` for option/state precedence and the Glimmer bridge, `signal.d.ts` for `createAtom` behavior, and `reactivity.d.ts` for scheduling/tracking. Inspect the registered feature under `node_modules/@tanstack/table-core/dist/features/<feature>/` for its state type, update API, and reset semantics.
