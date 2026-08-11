# Runtime and scales reference

Runtime, scene, scales, guides, and color reference.

<a id="source-charts-docs-reference-runtime-and-scene-md"></a>

## Runtime And Scene

Source: `charts:docs/reference/runtime-and-scene.md`.

TanStack Charts separates semantic chart construction from rendering:

1. a definition produces a [chart spec](./specifications-types.md#source-charts-docs-reference-chart-spec-md)
2. marks materialize channels
3. scales and guide layout resolve against the current size
4. marks emit a keyed `ChartScene`
5. the selected SVG, Canvas, or custom renderer consumes that scene

Use `createChartRuntime` for repeated renders of object or responsive
definitions.
Use `createChartScene` for one static compilation.

### `createChartRuntime`

```ts
import { createChartRuntime } from '@tanstack/charts/runtime'

const runtime = createChartRuntime<Row, Date, number>({
  defaultTheme: platformTheme,
})
const scene = runtime.render(definition, {
  width: 800,
  height: 400,
})

runtime.destroy()
```

```ts
function createChartRuntime<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(options?: ChartRuntimeOptions): ChartRuntime<TDatum, TXValue, TYValue>
```

`ChartRuntime.render` accepts a definition, size, and optional layout:

```ts
interface RuntimeRenderSignature {
  render(
    definition,
    size: { width: number; height: number },
    layout?: {
      measureText?: ChartTextMeasurer
      typography?: ChartTextTypography
    },
  ): ChartScene
}
```

Because a standalone runtime is created before its first `render` call, direct
use can supply datum, x-value, and y-value generics at the factory. DOM and
framework adapter hosts infer them from the definition.

#### Runtime behavior

The runtime does not cache application data. A responsive builder receives the
current surface size and the runtime's platform `defaultTheme` on every direct
render. The same default theme is applied before the authored definition theme
during final scene compilation. Framework adapters and application code own
definition memoization and asynchronous cleanup.

### `createChartScene`

```ts
import { createChartScene } from '@tanstack/charts/scene'

const scene = createChartScene(
  staticDefinition,
  { width: 800, height: 400 },
  { measureText, typography },
)
```

```ts
function createChartScene<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(
  definition: StaticChartDefinition<TDatum, TXValue, TYValue>,
  size: ChartSize,
  layout?: ChartLayoutOptions,
): ChartScene<TDatum, TXValue, TYValue>
```

`createChartScene` accepts static definitions only. It normalizes each scene
dimension to at least `1`, using `1` for a nonfinite value, resolves the theme,
initializes every mark, collects x, y, and color channels, resolves configured
scales, measures guides and legends, renders each mark once into the final
chart bounds, and returns a scene value.

It throws when a materialized positional channel has no scale. Omit dimensions
that no mark uses; explicit `null` is accepted only for an unused dimension.

### `defaultChartTheme`

```ts
import { defaultChartTheme } from '@tanstack/charts/scene'
```

The exported theme contains:

- `foreground: 'currentColor'`
- `muted: 'currentColor'`
- `grid: 'currentColor'`
- `background: 'transparent'`
- six CSS-variable-backed palette entries

Definitions merge partial overrides into this value. A supplied palette
replaces the default palette. See [Chart spec](./specifications-types.md#source-charts-docs-reference-chart-spec-md).

### `findNearestPoint`

```ts
import { findNearestPoint } from '@tanstack/charts/scene'

const point = findNearestPoint(scene, x, y, 48)
```

```ts
function findNearestPoint<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(
  scene: ChartScene<TDatum, TXValue, TYValue>,
  x: number,
  y: number,
  maxDistance?: number,
  points?: readonly ChartPoint<TDatum, TXValue, TYValue>[],
): ChartPoint<TDatum, TXValue, TYValue> | null
```

Coordinates are in scene pixels. `maxDistance` defaults to `Infinity`.
`points` defaults to `scene.points`. Supplying a candidate list restricts both
primitive-attached and anchor-only resolution to those exact point objects.
The function caches a paint-ordered interaction target list for the scene,
checks primitive containment first, and then applies each target's natural
axis or geometric affinity. Scene traversal accumulates group translation and
clipping, so the resolver and renderer consume the same post-layout tree.
Semantic points not attached to primitives retain legacy anchor distance. For
a large point set, supply a spatial index to the DOM or framework host; see
[Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).

### `viewportInteractionPoints`

```ts
import {
  findNearestPoint,
  viewportInteractionPoints,
} from '@tanstack/charts/scene'

const candidates = viewportInteractionPoints(scene, presentationPoints)
const point = findNearestPoint(scene, x, y, 48, candidates)
```

```ts
function viewportInteractionPoints<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(
  scene: ChartScene<TDatum, TXValue, TYValue>,
  points?: readonly ChartPoint<TDatum, TXValue, TYValue>[],
): readonly ChartPoint<TDatum, TXValue, TYValue>[]
```

`points` defaults to `scene.points`. With no active axis viewport, the helper
returns that list unchanged. Otherwise it removes off-window points only from
marks painted inside a viewport clip. Points from marks with fixed viewport
ownership remain available outside `scene.chart`. Pass a renderer's current
presentation points during motion so visibility and nearest-point resolution
use the same painted coordinates.

### `ChartScene`

```ts
interface ChartScene<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  width: number
  height: number
  margin: ChartMargin
  chart: ChartBounds
  nodes: readonly SceneNode[]
  points: readonly ChartPoint<TDatum, TXValue, TYValue>[]
  scales: Readonly<Record<string, ResolvedScale>>
  colors: ResolvedColorScale
  gradients: readonly ChartLinearGradient[]
  theme: ChartTheme
  focusGuides?: readonly SceneFocusGuide[]
}
```

| Property          | Meaning                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `width`, `height` | Full scene dimensions                                            |
| `margin`          | Resolved outer margins after guide and legend measurement        |
| `chart`           | Inner plot bounds with `x`, `y`, `width`, and `height`           |
| `nodes`           | Ordered renderer-neutral display tree                            |
| `points`          | Complete interaction set, including viewport-clipped points      |
| `scales`          | Resolved positional scales, normally under `x` and `y`           |
| `colors`          | Resolved chart color scale                                       |
| `gradients`       | Declared linear-gradient resources                               |
| `theme`           | Fully resolved theme                                             |
| `focusGuides`     | Optional data-less guide descriptors resolved from current focus |

`focusGuides` do not add nodes or points to the base scene. Every guide carries
a required resolver that receives its local focus, pointer, and cursor context
and returns one transient scene node or `undefined`. Surfaces pass the current
interaction state to `resolveFocusPresentation`, which calls those resolvers
and separates their nodes into underlays and overlays. A mark emits
`MarkFocusGuide`, whose optional placement defaults from mark order. The scene
compiler produces the final `SceneFocusGuide` values shown here with placement
resolved; renderers do not call guide resolvers or infer placement themselves.

### Scene nodes

Every scene node has a stable `key`, optional `className`, optional
`SceneStyle`, and optional `ariaHidden`. Geometric primitives may also attach
a `SceneInteraction`; groups and labels cannot.

| `kind`     | Geometry                                                            |
| ---------- | ------------------------------------------------------------------- |
| `group`    | `children`, optional translation and clip bounds                    |
| `rule`     | `x1`, `y1`, `x2`, `y2`                                              |
| `polyline` | point pairs and optional precomputed path data                      |
| `area`     | closed points, structured polygons and holes, or optional path data |
| `dot`      | center and radius                                                   |
| `rect`     | origin, dimensions, and optional radius                             |
| `label`    | origin, text, anchor, baseline, rotation, size, and weight          |

`SceneStyle` supports fill, fill opacity, stroke, stroke opacity, stroke width,
overall opacity, line cap, line join, and dash array.

`SceneArea.polygons` is authoritative when present. Each polygon contains an
exterior ring followed by zero or more hole rings; one area can contain several
disconnected polygons. SVG and React Native serialize the rings with even-odd
fill, while Canvas paints them directly without `Path2D`. Bounds and exact
geometry containment use every ring.

`SceneRect.inset` retains the resolved inset for absolute inline-state
overrides. Its optional `insetAxis` is `x`, `y`, or `xy`; vertical and
horizontal bars use only their categorical axis, while ordinary rectangles use
both axes. `SceneRect.maxThickness` retains a bar's categorical size ceiling so
an inline-state inset cannot widen its resolved geometry past that ceiling.
Renderers consume the already-resolved rectangle geometry.

```ts
type SceneInteraction =
  | {
      point: ChartPoint
      points?: never
      affinity?: 'x' | 'y' | 'xy' | 'geometry'
    }
  | {
      point?: never
      points: readonly ChartPoint[]
      affinity?: 'x' | 'y' | 'xy' | 'geometry'
    }
```

Attach the exact point object returned in `MarkScene.points`. A continuous
primitive can attach several points, allowing one rendered line or area to
choose its nearest semantic sample without duplicating the primitive geometry.

Custom marks should return the smallest honest scene tree and stable keys. The
full initialization and render contracts are in
[Custom extensions](./rendering-composition-reference.md#source-charts-docs-reference-custom-extensions-md).

### Interaction points

```ts
interface ChartPoint<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  key: string
  markId: string
  group: string | number | null
  groupLabel: string
  datum: TDatum
  datumIndex: number
  xValue: TXValue
  yValue: TYValue
  x1Value?: ChartValue
  x2Value?: ChartValue
  y1Value?: ChartValue
  y2Value?: ChartValue
  xInterval?: 'range' | 'difference'
  yInterval?: 'range' | 'difference'
  x: number
  y: number
  color: string
}
```

`xValue` and `yValue` are semantic values inferred from mark channels. `x` and
`y` are scene-pixel interaction coordinates. Interval marks also retain their
endpoints and whether the presented value is a range or endpoint difference.
The interaction coordinate need not describe every piece of a mark's geometry:
an interval rect may focus at its center, a link at its midpoint, and an arrow
at its endpoint.

<a id="source-charts-docs-reference-scales-guides-and-color-md"></a>

## Scales Guides And Color

Source: `charts:docs/reference/scales-guides-and-color.md`.

Pass a compatible scale factory when its domain should come from mark channels.
Pass a scale instance when the domain is fixed application state. TanStack
Charts copies the resolved scale, assigns its responsive pixel range, and uses
that copy for marks, ticks, and interaction. A supplied instance is never
mutated.

Start with the exact compact scale entry for numeric linear, band, point, or
ordinal mappings. Upgrade one mapping to D3 only when it needs temporal,
nonlinear, radial, interpolated, or statistical scale semantics. The
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) guide owns that decision and direct
dependency guidance. This page documents the TanStack Charts contract around
both implementations.

### Default compact scale entries

`@tanstack/charts` supplies four exact, tree-shakeable scale entries:

| Entry                             | Runtime export | Type contract  |
| --------------------------------- | -------------- | -------------- |
| `@tanstack/charts/scales/linear`  | `scaleLinear`  | `LinearScale`  |
| `@tanstack/charts/scales/band`    | `scaleBand`    | `BandScale`    |
| `@tanstack/charts/scales/point`   | `scalePoint`   | `PointScale`   |
| `@tanstack/charts/scales/ordinal` | `scaleOrdinal` | `OrdinalScale` |

`LinearScale` supports numeric two-stop domains and ranges, `invert`, `clamp`,
`ticks`, basic `tickFormat`, `nice`, and `copy`. `BandScale` supports
`padding`, `paddingInner`, `paddingOuter`, `align`, `round`, `rangeRound`,
`bandwidth`, `step`, and `copy`. `PointScale` exposes the corresponding point
operations with zero bandwidth. `OrdinalScale` supports explicit or implicit
domains, cyclic ranges, `unknown`, and `copy`.

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'

const y = {
  scale: scaleLinear().domain([0, 100]),
}
```

The factories and returned instances satisfy `ChartScaleInput` directly. They
are a documented subset, not a complete `d3-scale` compatibility claim. Use D3
for temporal or transformed domains, piecewise and nonnumeric interpolation,
and full D3 formatting semantics.

`ConfiguredScaleLike` may expose `invert(position)`. Charts copies that
capability onto `ResolvedScale.invert` after assigning the responsive range.
Final-screen layouts and interactions can then recover semantic values without
copying the authored scale. Band scales do not expose inversion.

### Positional scale factories

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

### D3 scale upgrades

Compact and D3 scales can coexist in one chart. This definition upgrades only
its temporal x mapping:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleUtc } from 'd3-scale'

const x = { scale: scaleUtc, nice: true }
const y = { scale: scaleLinear, nice: true }
```

Use `scaleTime` or `scaleUtc` when dates need elapsed-time spacing or
calendar-aware ticks. Compact band and point scales accept `Date` categories,
but adjacent categories remain equally spaced regardless of the time between
them.

Other D3-only scale families cover logarithmic, power, symlog, square-root,
radial, sequential, diverging, quantile, quantize, and threshold mappings. D3
linear scales add piecewise domains and ranges, nonnumeric interpolation, and
custom interpolators. The factory-versus-instance and responsive-range rules
remain unchanged after an upgrade.

### Fixed domains

Pass a scale instance when the domain is semantic application state:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'

const y = {
  scale: scaleLinear().domain([0, 100]),
}
```

Instances retain:

- their semantic domain
- continuous, temporal, logarithmic, ordinal, or band mapping behavior
- tick generation and default tick formatting
- clamping, unknown values, interpolation, and padding configured by the caller

TanStack Charts owns:

- factory-domain inference
- the responsive pixel range
- y-range orientation and optional axis reversal
- centering values within a band
- guide placement, label measurement, and margins

Scale copies make one configured scale safe to reuse across responsive scenes.

### Axis options

```ts
interface ChartAxisOptions<TValue extends ChartValue> {
  scale: ChartScale | ChartScaleInput<TValue>
  nice?: boolean | number
  reverse?: boolean
  viewport?: ChartAxisViewportOptions<Extract<TValue, ChartContinuousValue>>
  grid?: boolean
  axis?:
    | false
    | {
        line?: boolean
        ticks?:
          | false
          | {
              count?: number
              spacing?: number
              values?: readonly TValue[]
              size?: number
              padding?: number
              format?: (value: TValue) => string
            }
        tickLabels?:
          | false
          | {
              rotate?: number
              fontSize?:
                | number
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => number | undefined)
              fontWeight?:
                | number
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => number | undefined)
              opacity?:
                | number
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => number | undefined)
              anchor?:
                | 'start'
                | 'middle'
                | 'end'
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => 'start' | 'middle' | 'end' | undefined)
              dx?:
                | number
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => number | undefined)
              dy?:
                | number
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => number | undefined)
              thin?:
                | boolean
                | {
                    minGap?: number
                    priority?: 'ends'
                    keep?: readonly TValue[]
                  }
            }
        label?: string | { text: string; offset?: number | 'auto' }
      }
}
```

| Option     | Default                     | Meaning                                                                  |
| ---------- | --------------------------- | ------------------------------------------------------------------------ |
| `scale`    | Required                    | Compact or D3 factory, configured instance, or custom `ChartScale`.      |
| `nice`     | `false`                     | Nice the resolved domain using the responsive or supplied tick count.    |
| `reverse`  | `false`                     | Reverses the responsive pixel range without changing the caller's scale. |
| `viewport` | None                        | Commits a continuous semantic window and optional transient translation. |
| `grid`     | `false` for x; `true` for y | Draws grid rules from semantic tick candidates.                          |
| `axis`     | Inferred axis               | Axis line, tick candidates, labels, and title; `false` hides the axis.   |

```ts
type ChartContinuousValue = number | Date

