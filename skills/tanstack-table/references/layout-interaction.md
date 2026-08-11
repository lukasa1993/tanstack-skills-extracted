# Layout and interaction

Ordering, pinning, sizing, visibility, selection, spanning, and expanding.

<a id="source-tanstack-table-core-cell-selection"></a>

## Cell Selection

Source: `tanstack-table-core-cell-selection`.

This skill builds on `core` and `table-features`. `cellSelection` is an ordered operation log of rectangles, each stored as two corner cells identified by row and column id. It is not a per-cell map, and it is not positional. Table resolves the log into disjoint positive rectangles for membership and derived reads.

### Setup

```ts
import { cellSelectionFeature, tableFeatures } from '@tanstack/table-core'

type Person = { id: string; name: string }
export const features = tableFeatures({ cellSelectionFeature })
export const options = {
  getRowId: (row: Person) => row.id,
}
```

State shape:

```ts
type CellSelectionRange = {
  anchorRowId: string
  anchorColumnId: string
  focusRowId: string
  focusColumnId: string
  operation?: 'include' | 'exclude'
}
type CellSelectionState = Array<CellSelectionRange>
```

The `anchor` corner stays put; the `focus` corner moves during a drag or Shift-extend. Two corners are what make Shift-extend possible, and they keep a drag across thousands of cells to a two-field write. Operations apply in array order. An omitted `operation` means `include` for backward compatibility; `exclude` subtracts from the selection produced by preceding entries.

### Core Patterns

#### Bind both mouse handlers

```ts
const onMouseDown = cell.getSelectionStartHandler()
const onMouseEnter = cell.getSelectionExtendHandler()
```

The start handler attaches its own document-level `mouseup` listener and removes it when the drag ends, so a pointer released outside the table still finishes correctly. Pass a document explicitly (`cell.getSelectionStartHandler(iframeDocument)`) only when the table renders into another document.

With the default event predicates, Shift extends the active operation. Ctrl/Cmd starts an inclusion when the starting cell is unselected and an exclusion when it is selected. That choice remains fixed for the drag, so shrinking an exclusion restores cells that leave its rectangle. Set `enableMultiCellRangeSelection: false` to disable both modifier behaviors.

#### Apply ranges programmatically

```ts
table.selectCellRange(range) // replace
table.selectCellRange(range, { mode: 'include' })
table.selectCellRange(range, { mode: 'exclude' })
```

Use `mode` when the operation is known. The deprecated `{ additive: true }` option is only an alias for include mode; an explicit `mode` wins.

#### Read the selection

```ts
const count = table.getSelectedCellCount()
const bounds = table.getCellSelectionBounds()
const grids = table.getSelectedCellRangesData() // [range][row][column]
```

`bounds` and `grids` describe the final disjoint positive regions after all operations, not one entry per stored state operation. Expansion APIs are memoized and pull-based, so a table that only highlights cells never pays to enumerate a large selection. Cell count uses rectangle arithmetic unless a per-cell `enableCellSelection` predicate requires enumeration.

#### Draw the outline from edges

`cell.getSelectionEdges()` marks a side `true` when the neighbouring cell in that direction is not selected, which yields one continuous outline around a union of rectangles. All sides are `false` when the cell is not selected.

#### Drive keyboard navigation externally

The feature ships no keydown handling. Call `table.moveCellSelection(direction)`, `table.extendCellSelection(direction)`, `table.setFocusedCell(rowId, columnId)`, `table.selectAllCells()`, and `table.resetCellSelection(true)` from a hotkey library such as `@tanstack/react-hotkeys`, scoped to the grid element rather than the document. Extending preserves the active operation. `getFocusedCell()` follows the latest anchor, so an excluded cell can remain focused without being selected.

### Common Mistakes

#### [HIGH] Expecting a per-cell selection map

Wrong: `const isSelected = table.state.cellSelection[cell.id]`

Correct: `const isSelected = cell.getIsSelected()`

`cellSelection` holds ordered rectangle operations, not cell keys. Membership is resolved against the memoized final positive bounds.

Source: `packages/table-core/src/features/cell-selection/cellSelectionFeature.types.ts`

