# Scales Guides And Color — Positional scale factories

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Positional scale factories

The common path passes a compact factory directly:

```ts
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const x = {
  scale: () => scaleBand<string>().padding(0.16),
  axis: { label: 'Product' },
}

const y = {
  scale: scaleLinear,
  nice: true,
  grid: true,
  axis: { label: 'Revenue' },
}
```

The chart creates a fresh scale for each layout, derives its domain from every
materialized channel bound to that axis, applies `nice`, and assigns the
responsive range. Bar and area baselines contribute zero when their baseline
is implicit. Empty channels retain the factory's native domain.

Return a configured scale from a zero-argument factory for options that should
be applied before domain inference:

```ts
import { scaleBand } from '@tanstack/charts/scales/band'

const x = {
  scale: () => scaleBand<string>().padding(0.2),
}
```

`nice` is an axis option because it must run after the inferred domain exists.
