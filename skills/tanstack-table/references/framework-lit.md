# Lit adapter

Lit Table adapter guidance.

<a id="source-tanstack-lit-table-create-table-hook"></a>

## Create Table Hook

Source: `tanstack-lit-table-create-table-hook`.

This skill builds on @tanstack/table-core#core plus this package's getting-started and table-state skills.

### Setup

```ts
import {
  createSortedRowModel,
  createTableHook,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/lit-table'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})

export const { createAppColumnHelper, useAppTable, useTableContext } =
  createTableHook({
    features,
    getRowId: (row: { id: string }) => row.id,
  })
```

Use `createAppColumnHelper<Person>()` to define app columns. In a `LitElement`, capture the host in a local variable and initialize `useAppTable(host, options, selector)` once as a field; call the returned `table()` function during render. The maintained composable-tables example shows the complete host/getter shape.

### Core Patterns

#### Bind shared features, not table-specific data

Put feature plugins, row-model factories, default options, row IDs, and shared render conventions in the factory. Pass each table's columns, data, and controlled state to `useAppTable`.

#### Add component registries only for real conventions

Register common cell/header functions when multiple tables use them. Render them through `table.AppCell` and `table.AppHeader`; ordinary tables can use the returned table instance without registries.

#### Consume table context in custom elements

Table-level controls can call the returned `useTableContext(this)` from a custom element. This preserves the factory's feature and data types without prop drilling.

### Common Mistakes

#### MEDIUM Factory used for one table

Wrong: add an app hook and registries for a single isolated table.

Correct: use `TableController` directly until features, defaults, or UI conventions genuinely repeat.

The factory adds an application abstraction; it does not replace the simpler standalone path.

Source: TanStack/table:docs/framework/lit/guide/composable-tables.md

#### HIGH Prop drilling replaces typed context

Wrong: pass the stable table instance through every custom-element property boundary.

Correct: call the `useTableContext` returned by the same `createTableHook` in the nearest registered/custom control.

The returned context is bound to the factory's exact features and components.

Source: TanStack/table:packages/lit-table/src/createTableHook.ts

#### HIGH Recreating useAppTable each render

Wrong: call `useAppTable(this, options)` afresh inside `render`.

Correct: initialize it once as a host field and call `this.appTable.table()` during render.

The helper owns a TableController and context provider tied to the host lifecycle.

Source: TanStack/table:examples/lit/composable-tables

### API Discovery

Inspect `node_modules/@tanstack/lit-table/dist/createTableHook.d.ts`. Use the matching installed implementation rather than assuming JSX-adapter component APIs exist in Lit.

<a id="source-tanstack-lit-table-getting-started"></a>

## Getting Started

Source: `tanstack-lit-table-getting-started`.

This skill builds on @tanstack/table-core#core and @tanstack/table-core#table-features. Read them first for the headless and feature-plugin model.

### Setup

```ts
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import {
  FlexRender,
  TableController,
  createColumnHelper,
  tableFeatures,
} from '@tanstack/lit-table'

type Person = { id: string; name: string }

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, Person>()
const columns = columnHelper.columns([
  columnHelper.accessor('name', { header: 'Name' }),
])

@customElement('people-table')
export class PeopleTable extends LitElement {
  @state() private people: Array<Person> = [{ id: '1', name: 'Ada' }]
  private tableController = new TableController<typeof features, Person>(this)

  protected render() {
    const table = this.tableController.table({
      features,
      columns,
      data: this.people,
      getRowId: (row) => row.id,
    })

    return html`<table>
      <thead>
        ${repeat(
          table.getHeaderGroups(),
          (group) => group.id,
          (group) =>
            html`<tr>
              ${repeat(
                group.headers,
                (header) => header.id,
                (header) =>
                  html`<th>
                    ${header.isPlaceholder ? null : FlexRender({ header })}
                  </th>`,
              )}
            </tr>`,
        )}
      </thead>
      <tbody>
        ${repeat(
          table.getRowModel().rows,
          (row) => row.id,
          (row) =>
            html`<tr>
              ${repeat(
                row.getAllCells(),
                (cell) => cell.id,
                (cell) => html`<td>${FlexRender({ cell })}</td>`,
              )}
            </tr>`,
        )}
      </tbody>
    </table>`
  }
}
```

### Core Patterns

#### Keep static table infrastructure outside render

Create `features`, column helpers, and static columns at module scope. Keep one `TableController` as a host field; call its `table` method during each render with current options.

#### Select only state the host renders

