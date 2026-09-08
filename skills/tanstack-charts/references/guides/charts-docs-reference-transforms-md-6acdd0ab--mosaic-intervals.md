# Transforms — Mosaic intervals

[Guide and prerequisites](./charts-docs-reference-transforms-md-6acdd0ab.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Mosaic intervals

`mosaicY` allocates outer category totals across x, then normalizes y values
within each x category. Keep aggregation explicit so the definition shows
whether a cell represents a count or a weighted sum:

```ts
import { groupBy, mosaicY, rect } from '@tanstack/charts'

const counts = groupBy(responses, {
  by: { question: 'question', response: 'response' },
  outputs: { count: { reduce: 'count' } },
})

const cells = mosaicY(counts, {
  x: 'question',
  y: 'response',
  value: 'count',
  yOrder: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree'],
})

rect(cells, {
  x: 'x',
  x1: 'x1',
  x2: 'x2',
  y: 'y',
  y1: 'y1',
  y2: 'y2',
  color: 'yValue',
})
```

Each row retains the aggregate input fields and adds semantic `xValue` and
`yValue`, normalized centers and endpoints, the cell `value`, its outer-group
total, the grand total, and direct lineage. `mosaicX` transposes the policy:
y-category totals determine row heights and x values compose within each row.
Use `xOrder` and `yOrder` to make categorical ordering explicit. Duplicate
x/y pairs throw; aggregate them first with `groupBy`.