type ChartContinuousDomain<
  TValue extends ChartContinuousValue = ChartContinuousValue,
> =
  | (Extract<TValue, number> extends never ? never : readonly [number, number])
  | (Extract<TValue, Date> extends never ? never : readonly [Date, Date])

interface ChartAxisViewportOptions<
  TValue extends ChartContinuousValue = ChartContinuousValue,
> {
  domain: ChartContinuousDomain<TValue>
  translate?: number
}
```

`ChartContinuousDomain` keeps numeric and temporal endpoints homogeneous at
the type boundary. At runtime, a viewport requires two distinct finite values
and a configured or inferable continuous scale with `invert`, ticks, clamping
disabled, and independently configurable domain and range behavior. Band,
ordinal, quantize, clamped, and getter-only scale inputs are rejected. An
authored `axis.viewport` is also rejected for a custom `ChartScale`.
Logarithmic content and viewport domains must be finite, nonzero, and stay on
the same side of zero.

`translate` is applied in screen-direction scene pixels after semantic
mapping: positive x moves right and positive y moves down, regardless of
domain order or `reverse`. Guides remain fixed. Viewport-dependent marks are
clipped and translated per mark and per owned axis; see
[Continuous viewports](./chart-grammar.md#source-charts-docs-concepts-layout-axes-and-coordinates-md).

Set an axis to `null` only when no mark uses that positional scale. To keep the
scale while hiding its axis, use `axis: false`. Grid visibility remains
independent.

Without an explicit `axis.ticks` policy, the responsive target is
`clamp(2, floor(chart.width / 92), 8)` for x and
`clamp(2, floor(chart.height / 48), 7)` for y. The configured scale may return
a different number of ticks.

`count`, `spacing`, and `values` are mutually exclusive candidate policies.
`count` is a scale hint, `spacing` derives that hint from the final axis length,
and `values` supplies exact semantic candidates. Grid lines and tick stubs use
these candidates before label thinning.

Tick labels are horizontal and collision-thinned by default. Rotation is
explicit and independent:

```ts
import { scaleUtc } from 'd3-scale'