```ts
const table = this.tableController.table(
  { features, columns, data: this.people },
  (state) => ({ pagination: state.pagination }),
)
```

Use the default selector for simple tables. Narrow it only when host updates are measurably expensive.

#### Treat markup and CSS as application code

Table supplies models and render values. Use semantic elements, accessibility behavior, widths, sticky positioning, and design-system components in the Lit template.

### Common Mistakes

#### HIGH Recreating the controller during render

Wrong:

```ts
protected render() {
  const controller = new TableController<typeof features, Person>(this)
  return html`${controller.table({ features, columns, data: this.people }).getRowModel().rows.length}`
}
```

Correct: keep `private tableController = new TableController(this)` as a class field and reuse it.

Each controller registers with the host and owns subscriptions; recreating it leaks lifecycle work and loses stable table state.

Source: TanStack/table:packages/lit-table/src/TableController.ts

#### HIGH Passing v8 options to the constructor

Wrong: `new TableController(this, () => ({ data, columns }))`.

Correct: construct with the host only, then call `this.tableController.table({ features, data, columns })` during render.

The v9 controller receives current options through `table`, not a constructor thunk.

Source: TanStack/table:docs/framework/lit/guide/migrating.md

#### HIGH Expecting feature state to render UI

Wrong: enable column pinning and assume cells become sticky.

Correct: render the appropriate start/center/end collections and apply sticky offsets and CSS in the template.

TanStack Table is headless; state and models never inject markup or styles.

Source: TanStack/table:docs/overview.md

### API Discovery

Inspect `node_modules/@tanstack/lit-table/dist/index.d.ts` and the exported implementation. Core table and feature APIs are in `node_modules/@tanstack/table-core/dist/`.

<a id="source-tanstack-lit-table-migrate-v8-to-v9"></a>

## Migrate V8 To V9

Source: `tanstack-lit-table-migrate-v8-to-v9`.

Use this as the complete breaking-change checklist. V9 is the current API. The central Lit change is a stable controller constructed with the host, while current options are passed to `.table(...)` during render.

Framework prerequisites: Lit 3.1.3 or newer within v3 (`lit ^3.1.3`) and
`@lit/context ^1.1.0`.

### Recommended Migration Order

1. Replace the v8 controller options thunk with a host-only typed `TableController`.
2. Pass current options to `controller.table(options, selector?)` in render.
3. Move features, row models, and registries into `tableFeatures`.
4. Update selected state, controlled ownership, and rendering.
5. Apply every shared API and type rename below.
6. Treat `stockFeatures` as a temporary audit bridge; explicit features are the production target.

```ts
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

class PeopleTable extends LitElement {
  private controller = new TableController<typeof features, Person>(this)

  protected render() {
    const table = this.controller.table({ features, columns, data: this.data })
    return html`<span>${table.getRowModel().rows.length} rows</span>`
  }
}
```

### Construction and Feature Registration

| v8                                         | v9                                                         |
| ------------------------------------------ | ---------------------------------------------------------- |
| `new TableController(this, () => options)` | `new TableController<typeof features, TData>(this)`        |
| `controller.table` property                | `controller.table(options, selector?)` call in render      |
| All features bundled                       | Required `features: tableFeatures({...})`                  |
| `getCoreRowModel()` option                 | Remove; core row model is automatic                        |
| `get*RowModel()` table options             | `create*RowModel()` slots in `tableFeatures`               |
| `sortingFns` table option                  | `sortFns` feature slot                                     |
| Top-level `onStateChange`                  | Per-slice callbacks, external atoms, or store subscription |

Feature imports are `cellSelectionFeature`, `columnFilteringFeature`, `globalFilteringFeature`, `rowSortingFeature`, `rowPaginationFeature`, `rowSelectionFeature`, `rowExpandingFeature`, `rowPinningFeature`, `columnPinningFeature`, `columnVisibilityFeature`, `columnOrderingFeature`, `columnSizingFeature`, `columnResizingFeature`, `rowAggregationFeature`, `columnGroupingFeature`, and `columnFacetingFeature`. APIs are feature-gated. Put a feature before its dependent slot in one `tableFeatures` call. Aggregation is independent from grouping: register `rowAggregationFeature` for aggregation APIs and add `columnGroupingFeature` only for grouped rows.

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

Factories take no arguments. Register `filterFns`, `sortFns`, and `aggregationFns` as sibling feature slots holding individually imported built-ins (`filterFn_includesString`, `sortFn_alphanumeric`, `aggregationFn_sum`) under their conventional keys. The full registry objects still work but bundle every built-in.

