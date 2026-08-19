# Cartesian and statistical marks

Cartesian, distribution, density, regression, and statistical mark reference.

<a id="source-charts-docs-reference-marks-bar-and-rect-md"></a>

## Bar And Rect

Source: `charts:docs/reference/marks/bar-and-rect.md`.

Bar marks encode a numeric interval against a categorical or positional
channel. Rect marks encode independent x and y intervals and are the general
primitive for heatmaps, interval blocks, and cells.

```ts
import { barX, barY, cell, group, rect, stack } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
```

### `barY`

`barY` draws vertical bars from `y1` to `y2` at x.

```ts
const mark = barY(rows, {
  x: 'category',
  y: 'value',
})
```

```ts
function barY<TDatum>(
  source: Iterable<TDatum>,
  options?: BarYOptions<TDatum>,
): ChartMark<TDatum, InferredX, number>
```

#### Options

| Option            | Type                                 | Default                        | Meaning                                          |
| ----------------- | ------------------------------------ | ------------------------------ | ------------------------------------------------ |
| `id`              | `string`                             | Layer-derived                  | Stable mark ID                                   |
| `x`               | `Channel<TDatum, ChartValue?>`       | Row index                      | Bar category or center                           |
| `y`               | `Channel<TDatum, number?>`           | Numeric datum                  | Length; implicitly stacked at each x             |
| `y1`              | `number \| Channel<TDatum, number?>` | Implicit stack start           | Explicit baseline endpoint                       |
| `y2`              | `number \| Channel<TDatum, number?>` | Implicit stack end             | Explicit value endpoint; takes precedence over y |
| `z`               | `Channel<TDatum, ChartKey?>`         | No group                       | Group identity; color fallback when omitted      |
| `color`           | `Channel<TDatum, ChartKey?>`         | `z`                            | Independent value sent to the chart color scale  |
| `key`             | `Channel<TDatum, ChartKey>`          | Top/nested `id`, x, then index | Stable scene and interaction identity            |
| `fill`            | `VisualChannel<TDatum, string>`      | Resolved `color`               | Final bar paint override                         |
| `fillOpacity`     | `number`                             | SVG default                    | Fill opacity                                     |
| `stroke`          | `VisualChannel<TDatum, string>`      | None                           | Bar outline color                                |
| `strokeOpacity`   | `number`                             | SVG default                    | Bar outline opacity                              |
| `strokeWidth`     | `number`                             | SVG default                    | Bar outline width                                |
| `strokeDasharray` | `VisualChannel<TDatum, string>`      | None                           | SVG outline dash pattern                         |
| `layout`          | `GroupLayout \| StackLayout`         | Implicit diverging stack       | Configures grouping or stack order/offset        |
| `inset`           | `number`                             | `0`                            | Pixels removed from both categorical edges       |
| `maxThickness`    | `number`                             | Unbounded                      | Maximum painted width after grouping and inset   |
| `radius`          | `number`                             | None                           | SVG rectangle corner radius                      |
| `states`          | `readonly ChartMarkState[]`          | None                           | Focus-driven presentation overrides              |

The interaction point is at the group-band center and the `y2`/`y` endpoint.
Its semantic `xValue` is x and its `yValue` is the value endpoint.

### `barX`

`barX` draws horizontal bars from `x1` to `x2` at y.

```ts
const mark = barX(rows, {
  x: 'value',
  y: 'category',
})
```

```ts
function barX<TDatum>(
  source: Iterable<TDatum>,
  options?: BarXOptions<TDatum>,
): ChartMark<TDatum, number, InferredY>
```

Its options transpose `barY`:

| Option         | Type                                 | Default                        | Meaning                                     |
| -------------- | ------------------------------------ | ------------------------------ | ------------------------------------------- |
| `id`           | `string`                             | Layer-derived                  | Stable mark ID                              |
| `x`            | `Channel<TDatum, number?>`           | Numeric datum                  | Length; implicitly stacked at each y        |
| `x1`           | `number \| Channel<TDatum, number?>` | Implicit stack start           | Explicit baseline endpoint                  |
| `x2`           | `number \| Channel<TDatum, number?>` | Implicit stack end             | Explicit value endpoint; takes precedence   |
| `y`            | `Channel<TDatum, ChartValue?>`       | Row index                      | Bar category or center                      |
| `z`            | `Channel<TDatum, ChartKey?>`         | No group                       | Group identity; color fallback when omitted |
| `color`        | `Channel<TDatum, ChartKey?>`         | `z`                            | Independent color-scale value               |
| `key`          | `Channel<TDatum, ChartKey>`          | Top/nested `id`, y, then index | Stable identity                             |
| `fill`         | `VisualChannel<TDatum, string>`      | Resolved `color`               | Final bar paint override                    |
| `fillOpacity`  | `number`                             | SVG default                    | Fill opacity                                |
| `layout`       | `GroupLayout \| StackLayout`         | Implicit diverging stack       | Configures grouping or stack order/offset   |
| `inset`        | `number`                             | `0`                            | Pixels removed from both categorical edges  |
| `maxThickness` | `number`                             | Unbounded                      | Maximum painted height after grouping/inset |
| `radius`       | `number`                             | None                           | Corner radius                               |
| `states`       | `readonly ChartMarkState[]`          | None                           | Focus-driven presentation overrides         |

The interaction point is at the `x2`/`x` endpoint and group-band center.

### Bar bandwidth

With a band scale on the categorical axis, bars use its responsive bandwidth.
With a nonband scale, the mark estimates width from the smallest distance
between distinct mapped positions and uses 80 percent of that distance. A
single-position fallback is capped at 48 pixels.

For predictable categorical bars, use a configured band scale and set its
padding. Scale setup and ownership are documented in
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md).

`inset` is applied after band or inferred layout and is clamped to at least
zero. A sufficiently large inset produces a zero-width or zero-height bar
rather than negative geometry.

`maxThickness` caps the painted width for `barY` or height for `barX` in final
chart pixels. The mark applies the cap after grouped-band layout and `inset`,
then centers the narrower bar in its resolved band. Narrow responsive bands
keep their natural size. Negative finite values clamp to zero; nonfinite values
do not cap the bar. Inline-state `inset` overrides remain absolute, but their
resolved geometry still honors the cap.

### Grouped bars

Grouping is explicit:

```ts
barY(rows, {
  x: 'quarter',
  y: 'revenue',
  color: 'region',
  layout: group(),
})
```

`group()` creates a secondary band scale inside the primary categorical band.
Use `group({ padding: 0.2 })` for the common spacing control, or pass
`group({ scale })` when subgroup order is fixed application state.
`GroupOptions` is the reusable configuration shape for those `padding` and
`scale` controls.

An explicit `z` supplies subgroup identity. If `z` is omitted, a discrete
`color` channel may supply identity after grouped geometry has been selected.
When both are present, `z` controls placement and interaction grouping while
`color` remains independent. A continuous color channel cannot infer series.

The mark throws when:

- the scale has no `bandwidth` method
- a grouped row has a null effective group value
- a group value is outside the group-scale domain or maps to a nonfinite position

Repeated positions stack by default. `layout: group()` is the explicit opt-in
to side-by-side geometry.

### Stacked bars

The single value channel is a length. Repeated categorical positions stack
automatically, with positive and negative values diverging from zero:

```ts
barY(rows, {
  x: 'quarter',
  y: 'revenue',
  color: 'region',
})
```

Use `z` when series identity differs from color. Add `layout: stack()` only
when the default stack needs a configured order or offset:

```ts
barY(rows, {
  x: 'quarter',
  y: 'revenue',
  color: 'segment',
  layout: stack({
    order: ['Core', 'Services'],
    offset: 'normalize',
  }),
})
```

`order` accepts input order, ascending or descending absolute totals,
inside-out streamgraph order, or an explicit series list. `reverse` reverses
the resolved order. `offset` accepts `diverging` (default), `normalize`,
`center`, or `wiggle`.

```ts
type StackOrder =
  'input' | 'ascending' | 'descending' | 'inside-out' | readonly ChartKey[]
type StackOffset = 'diverging' | 'normalize' | 'center' | 'wiggle'

interface StackAnchor {
  series: ChartKey
  fraction?: number
}

interface StackOptions {
  order?: StackOrder
  offset?: StackOffset
  reverse?: boolean
  anchor?: StackAnchor
}

interface StackLayout extends StackOptions {
  readonly type: 'stack'
}
```

`inside-out` uses each series peak and total to balance layers above and below
the stream. `wiggle` is intended for nonnegative streamgraph values. After the
wiggle offset is complete, Charts translates the whole stack so its global
minimum start is zero. It does not independently rebase each position.

Use `anchor` when ordered, nonnegative category counts should diverge around a
point inside one series. This Likert layout places the midpoint of `Neutral` at
zero:

```ts
barX(counts, {
  x: 'count',
  y: 'question',
  z: 'response',
  color: 'response',
  layout: stack({
    order: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree'],
    anchor: { series: 'Neutral', fraction: 0.5 },
  }),
})
```

`fraction` defaults to `0.5`; zero selects the series start and one selects its
end. Anchor layout zero-imputes missing position/series cells before translating
the completed stack, but it emits no synthetic rows. The anchor series may be
absent at a position. It must still appear in the resolved series order, which
an explicit `order` can establish. Anchors reject negative lengths and cannot
be combined with `normalize`, `center`, or `wiggle` offsets.

