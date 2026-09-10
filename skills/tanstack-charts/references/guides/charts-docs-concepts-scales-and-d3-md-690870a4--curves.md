# Scales And D3 — Curves

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Curves

Straight lines and areas do not need `d3-shape`. Opt into a curve only when the design requires it:

```ts
import { curveMonotoneX } from 'd3-shape'
import { d3Curve, lineY } from '@tanstack/charts'

lineY(rows, {
  x: 'date',
  y: 'value',
  curve: d3Curve(curveMonotoneX),
})
```

`d3Curve` adapts a D3 curve factory to the small line-and-area curve contract. Importing it is explicit so a straight chart does not need the shape path.

Horizontal `areaX` marks use the separate `d3AreaXCurve` bridge from `@tanstack/charts/d3/area-x`.
