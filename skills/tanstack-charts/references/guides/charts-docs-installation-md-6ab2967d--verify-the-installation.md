# Installation — Verify the installation

[Guide and prerequisites](./charts-docs-installation-md-6ab2967d.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Verify the installation

Create a small scene without mounting it:

<!-- docs-example: installation-check typecheck -->

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { createChartScene, defineChart, lineY } from '@tanstack/charts'

const chart = defineChart({
  marks: [lineY([2, 5, 3])],
  scales: {
    x: { scale: scaleLinear },
    y: { scale: scaleLinear },
  },
})

const scene = createChartScene(chart, { width: 640, height: 320 })

console.log(scene.chart, scene.points.length)
```

Both positional scales are required. A missing scale is an authoring error rather than a hidden fallback.

Continue with the [Quick Start](./charts-docs-quick-start-md-b139d2e1.md#source-charts-docs-quick-start-md), then open the adapter page
for the framework that owns the chart component.