const x = {
  scale: scaleUtc,
  axis: {
    ticks: { spacing: 80, size: 0 },
    tickLabels: {
      rotate: -35,
      thin: {
        minGap: 8,
        priority: 'ends',
        keep: [launchDate],
      },
    },
  },
}
```

`thin: false` renders every candidate label. `keep` is a hard guarantee:
kept values render even if they collide with one another. A kept value outside
the candidate set adds only a label, not a tick stub or grid line.

Tick-label presentation accepts constants or accessors. Accessors run on every
candidate before thinning and receive the semantic value, stable candidate
index, resolved center position, and resolved band width. Continuous scales
report a bandwidth of zero. Returning `undefined` preserves the normal value
for that candidate.

```ts
interface ChartAxisTickLabelContext<TValue extends ChartValue> {
  value: TValue
  index: number
  position: number
  bandwidth: number
}

const x = {
  scale: scaleBand<number>().domain(weeks),
  axis: {
    tickLabels: {
      fontSize: 13,
      opacity: 0.62,
      anchor: ({ index }) => (index === 0 ? 'start' : undefined),
      dx: ({ index, bandwidth }) => (index === 0 ? -bandwidth / 2 : undefined),
    },
  },
}
```

`anchor` defaults to the rotation-derived x anchor or `end` on y. `dx` and
`dy` apply after the normal tick position and padding. Resolved font size,
weight, anchor, offset, opacity, and rotation all participate in collision
thinning and automatic margins. Numeric typography follows tick-label motion;
anchor changes snap.

### Automatic guide layout

When a margin side is omitted, the scene compiler measures:

- formatted tick glyph bounds
- tick rotation
- first and last label overhang
- axis title bounds and offset
- Cartesian `text`-mark anchors, pixel offsets, and rotation
- color legend height

The DOM host measures the inherited container font and relayouts after web
fonts load. Static compilation uses deterministic estimates unless
`measureText` is supplied. Explicit margin sides remain locked, and
`clip: true` prevents clipped mark labels from expanding the plot.

```ts
interface ChartTextMeasurer {
  (
    text: string,
    options: {
      fontSize: number
      fontWeight?: number
      fontFamily: string
      fontStyle: string
      fontStretch: string
      letterSpacing: number
      direction: 'ltr' | 'rtl' | 'inherit'
      locale?: string
      fontScale: number
      anchor: 'start' | 'middle' | 'end'
      baseline: 'auto' | 'middle' | 'hanging'
    },
  ): {
    x: number
    y: number
    width: number
    height: number
  }
}
```

The returned `x` and `y` locate the painted glyph box relative to the requested
anchor and baseline. Pass the measurer through a host, adapter, runtime render,
or `createChartScene` layout options. The callback is synchronous; a host owns
font loading or asynchronous native measurement and recompiles the scene when
those metrics become ready. `fontScale` applies to the painted font size and
letter spacing, so custom measurers must include it in their result.

### Custom scales

`ChartScale` is the final extension boundary for a nonstandard positional
mapping. Prefer a compact scale, then a D3 scale with the required semantics,
before implementing this contract:

```ts
interface ChartScale {
  id: string
  resolve(context: ChartScaleResolveContext): ResolvedScale
}

