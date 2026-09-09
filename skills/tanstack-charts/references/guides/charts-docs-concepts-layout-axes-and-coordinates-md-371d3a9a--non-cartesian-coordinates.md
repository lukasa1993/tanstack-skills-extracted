# Layout Axes And Coordinates — Non-cartesian coordinates

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Non-cartesian coordinates

Polar and geographic marks resolve geometry from the same final
`scene.chart` bounds without materializing Cartesian x/y channels:

```ts
import { polar, radialArc } from '@tanstack/charts/polar'
import { geoShape } from '@tanstack/charts/geo'
```

`polar` copies entries from its own `scales` registry, assigns responsive
angular and radial ranges, and renders guide backgrounds, child marks, then
guide foregrounds around one resolved center. `geoShape` calls an
application-supplied D3 projection callback or fits a projection descriptor to
data, a sphere, or explicit geometry.

Both paths emit the same keyed scene nodes and interaction points as ordinary
marks. SVG rendering, DOM reconciliation, focus, export, and adapters do not
need a coordinate-system branch. Their outer chart uses
`scales: { x: null, y: null }`; no Cartesian guides are created.

These capabilities stay behind separate package subpaths so their D3 geometry
does not enter a Cartesian consumer. See
[Polar and Radar Charts](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md#source-charts-docs-examples-polar-and-radar-md) and
[Maps and Spatial Charts](./charts-docs-examples-maps-and-spatial-md-be409a35.md#source-charts-docs-examples-maps-and-spatial-md).