#### [HIGH] Treating stored operations as final selected regions

Wrong: serialize or render each `table.state.cellSelection` entry as a selected rectangle.

Correct: use `table.getCellSelectionBounds()`, `cell.getIsSelected()`, or `table.getSelectedCellRangesData()` for the resolved selection.

An exclusion is an instruction, not a selected region, and a subtraction can split one included rectangle into four disjoint positive regions. Re-including a later rectangle applies after the exclusion because state order is significant.

Source: `packages/table-core/src/features/cell-selection/cellSelectionGeometry.ts`

#### [HIGH] Assuming a range is frozen to the cells it originally covered

Ranges are anchored to corner ids, so sorting, filtering, and column reordering keep the corners and recompute what sits between them. A range can therefore widen onto columns or rows the user never selected. Reset in userland when the product needs stricter behavior:

```ts
// after a column reorder or pin
table.resetCellSelection(true)
```

Hiding a column that a corner sits on makes the range inert rather than deleting it; it returns when the column is shown again.

Source: `docs/framework/react/guide/cell-selection.md#how-ranges-survive-table-changes`

#### [HIGH] Binding only mousedown and expecting drag

Wrong:

```ts
const props = { onMouseDown: cell.getSelectionStartHandler() }
```

Correct:

```ts
const props = {
  onMouseDown: cell.getSelectionStartHandler(),
  onMouseEnter: cell.getSelectionExtendHandler(),
}
```

Without the extend handler a drag selects only the origin cell. Do not add a `mouseup` binding; the start handler already owns one.

Source: `examples/react/cell-selection`

#### [HIGH] Deriving column position from column definition order

Wrong: `const index = column.getIndex()`

Correct: `const isSelected = cell.getIsSelected()`

Cells render start-pinned first, then center, then end. `getVisibleLeafColumns()` and `column.getIndex()` are not pinning-reordered, so indexing a selection against them makes a rectangle visually scattered as soon as a column is pinned. The feature resolves its own render-order index map; use the cell APIs rather than recomputing membership.

Source: `packages/table-core/src/features/cell-selection/cellSelectionFeature.utils.ts`

#### [HIGH] Re-rendering every cell on each drag update

Wrong: one subscription wrapping the whole `<tbody>`.

Correct: one subscription per row, with a selector returning only what changes that row's appearance.

A drag writes state on every cell boundary crossed. A table-wide subscription reconciles every cell each time. Subscribe per row against `table.atoms.cellSelection` and derive a key from `table.getCellSelectionBounds()` (memoized, so it computes once per change) covering the row itself plus the rows above and below, which decide its top and bottom edges.

Source: `docs/framework/react/guide/cell-selection.md#performance-with-tablesubscribe`

#### [MEDIUM] Drawing selection borders on a border-collapse table

Wrong: `.cell-selected { border: 2px solid blue }`

Correct: `.cell-selected { box-shadow: inset 0 0 0 2px blue }`

On a `border-collapse` table a thicker border widens the shared grid line, so rows change height as cells become selected. Box-shadow never affects layout.

Source: `examples/react/cell-selection/src/index.css`

#### [MEDIUM] Expecting a clipboard string from the table

Wrong: `navigator.clipboard.writeText(table.getSelectedCellsAsTsv())`

Correct: `navigator.clipboard.writeText(toTsv(table.getSelectedCellRangesData()))`

The table returns raw values only. The delimiter, the representation of `null`, and quoting rules are application decisions, so serialization is userland. Quote any field containing a tab, newline, or quote, or a pasted spreadsheet gains phantom columns.

Source: `docs/framework/react/guide/cell-selection.md#copying-a-selection`

#### [MEDIUM] Persisting a selection and expecting drag state with it

`cellSelection` is safe to persist because drag session state is deliberately non-reactive instance data, not part of the slice. Preserve array order and each `operation`; sorting or deduplicating the entries changes the resolved selection. Do not add an `isSelecting` field to the persisted state; a stored `true` would rehydrate into a drag that hovering extends and nothing ever ends.

Source: `packages/table-core/src/features/cell-selection/cellSelectionFeature.types.ts`

#### [MEDIUM] Fighting the automatic reset on data change