type ChartScaleResolver = (context: ChartScaleResolveContext) => ResolvedScale
```

The resolver context contains `id`, all materialized `values`, the responsive
`range`, the axis `options`, a target `tickCount`, and `includeZero`. It must
return a complete `ResolvedScale`:

```ts
interface ResolvedScale {
  id: string
  type: string
  domain: readonly ChartValue[]
  map(value: unknown): number
  invert?(position: number): ChartValue
  ticks: readonly { value: ChartValue; label: string; position: number }[]
  bandwidth: number
  viewport?: {
    contentDomain: readonly ChartValue[]
    domain: ChartContinuousDomain
    translate: number
    map(value: unknown): number
  }
}
```

Prefer a compact or D3 scale when it can express the mapping. A custom scale
owns correct domains, finite mapping, ticks, formatting, bandwidth, and
response to the supplied range. Do not wrap an existing compact or D3 scale in
`ChartScale`.

The host cannot apply an authored `axis.viewport` to an opaque custom
`ChartScale`. A custom resolver can return a complete
`ResolvedScale.viewport` itself, in which case it owns the content domain,
committed domain, translation, and presented mapper.

### Color

Data-paint marks accept a semantic `color` channel. On marks that also expose
`z`, grouping remains independent and supplies the color value only when
`color` is omitted. `fill` and `stroke` are final paint overrides, so they do
not contribute to the scale or legend.

Omit `color.scale` to use the theme palette. Use the compact ordinal scale when
categories need a stable application-owned mapping:

```ts
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'

