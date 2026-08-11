# Specifications and types

Chart definitions, specifications, reference index, and type reference.

<a id="source-charts-docs-reference-chart-definitions-md"></a>

## Chart Definitions

Source: `charts:docs/reference/chart-definitions.md`.

### `defineChart`

```ts
import { defineChart } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'
import { portal } from '@tanstack/charts/tooltip/portal'
```

`defineChart` accepts a complete chart spec, a responsive configuration, or an
existing definition plus replacement behavior:

```ts
function defineChart<const TMarks, const TSpec>(
  spec: TSpec,
): StaticChartDefinition<InferredDatum, InferredX, InferredY>

function defineChart<const TSpec>(
  chart: (context: ChartBuildContext) => TSpec,
): ResponsiveChartDefinition<InferredDatum, InferredX, InferredY>

function defineChart<const TSpec>(
  config: ResponsiveChartConfig<TSpec>,
): ResponsiveChartDefinition<InferredDatum, InferredX, InferredY>

function defineChart<TDefinition, TOptions>(
  definition: TDefinition,
  options: TOptions,
): Omit<TDefinition, keyof TOptions> & TOptions
```

### Static definitions

Use a static definition when its data and visual options are already known:

```ts
import { scaleUtc } from 'd3-scale'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const definition = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value' })],
  x: { scale: scaleUtc },
  y: { scale: scaleLinear, nice: true, grid: true },
  focus: 'group-x',
  tooltip: {
    use: tooltip,
    portal,
    anchor: 'group-center',
    placement: ['top', 'right', 'left', 'bottom'],
  },
})
```

### Responsive definitions

Use a configuration object when the spec depends on the resolved chart
surface:

```ts
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const definition = defineChart({
  svgAnimation: true,
  chart: ({ width }) => ({
    marks: [barY(rows, { x: 'category', y: 'value' })],
    x: { scale: scaleBand },
    y: {
      scale: scaleLinear,
      nice: true,
      axis: { ticks: { count: width < 480 ? 4 : 7 } },
      grid: true,
    },
  }),
})
```

The builder receives:

| Property       | Type         | Meaning                                                      |
| -------------- | ------------ | ------------------------------------------------------------ |
| `width`        | `number`     | Current full surface width                                   |
| `height`       | `number`     | Current full surface height                                  |
| `defaultTheme` | `ChartTheme` | Platform defaults before the returned spec applies its theme |

`width` and `height` are controlled by the host. The builder can read them but
does not return or own them.

### Definition behavior

`ChartDefinitionOptions<TDatum, TXValue, TYValue>` contains `focus`,
`focusRing`, `selection`, `controls`, `cursor`, `maxFocusDistance`,
`spatialIndex`, `svgAnimation`, `pointer`, `keyboard`, and `tooltip`. These options
belong to both static and responsive definitions. Hosts and framework adapters
do not override them.

Each `ChartControl` resolves after final scales and plot bounds exist. It can
provide renderer-neutral fallback nodes and an optional host control. Control
IDs and host-control identities must be unique. Browser hosts remove a
control's fallback before painting and own its update, renderer replacement,
event containment, and teardown lifecycle. Static renderers keep the fallback.

`cursor` binds an application-owned controller in focus-snapped or free mode.
It is behavior, not a mark; add `crosshair(...)` when the cursor should have a
renderer-native visual guide. See
[Focus and Interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).

Tooltip placement policy stays with the definition. Add the `portal` extension
when the surface must escape clipped chart ancestors. Framework-only content
composition remains an adapter prop, slot, snippet, or template.

`ResponsiveChartConfig<TSpec>` combines those options with the responsive `chart`
builder. The two-argument `defineChart(definition, options)` form creates a new
definition when a reusable base needs a different interaction policy.

Definitions carry an optional fourth tooltip-host type parameter:
`ChartDefinition<TDatum, TXValue, TYValue, TTooltipHost>`. `DomChartDefinition`
fixes that host to `"dom"`; DOM adapter exports expose it as their local
`ChartDefinition`. Adding a DOM or React Native tooltip therefore makes that
definition host-specific. A definition without a tooltip remains assignable to
either host. Deliberately widening it to the generic three-parameter
`ChartDefinition` erases that proof and is rejected by strict host props.

### Identity and updates

A definition captures application values. Its identity is the application
update boundary: keep it stable until a captured value changes.

```tsx
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const definition = useMemo(() => {
  const ranked = rows
    .map((row) => ({ label: row.label, value: row[metric] }))
    .sort((left, right) => right.value - left.value)

  return defineChart(({ width }) => ({
    marks: [barX(ranked, { x: 'value', y: 'label' })],
    x: {
      scale: scaleLinear,
      nice: true,
      axis: { ticks: { count: width < 480 ? 4 : 7 } },
    },
    y: {
      scale: () => scaleBand().padding(0.1),
    },
  }))
}, [rows, metric])
```

Framework adapters use their native memoization primitive. Vanilla code
creates the next definition and passes it to `host.update`.

### Types

```ts
interface ChartBuildContext {
  width: number
  height: number
  defaultTheme: ChartTheme
}

type ChartDefinition<TDatum, TXValue, TYValue> =
  | StaticChartDefinition<TDatum, TXValue, TYValue>
  | ResponsiveChartDefinition<TDatum, TXValue, TYValue>
```

`isResponsiveChartDefinition` narrows the union to a builder definition.

<a id="source-charts-docs-reference-chart-spec-md"></a>

## Chart Spec

Source: `charts:docs/reference/chart-spec.md`.

Every static definition and responsive chart builder resolves to a `ChartSpec`.
The spec owns chart composition, scale factories or fixed scale instances, and
presentation.

```ts
type ChartSpec<TMarks extends readonly ChartMark[]> = {
  marks: TMarks
  guides?: boolean
  color?: ChartColorOptions
  gradients?: readonly ChartLinearGradient[]
  clip?: boolean
  margin?: number | Partial<ChartMargin>
  theme?: Partial<ChartTheme>
} & ([ChartMarkScaleX<TMarks[number]>] extends [never]
  ? { x?: null }
  : { x: ChartAxisOptions }) &
  ([ChartMarkScaleY<TMarks[number]>] extends [never]
    ? { y?: null }
    : { y: ChartAxisOptions })
```

### Properties

| Property    | Required    | Meaning                                                                                                            |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `marks`     | Yes         | Ordered mark layers. Later scene nodes paint after earlier ones.                                                   |
| `x`         | Conditional | Required when a mark materializes x; omitted otherwise.                                                            |
| `y`         | Conditional | Required when a mark materializes y; omitted otherwise.                                                            |
| `guides`    | No          | Set to `false` to suppress both axes, grid lines, titles, and their implicit margins.                              |
| `color`     | No          | Shared categorical or quantitative color scale and optional legend.                                                |
| `gradients` | No          | Linear-gradient resources consumed by the default SVG and Canvas renderers.                                        |
| `clip`      | No          | Clips the marks group to the resolved inner chart bounds in the default SVG and Canvas renderers.                  |
| `margin`    | No          | Locks all margins with a number or selected sides with a partial object. Omitted sides are measured automatically. |
| `theme`     | No          | Overrides default foreground, muted, grid, background, or palette tokens.                                          |

