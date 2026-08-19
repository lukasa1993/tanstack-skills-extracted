# Spatial and polar marks

Spatial, polar, focus-guide, Delaunay, geo, and Voronoi mark reference.

<a id="source-charts-docs-reference-marks-delaunay-md"></a>

## Delaunay

Source: `charts:docs/reference/marks/delaunay.md`.

`delaunayLink` connects observations that are neighbors in a Delaunay
triangulation of their final scaled screen positions. Import it from the
optional spatial subpath; it is not included in the root or universal barrel.

```ts
import { delaunayLink } from '@tanstack/charts/spatial/delaunay'

delaunayLink(cars, {
  x: 'weight',
  y: 'economy',
  key: 'id',
  stroke: '#94a3b8',
  strokeOpacity: 0.75,
  strokeWidth: 1,
})
```

```ts
function delaunayLink<TDatum, TOptions extends DelaunayLinkOptions<TDatum>>(
  source: Iterable<TDatum>,
  options: TOptions,
): ChartMark<DelaunayLinkDatum<TDatum>>
```

The public type surface includes `DelaunayLinkOptions` and
`DelaunayLinkDatum`.

### Options

| Option                                    | Type                                       | Default        | Meaning                                 |
| ----------------------------------------- | ------------------------------------------ | -------------- | --------------------------------------- |
| `x`                                       | `Channel<TDatum, ChartValue?>`             | Required       | Source horizontal position              |
| `y`                                       | `Channel<TDatum, ChartValue?>`             | Required       | Source vertical position                |
| `z`                                       | `Channel<TDatum, ChartKey?>`               | One group      | Independently triangulated source group |
| `key`                                     | `Channel<TDatum, ChartKey>`                | Inferred       | Stable point identity used in edge keys |
| `id`                                      | `string`                                   | Layer-derived  | Stable mark ID                          |
| `color`                                   | `Channel<DelaunayLinkDatum, ChartKey?>`    | Edge group     | Edge value sent to the color scale      |
| `stroke`                                  | `VisualChannel<DelaunayLinkDatum, string>` | Resolved color | Final stroke                            |
| `strokeOpacity` and `strokeWidth`         | `VisualChannel<DelaunayLinkDatum, number>` | Link defaults  | Edge presentation                       |
| `strokeDasharray`, `lineCap`, and `curve` | Native `link` presentation                 | Link defaults  | Segment presentation                    |
| `motion`                                  | `ChartMotionDefinition<DelaunayLinkDatum>` | Chart policy   | Edge enter, update, and exit motion     |

`z` is evaluated on source rows before layout. Rows with the same non-null
group are triangulated together; links never cross groups. Presentation
accessors are evaluated on the derived edge datum, so they can inspect both
endpoints explicitly:

```ts
delaunayLink(rows, {
  x: 'x',
  y: 'y',
  stroke: ({ source, target }) =>
    source.category === target.category ? '#2563eb' : '#94a3b8',
})
```

### Final-screen topology

Initial complete x/y pairs establish the positional domains. After scales and
inner bounds resolve, the mark projects both axes and triangulates those pixel
positions. It then renders semantic endpoints through the native `link` mark.

This ordering matters because anisotropic x/y ranges can change which diagonal
is Delaunay. Resizing may therefore change adjacency even when the source rows
and domains are unchanged. Repeated compilation at the same dimensions is
deterministic. Inversion is not required, so continuous, temporal, and
categorical positional scales are supported.

### Edge lineage and identity

Each `DelaunayLinkDatum<TDatum, TXValue, TYValue>` contains:

- `source` and `target`, retaining both original row objects;
- `sourceIndex` and `targetIndex`, retaining their original input indexes;
- `sourceKey` and `targetKey`;
- semantic `x1`, `y1`, `x2`, and `y2` endpoints;
- `group`; and
- a canonical `edgeKey` derived from the endpoint keys.

Supply `key` when source order can change. Point keys also provide deterministic
tie-breaking for cocircular and coincident positions. Endpoint order and edge
keys remain stable across responsive topology updates. The interaction point is
the native link midpoint and retains the complete edge datum for tooltips and
motion.

Missing or invalid x/y pairs are omitted without expanding either positional
domain. Coincident points do not produce zero-length edges. Zero or one unique
position produces no links, two positions produce one link, and collinear
positions connect consecutive neighbors.

### Visible links versus nearest-point lookup