Positions and series retain first-seen order. Missing position/series pairs
contribute zero to layout without creating synthetic rows or interaction
points.

Supplying `y1` or `y2` opts out of implicit stacking and treats the channels
as authored endpoints. The same contract is transposed for `barX`.

### Bar baselines and invalid rows

Implicit stacks include zero in inferred quantitative domains. Explicit
endpoints contribute their authored bounds. The configured scale still owns
its semantic domain.

Rows are skipped when their category, baseline, or endpoint is invalid.
Negative and reversed intervals are supported because geometry uses the
minimum mapped endpoint and absolute length.

### `bandX` and `bandY`

`bandX` paints the complete plot height at each x value. `bandY` paints the
complete plot width at each y value. They are ordinary marks used for
categorical backgrounds and focus presentation:

```ts
whenFocused(
  bandX(rows, {
    x: 'category',
    fill: '#64748b',
    fillOpacity: 0.14,
    inset: -6,
  }),
  { match: 'x' },
)
```

`BandXOptions` and `BandYOptions` provide the positional channel, `z`, `color`,
`key`, `fill`, `fillOpacity`, `inset`, and `radius`. `bandX.width` and
`bandY.height` can replace scale or inferred bandwidth with an explicit
nonnegative scene-pixel size, which is useful for a one-pixel focus cursor. A
negative inset expands the resolved band. The helpers are also available from
`@tanstack/charts/band`.

### `rect`

`rect` draws one independent x/y interval per valid row:

```ts
const mark = rect(events, {
  x1: 'start',
  x2: 'end',
  y: 'lane',
  z: 'status',
})
```

```ts
function rect<TDatum>(
  source: Iterable<TDatum>,
  options: RectOptions<TDatum>,
): ChartMark<
  TDatum,
  InferredPointX,
  InferredPointY,
  InferredScaleX,
  InferredScaleY
>
```

#### Options

| Option        | Type                           | Default                                | Meaning                                              |
| ------------- | ------------------------------ | -------------------------------------- | ---------------------------------------------------- |
| `id`          | `string`                       | Layer-derived                          | Stable mark ID                                       |
| `x`           | `Channel<TDatum, ChartValue?>` | Row index                              | X center/category and preferred semantic focus value |
| `x1`          | `Channel<TDatum, ChartValue?>` | `x`, or row index when x is absent     | First x endpoint                                     |
| `x2`          | `Channel<TDatum, ChartValue?>` | `x`                                    | Second x endpoint                                    |
| `y`           | `Channel<TDatum, ChartValue?>` | Numeric datum                          | Y center/category and preferred semantic focus value |
| `y1`          | `Channel<TDatum, ChartValue?>` | `y`                                    | First y endpoint                                     |
| `y2`          | `Channel<TDatum, ChartValue?>` | `y`                                    | Second y endpoint                                    |
| `z`           | `Channel<TDatum, ChartKey?>`   | No group                               | Interaction group                                    |
| `color`       | `Channel<TDatum, ChartKey?>`   | `z`                                    | Value sent to the chart color scale                  |
| `key`         | `Channel<TDatum, ChartKey>`    | Top/nested `id`, x/y tuple, then index | Stable identity                                      |
| `fill`        | `string`                       | Resolved color                         | Final constant fill override                         |
| `fillOpacity` | `number`                       | SVG default                            | Fill opacity                                         |
| `stroke`      | `string`                       | None                                   | Constant stroke                                      |
| `strokeWidth` | `number`                       | SVG default                            | Stroke width                                         |
| `inset`       | `number`                       | `0.75`                                 | Pixels removed from all four edges                   |
| `radius`      | `number`                       | None                                   | Corner radius                                        |
| `states`      | `readonly ChartMarkState[]`    | None                                   | Focus-driven presentation overrides                  |

Both endpoints must be valid chart values. Endpoint order may be reversed.

When two semantic endpoints are equal and the resolved scale has bandwidth,
the rect spans that complete band. Otherwise it spans the mapped endpoint
distance. This lets `x: 'column', y: 'row'` create a heatmap cell without
manually deriving boundaries.

The interaction coordinate is the geometric center before inset. Semantic
point values use a valid `x` and `y`. An omitted `x` defaults to the row index;
an invalid x falls back to `x2`. An omitted or invalid y falls back to `y2`
unless the datum itself is numeric. Scale typing still includes all interval
endpoints, so a heterogeneous interval remains honest without widening
interaction callbacks unnecessarily.

### `cell`

`cell` is `rect` without explicit endpoint options:

```ts
const mark = cell(rows, {
  x: 'weekday',
  y: 'week',
  z: 'bucket',
  fillOpacity: 0.9,
})
```

```ts
type CellOptions<TDatum> = Omit<RectOptions<TDatum>, 'x1' | 'x2' | 'y1' | 'y2'>
```

Both axes normally use band scales. `cell` shares rect rendering, defaults,
focus behavior, and class names.

<a id="source-charts-docs-reference-marks-box-md"></a>

## Box

Source: `charts:docs/reference/marks/box.md`.

`boxY` summarizes raw observations into vertical boxplots. `boxX` transposes
the same statistical and interaction semantics into horizontal boxplots.
`boxRows` exposes their eager semantic preparation for reuse outside a mark.

```ts
import { boxY } from '@tanstack/charts/box'

boxY(rows, {
  x: 'group',
  y: 'value',
  key: 'id',
  fill: '#bfdbfe',
  stroke: '#2563eb',
})
```

The transform and both marks are also exported from `@tanstack/charts` and
`@tanstack/charts/universal`.

### Signatures

```ts
function boxY<TDatum>(
  source: Iterable<TDatum>,
  options: BoxYOptions<TDatum>,
): ChartMark<BoxDatum<TDatum, InferredX>, InferredX, number>

function boxX<TDatum>(
  source: Iterable<TDatum>,
  options: BoxXOptions<TDatum>,
): ChartMark<BoxDatum<TDatum, InferredY>, number, InferredY>

function boxRows<TDatum>(
  source: Iterable<TDatum>,
  options: BoxRowsOptions<TDatum>,
): BoxDatum<TDatum, InferredCategory>[]
```

`boxY` requires a categorical `x` channel and numeric `y` channel. `boxX`
requires numeric `x` and categorical `y`.

### Summary semantics

For each non-null category, the mark:

1. keeps finite numeric observations;
2. computes linearly interpolated first quartile, median, and third quartile;
3. places Tukey fences at 1.5 times the interquartile range below and above
   the box;
4. uses the lowest and highest observed values inside those fences as
   whiskers; and
5. emits observations strictly outside the fences as outliers.

Categories retain first-seen order. Outliers retain their global source order,
including when category rows are interleaved. A category with no finite value
is omitted. Singleton, two-value, and zero-IQR groups use the same rules rather
than a separate fallback.

The mark composes a whisker link, interquartile bar, median tick, and outlier
dots. Those native children remain renderer-neutral; the mark does not emit a
custom SVG path.

### Eager rows

Use `boxRows` when the same summary feeds multiple marks, a table, or
application logic:

```ts
import { boxRows } from '@tanstack/charts/box'

const prepared = boxRows(rows, {
  category: 'group',
  value: 'measurement',
})
```

`category` and `value` use the standard `TransformValue` contract. A field
name reads that field. An accessor receives `{ datum, index, data }`.
Preparation is eager, does not mutate source rows, and returns all summary rows
followed by outliers in global source order. The result contains semantic data
and lineage only; child-mark identity remains internal to `boxX` and `boxY`.

### Options

| Option          | Type                                                                   | Default        | Meaning                                                       |
| --------------- | ---------------------------------------------------------------------- | -------------- | ------------------------------------------------------------- |
| `id`            | `string`                                                               | Layer-derived  | Stable parent mark ID                                         |
| `x`             | `boxY: Channel<TDatum, ChartValue?>`; `boxX: Channel<TDatum, number?>` | Required       | Category for `boxY`; finite observation for `boxX`            |
| `y`             | `boxY: Channel<TDatum, number?>`; `boxX: Channel<TDatum, ChartValue?>` | Required       | Finite observation for `boxY`; category for `boxX`            |
| `key`           | `Channel<TDatum, ChartKey>`                                            | Inferred       | Stable raw-observation identity, including duplicate outliers |
| `fill`          | `string`                                                               | `#ccc`         | Interquartile box fill                                        |
| `fillOpacity`   | `number`                                                               | SVG default    | Interquartile box fill opacity                                |
| `stroke`        | `string`                                                               | `currentColor` | Whisker, median, and outlier stroke                           |
| `strokeOpacity` | `number`                                                               | SVG default    | Whisker, median, and outlier stroke opacity                   |
| `strokeWidth`   | `number`                                                               | Per child      | Overrides whisker, median, and outlier widths together        |
| `inset`         | `number`                                                               | `0`            | Pixels removed from both categorical edges of box and median  |
| `r`             | `number`                                                               | `3`            | Outlier radius in pixels                                      |
| `motion`        | `ChartMotionDefinition<BoxDatum<...>>`                                 | None           | Motion for derived summary and outlier data                   |

