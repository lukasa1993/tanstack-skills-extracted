# Angular adapter

Angular Table adapter guidance.

<a id="source-tanstack-angular-table-create-table-hook"></a>

## Create Table Hook

Source: `tanstack-angular-table-create-table-hook`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Use it for repeated app conventions; keep one-off tables on `injectTable`.

### Setup

```ts
import {
  createTableHook,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/angular-table'

export const {
  injectAppTable,
  createAppColumnHelper,
  injectTableContext,
  injectTableCellContext,
  injectTableHeaderContext,
} = createTableHook({
  features: tableFeatures({ rowSortingFeature }),
})
```

```ts
const helper = createAppColumnHelper<Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])

export class PeopleTable {
  readonly table = injectAppTable(() => ({ columns, data: this.data() }))
}
```

### Core Patterns

#### Consume typed DI context in registered components

```ts
export class NameCell {
  readonly cell = injectTableCellContext<string, Person>()
  readonly value = computed(() => this.cell().getValue())
}
```

Use the matching table/header/cell injector instead of threading context props through reusable components.

#### Distinguish component types from render functions

Register either an Angular component type or a render function. Return component types directly when FlexRender should set context inputs; use `flexRenderComponent(Component, options)` only for explicit inputs/outputs/injector/bindings/directives.

### Common Mistakes

#### CRITICAL Calling app helpers outside DI

Wrong:

```ts
export function make() {
  return injectAppTable(() => options)
}
```

Correct:

```ts
export class PeopleTable {
  readonly table = injectAppTable(() => options())
}
```

Both app-table construction and returned context injectors require Angular injection context.

Source: `packages/angular-table/src/helpers/createTableHook.ts`

#### HIGH Prop drilling registered context

Wrong:

```ts
cell: (ctx) => flexRenderComponent(NameCell, { inputs: { cell: ctx.cell } })
```

Correct:

```ts
cell: (ctx) => ctx.cell.NameCell
```

Registered components can consume the app hook’s typed cell context directly.

Source: `docs/framework/angular/guide/composable-tables.md`

#### HIGH Wrapping a function as a component

Wrong:

```ts
flexRenderComponent((props) => props.cell.getValue())
```

Correct:

```ts
;(props) => props.cell.getValue()
```

`flexRenderComponent` validates an Angular component type; plain render functions are already valid render content.

Source: `packages/angular-table/src/flex-render/flexRenderComponent.ts`

#### MEDIUM Abstracting a one-off table

Wrong:

```ts
const hook = createTableHook({ features: tableFeatures({}) })
```

Correct:

```ts
readonly table = injectTable(() => ({ features, columns, data: this.data() }))
```

Use the app hook only when shared defaults, types, or registered components justify it.

Source: `docs/framework/angular/guide/composable-tables.md`

### API Discovery

Inspect `node_modules/@tanstack/angular-table/dist/types/` for exact DI and rendering contracts in the bundled public API.

<a id="source-tanstack-angular-table-devtools"></a>

## Devtools

Source: `tanstack-angular-table-devtools`.

This skill builds on @tanstack/table-core#core and @tanstack/table-devtools#devtools.

### Setup

```ts
import { Component } from '@angular/core'
import { injectTable, tableFeatures } from '@tanstack/angular-table'
import { injectTanStackTableDevtools } from '@tanstack/angular-table-devtools'

const features = tableFeatures({})
const columns = [{ accessorKey: 'id' }]
const data: Array<{ id: string }> = []

@Component({ selector: 'users-table', template: 'Users table registered' })
export class UsersTable {
  readonly table = injectTable(() => ({
    key: 'users-table',
    features,
    columns,
    data,
  }))

  constructor() {
    injectTanStackTableDevtools(() => ({ table: this.table }))
  }
}
```

Provide the Angular TanStack Devtools host once at application configuration level as documented in `docs/devtools.md`.

### Hooks and Components

The injector options function may return `table: undefined` or an `enabled` function to remove/disable registration reactively.

### Common Mistakes

