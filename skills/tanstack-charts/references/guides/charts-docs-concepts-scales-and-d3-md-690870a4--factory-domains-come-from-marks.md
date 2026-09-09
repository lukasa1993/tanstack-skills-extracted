# Scales And D3 — Factory domains come from marks

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Factory domains come from marks

Pass the factory itself when the domain should cover the rendered data:

```ts
import { scalePoint } from '@tanstack/charts/scales/point'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const chart = defineChart({
  marks: [lineY(rows, { x: 'month', y: 'value' })],
  scales: {
    x: { scale: scalePoint },
    y: { scale: scaleLinear, nice: true },
  },
})
```

Continuous factories use the finite extent of their channels. Band and point
factories use distinct values in first-seen order. Bars and areas include zero
when they use an implicit zero baseline. Empty channels retain the factory's
native domain.

Return a scale from a zero-argument factory when it needs configuration before
domain inference:

```ts
import { scaleBand } from '@tanstack/charts/scales/band'

const x = {
  scale: () => scaleBand<string>().padding(0.16),
}
```

Use the axis `nice` option because nicening must happen after inference.