### Lit State Migration

- `table.getState().sorting` becomes `table.state.sorting`, `table.store.state.sorting`, or narrow `table.atoms.sorting.get()`.
- `table.state` contains all registered slices by default. Pass a second-argument selector to `controller.table(...)` only to narrow the render-selected surface.
- Use `table.subscribe(table.store, stableSelector, renderCallback)` for selected template state. Keep the selector reference stable outside render.
- Controlled state uses Lit `@state()` fields and matching `on[State]Change` callbacks that resolve value-or-function updaters.
- Top-level `onStateChange` is removed. Use per-slice callbacks, external atoms, or `table.store.subscribe` for all changes.
- External atoms come from `@tanstack/store` and are provided through `atoms`. Never provide both `atoms.pagination` and `state.pagination`.
- The controller requests host updates for table and option-store changes; do not create a new controller in render.
- Treat `table.baseAtoms` as internal writable state; prefer feature APIs or external atoms.

### Rendering and Composition

| v8                         | v9                                                                            |
| -------------------------- | ----------------------------------------------------------------------------- |
| `flexRender(def, context)` | `FlexRender({ cell })`, `FlexRender({ header })`, or `FlexRender({ footer })` |
| Standalone helper only     | `table.FlexRender({ cell })` is also available                                |
| Repeated raw options       | `tableOptions(...)` composition                                               |
| Repeated conventions       | `createTableHook({ features, ... })`                                          |

`createTableHook` returns a host-bound app table helper and pre-bound column helper. Construct the app helper with the Lit host, then call its `.table()` during render. It is optional and intended for recurring application conventions.

### Complete Shared Breaking-Change Map

#### Instance methods

Row, cell, column, header, and related methods now live on shared prototypes and use `this`. Call them on their instances. Do not destructure/pass them bare or expect them in object spread, `Object.keys`, or JSON. Table methods are not affected.

#### Logical column pinning

V9 has no `left`/`right` aliases.

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

Prefer CSS logical inset properties; logical names do not set DOM direction. `columnResizeDirection` is unchanged.

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

- Add `TFeatures` first: `ColumnDef<typeof features, Person>`, `Column<typeof features, Person>`, `Row<typeof features, Person>`, `Table<typeof features, Person>`.
- Replace `createColumnHelper<Person>()` with `createColumnHelper<typeof features, Person>()`; use `columnHelper.columns([...])` for inference.
- Use `StockFeatures` when using `stockFeatures`.
- Existing `TableMeta`/`ColumnMeta` declaration merging must add `TFeatures` first. Prefer per-table `tableMeta`/`columnMeta: metaHelper<...>()` slots.
- Replace global `FilterFns`, `SortFns`, `AggregationFns`, and `FilterMeta` augmentation with registry slots and `filterMeta: metaHelper<...>()`; registered keys become valid strings.
- `RowData` is restricted to records or arrays; prefer explicit object row types.

### Common Migration Failures

#### CRITICAL: Keeping the v8 controller shape

The controller constructor takes only the host in v9. Pass options to `.table(...)` while rendering.

#### HIGH: Recreating the controller in render

Keep one stable controller field so subscriptions and host lifecycle remain attached.

#### HIGH: Leaving row models on table options

Move each row model beside its prerequisite feature in `tableFeatures`.

#### HIGH: Unstable table.subscribe selector

Define the selector as a class field or outside render to prevent avoidable update churn.

#### HIGH: Destructuring instance methods

Use `row.getValue('name')`; prototype methods require the original instance and are absent from shallow clones.

### Final Checklist

- [ ] `TableController` is host-only, stable, typed with features/data, and options move to `.table(...)`.
- [ ] Features, row models, and registries are in `tableFeatures`; core row model is removed.
- [ ] State reads use selected state, atoms, or store intentionally; selectors are stable.
- [ ] `onStateChange` is replaced; controlled and external-atom ownership do not overlap.
- [ ] Rendering uses the v9 `FlexRender` object helpers.
- [ ] Prototype methods, pinning, sizing/resizing, sorting, row, and selection changes are audited.
- [ ] Helpers, types, meta, registries, and `RowData` use v9 shapes.
- [ ] Temporary `stockFeatures` usage has an explicit removal plan.

### API Discovery

Inspect `node_modules/@tanstack/lit-table/dist/index.d.ts` and `TableController.d.ts`. Verify feature slots and the exact installed v9 APIs in `node_modules/@tanstack/table-core/dist/`; do not reconstruct v9 from v8 memory.

