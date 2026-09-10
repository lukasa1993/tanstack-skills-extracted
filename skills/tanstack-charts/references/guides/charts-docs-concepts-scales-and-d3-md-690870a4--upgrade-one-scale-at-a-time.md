# Scales And D3 — Upgrade one scale at a time

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Upgrade one scale at a time

A definition does not need one scale implementation for every mapping. This
time-series chart upgrades x to D3 while keeping its ordinary numeric y scale
compact:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleUtc } from 'd3-scale'

const chart = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value' })],
  scales: {
    x: { scale: scaleUtc, nice: true },
    y: { scale: scaleLinear, nice: true },
  },
})
```

Add `d3-scale` and `@types/d3-scale` because this source imports `scaleUtc`.
The compact scale entries ship their own declarations.