Use `delaunayLink` when adjacency is part of the visible encoding. If Delaunay
is used only to accelerate focus lookup, supply a `ChartSpatialIndexFactory`
instead; an invisible link layer should not change focus candidates or bundle
cost.

<a id="source-charts-docs-reference-marks-focus-guide-md"></a>

## Focus Guide

Source: `charts:docs/reference/marks/focus-guide.md`.

`focusGuideX` and `focusGuideY` render ordinary scene nodes only for the active
focus target. Import them from the exact optional subpath:

For an unsnapped x/y value pair with no datum focus target, use
[`continuousCursor`](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md) instead.

```ts
import { focusGuideX } from '@tanstack/charts/focus/guide'

focusGuideX(rows, {
  id: 'cursor',
  x: 'period',
  y: 'value',
  z: 'series',
  key: 'id',
  yRule: {},
  marker: {},
  xLabel: { format: (period) => period },
  yLabel: { format: (value) => String(value) },
  motion: {
    transition: { type: 'spring', stiffness: 240, damping: 22 },
  },
})
```

`focusGuideX` enables the vertical x rule by default. `focusGuideY` enables the
horizontal y rule. Configure both rules on either mark for a crosshair.

```ts
function focusGuideX<TDatum>(
  source: Iterable<TDatum>,
  options: FocusGuideOptions<TDatum>,
): ChartMark<TDatum>

function focusGuideY<TDatum>(
  source: Iterable<TDatum>,
  options: FocusGuideOptions<TDatum>,
): ChartMark<TDatum>
```

### Options

| Option   | Type                                       | Default                | Meaning                                      |
| -------- | ------------------------------------------ | ---------------------- | -------------------------------------------- |
| `id`     | `string`                                   | Layer-derived          | Stable mark and motion owner                 |
| `x`      | `Channel<TDatum, ChartValue?>`             | Required               | Semantic x value and guide position          |
| `y`      | `Channel<TDatum, ChartValue?>`             | Required               | Semantic y value and guide position          |
| `z`      | `Channel<TDatum, ChartKey?>`               | No group               | Series identity retained on guide points     |
| `key`    | `Channel<TDatum, ChartKey>`                | Inferred               | Candidate datum identity                     |
| `match`  | `ChartFocusMatch`                          | `'primary'`            | Focus selection used to choose candidates    |
| `xRule`  | `false \| FocusGuideRuleOptions<TDatum>`   | `{}` for `focusGuideX` | Full-height rule at the focused x coordinate |
| `yRule`  | `false \| FocusGuideRuleOptions<TDatum>`   | `{}` for `focusGuideY` | Full-width rule at the focused y coordinate  |
| `marker` | `false \| FocusGuideMarkerOptions<TDatum>` | Disabled               | Dot at the focused x/y coordinate            |
| `xLabel` | `false \| FocusGuideLabelOptions`          | Disabled               | Label outside the x edge                     |
| `yLabel` | `false \| FocusGuideLabelOptions`          | Disabled               | Label outside the y edge                     |
| `motion` | `ChartMotionDefinition<TDatum>`            | None                   | Enter, retarget, and exit policy             |

Rule options provide `stroke`, `strokeOpacity`, `strokeWidth`,
`strokeDasharray`, and `lineCap`. Marker options provide `radius`, `fill`,
`fillOpacity`, `stroke`, `strokeOpacity`, and `strokeWidth`. Paint and numeric
rule or marker values may be datum visual channels.

Label options provide `format`, `side`, `offset`, `paddingX`, `paddingY`,
`radius`, `background`, `color`, `stroke`, `strokeWidth`, `fontSize`, and
`fontWeight`. A formatter receives the typed semantic value and a
`FocusGuideLabelFormatContext` containing `{ point }`, the active `ChartPoint`
and its original datum reference.

### Focus and motion

Guide candidates participate in scale inference but do not enter
`ChartScene.points`, pointer hit testing, callbacks, or tooltip rows. Focus
resolves the selected candidate under stable structural keys. The first target
enters at its final coordinate, later targets update the same rule, marker, and
label nodes, and clearing focus exits those nodes.

Primary matching uses the original object reference, or the primitive value
plus source position for primitive rows. Candidate ownership is structural;
keys such as `a` and `a:point` remain distinct rather than being interpreted as
a hierarchy.

