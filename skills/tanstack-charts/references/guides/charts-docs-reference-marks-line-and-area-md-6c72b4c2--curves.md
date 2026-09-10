# Line And Area — Curves

[Guide and prerequisites](./charts-docs-reference-marks-line-and-area-md-6c72b4c2.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Curves

Line and area marks accept a small path-generation contract rather than
bundling interpolation algorithms:

```ts
interface ChartCurve {
  line(points: readonly (readonly [number, number])[]): string
  area(
    top: readonly (readonly [number, number])[],
    bottom: readonly (readonly [number, number])[],
  ): string
}

interface AreaXCurve {
  areaX(
    right: readonly (readonly [number, number])[],
    left: readonly (readonly [number, number])[],
  ): string
}
```

Optional adapters are available:

```ts
import { d3AreaXCurve } from '@tanstack/charts/d3/area-x'
import { d3Curve } from '@tanstack/charts/d3/shape'
```

They accept a supplied curve factory and return the corresponding TanStack
contract. Which granular D3 module to install and why these algorithms remain
injected is documented once in
[Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md).
