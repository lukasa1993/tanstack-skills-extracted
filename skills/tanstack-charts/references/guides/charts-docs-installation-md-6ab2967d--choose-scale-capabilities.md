# Installation — Choose scale capabilities

[Guide and prerequisites](./charts-docs-installation-md-6ab2967d.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Choose scale capabilities

`@tanstack/charts/scales/*` covers the common numeric linear, band, point, and
ordinal mappings. Import each family from its exact entry:

```ts
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
import { scalePoint } from '@tanstack/charts/scales/point'
```

There is no aggregate `/scales` export. Each exact scale entry includes its own
TypeScript declarations and no D3 runtime dependency.

Use `d3-scale` when a chart needs time or UTC scales, logarithmic, power,
symlog, square-root, radial, sequential, diverging, quantile, quantize, or
threshold scales, piecewise or nonnumeric interpolation, or full D3 formatting
semantics:

```sh
pnpm add d3-scale
pnpm add -D @types/d3-scale
```

TanStack Charts accepts those D3 factories and configured instances through
the same scale contract. Your application must declare every `d3-*` module
that its source imports. Strict package managers do not expose transitive
dependencies as an application import contract.

The core package declares the `d3-array`, `d3-shape`, `d3-geo`, `d3-delaunay`,
`d3-hexbin`, `d3-contour`, `d3-force`, `d3-sankey`, `d3-hierarchy`, `d3-brush`,
and `d3-selection` implementations owned by its transforms, curve and geo
features, and optional spatial, network, hierarchy, and brush entries. They are
normal dependencies, not peer requirements, and bundlers remove unused
algorithms and geometry from application bundles.

Add direct data transforms or shape interpolation only when application source
imports them:

```sh
pnpm add d3-array d3-shape
pnpm add -D @types/d3-array @types/d3-shape
```

Other capabilities remain equally granular:

```sh
# Examples: install only what the application imports
pnpm add d3-geo d3-quadtree d3-delaunay d3-selection d3-zoom d3-brush d3-time d3-scale-chromatic
pnpm add -D @types/d3-geo @types/d3-quadtree @types/d3-delaunay @types/d3-selection @types/d3-zoom @types/d3-brush @types/d3-time @types/d3-scale-chromatic
```

Do not install the `d3` umbrella package just because a chart uses one D3 capability. Named modules keep ownership visible and make the measured consumer bundle reflect the chart that was actually authored. [Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md) is the single guide to this boundary and links to the corresponding official D3 documentation.