The orientation determines the exact `x` and `y` channel types; the combined
row above is shorthand. Use `BoxYOptions` or `BoxXOptions` when naming an
options object separately.

### Derived data and lineage

The chart datum is a discriminated union:

```ts
type BoxDatum<TDatum, TCategory> =
  | {
      kind: 'summary'
      category: TCategory
      q1: number
      median: number
      q3: number
      whiskerLow: number
      whiskerHigh: number
      count: number
      source: readonly TDatum[]
      sourceIndexes: readonly number[]
    }
  | {
      kind: 'outlier'
      category: TCategory
      value: number
      source: readonly [TDatum]
      sourceIndexes: readonly [number]
    }
```

Use `datum.kind` in tooltip, motion, or selection code. Summary lineage contains
every finite contributing observation in source order. An outlier retains its
exact source row and index.

The public type surface includes `BoxDatum`, `BoxYDatum`, `BoxXDatum`,
`BoxSummaryDatum`, `BoxOutlierDatum`, `BoxRowsOptions`, `BoxYOptions`, and
`BoxXOptions`.

### Interaction

Each category contributes one summary point owned by the box body and anchored
at the median. The whisker and median tick are decorative. Each outlier dot
contributes its own point and raw-row lineage. This keeps pointer, keyboard,
tooltip, and motion behavior from receiving duplicate summary targets for the
same category.

Supply `key` when observation identity matters across updates or when duplicate
outlier values can occur in one category.

<a id="source-charts-docs-reference-marks-contour-md"></a>

## Contour

Source: `charts:docs/reference/marks/contour.md`.

`contour` generates level sets from a regular scalar grid. Import it from the
optional spatial subpath; it is not included in the root or universal barrel.

```ts
import { contour } from '@tanstack/charts/spatial/contour'

const mark = contour(wind, {
  width: 64,
  height: 60,
  value: (row) => Math.hypot(row.u, row.v),
  thresholds: [2, 4, 6, 8, 10],
  stroke: '#fff',
  strokeWidth: 0.75,
})
```

```ts
function contour<TDatum>(
  source: Iterable<TDatum>,
  options: ContourOptions<TDatum>,
): ChartMark<never, never, never>
```

The mark contributes derived color values but no positional domains or
`ChartPoint` interaction candidates.

### Options

| Option                                            | Type                                          | Default          | Meaning                                        |
| ------------------------------------------------- | --------------------------------------------- | ---------------- | ---------------------------------------------- |
| `width`                                           | `number`                                      | Required         | Number of columns in the row-major grid        |
| `height`                                          | `number`                                      | Required         | Number of rows in the row-major grid           |
| `value`                                           | `Channel<TDatum, number?>`                    | Numeric identity | Scalar grid value                              |
| `thresholds`                                      | `number \| Iterable<number>`                  | Sturges          | Approximate level count or exact scalar levels |
| `smooth`                                          | `boolean`                                     | `true`           | Interpolate marching-squares crossings         |
| `color`                                           | `Channel<ContourDatum<TDatum>, ChartKey?>`    | Level value      | Derived value sent to the color scale          |
| `fill`                                            | `VisualChannel<ContourDatum<TDatum>, string>` | Resolved color   | Contour fill                                   |
| `stroke`                                          | `VisualChannel<ContourDatum<TDatum>, string>` | None             | Contour stroke                                 |
| `fillOpacity`, `strokeOpacity`, and `strokeWidth` | `number`                                      | Renderer default | Contour presentation                           |
| `strokeDasharray`                                 | `string`                                      | None             | Contour stroke dash pattern                    |
| `opacity`                                         | `number`                                      | Renderer default | Whole-contour opacity                          |
| `id`                                              | `string`                                      | Layer-derived    | Stable mark ID                                 |
| `motion`                                          | `ChartMarkMotionOptions<never>['motion']`     | None             | Contour enter, update, and exit motion         |

`width` and `height` must be positive integers, and the source length must be
exactly `width * height`. A numeric threshold count must be a positive integer.
Exact thresholds are copied and sorted without mutating the input iterable.

### Grid and lifecycle

Source values use row-major order. The first `width` values form Cartesian row
zero at the bottom of the plot; subsequent rows move upward. Null and nonfinite
values remain missing cells in their original grid positions instead of
shifting later samples.

Marching-squares topology depends only on the source grid, thresholds, and
`smooth`, so the mark generates it eagerly when the definition is built.
Ordinary rendering maps the resulting grid coordinates linearly into the final
plot rectangle and clips them there. Resizing changes that projection without
re-estimating topology or requiring positional scales.

Every rendered `ContourDatum<TDatum>` contains:

- `value`, the scalar threshold;
- `source`, the finite source rows; and
- `sourceIndexes`, their original input indexes.

Presentation accessors receive this derived datum and the complete rendered
contour array.

### Geometry and interaction

Each level is one structured scene area containing all disconnected polygons
and holes. SVG, Canvas, React Native SVG, hit geometry, gradients, and clipping
consume the same rings; the mark does not author SVG path strings or depend on
`d3-geo`.

A level can contain several disconnected regions, and an aggregate centroid
can fall outside all of them. The mark therefore does not manufacture a focus
target or tooltip datum. Layer an interactive source mark only when the grid
samples themselves should own focus and tooltips.

<a id="source-charts-docs-reference-marks-density-md"></a>

## Density

Source: `charts:docs/reference/marks/density.md`.

`densityContour` estimates a two-dimensional density field after the chart
resolves its positional scales and inner bounds. Import it from the optional
spatial subpath; it is not included in the root or universal barrel.

```ts
import { densityContour } from '@tanstack/charts/spatial/density'

const mark = densityContour(penguins, {
  x: 'billLength',
  y: 'billDepth',
  bandwidth: 18,
  thresholds: [0.0004, 0.0008, 0.0012, 0.0016, 0.002, 0.0024],
  fill: '#2563eb',
  fillOpacity: 0.16,
  stroke: '#1e3a8a',
})
```

```ts
function densityContour<TDatum>(
  source: Iterable<TDatum>,
  options: DensityContourOptions<TDatum>,
): ChartMark<never, never, never, InferredX, InferredY>
```

The mark contributes x/y and derived color domains but intentionally emits no
`ChartPoint` interaction candidates.

### Options

| Option                                            | Type                                         | Default          | Meaning                                                         |
| ------------------------------------------------- | -------------------------------------------- | ---------------- | --------------------------------------------------------------- |
| `x`                                               | `Channel<TDatum, ChartValue?>`               | Required         | Source horizontal observation                                   |
| `y`                                               | `Channel<TDatum, ChartValue?>`               | Required         | Source vertical observation                                     |
| `z`                                               | `Channel<TDatum, ChartKey?>`                 | `null` group     | Independent density-estimator group                             |
| `weight`                                          | `Channel<TDatum, number?>`                   | `1`              | Observation weight                                              |
| `bandwidth`                                       | `number`                                     | `20`             | Gaussian-kernel bandwidth in final CSS pixels                   |
| `cellSize`                                        | `number`                                     | `4`              | Density-grid cell size in final CSS pixels                      |
| `thresholds`                                      | `number \| Iterable<number>`                 | `20`             | Approximate shared level count or exact density levels          |
| `color`                                           | `Channel<DensityContourDatum, ChartKey?>`    | `group`          | Derived value sent to the color scale; never an estimator group |
| `fill`                                            | `VisualChannel<DensityContourDatum, string>` | Resolved color   | Contour fill                                                    |
| `stroke`                                          | `VisualChannel<DensityContourDatum, string>` | None             | Contour stroke                                                  |
| `fillOpacity`, `strokeOpacity`, and `strokeWidth` | `number`                                     | Renderer default | Contour presentation                                            |
| `strokeDasharray`                                 | `string`                                     | None             | Contour stroke dash pattern                                     |
| `opacity`                                         | `number`                                     | Renderer default | Whole-contour opacity                                           |
| `id`                                              | `string`                                     | Layer-derived    | Stable mark ID                                                  |
| `motion`                                          | `ChartMarkMotionOptions<never>['motion']`    | None             | Contour enter, update, and exit motion                          |

`bandwidth` must be nonnegative and finite. `cellSize` must be at least one;
the D3 estimator rounds it down to a supported power of two. A numeric
threshold count must be a positive integer. Exact thresholds use weighted
observations per CSS pixel squared, the native unit of `d3-contour`.

### Resolved estimation

Complete x/y pairs establish the positional domains. The mark maps them
through the final scales, estimates inside the final plot rectangle, and clips
the output there. Resizing or changing margins can change the contours even
when the semantic domains are fixed. Scale inversion is not required.

An explicit `z` runs one estimator per group. Numeric threshold counts resolve
to one shared set of levels using the maximum across every group, so levels
remain comparable. `color` affects presentation only and never partitions the
estimator.

Missing or unmappable x/y pairs and zero or nonfinite weights contribute
nothing. Finite signed weights are passed to the estimator. Every rendered
`DensityContourDatum<TDatum>` contains:

- `density`, the native threshold value;
- `group`, the explicit `z` value or `null`;
- `source`, the contributing input rows for that estimator group; and
- `sourceIndexes`, their original input indexes.

Presentation accessors receive this derived datum and the complete rendered
contour array.

### Geometry and interaction