Static SVG, Canvas, and native surfaces snap to the resolved focus target. The
optional `@tanstack/charts/motion` SVG renderer applies `motion`, preserves
spring velocity through rapid retargets, and handles reduced motion and
teardown. A focus guide composes with the default focus ring; set
`focusRing: false` only when its marker replaces that indicator.

`whenFocused(mark, { retarget: true })` exposes the same structural behavior
for custom compositions. Normal `whenFocused` marks keep their existing
pre-rendered visibility behavior when `retarget` is omitted.

<a id="source-charts-docs-reference-marks-geo-md"></a>

## Geo

Source: `charts:docs/reference/marks/geo.md`.

`geoShape` renders GeoJSON through a projection created for the final
responsive plot bounds. It is available only from the geographic capability
subpath:

```ts
import { geoShape } from '@tanstack/charts/geo'
```

The subpath owns `d3-geo` path generation and centroid calculation. The
application still chooses and configures the D3 projection.

### `geoShape`

```ts
function geoShape<TDatum extends GeoPermissibleObjects>(
  source: Iterable<TDatum>,
  options: GeoShapeOptions<TDatum>,
): ChartMark<TDatum, number, number, never, never>
```

`projection` accepts either a descriptor or the original callback. A descriptor
creates a fittable D3 projection and explicitly fits the mark data, a sphere,
or supplied geometry to the final bounds:

```ts
geoShape(features, {
  projection: {
    type: geoEqualEarth,
    fit: 'data',
    inset: 8,
  },
  color: (feature) => feature.properties.value,
})
```

Use `fit: 'sphere'` when the full world frame must remain stable, or pass a
specific `GeoPermissibleObjects` value when several geo layers must share one
fit. A callback receives `GeoProjectionContext` with the final `chart` bounds
and materialized `data`; return a `GeoProjection`, `GeoStreamWrapper`, or
`null`.

#### `GeoShapeOptions`

| Option            | Type                                  | Default                 | Meaning                                               |
| ----------------- | ------------------------------------- | ----------------------- | ----------------------------------------------------- |
| `id`              | `string`                              | Layer-derived           | Stable mark ID                                        |
| `className`       | `string`                              | None                    | Class added beside `ts-chart__geo`                    |
| `projection`      | `GeoProjectionDescriptor \| callback` | Required                | Creates/fits or directly returns a D3 projection      |
| `key`             | `Channel<TDatum, ChartKey>`           | Top/nested `id`, index  | Stable feature identity                               |
| `color`           | `Channel<TDatum, ChartKey?>`          | No value                | Input to the chart color scale                        |
| `r`               | `number \| Channel<TDatum, number?>`  | `4.5`                   | Point and MultiPoint radius in pixels                 |
| `rScale`          | `(value: number) => number`           | Identity                | Maps a quantitative value to a pixel radius           |
| `fill`            | `VisualChannel<TDatum, string>`       | Color for closed shapes | Final fill paint override                             |
| `fillOpacity`     | `number`                              | SVG default             | Fill opacity                                          |
| `stroke`          | `VisualChannel<TDatum, string>`       | Color for linework      | Final stroke paint override                           |
| `strokeOpacity`   | `number`                              | SVG default             | Boundary opacity                                      |
| `strokeWidth`     | `number`                              | SVG default             | Boundary width                                        |
| `strokeDasharray` | `string`                              | SVG default             | Boundary dash pattern                                 |
| `opacity`         | `number`                              | SVG default             | Whole-feature opacity                                 |
| `anchor`          | `(datum, context) => [lon, lat]`      | `geoCentroid()`         | Semantic longitude/latitude for the interaction point |

Semantic `color` becomes fill for closed geometry, stroke for linework, and
both for a mixed collection. Explicit `fill` or `stroke` channels override that
mapped paint.

Each drawable feature becomes one SVG path. `geoPath(projection).centroid()`
sets the point's screen position. `anchor`, or `geoCentroid()` when omitted,
sets its semantic x/y values. Nonfinite centroids do not emit an interaction
point.

For Point and MultiPoint geometry, `r` is passed to D3
`geoPath().pointRadius()` for each datum. Add `rScale` when the channel carries
a magnitude rather than a pixel radius; invalid or negative results are
omitted.