#### CRITICAL Injector called outside context

Wrong: call `injectTanStackTableDevtools` from an arbitrary callback after bootstrap.

Correct: call it in a component/service field initializer or constructor injection context.

The adapter uses Angular injection and effects for lifecycle cleanup.

Source: TanStack/table:packages/angular-table-devtools/src/injectTanStackTableDevtools.ts

#### HIGH Missing table key

Wrong: register an otherwise valid table without `options.key`.

Correct: assign a stable unique key before injection registration.

Core registration logs an error and skips keyless targets.

Source: TanStack/table:packages/table-devtools/src/tableTarget.ts

#### MEDIUM isDevMode no-op misunderstood

Wrong: expect default Angular exports to render production Devtools.

Correct: keep standard setup development-only; use `/production` only when explicitly requested.

The package index switches exports using Angular `isDevMode()`.

Source: TanStack/table:packages/angular-table-devtools/src/index.ts

### API Discovery

Inspect `node_modules/@tanstack/angular-table-devtools/dist/index.d.ts` and `injectTanStackTableDevtools.d.ts` for current injection options.

<a id="source-tanstack-angular-table-getting-started"></a>

## Getting Started

Source: `tanstack-angular-table-getting-started`.

This skill builds on `@tanstack/table-core#core` and `@tanstack/table-core#table-features`. Read them first for the headless model and explicit features.

### Setup

```ts
import { Component, signal } from '@angular/core'
import { FlexRender, injectTable, tableFeatures } from '@tanstack/angular-table'

type Person = { name: string; age: number }
const features = tableFeatures({})
const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
]

@Component({
  selector: 'app-table',
  imports: [FlexRender],
  template: `<table>
    <tbody>
      @for (row of table.getRowModel().rows; track row.id) {
        <tr>
          @for (cell of row.getAllCells(); track cell.id) {
            <td>
              <ng-container *flexRenderCell="cell; let value">{{
                value
              }}</ng-container>
            </td>
          }
        </tr>
      }
    </tbody>
  </table>`,
})
export class TableComponent {
  readonly data = signal<Person[]>([{ name: 'Ada', age: 36 }])
  readonly table = injectTable(() => ({ features, columns, data: this.data() }))
}
```

### Core Patterns

#### Keep static inputs outside the initializer

`injectTable` reruns its options initializer when a signal read changes. Define features, row-model factories, and columns at module or stable class scope; read only changing values inside.

#### Render each content kind correctly

Import `FlexRender` for `*flexRender`, `*flexRenderCell`, `*flexRenderHeader`, and `*flexRenderFooter`. Definitions may yield primitives, `TemplateRef`, component types, or `flexRenderComponent(...)`; Table does not supply markup or CSS.

### Common Mistakes

#### CRITICAL Calling injectTable outside DI

Wrong:

```ts
export function makeTable() {
  return injectTable(() => ({ features, columns, data }))
}
```

Correct:

```ts
export class TableComponent {
  readonly table = injectTable(() => ({ features, columns, data: this.data() }))
}
```

`injectTable` asserts an Angular injection context and registers lifecycle cleanup there.

Source: `packages/angular-table/src/injectTable.ts`

#### HIGH Reallocating static options reactively

Wrong:

```ts
injectTable(() => ({
  features: tableFeatures({}),
  columns: makeColumns(),
  data: this.data(),
}))
```

Correct:

```ts
const features = tableFeatures({})
const columns = makeColumns()
injectTable(() => ({ features, columns, data: this.data() }))
```

Every signal change reruns the initializer; rebuilding static inputs invalidates memoized Table work.

Source: `packages/angular-table/src/injectTable.ts`

#### HIGH Treating a render function as a component

Wrong:

```ts
cell: () => flexRenderComponent(() => 'value')
```

Correct:

```ts
cell: () => 'value'
```

`flexRenderComponent` wraps an Angular component type; ordinary functions and primitives are handled directly by FlexRender.

Source: `docs/framework/angular/guide/rendering.md`

### API Discovery

