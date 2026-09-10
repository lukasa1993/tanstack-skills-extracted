# Networks And Hierarchies — Compare hierarchy area

[Guide and prerequisites](./charts-docs-examples-networks-and-hierarchies-md-d4abeb30.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Compare hierarchy area

A treemap encodes each leaf's contribution as area while keeping leaves inside
their parent branch. Use it when branch size matters more than exact depth or
link tracing.

<!-- ::chart-example id=74-recharts-treemap height=480 -->

The exact optional mark accepts the same flat path or parent-reference input as
the tidy-tree transform, but it owns final-pixel rectangles and labels:

```ts
import { defineChart } from '@tanstack/charts'
import { treemap } from '@tanstack/charts/hierarchy/treemap'

const chart = defineChart({
  marks: [
    treemap(rows, {
      path: 'name',
      delimiter: '.',
      value: 'size',
      ratio: 4 / 3,
      round: true,
      color: (node) => node.ancestorIds.at(-1) ?? node.id,
      label: 'name',
      inset: 1,
      stroke: '#fff',
    }),
  ],
  scales: {
    x: null,
    y: null,
  },
  guides: false,
  margin: 0,
})
```

No x or y scale is configured. Squarification uses the final inner aspect ratio,
so resizing may change which rectangles share an edge. Pixel padding and the
screen convention where y increases downward remain inside the mark.

The default child order is the authored hierarchy order. Use `sort` only when
sibling order is a deliberate encoding. In-cell labels are centered and hidden
when measured text plus `labelPadding` does not fit. Color, label, state, and
paint channels receive stable `TreemapNode` values with hierarchy metadata,
aggregate value, the source row, and its original index. See the
[Treemap Mark reference](./charts-docs-reference-marks-treemap-md-4dc515c2.md#source-charts-docs-reference-marks-treemap-md).