Each level is one structured scene area containing all disconnected polygons
and holes. SVG, Canvas, React Native SVG, hit geometry, gradients, and clipping
consume the same rings; the mark does not author SVG path strings or depend on
`d3-geo`.

A contour can have several disconnected regions, and an aggregate centroid
can fall outside all of them. The mark therefore does not manufacture a
centroid focus target or tooltip datum. Layer an interactive source mark when
individual observations should own focus and tooltips.

<a id="source-charts-docs-reference-marks-difference-md"></a>

## Difference

Source: `charts:docs/reference/marks/difference.md`.

`differenceY` compares two numeric y channels along a numeric or temporal x
channel. It fills positive and negative lobes and draws both boundary lines.
`differenceX` transposes the same semantics to two numeric x channels along a
numeric or temporal y channel.

```ts
import { differenceY } from '@tanstack/charts/difference'

differenceY(rows, {
  x: 'date',
  y1: 'forecast',
  y2: 'actual',
  positiveFill: '#16a34a',
  negativeFill: '#dc2626',
})
```

Both marks are also exported from `@tanstack/charts` and
`@tanstack/charts/universal`.

### Signatures

```ts
function differenceY<TDatum>(
  source: Iterable<TDatum>,
  options: DifferenceYOptions<TDatum>,
): ChartMark<DifferenceDatum<TDatum, InferredX>, InferredX, number>

function differenceX<TDatum>(
  source: Iterable<TDatum>,
  options: DifferenceXOptions<TDatum>,
): ChartMark<DifferenceDatum<TDatum, InferredY>, number, InferredY>
```

For `differenceY`, `y1` is the comparison and `y2` is the primary value. A
positive lobe means `y2 > y1`; a negative lobe means `y2 < y1`.
`differenceX` applies the same rule to `x1` and `x2`.

The independent channel accepts finite numbers or valid `Date` values. One
mark input cannot mix the two kinds. The value channels accept numeric
constants or channels. Input order is path order; sort rows before creating the
mark when the semantic independent order differs from source order. Set `z` to
compare one pair of lines per first-seen group.

### Crossing and gap semantics

At every sign change, the mark maps both boundary segments through the final
x and y scales, solves their exact rendered crossing, and inverts that point
back to semantic values. The result remains exact with nonlinear log, power,
or symlog scales instead of assuming data-space interpolation is affine. Both
configured positional scales must support inversion.

The crossing belongs to both adjacent lobes, so the fills meet without overlap
or a gap. Consecutive equal values remain part of the neighboring lobe instead
of producing one-point areas.

A row with an invalid independent, comparison, or primary value creates the
same gap in both areas and both lines. Later valid rows begin new segments.
The mark composes ordinary `areaY`/`areaX` and `lineY`/`lineX` children; it does
not emit a case-specific path.

### Options

| Option                      | Type                                                 | Default         | Meaning                                          |
| --------------------------- | ---------------------------------------------------- | --------------- | ------------------------------------------------ |
| `id`                        | `string`                                             | Layer-derived   | Stable composite mark ID                         |
| `x` / `y`                   | Orientation-specific `Channel`                       | Required        | Numeric or temporal independent value            |
| `y1` / `x1`                 | `number \| Channel<TDatum, number?>`                 | Required        | Comparison boundary                              |
| `y2` / `x2`                 | `number \| Channel<TDatum, number?>`                 | Required        | Primary boundary                                 |
| `z`                         | `Channel<TDatum, ChartKey?>`                         | One group       | Independent comparison groups                    |
| `key`                       | `Channel<TDatum, ChartKey>`                          | Inferred        | Stable raw-row and derived-lobe identity         |
| `positiveFill`              | `VisualChannel<DifferenceAreaDatum, string> \| null` | `#3ca951`       | Positive-lobe paint; `null` omits the fill       |
| `negativeFill`              | `VisualChannel<DifferenceAreaDatum, string> \| null` | `#4269d0`       | Negative-lobe paint; `null` omits the fill       |
| `fillOpacity`               | `number`                                             | `0.2`           | Shared fill opacity                              |
| `positiveFillOpacity`       | `number`                                             | `fillOpacity`   | Positive-lobe opacity                            |
| `negativeFillOpacity`       | `number`                                             | `fillOpacity`   | Negative-lobe opacity                            |
| `stroke`                    | `VisualChannel<TDatum, string>`                      | `currentColor`  | Primary-line paint                               |
| `strokeOpacity`             | `number`                                             | SVG default     | Primary-line opacity                             |
| `strokeWidth`               | `number`                                             | `2.25`          | Primary-line width                               |
| `strokeDasharray`           | `string`                                             | None            | Primary-line dash pattern                        |
| `comparisonStroke`          | `VisualChannel<TDatum, string>`                      | `#64748b`       | Comparison-line paint                            |
| `comparisonStrokeOpacity`   | `number`                                             | `strokeOpacity` | Comparison-line opacity                          |
| `comparisonStrokeWidth`     | `number`                                             | `strokeWidth`   | Comparison-line width                            |
| `comparisonStrokeDasharray` | `string`                                             | None            | Comparison-line dash pattern                     |
| `points`                    | `boolean`                                            | `false`         | Draws points on both boundary lines              |
| `states`                    | `readonly ChartMarkState[]`                          | None            | Primary-line focus presentation                  |
| `comparisonStates`          | `readonly ChartMarkState[]`                          | None            | Comparison-line focus presentation               |
| `motion`                    | `ChartMotionDefinition<DifferenceDatum<...>>`        | None            | Motion over raw boundaries and derived area rows |

The orientation determines the exact channel types. Use `DifferenceYOptions`
or `DifferenceXOptions` when naming an options object separately. The two fill
channels receive derived area rows; the line paint and state channels receive
the original source rows.

### Derived data and lineage

Area children receive `DifferenceAreaDatum` rows:

```ts
interface DifferenceAreaDatum<TDatum, TIndependent> {
  kind: 'difference-area'
  independent: TIndependent
  comparison: number
  primary: number
  sign: 'positive' | 'negative'
  segment: string
  crossing: boolean
  markKey: ChartKey
  source: readonly TDatum[]
  sourceIndexes: readonly number[]
}

type DifferenceDatum<TDatum, TIndependent> =
  TDatum | DifferenceAreaDatum<TDatum, TIndependent>
```

The public type surface also includes `DifferenceIndependent` and
`DifferenceSign`.

An original area point retains its source row and index. An interpolated
crossing retains both adjacent source rows and indexes. `segment` and
`markKey` derive from stable group and source-boundary identity, so prepending
an unrelated lobe does not rename later geometry.

### Interaction

The positive and negative areas are decorative. The comparison and primary
lines each contribute interaction points that retain the original source-row
identity. Their child mark IDs end in `:comparison` and `:primary`, allowing a
tooltip or selection handler to distinguish the two values without receiving
synthetic crossing rows.

Set either fill to `null` to render one-sided emphasis. Set both to `null` to
retain the two interactive boundary lines without areas.

<a id="source-charts-docs-reference-marks-dodge-md"></a>

## Dodge

Source: `charts:docs/reference/marks/dodge.md`.

`dodgeY` preserves each dot's scaled x position and derives a collision-free y
position in final plot pixels. `dodgeX` transposes the layout: y is preserved
and x is derived.

```ts
import { dodgeY } from '@tanstack/charts/dodge'
import { dot } from '@tanstack/charts/dot'

dot(rows, {
  x: 'value',
  key: 'id',
  r: 4,
  layout: dodgeY({
    anchor: 'middle',
    padding: 1,
  }),
})
```

The layouts and `createDotLayout` are also exported from `@tanstack/charts` and
`@tanstack/charts/universal`.

### Signatures

```ts
function dodgeY(options?: {
  anchor?: 'top' | 'middle' | 'bottom'
  padding?: number
}): DodgeYLayout

function dodgeX(options?: {
  anchor?: 'left' | 'middle' | 'right'
  padding?: number
}): DodgeXLayout

function createDotLayout(options: {
  axis: 'x' | 'y'
  anchor: ChartValue
  resolve(context: {
    chart: ChartBounds
    measuredPositions: readonly number[]
    radii: readonly number[]
  }): readonly number[]
}): DotLayout
```

`dodgeY` defaults to `bottom`; `dodgeX` defaults to `left`. `padding` is the
empty pixel distance between neighboring circle edges and defaults to `1`.
It must be finite and nonnegative.

The public type surface also includes `CreateDotLayoutOptions`, `DotLayout`,
`DotLayoutResolveContext`, `DodgeOptions`, `DodgeXAnchor`, `DodgeYAnchor`,
`DodgeXOptions`, and `DodgeYOptions`.

### Custom layouts

Use `createDotLayout` when placement depends on final plot bounds but is not a
dodge. The resolver receives the preserved channel's scaled pixel positions
and the final radii in materialized valid-row order. Return one finite
cross-axis pixel position per materialized row. `dot` validates the result and
retains the authored `anchor` as the derived interaction-point value.

```ts
const rowLayout = createDotLayout({
  axis: 'y',
  anchor: 'rows',
  resolve: ({ chart, measuredPositions, radii }) =>
    measuredPositions.map(
      (_position, index) => chart.y + radii[index] + index * 12,
    ),
})
```

