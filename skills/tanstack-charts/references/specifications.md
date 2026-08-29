# Specifications

Chart definitions, specifications, and reference index.

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
  scales: {
    x: { scale: scaleUtc },
    y: { scale: scaleLinear, nice: true, grid: true },
  },

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
    scales: {
      x: { scale: scaleBand },
      y: {
        scale: scaleLinear,
        nice: true,
        axis: { ticks: { count: width < 480 ? 4 : 7 } },
        grid: true,
      },
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
    scales: {
      x: {
        scale: scaleLinear,
        nice: true,
        axis: { ticks: { count: width < 480 ? 4 : 7 } },
      },
      y: {
        scale: () => scaleBand().padding(0.1),
      },
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
  scales: ChartScales<TMarks>
  guides?: boolean
  color?: ChartColorOptions
  gradients?: readonly ChartLinearGradient[]
  clip?: boolean
  margin?: number | Partial<ChartMargin>
  theme?: Partial<ChartTheme>
}

type ChartScales<TMarks extends readonly ChartMark[]> = Readonly<
  Record<string, ChartPositionScaleOptions | null>
> & {
  x: ChartPositionScaleOptions | null
  y: ChartPositionScaleOptions | null
}
```

### Properties

| Property    | Required | Meaning                                                                                                            |
| ----------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `marks`     | Yes      | Ordered mark layers. Later scene nodes paint after earlier ones.                                                   |
| `scales`    | Yes      | Cartesian scale registry. Reserved `x` and `y` entries are required; additional named scales are optional.         |
| `guides`    | No       | Set to `false` to suppress both axes, grid lines, titles, and their implicit margins.                              |
| `color`     | No       | Shared categorical or quantitative color scale and optional legend.                                                |
| `gradients` | No       | Linear-gradient resources consumed by the default SVG and Canvas renderers.                                        |
| `clip`      | No       | Clips the marks group to the resolved inner chart bounds in the default SVG and Canvas renderers.                  |
| `margin`    | No       | Locks all margins with a number or selected sides with a partial object. Omitted sides are measured automatically. |
| `theme`     | No       | Overrides default foreground, muted, grid, background, or palette tokens.                                          |

The detailed option contracts live in
[Scales, guides, and color](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md). Mark-specific
channels and defaults live in the [mark reference](./specifications.md#source-charts-docs-reference-index-md).

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
  scales: {
    x: { scale: scaleUtc },
    y: { scale: scaleLinear, grid: true },
  },
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

Built-in Cartesian, radial, and composite marks accept an optional
`renderer`. Passing `canvasChartRenderer` opts that mark into Canvas while
marks without the option, including ordinary axes and guides, keep the host
renderer. The host groups adjacent runs without changing declaration order.
See [Mark-level renderers](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).

### Required positional scales

`scales.x` and `scales.y` are required. Supply a compatible factory for an
inferred domain or a configured instance for a fixed domain:

```ts
const scales = {
  x: { scale: scaleUtc },
  y: { scale: scaleLinear },
}
```

Use `null` for an unused dimension:

```ts
const horizontalThresholds = defineChart({
  marks: [ruleY([25, 50, 75])],
  scales: {
    x: null,
    y: { scale: scaleLinear().domain([0, 100]) },
  },
})
```

`axis: false` hides an axis but does not remove its scale. A `null` entry says
that the scale does not exist. Scene compilation rejects a mark bound to a
missing scale.

Additional entries name independent mappings. Each named entry declares its
`channel`, and marks opt into it with `xScale` or `yScale`. See
[Named scales and multiple axes](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md).

### Guides and margins

Guide visibility and geometry are separate:

- `scales.x.axis: false` or `scales.y.axis: false` hides one axis.
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
  scales: { x, y },
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
| Object and responsive definitions                           | [Chart Definition API](./specifications.md#source-charts-docs-reference-chart-definitions-md)            |
| The `ChartSpec` object                                      | [Chart spec](./specifications.md#source-charts-docs-reference-chart-spec-md)                             |
| Positional scales, axes, color, legends, and gradients      | [Scales, guides, and color](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md) |
| Vanilla DOM mounting and responsive sizing                  | [DOM host](./rendering-composition-reference.md#source-charts-docs-reference-dom-host-md)                                 |
| Framework prerender, mount, update, and layout lifecycle    | [Adapter controller](./rendering-composition-reference.md#source-charts-docs-reference-adapter-controller-md)             |
| Responsive scene compilation and runtime behavior           | [Runtime and scene](./runtime-scales-reference.md#source-charts-docs-reference-runtime-and-scene-md)               |
| Eager row, hierarchy, and static force transforms           | [Data transforms](./rendering-composition-reference.md#source-charts-docs-reference-transforms-md)                        |
| Pointer focus, keyboard navigation, tooltips, and selection | [Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md)       |
| SVG, Canvas, custom rendering, reconciliation, and export   | [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md)         |
| Optional tween and spring motion                            | [Motion](./interaction-motion-reference.md#source-charts-docs-reference-motion-md)                                     |
| Custom marks, renderers, scales, and indexes                | [Custom extensions](./rendering-composition-reference.md#source-charts-docs-reference-custom-extensions-md)               |
| Public generic and scene types                              | [Types](./types.md#source-charts-docs-reference-types-md)                                       |

### Mark reference

Built-in Cartesian, radial, and composite marks accept
`renderer?: ChartMarkRenderer`. Pass `canvasChartRenderer` from
`@tanstack/charts/canvas` to opt that mark into Canvas while the rest of the
chart keeps its host renderer.

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

Every default `Chart` starts with SVG and can opt selected marks into Canvas.
React and Octane also provide `/canvas` entries for a completely Canvas chart
and `/core` entries that require an explicit `ChartRenderer`.

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
| `@tanstack/charts/motion`               | `motion`, `stagger`, `ChartMotionOptions`, and renderer-neutral motion types                                                                                                                                                    |
| `@tanstack/charts/motion/definition`    | Isolated `stagger` and `ChartMotionStaggerOptions` without the renderer or spring solver                                                                                                                                        |
| `@tanstack/charts/network/force`        | `forceLayout`, built-in descriptors, named D3-compatible force factories, private working-clone context, settled node/link result, and lineage types                                                                            |
| `@tanstack/charts/network/sankey`       | `sankeyDiagram`, shorthand and callable alignment types, responsive layout options, immutable node/link values, comparator contexts, and lineage types                                                                          |
| `@tanstack/charts/polar`                | `pie`, `polar`, `focusGroupAngle`, `radialArc`, `radialBarRadius`, `radialBarAngle`, other radial marks, and radial/angle guides                                                                                                |
| `@tanstack/charts/universal`            | Common root authoring, runtime, scene, and static SVG values without browser hosts or adapters                                                                                                                                  |
| `@tanstack/charts/reconcile`            | `reconcileChartSvg`, `reconcileChartSvgFragment`                                                                                                                                                                                |
| `@tanstack/charts/rect`                 | `rect`, `cell`                                                                                                                                                                                                                  |
| `@tanstack/charts/renderer`             | `mountChartRenderer` and `resolveChartRenderer`                                                                                                                                                                                 |
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