Selection resets to `initialState.cellSelection` whenever `data` changes, because new data can invalidate the row ids a range points at or silently re-select cells when ids are reused. Opt out deliberately:

```ts
export const keepAcrossDataChanges = { autoResetCellSelection: false }
```

`autoResetAll` overrides this option.

Source: `packages/table-core/src/features/cell-selection/cellSelectionFeature.ts`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/cell-selection/` for `CellSelectionRange`, `CellSelectionRangeOperation`, `CellSelectionRangeMode`, `CellSelectionState`, `CellSelectionBounds`, `SelectCellRangeOptions`, the enablement and `is*Event` options, and the cell and table instance APIs.

<a id="source-tanstack-table-core-cell-spanning"></a>

## Cell Spanning

Source: `tanstack-table-core-cell-spanning`.

This skill builds on `core` and `table-features`. Cell spanning is stateless and fully derived: a memoized table-level span index is rebuilt from the rows that are actually rendered, and per-cell reads are O(1) lookups against it. Sorting, filtering, pagination, and row pinning only change adjacency; spans follow automatically and never persist.

### Setup

<!-- skill-snippet:check -->

```ts
import { cellSpanningFeature, tableFeatures } from '@tanstack/table-core'

export const features = tableFeatures({ cellSpanningFeature })
```

### Core Patterns

#### Opt columns into value-based row spanning

```ts
const columns = [
  { accessorKey: 'region', spanRows: true },
  {
    accessorKey: 'createdAt',
    spanRows: ({
      anchorValue,
      value,
    }: {
      anchorValue: unknown
      value: unknown
    }) => sameMonth(anchorValue as Date, value as Date),
  },
]
```

`spanRows: true` merges adjacent rendered rows whose values match under `Object.is`. Nullish values never merge under the default comparison; a predicate can opt in. Predicates are anchored: every candidate row is tested against the run's first row (`anchorRow`/`anchorValue`), which keeps runs transitive.

#### Declare column spans per row

```ts
const columns = [
  {
    accessorKey: 'label',
    spanColumns: ({ row }: { row: { original: { isSummary?: boolean } } }) =>
      row.original.isSummary ? Infinity : 1,
  },
]
```

`spanColumns` counts visible columns in render order and clamps to the end of the cell's pinned region, so `Infinity` means "the rest of my region" and a span never crosses a start/center/end pinning boundary. Cells only join a vertical run when their column spans match, so a full-width summary row never merges into the data run above it.

#### Render with the skip-covered-cells loop

```tsx
{
  row.getVisibleCells().map((cell) => {
    const rowSpan = cell.getRowSpan()
    const colSpan = cell.getColSpan()
    if (rowSpan === 0 || colSpan === 0) return null
    return (
      <td key={cell.id} rowSpan={rowSpan} colSpan={colSpan}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </td>
    )
  })
}
```

A span of `0` means the cell is covered; `cell.getIsCovered()` is the same check as one call. This mirrors the `header.rowSpan` convention for uneven header trees.

#### Disable

`enableCellSpanning: false` as a table option disables everything; the same flag on a column def opts a single column out and wins over the table option.

### Common Mistakes

#### [CRITICAL] Rendering rowSpan={0} instead of skipping the cell

Wrong:

```tsx
<td rowSpan={cell.getRowSpan()} colSpan={cell.getColSpan()}>
```

Correct:

```tsx
cell.getIsCovered() ? null : (
  <td rowSpan={cell.getRowSpan()} colSpan={cell.getColSpan()}>
)
```

In HTML, `rowspan="0"` is valid and means "span to the end of the row group", so the wrong version does not render an empty cell. It merges the covered cell down the entire tbody and shifts every later cell out of its column.

#### [HIGH] Expecting spanning to sort or group the rows

Wrong:

```ts
const features = tableFeatures({ cellSpanningFeature })
// data arrives unsorted; the table renders zero merged cells
```

Correct:

```ts
const features = tableFeatures({
  cellSpanningFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})