### Scale ownership

The measured channel remains an ordinary semantic chart value. A `dodgeY`
dot contributes only x scale values, so its chart definition needs an x scale
but no y scale. A `dodgeX` dot needs only a y scale.

```ts
defineChart({
  marks: [
    dot(rows, {
      x: 'economy',
      layout: dodgeY({ anchor: 'middle' }),
    }),
  ],
  x: { scale: scaleLinear().domain([5, 50]) },
})
```

Do not configure the generated channel: `y` with `dodgeY`, or `x` with
`dodgeX`. The generated interaction-point value is the logical anchor while
its `x` and `y` fields contain the actual laid-out pixel center.

### Collision and radius

Collision distance is the sum of both final dot radii and `padding`. Configure
`r` and `rScale` once on `dot`; the layout receives the same resolved radii
used for rendering.

Placement is synchronous and deterministic. Edge anchors choose the nearest
valid inward position. Middle anchors choose the valid position with the
smallest absolute displacement. Fixed-radius rows retain source order;
variable-radius rows are placed largest first with source order as the stable
tie-breaker.

### Identity, facets, and grouping

Every rendered point retains its source datum, source index, key, group,
state, and motion policy. Supply `key` when the measured channel contains
duplicates.

Each facet resolves its child dodge layout against that cell's final scales
and bounds. `z` and `color` affect ordinary dot grouping and paint; they do not
create separate collision lanes. Use facets when groups need independent
swarm bounds.

<a id="source-charts-docs-reference-marks-dot-and-hexagon-md"></a>

## Dot And Hexagon

Source: `charts:docs/reference/marks/dot-and-hexagon.md`.

`dot` and `hexagon` place fixed-pixel symbols at scaled x/y values. Their
radius does not change when a positional scale zooms or a chart resizes unless
the application changes `r` or `rScale`.

```ts
import { dot, hexagon } from '@tanstack/charts'
```

### `dot`

```ts
const mark = dot(rows, {
  x: 'date',
  y: 'value',
  z: 'series',
  r: 'population',
  rScale: radiusScale,
})
```

```ts
function dot<TDatum>(
  source: Iterable<TDatum>,
  options?: DotOptions<TDatum>,
): ChartMark<TDatum, InferredX, InferredY>
```

#### Options

| Option          | Type                                 | Default              | Meaning                               |
| --------------- | ------------------------------------ | -------------------- | ------------------------------------- |
| `id`            | `string`                             | Layer-derived        | Stable mark ID                        |
| `x`             | `Channel<TDatum, ChartValue?>`       | Row index            | Horizontal value                      |
| `y`             | `Channel<TDatum, ChartValue?>`       | Numeric datum        | Vertical value                        |
| `z`             | `Channel<TDatum, ChartKey?>`         | No group             | Interaction group                     |
| `color`         | `Channel<TDatum, ChartKey?>`         | `z`                  | Value sent to the chart color scale   |
| `key`           | `Channel<TDatum, ChartKey>`          | ID, x, y, x/y, index | Stable scene and interaction identity |
| `r`             | `number \| Channel<TDatum, number?>` | `3.5`                | Raw radius value                      |
| `rScale`        | `(value: number) => number`          | Identity             | Maps each valid raw radius to pixels  |
| `fill`          | `string`                             | Resolved color       | Final constant fill override          |
| `fillOpacity`   | `number`                             | SVG default          | Fill opacity                          |
| `layout`        | `DodgeXLayout \| DodgeYLayout`       | None                 | Resolved collision placement          |
| `stroke`        | `string`                             | None                 | Constant stroke                       |
| `strokeOpacity` | `number`                             | SVG default          | Stroke opacity                        |
| `strokeWidth`   | `number`                             | SVG default          | Stroke width                          |
| `states`        | `readonly ChartMarkState[]`          | None                 | Focus-driven presentation overrides   |

`rScale` is called only for finite, nonnegative raw radii. The mapped result
must also be finite and nonnegative or the row is skipped.

Unlike `hexagon`, `dot.fill` and `dot.stroke` are constants. Use `color` and
the chart color scale for data-driven dot color.

[`dodgeX` and `dodgeY`](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-dodge-md) derive one dot coordinate after the
measured axis scale and final plot bounds resolve. The generated coordinate
does not contribute a positional scale domain.

Without an explicit key, `dot` tries a unique top-level or nested `data.id`,
then x, y, and the x/y tuple. Supply `key` when positions can change while the
same entity should reconcile across updates.

### `hexagon`

`hexagon` draws a pointy-topped six-sided symbol.

```ts
const mark = hexagon(bins, {
  x: 'x',
  y: 'y',
  color: 'count',
  r: 'count',
  rScale: radiusScale,
})
```

```ts
function hexagon<TDatum>(
  source: Iterable<TDatum>,
  options?: HexagonOptions<TDatum>,
): ChartMark<TDatum, InferredX, InferredY>
```

#### Options

| Option          | Type                                 | Default                | Meaning                             |
| --------------- | ------------------------------------ | ---------------------- | ----------------------------------- |
| `id`            | `string`                             | Layer-derived          | Stable mark ID                      |
| `x`             | `Channel<TDatum, ChartValue?>`       | Row index              | Horizontal center                   |
| `y`             | `Channel<TDatum, ChartValue?>`       | Numeric datum          | Vertical center                     |
| `z`             | `Channel<TDatum, ChartKey?>`         | No group               | Interaction group                   |
| `color`         | `Channel<TDatum, ChartKey?>`         | `z`                    | Value sent to the chart color scale |
| `key`           | `Channel<TDatum, ChartKey>`          | Top/nested `id`, index | Stable identity                     |
| `r`             | `number \| Channel<TDatum, number?>` | `6`                    | Raw circumradius                    |
| `rScale`        | `(value: number) => number`          | Identity               | Maps radius values to pixels        |
| `fill`          | `VisualChannel<TDatum, string>`      | Resolved color         | Final fill override                 |
| `fillOpacity`   | `number`                             | SVG default            | Fill opacity                        |
| `stroke`        | `VisualChannel<TDatum, string>`      | None                   | Optional stroke per mark or row     |
| `strokeOpacity` | `number`                             | SVG default            | Stroke opacity                      |
| `strokeWidth`   | `number`                             | SVG default            | Stroke width                        |

The generated vertices begin at the top and proceed in 60-degree increments.
The interaction point remains at the scaled center, and its `color` is the
resolved fill.

### Valid rows and points

Both marks skip a row when x or y is not a valid `ChartValue`, or when the
final radius is negative, nonfinite, null, or undefined. A zero radius remains
a valid interaction point even though it has no visible area.

Every valid row emits one `ChartPoint` with:

- the original datum and row index
- semantic channel values in `xValue` and `yValue`
- scaled center coordinates in `x` and `y`
- `z` as its group
- fill paint as its interaction color

### Radius scales

Pass a numeric scale factory to infer `[0, maximum]` from the radius channel.
Configure its semantic pixel range inside the factory:

```ts
import { scaleSqrt } from 'd3-scale'

const rScale = {
  scale: () => scaleSqrt().range([2, 18]),
}
```

An ordinary numeric mapper or configured scale instance remains valid when
the application owns the complete mapping. The shared integration boundary is documented in
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md).

Radius does not contribute to x/y guide margins. Add an explicit partial
margin when large edge symbols must remain fully inside the SVG viewport.

<a id="source-charts-docs-reference-marks-hexbin-md"></a>

## Hexbin

Source: `charts:docs/reference/marks/hexbin.md`.

`hexbin` aggregates raw numeric x/y observations after the chart resolves its
positional scales and inner bounds. Import it from the optional spatial
subpath; it is not included in the root or universal barrel.

```ts
import { hexbin } from '@tanstack/charts/spatial/hexbin'

const mark = hexbin(rows, {
  x: 'weight',
  y: 'economy',
  binWidth: 24,
  color: 'count',
  r: 11,
  stroke: '#fff',
})
```

```ts
function hexbin<TDatum, TOutputs extends TransformOutputs<TDatum>>(
  source: Iterable<TDatum>,
  options: HexbinOptions<TDatum, TOutputs>,
): ChartMark<HexbinDatum<TDatum, TOutputs>, number, number>
```

Without `outputs`, each bin receives a numeric `count` output.

### Options

| Option                                            | Type                                      | Default              | Meaning                                       |
| ------------------------------------------------- | ----------------------------------------- | -------------------- | --------------------------------------------- |
| `x`                                               | `TransformValue<TDatum, number?>`         | Required             | Raw horizontal observation                    |
| `y`                                               | `TransformValue<TDatum, number?>`         | Required             | Raw vertical observation                      |
| `binWidth`                                        | `number`                                  | `20`                 | Horizontal pixel distance between bin centers |
| `outputs`                                         | `TransformOutputs<TDatum>`                | Count reducer        | Named reducers evaluated over each bin        |
| `id`                                              | `string`                                  | Layer-derived        | Stable mark ID                                |
| `z`                                               | `Channel<HexbinDatum, ChartKey?>`         | No group             | Interaction group                             |
| `color`                                           | `Channel<HexbinDatum, ChartKey?>`         | `z`                  | Derived value sent to the color scale         |
| `r`                                               | `number \| Channel<HexbinDatum, number?>` | Bin radius minus 1px | Rendered hexagon circumradius                 |
| `rScale`                                          | `ChartNumericScale`                       | Identity             | Maps a radius channel to pixels               |
| `fill`                                            | `VisualChannel<HexbinDatum, string>`      | Resolved color       | Final fill override                           |
| `stroke`                                          | `VisualChannel<HexbinDatum, string>`      | None                 | Final stroke override                         |
| `fillOpacity`, `strokeOpacity`, and `strokeWidth` | `number`                                  | SVG default          | Hexagon presentation                          |