const statusColor = scaleOrdinal(
  ['healthy', 'warning', 'critical'],
  ['#16a34a', '#f59e0b', '#dc2626'],
)
```

Upgrade color to D3 for continuous interpolation or quantile, quantize, and
threshold policy.

```ts
interface ConfiguredColorScaleLike<TValue extends ChartKey, TOutput> {
  (value: TValue): TOutput
  copy: () => ConfiguredColorScaleLike<TValue, TOutput>
  domain?: () => readonly TValue[]
  range?: () => readonly TOutput[]
}

interface ChartColorOptions {
  scale?: ConfiguredColorScaleLike<any, any> | ChartColorScaleFactory<any, any>
  resolver?: ChartColorScale
  domain?: readonly ChartKey[]
  range?: readonly string[]
  nice?: boolean | number
  legend?: ChartColorLegend
}
```

| Option     | Default                 | Meaning                                                           |
| ---------- | ----------------------- | ----------------------------------------------------------------- |
| `scale`    | None                    | Compatible factory with inference or instance with a fixed domain |
| `resolver` | None                    | Custom color-scale resolver                                       |
| `domain`   | Observed channel values | Domain hint for factory, built-in, or custom resolution           |
| `range`    | See below               | Range for a factory, the built-in scale, or a custom resolver     |
| `nice`     | `false`                 | Nice a factory or configured continuous color scale               |
| `legend`   | None                    | Legend layout and scene renderer shown above the inner chart      |

Resolution order:

1. `color.scale`, created or copied before use
2. custom `color.resolver`
3. the built-in ordinal scale using `domain` or observed channel values and
   `range` or the theme palette

A color-scale factory is classified by its capabilities:

- ordinal factories infer first-seen distinct values;
- continuous and quantize factories infer the finite extent;
- quantile factories receive the complete numeric population;
- threshold factories require an explicit domain of authored cuts.

The theme palette is the range default only for the built-in ordinal scale.
A D3 factory must receive `color.range` or return a scale already configured
with a non-empty string range or interpolator; bare D3 factories retain
numeric or empty defaults that are not valid paint. Multi-stop continuous
ranges receive evenly spaced domain stops across the extent. A supplied scale
instance retains its domain and range. Outputs are converted to strings. A
custom `ChartColorScale` receives observed values, optional domain and range,
and the resolved theme, then returns:

```ts
interface ResolvedColorScale {
  type: string
  kind?: 'categorical' | 'continuous' | 'quantile' | 'quantize' | 'threshold'
  domain: readonly ChartKey[]
  range: readonly string[]
  thresholds?: readonly number[]
  map(value: ChartKey | null | undefined): string
}
```

`ChartKey` is `string | number`. On the built-in and configured-scale paths, a
null color value maps to the first range color or `currentColor`. A custom
`ChartColorScale` owns its null mapping through `ResolvedColorScale.map`. A
custom stepped scale supplies exact interior legend boundaries with
`thresholds`; D3 quantile, quantize, and threshold scales derive them
automatically.

### Automatic color legend

```ts
import { colorLegend } from '@tanstack/charts/legend'