// sort by the spanned column, or emit data with equal values adjacent
```

Value-based spanning merges adjacent equal values only. It does not reorder rows, and it is not grouping; register `columnGroupingFeature` when collapsible group rows are what is wanted.

#### [HIGH] Precomputing spans from the source data

Wrong:

```ts
const spans = useMemo(() => computeSpans(data), [data])
```

Correct:

```ts
const rowSpan = cell.getRowSpan()
```

Spans derive from the final row model. A span precomputed from `data` survives sorting, filtering, and page changes, producing ragged rows the moment any of them changes.

#### [MEDIUM] Assuming a run continues across a page boundary

A run is clipped by the paginated row model. The next page opens a fresh cell for the continuing value; nothing carries over, and nothing needs to.

#### [MEDIUM] Reimplementing merge-aware selection on top of cellSelectionFeature

When both features are registered, selection is already merge-aware: ranges expand at derivation time to fully enclose any merge they touch (includes and excludes alike), navigation crosses a merge in one step, and `getSelectedCellCount()` counts a merge once. Do not pre-expand stored selection corners yourself; stored corners stay stable while sorting or paging changes the merges, and pre-expanded corners go stale.

#### [MEDIUM] Spanning a grouped column

`spanRows` is ignored while its column is grouped, and grouped rows never join runs in any column. Grouping already collapses repeated values into group rows; spanning them again would merge twice.

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/cell-spanning/` for the full API: `cell.getRowSpan()`, `cell.getColSpan()`, `cell.getIsCovered()`, `table.getCellSpanIndex()`, and the `spanRows`/`spanColumns`/`enableCellSpanning` column and table options.

<a id="source-tanstack-table-core-column-ordering"></a>

## Column Ordering

Source: `tanstack-table-core-column-ordering`.

This skill builds on `core` and `table-features`. `columnOrder` orders unpinned leaf IDs; other plugins can still determine the final visual regions.

### Setup

```ts
import { columnOrderingFeature, tableFeatures } from '@tanstack/table-core'

export const features = tableFeatures({ columnOrderingFeature })
export const initialState = { columnOrder: ['name', 'age', 'actions'] }
```

### Core Patterns

```ts
const next = columnOrder.filter((id) => id !== activeId)
next.splice(next.indexOf(overId), 0, activeId)
table.setColumnOrder(next)
```

Use column IDs as drag identities and replace the array.

### Common Mistakes

#### [HIGH] Assuming state is final order

Wrong: `renderIds(columnOrder)`

Correct: `renderColumns(table.getAllLeafColumns())`

Pinning regions and grouping mode apply after base ordering. If
`columnVisibilityFeature` is also registered, render
`table.getVisibleLeafColumns()` to apply visibility too.

Source: `docs/framework/react/guide/column-ordering.md#what-affects-column-order`

#### [HIGH] Using labels as identities

Wrong: `const activeId = column.columnDef.header as string`

Correct: `const activeId = column.id`

Headers can collide or change; ordering state stores stable leaf column IDs.

Source: `packages/table-core/src/features/column-ordering/columnOrderingFeature.types.ts`

#### [HIGH] Mutating controlled state in place

Wrong: `columnOrder.splice(0, 1); table.setColumnOrder(columnOrder)`

Correct: `table.setColumnOrder(columnOrder.slice(1))`

Reactive owners commonly require a new array reference.

Source: `examples/react/column-dnd/src/main.tsx`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/column-ordering/`; combine with pinning/visibility skills when those plugins are registered.

<a id="source-tanstack-table-core-column-pinning"></a>

## Column Pinning

Source: `tanstack-table-core-column-pinning`.

This skill builds on `core`, `table-features`, and `column-sizing`. Pinning partitions models; CSS creates the sticky visual result.

### Setup

```ts
import {
  columnPinningFeature,
  columnSizingFeature,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  columnSizingFeature,
  columnPinningFeature,
})
export const initialState = {
  columnPinning: { start: ['name'], end: ['actions'] },
}
```

### Core Patterns

```ts
const style = (column: Column<any, any>) => ({
  position: column.getIsPinned() ? 'sticky' : 'relative',
  insetInlineStart:
    column.getIsPinned() === 'start'
      ? `${column.getStart('start')}px`
      : undefined,
  insetInlineEnd:
    column.getIsPinned() === 'end' ? `${column.getAfter('end')}px` : undefined,
  width: `${column.getSize()}px`,
  zIndex: column.getIsPinned() ? 1 : 0,
  background: 'Canvas',
})
```

### Common Mistakes

#### [HIGH] Using physical v8 regions

Wrong: `column.pin('left')`

Correct: `column.pin('start')`

V9 uses logical `start` and `end`, including state and collection APIs.

Source: `docs/framework/react/guide/migrating.md#column-pinning`

