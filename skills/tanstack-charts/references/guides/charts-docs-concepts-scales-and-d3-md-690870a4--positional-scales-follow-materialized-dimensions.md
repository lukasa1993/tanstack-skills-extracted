# Scales And D3 — Positional scales follow materialized dimensions

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Positional scales follow materialized dimensions

Every materialized positional dimension declares its scale:

```ts
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const spec = {
  marks,
  scales: {
    x: { scale: scaleBand },
    y: { scale: scaleLinear, nice: true },
  },
}
```

Positionless marks use explicit null entries:

```ts
import { defineChart, frame } from '@tanstack/charts'

const borderOnlyChart = defineChart({
  marks: [frame()],
  scales: {
    x: null,
    y: null,
  },
})
```

A mark with x values requires a non-null x scale. A mark with y values requires
a non-null y scale. One-dimensional charts use `null` only for the unused
entry. The scale factory chooses the mapping; materialized mark channels
supply its domain.