colorLegend({
  label: 'Package',
  itemWidth: 120,
  width: 240,
  format: (value) => value.toFixed(0),
  placement: 'bottom',
})
```

```ts
interface ColorLegendOptions {
  label?: string
  itemWidth?: number
  width?: number
  format?: (value: number) => string
  placement?: 'top' | 'bottom'
}
```

`itemWidth` defaults to `110` and is clamped to a minimum of `64`. Items wrap
to responsive columns for categorical scales. Continuous scales render a
sampled ramp. Quantize, quantile, and threshold scales render exact range bins
at their resolved thresholds. `width` and `format` configure the quantitative
forms. `placement` defaults to `top`.

### Gradient legend

```ts
import { colorGradientLegend } from '@tanstack/charts/legend'

colorGradientLegend({
  label: 'Density',
  steps: 48,
  width: 240,
  format: (value) => value.toFixed(1),
  placement: 'bottom',
})
```

```ts
interface ColorGradientLegendOptions {
  label?: string
  steps?: number
  width?: number
  format?: (value: number) => string
  placement?: 'top' | 'bottom'
}
```

`steps` defaults to `32` and is clamped to at least `2`. `width` defaults to
`240`, uses at least `80` when space permits, and is finally capped by the
inner chart width. The legend requires a numeric first and last color-domain
value and throws for a nonnumeric domain.

### Interactive categorical legend

```ts
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'