`GeoProjectionContext`, `GeoProjectionDescriptor`, `GeoProjectionInput`,
`GeoShapeOptions`, and the `geoShape` implementation are exported from
`@tanstack/charts/geo`. Omit both chart axes; the mark does not materialize
Cartesian scale channels. Boundary datasets are deliberately not part of this
entry point; convert application-owned TopoJSON to GeoJSON before passing
features to the mark. See
[Maps and Spatial Charts](./examples-advanced.md#source-charts-docs-examples-maps-and-spatial-md).

<a id="source-charts-docs-reference-marks-polar-md"></a>

## Polar

Source: `charts:docs/reference/marks/polar.md`.

Polar marks are available only from the capability subpath:

```ts
import {
  angleGrid,
  focusGroupAngle,
  pie,
  polar,
  radialArc,
  radialArea,
  radialBarAngle,
  radialBarRadius,
  radialDot,
  radialGrid,
  radialLine,
  radialRule,
  radialText,
} from '@tanstack/charts/polar'
```

`polar` resolves the responsive coordinate system. The exported `PolarMark`
and `PolarGuide` types are opaque composition contracts returned by the
built-in radial mark and guide constructors. Use them to type collections
passed to `polar`; do not implement their internal initialize or render
lifecycle. Guide backgrounds paint first, marks paint second, and guide
foregrounds paint last.

### `polar`

```ts
function polar(options: PolarOptions): ChartMark
```

| Option        | Type                    | Default       | Meaning                                          |
| ------------- | ----------------------- | ------------- | ------------------------------------------------ |
| `id`          | `string`                | Layer-derived | Stable container ID                              |
| `className`   | `string`                | None          | Class added beside `ts-chart__polar`             |
| `marks`       | `readonly PolarMark[]`  | Required      | Radial marks rendered in order                   |
| `guides`      | `readonly PolarGuide[]` | `[]`          | Background/foreground guide layers around marks  |
| `angle`       | `PolarAngleOptions`     | None          | Angle factory or instance and optional wrapping  |
| `radius`      | `PolarRadiusOptions`    | None          | Radius scale and optional responsive pixel range |
| `startAngle`  | `number`                | `0`           | Start of the available angular range in radians  |
| `endAngle`    | `number`                | `2π`          | End of the available angular range in radians    |
| `inset`       | `number`                | `0`           | Pixels removed from the maximum centered radius  |
| `radiusRatio` | `number`                | `1`           | Multiplier applied to the radius after inset     |

The default angular range is a complete circle. Angles use D3's radial
convention: zero is at twelve o'clock and positive values move clockwise.

`PolarAngleOptions` and `PolarRadiusOptions` accept compatible factories with
mark-inferred domains or configured instances with fixed domains. `nice`
applies after inference. TanStack supplies responsive ranges without mutating
an instance. An omitted `wrap` closes a complete revolution without adding a
duplicate semantic category, but preserves both endpoints of a partial range.
Set it explicitly to override that behavior.

`PolarRadiusOptions.range` overrides the default `[0, radius]` pixel range on
the copied radius scale. Each endpoint is a nonnegative pixel length or a
`PolarLength` callback, so concentric layouts can resolve physical ranges from
the final radius:

```ts
const radiusOptions = {
  scale: scaleLinear().domain([0, maximum]),
  range: [({ radius }) => radius * 0.2, ({ radius }) => radius],
}
```

The range is re-resolved on resize and never mutates the authored D3 scale.

`PolarLayoutContext` contains `chart`, `centerX`, `centerY`, `radius`,
`startAngle`, `endAngle`, and optional resolved angle/radius scales. Each
`PolarResolvedScale` exposes its semantic `domain`, responsive `map`, `ticks`,
and `bandwidth`. A `PolarLength` is either a pixel length or a callback of the
layout context. Use a callback for radii that must remain proportional during
resize.

The outer chart omits `x` and `y`. Cartesian axes do not participate in the
internal polar scales.

### `focusGroupAngle`

```ts
import { defineChart, type ChartDefinition } from '@tanstack/charts'
import { focusGroupAngle } from '@tanstack/charts/polar'
import { tooltip } from '@tanstack/charts/tooltip'

declare const definition: ChartDefinition

const interactiveDefinition = defineChart(definition, {
  focus: focusGroupAngle,
  tooltip,
})
```

`focusGroupAngle` is the polar equivalent of `group-x`. Pointer resolution
uses the nearest radial ray instead of the nearest point anchor, then returns
one point per series with the same semantic angle value. The closest radius is
primary. Keyboard navigation visits one representative per angle in angular
order. `maxFocusDistance` is the scene-pixel distance from the pointer to the
ray; set it to `Number.POSITIVE_INFINITY` for continuous angular snapping.

### `pie`

```ts
function pie<TDatum extends object>(
  source: Iterable<TDatum>,
  options: PieOptions<TDatum>,
): PieDatum<TDatum>[]
```

`pie` eagerly allocates a nonnegative value channel into angle intervals. It
does not render geometry or depend on chart dimensions.

| Option       | Type                      | Default     | Meaning                                      |
| ------------ | ------------------------- | ----------- | -------------------------------------------- |
| `value`      | `TransformValue<number>`  | Required    | Nonnegative value allocated to each interval |
| `orderBy`    | `TransformValue`          | None        | Explicit angular ordering value              |
| `order`      | `ascending \| descending` | `ascending` | Direction applied to `orderBy`               |
| `startAngle` | `number`                  | `0`         | Overall start angle in radians               |
| `endAngle`   | `number`                  | `2π`        | Overall end angle in radians                 |
| `gapAngle`   | `number`                  | `0`         | Direct empty angle between visible slices    |

Output rows remain in source order. `index` records angular order, `value` is
the resolved finite value, `fraction` is its share of the positive total, and
`startAngle`, `endAngle`, and `angle` are the visible interval and midpoint.
Each row also carries direct `source` and `sourceIndexes` lineage. Missing or
non-finite values are omitted, zero is retained, and negative values fail.

`gapAngle` is radius-independent. A complete revolution includes a seam gap;
a partial range uses only internal gaps and preserves both authored endpoints.
The output `padAngle` is intentionally `0` compatibility metadata so the
default `radialArc` accessors do not pad an already-gapped interval a second
time. Use the mark's `padAngle` and `padRadius` only when D3's radius-dependent
arc padding is wanted instead.

The derived fields `value`, `index`, `fraction`, `startAngle`, `endAngle`,
`angle`, `padAngle`, `source`, and `sourceIndexes` overwrite source fields with
the same names. Stable identity is not synthesized; preserve a semantic source
field and pass it to the consuming mark's `key` channel.

### `radialArc`

```ts
function radialArc<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialArcOptions<TDatum>,
): PolarMark<TDatum>
```

`radialArc` renders one D3 arc per valid interval.

| Option            | Meaning                                                        |
| ----------------- | -------------------------------------------------------------- |
| `id`, `className` | Stable layer ID and optional class                             |
| `startAngle`      | Start-angle channel; defaults to datum `startAngle`            |
| `endAngle`        | End-angle channel; defaults to datum `endAngle`                |
| `padAngle`        | Padding-angle channel; defaults to datum `padAngle`, then zero |
| `innerRadius`     | `PolarLength`; defaults to zero                                |
| `outerRadius`     | `PolarLength`; defaults to the layout radius                   |
| `cornerRadius`    | D3 arc corner radius as a `PolarLength`                        |
| `padRadius`       | Explicit D3 arc padding radius as a `PolarLength`              |
| `generator`       | Responsive D3 arc factory for advanced per-datum geometry      |
| `key`             | Stable arc identity; defaults to top/nested `id`, then index   |
| `z`               | Geometry and interaction group                                 |
| `color`           | Color-scale value; defaults to `z`                             |
| `fill`            | Final constant or datum-derived paint override                 |
| `fillOpacity`     | Fill opacity                                                   |
| `stroke`          | Constant or datum-derived boundary stroke                      |
| `strokeOpacity`   | Boundary opacity                                               |
| `strokeWidth`     | Boundary width                                                 |
| `strokeDasharray` | Boundary dash array                                            |
| `opacity`         | Whole-arc opacity                                              |

Each arc attaches its sampled painted boundary to its interaction point.
Default nearest focus therefore follows the visible slice, including holes,
rounded corners, reversed sweeps, and custom D3 generators, instead of using
only the centroid anchor.

Use the native `pie` transform for flat typed rows with source lineage. D3
`pie` output remains valid interoperability input because its `startAngle`,
`endAngle`, and `padAngle` fields are also the channels this mark needs. A pie,
donut, and gauge differ only in inner radius and angular interval.

`generator` replaces the default D3 arc configuration for bespoke per-datum
geometry. Its factory receives the final `PolarLayoutContext`; keep the D3
generator context `null` so it returns SVG path data. Standard hierarchy
partitioning belongs to the optional
[`sunburst`](./marks-composite.md#source-charts-docs-reference-marks-sunburst-md) mark, which accepts flat source rows and preserves
their lineage.

### `radialBarRadius` and `radialBarAngle`

```ts
function radialBarRadius<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialBarRadiusOptions<TDatum>,
): PolarMark<TDatum>

function radialBarAngle<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialBarAngleOptions<TDatum>,
): PolarMark<TDatum>
```

The two radial-bar marks transpose ordinary bar semantics across polar axes.
`radialBarRadius` uses an angle band and a quantitative radius interval;
`radialBarAngle` uses a radius band and a quantitative angle interval. The
categorical scale must have positive bandwidth. Configure spacing through the
D3 band scale's inner and outer padding.

| Mark              | Categorical channel             | Quantitative interval                                                   |
| ----------------- | ------------------------------- | ----------------------------------------------------------------------- |
| `radialBarRadius` | `angle`; defaults to row index  | `radius` is shorthand for `radius2`; `radius1` is the optional baseline |
| `radialBarAngle`  | `radius`; defaults to row index | `angle` is shorthand for `angle2`; `angle1` is the optional baseline    |

An omitted `radialBarRadius.radius1` starts at physical radius zero, even when
`PolarRadiusOptions.range` maps semantic zero to an inner offset. An explicit
`radius1` is mapped through the radius scale. An omitted
`radialBarAngle.angle1` is semantic zero and is mapped through the angle scale.
Use the implicit physical-center radius baseline for nonnegative magnitudes.
For signed values or true radial intervals, set `radius1: 0` (or another
semantic baseline) so both endpoints map through the configured scale.

Both marks accept `id`, `className`, `key`, `z`, `color`, `fill`, fill opacity,
stroke styling, opacity, and motion. `cornerRadius` accepts a `PolarLength` or
`"full"`; the latter resolves to half the bar's radial thickness. Each valid
bar emits one geometry-backed interaction point at its quantitative endpoint
and preserves its interval endpoints for focus and tooltip formatting.

### `radialLine` and `radialArea`

```ts
function radialLine<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialLineOptions<TDatum>,
): PolarMark<TDatum>

function radialArea<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialAreaOptions<TDatum>,
): PolarMark<TDatum>
```

Both marks use `angle` and `radius` channels and accept `id`, `className`,
`key`, `z`, `color`, and a D3 curve factory. The channels default to row index
and a numeric datum. `color` contributes to the chart color scale and defaults
to `z`. When `z` is omitted, an authored `color` also partitions the paths.
When both are present, `z` remains the explicit geometry and interaction
group. `radialLine` accepts final stroke, dash, opacity, and optional `points`
styling. `radialArea` accepts final fill and stroke styling plus `radius1` for
an explicit inner scale value; `radius1` defaults to zero.

Their datum key defaults to a unique top-level or nested `data.id`, then a
unique angle within each effective path group, then row index.

Input order is path order. Use a closed D3 curve such as
`curveLinearClosed` for radar polygons. An explicit `z`, or `color` when `z`
is absent, creates one path per group. `radialArea` can carry its own stroke;
layer a closed `radialLine` only when the outline needs independent styling.

### `radialDot`

```ts
function radialDot<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialDotOptions<TDatum>,
): PolarMark<TDatum>
```

`radialDot` uses the same angle/radius channel defaults. It also accepts `id`,
`className`, `key`, `z`, `color`, `r`, `rScale`, fill, stroke, and opacity styling.
Radius defaults to 3.5 pixels. Each valid datum emits one interaction point
with its original angle/radius values and projected screen position. Its key
defaults to a unique top-level or nested `data.id`, then row index.

### `radialText`

```ts
function radialText<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialTextOptions<TDatum>,
): PolarMark<TDatum>
```

`radialText` maps `angle` and `radius` channels through the container's copied
polar scales, then positions labels with D3's radial point projection. It
accepts `text`, `key`, `z`, `color`, fill, font size and weight, anchor, baseline,
rotation, and pixel `dx`/`dy`. `radiusOffset` is a signed constant or per-datum
visual channel applied in pixels after the semantic radius is mapped. It does
not contribute to the radius domain. Set `anchor: "outside"` to resolve
`start`, `middle`, or `end` from the final mapped angle. Exact and near-exact
top and bottom angles use `middle`. A nonfinite resolved offset omits that
label and its interaction point.

Use it for arc labels, donut-center values, and gauge readouts without leaving
the polar coordinate system. Its interaction point follows the final radial
offset plus `dx`/`dy` while retaining the original semantic radius value. Its
key defaults to a unique top-level or nested `data.id`, then row index.

### `radialRule`

```ts
function radialRule<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialRuleOptions<TDatum>,
): PolarMark
```

`radialRule` emits one radial segment per datum. `angle`, `radius1`, and
`radius2` are scale values; `radius1` defaults to zero. The mark also accepts
`radius1Offset` and `radius2Offset` as signed constant or per-datum pixel
visual channels applied after the corresponding semantic radius is mapped.
Offsets never contribute to radius-domain inference. A nonfinite resolved
endpoint offset omits that segment. The mark also accepts `key`, `z`, `color`,
stroke, opacity, width, and dash styling. It covers gauge needles, ticks, and
pie-label leaders without expanding one logical segment into two path rows.
Rules remain decorative and emit no interaction points. Its key defaults to a
unique top-level or nested `data.id`, then a unique angle within each `z`
group, then row index.

Pixel offsets do not reserve space outside the polar radius. Use
`radiusRatio`, `inset`, or chart margins when labels or leaders must remain
inside the chart surface.

### `radialGrid` and `angleGrid`

```ts
function radialGrid(options?: RadialGridOptions): PolarGuide
function angleGrid(options?: AngleGridOptions): PolarGuide
```

`radialGrid` draws radius values as circles or polygons. Supply explicit
`values`, or let `ticks` request values from the configured radius scale.
Labels are off by default. Label angle, offset, rotation, format, fill, and
font size are configurable. Ring `fill` and `fillOpacity` can layer filled
circle or polygon grids behind the chart marks.

`angleGrid` draws spokes for explicit `values` or the configured angle domain.
It can show labels around the circumference with `format` and `labelOffset`.
Labels are on by default and use the same outside-anchor rule as
`radialText({ anchor: "outside" })` unless `labelAnchor` is supplied. Both
guides accept ID, class, stroke, opacity, width, and dash styling.

Guide label position and orientation can be constants or callbacks through
`PolarGuideLabelOption`. Each callback receives a `PolarGuideLabelContext`
with the semantic `value`, `index`, angle, radius, local x/y position, and
complete layout. Use `labelAnchor`, `labelBaseline`, `labelDx`, `labelDy`, and
`labelRotate` without rebuilding the guide. `labelClassName` targets the label
group. Guides are decorative and emit no interaction points.

Every guide returns a `PolarGuideScene`:

```ts
interface PolarGuideScene {
  background: readonly SceneNode[]
  foreground?: readonly SceneNode[]
}
```

`polar` collects every guide background in declaration order, renders all
marks, then appends every optional foreground in the same guide order. The
built-in grids put rings and spokes in `background` and labels in
`foreground`, keeping labels legible without painting grid geometry over the
data.

The exported option contracts are `PolarOptions`, `RadialArcOptions`,
`RadialBarRadiusOptions`, `RadialBarAngleOptions`, `RadialLineOptions`,
`RadialAreaOptions`, `RadialDotOptions`, `RadialTextOptions`,
`RadialRuleOptions`, `RadialGridOptions`, and `AngleGridOptions`. The coordinate contracts are `PolarAngleOptions`,
`PolarRadiusOptions`, `PolarResolvedScale`, `PolarLayoutContext`,
`PolarLength`, `PolarGuideLabelContext`, `PolarGuideLabelOption`, `PolarMark`,
`PolarGuide`, and `PolarGuideScene`. `PolarMark` and `PolarGuide` annotate
built-in constructor results rather than a supported custom-extension
boundary.

See [Polar and Radar Charts](./examples-advanced.md#source-charts-docs-examples-polar-and-radar-md) for pie,
donut, gauge, radar, radial bar, numeric line, and numeric scatter
compositions.

<a id="source-charts-docs-reference-marks-voronoi-md"></a>

## Voronoi

Source: `charts:docs/reference/marks/voronoi.md`.

`voronoi` partitions the final plot into the cells nearest to each unique
scaled x/y position. It emits renderer-neutral polygons clipped to the final
plot bounds. Import it from the optional spatial subpath; it is not included in
the root or universal barrel.

```ts
import { dot } from '@tanstack/charts'
import { voronoi } from '@tanstack/charts/spatial/voronoi'

const marks = [
  voronoi(cars, {
    x: 'weight',
    y: 'economy',
    key: 'id',
    color: 'cylinders',
    fillOpacity: 0.14,
    stroke: '#fff',
    strokeWidth: 1,
  }),
  dot(cars, {
    x: 'weight',
    y: 'economy',
    key: 'id',
    color: 'cylinders',
  }),
]
```

```ts
function voronoi<TDatum>(
  source: Iterable<TDatum>,
  options: VoronoiOptions<TDatum>,
): ChartMark<never, never, never, InferredX, InferredY>
```

The mark contributes x/y and color domains but intentionally emits no
`ChartPoint` interaction candidates.

### Options

| Option                                            | Type                                      | Default          | Meaning                                               |
| ------------------------------------------------- | ----------------------------------------- | ---------------- | ----------------------------------------------------- |
| `x`                                               | `Channel<TDatum, ChartValue?>`            | Required         | Source horizontal position                            |
| `y`                                               | `Channel<TDatum, ChartValue?>`            | Required         | Source vertical position                              |
| `z`                                               | `Channel<TDatum, ChartKey?>`              | One tessellation | Independent full-plot topology group                  |
| `key`                                             | `Channel<TDatum, ChartKey>`               | Inferred         | Stable source identity and coincident-cell ownership  |
| `color`                                           | `Channel<TDatum, ChartKey?>`              | No value         | Value sent to the color scale; never a topology group |
| `fill`                                            | `VisualChannel<TDatum, string>`           | Resolved color   | Cell fill                                             |
| `stroke`                                          | `VisualChannel<TDatum, string>`           | None             | Cell stroke                                           |
| `fillOpacity`, `strokeOpacity`, and `strokeWidth` | `number`                                  | Renderer default | Cell presentation                                     |
| `strokeDasharray`                                 | `string`                                  | None             | Cell stroke dash pattern                              |
| `opacity`                                         | `number`                                  | Renderer default | Whole-cell opacity                                    |
| `id`                                              | `string`                                  | Layer-derived    | Stable mark ID                                        |
| `motion`                                          | `ChartMarkMotionOptions<never>['motion']` | None             | Cell enter, update, and exit motion                   |

`fill` and `stroke` accessors receive the original source row, source index,
and complete source array.

### Final-screen topology

Complete x/y pairs establish the positional domains. After scales and inner
bounds resolve, the mark projects both axes, computes the Voronoi diagram in
screen space, and clips every cell to the plot rectangle. Resizing can change
cell geometry even when source values and domains are unchanged.

Inversion is not required, so continuous, temporal, and categorical
positional scales are supported. Missing, nonfinite, or unmappable pairs are
omitted without allowing one coordinate to expand the other coordinate's
domain. Zero valid positions produce no cells; one unique position fills the
plot; two positions split it; and collinear positions remain valid.

The generated polygons are ordinary scene areas, not SVG path strings, so the
same definition works with SVG, Canvas, and static rendering.

### Groups and identity

An explicit `z` creates an independent full-plot tessellation for every group.
Those diagrams overlap. Omit `z` when all observations should share one
partition; use `color` alone to paint categories without changing topology.

Supply `key` when source order can change. Exact coincident positions produce
one cell within each `z` group, with ownership chosen from a canonical ordering
of stable keys. This makes coincident ownership and cell keys deterministic
across reorderings. Distinct projected positions remain distinct even when
they are much closer than one pixel because nearby sites can still divide a
large visible region. The mark fails instead of merging sites if separate cell
boundaries cannot be represented by finite screen coordinates. Without an
explicit key, the mark tries a unique top-level or nested `id`, then falls back
to source index.

### Visible cells versus focus

Voronoi polygons are a visible encoding layer, not an interaction index. They
are hidden from accessibility navigation and add no pointer or keyboard focus
candidates. Layer `dot` or another interactive mark over the cells when the
source observations should drive nearest-point focus and tooltips. Both layers
can share x, y, color, and key channels without application-owned scale
projection or tooltip state.

If no cells should be painted and only lookup performance matters, provide a
`ChartSpatialIndexFactory` instead of adding a `voronoi` mark. See
[Tooltips and Focus](./interaction-accessibility.md#source-charts-docs-guides-tooltips-and-focus-md).
