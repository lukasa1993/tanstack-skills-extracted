# Column Pinning

<a id="source-tanstack-table-core-column-pinning"></a>

Published skill · `@tanstack/table-core@9.2.4`.

[Topic index](../layout-interaction.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).
Prerequisite: [Table Features](./tanstack-table-core-table-features-d2215548.md).
Prerequisite: [Column Sizing](./tanstack-table-core-column-sizing-4548ba82.md).

This skill builds on `core`, `table-features`, and `column-sizing`. Pinning partitions models; CSS creates the sticky visual result.

## Setup

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

## Core Patterns

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

## Common Mistakes

### [HIGH] Using physical v8 regions

Wrong: `column.pin('left')`

Correct: `column.pin('start')`

V9 uses logical `start` and `end`, including state and collection APIs.

Source: `docs/framework/react/guide/migrating.md#column-pinning`

### [HIGH] Expecting sticky CSS automatically

Wrong: `column.pin('start')`

Correct: `Object.assign(cell.style, style(column))`

The feature only computes regions and offsets; the renderer owns positioning, backgrounds, overflow, and stacking.

Source: `examples/react/column-pinning-sticky/src/main.tsx`

### [HIGH] Diverging rendered and model widths

Wrong: `cell.style.width = 'auto'`

Correct: `cell.style.width = `${column.getSize()}px``

Sticky offsets use numeric sizes, so mismatched DOM widths create gaps or overlaps.

Source: `docs/framework/react/guide/column-pinning.md#useful-column-pinning-apis`

## API Discovery

Inspect `node_modules/@tanstack/table-core/dist/features/column-pinning/`; use CSS logical properties for direction-aware rendering.