#### [HIGH] Expecting sticky CSS automatically

Wrong: `column.pin('start')`

Correct: `Object.assign(cell.style, style(column))`

The feature only computes regions and offsets; the renderer owns positioning, backgrounds, overflow, and stacking.

Source: `examples/react/column-pinning-sticky/src/main.tsx`

#### [HIGH] Diverging rendered and model widths

Wrong: `cell.style.width = 'auto'`

Correct: `cell.style.width = `${column.getSize()}px``

Sticky offsets use numeric sizes, so mismatched DOM widths create gaps or overlaps.

Source: `docs/framework/react/guide/column-pinning.md#useful-column-pinning-apis`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/column-pinning/`; use CSS logical properties for direction-aware rendering.

<a id="source-tanstack-table-core-column-resizing"></a>

## Column Resizing

Source: `tanstack-table-core-column-resizing`.

This skill builds on `core`, `table-features`, and `column-sizing`. Resizing supplies gesture APIs and state; the renderer supplies handles and widths.

### Setup

```ts
import {
  columnResizingFeature,
  columnSizingFeature,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  columnSizingFeature,
  columnResizingFeature,
})
export const options = {
  columnResizeMode: 'onChange' as const,
  columnResizeDirection: 'ltr' as const,
}
```

### Core Patterns

```ts
const handler = header.getResizeHandler()
handle.addEventListener('mousedown', handler)
handle.addEventListener('touchstart', handler)
```

For large grids, compute all visible sizes once per update and expose them as CSS variables.

### Common Mistakes

#### [CRITICAL] Omitting sizing prerequisite

Wrong: `tableFeatures({ columnResizingFeature })`

Correct: `tableFeatures({ columnSizingFeature, columnResizingFeature })`

Resizing modifies the sizing state and requires `columnSizingFeature`.

Source: `packages/table-core/src/types/TableFeatures.ts#FeatureSlotPrereqs`

#### [HIGH] Rendering an inert handle

Wrong: `handle.addEventListener('pointerdown', header.getResizeHandler())`

Correct:

```ts
const handler = header.getResizeHandler()
handle.addEventListener('mousedown', handler)
handle.addEventListener('touchstart', handler)
```

The shipped handler distinguishes `touchstart` from the mouse path. A single
`pointerdown` listener does not provide working touch resizing; wire both mouse
and touch start events.

Source: `docs/framework/react/guide/column-resizing.md#connect-column-resizing-apis-to-ui`

#### [MEDIUM] Reading sizes in every cell

Wrong: `cells.forEach(cell => cell.style.width = `${cell.column.getSize()}px`)`

Correct: `root.style.setProperty(`--col-${header.id}`, `${header.getSize()}px`)`

Caching sizes or CSS variables avoids repeated work during `onChange` resizing.

Source: `examples/react/column-resizing-performant/src/main.tsx`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/column-resizing/` and the sizing feature directory for the state it updates.

<a id="source-tanstack-table-core-column-sizing"></a>

## Column Sizing

Source: `tanstack-table-core-column-sizing`.

This skill builds on `core` and `table-features`. Sizing is numeric state; translating it to layout is a renderer decision.

### Setup

```ts
import { columnSizingFeature, tableFeatures } from '@tanstack/table-core'

export const features = tableFeatures({ columnSizingFeature })
export const defaultColumn = { size: 180, minSize: 80, maxSize: 480 }
```

### Core Patterns

```ts
cell.style.width = `${cell.column.getSize()}px`
tableElement.style.width = `${table.getTotalSize()}px`
```

Apply the same model sizes consistently to headers, cells, and pinned offsets.

### Common Mistakes

#### [HIGH] Expecting state to style DOM

Wrong: `const options = { defaultColumn: { size: 180 } }`

Correct: `cell.style.width = `${cell.column.getSize()}px``

Numeric state does not apply CSS to headless markup.

Source: `docs/framework/react/guide/column-sizing.md#column-size-apis`