`binWidth` must be positive and finite. Both positional scales must support
`invert`; continuous D3 scales and the compact TanStack linear scale do. A
band scale is not a valid hexbin position scale.

### Reducers and lineage

`outputs` uses the same reducer contract as eager transforms. Count, sum,
mean, minimum, maximum, and custom reducers are available:

```ts
hexbin(rows, {
  x: 'x',
  y: 'y',
  outputs: {
    count: { reduce: 'count' },
    total: { value: 'revenue', reduce: 'sum' },
  },
  color: 'total',
})
```

The margin solver may evaluate reducers during multiple resolved-layout
passes. Custom reducers must be synchronous, pure, deterministic, and must not
mutate source rows.

`HexbinDatum<TDatum, TOutputs>` contains:

- semantic `x` and `y` values obtained by inverting the lattice center;
- every named reducer output;
- `source`, retaining the original row objects in input order; and
- `sourceIndexes`, retaining their original indexes.

Rows with nonfinite or missing x/y values are omitted without renumbering the
remaining lineage. Every valid input row belongs to exactly one bin. The
interaction point datum is the complete `HexbinDatum`, so tooltips can show
counts, custom outputs, or source records without case-owned lookup tables.

### Responsive behavior

Initial raw x/y channels establish the positional domains. The mark then bins
their mapped pixel coordinates inside the final plot and contributes its
derived color channel before color-scale and legend resolution. Resizing may
change bin membership; repeated compilation at the same size is deterministic.

<a id="source-charts-docs-reference-marks-line-and-area-md"></a>

## Line And Area

Source: `charts:docs/reference/marks/line-and-area.md`.

Line and area marks consume an iterable directly. Channels may be compatible
field names or accessors. Rows whose required positional value is null,
undefined, invalid, or nonfinite create gaps instead of connecting across
missing data.

```ts
import {
  areaX,
  areaY,
  defineChart,
  lineX,
  lineY,
  stack,
} from '@tanstack/charts'
```

### `lineY`

`lineY` connects consecutive valid rows within each path group. An explicit
`z` defines the groups. When `z` is omitted and `color` is present, `color`
defines them.

```ts
const mark = lineY(rows, {
  x: 'date',
  y: 'value',
  z: 'series',
  points: true,
})
```

```ts
function lineY<TDatum>(
  source: Iterable<TDatum>,
  options?: LineYOptions<TDatum>,
): ChartMark<TDatum, InferredX, number>
```

#### Options

| Option            | Type                            | Default                        | Meaning                                        |
| ----------------- | ------------------------------- | ------------------------------ | ---------------------------------------------- |
| `id`              | `string`                        | Layer-derived                  | Stable mark ID                                 |
| `x`               | `Channel<TDatum, ChartValue?>`  | Row index                      | Horizontal value                               |
| `y`               | `Channel<TDatum, number?>`      | Numeric datum                  | Vertical value                                 |
| `z`               | `Channel<TDatum, ChartKey?>`    | No explicit group              | Path grouping; overrides color grouping        |
| `color`           | `Channel<TDatum, ChartKey?>`    | `z`                            | Color-scale value; groups when `z` is absent   |
| `key`             | `Channel<TDatum, ChartKey>`     | Top/nested `id`, x, then index | Stable interaction and scene identity          |
| `stroke`          | `VisualChannel<TDatum, string>` | Resolved color                 | Final path paint; evaluated from the first row |
| `strokeOpacity`   | `number`                        | SVG default                    | Stroke opacity                                 |
| `strokeWidth`     | `number`                        | `2.25`                         | Stroke width                                   |
| `strokeDasharray` | `string`                        | None                           | SVG dash array                                 |
| `points`          | `boolean`                       | `false`                        | Draws a radius-`2.5` dot at each valid point   |
| `curve`           | `ChartCurve`                    | Straight segments              | Optional path generator                        |
| `states`          | `readonly ChartMarkState[]`     | None                           | Focus-driven presentation overrides            |

Input order is path order. Sort rows before creating the mark when semantic x
order differs from input order. A null row flushes the current segment; later
valid rows begin a new segment in the same group.

Each valid row emits one interaction point at its scaled x/y coordinate.
`groupLabel` is the string form of the effective path group, or the mark ID
without a group.

### `lineX`

`lineX` is the transposed line mark. It connects numeric x values along a
numeric, categorical, or temporal y channel:

```ts
const mark = lineX(rows, {
  x: 'value',
  y: 'category',
  z: 'series',
  points: true,
})
```

```ts
function lineX<TDatum>(
  source: Iterable<TDatum>,
  options?: LineXOptions<TDatum>,
): ChartMark<TDatum, number, InferredY>
```

Its options transpose `lineY`: `x` is the numeric value channel and defaults
to a numeric datum; `y` is the longitudinal `ChartValue` channel and defaults
to row index. Identity falls back to y, invalid rows create segment gaps, and
input order remains path order. Grouping, paint, points, curves, states, and
motion use the same contract. Line interaction follows y affinity so keyboard
and pointer traversal match the longitudinal axis.

### `areaY`

`areaY` fills between a numeric upper channel and a numeric lower baseline
along x.

```ts
const mark = areaY(rows, {
  x: 'date',
  y1: 'low',
  y2: 'high',
  z: 'series',
})
```

```ts
function areaY<TDatum>(
  source: Iterable<TDatum>,
  options?: AreaYOptions<TDatum>,
): ChartMark<TDatum, InferredX, number>
```

#### Options

| Option        | Type                                 | Default                        | Meaning                                                        |
| ------------- | ------------------------------------ | ------------------------------ | -------------------------------------------------------------- |
| `id`          | `string`                             | Layer-derived                  | Stable mark ID                                                 |
| `x`           | `Channel<TDatum, ChartValue?>`       | Row index                      | Shared horizontal position                                     |
| `y`           | `Channel<TDatum, number?>`           | Numeric datum                  | Layer thickness; implicitly stacked at each x                  |
| `y1`          | `number \| Channel<TDatum, number?>` | Implicit stack start           | Explicit lower boundary                                        |
| `y2`          | `number \| Channel<TDatum, number?>` | Implicit stack end             | Explicit upper boundary; takes precedence over y               |
| `z`           | `Channel<TDatum, ChartKey?>`         | No explicit group              | Area grouping; overrides color grouping                        |
| `color`       | `Channel<TDatum, ChartKey?>`         | `z`                            | Color-scale value; groups when `z` is absent                   |
| `key`         | `Channel<TDatum, ChartKey>`          | Top/nested `id`, x, then index | Stable interaction identity                                    |
| `fill`        | `VisualChannel<TDatum, string>`      | Resolved color                 | Final area paint; evaluated from the group's first row         |
| `fillOpacity` | `number`                             | `0.2`                          | Fill opacity                                                   |
| `stroke`      | `VisualChannel<TDatum, string>`      | None                           | Optional boundary stroke, evaluated from the group's first row |
| `strokeWidth` | `number`                             | SVG default                    | Boundary stroke width                                          |
| `curve`       | `ChartCurve`                         | Straight segments              | Optional path generator                                        |
| `layout`      | `StackLayout`                        | Implicit diverging stack       | Configured stack order or offset                               |
| `states`      | `readonly ChartMarkState[]`          | None                           | Focus-driven presentation overrides                            |

Without explicit endpoints, repeated x positions stack by series. `z` defines
series; a discrete `color` channel may infer it when `z` is absent. Use
`layout: stack(options)` for explicit order, reversal, normalization,
centering, or wiggle offset. Supplying `y1` or `y2` opts out and preserves
authored interval boundaries.

Use `order: 'inside-out'` with `offset: 'wiggle'` for nonnegative
streamgraphs. Inside-out order follows series peaks and totals. The completed
wiggle stack is translated once so the global minimum start is zero; individual
positions are not rebased. Positions and series retain first-seen order, and a
missing position/series pair contributes zero to layout without emitting a
synthetic point.

Input order and null-gap behavior match the line marks. Each valid row emits
one point at the upper `y2`/`y` value, not at the lower baseline.

### `areaX`

`areaX` is the transposed interval area: it fills between left and right
numeric x values along y.

```ts
const mark = areaX(rows, {
  y: 'category',
  x1: 'minimum',
  x2: 'maximum',
  z: 'series',
})
```

```ts
function areaX<TDatum>(
  source: Iterable<TDatum>,
  options?: AreaXOptions<TDatum>,
): ChartMark<TDatum, number, InferredY>
```

#### Options