Inspect `node_modules/@tanstack/angular-table/dist/types/` for the bundled public API; inspect optional feature APIs in installed `@tanstack/table-core/dist/features/`.

<a id="source-tanstack-angular-table-migrate-v8-to-v9"></a>

## Migrate V8 To V9

Source: `tanstack-angular-table-migrate-v8-to-v9`.

Use this as the complete breaking-change checklist. V9 is the current API; construction, feature registration, state, rendering, and types must migrate together.

Framework prerequisite: Angular 19 or newer (`@angular/core >=19`).

### Recommended Migration Order

1. Replace `createAngularTable` with `injectTable` inside an Angular injection context.
2. Hoist static/expensive features and columns outside the reactive initializer.
3. Move features, row models, and function registries into `tableFeatures`.
4. Update signal/atom state reads and FlexRender usage.
5. Apply every shared API and type rename below.
6. Treat `stockFeatures` as a temporary audit bridge; explicit features are the production target.

```ts
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

class TableCmp {
  readonly table = injectTable(() => ({
    features,
    columns,
    data: this.data(),
  }))
}
```

### Construction and Feature Registration

| v8                                  | v9                                                         |
| ----------------------------------- | ---------------------------------------------------------- |
| `createAngularTable(() => options)` | `injectTable(() => options)` in injection context          |
| All features bundled                | Required `features: tableFeatures({...})`                  |
| `getCoreRowModel()` option          | Remove; core row model is automatic                        |
| `get*RowModel()` table options      | `create*RowModel()` slots in `tableFeatures`               |
| `sortingFns` table option           | `sortFns` feature slot                                     |
| Top-level `onStateChange`           | Per-slice callbacks, external atoms, or store subscription |

The initializer reruns when signals read inside it change and calls `setOptions`; do not rebuild columns or features there.

Feature imports are `cellSelectionFeature`, `columnFilteringFeature`, `globalFilteringFeature`, `rowSortingFeature`, `rowPaginationFeature`, `rowSelectionFeature`, `rowExpandingFeature`, `rowPinningFeature`, `columnPinningFeature`, `columnVisibilityFeature`, `columnOrderingFeature`, `columnSizingFeature`, `columnResizingFeature`, `rowAggregationFeature`, `columnGroupingFeature`, and `columnFacetingFeature`. APIs are feature-gated. Put a feature before its dependent slot in the same `tableFeatures` call. Aggregation is independent from grouping: register `rowAggregationFeature` for aggregation APIs and add `columnGroupingFeature` only for grouped rows.

#### Row-model mapping

| v8 option                  | v9 slot and factory                                                 |
| -------------------------- | ------------------------------------------------------------------- |
| `getFilteredRowModel()`    | `filteredRowModel: createFilteredRowModel()` after column filtering |
| `getSortedRowModel()`      | `sortedRowModel: createSortedRowModel()` after row sorting          |
| `getPaginationRowModel()`  | `paginatedRowModel: createPaginatedRowModel()` after pagination     |
| `getExpandedRowModel()`    | `expandedRowModel: createExpandedRowModel()` after expanding        |
| `getGroupedRowModel()`     | `groupedRowModel: createGroupedRowModel()` after grouping           |
| `getFacetedRowModel()`     | `facetedRowModel: createFacetedRowModel()` after faceting           |
| `getFacetedMinMaxValues()` | `facetedMinMaxValues: createFacetedMinMaxValues()`                  |
| `getFacetedUniqueValues()` | `facetedUniqueValues: createFacetedUniqueValues()`                  |

Factories take no arguments. `filterFns`, `sortFns`, and `aggregationFns` are sibling feature slots; register individually imported built-ins (`filterFn_includesString`, `sortFn_alphanumeric`, `aggregationFn_sum`) under their conventional keys. The full registry objects still work but bundle every built-in.

### Angular State Migration

