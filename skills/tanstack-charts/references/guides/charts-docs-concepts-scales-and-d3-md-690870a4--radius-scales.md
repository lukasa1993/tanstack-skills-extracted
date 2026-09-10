# Scales And D3 — Radius scales

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Radius scales

`dot` treats `r` as pixels unless `rScale` is supplied:

```ts
import { scaleSqrt } from 'd3-scale'

dot(rows, {
  x: 'revenue',
  y: 'retention',
  r: 'accounts',
  rScale: {
    scale: () => scaleSqrt().range([3, 24]),
  },
})
```

The radius factory infers `[0, maximum]` from `r`. A configured scale instance
still keeps its explicit domain. D3 owns the radius mapping; the chart owns dot
geometry and rendering.