| Option        | Type                                 | Default                        | Meaning                                           |
| ------------- | ------------------------------------ | ------------------------------ | ------------------------------------------------- |
| `id`          | `string`                             | Layer-derived                  | Stable mark ID                                    |
| `x`           | `Channel<TDatum, number?>`           | Numeric datum                  | Layer thickness; implicitly stacked at each y     |
| `x1`          | `number \| Channel<TDatum, number?>` | Implicit stack start           | Explicit left boundary                            |
| `x2`          | `number \| Channel<TDatum, number?>` | Implicit stack end             | Explicit right boundary; takes precedence over x  |
| `y`           | `Channel<TDatum, ChartValue?>`       | Row index                      | Shared vertical position                          |
| `z`           | `Channel<TDatum, ChartKey?>`         | No explicit group              | Area grouping; overrides color grouping           |
| `color`       | `Channel<TDatum, ChartKey?>`         | `z`                            | Color-scale value; groups when `z` is absent      |
| `key`         | `Channel<TDatum, ChartKey>`          | Top/nested `id`, y, then index | Stable interaction identity                       |
| `fill`        | `VisualChannel<TDatum, string>`      | Resolved color                 | Final paint, evaluated from the group's first row |
| `fillOpacity` | `number`                             | `0.2`                          | Fill opacity                                      |
| `stroke`      | `VisualChannel<TDatum, string>`      | None                           | Optional boundary stroke                          |
| `strokeWidth` | `number`                             | SVG default                    | Boundary stroke width                             |
| `curve`       | `AreaXCurve`                         | Straight segments              | Optional transposed path generator                |
| `layout`      | `StackLayout`                        | Implicit diverging stack       | Configured stack order or offset                  |
| `states`      | `readonly ChartMarkState[]`          | None                           | Focus-driven presentation overrides               |

Without explicit endpoints, repeated y positions stack by series. Supplying
`x1` or `x2` opts out and preserves authored interval boundaries. Each valid
row emits one point at its right `x2`/`x` value.

Line and area paths have one paint value. When both channels are present,
`z` wins for grouping and `color` may supply a different semantic paint value.
Keep `color` constant within each explicit `z` group; the first row supplies
the path color.

### Curves

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
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md).

### Layering area and line

Area marks do not automatically draw their upper line. Compose the layers:

```ts
const definition = defineChart({
  marks: [
    areaY(rows, {
      x: 'date',
      y: 'value',
      z: 'series',
      fillOpacity: 0.16,
    }),
    lineY(rows, {
      x: 'date',
      y: 'value',
      z: 'series',
    }),
  ],
  x: { scale: xScale },
  y: { scale: yScale },
})
```

Use matching channels and scales when the two layers must align. Identity
inference is evaluated independently for every interactive layer; supply a
key only where its automatic candidate is not stable.

<a id="source-charts-docs-reference-marks-regression-md"></a>

## Regression

Source: `charts:docs/reference/marks/regression.md`.

`linearRegressionY` fits numeric y values over a numeric or temporal x channel.
`linearRegressionX` transposes the same semantics to fit numeric x values over
a numeric or temporal y channel. `linearRegressionRowsY` and
`linearRegressionRowsX` expose the sampled semantic rows directly.

```ts
import { linearRegressionY } from '@tanstack/charts/regression'

linearRegressionY(rows, {
  x: 'power',
  y: 'economy',
  ci: 0.95,
  stroke: '#dc2626',
})
```

The row transforms and both marks are also exported from `@tanstack/charts`
and `@tanstack/charts/universal`.

### Signatures

```ts
function linearRegressionY<TDatum>(
  source: Iterable<TDatum>,
  options: LinearRegressionYOptions<TDatum>,
): ChartMark<LinearRegressionYDatum<TDatum, InferredX>, InferredX, number>

function linearRegressionX<TDatum>(
  source: Iterable<TDatum>,
  options: LinearRegressionXOptions<TDatum>,
): ChartMark<LinearRegressionXDatum<TDatum, InferredY>, number, InferredY>

function linearRegressionRowsY<TDatum>(
  source: Iterable<TDatum>,
  options: LinearRegressionRowsYOptions<TDatum>,
): LinearRegressionYDatum<TDatum, InferredX>[]

function linearRegressionRowsX<TDatum>(
  source: Iterable<TDatum>,
  options: LinearRegressionRowsXOptions<TDatum>,
): LinearRegressionXDatum<TDatum, InferredY>[]
```

The independent channel accepts finite numbers or valid `Date` values. The
dependent channel is numeric. Nullish and non-finite observations are omitted.
Set `z` to fit one independent model per first-seen series.

### Fit and confidence semantics

Each group uses centered ordinary least squares. Centering avoids subtracting
large raw sums and keeps millisecond `Date` values stable. Groups with fewer
than two valid observations or no independent variance are omitted.

The confidence band describes the fitted mean, using a Student-t critical
value and residual degrees of freedom. `ci` defaults to `0.95`; set it to `0`
to omit the band. A two-point fit has no residual degrees of freedom, so it
renders the line without a band.

`samples` controls the number of evenly spaced values across the observed
semantic independent domain. It defaults to `64` and must be an integer of at
least two. This is deliberately not a pixel precision: changing chart size
does not change the model data or motion identity. Multiple samples also keep
the fitted path faithful when the independent scale is nonlinear.

### Eager rows

Use the row transforms when fitted values feed more than the convenience
mark:

```ts
import { linearRegressionRowsY } from '@tanstack/charts/regression'

const fitted = linearRegressionRowsY(rows, {
  x: 'date',
  y: 'value',
  z: 'series',
  samples: 32,
})
```

`x`, `y`, and `z` use the standard `TransformValue` contract. Accessors receive
`{ datum, index, data }`. The transform runs eagerly, does not mutate source
rows, omits invalid and unfittable groups, and returns only semantic samples
and lineage. `linearRegressionY` and `linearRegressionX` add presentation
identity when composing the confidence area and fitted line.

### Options

| Option            | Type                                                 | Default       | Meaning                                           |
| ----------------- | ---------------------------------------------------- | ------------- | ------------------------------------------------- |
| `id`              | `string`                                             | Layer-derived | Stable composite mark ID                          |
| `x`               | Orientation-specific `Channel`                       | Required      | Numeric dependent or number/Date independent data |
| `y`               | Orientation-specific `Channel`                       | Required      | Numeric dependent or number/Date independent data |
| `z`               | `Channel<TDatum, ChartKey?>`                         | One group     | Independent fit series                            |
| `ci`              | `number` in `[0, 1)`                                 | `0.95`        | Fitted-mean confidence level; `0` hides the band  |
| `samples`         | Integer                                              | `64`          | Semantic-domain samples per fit                   |
| `stroke`          | `string`                                             | Series color  | Regression-line paint                             |
| `strokeOpacity`   | `number`                                             | SVG default   | Regression-line opacity                           |
| `strokeWidth`     | `number`                                             | `1.5`         | Regression-line width                             |
| `strokeDasharray` | `string`                                             | None          | Regression-line dash pattern                      |
| `fill`            | `string`                                             | Line stroke   | Confidence-band paint                             |
| `fillOpacity`     | `number`                                             | `0.1`         | Confidence-band opacity                           |
| `motion`          | `ChartMotionDefinition<LinearRegression*Datum<...>>` | None          | Motion over derived samples                       |

### Derived data and lineage

Each interactive line sample contains its semantic independent value, fitted
value, optional confidence bounds, group, and aggregate lineage:

```ts
interface LinearRegressionYDatum<TDatum, TXValue> {
  x: TXValue
  y: number
  y1?: number
  y2?: number
  group: ChartKey | null
  source: readonly TDatum[]
  sourceIndexes: readonly number[]
}
```

`LinearRegressionXDatum` transposes these fields to `x`, optional `x1` and
`x2`, and independent `y`. Lineage contains only finite observations that
contributed to that group's fit, in source order.

The public option types are `LinearRegressionRowsYOptions`,
`LinearRegressionRowsXOptions`, `LinearRegressionYOptions`, and
`LinearRegressionXOptions`.

The confidence area and fitted line are ordinary `areaY`/`areaX` and
`lineY`/`lineX` children. Only the fitted line contributes interaction points;
the band is decorative. This prevents a tooltip or focus step from receiving
duplicate targets for the same fitted sample.

<a id="source-charts-docs-reference-marks-ridgeline-md"></a>

## Ridgeline

Source: `charts:docs/reference/marks/ridgeline.md`.

`ridgelineY` draws horizontal profiles above categorical y baselines.
`ridgelineX` transposes the contract and extends vertical profiles to the right
of categorical x baselines.

```ts
import { ridgelineY } from '@tanstack/charts/ridgeline'

const mark = ridgelineY(profileRows, {
  x: 'x',
  y: 'category',
  height: 'height',
  overlap: 0.8,
  color: 'category',
})
```

Both marks are also exported from `@tanstack/charts` and
`@tanstack/charts/universal`.

### Prepared profiles

The mark lays out prepared profile samples. It does not bin observations,
estimate a density, or normalize values. Keep those decisions visible with
transforms or application data preparation.

```ts
const bins = binX(rows, {
  value: 'rating',
  by: 'season',
  thresholds: boundaries,
  outputs: { count: { reduce: 'count' } },
})
const profiles = normalize(bins, {
  value: 'count',
  by: 'season',
  basis: 'max',
  as: 'height',
})

defineChart({
  marks: [
    ridgelineY(profiles, {
      x: 'x',
      y: 'season',
      height: 'height',
      overlap: 0.78,
      color: 'season',
    }),
  ],
  x: { scale: scaleLinear().domain([4, 10]) },
  y: {
    scale: scalePoint<number>().domain(seasons).padding(0.78),
    reverse: true,
  },
})
```