- `table.getState().sorting` becomes `table.atoms.sorting.get()` for narrow signal-backed reads.
- Use `table.store.get()` only for a full flat snapshot/debug output.
- Derive selected slices with Angular `computed`; use `shallow` equality for recreated object/array slices when appropriate.
- Controlled Angular signals are read in `state` and updated through matching `on[State]Change` callbacks; resolve value-or-function updaters.
- Top-level `onStateChange` is removed. Use per-slice callbacks, external atoms, or `table.store.subscribe` for all changes.
- Prefer external atoms from `@tanstack/angular-store` through `atoms` for app-owned shared slices. Never provide both an atom and `state` for one slice.
- Treat `table.baseAtoms` as internal; prefer feature APIs or external atoms.

### Angular Rendering and Composition

- Import `FlexRender`/the current `*flexRender` directives from the adapter.
- Prefer `*flexRenderCell="cell; let value"`, `*flexRenderHeader="header; let value"`, and `*flexRenderFooter="footer; let value"`; they choose the definition and context automatically.
- General `*flexRender` supports primitives, `TemplateRef`, component types, and `flexRenderComponent(...)` wrappers.
- Column render functions run in an Angular injection context and may call `inject()` or use signals.
- Components mounted by FlexRender can call `injectFlexRenderContext()` for the render props.
- Use `flexRenderComponent(Component, { inputs, outputs, injector, bindings, directives })` for explicit component configuration; creation-time `bindings`/`directives` require the supported Angular version.
- `tableOptions(...)` composes partial options and may omit data, columns, or features until final assembly.
- `createTableHook` is optional for repeated application conventions; it returns `injectAppTable` and a feature-bound `createAppColumnHelper`.

### Complete Shared Breaking-Change Map

#### Instance methods

Row, cell, column, header, and related methods now live on shared prototypes and use `this`. Call them on their instances. Do not destructure/pass them bare or expect them in object spread, `Object.keys`, or JSON. Table methods are not affected.

#### Logical column pinning

V9 has no physical aliases.

| old                                                            | new                                                           |
| -------------------------------------------------------------- | ------------------------------------------------------------- |
| `columnPinning.left` / `.right`                                | `.start` / `.end`                                             |
| `column.pin('left' \| 'right')`                                | `column.pin('start' \| 'end')`                                |
| `getIsPinned() === 'left' \| 'right'`                          | `'start' \| 'end'`                                            |
| `row.getLeftVisibleCells()` / `getRightVisibleCells()`         | `getStartVisibleCells()` / `getEndVisibleCells()`             |
| `getLeftHeaderGroups()` / `getRightHeaderGroups()`             | `getStartHeaderGroups()` / `getEndHeaderGroups()`             |
| `getLeftFooterGroups()` / `getRightFooterGroups()`             | `getStartFooterGroups()` / `getEndFooterGroups()`             |
| `getLeftFlatHeaders()` / `getRightFlatHeaders()`               | `getStartFlatHeaders()` / `getEndFlatHeaders()`               |
| `getLeftLeafHeaders()` / `getRightLeafHeaders()`               | `getStartLeafHeaders()` / `getEndLeafHeaders()`               |
| `getLeftLeafColumns()` / `getRightLeafColumns()`               | `getStartLeafColumns()` / `getEndLeafColumns()`               |
| `getLeftVisibleLeafColumns()` / `getRightVisibleLeafColumns()` | `getStartVisibleLeafColumns()` / `getEndVisibleLeafColumns()` |
| `getLeftTotalSize()` / `getRightTotalSize()`                   | `getStartTotalSize()` / `getEndTotalSize()`                   |
| `column.getStart('left')`                                      | `column.getStart('start')`                                    |
| `column.getAfter('right')`                                     | `column.getAfter('end')`                                      |
| `column.getIndex('left' \| 'right')`                           | `column.getIndex('start' \| 'end')`                           |

Prefer CSS logical inset properties. Logical names do not set DOM direction. `columnResizeDirection` is unchanged.

#### Pinning, sizing, and resizing

