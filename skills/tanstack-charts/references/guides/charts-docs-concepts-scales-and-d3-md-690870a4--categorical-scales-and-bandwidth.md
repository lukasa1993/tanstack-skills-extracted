# Scales And D3 — Categorical scales and bandwidth

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Categorical scales and bandwidth

Pass the compact band-scale factory for categorical positions:

```ts
import { scaleBand } from '@tanstack/charts/scales/band'

const categoryScale = () =>
  scaleBand<string>().paddingInner(0.12).paddingOuter(0.06)
```

TanStack Charts applies the plot range, reads the scale bandwidth, and treats the mapped value as the center of the band for mark and interaction coordinates. Bars use the primary bandwidth by default.

For grouped bars, use `layout: group({ scale })`. The supplied band scale is
copied and its range is assigned within the primary band. Grouping is explicit;
the default length-channel geometry is stacked.