`height` must be finite and within `[0, 1]`. Nullish and nonfinite profile
positions or heights create gaps. Sort samples into the intended profile order
before passing them to the mark.

### Signatures

```ts
function ridgelineY<TDatum>(
  source: Iterable<TDatum>,
  options: RidgelineYOptions<TDatum>,
): ChartMark<TDatum>

function ridgelineX<TDatum>(
  source: Iterable<TDatum>,
  options: RidgelineXOptions<TDatum>,
): ChartMark<TDatum>
```

The profile position is numeric or temporal. The category is a numeric or
string `ChartKey`.

The public type surface includes `RidgelinePosition`, `RidgelineCurve`,
`RidgelineStateStyle`, `RidgelineYOptions`, and `RidgelineXOptions`.

### Options

| Option                                            | Type                                       | Default          | Meaning                                                  |
| ------------------------------------------------- | ------------------------------------------ | ---------------- | -------------------------------------------------------- |
| `x`                                               | `Channel<TDatum, number \| Date?>`         | Required by Y    | Horizontal profile position for `ridgelineY`             |
| `y`                                               | `Channel<TDatum, ChartKey?>`               | Required by Y    | Categorical baseline for `ridgelineY`                    |
| `x`                                               | `Channel<TDatum, ChartKey?>`               | Required by X    | Categorical baseline for `ridgelineX`                    |
| `y`                                               | `Channel<TDatum, number \| Date?>`         | Required by X    | Vertical profile position for `ridgelineX`               |
| `height`                                          | `Channel<TDatum, number?>`                 | Required         | Normalized displacement from the category baseline       |
| `overlap`                                         | `number`                                   | `1`              | Peak displacement in category-step units                 |
| `id`                                              | `string`                                   | Layer-derived    | Stable mark ID                                           |
| `key`                                             | `Channel<TDatum, ChartKey>`                | Inferred         | Stable profile-sample identity                           |
| `color`                                           | `Channel<TDatum, ChartKey?>`               | Category         | Value sent to the chart color scale                      |
| `fill`, `stroke`                                  | `VisualChannel<TDatum, string>`            | Resolved color   | Category profile paint; `stroke: null` omits the outline |
| `fillOpacity`, `strokeOpacity`, and `strokeWidth` | `number`                                   | Renderer default | Area and outline presentation                            |
| `strokeDasharray`                                 | `string`                                   | None             | Outline dash pattern                                     |
| `curve`                                           | `RidgelineCurve`                           | Straight         | Renderer-neutral profile path generator                  |
| `states`                                          | `readonly ChartMarkState[]`                | None             | Focus-driven opacity styles shared by area and outline   |
| `motion`                                          | `ChartMarkMotionOptions<TDatum>['motion']` | None             | Keyed area and outline motion policy                     |

`overlap` must be positive and finite. A value of `1` reaches the next category
baseline, values below `1` leave space, and values above `1` overlap adjacent
profiles.

### Category scale and padding

The categorical axis must resolve to a point or band scale. Ridge displacement
uses the smallest step in the complete configured domain, including categories
without profile rows. This keeps geometry stable when a category is empty.

Point-scale padding controls room outside the first and last baseline. Set its
padding to at least `overlap` when peaks must remain inside the plot. Use
`reverse: true` on a y scale when the first authored category should appear at
the bottom.

Categories paint in first-occurrence order; each category's area paints before
all outlines. Source order therefore controls which profile is on top when
`overlap` exceeds `1`.

### Identity and interaction

Each valid sample contributes one semantic interaction point even though the
mark paints both an area and an outline. The point retains the exact source
datum and index. `ridgelineY` reports the profile position as `xValue` and the
category as `yValue`; `ridgelineX` transposes them.

Profile areas and outlines share the same points, focus affinity, state opacity,
and keyed motion. Use an explicit `key` when positions repeat within a category.

<a id="source-charts-docs-reference-marks-violin-md"></a>

## Violin

Source: `charts:docs/reference/marks/violin.md`.

`violinY` draws vertical mirrored profiles around categorical x centers.
`violinX` transposes the contract around categorical y centers.

```ts
import { violinY } from '@tanstack/charts/violin'

violinY(profileRows, {
  x: 'category',
  y: 'position',
  width: 'width',
  span: 0.8,
  color: 'category',
})
```

Both marks are also exported from `@tanstack/charts` and
`@tanstack/charts/universal`.

### Prepared profiles and summaries

The mark mirrors prepared normalized widths. It does not choose bins, estimate
a density, normalize values, or calculate summaries.

```ts
const bins = binY(rows, {
  value: 'body_mass_g',
  by: 'species',
  thresholds: massBoundaries,
  outputs: { count: { reduce: 'count' } },
})
const profiles = normalize(bins, {
  value: 'count',
  by: 'species',
  basis: 'max',
  as: 'width',
})
const summaries = groupBy(rows, {
  by: 'species',
  outputs: {
    median: { value: 'body_mass_g', reduce: median },
  },
})

defineChart({
  marks: [
    violinY(profiles, {
      x: 'species',
      y: 'y',
      width: 'width',
      span: 0.76,
      color: 'species',
      curve: d3AreaXCurve(curveBasis),
    }),
    tickY(summaries, {
      x: 'species',
      y: 'median',
      span: 0.36,
    }),
    dot(summaries, { x: 'species', y: 'median' }),
  ],
  x: {
    scale: scalePoint<string>().domain(species).padding(0.5),
  },
  y: { scale: scaleLinear },
})
```

This example is a normalized histogram profile. A kernel density estimate can
feed the same mark, but its kernel and bandwidth remain data-preparation policy.

`width` must be finite and within `[0, 1]`. Nullish and nonfinite profile
positions or widths create gaps. Sort samples into the intended profile order
before passing them to the mark.

### Signatures

```ts
function violinY<TDatum>(
  source: Iterable<TDatum>,
  options: ViolinYOptions<TDatum>,
): ChartMark<TDatum>

function violinX<TDatum>(
  source: Iterable<TDatum>,
  options: ViolinXOptions<TDatum>,
): ChartMark<TDatum>
```

The profile position is numeric or temporal. The category is a numeric or
string `ChartKey`.

The public type surface includes `ViolinPosition`, `ViolinYCurve`,
`ViolinXCurve`, `ViolinYOptions`, and `ViolinXOptions`.

### Options

| Option                                            | Type                                       | Default          | Meaning                                                   |
| ------------------------------------------------- | ------------------------------------------ | ---------------- | --------------------------------------------------------- |
| `x`                                               | `Channel<TDatum, ChartKey?>`               | Required by Y    | Categorical center for `violinY`                          |
| `y`                                               | `Channel<TDatum, number \| Date?>`         | Required by Y    | Vertical profile position for `violinY`                   |
| `x`                                               | `Channel<TDatum, number \| Date?>`         | Required by X    | Horizontal profile position for `violinX`                 |
| `y`                                               | `Channel<TDatum, ChartKey?>`               | Required by X    | Categorical center for `violinX`                          |
| `width`                                           | `Channel<TDatum, number?>`                 | Required         | Normalized mirrored envelope width                        |
| `span`                                            | `number`                                   | `0.8`            | Full peak width in category-step units                    |
| `id`                                              | `string`                                   | Layer-derived    | Stable mark ID                                            |
| `key`                                             | `Channel<TDatum, ChartKey>`                | Inferred         | Stable profile-sample identity                            |
| `color`                                           | `Channel<TDatum, ChartKey?>`               | Category         | Value sent to the chart color scale                       |
| `fill`, `stroke`                                  | `VisualChannel<TDatum, string>`            | Resolved color   | Envelope paint; `stroke: null` omits the outline          |
| `fillOpacity`, `strokeOpacity`, and `strokeWidth` | `number`                                   | Renderer default | Envelope presentation                                     |
| `strokeDasharray`                                 | `string`                                   | None             | Outline dash pattern                                      |
| `curve`                                           | `ViolinYCurve` or `ViolinXCurve`           | Straight         | Orientation-specific renderer-neutral area path generator |
| `states`                                          | `readonly ChartMarkState[]`                | None             | Focus-driven area styles                                  |
| `motion`                                          | `ChartMarkMotionOptions<TDatum>['motion']` | None             | Keyed envelope motion policy                              |

`span` must be positive and finite. `span: 1` makes a peak one complete
category step wide. Values above `1` can overlap adjacent categories.

Use `d3AreaXCurve(curveBasis)` for a curved `violinY`. Use
`d3Curve(curveBasis)` for a curved `violinX`.

### Category scale, identity, and interaction

The categorical axis must resolve to a point or band scale. Width uses the
smallest step in the complete configured domain, including categories without
profile rows. A single-category profile uses a bounded plot-relative fallback.

Each valid sample contributes one interaction point at its semantic category
center even though the envelope has two painted boundaries. The point retains
the exact source datum and index. `violinY` reports the category as `xValue`
and profile position as `yValue`; `violinX` transposes them. Use an explicit
`key` when positions repeat within a category.