#### [HIGH] Passing CSS sizes into numeric APIs

Wrong: `const column = { size: '25%' }`

Correct: `const column = { size: 240 }`

Table sizing state is numeric; percentages and auto layout belong in renderer CSS.

Source: `packages/table-core/src/features/column-sizing/columnSizingFeature.types.ts`

#### [HIGH] Letting content override offsets

Wrong: `cell.style.minWidth = 'max-content'`

Correct: `cell.style.width = `${column.getSize()}px`; cell.style.overflow = 'hidden'`

If rendered width differs from the model, totals and pinning offsets no longer match geometry.

Source: `examples/react/column-sizing/src/main.tsx`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/column-sizing/` for defaults and region-aware offset signatures.

<a id="source-tanstack-table-core-column-visibility"></a>

## Column Visibility

Source: `tanstack-table-core-column-visibility`.

This skill builds on `core` and `table-features`. Visibility state changes visibility-aware models; it never removes the column definition.

### Setup

```ts
import { columnVisibilityFeature, tableFeatures } from '@tanstack/table-core'

export const features = tableFeatures({ columnVisibilityFeature })
export const initialState = { columnVisibility: { internalId: false } }
```

### Core Patterns

```ts
const headers = table.getHeaderGroups()
const cells = row.getVisibleCells()
const toggles = table
  .getAllLeafColumns()
  .filter((column) => column.getCanHide())
```

Use all-column APIs for controls and visible APIs for rendered table content.

### Common Mistakes

#### [HIGH] Rendering hidden cells anyway

Wrong: `row.getAllCells().map(renderCell)`

Correct: `row.getVisibleCells().map(renderCell)`

All-cell APIs intentionally include hidden columns.

Source: `docs/framework/react/guide/column-visibility.md#column-visibility-aware-table-apis`

#### [HIGH] Treating absence as hidden

Wrong: `const hidden = !columnVisibility[column.id]`

Correct: `const hidden = columnVisibility[column.id] === false`

Only explicit `false` hides a column; an absent entry is visible.

Source: `packages/table-core/src/features/column-visibility/columnVisibilityFeature.ts`

#### [MEDIUM] Treating enableHiding as visibility

Wrong: `helper.accessor('id', { enableHiding: false })`

Correct: `const initialState = { columnVisibility: { id: false } }`

`enableHiding` controls whether hiding is allowed; visibility belongs in table state.

Source: `packages/table-core/src/features/column-visibility/columnVisibilityFeature.types.ts`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/column-visibility/` for visibility-aware table, row, and column APIs.

<a id="source-tanstack-table-core-expanding"></a>

## Expanding

Source: `tanstack-table-core-expanding`.

This skill builds on `core`, `table-features`, and `client-vs-server`. Expansion controls row-tree inclusion; the renderer owns disclosure controls and detail panels.

### Setup

```ts
import {
  createExpandedRowModel,
  rowExpandingFeature,
  tableFeatures,
} from '@tanstack/table-core'

type Node = { id: string; children?: Node[] }
export const features = tableFeatures({
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
})
export const options = { getSubRows: (row: Node) => row.children }
```

### Core Patterns

```ts
const detailOptions = { getRowCanExpand: () => true }
const isDetailOpen = row.getIsExpanded()
```

For custom detail UI, render an additional row/panel when `isDetailOpen` is true.

### Common Mistakes

#### [HIGH] Omitting the subrow accessor

Wrong: `const options = { data: nestedRows }`

Correct: `const options = { data: nestedRows, getSubRows: (row: Node) => row.children }`

Nested object structure is not inferred automatically.

Source: `docs/framework/react/guide/expanding.md#table-rows-as-expanded-data`

#### [HIGH] Expecting detail markup from state

Wrong: `row.toggleExpanded(true)`

Correct: `if (row.getIsExpanded()) renderDetail(row.original)`

