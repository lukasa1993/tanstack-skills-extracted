# Bundle Size And Performance — Import the narrow path

[Guide and prerequisites](./charts-docs-guides-bundle-size-and-performance-md-023dab9e.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Import the narrow path

The package root is the ergonomic path for ordinary charts:

```ts
import { defineChart, lineY } from '@tanstack/charts'
```

The same package provides exact scale subpaths for common numeric and
categorical mappings:

```sh
pnpm add @tanstack/charts
```

```ts
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
import { scalePoint } from '@tanstack/charts/scales/point'
```

There is no aggregate `/scales` export. Each exact entry retains only its
family and has no production D3 dependency.

Capability subpaths make optional boundaries explicit:

```ts
import { mountChart } from '@tanstack/charts/dom'
import { mountCanvasChart } from '@tanstack/charts/canvas'
import { mountChartRenderer } from '@tanstack/charts/renderer'
import { motion } from '@tanstack/charts/motion'
import { createChartSpring } from '@tanstack/charts/spring'
import { renderChartImage } from '@tanstack/charts/export'
import { focusGroupX } from '@tanstack/charts/focus'
import { focusGuideX } from '@tanstack/charts/focus/guide'
import { brushX } from '@tanstack/charts/interaction/brush'
import { continuousCursor } from '@tanstack/charts/interaction/cursor'
import { handleX } from '@tanstack/charts/interaction/handle'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { zoomX } from '@tanstack/charts/interaction/zoom'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { keyedSelection, whenSelected } from '@tanstack/charts/selection'
import { d3Curve } from '@tanstack/charts/d3/shape'
import { tooltip } from '@tanstack/charts/tooltip'
import { portal } from '@tanstack/charts/tooltip/portal'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { groupBy } from '@tanstack/charts/transform/group'
import { rollingWindow } from '@tanstack/charts/transform/rolling-window'
```

Canvas is opt-in. The default core and every default framework entry remain
SVG-based. Canvas enters the module graph only through
`@tanstack/charts/canvas`, `@tanstack/charts/react/canvas`, or
`@tanstack/charts/octane/canvas`. The React and Octane `/core` entries accept
an application-supplied renderer without importing Canvas.

The Canvas renderer can also be attached to only the dense marks in an
otherwise SVG chart:

```ts
import { canvasChartRenderer } from '@tanstack/charts/canvas'

lineY(rows, {
  x: 'time',
  y: 'value',
  renderer: canvasChartRenderer,
})
```

The shared host includes only the small renderer-selection and layer metadata
contract. It does not include the Canvas painter. A consumer that never
imports the Canvas subpath cannot retain that painter. Measure mixed and
SVG-only entries separately when reviewing a bundle change.

Non-cartesian geometry is subpath-only:

```ts
import { pie, polar, radialArc, radialBarRadius } from '@tanstack/charts/polar'
import { geoShape } from '@tanstack/charts/geo'
import { sunburst } from '@tanstack/charts/hierarchy/sunburst'
import { sankeyDiagram } from '@tanstack/charts/network/sankey'
```

The root entry does not re-export those capabilities. Polar brings in its
`d3-shape` geometry only when the polar subpath is imported; geography does
the same for `d3-geo`. The exact sunburst entry adds its `d3-hierarchy`
partition only when imported and reuses the sector geometry shared by ordinary
polar marks. It does not add hierarchy or sunburst code to ordinary polar
charts. Polar value allocation comes from its native `pie` transform.
The exact Sankey entry adds `d3-sankey` and resolved child-mark composition
only to Sankey consumers; it does not change root, universal, static force, or
ordinary link bundles.
Import configured scales, projections, and curve factories from their granular
D3 modules as the chart requires them. Political boundary data and
`topojson-client` remain application dependencies; importing `geoShape` does
not bundle an atlas.

Tween and spring SVG motion is one optional renderer entry. Importing
`@tanstack/charts/motion` includes both transition models, retained geometry,
and the SVG reconciler. There is no separate tween-only adapter. The scalar
physics sampler remains available independently from `@tanstack/charts/spring`.
Core definitions can contain inert `motion` policy without importing either
runtime.

Focus guides are also exact-subpath marks. Importing
`@tanstack/charts/focus/guide` adds renderer-neutral candidate and label
construction, but no DOM host, tooltip, motion runtime, spring solver, React,
or D3 geometry package.

The controlled-signal snapshot is 0.09 KiB gzip in isolation. The interactive
categorical legend, including native DOM controls, adds 2.55 KiB gzip over the
ordinary DOM host. Neither implementation enters root or universal consumers.

Controlled keyed selection is also exact-subpath-only. Its semantic-key
controller and post-domain mark filter enter through
`@tanstack/charts/selection`; `whenSelected` reuses the ordinary authored mark
instead of importing another geometry or renderer implementation. The root and
universal value entries do not re-export the selection implementation.

The continuous cursor is exact-subpath-only through
`@tanstack/charts/interaction/cursor`. It reuses the controlled signal, scale
interaction axis, and renderer-neutral guide-node kernel without importing the
datum focus guide, tooltip, brush, or a D3 package. Its incremental DOM-host
fixture adds 3.75 KiB gzip under a 5 KiB cap.

The horizontal scale handle is exact-subpath-only through
`@tanstack/charts/interaction/handle`. It reuses the controlled signal,
candidate interaction axis, and value-cloning range kernel without importing
cursor, brush, zoom, guide, or D3 code. Its incremental DOM-host fixture adds
3.65 KiB gzip under a 5 KiB cap.

Horizontal brushing is exact-subpath-only through
`@tanstack/charts/interaction/brush`. It includes the one-dimensional
scale/snap kernel, DOM host control, `d3-brush`, and `d3-selection` only for a
consumer that imports it. Root, universal, ordinary DOM, legend, and selection
consumers retain none of those modules.

Horizontal zoom is exact-subpath-only through
`@tanstack/charts/interaction/zoom`. It includes the controlled semantic-window
behavior, final-scale interaction axis, DOM host control, `d3-zoom`, and
`d3-selection` only for a consumer that imports it. Root, universal, ordinary
DOM, brush, cursor, legend, and selection consumers retain none of those
modules. Its incremental DOM-host fixture adds 20.28 KiB gzip under a 20.35 KiB
cap.

Your bundler must honor ESM exports and tree shaking. Avoid namespace imports
when a named or subpath import communicates the real dependency.

Tooltip rendering is also opt-in. A definition imports `tooltip`; viewport
layering additionally imports `portal` and nests it under the tooltip options:

```ts
const interactive = defineChart(definition, {
  tooltip: {
    use: tooltip,
    portal,
  },
})
```

The locked compact React line consumer must remain at or below 26.6 KiB gzip.
Its retained-module gate rejects tooltip, portal, `d3-scale`, `d3-format`,
`d3-interpolate`, `d3-color`, transforms, and sibling compact-scale entries.
Separate incremental gates limit tooltip and portal growth.

The current locked fixtures measure the compact line scene at 10,526 gzip bytes
versus 17,646 with D3 linear scales. The equivalent React consumers measure
27,114 and 34,171 gzip bytes with React and React DOM external. These are
fixture measurements, not universal savings claims; they show why the compact
subset is the normal starting point.

Transforms are root exports for convenience, but their granular subpaths are
the smallest contract for reusable preparation code. Ordinary line, compact-
scale, and tooltip-only bundle fixtures reject every transform module. Each
transform family has its own gzip ceiling and rejects unrelated families.
Numeric and 2D bins intentionally use `d3-array`; row stacking uses `d3-shape`;
grouping, calendar bins, windows, cumulative values, ranks, normalization,
selection, and advanced reducers do not retain either dependency.
