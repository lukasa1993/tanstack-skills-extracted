# Bundle Size And Performance — Add D3 by capability

[Guide and prerequisites](./charts-docs-guides-bundle-size-and-performance-md-023dab9e.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Add D3 by capability

Start with compact scales, then import a granular D3 module when its full
semantics fit the chart. Typical upgrade triggers are continuous time or UTC,
logarithmic and other transformed scales, piecewise or nonnumeric
interpolation, continuous color, curves, specialized transforms, and spatial
indexes.

The upgrade is per scale. A calendar x axis can use D3 while its numeric y axis
stays compact:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleUtc } from 'd3-scale'

const x = { scale: scaleUtc, nice: true }
const y = { scale: scaleLinear, nice: true }
```

Declare `d3-scale` and `@types/d3-scale` directly when application source uses
that import. A stacked area may add `d3-shape`; a large nearest-point
interaction may add a spatial index. Do not install the `d3` umbrella for one
capability.

The canonical dependency map and official references live in
[Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md).