<a id="source-tanstack-lit-table-table-state"></a>

## Table State

Source: `tanstack-lit-table-table-state`.

This skill builds on @tanstack/table-core#core and this package's getting-started skill.

### State Mental Model

TanStack Table is primarily a state coordinator. Keep state internal unless another subsystem needs to read, persist, or drive it. Without `initialState`, `atoms`, `state`, or `on[State]Change`, the table owns every registered slice.

- `table.baseAtoms` are internal writable atoms initialized from resolved initial state.
- `table.atoms` are readonly derived atoms for the active owner of each registered slice.
- `table.store` combines those atoms into one readonly flat store.
- `table.state` is only the value selected by the second `controller.table` argument.

`TableController` subscribes to state/options and requests host updates. State is feature-based: if pagination is missing from options, atoms, or types, register `rowPaginationFeature`. Keep `features`, `columns`, and `data` references stable across `render()` calls; never create arrays or derive rows inline in the `controller.table` options.

### Setup

```ts
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
  TableController,
  rowPaginationFeature,
  tableFeatures,
} from '@tanstack/lit-table'
import type { PaginationState } from '@tanstack/lit-table'

type Item = { id: string }
const features = tableFeatures({ rowPaginationFeature })
const columns = [{ accessorKey: 'id' }]
const data: Item[] = [{ id: '1' }]

@customElement('paged-items')
export class PagedItems extends LitElement {
  @state() private pagination: PaginationState = { pageIndex: 0, pageSize: 10 }
  private controller = new TableController<typeof features, Item>(this)

  protected render() {
    const table = this.controller.table(
      {
        features,
        columns,
        data,
        state: { pagination: this.pagination },
        onPaginationChange: (updater) => {
          this.pagination =
            typeof updater === 'function' ? updater(this.pagination) : updater
        },
      },
      (state) => ({ pagination: state.pagination }),
    )

    return html`<button @click=${() => table.nextPage()}>
      Page ${table.state.pagination.pageIndex + 1}
    </button>`
  }
}
```

### Core Patterns

#### Read selected render state from table.state

The second argument to `controller.table` defines the shape of `table.state`. Its selector should be stable when reused across renders.

#### Read one current slice from its atom

`table.atoms.pagination.get()` returns the current pagination snapshot. Use it in event handlers; use selected state or `table.subscribe` when a template region must update reactively.

#### Put narrow reactive islands in table.subscribe

```ts
const page = table.subscribe(
  table.store,
  (state) => state.pagination.pageIndex,
  (pageIndex) => html`<span>Page ${pageIndex + 1}</span>`,
)
```

Keep the selector reference stable for repeated subscription sites.

### Choose State Ownership

Use exactly one owner per slice:

- Prefer internal state and feature APIs for table-local behavior.
- Use `initialState` for starting/reset values. Changing it later does not reset current state.
- Prefer a stable external TanStack Store atom in `atoms` when state is shared. Feature APIs write it directly, so omit `on[State]Change`.
- Use a reactive host property in `state.<slice>` plus its matching callback for simple controlled state. Write raw values and resolved updater functions back to the property.

External atoms take precedence over external `state`, which syncs into the internal base atom. Do not configure multiple owners. The global v8 `onStateChange` option is gone; subscribe to `table.store` if all state changes must be observed.

### Initialize, Update, and Reset

Prefer `setSorting`, `nextPage`, `toggleVisibility`, `toggleSelected`, and other feature methods. Direct `baseAtoms` writes are a rare escape hatch for internal state; write the supplied external atom when it owns the slice.

```ts
table.resetSorting()
table.resetPagination()
table.resetPagination(true)
```

Feature resets use `table.initialState` unless `true` requests the feature default and can update external owners. Core `table.reset()` resets internal base atoms only. Use slice types such as `PaginationState` and use `TableState<typeof features>` for the complete feature-inferred state.

### Common Mistakes

#### HIGH Callback freezes controlled state

Wrong: provide `onPaginationChange` but omit `state.pagination`.

Correct: pass the current controlled value and write both direct values and updater functions back to the owning property.

An on-change callback marks the slice as externally managed; failing to feed the next value back leaves the table reading the old value.

Source: TanStack/table:docs/framework/lit/guide/table-state.md

#### HIGH Snapshot read mistaken for subscription

Wrong: cache `const page = table.store.state.pagination.pageIndex` outside render and expect it to change.

Correct: read selected `table.state` during render or create a `table.subscribe` template island.

A store snapshot is current data, not a continuing Lit subscription.

Source: TanStack/table:packages/lit-table/src/TableController.ts