- `enablePinning` splits into `enableColumnPinning` and `enableRowPinning`.
- Interactive resizing requires `columnSizingFeature` and `columnResizingFeature`; fixed sizing needs only sizing.
- `columnSizingInfo` becomes `columnResizing`.
- `setColumnSizingInfo()` becomes `setColumnResizing()`.
- `onColumnSizingInfoChange` becomes `onColumnResizingChange`.

#### Sorting, rows, and selection

| v8                             | v9                            |
| ------------------------------ | ----------------------------- |
| `sortingFn`                    | `sortFn`                      |
| `sortingFns`                   | `sortFns`                     |
| `getSortingFn()`               | `getSortFn()`                 |
| `getAutoSortingFn()`           | `getAutoSortFn()`             |
| `SortingFn` / `SortingFns`     | `SortFn` / `SortFns`          |
| `row._getAllCellsByColumnId()` | `row.getAllCellsByColumnId()` |

Other `_`-prefixed internals are removed, including `_getPinnedRows`, `_getFacetedRowModel`, `_getFacetedMinMaxValues`, and `_getFacetedUniqueValues`.

`getIsSomeRowsSelected()` and `getIsSomePageRowsSelected()` mean at least one, including all. Use `getIsSomeRowsSelected() && !getIsAllRowsSelected()` or `getIsSomePageRowsSelected() && !getIsAllPageRowsSelected()` for indeterminate UI.

### TypeScript Migration

- Most types add `TFeatures` first: `Column<TFeatures, TData, TValue>`, `ColumnDef<TFeatures, TData, TValue>`, `Table<TFeatures, TData>`, `Row<TFeatures, TData>`, and `Cell<TFeatures, TData, TValue>`.
- Replace `createColumnHelper<Person>()` with `createColumnHelper<typeof features, Person>()`; use `columnHelper.columns([...])` for inference.
- A `createTableHook` column helper already binds features and needs only `<Person>`.
- Use `StockFeatures` when using `stockFeatures`.
- Existing `TableMeta`/`ColumnMeta` declaration merging must add `TFeatures` first. Prefer per-table meta slots using `metaHelper`.
- Replace global `FilterFns`, `SortFns`, `AggregationFns`, and `FilterMeta` augmentation with registry slots and `filterMeta`; registered keys become typed string references.
- `RowData` is now `Record<string, any> | Array<any>` rather than `unknown`.

### Common Migration Failures

#### CRITICAL: Calling injectTable outside injection context

Create it in a component/directive/service field initializer or another valid Angular injection context so ownership and cleanup bind correctly.

#### HIGH: Rebuilding static inputs reactively

Hoist `features` and `columns`; the initializer reruns for tracked signals.

#### HIGH: Leaving row models on table options

Move each row model beside its prerequisite feature in `tableFeatures`.

#### HIGH: Destructuring instance methods

Use `row.getValue('name')`; prototype methods require the original instance and are absent from shallow clones.

### Final Checklist

- [ ] `createAngularTable` is replaced by `injectTable` in injection context.
- [ ] Static inputs are stable outside the signal-tracked initializer.
- [ ] Features, row models, and registries are in `tableFeatures`; core row model is removed.
- [ ] State reads use atom-backed signals or store intentionally; `onStateChange` is gone.
- [ ] Controlled state and external atom ownership do not overlap.
- [ ] FlexRender directives/helpers are migrated and imported.
- [ ] Prototype methods, pinning, sizing/resizing, sorting, row, and selection changes are audited.
- [ ] Helpers, types, meta, registries, and `RowData` use v9 shapes.
- [ ] Temporary `stockFeatures` usage has an explicit removal plan.

### API Discovery

Inspect `node_modules/@tanstack/angular-table/dist/types/` for the bundled public API; do not reconstruct v9 from v8 memory.

<a id="source-tanstack-angular-table-table-state"></a>

## Table State

Source: `tanstack-angular-table-table-state`.

This skill builds on `@tanstack/table-core#core` and `getting-started`. Read them first for state ownership and Angular construction.

### State Mental Model

TanStack Table is primarily a state coordinator. Keep state internal unless another system must read, persist, or drive it. Without `initialState`, `atoms`, `state`, or `on[State]Change`, the table owns all registered slices.

