# Foundations

Table Core, feature composition, and TypeScript.

<a id="source-tanstack-table-core"></a>

## Core

Source: `tanstack-table-core`.

## TanStack Table Core

TanStack Table creates a table instance, state, and row models. It does not render a component, choose a component library, apply CSS, or supply interaction accessibility. Use a framework adapter in UI code; use `constructTable` only for framework-neutral integrations.

### Setup

<!-- skill-snippet:check -->

```ts
import {
  constructTable,
  createColumnHelper,
  tableFeatures,
} from '@tanstack/table-core'
import { storeReactivityBindings } from '@tanstack/table-core/store-reactivity-bindings'

type Person = { id: string; name: string }
const features = tableFeatures({
  coreReactivityFeature: storeReactivityBindings(),
})
const helper = createColumnHelper<typeof features, Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
const data: Person[] = [{ id: '1', name: 'Ada' }]
const table = constructTable({
  features,
  columns,
  data,
  getRowId: (row) => row.id,
})

for (const row of table.getRowModel().rows) {
  console.log(row.getAllCells().map((cell) => cell.getValue()))
}
```

### Core Patterns

#### Start with core, add only behavior used

```ts
const features = tableFeatures({
  coreReactivityFeature: storeReactivityBindings(),
})
```

The core row model is automatic; filtering, sorting, pagination, and other optional behavior require their feature plugins.

#### Keep model inputs stable

```ts
const data: Person[] = [{ id: '1', name: 'Ada' }]
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
```

Define static inputs once and preserve query/store references when data has not changed.

#### Number rows in current display order

```ts
const rowNumberColumn = helper.display({
  id: 'rowNumber',
  header: '#',
  cell: ({ row }) => {
    const displayIndex = row.getDisplayIndex()
    return displayIndex === -1 ? '' : displayIndex + 1
  },
})
```

`row.getDisplayIndex()` follows the current filtering, grouping, sorting, and expansion order before pagination. `row.index` remains the row's creation-time position within its parent array.

### Common Mistakes

#### [HIGH] Expecting Table to render a grid

Wrong:

```ts
document.body.append(table as unknown as Node)
```

Correct:

```ts
const names = table
  .getRowModel()
  .rows.map((row) => row.getValue<string>('name'))
document.body.textContent = names.join(', ')
```

The table instance is a model; markup, CSS, semantics, and accessibility are renderer responsibilities.

Source: `docs/overview.md`

#### [HIGH] Recreating model inputs repeatedly

Wrong:

```ts
const options = () => ({
  data: source.map((item) => item),
  columns: helper.columns([]),
})
```

Correct:

```ts
const data = source.map((item) => item)
const columns = helper.columns([])
const options = () => ({ data, columns })
```

New references invalidate memoized row and column work and can create adapter render loops.

Source: `docs/guide/data.md`

#### [HIGH] Detaching prototype-bound methods

Wrong:

```ts
const { getValue } = table.getRowModel().rows[0]!
getValue('name')
```

Correct:

```ts
const row = table.getRowModel().rows[0]!
row.getValue('name')
```

V9 row, cell, column, and header methods use their instance as `this`.

Source: `docs/framework/react/guide/migrating.md#instance-methods-must-be-called-on-their-instance`

#### [HIGH] Reading the display-index cache directly

Wrong:

```ts
const rowNumber = row._displayIndexCache + 1
```

Correct:

```ts
const displayIndex = row.getDisplayIndex()
const rowNumber = displayIndex === -1 ? undefined : displayIndex + 1
```

`_displayIndexCache` is internal and may be stale until display order is recomputed. The public method refreshes display order, validates that the cached slot still contains the row, and returns `-1` when it does not.

Source: `docs/guide/rows.md#row-numbers-and-display-indexes`, `packages/table-core/src/core/rows/coreRowsFeature.utils.ts`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/index.d.ts`, then follow the exported implementation. For UI creation and rendering, inspect `node_modules/@tanstack/<framework>-table/dist/index.d.ts` and load that adapter's getting-started skill.

<a id="source-tanstack-table-core-table-features"></a>

## Table Features

Source: `tanstack-table-core-table-features`.

This skill builds on `core`. Read it first for the headless model and stable inputs.

### Setup

<!-- skill-snippet:check -->

```ts
import {
  rowAggregationFeature,
  aggregationFn_sum,
  columnGroupingFeature,
  createFilteredRowModel,
  createSortedRowModel,
  columnFilteringFeature,
  filterFn_includesString,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from '@tanstack/table-core'

export const features = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowAggregationFeature,
  columnGroupingFeature,
  aggregationFns: { sum: aggregationFn_sum },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})