Table is headless and cannot render a custom detail panel.

Source: `docs/framework/react/guide/expanding.md#custom-expanding-ui`

#### [HIGH] Misreading pagination placement

Wrong: `const options = { paginateExpandedRows: false }; const leafOnlyPages = true`

Correct: `const options = { paginateExpandedRows: false }; const descendantsStayWithParent = true`

This option controls whether expansion happens before or after pagination; it does not make page size count only leaf rows.

Source: `packages/table-core/src/features/row-expanding/rowExpandingFeature.types.ts`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/row-expanding/` for expansion state, row APIs, and model placement.

<a id="source-tanstack-table-core-row-pinning"></a>

## Row Pinning

Source: `tanstack-table-core-row-pinning`.

This skill builds on `core` and `table-features`. Pinning creates row regions; the renderer controls order and sticky layout.

### Setup

```ts
import { rowPinningFeature, tableFeatures } from '@tanstack/table-core'

type Person = { id: string; name: string }
export const features = tableFeatures({ rowPinningFeature })
export const options = {
  getRowId: (row: Person) => row.id,
  keepPinnedRows: true,
}
```

### Core Patterns

```ts
const regions = [
  table.getTopRows(),
  table.getCenterRows(),
  table.getBottomRows(),
]
for (const rows of regions) rows.forEach(renderRow)
```

Render each region explicitly if the visual order matters.

### Common Mistakes

#### [HIGH] Persisting index-based IDs

Wrong: `const options = { getRowId: (_row: Person, index: number) => String(index) }`

Correct: `const options = { getRowId: (row: Person) => row.id }`

Indexes change under sorting, filtering, pagination, and insertion.

Source: `docs/framework/react/guide/row-pinning.md`

#### [HIGH] Expecting sticky rows automatically

Wrong: `row.pin('top')`

Correct: `topRowElement.style.position = 'sticky'`

Pinning state does not style or place DOM elements.

Source: `examples/react/row-pinning/src/main.tsx`

### Choose the pinned-row visibility policy

- `keepPinnedRows: true` is the default. Pinned rows stay visible in their
  pinned region even when filtering or pagination removes them from the center
  row model.
- `keepPinnedRows: false` limits pinned rows to those present in the current
  filtered and paginated row model.

Choose explicitly based on product behavior; neither value is inherently wrong.

Source: `packages/table-core/src/features/row-pinning/rowPinningFeature.types.ts`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/row-pinning/` for region getters, row APIs, and `keepPinnedRows` semantics.

<a id="source-tanstack-table-core-row-selection"></a>

## Row Selection

Source: `tanstack-table-core-row-selection`.

This skill builds on `core` and `table-features`. Selection is independent ID state; selected row models can only materialize loaded rows.

### Setup

```ts
import {
  rowSelectionFeature,
  tableFeatures,
  type Row,
} from '@tanstack/table-core'

type Person = { id: string; name: string }
export const features = tableFeatures({ rowSelectionFeature })
export const options = {
  getRowId: (row: Person) => row.id,
  enableSubRowSelection: false,
}
```

### Core Patterns

```ts
const selectedIds = table.getSelectedRowIds()
const loadedSelectedRows = table.getSelectedRowModel().rows
```

Use IDs for database-wide intent and row models for currently loaded objects.

#### Inclusive Shift ranges through the row handler

```ts
export function getSelectionHandler(row: Row<typeof features, Person>) {
  return row.getToggleSelectedHandler()
}
```

The handler establishes a table-local anchor on ordinary interactions and applies the checked value to the inclusive current display-order range on Shift interactions. Range behavior is enabled by default; set `enableRowRangeSelection: false` to preserve non-range handler behavior. Direct `row.toggleSelected()` and `table.setRowSelection()` calls do not move that anchor.

Pass the original checkbox click event to this handler. DOM `change` events often omit modifier keys, so use the framework's click binding for row checkboxes unless its change event exposes the original click through `nativeEvent` (as React does).

#### Limit a range to explicitly displayed rows

```ts
export function getDisplayedRowsOnlyHandler(row: Row<typeof features, Person>) {
  return row.getToggleSelectedHandler({ selectChildren: false })
}
```