The detailed option contracts live in
[Scales, guides, and color](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md). Mark-specific
channels and defaults live in the [mark reference](./specifications-types.md#source-charts-docs-reference-index-md).

### Marks and layer order

`marks` is the grammar's composition unit:

```ts
import { areaY, defineChart, lineY, ruleY } from '@tanstack/charts'
import { scaleUtc } from 'd3-scale'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const definition = defineChart({
  marks: [
    areaY(rows, { x: 'date', y: 'value', fillOpacity: 0.12 }),
    ruleY([target], {
      stroke: '#dc2626',
      strokeWidth: 1.5,
      strokeDasharray: '4 2',
    }),
    lineY(rows, { x: 'date', y: 'value', points: true }),
  ],
  x: { scale: scaleUtc },
  y: { scale: scaleLinear, grid: true },
})
```

Each mark materializes channels for scale resolution, then emits renderer-
neutral scene nodes and optional interaction points. Marks may use different
datum types in the same spec. Their inferred datum types become a union in
interaction callbacks.

A data-less `crosshair` emits only transient focus-guide presentation. Place it
before the first ordinary mark for an underlay or after ordinary marks for an
overlay; it contributes no scale domain values or interaction points.

Built-in marks infer stable keys from a unique primitive top-level `id`, nested
`data.id`, or mark-owned positional candidate. Supply `key` when none is
unique. Mark IDs default from layer order; set `id` explicitly when a mark
must retain identity while its order changes.

### Conditional positional axes

Each axis used by the marks is required. Supply a compatible factory for an inferred
domain or a configured instance for a fixed domain:

```ts
const axes = {
  x: { scale: scaleUtc },
  y: { scale: scaleLinear },
}
```

Omit an unused dimension:

```ts
const horizontalThresholds = defineChart({
  marks: [ruleY([25, 50, 75])],
  y: { scale: scaleLinear().domain([0, 100]) },
})
```

`axis: false` hides an axis but does not remove its scale. Scene compilation
still guards untyped consumers that omit or null an axis used by a mark.

### Guides and margins

Guide visibility and geometry are separate:

- `x.axis: false` or `y.axis: false` hides one axis.
- `guides: false` hides all guides and removes their implicit margin.
- Omitted `margin` sides are measured from ticks, rotation, titles, edge
  overhang, color legends, and Cartesian `text` marks.
- `margin: 0` locks every side to zero.
- `margin: { left: 80 }` locks only the left side.

Automatic margins contain guide and text-mark labels unless the side is locked
or the plot is clipped; they do not choose a collision policy. Control dense
guide labels with the scale's tick behavior, `ticks`, `format`, or
`tickRotate`.

### Clip and gradient resources

`clip` and `gradients` are scene data consumed by the default SVG and Canvas
renderers:

```ts
const definition = defineChart({
  marks,
  x,
  y,
  clip: true,
  gradients: [
    {
      id: 'revenue',
      y1: 1,
      y2: 0,
      stops: [
        { offset: 0, color: '#2563eb', opacity: 0.08 },
        { offset: 1, color: '#2563eb', opacity: 0.72 },
      ],
    },
  ],
})
```

Reference a declared gradient from a mark paint as `url(#revenue)`.
`idPrefix` scopes generated resource IDs when multiple charts share a
document. See
[Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).

### Theme

The complete default theme is exported as `defaultChartTheme`:

```ts
interface ChartTheme {
  foreground: string
  muted: string
  grid: string
  background: string
  palette: readonly string[]
}
```

`theme` is partial. The palette is replaced as one value rather than merged by
index. The default palette uses CSS custom-property fallbacks:

```css
.dashboard {
  --ts-chart-1: #38bdf8;
  --ts-chart-2: #fb7185;
  --ts-chart-3: #4ade80;
}
```

Because the default foreground and guide colors use `currentColor`, charts
inherit light and dark mode without a JavaScript theme switch. Override theme
tokens when the application needs an explicit visual system.

<a id="source-charts-docs-reference-index-md"></a>

## Index

Source: `charts:docs/reference/index.md`.

TanStack Charts has a small framework-neutral core and thin framework
adapters. Most applications use `defineChart`, one or more marks, configured
scales, and the selected framework's chart binding. Lower-level entry points
are available for custom marks, vanilla DOM mounting, static rendering, export,
and application-owned interaction.

### Core reference

| Area                                                        | Reference                                                 |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| Object and responsive definitions                           | [Chart Definition API](./specifications-types.md#source-charts-docs-reference-chart-definitions-md)            |
| The `ChartSpec` object                                      | [Chart spec](./specifications-types.md#source-charts-docs-reference-chart-spec-md)                             |
| Positional scales, axes, color, legends, and gradients      | [Scales, guides, and color](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md) |
| Vanilla DOM mounting and responsive sizing                  | [DOM host](./rendering-composition-reference.md#source-charts-docs-reference-dom-host-md)                                 |
| Framework prerender, mount, update, and layout lifecycle    | [Adapter controller](./rendering-composition-reference.md#source-charts-docs-reference-adapter-controller-md)             |
| Responsive scene compilation and runtime behavior           | [Runtime and scene](./runtime-scales-reference.md#source-charts-docs-reference-runtime-and-scene-md)               |
| Eager row, hierarchy, and static force transforms           | [Data transforms](./rendering-composition-reference.md#source-charts-docs-reference-transforms-md)                        |
| Pointer focus, keyboard navigation, tooltips, and selection | [Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md)       |
| SVG, Canvas, custom rendering, reconciliation, and export   | [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md)         |
| Optional tween and spring motion                            | [Motion](./interaction-motion-reference.md#source-charts-docs-reference-motion-md)                                     |
| Custom marks, renderers, scales, and indexes                | [Custom extensions](./rendering-composition-reference.md#source-charts-docs-reference-custom-extensions-md)               |
| Public generic and scene types                              | [Types](./specifications-types.md#source-charts-docs-reference-types-md)                                       |

### Mark reference

| Marks                                                             | Reference                                                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `lineY`, `lineX`, `areaY`, and `areaX`                            | [Line and area](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-line-and-area-md)                                                   |
| `differenceY` and `differenceX`                                   | [Difference](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-difference-md)                                                         |
| `linearRegressionRowsY/X` and `linearRegressionY/X`               | [Linear regression](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-regression-md)                                                  |
| `barY`, `barX`, `rect`, and `cell`                                | [Bar and rect](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-bar-and-rect-md)                                                     |
| `boxRows`, `boxY`, and `boxX`                                     | [Box](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-box-md)                                                                       |
| `dot` and `hexagon`                                               | [Dot and hexagon](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-dot-and-hexagon-md)                                               |
| `createDotLayout`, `dodgeY`, and `dodgeX`                         | [Dodge layouts](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-dodge-md)                                                           |
| `waffleY` and `waffleX`                                           | [Waffle](./marks-composite.md#source-charts-docs-reference-marks-waffle-md)                                                                 |
| `ridgelineY` and `ridgelineX`                                     | [Ridgeline](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-ridgeline-md)                                                           |
| `violinY` and `violinX`                                           | [Violin](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-violin-md)                                                                 |
| `focusGuideX` and `focusGuideY`                                   | [Focus guide](./marks-spatial.md#source-charts-docs-reference-marks-focus-guide-md)                                                       |
| `treemap`                                                         | [Treemap](./marks-composite.md#source-charts-docs-reference-marks-treemap-md)                                                               |
| `sunburst`                                                        | [Sunburst](./marks-composite.md#source-charts-docs-reference-marks-sunburst-md)                                                             |
| `sankeyDiagram`                                                   | [Sankey diagram](./marks-composite.md#source-charts-docs-reference-marks-sankey-md)                                                         |
| `hexbin`                                                          | [Hexbin](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-hexbin-md)                                                                 |
| `contour`                                                         | [Contour](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-contour-md)                                                               |
| `densityContour`                                                  | [Density contour](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-density-md)                                                       |
| `delaunayLink`                                                    | [Delaunay link](./marks-spatial.md#source-charts-docs-reference-marks-delaunay-md)                                                        |
| `voronoi`                                                         | [Voronoi](./marks-spatial.md#source-charts-docs-reference-marks-voronoi-md)                                                               |
| `ruleX`, `ruleY`, `link`, `arrow`, `vector`, `tickX`, and `tickY` | [Rules, links, arrows, vectors, and ticks](./marks-composite.md#source-charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md) |
| `text`, `frame`, `facet`, and `facetChart`                        | [Text, frame, and facet](./marks-composite.md#source-charts-docs-reference-marks-text-frame-and-facet-md)                                   |
| `composeViews`, layout utilities, and `viewGrid`                  | [View composition](./rendering-composition-reference.md#source-charts-docs-reference-view-composition-md)                                                   |
| `geoShape`                                                        | [Geo shape](./marks-spatial.md#source-charts-docs-reference-marks-geo-md)                                                                 |
| `polar`, radial marks, and polar guides                           | [Polar marks](./marks-spatial.md#source-charts-docs-reference-marks-polar-md)                                                             |
| `crosshair`                                                       | [Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md)                        |

### Framework adapters

| Framework | Start                                             | Adapter behavior                           | Component API                                                        |
| --------- | ------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| React     | [Quick start](./framework-react.md#source-charts-docs-framework-react-quick-start-md)  | [Adapter](./framework-react.md#source-charts-docs-framework-react-adapter-md)   | [`Chart`](./framework-react.md#source-charts-docs-framework-react-reference-chart-md)                     |
| Preact    | —                                                 | [Adapter](./framework-preact.md#source-charts-docs-framework-preact-adapter-md)  | [`Chart`](./framework-preact.md#source-charts-docs-framework-preact-reference-chart-md)                    |
| Vue       | —                                                 | [Adapter](./framework-vue.md#source-charts-docs-framework-vue-adapter-md)     | [`Chart`](./framework-vue.md#source-charts-docs-framework-vue-reference-chart-md)                       |
| Solid     | —                                                 | [Adapter](./framework-solid.md#source-charts-docs-framework-solid-adapter-md)   | [`Chart`](./framework-solid.md#source-charts-docs-framework-solid-reference-chart-md)                     |
| Svelte    | —                                                 | [Adapter](./framework-svelte.md#source-charts-docs-framework-svelte-adapter-md)  | [`Chart`](./framework-svelte.md#source-charts-docs-framework-svelte-reference-chart-md)                    |
| Angular   | —                                                 | [Adapter](./framework-angular.md#source-charts-docs-framework-angular-adapter-md) | [`Chart`](./framework-angular.md#source-charts-docs-framework-angular-reference-chart-md)                   |
| Lit       | —                                                 | [Adapter](./framework-lit.md#source-charts-docs-framework-lit-adapter-md)     | [`Chart`, `defineChartElement`](./framework-lit.md#source-charts-docs-framework-lit-reference-chart-md) |
| Alpine    | —                                                 | [Adapter](./framework-alpine.md#source-charts-docs-framework-alpine-adapter-md)  | [`charts`](./framework-alpine.md#source-charts-docs-framework-alpine-reference-chart-md)                   |
| Octane    | [Quick start](./framework-octane.md#source-charts-docs-framework-octane-quick-start-md) | [Adapter](./framework-octane.md#source-charts-docs-framework-octane-adapter-md)  | [`Chart`](./framework-octane.md#source-charts-docs-framework-octane-reference-chart-md)                    |

React and Octane keep the default `Chart` SVG-based. Their `/canvas` entries
select the optional Canvas renderer; their `/core` entries require an explicit
`ChartRenderer`. The other adapters currently expose the default SVG surface.

### Surface tiers

| Tier                        | Use                                                     | Entries                                                                                                                                |
| --------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary authoring          | Define and render charts                                | `@tanstack/charts` with exact mark, scale, and framework subpaths                                                                      |
| Optional capability         | Add only when the chart needs it                        | transforms, motion, spatial indexes, controlled interaction, tooltip, Canvas, export, hierarchy, network, and view composition entries |
| Host and renderer extension | Implement an adapter, renderer, or host-owned extension | adapter, renderer, scene, reconciliation, SVG renderer, cursor host, and tooltip model entries                                         |

### Import map

The root `@tanstack/charts` entry point exports the common grammar, runtime,
scene, SVG renderer, browser host, and their public types. The universal entry
excludes browser hosts and adapters. Granular subpaths keep optional
capabilities and individual marks independently tree-shakeable. Compact scales
come from exact `@tanstack/charts/scales/*` entries; there is intentionally no
aggregate `/scales` export.

| Import                                  | Public values                                                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tanstack/charts`                      | Common marks including `crosshair`, legends, D3 curve bridges, definitions, runtime, scene, DOM host, static SVG, and focus-presentation helpers                                                                                |
| `@tanstack/charts/scales/band`          | `scaleBand`, `BandScale`                                                                                                                                                                                                        |
| `@tanstack/charts/scales/linear`        | `scaleLinear`, `LinearScale`                                                                                                                                                                                                    |
| `@tanstack/charts/scales/ordinal`       | `scaleOrdinal`, `OrdinalScale`                                                                                                                                                                                                  |
| `@tanstack/charts/scales/point`         | `scalePoint`, `PointScale`                                                                                                                                                                                                      |
| `@tanstack/charts/react`                | SVG `Chart` and React chart prop, definition, point, and tooltip-body types                                                                                                                                                     |
| `@tanstack/charts/react/canvas`         | Canvas `Chart` and matching React chart prop, definition, point, and tooltip-body types                                                                                                                                         |
| `@tanstack/charts/react/core`           | Renderer-neutral `Chart` and matching React chart prop, definition, point, and tooltip-body types                                                                                                                               |
| `@tanstack/charts/react/tooltip`        | Tooltip-composition `Chart`, `CanvasChart`, `RendererChart`, and their prop and render-context types                                                                                                                            |
| `@tanstack/charts/react-native`         | React Native `Chart`, `ChartProps`, `NativeChartRenderContext`, `NativeChartTooltipRenderContext`, `NativePaintContext`, `NativePaintResolver`, and `resolveNativePaint`                                                        |
| `@tanstack/charts/react-native/tooltip` | React Native `tooltip`, `NativeChartTooltipComponent`, `NativeChartTooltipExtension`, `NativeChartTooltipProps`, and `NativeChartTooltipRenderContext`                                                                          |
| `@tanstack/charts/preact`               | Preact `Chart` and chart prop, definition, point, and tooltip-body types                                                                                                                                                        |
| `@tanstack/charts/vue`                  | Vue `Chart` and chart prop, definition, point, and tooltip-slot types                                                                                                                                                           |
| `@tanstack/charts/solid`                | Solid `Chart` and chart prop, definition, point, and tooltip-body types                                                                                                                                                         |
| `@tanstack/charts/svelte`               | Svelte `Chart` and chart prop, definition, point, and tooltip-snippet types                                                                                                                                                     |
| `@tanstack/charts/angular`              | Angular `Chart`, tooltip-body directive, chart option, definition, point, and template-context types                                                                                                                            |
| `@tanstack/charts/lit`                  | Lit `Chart`, `defineChartElement`, chart prop, definition, point, and tooltip-body types                                                                                                                                        |
| `@tanstack/charts/alpine`               | Alpine `charts` plugin and chart option, definition, point, and tooltip-body types                                                                                                                                              |
| `@tanstack/charts/octane`               | SVG `Chart` and Octane chart prop, definition, point, and tooltip-body types                                                                                                                                                    |
| `@tanstack/charts/octane/canvas`        | Canvas `Chart` and matching Octane chart prop, definition, point, and tooltip-body types                                                                                                                                        |
| `@tanstack/charts/octane/core`          | Renderer-neutral `Chart` and matching Octane chart prop, definition, point, and tooltip-body types                                                                                                                              |
| `@tanstack/charts/adapter`              | `createChartAdapter`, `resolveChartAdapterLayout`, `ChartAdapter`, `ChartAdapterLayout`, and `ChartAdapterLayoutOptions`                                                                                                        |
| `@tanstack/charts/adapter/renderer`     | `createChartRendererAdapter`                                                                                                                                                                                                    |
| `@tanstack/charts/area`                 | `areaY`                                                                                                                                                                                                                         |
| `@tanstack/charts/area-x`               | `areaX`                                                                                                                                                                                                                         |
| `@tanstack/charts/arrow`                | `arrow`                                                                                                                                                                                                                         |
| `@tanstack/charts/band`                 | `bandX`, `bandY`                                                                                                                                                                                                                |
| `@tanstack/charts/bar`                  | `barX`, `barY`                                                                                                                                                                                                                  |
| `@tanstack/charts/box`                  | `boxRows`, `boxY`, `boxX`, derived datum types, and option types                                                                                                                                                                |
| `@tanstack/charts/canvas`               | `mountCanvasChart`, `canvasChartRenderer`, `createCanvasChartRenderer`, and Canvas host/surface types                                                                                                                           |
| `@tanstack/charts/crosshair`            | Data-less `crosshair`, `resolveCrosshairGuide`, and crosshair option types                                                                                                                                                      |
| `@tanstack/charts/cursor`               | `createChartCursor`, `cursorHost`, and framework-neutral controller and state types                                                                                                                                             |
| `@tanstack/charts/cursor/host`          | Adapter-facing cursor session, projection, focus resolution, focus-strategy, and focus-presentation helpers                                                                                                                     |
| `@tanstack/charts/d3/area-x`            | `d3AreaXCurve`                                                                                                                                                                                                                  |
| `@tanstack/charts/d3/shape`             | `d3Curve`                                                                                                                                                                                                                       |
| `@tanstack/charts/difference`           | `differenceY`, `differenceX`, derived datum types, sign and independent-value types, and option types                                                                                                                           |
| `@tanstack/charts/dom`                  | `mountChart`                                                                                                                                                                                                                    |
| `@tanstack/charts/dodge`                | `createDotLayout`, `dodgeY`, `dodgeX`, anchor, option, and layout types                                                                                                                                                         |
| `@tanstack/charts/dot`                  | `dot`                                                                                                                                                                                                                           |
| `@tanstack/charts/export`               | SVG serialization/download and browser image export                                                                                                                                                                             |
| `@tanstack/charts/facet`                | `facet`, `facetChart`                                                                                                                                                                                                           |
| `@tanstack/charts/focus`                | `focusGroupX`, `focusGroupY`, `focusNearestX`, `focusNearestY`                                                                                                                                                                  |
| `@tanstack/charts/focus/disabled`       | `focusDisabled`                                                                                                                                                                                                                 |
| `@tanstack/charts/focus/guide`          | `focusGuideX`, `focusGuideY`, `FocusGuideLabelFormatContext`, and focus-guide option types                                                                                                                                      |
| `@tanstack/charts/focus/mark`           | `whenFocused`                                                                                                                                                                                                                   |
| `@tanstack/charts/frame`                | `frame`                                                                                                                                                                                                                         |
| `@tanstack/charts/geo`                  | `geoShape` and geographic projection types                                                                                                                                                                                      |
| `@tanstack/charts/group`                | `group`, `GroupLayout`, `GroupOptions`                                                                                                                                                                                          |
| `@tanstack/charts/hierarchy/tree`       | `treeLayout`, `TreeOrientation`, `TreeNodeContext`, `TreeNodeComparator`, `TreeNodeSeparation`, `TreeLayoutPathOptions`, `TreeLayoutParentOptions`, `TreeLayoutOptions`, `TreeLayoutNode`, `TreeLayoutLink`, `TreeLayoutResult` |
| `@tanstack/charts/hierarchy/treemap`    | `treemap`, built-in and callable tile types, immutable node values, comparators, and path/parent option types                                                                                                                   |
| `@tanstack/charts/hierarchy/sunburst`   | `sunburst`, `SunburstNode`, `SunburstNodeComparator`, `SunburstPathOptions`, `SunburstParentOptions`, `SunburstOptions`                                                                                                         |
| `@tanstack/charts/hexagon`              | `hexagon`                                                                                                                                                                                                                       |
| `@tanstack/charts/interaction/brush`    | `brushX` and horizontal-brush range, change, source, target, and option types                                                                                                                                                   |
| `@tanstack/charts/interaction/cursor`   | `continuousCursor` and continuous-cursor position, change, guide, label, and option types                                                                                                                                       |
| `@tanstack/charts/interaction/signal`   | `controlledSignal`, `ControlledSignal`, `ControlledSignalChangeContext`                                                                                                                                                         |
| `@tanstack/charts/interaction/zoom`     | `zoomX`, `ZoomXValue`, `ZoomXWindow`, `ZoomXSource`, `ZoomXAction`, `ZoomXChange`, and `ZoomXOptions`                                                                                                                           |
| `@tanstack/charts/legend`               | `colorLegend`, `colorGradientLegend`, `interactiveColorLegend`, `InteractiveColorLegendItemContext`, and legend option/change types                                                                                             |
| `@tanstack/charts/line`                 | `lineY`, `lineX`, `LineYOptions`, and `LineXOptions`                                                                                                                                                                            |
| `@tanstack/charts/regression`           | `linearRegressionRowsY`, `linearRegressionRowsX`, `linearRegressionY`, `linearRegressionX`, derived datum types, and option types                                                                                               |
| `@tanstack/charts/link`                 | `link`                                                                                                                                                                                                                          |
| `@tanstack/charts/mark/composite`       | `compositeMark` and `CompositeMarkOptions`                                                                                                                                                                                      |
| `@tanstack/charts/mark/decorative`      | `decorative`                                                                                                                                                                                                                    |
| `@tanstack/charts/mark/scale-values`    | `createMarkWithScaleValues`                                                                                                                                                                                                     |
| `@tanstack/charts/motion`               | `motion`, `ChartMotionOptions`, and renderer-neutral motion types                                                                                                                                                               |
| `@tanstack/charts/network/force`        | `forceLayout`, built-in descriptors, named D3-compatible force factories, private working-clone context, settled node/link result, and lineage types                                                                            |
| `@tanstack/charts/network/sankey`       | `sankeyDiagram`, shorthand and callable alignment types, responsive layout options, immutable node/link values, comparator contexts, and lineage types                                                                          |
| `@tanstack/charts/polar`                | `pie`, `polar`, `radialArc`, `radialBarRadius`, `radialBarAngle`, other radial marks, and radial/angle guides                                                                                                                   |
| `@tanstack/charts/universal`            | Common root authoring, runtime, scene, and static SVG values without browser hosts or adapters                                                                                                                                  |
| `@tanstack/charts/reconcile`            | `reconcileChartSvg`, `reconcileChartSvgFragment`                                                                                                                                                                                |
| `@tanstack/charts/rect`                 | `rect`, `cell`                                                                                                                                                                                                                  |
| `@tanstack/charts/renderer`             | `mountChartRenderer`                                                                                                                                                                                                            |
| `@tanstack/charts/ridgeline`            | `ridgelineY`, `ridgelineX`, `RidgelineYOptions`, `RidgelineXOptions`, `RidgelinePosition`, `RidgelineCurve`, and `RidgelineStateStyle`                                                                                          |
| `@tanstack/charts/rule`                 | `ruleX`, `ruleY`                                                                                                                                                                                                                |
| `@tanstack/charts/runtime`              | `createChartRuntime`, `isResponsiveChartDefinition`                                                                                                                                                                             |
| `@tanstack/charts/selection`            | `keyedSelection`, `whenSelected`, `KeyedSelectionChange`, `KeyedSelectionKeyContext`, `KeyedSelectionOptions`, and `KeyedSelection`                                                                                             |
| `@tanstack/charts/scene`                | `defineChart`, `createChartScene`, `defaultChartTheme`, `findNearestPoint`, `viewportInteractionPoints`                                                                                                                         |
| `@tanstack/charts/svg`                  | `renderChartSvg`                                                                                                                                                                                                                |
| `@tanstack/charts/svg/renderer`         | `createSvgChartRenderer`, `svgChartRenderer`                                                                                                                                                                                    |
| `@tanstack/charts/svg/resources`        | `renderChartSvgWithResources`                                                                                                                                                                                                   |
| `@tanstack/charts/stack`                | `stack`, `StackAnchor`, `StackLayout`, `StackOptions`, `StackOrder`, `StackOffset`                                                                                                                                              |
| `@tanstack/charts/spring`               | `createChartSpring` and scalar spring types                                                                                                                                                                                     |
| `@tanstack/charts/spatial/contour`      | `contour`, `ContourOptions`, and `ContourDatum`                                                                                                                                                                                 |
| `@tanstack/charts/spatial/hexbin`       | `hexbin`, `HexbinOptions`, and `HexbinDatum`                                                                                                                                                                                    |
| `@tanstack/charts/spatial/density`      | `densityContour`, `DensityContourOptions`, and `DensityContourDatum`                                                                                                                                                            |
| `@tanstack/charts/spatial/delaunay`     | `delaunayLink`, `DelaunayLinkOptions`, and `DelaunayLinkDatum`                                                                                                                                                                  |
| `@tanstack/charts/spatial/voronoi`      | `voronoi` and `VoronoiOptions`                                                                                                                                                                                                  |
| `@tanstack/charts/text`                 | `text`                                                                                                                                                                                                                          |
| `@tanstack/charts/tick`                 | `tickX`, `tickY`                                                                                                                                                                                                                |
| `@tanstack/charts/tooltip/model`        | Environment-neutral tooltip ordering, content, anchor, placement, value-formatting, and geometry types for host adapters                                                                                                        |
| `@tanstack/charts/transform/fold`       | `fold`, `FoldField`, `FoldOutputNames`, `FoldOptions`, and `FoldDatum`                                                                                                                                                          |
| `@tanstack/charts/transform/waterfall`  | `waterfall`, `WaterfallKind`, `WaterfallOptions`, `WaterfallDatum`, `WaterfallStepDatum`, and `WaterfallTotalDatum`                                                                                                             |
| `@tanstack/charts/types`                | Universal definition, mark, scene, runtime, focus, and tooltip-model types                                                                                                                                                      |
| `@tanstack/charts/vector`               | `vector`                                                                                                                                                                                                                        |
| `@tanstack/charts/view`                 | `composeViews`, `fill`, `grid`, `layer`, `inset`, scale-link helpers, `viewGrid`, and view composition types                                                                                                                    |
| `@tanstack/charts/violin`               | `violinY`, `violinX`, `ViolinYOptions`, `ViolinXOptions`, `ViolinPosition`, `ViolinYCurve`, and `ViolinXCurve`                                                                                                                  |
| `@tanstack/charts/waffle`               | `waffleY`, `waffleX`, `WaffleOptions`, `WaffleYOptions`, and `WaffleXOptions`                                                                                                                                                   |

Import from the narrowest stable entry point when bundle isolation matters.
Do not import internal source files.

<a id="source-charts-docs-reference-types-md"></a>

## Types

Source: `charts:docs/reference/types.md`.

TanStack Charts is inference-first. A mark's source data and channel selectors
flow through its definition into scales, axis formatters, host and adapter
callbacks, focus callbacks, and selection callbacks. Normal application code
should not cast chart definitions or supply adapter generics.

Browser applications can import types from the package root. Platform-neutral
libraries can import the same definition, mark, scene, runtime, focus, and
tooltip-model contracts from `@tanstack/charts/types`; DOM host and renderer
types remain available from the root.

### Callback shape

Public callbacks take at most two arguments: primary data or purpose first,
then a named context or options object. A callback without a distinct primary
payload takes one context object. Standard comparators, exact upstream
protocols, paired geometry, and consumer-called service methods are explicit
exceptions.

### Values and channels

```ts
type ChartValue = number | string | Date
type ChartKey = string | number

interface ChannelAccessorContext<TDatum> {
  index: number
  data: readonly TDatum[]
}

type ChannelAccessor<TDatum, TValue> = (
  datum: TDatum,
  context: ChannelAccessorContext<TDatum>,
) => TValue

type Channel<TDatum, TValue> =
  ChannelField<TDatum, TValue> | ChannelAccessor<TDatum, TValue>

type VisualChannel<TDatum, TValue> = TValue | ChannelAccessor<TDatum, TValue>
```

The corresponding public type names are `Channel`, `ChannelAccessor`,
`ChannelAccessorContext`, and `VisualChannel`.

A `Channel` accepts only datum keys whose declared values are compatible with
the channel, or an accessor that derives a value from the row. Its context
contains the index and full readonly data array. A `VisualChannel` replaces
the field-name form with a constant: it accepts either one constant value or
an accessor.

```ts
import { lineY } from '@tanstack/charts'

interface Row {
  date: Date
  value: number
  label: string
  series: 'actual' | 'forecast'
}

lineY(rows, {
  x: 'date', // Date
  y: 'value', // number
  z: 'series',
  stroke: (row) => (row.series === 'actual' ? '#2563eb' : '#60a5fa'),
})
```

`ChannelField`, `ChannelOutput`, `OptionChannelOutput`,
`WidenChartValue`, and `ChartAxisValue` are exported for extension authors.
Literal chart values widen to their semantic primitive so a literal row does
not produce an unusably narrow scale or callback type.

### Inference path

```text
source datum
  → mark channel outputs
  → ChartMark point and scale value types
  → ChartSpec axis requirements and definition datum/x/y unions
  → axis scale and formatter types
  → host and adapter callback types
```

Marks in one chart may have different datum types. The definition exposes their
union. TypeScript narrowing is therefore required when a callback handles
heterogeneous layers.

`ChartMarkScaleX` and `ChartMarkScaleY` also control the chart shape. A
materialized scale value makes that axis required. `never` makes it optional
and null-only, so positionless and one-dimensional charts do not carry phantom
scale configuration.

Rect and custom interval marks can distinguish materialized scale values from
interaction point values. The exported extractors are:

`ChartMarkDatum`, `ChartSpecDatum`, `ChartSpecXValue`, and `ChartSpecYValue`
are available from the root entry point. The four `ChartMarkPoint*` and
`ChartMarkScale*` extractors below come from the exceptional
`@tanstack/charts/mark/scale-values` subpath.

| Type                     | Extracts                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `ChartMarkDatum<TMark>`  | Original datum                                                                                 |
| `ChartMarkPointX<TMark>` | Interaction x value; exported from `@tanstack/charts/mark/scale-values`                        |
| `ChartMarkPointY<TMark>` | Interaction y value; exported from `@tanstack/charts/mark/scale-values`                        |
| `ChartMarkScaleX<TMark>` | All x values materialized for scale typing; exported from `@tanstack/charts/mark/scale-values` |
| `ChartMarkScaleY<TMark>` | All y values materialized for scale typing; exported from `@tanstack/charts/mark/scale-values` |
| `ChartSpecDatum<TSpec>`  | Datum union across marks                                                                       |
| `ChartSpecXValue<TSpec>` | Interaction x union across marks                                                               |
| `ChartSpecYValue<TSpec>` | Interaction y union across marks                                                               |

`ChartMarkX` and `ChartMarkY` remain exported as deprecated aliases of the
point extractors. New code should use the explicit names.

Stateful mark presentation uses `ChartMarkStateContext` as one object bag for
the datum, index, data, point, focus, pointer, and matching helper. A
`ChartMarkStateSelector` handles the common declarative cases, while callbacks
can return any `ChartMarkStateValue`. `ChartMarkStateStyle` is the complete
style vocabulary; `ChartDotStateStyle`, `ChartBarStateStyle`,
`ChartRectStateStyle`, `ChartLineStateStyle`, `ChartAreaStateStyle`, and
`ChartTextStateStyle` narrow it to properties each mark can render.

### Definitions

| Type                                  | Purpose                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `ChartSpec`                           | Marks plus conditionally required axes, guides, color, resources, and layout  |
| `StaticChartDefinition`               | A directly compilable spec with inferred datum and semantic x/y phantom types |
| `ResponsiveChartDefinition`           | Responsive chart builder                                                      |
| `ChartDefinition`                     | Static or responsive union                                                    |
| `ChartDefinitionForTooltipHost`       | Definition restricted to one tooltip host brand                               |
| `DomChartDefinition`                  | Definition compatible with the DOM tooltip host                               |
| `ComposableStaticChartDefinition`     | Static definition safe to embed in a composed view                            |
| `ComposableResponsiveChartDefinition` | Responsive definition safe to embed in a composed view                        |
| `ComposableChartDefinition`           | Static or responsive composable definition                                    |
| `ChartBuildContext`                   | Current size and platform-default build-time theme                            |

The complete overloads and runtime rules are in
[Chart Definition API](./specifications-types.md#source-charts-docs-reference-chart-definitions-md).

### Marks and scenes

| Type                               | Purpose                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `ChartMark`                        | Public initialized-mark factory plus inferred point and scale types           |
| `MarkInitializeContext`            | Mark layer index                                                              |
| `InitializedMark`                  | Stable ID, channels, viewport ownership, render, and optional resolved layout |
| `MarkInitialization`               | Direct-render or resolved-layout initializer result                           |
| `ResolvedLayoutMarkInitialization` | Layout initializer before `createMark` normalization                          |
| `MaterializedChannel`              | Values contributed to an optional named scale                                 |
| `MarkRenderContext`                | Final chart bounds, scales, theme, color resolver, and layout                 |
| `MarkResolvedLayoutContext`        | Final positional scales and bounds for pure mark-local layout                 |
| `ResolvedMarkLayout`               | Final channels, labels, states, and render closure from resolved layout       |
| `MarkScene`                        | Mark-owned nodes plus optional interaction points, focus anchors, and guides  |
| `MarkFocusGuide`                   | Mark-emitted focus guide with optional placement                              |
| `ChartScene`                       | Complete renderer-neutral output                                              |
| `ChartPoint`                       | Typed interaction target                                                      |
| `ChartFocusAnchor`                 | Focus-filter identity that does not participate in hit testing                |
| `SceneFocusGuide`                  | Data-less guide descriptor resolved against focus or cursor state             |
| `SceneFocusGuideAxis`              | One crosshair axis rule or categorical band, plus an optional label           |
| `SceneFocusGuideBand`              | Resolved categorical bandwidth, inset, radius, and paint                      |
| `SceneFocusGuideLabel`             | Focus-guide label formatter, spacing, font, and paint                         |
| `SceneFocusGuideMarker`            | Focus-guide intersection marker geometry and paint                            |
| `SceneFocusGuideResolveContext`    | Scene, guide, local focus, pointer, and cursor passed to a guide resolver     |
| `SceneFocusGuideResolver`          | Optional-guide policy that returns one transient scene node                   |
| `ChartFocusPresentation`           | Transient renderer-neutral underlay and overlay nodes                         |
| `SceneInteraction`                 | Semantic point or points attached to a rendered scene primitive               |
| `ChartTick`                        | Semantic value, formatted label, and pixel position                           |
| `ResolvedScale`                    | Final positional scale                                                        |
| `ResolvedColorScale`               | Final color scale                                                             |

Scene geometry and interaction point fields are documented in
[Runtime and scene](./runtime-scales-reference.md#source-charts-docs-reference-runtime-and-scene-md).

### Scene-node types

`SceneNode` is the union of:

- `SceneGroup`
- `SceneRule`
- `ScenePolyline`
- `SceneArea`
- `SceneDot`
- `SceneRect`
- `SceneLabel`

`ScenePolygonRing` is one closed boundary. `ScenePolygon` is an exterior ring
followed by zero or more holes; `SceneArea.polygons` can contain several
disconnected polygons. `SceneStyle` is shared presentation. `ChartSize`,
`ChartBounds`, `ChartMargin`, `ChartLayoutOptions`, `ChartTextTypography`,
`ChartTextMeasurer`, `ChartTextMeasureOptions`, and `ChartTextMetrics` describe
scene and text geometry. Typography includes family, style, stretch, letter
spacing, direction, locale, and host font scale.

See [Scene nodes](./runtime-scales-reference.md#source-charts-docs-reference-runtime-and-scene-md).

### Scale, guide, color, and theme types

| Type                            | Purpose                                                               |
| ------------------------------- | --------------------------------------------------------------------- |
| `ChartAxisOptions`              | Required positional scale and optional guide behavior                 |
| `ChartAxisViewportOptions`      | Continuous semantic window and transient pixel translation            |
| `ChartAxisGuideOptions`         | Guide behavior without the scale field                                |
| `ChartAxisPresentationOptions`  | Axis line, ticks, tick labels, and title presentation                 |
| `ChartAxisTickOptions`          | Candidate values, density, formatting, size, and padding              |
| `ChartAxisTickLabelOptions`     | Per-candidate typography, anchor, offset, rotation, and thinning      |
| `ChartAxisTickLabelContext`     | Semantic value, stable candidate index, pixel position, and bandwidth |
| `ChartAxisTickLabelValue`       | Constant or context accessor for one tick-label property              |
| `ChartAxisTickLabelThinOptions` | Minimum gap, end priority, and labels that must be kept               |
| `ChartAxisLabelOptions`         | Axis title text and explicit or measured offset                       |
| `ChartScaleFactory`             | Creates a positional scale with a mark-inferred domain                |
| `ChartScaleInput`               | Factory or configured positional scale instance                       |
| `InferableScaleLike`            | Domain-configurable scale returned by a factory                       |
| `ConfiguredScaleLike`           | Callable, copyable positional scale contract                          |
| `ChartNumericScale`             | Radius mapper, configured instance, or inferred factory spec          |
| `ChartNumericScaleOptions`      | Inferred or configured radius scale with optional nicening            |
| `ChartScale`                    | Custom positional scale extension                                     |
| `ChartScaleResolveContext`      | Values, responsive range, guide options, and hints                    |
| `ChartScaleResolver`            | Function form of custom scale resolution                              |
| `ChartContinuousValue`          | Numeric or Date value accepted by an axis viewport                    |
| `ChartContinuousDomain`         | Homogeneous numeric or Date viewport endpoint tuple                   |
| `ResolvedScaleViewport`         | Content domain, committed window, and presented mapper                |
| `ChartColorOptions`             | Factory, configured/custom color scale, hints, and legend             |
| `ChartColorScaleFactory`        | Creates a color scale with a channel-inferred domain                  |
| `ConfiguredColorScaleLike`      | Callable and copyable color scale contract                            |
| `InferableColorScaleLike`       | Domain-configurable color scale returned by a factory                 |
| `ChartColorScale`               | Custom color scale extension                                          |
| `ChartColorScaleContext`        | Observed values, hints, and theme                                     |
| `ResolvedColorScale`            | Resolved mapping and optional stepped legend boundaries               |
| `ResolvedColorScaleKind`        | Categorical, continuous, quantile, quantize, or threshold             |
| `ChartColorLegend`              | Legend layout and scene rendering                                     |
| `ChartColorLegendContext`       | Resolved colors, chart bounds, theme, and width                       |
| `CrosshairOptions`              | Data-less x/y guides, marker, style, and motion options               |
| `CrosshairRuleOptions`          | Stroke shared by both crosshair axes or overridden per axis           |
| `CrosshairAxisOptions`          | Per-axis rule or categorical band with an optional label              |
| `CrosshairBandOptions`          | Categorical cursor-band inset, radius, fill, stroke, and opacity      |
| `CrosshairLabelOptions`         | Guide label formatting, spacing, text, and halo paint                 |
| `CrosshairMarkerOptions`        | Primary-coordinate marker geometry and paint                          |
| `ChartTheme`                    | Foreground, muted, grid, background, and palette                      |
| `ChartLinearGradient`           | Named linear-gradient resource                                        |
| `ChartGradientStop`             | Gradient offset, color, and optional opacity                          |
| `ChartCurve`                    | Line and y-area path generation                                       |

See [Scales, guides, and color](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md).

`crosshair<TXValue, TYValue>` carries the semantic axis types into each
`CrosshairLabelOptions<TValue>.format` callback. `CrosshairBandOptions` replaces
one axis rule with plot-spanning geometry derived from the resolved categorical
scale bandwidth; zero-bandwidth axes emit no band.

### Host and runtime types

| Type                             | Purpose                                                             |
| -------------------------------- | ------------------------------------------------------------------- |
| `ChartHostCommonOptions`         | Accessibility, sizing, callbacks, and SVG renderer options          |
| `ChartHostOptions`               | Common options plus a chart definition                              |
| `ChartHost`                      | SVG host `interaction`, `update`, `getScene`, and `destroy`         |
| `ChartRendererHostCommonOptions` | Renderer-neutral common options plus required renderer              |
| `ChartRendererHostOptions`       | Renderer-neutral options plus a chart definition                    |
| `ChartRendererHost`              | Renderer-neutral `interaction`, `update`, `getScene`, and `destroy` |
| `ChartRuntime`                   | Repeated static or responsive scene rendering                       |
| `ChartRuntimeOptions`            | Platform theme shared by responsive building and scene compilation  |
| `ChartRenderContext`             | Container, live SVG, scene, and interaction controller              |
| `ChartRendererRenderContext`     | Container, live surface, scene, and interaction controller          |

See [DOM host](./rendering-composition-reference.md#source-charts-docs-reference-dom-host-md) and
[Runtime and scene](./runtime-scales-reference.md#source-charts-docs-reference-runtime-and-scene-md).

### Focus and tooltip types

| Type                                  | Purpose                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `ChartFocusStrategy`                  | Pointer resolution, grouping, and keyboard ordering                      |
| `ChartFocusResolveContext`            | Pointer coordinates and maximum focus distance                           |
| `ChartFocusGroupContext`              | Point being grouped or restored                                          |
| `ChartFocusPreset`                    | Built-in nearest and grouped axis focus names                            |
| `ChartFocusMode`                      | Focus preset or custom strategy                                          |
| `ChartFocusState`                     | Primary, group, source, and pinned interaction state                     |
| `ChartFocusSource`                    | Pointer, keyboard, programmatic, or restored source                      |
| `ChartFocusFilter`                    | Focus-filtered mark matching configuration                               |
| `ChartFocusMatch`                     | Primary, group, key, x, y, or series matching                            |
| `ChartFocusAffinity`                  | Primitive fallback axis after exact geometry containment                 |
| `ResolvedFocusScene`                  | Scene plus whether retargetable focus geometry was materialized          |
| `ChartInteractionController`          | Resolves client pointers and paints application-owned focus              |
| `ChartPointerResolution`              | Scene position, primary point, and resolved focus group                  |
| `ChartControlledFocusOptions`         | Source and sticky-tooltip state for controlled focus                     |
| `ChartCursorController`               | Observable application-owned cursor state                                |
| `ChartCursorState`                    | Scene-, normalized-, or semantic-value-anchored cursor                   |
| `ChartCursorStateUpdater`             | Cursor state, null, or a previous-state updater function                 |
| `ChartCursorCoordinates`              | One or both coordinates in one coordinate space                          |
| `ChartCursorValues`                   | One or both semantic axis values                                         |
| `ChartCursorPointIdentity`            | Host-local key, mark, and datum-index cursor tie-breaker                 |
| `ChartCursorExtensionToken`           | Environment-neutral contract implemented by cursor host extensions       |
| `ChartCursorBinding`                  | Focus-snapped or free definition binding                                 |
| `ChartFocusCursorBinding`             | Semantic datum-focus cursor options                                      |
| `ChartFreeCursorBinding`              | Free coordinate cursor with resolved inversion and axis overrides        |
| `ChartCursorAxisContext`              | Scene, position, normalized position, and axis given to `valueAt`        |
| `ChartCursorAxisOptions`              | Optional free-cursor `valueAt` override for one axis                     |
| `ChartCursorAxisPresentation`         | Host-local position, normalized position, and optional semantic value    |
| `ChartCursorPresentation`             | Host-local projection of shared cursor state into one chart              |
| `ChartCursorHostExtension`            | Platform-neutral cursor lifecycle and projection implementation          |
| `ChartCursorHostSession`              | One binding's ownership-safe host cursor session                         |
| `ChartSpatialIndex`                   | Nearest-point query                                                      |
| `ChartSpatialIndexFactory`            | Builds an index from current scene points and resolved scene             |
| `ChartSpatialIndexFactoryContext`     | Resolved scene supplied to an index factory                              |
| `ChartSelectionSource`                | Pointer or keyboard origin for a controlled selection change             |
| `ChartSelectionController`            | Definition-owned point activation and clear contract                     |
| `ChartControl`                        | Final-scale interaction behavior placed on a definition                  |
| `ChartControlContext`                 | Final plot, scales, colors, theme, and surface size                      |
| `ChartControlScene`                   | Renderer-neutral fallback nodes and optional host controls               |
| `ChartExtensionInput`                 | Generic bare-token or `{ use, ...options }` extension input              |
| `ChartTooltipInput`                   | Tooltip extension token or configured extension options                  |
| `ChartTooltipExtensionToken`          | Environment-neutral contract implemented by host tooltip extensions      |
| `ChartTooltipExtension`               | Tooltip lifecycle implementation                                         |
| `ChartTooltipExtensionContext`        | Container, dismissal, and adapter-body bridge given to a tooltip         |
| `ChartTooltipExtensionInstance`       | Tooltip update, paint, hide, containment, and destroy lifecycle          |
| `ChartTooltipPaintContext`            | Focus, points, scene, surface, pointer, and pinned state                 |
| `ChartTooltipOptions`                 | Built-in tooltip content, ordering, anchoring, visibility, and pinning   |
| `ChartTooltipPortalInput`             | Portal extension token or configured transport options                   |
| `ChartTooltipPortalExtensionToken`    | Environment-neutral contract implemented by host portal extensions       |
| `ChartTooltipPortalExtension`         | Tooltip transport lifecycle implementation                               |
| `ChartTooltipPortalExtensionContext`  | Container, tooltip element, and reposition callback given to a portal    |
| `ChartTooltipPortalExtensionInstance` | Portal update, position, hide, and destroy lifecycle                     |
| `ChartTooltipPortalOptions`           | Reserved configuration object for portal extensions                      |
| `ChartTooltipPortalPositionContext`   | Scene, surface, anchor, placement, and offset for viewport positioning   |
| `ChartTooltipItem`                    | Ordered channel, datum-field, or derived point row                       |
| `ChartTooltipItemBase`                | Shared label and point-text contract for object items                    |
| `ChartTooltipChannelItem`             | Configured x, y, or group row                                            |
| `ChartTooltipDatumItem`               | Scalar datum-field row                                                   |
| `ChartTooltipDerivedItem`             | Row derived from the complete focused point                              |
| `ChartTooltipSort`                    | Group row ordering                                                       |
| `ChartTooltipAnchor`                  | Preset, independent axis coordinates, or custom scene anchor             |
| `ChartTooltipAxisAnchor`              | Independent x and y anchor sources                                       |
| `ChartTooltipXAnchor`                 | Point, pointer, value, group, or plot x source                           |
| `ChartTooltipYAnchor`                 | Point, pointer, value, group, or plot y source                           |
| `ChartTooltipAnchorContext`           | Focus, pointer, plot, surface, and resolved scales                       |
| `ChartTooltipPlacement`               | Tooltip box placement around its anchor                                  |
| `ChartTooltipPosition`                | Scene-pixel x/y coordinate                                               |
| `ChartDefinitionOptions`              | Focus, selection, controls, cursor, tooltip, and host interaction policy |
| `ResponsiveChartConfig`               | Responsive builder plus definition-owned interaction policy              |
| `ChartTooltipContent`                 | Safe title and row model for a built-in tooltip                          |
| `ChartTooltipRow`                     | Label, formatted value, and optional color swatch                        |
| `ChartTooltipContentContext`          | Pinned state, axis labels, and value formatters for tooltip callbacks    |
| `ChartTooltipBodyContext`             | Focused points, content, pinned state, and dismissal                     |
| `ChartTooltipBodyTarget`              | Renderer-adapter body mount element plus body context                    |
| `TooltipBounds`                       | Host-local tooltip placement boundary                                    |
| `TooltipSize`                         | Measured host-local tooltip dimensions                                   |

Host adapters share `sameChartPointIdentity`, `restoreChartFocusPoint`,
`resolveMarkStateScene`, `orderChartTooltipPoints`,
`createChartTooltipContent`, `resolveChartTooltipAnchor`,
`resolveChartTooltipPlacement`, and `formatChartTooltipValue` instead of
reimplementing focus restoration or tooltip policy.

`ChartCursorState.origin` optionally carries a `ChartCursorPointIdentity` when
a focus host publishes one of several points with equal semantic values. A
consumer matches its stable key and mark first, then uses the datum index only
to disambiguate duplicate keys. If that key and mark do not exist locally, the
consumer resolves from the portable semantic `value` and preferred `group` as
usual.

See [Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).

### Rendering types

| Type                        | Purpose                                                                        |
| --------------------------- | ------------------------------------------------------------------------------ |
| `RenderChartOptions`        | Renderer-neutral accessible name, description, class, tab index, and ID prefix |
| `RenderChartSvgOptions`     | SVG specialization of `RenderChartOptions`                                     |
| `ChartSurfaceRenderOptions` | Render options plus optional animation                                         |
| `ChartSurface`              | Mounted element, painting, coordinates, focus, and cleanup                     |
| `ChartRenderer`             | Server shell and browser-surface renderer contract                             |
| `ChartSvgRenderer`          | Scene-to-SVG string function                                                   |
| `ChartAnimationOptions`     | Duration, easing, and reduced-motion policy                                    |

See [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).

### Capability-specific types

Types tied to optional capabilities are documented with the API that owns
their behavior:

- `@tanstack/charts/adapter`: `ChartAdapter`, `ChartAdapterLayout`, and
  `ChartAdapterLayoutOptions`. See
  [Adapter controller](./rendering-composition-reference.md#source-charts-docs-reference-adapter-controller-md).
- `@tanstack/charts/canvas`: `CanvasChartRendererOptions`,
  `CanvasChartRenderer`, `CanvasChartSurface`, `CanvasChartHostOptions`, and
  `CanvasChartHost`. See
  [Canvas renderer](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).
- `@tanstack/charts/cursor`: `ChartCursorController`, cursor state and
  coordinate types, `createChartCursor`, and `cursorHost`. See
  [Controlled cursors](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/cursor/host`: `ChartCursorHostExtension`,
  `ChartCursorHostSession`, and the platform-neutral cursor lifecycle,
  projection, focus, and presentation helpers. See
  [Controlled cursors](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/export`: `SerializeChartSvgOptions` and
  `RenderChartImageOptions`. See [SVG
  serialization](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md) and [browser
  image export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).
- `@tanstack/charts/geo`: `GeoProjectionContext`, `GeoProjectionDescriptor`,
  `GeoProjectionInput`, and `GeoShapeOptions`. See
  [Geo shape](./marks-spatial.md#source-charts-docs-reference-marks-geo-md).
- `@tanstack/charts/hierarchy/sunburst`: `SunburstNode`,
  `SunburstNodeComparator`, `SunburstPathOptions`, `SunburstParentOptions`, and
  `SunburstOptions`. See [Sunburst](./marks-composite.md#source-charts-docs-reference-marks-sunburst-md).
- `@tanstack/charts/hierarchy/treemap`: `TreemapMethod`, `TreemapTileDatum`,
  `TreemapTile`, `TreemapNode`, `TreemapNodeComparator`,
  `TreemapPathOptions`, `TreemapParentOptions`, and `TreemapOptions`. See
  [Treemap](./marks-composite.md#source-charts-docs-reference-marks-treemap-md).
- `@tanstack/charts/network/force`: built-in descriptor types,
  `ForceFactoryDescriptor`, `ForceFactory`, `ForceFactoryContext`, working
  clone types, settled node/link result types, and lineage types. See
  [Static force layouts](./rendering-composition-reference.md#source-charts-docs-reference-transforms-md).
- `@tanstack/charts/network/sankey`: `SankeyAlignment`,
  `SankeyAlignmentNode`, `SankeyNodeAligner`, `SankeyInset`,
  `SankeyLayoutValue`, `SankeyEndpointContext`, `SankeyNodeContext`,
  `SankeyLinkContext`, `SankeyNode`, `SankeyLink`, `SankeyDiagramContext`,
  `SankeyNodeComparator`, `SankeyLinkComparator`, and `SankeyDiagramOptions`.
  See [Sankey diagram](./marks-composite.md#source-charts-docs-reference-marks-sankey-md).
- `@tanstack/charts/selection`: `KeyedSelectionChange`,
  `KeyedSelectionKeyContext`, `KeyedSelectionOptions`, and `KeyedSelection`. See
  [Controlled keyed selection](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/focus/guide`: `FocusGuideLabelFormatContext` and focus-guide
  option types. See [Focus guide](./marks-spatial.md#source-charts-docs-reference-marks-focus-guide-md).
- `@tanstack/charts/interaction/signal`: `ControlledSignal` and
  `ControlledSignalChangeContext`. See
  [Controlled signals](./interaction-accessibility.md#source-charts-docs-guides-interactions-and-selections-md).
- `@tanstack/charts/legend`: `InteractiveColorLegendItemContext` and legend
  option/change types. See
  [Interactive categorical legend](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md).
- `@tanstack/charts/interaction/brush`: `BrushRange`, `BrushXChange`,
  `BrushXSource`, `BrushXTarget`, `BrushXValuesOptions`, and
  `BrushXContinuousOptions`. See
  [Horizontal brush](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/interaction/cursor`: `ContinuousCursorValue`,
  `ContinuousCursorPosition`, `ContinuousCursorPointerSource`,
  `ContinuousCursorSource`, `ContinuousCursorChange`,
  `ContinuousCursorRuleOptions`, `ContinuousCursorMarkerOptions`,
  `ContinuousCursorLabelOptions`, and `ContinuousCursorOptions`. See
  [Continuous cursor](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/interaction/zoom`: `ZoomXValue`, `ZoomXWindow`,
  `ZoomXSource`, `ZoomXAction`, `ZoomXChange`, and `ZoomXOptions`. See
  [Horizontal zoom](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/polar`: `PolarOptions`, `PolarMark`, `PolarGuide`,
  `PolarGuideScene`, `PolarAngleOptions`, `PolarRadiusOptions`,
  `PolarResolvedScale`, `PolarLayoutContext`, `PolarLength`,
  `PolarGuideLabelContext`, `PolarGuideLabelOption`, `RadialArcOptions`,
  `RadialBarRadiusOptions`, `RadialBarAngleOptions`, `RadialLineOptions`,
  `RadialAreaOptions`, `RadialDotOptions`, `RadialTextOptions`,
  `RadialRuleOptions`, `RadialGridOptions`, and `AngleGridOptions`. See
  [Polar marks](./marks-spatial.md#source-charts-docs-reference-marks-polar-md).

### Mark option types

Every built-in mark exports its options type from the root and its granular
subpath:

- `LineYOptions`, `AreaYOptions`, `AreaXOptions`, `AreaXCurve`
- `BarYOptions`, `BarXOptions`
- `BandXOptions`, `BandYOptions`
- `DotOptions`, `HexagonOptions`
- `RectOptions`, `CellOptions`
- `RuleXOptions`, `RuleYOptions`
- `CrosshairOptions`, `CrosshairRuleOptions`, `CrosshairAxisOptions`,
  `CrosshairBandOptions`, `CrosshairLabelOptions`, `CrosshairMarkerOptions`
- `LinkOptions`, `ArrowOptions`, `VectorOptions`, `VectorAnchor`
- `TickXOptions`, `TickYOptions`
- `TextOptions`, `TextAnchor`
- `FrameOptions`
- `FacetOptions`, `FacetAxes`, `FacetChartContext`
- `ColorLegendOptions`, `ColorGradientLegendOptions`

Their public fields and defaults are owned by the
[mark reference](./specifications-types.md#source-charts-docs-reference-index-md) and
[legend reference](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md).

### Correcting a type error

When a normal chart requires `as`, first check:

1. Is the row interface accurate, including nullable values?
2. Is the selected field compatible with the mark channel?
3. Does the configured scale domain accept the inferred semantic value?
4. Does the definition capture values with their exact application types?
5. Are mixed mark datum or value unions being narrowed honestly?
6. Is a custom mark declaring its datum and point values at `createMark`?

Use an assertion only at a genuinely unchecked external boundary. Do not cast
the definition or framework props to bypass a mismatch.
