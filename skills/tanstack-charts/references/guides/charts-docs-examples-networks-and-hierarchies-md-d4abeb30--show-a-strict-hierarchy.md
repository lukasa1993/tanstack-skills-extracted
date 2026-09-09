# Networks And Hierarchies — Show a strict hierarchy

[Guide and prerequisites](./charts-docs-examples-networks-and-hierarchies-md-d4abeb30.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Show a strict hierarchy

A tidy tree assigns one position per node and one link per parent-child
relationship. Direct labels make a small hierarchy readable without requiring
hover.

Use the exact optional transform for a static tidy tree:

```ts group=hierarchy-tree env=charts file=/src/chart.ts entry
import { defineChart, dot, link, text } from '@tanstack/charts'
import { treeLayout } from '@tanstack/charts/hierarchy/tree'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { rows } from './data'

const hierarchy = treeLayout(rows, {
  path: 'name',
  delimiter: '.',
})

export default defineChart({
  marks: [
    link(hierarchy.links, {
      x1: 'x1',
      y1: 'y1',
      x2: 'x2',
      y2: 'y2',
      key: 'id',
      stroke: '#94a3b8',
      strokeWidth: 1.5,
    }),
    dot(hierarchy.nodes, {
      x: 'x',
      y: 'y',
      key: 'id',
      fill: '#2563eb',
      r: 4,
    }),
    text(hierarchy.nodes, {
      x: 'x',
      y: 'y',
      text: 'name',
      key: 'id',
      fill: '#2563eb',
      anchor: (node) => (node.internal ? 'end' : 'start'),
      dx: (node) => (node.internal ? -7 : 7),
    }),
  ],
  scales: {
    x: { scale: scaleLinear },
    y: { scale: scaleLinear },
  },

  guides: false,
  margin: { top: 24, right: 110, bottom: 24, left: 64 },
})
```

```ts group=hierarchy-tree file=/src/data.ts collapsed
export const rows = [
  { name: 'Product' },
  { name: 'Product.Analytics' },
  { name: 'Product.Analytics.Reports' },
  { name: 'Product.Analytics.Dashboards' },
  { name: 'Product.Platform' },
  { name: 'Product.Platform.API' },
  { name: 'Product.Platform.Workers' },
]
```

[Open the larger Flare hierarchy catalog example](https://tanstack.com/charts/catalog/36-hierarchy-tree/).

Use `id` and `parentId` instead of `path` for explicit parent-reference rows.
Path input may omit ancestors; the result includes those structural nodes with
`data: null` and empty source lineage. Explicit rows retain their original
record and index, and each link carries the target node's lineage.

`treeLayout` rejects duplicate IDs, invalid parents, multiple roots, and
cycles. Keep source order intentional because it controls child order when
`sort` is omitted. Collapsed branches remain application state; select the
visible rows before running the transform.

The default `left` orientation anchors the root at the left and grows toward
the right. `right`, `top`, and `bottom` use the same stable tidy layout, and
`nodeSize` controls semantic breadth and depth spacing. Normal scales own the
responsive mapping; resizing does not require a new hierarchy layout. Use
`sort` only when child order should differ from source order. Render links
first, then nodes and labels. See
[Rules, Links, Arrows, Vectors, and Ticks](./charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md-364694cb.md#source-charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md)
and [Dot and Hexagon Marks](./charts-docs-reference-marks-dot-and-hexagon-md-df946606.md#source-charts-docs-reference-marks-dot-and-hexagon-md).