The default `selectChildren: true` recursively changes selectable descendants of parents encountered in the range. Set it to `false` when collapsed descendants outside the display-order interval must remain unchanged.

#### Prune stale parent ids on child deselection

```ts
export function getPruningHandler(row: Row<typeof features, Person>) {
  return row.getToggleSelectedHandler({ deselectParents: true })
}
```

Selecting a parent cascades its id plus selectable descendant ids into state, but deselecting a child later leaves the parent id behind by default (some tables treat state ids as literal selections, e.g. with `selectChildren: false`). The default `deselectParents: false` preserves that; set it to `true` so deselecting any row also deletes every ancestor id, keeping `row.getIsSelected()` honest for parents. Applies to `toggleSelected` and both plain and Shift-range handler paths.

#### Select-all honors sub-row selection rules

With `enableSubRowSelection: false` (or a per-row predicate), `table.toggleAllRowsSelected()` skips descendants of blocking parents, and `getIsAllRowsSelected()`/`getIsAllPageRowsSelected()` exclude those descendants from the all-selected computation, so the header checkbox still reads checked. Deselect-all skips rows whose `enableRowSelection` resolves false, preserving their selection; use `toggleAllRowsSelected(false, { deselectAll: true })` or `resetRowSelection(true)` to clear everything including disabled and out-of-model ids.

### Common Mistakes

#### [HIGH] Expecting selection to clean itself

Wrong: `data = data.filter(row => row.id !== deletedId)`

Correct: `data = data.filter(row => row.id !== deletedId); table.setRowSelection(old => { const next = { ...old }; delete next[deletedId]; return next })`

Selection is independent state and can retain IDs after data removal.

Source: `https://github.com/TanStack/table/issues/5850`

#### [HIGH] Selecting mutable indexes

Wrong: `const options = { getRowId: (_row: Person, index: number) => String(index) }`

Correct: `const options = { getRowId: (row: Person) => row.id }`

Stable application IDs preserve identity as row order and pages change.

Source: `docs/framework/react/guide/row-selection.md#useful-row-ids`

#### [HIGH] Treating loaded model as global selection

Wrong: `const allSelectedRecords = table.getSelectedRowModel().rows`

Correct: `const allSelectedIds = table.getSelectedRowIds()`

Under manual pagination, unloaded selected IDs have no `Row` object in the current model.

Source: `docs/framework/react/guide/row-selection.md#note-if-you-are-using-manualpagination`

#### [HIGH] Bypassing the range-selection handler

Wrong:

```ts
const onChange = (event: { target: { checked: boolean } }) =>
  row.toggleSelected(event.target.checked)
```

Correct:

```ts
const onChange = row.getToggleSelectedHandler()
```

Only successful interactions through `getToggleSelectedHandler()` establish or advance the Shift-range anchor. The handler also supports custom range-event detection through `isRowRangeSelectionEvent`.

Source: `docs/framework/react/guide/row-selection.md#shift-range-selection`

#### [HIGH] Binding a DOM change event that drops Shift

Wrong:

```ts
checkbox.addEventListener('change', row.getToggleSelectedHandler())
```

Correct:

```ts
checkbox.addEventListener('click', row.getToggleSelectedHandler())
```

The range modifier must be present on the event passed to the handler. Raw DOM `change` events do not reliably expose click modifier keys.

Source: `docs/framework/svelte/guide/row-selection.md#shift-range-selection`

#### [MEDIUM] Expecting ranges across unloaded server pages

Wrong:

```ts
const options = {
  manualPagination: true,
  enableRowRangeSelection: true,
}
// Shift cannot select rows absent from data.
```

Correct:

```ts
const options = {
  manualPagination: true,
  getRowId: (row: Person) => row.id,
}
```

Client-side ranges can cross pages because display order is pre-pagination. Manual/server pagination cannot include rows absent from the loaded `data`; select database-wide IDs in application state when that behavior is required.

Source: `docs/framework/react/guide/row-selection.md#shift-range-selection`, `https://github.com/TanStack/table/issues/4781`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/row-selection/` for state, row-model variants, and selection enablement callbacks.