#### MEDIUM Unstable selector defeats update gating

Wrong: create unrelated selector closures throughout the render tree.

Correct: define reusable selectors as stable class fields or module functions.

TableController shallow-compares selected output; stable selector intent avoids unnecessary subscription churn.

Source: TanStack/table:docs/framework/lit/guide/table-state.md

### API Discovery

Inspect `node_modules/@tanstack/lit-table/dist/TableController.d.ts`, then `node_modules/@tanstack/table-core/dist/core/table/` for state precedence and updater behavior.

<a id="source-tanstack-lit-table-with-tanstack-virtual"></a>

## With Tanstack Virtual

Source: `tanstack-lit-table-with-tanstack-virtual`.

### Setup

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { VirtualizerController } from '@tanstack/lit-virtual'
import {
  TableController,
  tableFeatures,
  type ColumnDef,
} from '@tanstack/lit-table'

type Item = { id: string; name: string }
const features = tableFeatures({})
const columns: Array<ColumnDef<typeof features, Item>> = [
  { accessorKey: 'name', header: 'Name' },
]
const data: Array<Item> = Array.from({ length: 10_000 }, (_, id) => ({
  id: String(id),
  name: `Item ${id}`,
}))

@customElement('virtual-items')
export class VirtualItems extends LitElement {
  private controller = new TableController<typeof features, Item>(this)
  private scroller = createRef<HTMLDivElement>()
  private virtualizer = new VirtualizerController(this, {
    count: data.length,
    getScrollElement: () => this.scroller.value,
    estimateSize: () => 32,
    overscan: 5,
  })

  protected render() {
    const table = this.controller.table({
      features,
      columns,
      data,
      getRowId: (row) => row.id,
    })
    const rows = table.getRowModel().rows
    const v = this.virtualizer.getVirtualizer()
    v.setOptions({ ...v.options, count: rows.length })

    return html`<div
      ${ref(this.scroller)}
      style="height:400px;overflow:auto;position:relative"
    >
      <div style="height:${v.getTotalSize()}px;position:relative">
        ${v
          .getVirtualItems()
          .map(
            (item) =>
              html`<div
                style="position:absolute;transform:translateY(${item.start}px)"
              >
                ${rows[item.index].getValue('name')}
              </div>`,
          )}
      </div>
    </div>`
  }
}
```

### Core Patterns

#### Virtualize the final row model

Set the virtualizer count from `table.getRowModel().rows.length`; index virtual items into that same array so filtering, sorting, expansion, and pagination are respected.

#### Keep geometry sources consistent

For column virtualization, estimate from `column.getSize()` and remeasure when columnSizing changes. Render widths from the same sizing state.

#### Treat unsupported combinations as user composition

Drag-and-drop plus virtualization is not a maintained Table recipe. Start from the maintained Virtual example and reconcile both libraries' transforms, measurement, and auto-scroll contracts explicitly.

### Common Mistakes

#### HIGH Virtualizing raw data

Wrong: index virtual items into the original `data` array.

Correct: index into `table.getRowModel().rows`.

Raw data ignores active Table processing and produces mismatched rows after sorting or filtering.

Source: TanStack/table:examples/lit/virtualized-rows

#### HIGH Count and rows come from different models

Wrong: use `data.length` after filters change but render filtered rows.

Correct: update the virtualizer count from the same current `rows` array being rendered.

Mismatched geometry can index undefined rows or leave blank scroll space.

Source: TanStack/table:examples/lit/virtualized-rows

#### HIGH Recreating columns during host renders

Wrong: pass `columns: [...columns]` from `render()` to work around a readonly tuple.

Correct: declare a stable mutable `Array<ColumnDef<typeof features, Item>>` once and pass `columns` directly.

Lit host updates can be driven by scrolling and measurement. A fresh column reference rebuilds Table's column pipeline on every such render.

Source: TanStack/table:examples/lit/virtualized-rows

#### HIGH Sticky and sizing CSS assumed automatic

Wrong: add a VirtualizerController and expect sticky headers, widths, and transforms.

Correct: implement the scroll container, total-size spacer, absolute row transforms, sticky regions, and widths in Lit CSS/templates.

Both libraries are headless over rendering geometry.

Source: TanStack/table:docs/framework/lit/guide/virtualization.md

### API Discovery

Inspect `node_modules/@tanstack/lit-table/dist/index.d.ts` and `node_modules/@tanstack/lit-virtual/dist/`. Use maintained examples for geometry; do not register Virtual in `tableFeatures`.