```

### Core Patterns

#### Register feature before its dependent slot

```ts
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
```

`tableFeatures` checks slot prerequisites and its inferred type gates APIs throughout the table.

#### Register named function slots with their features

```ts
const features = tableFeatures({
  columnFilteringFeature,
  filterFns: { includesString: filterFn_includesString },
  rowSortingFeature,
  sortFns: { alphanumeric: sortFn_alphanumeric },
  rowAggregationFeature,
  columnGroupingFeature,
  aggregationFns: { sum: aggregationFn_sum },
})
```

`filterFns`, `sortFns`, and `aggregationFns` are feature slots, not table
options. They respectively require `columnFilteringFeature`,
`rowSortingFeature`, and `rowAggregationFeature`. Import individual built-ins
(`filterFn_*`, `sortFn_*`, `aggregationFn_*`) and register them under their
conventional keys; the full registry objects (`filterFns`, `sortFns`,
`aggregationFns` exports) still work but bundle every built-in. A registered
key can be used as a typed string name, and `'auto'` resolves only registered
functions; pass a function directly when no registry name is needed.

#### Prefer explicit features

```ts
const features = tableFeatures({ columnFilteringFeature })
```

Use `stockFeatures` only for deliberate kitchen-sink or temporary migration behavior.

### Common Mistakes

#### [CRITICAL] Calling an unregistered feature API

Wrong:

```ts
const features = tableFeatures({})
table.setSorting([{ id: 'name', desc: false }])
```

Correct:

```ts
const features = tableFeatures({ rowSortingFeature })
```

Optional feature state and APIs are installed only when their feature is registered.

Source: `packages/table-core/src/core/table/constructTable.ts`

#### [HIGH] Omitting a slot prerequisite

Wrong:

```ts
const features = tableFeatures({ sortedRowModel: createSortedRowModel() })
```

Correct:

```ts
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
```

The sorted model slot requires `rowSortingFeature`; the same rule applies to every mapped slot.

Source: `packages/table-core/src/types/TableFeatures.ts#FeatureSlotPrereqs`

#### [MEDIUM] Shipping all features by default

Wrong:

```ts
const features = stockFeatures
```

Correct:

```ts
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
```

`stockFeatures` registers every stock plugin and processing slot, defeating v9's normal tree-shaking strategy.

Source: `packages/table-core/src/features/stockFeatures.ts`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/types/TableFeatures.d.ts` for current slots and `FeatureSlotPrereqs`, and `dist/features/stockFeatures.d.ts` for the stock inventory.

<a id="source-tanstack-table-core-typescript"></a>

## Typescript

Source: `tanstack-table-core-typescript`.

This skill builds on `core` and `table-features`. Let the feature object and helpers carry types through userland.

### Setup

```ts
import {
  createColumnHelper,
  metaHelper,
  tableFeatures,
} from '@tanstack/table-core'

type Person = { id: string; age: number }
type ColumnMeta = { align?: 'start' | 'end' }
const features = tableFeatures({ columnMeta: metaHelper<ColumnMeta>() })
const helper = createColumnHelper<typeof features, Person>()
export const columns = helper.columns([
  helper.accessor('age', { meta: { align: 'end' } }),
])
```

### Core Patterns

#### Preserve heterogeneous accessor values

```ts
const columns = helper.columns([
  helper.accessor('id', { header: 'ID' }),
  helper.accessor('age', { header: 'Age' }),
])
```

`columns()` preserves each accessor's `TValue` instead of widening the array.

#### Compose options through the helper

```ts
const defaults = tableOptions<typeof features, Person>({
  defaultColumn: { meta: { align: 'start' } },
})
```

Use `tableOptions` for reusable fragments; direct adapter options are enough for one-offs.

### Common Mistakes

#### [HIGH] Erasing accessor value inference

Wrong:

```ts
const columns: ColumnDef<typeof features, Person, unknown>[] = [
  helper.accessor('age', {}),
]
```

Correct:

```ts
const columns = helper.columns([helper.accessor('age', {})])
```

The broad annotation discards the accessor-specific `number` value type.

Source: `docs/guide/helpers.md#createcolumnhelper`

#### [MEDIUM] Threading internal feature generics manually

Wrong:

```ts
type Features = TableFeatures
```

Correct:

```ts
type Features = typeof features
```

The concrete registry is the source of feature-gated APIs and registry keys.

Source: `packages/table-core/src/types/TableFeatures.ts`

#### [MEDIUM] Globally merging per-table meta

Wrong:

```ts
declare module '@tanstack/table-core' {
  interface ColumnMeta<TData, TValue> {
    align?: string
  }
}
```

Correct:

```ts
const features = tableFeatures({
  columnMeta: metaHelper<{ align?: 'start' | 'end' }>(),
})
```

V9 type-only feature slots keep meta types scoped to the table factory.

Source: `docs/guide/table-and-column-meta.md`

### API Discovery

Inspect `node_modules/@tanstack/table-core/dist/helpers/` and the signatures re-exported by `dist/index.d.ts`; avoid copying deep internal generic signatures into application code.
