# Transforms — Waterfall intervals

[Guide and prerequisites](./charts-docs-reference-transforms-md-6acdd0ab.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Waterfall intervals

`waterfall` turns signed contributions into ordered cumulative intervals. It
does not derive the contributions themselves, so analytical intent remains
visible beside the chart:

```ts
import { barY, delta, rollingWindow } from '@tanstack/charts'
import { waterfall } from '@tanstack/charts/transform/waterfall'

const changes = rollingWindow(observations, {
  orderBy: 'year',
  size: 2,
  partial: false,
  outputs: { delta: { value: 'price', reduce: delta } },
})

const bridge = waterfall(changes, {
  value: 'delta',
  orderBy: 'year',
  total: true,
})

barY(bridge, {
  x: (row) => (row.kind === 'total' ? 'Total' : row.year),
  y1: 'start',
  y2: 'end',
  color: 'kind',
})
```

Each valid step retains the input row, adds `delta`, `start`, `end`, and an
`increase` or `decrease` kind, and carries one-row direct lineage. Zero is an
increase so it remains available to downstream policy. Nullish and nonfinite
values are omitted. A nonfinite cumulative result throws instead of emitting
invalid geometry.

`total: true` appends one zero-based `total` row for every nonempty group. The
total is a discriminated synthetic row containing only group fields, derived
fields, and aggregate direct lineage; it does not clone an arbitrary last
source row. `by`, `orderBy`, and `order` use the same first-seen grouping and
stable ordering contracts as the other eager transforms. Group output names
cannot collide with waterfall or lineage fields.