- `table.baseAtoms` are internal writable atoms initialized from resolved initial state.
- `table.atoms` are readonly derived atoms for the active owner of each registered slice.
- `table.store` combines those atoms into one readonly flat store.

The Angular adapter backs atoms with Angular signals. Reads participate in tracking inside templates, `computed`, and `effect`; signal reads inside the `injectTable` initializer also rerun that initializer and call `setOptions`. State is feature-based: missing pagination state or APIs indicate a missing `rowPaginationFeature`. Hoist stable `features` and `columns` outside the initializer, and return signal-backed `data` without mapping or slicing inline.

### Setup

```ts
import { computed, signal } from '@angular/core'
import {
  injectTable,
  rowPaginationFeature,
  tableFeatures,
} from '@tanstack/angular-table'

const features = tableFeatures({ rowPaginationFeature })
const columns = [{ accessorKey: 'name' }]

export class TableComponent {
  readonly data = signal([{ name: 'Ada' }])
  readonly table = injectTable(() => ({ features, columns, data: this.data() }))
  readonly pageIndex = computed(
    () => this.table.atoms.pagination.get().pageIndex,
  )
}
```

Angular-backed table atom reads are signal reads. Templates, `computed`, and `effect` track them directly.

### Core Patterns

#### Prefer external atoms for cross-system state

```ts
import { createAtom } from '@tanstack/angular-store'
import type { PaginationState } from '@tanstack/angular-table'

readonly paginationAtom = createAtom<PaginationState>({ pageIndex: 0, pageSize: 20 })
readonly table = injectTable(() => ({
  features, columns, data: this.data(), atoms: { pagination: this.paginationAtom },
}))
```

The atom can feed Query without making every state write rerun the Table initializer.

#### Resolve controlled signal updaters

```ts
readonly pagination = signal({ pageIndex: 0, pageSize: 20 })
readonly table = injectTable(() => ({
  features, columns, data: this.data(), state: { pagination: this.pagination() },
  onPaginationChange: next => typeof next === 'function' ? this.pagination.update(next) : this.pagination.set(next),
}))
```

### Choose State Ownership

Use one owner for each slice:

- Prefer internal state and feature APIs for local interaction.
- Use `initialState` for starting/reset values; later changes do not reset current state.
- Prefer a stable atom from `@tanstack/angular-store` in `atoms` for Query or other cross-system state. Table APIs update it without a change callback.
- Use an Angular signal read in `state.<slice>` plus the matching callback for simple controlled state. Handle raw values and updater functions.

External atoms win over controlled `state`, which syncs into the internal base atom. Do not give a slice two owners. The global v8 `onStateChange` option is gone; subscribe to `table.store` when all state changes must be observed.

### Initialize, Update, and Reset

Prefer feature methods such as `setSorting`, `nextPage`, `toggleVisibility`, and `toggleSelected`. Direct base-atom writes are a rare escape hatch for internal state; write the external atom when it owns a slice.

```ts
this.table.resetSorting()
this.table.resetPagination()
this.table.resetPagination(true)
```

Feature resets use `table.initialState` unless `true` requests the feature default, and can update external owners. Core `table.reset()` resets internal base atoms only. Use feature-specific types such as `PaginationState`; use `TableState<typeof features>` when the complete registered state type is needed.

### Common Mistakes

#### MEDIUM Wrapping atoms redundantly

Wrong:

```ts
readonly pagination = computed(() => computed(() => this.table.atoms.pagination.get())())
```

Correct:

```ts
readonly pagination = computed(() => this.table.atoms.pagination.get())
```

Table atoms already bridge to Angular signals; one tracked read is sufficient.

Source: `docs/framework/angular/guide/table-state.md`

#### HIGH Ignoring initializer reruns

Wrong:

```ts
injectTable(() => ({
  features: tableFeatures({ rowPaginationFeature }),
  columns: makeColumns(),
  state: { pagination: this.pagination() },
  data,
}))
```

Correct:

