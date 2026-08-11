# Core visualization patterns

Common annotations, bars, distributions, heatmaps, intervals, lines, scatterplots, and stacking.

<a id="source-charts-docs-examples-annotations-and-overlays-md"></a>

## Annotations And Overlays

Source: `charts:docs/examples/annotations-and-overlays.md`.

Annotations explain selected evidence. They should name a threshold, event,
endpoint, difference, or unusual observation that matters to the reader.

Treat an annotation as data whenever possible. A prepared row with semantic
coordinates survives resizing, scale changes, server rendering, and updates
more reliably than a hand-positioned SVG fragment.

### Choose the annotation

| Reader question                                        | Start with                             |
| ------------------------------------------------------ | -------------------------------------- |
| How did each category change between two periods?      | Slopegraph with direct endpoint labels |
| In which direction did a point move in two dimensions? | Change arrow                           |
| Where is a target, zero, or policy boundary?           | Rule plus concise text                 |
| Which time span needs explanation?                     | Explicit interval rectangle or area    |
| Which few observations are notable?                    | Selected dots and text                 |
| Does the reader need arbitrary HTML or controls?       | Application-owned overlay              |

[Marks and Layering](./chart-grammar.md#source-charts-docs-concepts-marks-and-layering-md) is the source of truth
for render order and stable layer identity.

### Label before-and-after change

A slopegraph gives both periods a shared quantitative scale, connects each
category's endpoints, and labels the values directly.

<!-- ::chart-example id=30-slopegraph height=480 -->

Preserve category identity for the links and endpoints; supply `key` only when
the mark cannot infer it. Direct labels remove a legend lookup, but they need
collision policy when values converge. Filter to meaningful categories,
increase vertical space, or use an accessible detail view rather than allowing
unreadable overlap.

A slope implies before-to-after order. Label both periods and keep the same
quantitative scale.

### Show two-dimensional movement

A change arrow connects one quantitative state to another. Position carries
the start and end values; the arrowhead carries direction.

<!-- ::chart-example id=32-change-arrows height=480 -->

Keep both endpoints in the prepared row. Do not infer direction from color or
row order inside the renderer. Label the compared states and retain original
values for focus and tooltips.

Arrow and link endpoint channels are defined in
[Rules, Links, Arrows, Vectors, and Ticks](./marks-composite.md#source-charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md).

### Add thresholds and bands

Use a rule for a single semantic value:

- Zero
- Target
- Regulatory threshold
- Average or benchmark
- Current time

Use a ranged area or rectangle when the annotation is an interval:

- Acceptable range
- Forecast uncertainty
- Maintenance window
- Selected time span

Name the threshold or band in surrounding text or a sparse text layer. A
decorative grid line should not compete with a policy boundary that carries
meaning.

### Select annotations in data preparation

Prepare or select a small annotation dataset:

1. Select observations by a documented rule such as minimum, maximum, first
   threshold crossing, or named event.
2. Keep the original datum and stable ID when the source row already carries
   the annotation's semantic coordinates.
3. Put presentation-only label formatting, anchors, and x/y offsets on the
   text mark. Add fields only when they are reusable annotation data.
4. Render dots, rules, links, and text as independent marks.

This makes the selection auditable. The chart renderer should not decide which
business events are interesting.

[Data and Channels](./chart-grammar.md#source-charts-docs-concepts-data-and-channels-md) covers mixed mark sources
and typed accessors.

### Use HTML overlays only when necessary

An application overlay is appropriate for:

- Rich interactive content
- Buttons, links, forms, or menus
- A persistent details panel
- A nested chart
- Product chrome that should not be serialized into SVG

Anchor it from `scene.chart` or a focused `ChartPoint`, then keep its state and
lifecycle in the application. Do not mutate chart SVG to create a second,
unreconciled state model.

See [Tooltips and Focus](./interaction-accessibility.md#source-charts-docs-guides-tooltips-and-focus-md) for rich tooltip
ownership and [Interactive Charts](./examples-advanced.md#source-charts-docs-examples-interactive-charts-md) for complete
application-controlled examples.

### Production checks

- Every annotation answers a specific reader question.
- Selection rules are prepared and testable.
- Labels include units or period meaning where needed.
- Text collision is verified at the smallest container.
- Offsets remain relative to semantic coordinates after resize.
- Color is not the only distinction between data and annotation.
- Decorative geometry emits no fake interaction points.
- Dynamic layers have stable mark IDs and datum keys.
- Rich overlays are keyboard reachable, contained, and destroyed on unmount.

Text channel and positioning options are in
[Text, Frame, and Facet](./marks-composite.md#source-charts-docs-reference-marks-text-frame-and-facet-md).

<a id="source-charts-docs-examples-bars-and-rankings-md"></a>

## Bars And Rankings

Source: `charts:docs/examples/bars-and-rankings.md`.

Bars answer categorical magnitude questions through length from a shared
baseline. Sort them when rank is part of the question, keep a semantic order
when sequence matters, and use a lighter comparison mark when a filled bar
would overstate the data.

### Choose the comparison

| Reader question                                                   | Start with                                                                             |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Which category has the largest or smallest value?                 | Sorted bars                                                                            |
| Which categories have notable endpoints without emphasizing area? | Lollipops                                                                              |
| How far apart are two values for each category?                   | Dumbbells                                                                              |
| How do signed contributions bridge from a start to a total?       | A waterfall                                                                            |
| How do subgroups contribute to each category?                     | Grouped or stacked bars in [Stacked and Composed Charts](./examples-core.md#source-charts-docs-examples-stacked-and-composition-md) |

Use horizontal bars when labels are long or when the rank itself should read
top to bottom. [Layout, Axes, and Coordinates](./chart-grammar.md#source-charts-docs-concepts-layout-axes-and-coordinates-md)
shows how categorical orientation and automatic guide margins fit together.

### Rank categories with bars

Sorting the scale domain makes the intended ranking explicit. Sorting only the
input rows is insufficient when several layers or prepared datasets share the
same categorical axis.

```ts group=sorted-bars env=charts file=/src/chart.ts entry
import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const rows = [
  { category: 'Search', value: 84 },
  { category: 'Direct', value: 63 },
  { category: 'Referral', value: 47 },
  { category: 'Social', value: 31 },
]

const ranked = [...rows].sort((a, b) => b.value - a.value)

const chart = defineChart({
  marks: [barY(ranked, { x: 'category', y: 'value', inset: 2 })],
  x: {
    scale: () =>
      scaleBand<string>()
        .domain(ranked.map((row) => row.category))
        .padding(0.16),
  },
  y: {
    scale: scaleLinear,
    nice: true,
    grid: true,
    axis: { label: 'Weekly signups' },
  },
})

export default chart
```

[Open the larger catalog case](https://tanstack.com/charts/catalog/bar-vertical-sorted/)
to inspect responsive label rotation and data updates.

Bar charts normally include zero on the quantitative domain. Truncating that
baseline turns small differences into large apparent changes.

### Reduce visual weight with lollipops

A lollipop keeps the common baseline and precise endpoint while replacing the
filled rectangle with a thin link. It is useful for many categories or when
the endpoint matters more than area.

<!-- ::chart-example id=16-lollipop height=480 -->

Compose the stem and endpoint as separate marks. The
[Rules, Links, Arrows, Vectors, and Ticks reference](./marks-composite.md#source-charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md)
defines the link channels; [Dot and Hexagon Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-dot-and-hexagon-md)
defines the endpoint layer.

### Compare two values per category

Dumbbells emphasize the distance and direction between two endpoints without
implying the combined area of grouped bars.

<!-- ::chart-example id=17-dumbbell height=480 -->

Label the endpoint semantics in a legend or surrounding text. If chronological
order between two periods is the message, a slopegraph may be more direct; if
absolute magnitudes must remain independently comparable, use grouped bars.

### Explain a bridge to a total

A waterfall requires cumulative preparation. Each contribution becomes an
explicit lower and upper interval; the renderer should not guess whether a row
is a delta, subtotal, or total.

<!-- ::chart-example id=29-waterfall height=480 -->

Keep the cumulative calculation in application data preparation and pass the
prepared interval channels to a ranged bar or rectangle. The ownership boundary
is described in [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md), and the geometry
contracts are in [Bar and Rect Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-bar-and-rect-md).

### Production checks

- Preserve a semantic category order unless rank is the question.
- Include zero for ordinary bar magnitudes; use explicit interval endpoints for
  floating and waterfall bars.
- Avoid encoding the same distinction only by color. Labels, position, and
  shape can carry the essential comparison.
- Verify long labels and rotated ticks with
  [Responsive Charts](./production.md#source-charts-docs-guides-responsive-charts-md).
- Preserve unique category values when bars reorder or animate; supply `key`
  only when the category does not identify a row. See
  [Dynamic Data and Animation](./composition.md#source-charts-docs-guides-dynamic-data-and-animation-md).

<a id="source-charts-docs-examples-distributions-md"></a>

## Distributions

Source: `charts:docs/examples/distributions.md`.

Distribution charts answer where observations lie, how widely they vary, and
whether groups differ in shape or rank. The right encoding depends on whether
the reader needs familiar bins, compact summaries, cumulative probability, or
the detailed shape of each group.

### Choose the comparison

| Reader question                                            | Start with                        |
| ---------------------------------------------------------- | --------------------------------- |
| How often do values fall within fixed ranges?              | Histogram                         |
| How do center, spread, and outliers compare across groups? | Boxplot                           |
| What proportion of observations is at or below each value? | Empirical cumulative distribution |
| How do several binned profiles compare in limited space?   | Ridgeline                         |
| How do several mirrored distribution profiles compare?     | Violin                            |
| Must every observation remain visible?                     | A beeswarm or strip layout        |

Binning, standalone quantiles, and density estimation are data preparation.
`boxX` and `boxY` own their complete Tukey summaries because independently
prepared quartiles, fences, whiskers, and outliers can drift. Dot collision
placement belongs to the chart because it depends on final scales, plot bounds,
and pixel radii.

### Preserve observations with a beeswarm

Use a dodge layout when every observation should remain visible without moving
its measured coordinate.

```ts
dot(rows, {
  x: 'economy (mpg)',
  key: 'id',
  r: 4,
  layout: dodgeY({ anchor: 'middle', padding: 1 }),
})
```

<!-- ::chart-example id=52-beeswarm-dodge height=480 -->

The [Dodge Layouts reference](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-dodge-md) covers anchors,
variable radii, identity, and facets.

### Inspect frequency with a histogram

A histogram groups quantitative observations into intervals. Keep thresholds
stable when comparing revisions or groups; otherwise a changed binning decision
can look like a changed distribution.

```ts group=basic-histogram env=charts file=/src/chart.ts entry
import { binX, defineChart, rect } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const responseTimes = [
  82, 91, 96, 103, 108, 112, 118, 121, 127, 131, 138, 144, 149, 153, 162, 171,
  184, 196,
]

const bins = binX(responseTimes, {
  value: (datum) => datum,
  thresholds: [80, 100, 120, 140, 160, 180, 200],
  outputs: { count: { reduce: 'count' } },
})

const chart = defineChart({
  marks: [
    rect(bins, {
      x1: 'x1',
      x2: 'x2',
      y1: () => 0,
      y2: 'count',
      inset: 1,
      fill: '#2563eb',
    }),
  ],
  x: { scale: scaleLinear, axis: { label: 'Response time (ms)' } },
  y: { scale: scaleLinear, grid: true, axis: { label: 'Requests' } },
})

export default chart
```

[Open the catalog histogram](https://tanstack.com/charts/catalog/histogram/)
for the complete vehicle dataset and update behavior.

The prepared rows should carry each bin's lower bound, upper bound, and count or
proportion. Render those intervals with
[Bar and Rect Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-bar-and-rect-md). The
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) explains how the
application chooses thresholds and reductions.

### Compare compact summaries

A boxplot summarizes quartiles, a median, whiskers, and optional outliers. It is
compact and comparable, but it does not reveal modes, gaps, or sample size on
its own.

<!-- ::chart-example id=15-boxplot height=480 -->

Pass the raw observations to `boxY`, or use `boxX` for horizontal boxes:

```ts
boxY(morley, {
  x: 'Expt',
  y: 'Speed',
  key: 'Run',
  fill: '#bfdbfe',
  stroke: '#2563eb',
})
```

The mark owns quartiles, 1.5-IQR Tukey fences, observed whiskers, outlier
partitioning, and direct source lineage. Its tooltip datum discriminates
`kind: 'summary'` from `kind: 'outlier'`. The [Box Marks reference](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-box-md)
documents the exact statistics, styling, and interaction targets.

### Preserve every rank with an ECDF

An empirical cumulative distribution shows the proportion of observations at
or below each observed value. It avoids bin-width decisions and supports direct
percentile comparisons.

<!-- ::chart-example id=50-empirical-cdf height=480 -->

Use a step curve because the empirical proportion changes at observations, not
continuously between them. State whether ties share a rank and format the
vertical axis as a proportion.

### Compare binned profiles

Use a ridgeline when several prepared profiles need a shared quantitative axis
and compact categorical baselines.

```ts
const profiles = normalize(
  binX(episodes, {
    value: 'imdb_rating',
    by: 'season',
    thresholds: ratingBoundaries,
    outputs: { count: { reduce: 'count' } },
  }),
  {
    value: 'count',
    by: 'season',
    basis: 'max',
    as: 'height',
  },
)

ridgelineY(profiles, {
  x: 'x',
  y: 'season',
  height: 'height',
  overlap: 0.78,
  color: 'season',
})
```

<!-- ::chart-example id=62-ridgeline-density height=480 -->

`binX` retains the episodes in each bin, `normalize` retains each bin as its
immediate source, and `ridgelineY` owns only the responsive category-step
offset. This example is a normalized histogram profile, not a kernel density
estimate. The [Ridgeline Marks reference](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-ridgeline-md)
documents overlap, category scales, curves, and interaction.

### Compare detailed group shapes

A violin mirrors a prepared normalized profile around each category. It can
show modes and shape that a boxplot hides. Its interpretation still depends on
the authored bins or density estimator.

```ts
const profiles = normalize(
  binY(observations, {
    value: 'body_mass_g',
    by: 'species',
    thresholds: massBoundaries,
    outputs: { count: { reduce: 'count' } },
  }),
  {
    value: 'count',
    by: 'species',
    basis: 'max',
    as: 'width',
  },
)
const summaries = groupBy(observations, {
  by: 'species',
  outputs: {
    median: { value: 'body_mass_g', reduce: median },
  },
})

violinY(profiles, {
  x: 'species',
  y: 'y',
  width: 'width',
  span: 0.76,
  color: 'species',
  curve: d3AreaXCurve(curveBasis),
})
tickY(summaries, { x: 'species', y: 'median', span: 0.36 })
dot(summaries, { x: 'species', y: 'median' })
```

<!-- ::chart-example id=63-violin-distributions height=480 -->

`violinY` owns only mirrored category-step geometry. `binY`, max normalization,
and the median stay visible and retain source lineage. This catalog example is
a smoothed normalized histogram, not a kernel density estimate. The
[Violin Marks reference](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-violin-md) documents category
scales, spans, curves, and interaction.

### Production checks

- Use counts when sample size matters and proportions when comparing groups of
  different sizes.
- Keep thresholds and density parameters consistent across comparable views.
- Show sample size or raw observations when a summary could hide sparse data.
- Supply exact values through tooltips, tables, or textual summaries; see
  [Tooltips and Focus](./interaction-accessibility.md#source-charts-docs-guides-tooltips-and-focus-md) and
  [Accessibility](./interaction-accessibility.md#source-charts-docs-guides-accessibility-md).
- Use facets when each group needs its own complete distribution view. See
  [Faceting and Composition](./composition.md#source-charts-docs-guides-faceting-and-composition-md).

Area channel details are in
[Line and Area Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-line-and-area-md).

<a id="source-charts-docs-examples-heatmaps-and-densities-md"></a>

## Heatmaps And Densities

Source: `charts:docs/examples/heatmaps-and-densities.md`.

Heatmaps and density charts answer where values concentrate across two
dimensions. A matrix uses explicit row and column categories or intervals.
Contours summarize a regular scalar grid or an estimated point field; spatial
bins summarize local observations. Choose the representation that preserves
the question instead of defaulting to one color per raw observation.

### Choose the comparison

| Reader question                                               | Start with                  |
| ------------------------------------------------------------- | --------------------------- |
| How does daily activity vary by week and weekday?             | Token use calendar heatmap  |
| How many observations fall in each quantitative x-y interval? | Binned quantitative heatmap |
| What regions of a regular scalar grid cross selected levels?  | Scalar-grid contours        |
| What smooth regions enclose similar point density?            | Density contours            |
| Where are dense clusters while retaining local bin shape?     | Hexagonal bins              |
| What value belongs to each pair of named categories?          | An ordinal cell matrix      |

[Data and Channels](./chart-grammar.md#source-charts-docs-concepts-data-and-channels-md) explains interval and
color channels. [Legends and Color](./composition.md#source-charts-docs-guides-legends-and-color-md) covers
continuous color meaning and accessible legend design.

### Start with a labeled matrix

An ordinal matrix uses categories on both axes and one quantitative value for
each cell. Direct labels preserve exact values while color makes broad patterns
visible.

```ts group=labeled-matrix env=charts file=/src/chart.ts entry
import { cell, colorGradientLegend, defineChart, text } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from 'd3-scale'
import { quarters, scores, teams } from './data'

export default defineChart({
  marks: [
    cell(scores, {
      x: 'quarter',
      y: 'team',
      color: 'score',
      key: (row) => `${row.team}-${row.quarter}`,
      inset: 1,
    }),
    text(scores, {
      x: 'quarter',
      y: 'team',
      text: (row) => row.score.toFixed(0),
      fill: '#0f172a',
      fontWeight: 650,
    }),
  ],
  x: {
    scale: () => scaleBand<string>().domain(quarters).padding(0.04),
    axis: { label: 'Quarter' },
  },
  y: {
    scale: () => scaleBand<string>().domain(teams).padding(0.04),
    axis: { label: 'Team' },
  },
  color: {
    scale: () =>
      scaleLinear<string>().domain([60, 100]).range(['#eff6ff', '#60a5fa']),
    legend: colorGradientLegend({ label: 'Score', steps: 8 }),
  },
})
```

```ts group=labeled-matrix file=/src/data.ts collapsed
export const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
export const teams = ['Core', 'Cloud', 'Mobile']

export const scores = [
  { team: 'Core', quarter: 'Q1', score: 72 },
  { team: 'Core', quarter: 'Q2', score: 78 },
  { team: 'Core', quarter: 'Q3', score: 84 },
  { team: 'Core', quarter: 'Q4', score: 88 },
  { team: 'Cloud', quarter: 'Q1', score: 66 },
  { team: 'Cloud', quarter: 'Q2', score: 74 },
  { team: 'Cloud', quarter: 'Q3', score: 81 },
  { team: 'Cloud', quarter: 'Q4', score: 86 },
  { team: 'Mobile', quarter: 'Q1', score: 82 },
  { team: 'Mobile', quarter: 'Q2', score: 79 },
  { team: 'Mobile', quarter: 'Q3', score: 91 },
  { team: 'Mobile', quarter: 'Q4', score: 94 },
]
```

### Bin events into a calendar

A contribution-style calendar exposes both long-term activity and weekday
rhythm without drawing one long daily time axis. This example aggregates raw,
session-level token events into a complete twelve-month UTC day domain, then
maps Sunday weeks to columns and weekdays to rows.

<!-- ::chart-example id=118-token-usage-calendar height=480 -->

The example uses `binTimeX` with D3's `utcDay` interval and an explicit
twelve-month domain. Each output row contains the day interval, the summed token
count, the session count, and source lineage. Empty bins become real zero-value
days and share one consistent neutral treatment.

Calendar placement is a second, explicit step: `utcSunday.count` produces the
week column and `date.getUTCDay()` selects the row. A categorical usage scale
creates contribution-style levels, while the accessible chart description and
cell color explain the zero-to-high usage range. The compact focus tooltip keeps
the visible detail to the exact token total and date. Keep all calendar
calculations in one time basis—UTC here—to avoid moving events between days
around daylight-saving transitions.

### Aggregate into quantitative cells

A two-dimensional binned heatmap makes density bounded: the number of rendered
cells depends on the chosen grid, not directly on the number of raw points.

<!-- ::chart-example id=24-quantitative-binned-heatmap height=480 -->

Prepare explicit x and y interval endpoints plus the aggregate value. Use
thresholds that are stable across comparable views and a color domain that
states whether absolute count or normalized density is being shown. See
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) for binning and scale ownership.

### Trace levels through a scalar grid

A scalar-grid contour shows where a sampled field crosses chosen values. The
input is a regular row-major grid rather than a set of x/y observations.

<!-- ::chart-example id=38-contour-topography height=480 -->

The optional [`contour` mark](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-contour-md) accepts the raw
grid, dimensions, value channel, and levels. It owns marching-squares topology
and structured polygons; the chart definition retains the metric and threshold
choices. Keep grid orientation and dimensions explicit when changing the
sample window.

### Estimate point concentration with density contours

Density contours turn many points into nested level sets. They are useful for
revealing cluster shape and overlap when raw dots would occlude one another.

<!-- ::chart-example id=39-density-contours height=480 -->

Bandwidth and thresholds change the visible shape. Treat them as analytical
parameters, keep them stable for comparisons, and explain them when they affect
interpretation. The optional
[`densityContour` mark](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-density-md) maps the source channels
through final scales, owns responsive estimation, and emits structured polygons
and holes without case-owned path construction.

### Retain local structure with hexagonal bins

Hexagonal bins aggregate nearby points in pixel space and encode each bin's
count or statistic. They provide a compact alternative when a rectangular grid
would impose stronger horizontal and vertical edges.

<!-- ::chart-example id=43-hexbin-density height=480 -->

Pixel-space binning is responsive work: a changed container changes the spatial
layout. The optional [`hexbin` mark](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-hexbin-md) owns that
resolved-layout step, reducer channels, source lineage, and hexagon scene
output without a duplicated scale.

### Production checks

- State whether color represents count, proportion, rate, or another aggregate.
- Choose a sequential, diverging, or threshold scale that matches the data
  semantics.
- Keep missing, zero, and out-of-domain cells visually distinct.
- Add direct labels only when cells remain large enough to read. A labeled
  ordinal matrix is demonstrated in
  [Themes and Styling](./composition.md#source-charts-docs-guides-themes-and-styling-md).
- Prefer aggregation over rendering an unbounded raw point layer. See
  [Large Data](./production.md#source-charts-docs-guides-large-data-md).

<a id="source-charts-docs-examples-index-md"></a>

## Index

Source: `charts:docs/examples/index.md`.

The gallery is organized by analytical question, not by package export. Start
with what the reader needs to compare, then open the family page for examples
and implementation guidance.

Each runnable chart resolves a canonical catalog case from this repository.
The examples demonstrate complete compositions, while the concept and reference
pages remain the source of truth for individual APIs.

### Choose a family

| Question                                                                         | Example family                                                        |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| How does a value change over an ordered domain?                                  | [Lines and Areas](./examples-core.md#source-charts-docs-examples-lines-and-areas-md)                               |
| Which categories are largest, smallest, or most changed?                         | [Bars and Rankings](./examples-core.md#source-charts-docs-examples-bars-and-rankings-md)                           |
| How are quantitative measures related?                                           | [Scatterplots and Relationships](./examples-core.md#source-charts-docs-examples-scatterplots-and-relationships-md) |
| What is the shape, spread, or rank of a quantitative variable?                   | [Distributions](./examples-core.md#source-charts-docs-examples-distributions-md)                                   |
| Where are values concentrated across a matrix or plane?                          | [Heatmaps and Densities](./examples-core.md#source-charts-docs-examples-heatmaps-and-densities-md)                 |
| What span, uncertainty, or open-high-low-close interval does each row represent? | [Intervals and Financial Charts](./examples-core.md#source-charts-docs-examples-intervals-and-financial-md)        |
| How does a total divide into contributions?                                      | [Stacked and Composed Charts](./examples-core.md#source-charts-docs-examples-stacked-and-composition-md)           |
| How should the same encoding repeat across groups?                               | [Facets and Multiple Views](./examples-advanced.md#source-charts-docs-examples-facets-and-multiple-views-md)           |
| How are entities connected or nested?                                            | [Networks and Hierarchies](./examples-advanced.md#source-charts-docs-examples-networks-and-hierarchies-md)             |
| How do values relate to geographic or projected space?                           | [Maps and Spatial Charts](./examples-advanced.md#source-charts-docs-examples-maps-and-spatial-md)                      |
| How should cyclic or radial dimensions be compared?                              | [Polar and Radar Charts](./examples-advanced.md#source-charts-docs-examples-polar-and-radar-md)                        |
| Which thresholds, events, or derived values need explanation?                    | [Annotations and Overlays](./examples-core.md#source-charts-docs-examples-annotations-and-overlays-md)             |
| How can a reader inspect, select, navigate, or edit the view?                    | [Interactive Charts](./examples-advanced.md#source-charts-docs-examples-interactive-charts-md)                         |
| How should charts inherit an application theme and move during updates?          | [Themes and Motion](./examples-advanced.md#source-charts-docs-examples-themes-and-motion-md)                           |

If two families seem plausible, use
[Choosing a Chart](./chart-grammar.md#source-charts-docs-guides-choosing-a-chart-md) to compare the reader task,
data shape, and risks of each encoding.

### Use an example without inheriting accidental choices

An example is a starting composition, not a schema for your data. Preserve your
application rows and replace the example's channels, domains, labels, and
formatters deliberately.

Before adapting a case:

1. Identify what one row represents and which fields are quantitative,
   temporal, ordinal, or nominal.
2. Decide whether the view needs raw observations, prepared summaries, or
   explicit intervals.
3. Supply scales with domains that express the intended comparison.
4. Keep only the marks that answer the question.
5. Verify the smallest supported container, light and dark themes, keyboard
   focus, and update behavior.

[Data and Channels](./chart-grammar.md#source-charts-docs-concepts-data-and-channels-md) defines the row-to-channel
contract. [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) explains which
transforms and scale semantics belong to the application. [Transforms and
Reactivity](./composition.md#source-charts-docs-guides-transforms-and-reactivity-md) shows how raw observations
become the rows consumed by marks.

### Build from the grammar

Most examples are several small pieces sharing a coordinate system:

- marks encode rows through channels;
- scales map values to visual ranges;
- guides explain those scales;
- layers combine complementary encodings;
- the host handles responsive layout, rendering, focus, and updates.

Read [Grammar of Graphics](./chart-grammar.md#source-charts-docs-concepts-grammar-of-graphics-md) for that model and
[Marks and Layering](./chart-grammar.md#source-charts-docs-concepts-marks-and-layering-md) before replacing a
composition with a custom mark.

For implementation details, use the [API Reference](./specifications-types.md#source-charts-docs-reference-index-md).
For behavior that crosses chart and application state, use the task-focused
[Guides](./chart-grammar.md#source-charts-docs-guides-choosing-a-chart-md).

<a id="source-charts-docs-examples-intervals-and-financial-md"></a>

## Intervals And Financial

Source: `charts:docs/examples/intervals-and-financial.md`.

Interval charts answer where a span begins and ends. The endpoints may
represent time, uncertainty, a daily trading range, or a percentile envelope.
Model those meanings explicitly with `x1` and `x2` or `y1` and `y2`; do not
force intervals through a point-value channel.

### Choose the comparison

| Reader question                                               | Start with                                            |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| How did each trading day move from open to close?             | Horizontal price interval                             |
| How uncertain is each point estimate?                         | Point plus low-high error bar                         |
| What were open, high, low, and close for each period?         | Candlestick                                           |
| How does a percentile range evolve over time?                 | Quantile ribbon plus median line                      |
| How do explicit lower and upper measurements change together? | Range area in [Lines and Areas](./examples-core.md#source-charts-docs-examples-lines-and-areas-md) |

The definition may receive endpoint fields directly or derive them from typed
reducer outputs. In either form, endpoint units must match the scale.
[Data and Channels](./chart-grammar.md#source-charts-docs-concepts-data-and-channels-md) defines these interval
channel shapes.

### Compare open-to-close spans

This view maps each AAPL trading date to a categorical lane and its `Open` and
`Close` fields to a horizontal rectangle. Color distinguishes gains from
losses, while the endpoints carry the price movement directly.

<!-- ::chart-example id=13-interval-timeline height=480 -->

Keep trading dates stable and lane order explicit. Date labels rely on automatic
guide measurement; verify them at the smallest supported width with
[Responsive Charts](./production.md#source-charts-docs-guides-responsive-charts-md).

### Preserve uncertainty bounds

An error bar combines a point estimate, a low-high link, and endpoint ticks.
The chart renders the supplied interval; it does not decide whether the bounds
are standard deviation, standard error, a confidence interval, or a credible
interval.

```ts group=error-bar env=charts file=/src/chart.ts entry
import { defineChart, dot, link, tickY } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { estimates } from './data'

export default defineChart({
  marks: [
    link(estimates, {
      x1: 'treatment',
      y1: 'low',
      x2: 'treatment',
      y2: 'high',
      stroke: '#2563eb',
      strokeWidth: 1.5,
    }),
    tickY(estimates, {
      x: 'treatment',
      y: 'low',
      stroke: '#2563eb',
      strokeWidth: 1.5,
    }),
    tickY(estimates, {
      x: 'treatment',
      y: 'high',
      stroke: '#2563eb',
      strokeWidth: 1.5,
    }),
    dot(estimates, {
      x: 'treatment',
      y: 'estimate',
      key: 'treatment',
      fill: '#2563eb',
      r: 4,
    }),
  ],
  x: { scale: () => scaleBand<string>().padding(0.3) },
  y: {
    scale: scaleLinear,
    grid: true,
    axis: { label: 'Mean response (95% confidence interval)' },
  },
})
```

```ts group=error-bar file=/src/data.ts collapsed
export const estimates = [
  { treatment: 'Control', estimate: 42, low: 36, high: 48 },
  { treatment: 'Low dose', estimate: 51, low: 45, high: 57 },
  { treatment: 'High dose', estimate: 63, low: 56, high: 70 },
]
```

Name the interval in the chart description or surrounding prose. Compose the
link, caps, and point as separate layers using the
[Rules, Links, Arrows, Vectors, and Ticks reference](./marks-composite.md#source-charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md)
and [Dot and Hexagon Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-dot-and-hexagon-md).

The [full catalog example](https://tanstack.com/charts/catalog/14-error-bars/)
starts with contributing observations, groups them once with `groupBy`, and
derives the interval from typed mean and sample-deviation outputs. The
estimator and singleton policy remain authored chart meaning; no dedicated
error-bar mark is required.

### Encode open, high, low, and close

A candlestick uses a high-low wick and an open-close body. Directional color is
secondary to the body endpoints and should not be the only way to distinguish
an increasing period from a decreasing one.

<!-- ::chart-example id=28-candlestick height=480 -->

Use one row per period with all four values. Render the wick as a link and the
body as a ranged rectangle; preserve missing trading periods on the temporal
domain instead of silently inventing observations.

### Show an interval over time

A quantile ribbon combines a prepared lower percentile, median, and upper
percentile for each time group. It shows how both location and spread evolve.

<!-- ::chart-example id=61-quantile-ribbon height=480 -->

Use `groupBy` with `quantile` reducers to preserve each time group's source
rows, then give the ribbon and median their own marks. [Transforms and
Reactivity](./composition.md#source-charts-docs-guides-transforms-and-reactivity-md) defines the aggregation
boundary; [Line and Area Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-line-and-area-md) defines the
range-area channels.

### Production checks

- State what each endpoint means and whether the interval is inclusive.
- Use timezones and calendar boundaries intentionally for temporal spans.
- Keep interval semantics in data fields rather than inferring them from color
  or row order.
- Preserve exact values through a tooltip, table, or textual summary. See
  [Tooltips and Focus](./interaction-accessibility.md#source-charts-docs-guides-tooltips-and-focus-md).
- Use semantic controls and application state when intervals become editable;
  see [Interactions and Selections](./interaction-accessibility.md#source-charts-docs-guides-interactions-and-selections-md).
- Verify essential distinctions without color in
  [Accessibility](./interaction-accessibility.md#source-charts-docs-guides-accessibility-md).

Rectangle channel details are in
[Bar and Rect Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-bar-and-rect-md).

<a id="source-charts-docs-examples-lines-and-areas-md"></a>

## Lines And Areas

Source: `charts:docs/examples/lines-and-areas.md`.

Lines answer how a value changes across an ordered domain. Areas add a second
meaning: distance from a baseline or the span between two boundaries. Use that
extra area only when the reader should compare magnitude, accumulation, or an
interval—not merely because a filled chart looks stronger.

### Choose the comparison

| Reader question                                          | Start with                                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| How does one measure change over time?                   | One line with an explicit temporal scale                                                    |
| How do several measures change together?                 | Several lines with direct labels or a legend                                                |
| Where does one measure exceed another?                   | A difference mark with distinct positive and negative fills                                 |
| What is the local trend after reducing short-term noise? | A raw line plus a clearly named rolling statistic                                           |
| What range surrounds a central estimate?                 | An area with explicit lower and upper channels                                              |
| Which observations deserve explanation?                  | A line plus selected text, dots, rules, or bands                                            |
| How does composition change over time?                   | A stacked or normalized area in [Stacked and Composed Charts](./examples-core.md#source-charts-docs-examples-stacked-and-composition-md) |

The x domain must have a meaningful order. Do not connect nominal categories
just because they appear in an array.

### Start with one ordered series

Use one line when the first task is reading change over a shared sequence.
Points keep the individual observations available for focus and tooltips.

```ts group=basic-line env=charts file=/src/chart.ts entry
import { defineChart, lineY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'

const rows = [
  { month: 'Jan', downloads: 42 },
  { month: 'Feb', downloads: 58 },
  { month: 'Mar', downloads: 51 },
  { month: 'Apr', downloads: 73 },
  { month: 'May', downloads: 81 },
]

const chart = defineChart({
  marks: [
    lineY(rows, {
      x: 'month',
      y: 'downloads',
      points: true,
      stroke: '#2563eb',
    }),
  ],
  x: { scale: () => scalePoint<string>().padding(0.2) },
  y: {
    scale: scaleLinear,
    nice: true,
    grid: true,
    axis: { label: 'Downloads (thousands)' },
  },
})

export default chart
```

### Compare several series from a common baseline

Indexing each series to its first observation compares relative change when the
original magnitudes are not directly comparable. Direct end labels reduce the
work of matching line colors to a separate legend.

<!-- ::chart-example id=55-indexed-multi-line height=480 -->

Prepare the indexed values in the application, state the baseline, and retain
the original values for exact-value disclosure. Use a stable series channel so
color, path grouping, focus, and updates agree on identity.
[Data and Channels](./chart-grammar.md#source-charts-docs-concepts-data-and-channels-md) covers series grouping,
while [Legends and Color](./composition.md#source-charts-docs-guides-legends-and-color-md) explains when a
separate legend is the better choice.

### Show a derived trend honestly

A moving average is a derived series, not a visual curve setting. Prepare the
rolling values with the public `rollingWindow` transform beside the definition, keep
the original time domain, and name the rolling window in surrounding text or a legend.

<!-- ::chart-example id=19-moving-average-line height=480 -->

Changing interpolation only changes the path between observations. It does not
perform smoothing or create evidence between samples. See
[Data Transforms](./rendering-composition-reference.md#source-charts-docs-reference-transforms-md) for rolling windows and reducers.

### Compare two boundaries at their exact crossings

A difference chart separates the intervals where a primary series is above or
below a comparison. Keep any rolling statistic or forecast calculation in data
preparation, then give both boundaries to `differenceY`:

```ts
differenceY(rows, {
  x: 'Date',
  y1: 'average',
  y2: 'Close',
  positiveFill: '#16a34a',
  negativeFill: '#dc2626',
  comparisonStroke: '#475569',
})
```

The mark finds each sign change, interpolates the exact crossing, and owns the
positive area, negative area, comparison line, and primary line. Application
code does not need to prepare sign runs or duplicate boundary rows.

The [Overview](./getting-started.md#source-charts-docs-overview-md) shows the complete
rendered Apple closing-price example. See
[Difference Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-difference-md) for transposed
`differenceX`, gap behavior, fill suppression, lineage, and interaction.

### Add context with an interval

A Bollinger band combines a rolling center line with an interval derived from
local variation. The band is context for the observed series; it is not a
confidence interval unless the underlying calculation actually defines one.

<!-- ::chart-example id=22-bollinger-band height=480 -->

Compute the rolling statistics once and share those rows between the interval
and center line:

```ts
const bands = rollingWindow(aapl, {
  size: 20,
  orderBy: 'Date',
  anchor: 'end',
  partial: false,
  outputs: {
    meanClose: { value: 'Close', reduce: 'mean' },
    closeDeviation: { value: 'Close', reduce: deviation },
  },
})

areaY(bands, {
  x: 'Date',
  y1: (row) => row.meanClose - row.closeDeviation * 2,
  y2: (row) => row.meanClose + row.closeDeviation * 2,
})

lineY(bands, { x: 'Date', y: 'meanClose' })
```

The rolling-window length, estimator, and multiplier are authored statistical meaning.
The transform owns ordering and source lineage; the area owns interval
geometry. See [Line and Area Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-line-and-area-md) for
the channel contracts.

### Annotate selected observations

Annotations should explain a small number of meaningful points. Selecting the
minimum and maximum in data preparation makes the intent auditable and avoids
placing a text label on every observation.

<!-- ::chart-example id=58-select-extrema height=480 -->

Layer dots and text over the same scales rather than baking labels into a line
renderer. [Marks and Layering](./chart-grammar.md#source-charts-docs-concepts-marks-and-layering-md) explains why
separate layers remain easier to update and extend.

### Production checks

- Preserve missing values when a gap is meaningful. The
  [Quick Start](./getting-started.md#source-charts-docs-quick-start-md) demonstrates an explicit line gap.
- Use a temporal scale for dates and define the domain in application data
  semantics, as described in
  [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md).
- Preserve row IDs or unique positions across updates, and group series with
  `z`; supply `key` only when the mark cannot infer identity. See
  [Dynamic Data and Animation](./composition.md#source-charts-docs-guides-dynamic-data-and-animation-md).
- Let automatic layout measure tick labels, then verify the smallest container
  in [Responsive Charts](./production.md#source-charts-docs-guides-responsive-charts-md).
- Use position, labels, or line treatment in addition to color when a
  distinction is essential. See [Accessibility](./interaction-accessibility.md#source-charts-docs-guides-accessibility-md).

<a id="source-charts-docs-examples-scatterplots-and-relationships-md"></a>

## Scatterplots And Relationships

Source: `charts:docs/examples/scatterplots-and-relationships.md`.

Scatterplots answer how two quantitative measures vary together. Position
carries the primary evidence. Color, radius, a fitted line, or chronological
connections should add one clearly stated dimension rather than compete with
that relationship.

### Choose the comparison

| Reader question                                                 | Start with                                  |
| --------------------------------------------------------------- | ------------------------------------------- |
| Do two quantitative measures move together?                     | A scatterplot                               |
| What linear tendency summarizes that relationship?              | Scatterplot plus `linearRegressionY`        |
| How does the relationship evolve in a known order?              | A connected scatterplot                     |
| Does a series depend on its previous observation?               | A lag plot                                  |
| Which dense point is closest to the pointer or keyboard cursor? | A scatterplot with a spatial focus strategy |

Do not infer causation from proximity or a fitted trend. Show the model and
preparation only when they answer the stated question.

### Start with two quantitative measures

A plain scatterplot should establish the relationship before adding a fitted
model, chronology, or spatial partition.

```ts group=basic-scatter env=charts file=/src/chart.ts entry
import { defineChart, dot } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const rows = [
  { temperature: 12, sales: 18 },
  { temperature: 16, sales: 25 },
  { temperature: 20, sales: 31 },
  { temperature: 24, sales: 46 },
  { temperature: 29, sales: 52 },
  { temperature: 32, sales: 61 },
]

const chart = defineChart({
  marks: [
    dot(rows, {
      x: 'temperature',
      y: 'sales',
      r: 5,
      fill: '#2563eb',
    }),
  ],
  x: {
    scale: scaleLinear,
    grid: true,
    axis: { label: 'Temperature (°C)' },
  },
  y: {
    scale: scaleLinear,
    grid: true,
    axis: { label: 'Daily sales' },
  },
})

export default chart
```

### Add a linear regression

Pass the observations directly to `linearRegressionY`. The mark owns the
least-squares fit, semantic-domain samples, optional confidence band, and
aggregate source lineage. Keep the dot layer separate so each observation
remains independently focusable.

<!-- ::chart-example id=31-linear-regression height=480 -->

Set `ci: 0` when only the fitted line is needed. The default `0.95` band uses a
Student-t interval for the fitted mean. See the
[linear regression mark](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-regression-md) for grouping,
sampling, and degenerate-fit behavior.
The dot layer still preserves every observation while the regression mark owns
only its derived model geometry.

### Connect observations only when order matters

A connected scatterplot turns sequence into a path through two-dimensional
measure space. Chronological labels and direction arrows make that additional
ordering visible.

<!-- ::chart-example id=56-connected-scatter height=480 -->

Without an explicit order, connecting points invents a relationship. Keep the
path, arrow, selected labels, and points as separate layers so each can use the
same scales without sharing renderer-specific state.

### Compare each observation with its predecessor

A lag plot moves time out of the axis and into data preparation. Each point
pairs a current value with the previous value; an identity rule shows where
those values would be equal.

<!-- ::chart-example id=60-lag-autocorrelation height=480 -->

Make the lag length explicit and decide how the first observation is handled.
The chart should receive the resulting pairs rather than conceal the shift
inside a mark.

### Separate visible cells from nearest-point focus

Voronoi cells make each point's nearest region visible. The optional `voronoi`
mark paints those cells but deliberately adds no focus candidates. A layered
`dot` mark remains the semantic source for pointer focus, keyboard navigation,
and tooltips.

<!-- ::chart-example id=65-voronoi-nearest-tooltip height=480 -->

See the [`voronoi` mark](./marks-spatial.md#source-charts-docs-reference-marks-voronoi-md) for final-screen cell
geometry and stable identity. [Tooltips and Focus](./interaction-accessibility.md#source-charts-docs-guides-tooltips-and-focus-md)
defines the focus and formatting model. Use a `ChartSpatialIndexFactory` when
lookup performance matters but the cells should not be painted.

### Production checks

- Use quantitative scales with intentional domains on both axes. Use a
  logarithmic scale only when multiplicative distance is the intended reading;
  see [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md).
- Map magnitude through an area-preserving radial scale when point size carries
  a third quantitative value.
- Control opacity or aggregate spatially before thousands of overlapping dots
  obscure the distribution. See [Large Data](./production.md#source-charts-docs-guides-large-data-md).
- Keep lag pairs in data preparation. Keep lookup-only spatial indexes in
  interaction capabilities; use `voronoi` only when cells are part of the
  visible encoding.
- Provide keyboard-equivalent focus and a textual value path, as described in
  [Accessibility](./interaction-accessibility.md#source-charts-docs-guides-accessibility-md).

The channel and styling contracts for points are in
[Dot and Hexagon Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-dot-and-hexagon-md).

<a id="source-charts-docs-examples-stacked-and-composition-md"></a>

## Stacked And Composition

Source: `charts:docs/examples/stacked-and-composition.md`.

Stacked charts answer how a total divides into contributions. They work best
when the total and a small number of stable components both matter. Interior
layers do not share a baseline, so their individual values are harder to
compare than the first layer or the total.

Use a normalized stack when proportion matters more than magnitude. Use a
mosaic when both column width and internal height carry part-to-whole meaning.
Use a streamgraph only when changing shape is the primary story and exact
values remain available elsewhere.

### Choose the composition

| Reader question                                                 | Start with                              |
| --------------------------------------------------------------- | --------------------------------------- |
| How do several series contribute to a changing total?           | Stacked area                            |
| How does proportional mix change independently of the total?    | Normalized 100% stack                   |
| How does the overall shape of many positive series evolve?      | Streamgraph                             |
| How do two categorical part-to-whole dimensions interact?       | Marimekko or mosaic                     |
| How much volume remains at each ordered conversion stage?       | Funnel                                  |
| Which subgroup values must be compared precisely across groups? | Grouped bars or aligned small multiples |
| Do contributions extend in positive and negative directions?    | Diverging stack around an explicit zero |

Single-value bar and area channels stack implicitly. Use `layout: stack()`
when the order or offset must be explicit; supply interval endpoints when the
application has already computed them.

### Preserve totals with a stacked area

A stacked area combines a shared ordered x domain with one length per series.
The top boundary carries the total; the thickness of each layer carries its
contribution.

```ts group=stacked-area env=charts file=/src/chart.ts entry
import { areaY, colorLegend, defineChart, ruleY, stack } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { rows } from './data'

export default defineChart({
  marks: [
    areaY(rows, {
      x: 'quarter',
      y: 'revenue',
      color: 'business',
      layout: stack({ order: ['Core', 'Services'] }),
      fillOpacity: 0.8,
    }),
    ruleY([0]),
  ],
  x: { scale: () => scalePoint<string>().padding(0.15) },
  y: {
    scale: scaleLinear,
    grid: true,
    axis: { label: 'Revenue (USD thousands)' },
  },
  color: {
    domain: ['Core', 'Services'],
    range: ['#2563eb', '#14b8a6'],
    legend: colorLegend({ label: 'Business' }),
  },
})
```

```ts group=stacked-area file=/src/data.ts collapsed
export const rows = [
  { quarter: 'Q1', business: 'Core', revenue: 42 },
  { quarter: 'Q1', business: 'Services', revenue: 18 },
  { quarter: 'Q2', business: 'Core', revenue: 48 },
  { quarter: 'Q2', business: 'Services', revenue: 24 },
  { quarter: 'Q3', business: 'Core', revenue: 53 },
  { quarter: 'Q3', business: 'Services', revenue: 31 },
  { quarter: 'Q4', business: 'Core', revenue: 59 },
  { quarter: 'Q4', business: 'Services', revenue: 38 },
]
```

[Open the full unemployment-by-industry catalog example](https://tanstack.com/charts/catalog/04-stacked-time-area/).

Keep series order stable across updates. Reordering layers can make unchanged
values appear to move substantially and breaks the reader's spatial memory.
When one series needs precise comparison, place it on the shared baseline or
give it a separate aligned view.

The original value remains available to tooltips and selection while the mark
derives its stack endpoints.

### Center an ordered response scale

Survey counts are nonnegative, but an ordered response scale often reads as
diverging. Group the observations into counts, then anchor the stack on the
neutral category:

```ts
const counts = groupBy(responses, {
  by: { question: 'question', response: 'response' },
  outputs: { count: { reduce: 'count' } },
})

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

The grouping transform owns counts and lineage. The stack owns ordered
endpoints and the per-question zero translation. Response order, neutral
choice, and anchor fraction remain explicit chart meaning.

<!-- ::chart-example id=26-diverging-likert height=480 -->

### Compare proportional mix

A normalized stack gives every x position the same total height. It answers
which series gained or lost share, but deliberately removes the original total
magnitude.

<!-- ::chart-example id=20-normalized-stacked-area height=480 -->

Format the quantitative guide as a percentage and state the denominator. Keep
raw totals available in a tooltip, table, or companion view when the reader may
otherwise mistake stable share for stable volume.

Use `layout: stack({ offset: 'normalize' })`. Normalization is resolved
independently at each x position.

### Emphasize changing shape

A streamgraph offsets and orders layers to reduce visible oscillation around a
central baseline. It is effective for the broad shape of many positive series,
but the displaced baseline makes precise values and totals difficult to read.

<!-- ::chart-example id=21-streamgraph height=480 -->

The source can stay in tidy form; stacking belongs to the area definition:

```ts
areaY(industries, {
  x: 'date',
  y: 'unemployed',
  z: 'industry',
  color: 'industry',
  layout: stack({ offset: 'wiggle', order: 'inside-out' }),
})
```

Keep the offset and order stable across revisions, preserve series colors, and
provide exact values through
[Tooltips and Focus](./interaction-accessibility.md#source-charts-docs-guides-tooltips-and-focus-md).

Use an ordinary stacked area when totals or baselines are part of the question.

### Show stage attrition

A funnel encodes the remaining volume at each ordered stage. Use it when the
sequence is fixed and values decrease toward one outcome. Use bars when stages
can grow, reorder, or need precise comparison on a shared baseline.

<!-- ::chart-example id=125-sales-funnel height=480 -->

The example derives centered left and right endpoints from each raw stage value,
then uses one `areaX` trapezoid per stage. Keep the raw value available to the
tooltip and label; the narrowing shape alone is not precise enough for lookup.

### Show shares as fixed units

A waffle chart trades precise length comparison for countable, equal units.
Use it when one tile has a clear meaning, such as one percentage point.

```ts
waffleY(alphabet, {
  y: 'frequency',
  color: 'letter',
  unit: 0.01,
  round: true,
  gap: 2,
  radius: 2,
})
```

<!-- ::chart-example id=41-waffle-unit-chart height=480 -->

`waffleY` expands source values internally and preserves each source row for
tooltips and selection. `unit` defines one complete cell; `round: true` rounds
cumulative boundaries so category rounding does not change the overall total.
Leave `columns` unset for responsive square-cell packing, or set it when the
grid dimensions are part of the encoding.

### Encode two part-to-whole dimensions

A Marimekko chart uses column width for one categorical total and vertical
composition for a second. Each cell is an explicit rectangle with both
horizontal and vertical interval endpoints.

<!-- ::chart-example id=64-marimekko-mosaic height=480 -->

The two dimensions have independent denominators: response totals determine
each question's column width, while response-category shares determine height
within that question. Use `groupBy` to state the count or sum, then `mosaicY`
to allocate both normalized interval dimensions. Ordinary `rect` and `text`
marks render the result. Small cells may need a tooltip or adjacent table
rather than unreadable direct text.

The transform contract is defined in [Data Transforms](./rendering-composition-reference.md#source-charts-docs-reference-transforms-md),
and rectangle endpoint semantics are defined in
[Bar and Rect Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-bar-and-rect-md).

### Production checks

- State whether the chart preserves totals or normalizes every group.
- Keep series order, category order, colors, and keys stable.
- Include zero for ordinary positive stacks and an explicit zero rule for
  diverging stacks.
- Preserve raw values alongside derived endpoints and proportions.
- Avoid too many layers; group minor categories only when the aggregation is
  defensible and disclosed.
- Use a legend or direct labels that remain meaningful in light and dark
  themes. See [Legends and Color](./composition.md#source-charts-docs-guides-legends-and-color-md).
- Verify keyboard focus and exact-value access with
  [Accessibility](./interaction-accessibility.md#source-charts-docs-guides-accessibility-md).

[Marks and Layering](./chart-grammar.md#source-charts-docs-concepts-marks-and-layering-md) explains how the
interval areas, rules, labels, and highlights compose into one chart.