interactiveColorLegend({
  visible: controlledSignal(visibleSeries, setVisibleSeries),
  placement: 'bottom',
  ariaLabel: 'Series visibility',
})
```

```ts
interface InteractiveColorLegendChange<TValue extends ChartKey> {
  type: 'toggle'
  value: TValue
  visible: boolean
}

interface InteractiveColorLegendItemContext {
  visible: boolean
}

interface InteractiveColorLegendOptions<TValue extends ChartKey> {
  visible: ControlledSignal<
    readonly TValue[],
    InteractiveColorLegendChange<TValue>
  >
  placement?: 'top' | 'bottom'
  ariaLabel?: string
  itemWidth?: number
  format?: (value: TValue) => string
  itemAriaLabel?: (
    value: TValue,
    context: InteractiveColorLegendItemContext,
  ) => string
  emptyLabel?: string
}
```

The application owns the current visible-value snapshot and handles each
proposed replacement. The legend owns domain-ordered toggling, responsive
layout, and native browser buttons. It filters series geometry and focus points
after scale resolution, so hidden values remain in categorical and positional
domains. A mark participates when its categorical `color` channel establishes
series identity without a separate `z` channel.

The DOM hosts replace the scene fallback with native `button` elements. Static
SVG output retains a noninteractive visual fallback. This control is not yet
implemented by the React Native host.

### Custom legends

`ChartColorLegend` separates layout from rendering:

```ts
interface ChartColorLegend {
  height(itemCount: number, context: ChartColorLegendContext): number
  placement?: 'top' | 'bottom'
  render(context: ChartColorLegendContext): SceneNode
}
```

`height` returns the reserved pixel height before chart bounds are finalized.
Both callbacks receive the resolved colors, plot and legend bounds, theme, and
full chart size. `render` returns one keyed
[scene node](./runtime-scales-reference.md#source-charts-docs-reference-runtime-and-scene-md). Browser host controls are an
advanced extension boundary used by `interactiveColorLegend`; ordinary custom
legends should remain renderer-neutral scene output.

### Theme and gradients

The built-in theme is described in [Chart spec](./specifications-types.md#source-charts-docs-reference-chart-spec-md).
Chart gradients are independent SVG resources:

```ts
interface ChartLinearGradient {
  id: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  stops: readonly {
    offset: number
    color: string
    opacity?: number
  }[]
}
```

Coordinates and offsets are normalized from `0` to `1` by the default SVG
renderer. Omitted coordinates form a vertical gradient from bottom to top.
Use an `idPrefix` when charts share a document; see
[Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).