```ts
injectTable(() => ({
  features,
  columns,
  state: { pagination: this.pagination() },
  data,
}))
```

Controlled signal writes rerun the initializer, so static work must remain outside it.

Source: `packages/angular-table/src/injectTable.ts`

#### HIGH Storing updater functions

Wrong:

```ts
onPaginationChange: (next) => this.pagination.set(next)
```

Correct:

```ts
onPaginationChange: (next) =>
  typeof next === 'function'
    ? this.pagination.update(next)
    : this.pagination.set(next)
```

Callbacks receive a value or updater; assigning the function corrupts owned state.

Source: `examples/angular/basic-external-state/src/app/app.ts`

#### MEDIUM Giving one slice multiple owners

Wrong:

```ts
{ initialState: { pagination: start }, atoms: { pagination: this.paginationAtom } }
```

Correct:

```ts
{
  atoms: {
    pagination: this.paginationAtom
  }
}
```

External atoms/state override initial state; choose one owner for each slice.

Source: `docs/framework/angular/guide/table-state.md`

### API Discovery

Inspect `node_modules/@tanstack/angular-table/dist/types/` and `reactivity.d.ts`; inspect `@tanstack/angular-store/dist/` for external atoms and installed core feature source for state APIs.

<a id="source-tanstack-angular-table-with-tanstack-query"></a>

## With Tanstack Query

Source: `tanstack-angular-table-with-tanstack-query`.

This skill builds on `@tanstack/table-core#client-vs-server`, `getting-started`, and `table-state`. Decide the server-owned stages and dataset before wiring Query.

### Setup

```ts
import {
  injectQuery,
  keepPreviousData,
} from '@tanstack/angular-query-experimental'
import { signal } from '@angular/core'
import {
  injectTable,
  rowPaginationFeature,
  tableFeatures,
} from '@tanstack/angular-table'

const features = tableFeatures({ rowPaginationFeature })
const EMPTY_ROWS: never[] = []

export class PeopleTable {
  readonly pagination = signal({ pageIndex: 0, pageSize: 20 })
  readonly query = injectQuery(() => ({
    queryKey: [
      'people',
      this.pagination().pageIndex,
      this.pagination().pageSize,
    ],
    queryFn: () =>
      fetch(
        `/api/people?page=${this.pagination().pageIndex}&size=${this.pagination().pageSize}`,
      ).then((r) => r.json()),
    placeholderData: keepPreviousData,
  }))
  readonly table = injectTable(() => ({
    features,
    columns,
    data: this.query.data()?.rows ?? EMPTY_ROWS,
    rowCount: this.query.data()?.rowCount ?? 0,
    manualPagination: true,
    state: { pagination: this.pagination() },
    onPaginationChange: (next) =>
      typeof next === 'function'
        ? this.pagination.update(next)
        : this.pagination.set(next),
  }))
}
```

### Core Patterns

#### Track every server-owned input

Read pagination, sorting, and filtering signals inside `injectQuery(() => ...)` and include them in the query key. Return data already processed for each manual stage.

#### Keep Query data authoritative

Read the Query signal directly in `injectTable`. Create another signal only for a deliberate editable draft with an explicit cache synchronization policy.

### Common Mistakes

#### HIGH Capturing query inputs outside tracking

Wrong:

```ts
const page = this.pagination().pageIndex
readonly query = injectQuery(() => ({ queryKey: ['people', page], queryFn }))
```

Correct:

```ts
readonly query = injectQuery(() => ({ queryKey: ['people', this.pagination().pageIndex], queryFn }))
```

Signal reads inside the options function establish refetch dependencies.

Source: `examples/angular/with-tanstack-query/src/app/app.ts`

#### HIGH Expecting manual mode to request

Wrong:

```ts
injectTable(() => ({ features, columns, data, manualPagination: true }))
```

Correct:

```ts
injectTable(() => ({
  features,
  columns,
  data: this.query.data()?.rows ?? EMPTY_ROWS,
  manualPagination: true,
}))
```

Manual flags only bypass client row processing; Query performs network work.

Source: `examples/angular/with-tanstack-query/src/app/app.ts`

#### HIGH Omitting total counts

Wrong:

```ts
{ data: this.query.data()?.rows ?? EMPTY_ROWS, manualPagination: true }
```

Correct:

```ts
{ data: this.query.data()?.rows ?? EMPTY_ROWS, rowCount: this.query.data()?.rowCount ?? 0, manualPagination: true }
```

Table needs `rowCount` or `pageCount` to constrain navigation across server pages.

Source: `docs/framework/angular/guide/pagination.md`

### API Discovery

Inspect installed `@tanstack/angular-table/dist/types/`, the relevant core feature source, and installed Angular Query source for the exact `injectQuery` package/version contract.

<a id="source-tanstack-angular-table-with-tanstack-virtual"></a>

## With Tanstack Virtual

Source: `tanstack-angular-table-with-tanstack-virtual`.

This skill builds on `@tanstack/table-core#core`, `getting-started`, and `table-state`. Virtual is a rendering concern over final Table models, not a feature plugin.

### Setup

```ts
import { computed, viewChild } from '@angular/core'
import { injectVirtualizer } from '@tanstack/angular-virtual'
import type { ElementRef } from '@angular/core'

export class VirtualTable {
  readonly scrollElement =
    viewChild<ElementRef<HTMLDivElement>>('scrollElement')
  readonly rows = computed(() => this.table.getRowModel().rows)
  readonly rowVirtualizer = injectVirtualizer(() => ({
    count: this.rows().length,
    scrollElement: this.scrollElement()?.nativeElement,
    estimateSize: () => 34,
    getItemKey: (index) => this.rows()[index]!.id,
    overscan: 5,
  }))
  readonly virtualRows = computed(() => this.rowVirtualizer.getVirtualItems())
  readonly totalSize = computed(() => this.rowVirtualizer.getTotalSize())
}
```

### Core Patterns

#### Derive reactive models

Use `computed(() => table.getRowModel().rows)` and `computed(() => table.getVisibleLeafColumns())`. `injectVirtualizer` tracks signal reads in its initializer and requires injection context.

#### Own the layout contract

Give the scroll element bounded overflow, create a total-size spacer, and translate or measure each virtual item. Use grid/flex widths for dynamic rows/columns and keep sticky headers inside the correct scroll geometry.

#### Gate infinite fetches

When the last virtual item approaches fetched length, fetch only if more server rows exist and a request is not active. Manual sorting requires server-sorted pages and a reset/refetch policy.

### Common Mistakes

#### CRITICAL Constructing outside injection context

Wrong:

```ts
export function virtualize(options) {
  return injectVirtualizer(() => options)
}
```

Correct:

```ts
export class VirtualTable {
  readonly virtualizer = injectVirtualizer(() => options())
}
```

The Angular virtualizer follows DI lifecycle rules just like `injectTable`.

Source: `examples/angular/virtualized-rows/src/app/app.ts`

#### HIGH Virtualizing raw data

Wrong:

```ts
readonly rows = computed(() => this.data())
```

Correct:

```ts
readonly rows = computed(() => this.table.getRowModel().rows)
```

Raw data bypasses Table filtering, sorting, expansion, grouping, and pagination.

Source: `docs/framework/angular/guide/virtualization.md`

#### HIGH Forgetting spacer and transforms

Wrong:

```html
@for (item of virtualRows(); track item.key) {
<div>{{ rows()[item.index].id }}</div>
}
```

Correct:

```html
<div [style.height.px]="totalSize()" style="position:relative">
  <div style="position:absolute"></div>
</div>
```

Virtual computes ranges and sizes but does not apply DOM geometry, sticky CSS, or column widths.

Source: `examples/angular/virtualized-columns/src/app/app.ts`

### API Discovery

Inspect installed `@tanstack/angular-table/dist/types/`, installed `@tanstack/angular-virtual/dist/`, and the maintained Angular examples for current row, column, measurement, and infinite patterns.
