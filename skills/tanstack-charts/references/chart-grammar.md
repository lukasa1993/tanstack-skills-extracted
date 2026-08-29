# Chart grammar

Chart concepts, chart selection, and TypeScript guidance.

<a id="source-charts-docs-concepts-chart-definitions-md"></a>

## Chart Definitions

Source: `charts:docs/concepts/chart-definitions.md`.

A chart definition is the typed boundary between application state and the
chart grammar. It owns marks, scales, guides, theme overrides, responsive
choices, focus, tooltips, animation, keyboard policy, and spatial indexing.

### Static definitions

Pass a complete spec when the chart does not need its resolved surface size:

<!-- docs-example: static-definition typecheck -->

```ts
import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

interface AlphabetRow {
  letter: string
  frequency: number
}

const alphabet: readonly AlphabetRow[] = [
  { letter: 'E', frequency: 0.12702 },
  { letter: 'T', frequency: 0.09056 },
  { letter: 'A', frequency: 0.08167 },
  { letter: 'O', frequency: 0.07507 },
  { letter: 'I', frequency: 0.06966 },
]

const letterFrequencies = defineChart({
  marks: [barY(alphabet, { x: 'letter', y: 'frequency' })],
  scales: {
    x: {
      scale: () => scaleBand<string>().padding(0.12),
    },
    y: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: { label: 'Frequency' },
    },
  },
})
```

### Responsive definitions

Pass a builder when tick density, annotations, or mark composition depends on
the chart surface:

```ts
import { tooltip } from '@tanstack/charts/tooltip'

const productRanking = defineChart({
  tooltip,
  chart: ({ width }) => ({
    marks: [barX(ranked, { x: 'value', y: 'product' })],
    scales: {
      x: {
        scale: scaleLinear,
        nice: true,
        axis: { ticks: { count: width < 480 ? 4 : 7 } },
      },
      y: {
        scale: () => scaleBand<string>().padding(0.1),
      },
    },
  }),
})
```

The host controls `width` and `height`; the builder only reads their resolved
values. It also receives the default build-time `theme`.

### Transform beside the definition

Keep analytical work visible in ordinary functions:

```ts
function rankProducts(rows: readonly ProductRow[], metric: Metric) {
  return rows
    .map((source) => ({
      id: source.id,
      product: source.product,
      value: source[metric],
      source,
    }))
    .sort((left, right) => right.value - left.value)
}
```

Derived rows should retain source identity needed by tooltips and selection.
Fetching, cancellation, permissions, and server aggregation remain application
concerns.

### Memoize the complete definition

Definitions capture the values they use. In React:

```tsx
import { tooltip } from '@tanstack/charts/tooltip'

function ProductRanking({ rows, metric }: Props) {
  const definition = useMemo(() => {
    const ranked = rankProducts(rows, metric)

    return defineChart({
      tooltip,
      chart: ({ width }) => ({
        marks: [barX(ranked, { x: 'value', y: 'product' })],
        scales: {
          x: {
            scale: scaleLinear,
            nice: true,
            axis: { ticks: { count: width < 480 ? 4 : 7 } },
          },
          y: {
            scale: () => scaleBand<string>().padding(0.1),
          },
        },
      }),
    })
  }, [rows, metric])

  return <Chart definition={definition} ariaLabel="Product ranking" />
}
```

Use `computed`, `createMemo`, `$derived`, or the equivalent native primitive in
other frameworks. Memoization is the update contract: preserve definition
identity until a captured value changes.

### Vanilla updates

Vanilla code makes that boundary explicit:

```ts
const createProductRanking = (rows: readonly ProductRow[], metric: Metric) => {
  const ranked = rankProducts(rows, metric)
  return defineChart({
    svgAnimation: true,
    chart: ({ width }) => buildRankingSpec(ranked, width),
  })
}

const options = {
  definition: createProductRanking(rows, 'revenue'),
  height: 360,
  ariaLabel: 'Products ranked by revenue',
}

const host = mountChart(container, options)

host.update({
  ...options,
  definition: createProductRanking(rows, 'orders'),
  ariaLabel: 'Products ranked by orders',
})
```

Charts owns surface measurement, scene construction, and keyed reconciliation.
It does not own application equality or data reactivity.

<a id="source-charts-docs-concepts-data-and-channels-md"></a>

## Data And Channels

Source: `charts:docs/concepts/data-and-channels.md`.

Marks consume ordinary iterables. Channels say which values from those rows control position, grouping, color, size, or identity.

TanStack Charts does not require a universal series shape. Keep the data model that best represents the problem, and let each mark consume the rows it needs.

### Field channels

Use a field name when the value already exists:

```ts
lineY(rows, {
  x: 'date',
  y: 'revenue',
  z: 'region',
})
```

The field list is type-filtered. For example:

- A numeric `barX` length accepts numeric fields.
- A date-based `lineY` x channel accepts a `Date` field.
- `key` accepts string or number fields.
- Nullable positional fields are valid when the mark defines missing-value behavior.

If TypeScript rejects a field name, do not cast it. Correct the row type, choose the intended field, or use a typed accessor.

### Accessor channels

Use an accessor for derived values:

```ts
dot(rows, {
  x: (row) => row.revenue / row.accounts,
  y: (row) => row.retained / row.accounts,
})
```

Every accessor receives:

```ts
;(datum, { index, data }) => value
```

`datum` has the exact source type. The context contains the zero-based `index`
and readonly materialized `data` array. Accessors are evaluated when the mark
initializes; keep expensive cross-row transforms in application code.

### Positional channels

The x and y channels feed the reserved scales with the same names:

```ts
barX(rows, {
  x: 'revenue',
  y: 'region',
})
```

Use `xScale` or `yScale` when a mark should feed another named entry in the
chart's `scales` registry. Channel names continue to describe geometry; scale
IDs select the mapping.

Positional values are also retained in each interaction `ChartPoint`:

```ts
const handleFocus = (point: ChartPoint<Row, number, string> | null) => {
  if (!point) return
  console.log(point.datum, point.xValue, point.yValue)
}
```

Normal callbacks infer these types from the definition, so explicit `ChartPoint` annotations are usually unnecessary.

`number`, `string`, and `Date` are the supported chart value types. A definition can infer a union when conditional branches intentionally use different coordinate types; narrow that union with normal TypeScript control flow.

### Grouping with `z`

`z` identifies a semantic series or group:

```ts
lineY(rows, {
  x: 'date',
  y: 'value',
  z: 'region',
})
```

For connected line and area marks, an explicit `z` partitions observations
into independent geometry. If `z` is omitted and `color` is authored, `color`
also supplies that path grouping. When both are present, `z` wins for geometry
and interaction grouping while `color` remains an independent color-scale
value. Omitting `color` reuses `z` for color.

Bars stack their length channel by default. Use `layout: group()` when multiple
bars must occupy sub-bands within one category. Grouping uses `z` when present,
otherwise a discrete `color` channel may infer series identity. See
[Bars and Rankings](./examples-core.md#source-charts-docs-examples-bars-and-rankings-md).

### Color channels and constants

There are two common paths:

- `color` is a semantic mapping resolved by the chart color scale.
- `z` falls back into that mapping when no separate `color` channel is set.
- `fill` and `stroke` are final paint overrides and bypass scale mapping for
  that paint.

The default categorical palette is useful for quick distinctions. Use an
explicit ordinal scale when a category must always map to the same color across
charts, filters, and sessions.

```ts
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'

const segmentColor = scaleOrdinal(
  ['Consumer', 'Enterprise', 'Public'],
  ['#2563eb', '#f97316', '#10b981'],
)

const chart = defineChart({
  marks: [
    dot(rows, {
      x: 'revenue',
      y: 'retention',
      z: 'segment',
    }),
  ],
  scales: {
    x: { scale: revenueScale },
    y: { scale: retentionScale },
  },

  color: {
    scale: segmentColor,
    legend: colorLegend({ label: 'Segment' }),
  },
})
```

The lightweight ordinal scale owns the stable category mapping. [Legends and
Color](./composition.md#source-charts-docs-guides-legends-and-color-md) covers continuous color, gradients, and
application-wide palettes.

### Radius is explicit

The `r` option on `dot` is a pixel radius unless `rScale` is supplied:

```ts
dot(rows, {
  x: 'revenue',
  y: 'retention',
  r: 'accounts',
  rScale: {
    scale: () => scaleSqrt().range([3, 22]),
  },
})
```

This direct `scaleSqrt` import belongs to `d3-scale` and requires the matching direct dependency and type package.

Keeping the scale visible makes the perceptual encoding reviewable. It also avoids silently treating a business measure as pixels.

### Stable identity

Built-in marks infer identity in this order:

1. An explicit `key`
2. A unique string or number `datum.id`
3. A unique string or number `datum.data.id`
4. A unique mark-specific positional identity
5. Row index

Bars use their categorical channel. Lines and areas use their independent
axis. Dots and text try x, then y, then the x/y tuple. Rects and cells use
their x/y interval tuple. These candidates are checked within each interaction
group; a collision rejects the candidate and continues to the next fallback.
The nested ID convention covers rows emitted by wrappers such as D3 pie
without requiring an accessor solely to unwrap `data.id`.

For common rows with a unique `id`, no key option is required:

```ts
barX(rows, {
  id: 'product-ranking',
  x: 'value',
  y: 'product',
})
```

Use an explicit key when identity lives in another field, the inferred
positional value can change, or the automatic candidates are not unique:

```ts
barX(rows, {
  x: 'value',
  y: 'product',
  key: 'productId',
})
```

Explicit keys are string or number values and need to be unique within the
mark and group. When a mark-owned positional candidate is present but
incomplete or duplicated, the mark falls back to array position and warns once
per mark instance in development. Marks with no positional candidate also use
row position after checking IDs, without adding a warning for ordinary static
data.

The mark `id` identifies the layer. Give conditionally rendered or reordered marks an explicit, stable `id` as well.

### Missing and invalid values

Marks ignore positional observations they cannot materialize.

- `lineY` and `areaY` split geometry at missing or non-finite positions.
- `dot`, bars, rectangles, rules, and text omit invalid observations.
- A negative dot radius is invalid.
- A null group means “ungrouped.”

Model a genuinely missing observation as `null` or `undefined` in the field type. Do not replace it with zero unless zero is the correct domain value.

For lines, a gap communicates missing data:

```ts
interface Reading {
  id: string
  time: Date
  temperature: number | null
}

lineY(readings, {
  x: 'time',
  y: 'temperature',
})
```

### Different marks can use different rows

Layering does not force one datum union:

```ts
const marks = [
  rect(maintenanceWindows, {
    x1: 'start',
    x2: 'end',
    y1: 'minimum',
    y2: 'maximum',
  }),
  lineY(readings, {
    x: 'time',
    y: 'temperature',
  }),
  text(annotations, {
    x: 'time',
    y: 'value',
    text: 'label',
  }),
]
```

The definition’s interaction datum becomes the honest union of point-emitting mark data. Callbacks narrow that union using your existing discriminants or type guards.

### Derived data stays explicit

Grouping, binning, rolling, normalization, selection, and reusable stack
endpoints happen before mark construction. Use the pure transforms from
TanStack Charts or an ordinary application function:

```ts
const bins = binX(observations, {
  value: 'latency',
  thresholds: 24,
})
```

Transforms return materialized typed rows and retain source lineage. They do
not rewrite mark options or own reactivity. Run them beside `defineChart` or
inside the framework primitive that memoizes the definition. The resulting
rows flow into ordinary marks.

[Transforms and Reactivity](./composition.md#source-charts-docs-guides-transforms-and-reactivity-md) shows the
complete raw-data-to-mark path and separates application memoization from
responsive layout work.

### Complete bubble-scatter example

```ts group=bubble-scatter env=charts file=/src/chart.ts entry
import { scaleSqrt } from 'd3-scale'
import { colorLegend, defineChart, dot } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
import { penguins, type PenguinsRow } from './data'

type CompletePenguin = PenguinsRow & {
  culmen_length_mm: number
  culmen_depth_mm: number
  body_mass_g: number
}

const rows = penguins.filter(
  (row): row is CompletePenguin =>
    row.culmen_length_mm !== null &&
    row.culmen_depth_mm !== null &&
    row.body_mass_g !== null,
)
const species = ['Adelie', 'Chinstrap', 'Gentoo']

export default defineChart({
  marks: [
    dot(rows, {
      x: 'culmen_length_mm',
      y: 'culmen_depth_mm',
      color: 'species',
      r: 'body_mass_g',
      rScale: {
        scale: () => scaleSqrt().range([3, 11]),
      },
      fillOpacity: 0.78,
      stroke: 'currentColor',
      strokeOpacity: 0.28,
      strokeWidth: 0.75,
    }),
  ],
  scales: {
    x: {
      scale: scaleLinear,
      grid: true,
      axis: { label: 'Bill length (mm)' },
    },
    y: {
      scale: scaleLinear,
      grid: true,
      axis: { label: 'Bill depth (mm)' },
    },
  },

  color: {
    scale: scaleOrdinal(species, ['#2563eb', '#f97316', '#10b981']),
    legend: colorLegend({ label: 'Species' }),
  },
})
```

```ts group=bubble-scatter file=/src/data.ts collapsed
export interface PenguinsRow {
  species: string
  culmen_length_mm: number | null
  culmen_depth_mm: number | null
  body_mass_g: number | null
}

export const penguins: readonly PenguinsRow[] = [
  {
    species: 'Adelie',
    culmen_length_mm: 39.1,
    culmen_depth_mm: 18.7,
    body_mass_g: 3750,
  },
  {
    species: 'Adelie',
    culmen_length_mm: 40.3,
    culmen_depth_mm: 18,
    body_mass_g: 3250,
  },
  {
    species: 'Chinstrap',
    culmen_length_mm: 46.5,
    culmen_depth_mm: 17.9,
    body_mass_g: 3500,
  },
  {
    species: 'Chinstrap',
    culmen_length_mm: 50,
    culmen_depth_mm: 19.5,
    body_mass_g: 3900,
  },
  {
    species: 'Gentoo',
    culmen_length_mm: 46.1,
    culmen_depth_mm: 13.2,
    body_mass_g: 4500,
  },
  {
    species: 'Gentoo',
    culmen_length_mm: 50,
    culmen_depth_mm: 16.3,
    body_mass_g: 5700,
  },
  {
    species: 'Gentoo',
    culmen_length_mm: null,
    culmen_depth_mm: null,
    body_mass_g: null,
  },
]
```

The filter only removes observations missing a plotted measurement; the marks
still use the source dataset's field names. The axes and categorical color use
lightweight scales. Bubble area needs the nonlinear D3 `scaleSqrt`, so install
`d3-scale` and `@types/d3-scale` for that one mapping.

For every built-in channel, see the relevant [Mark Reference](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-line-and-area-md). For inference rules and custom datum unions, see [TypeScript](./chart-grammar.md#source-charts-docs-guides-typescript-md).

<a id="source-charts-docs-concepts-grammar-of-graphics-md"></a>

## Grammar Of Graphics

Source: `charts:docs/concepts/grammar-of-graphics.md`.

TanStack Charts follows the grammar-of-graphics tradition established by
[Leland Wilkinson](https://doi.org/10.1007/0-387-28695-0) and developed through
projects such as [ggplot2](https://ggplot2.tidyverse.org/),
[Vega-Lite](https://vega.github.io/vega-lite/), and Observable Plot. Observable
Plot is the closest API influence for mark-local data, channels, and layered
composition.

The grammar describes **what visual encodings mean** and lets the runtime decide
how to lay them out and render them. A chart is not a special-purpose component
with a fixed series model. It is a composition of:

1. **Data** — the observations or derived rows a mark consumes.
2. **Marks** — geometric forms such as lines, bars, dots, areas, rules, or text.
3. **Channels** — mappings from data to position, grouping, color, radius, or identity.
4. **Scales** — callable factories or instances that map semantic values into visual coordinates.
5. **Guides** — axes, ticks, grids, titles, and legends that explain those mappings.
6. **Layers** — marks rendered together in declaration order.

The result is one `ChartSpec` compiled into a renderer-neutral scene.

### The smallest useful declaration

```ts
import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

interface LetterFrequency {
  letter: string
  frequency: number
}

const alphabet: readonly LetterFrequency[] = [
  { letter: 'E', frequency: 0.12702 },
  { letter: 'T', frequency: 0.09056 },
  { letter: 'A', frequency: 0.08167 },
  { letter: 'O', frequency: 0.07507 },
  { letter: 'I', frequency: 0.06966 },
]

const chart = defineChart({
  marks: [barY(alphabet, { x: 'letter', y: 'frequency' })],
  scales: {
    x: { scale: scaleBand },
    y: { scale: scaleLinear, nice: true },
  },
})
```

The mark consumes the typed letter-frequency rows directly and maps their
existing fields to x and y. No universal series wrapper or renamed chart
fields sit between the source data and the mark.

The lightweight scale package covers these common numeric and categorical
mappings. [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) explains when a chart needs D3 instead.

### Data belongs to marks

Each mark receives its own iterable:

```ts
const marks = [
  areaY(forecastRows, {
    x: 'date',
    y1: 'low',
    y2: 'high',
  }),
  lineY(actualRows, {
    x: 'date',
    y: 'value',
  }),
  ruleY([target]),
]
```

The arrays may have different lengths and datum types. There is no required `{ series: [...] }` wrapper and no requirement to reshape unrelated layers into one table. This keeps simple charts simple and lets custom compositions use the data model that naturally represents each layer.

If a transform creates new rows, run that transform before the mark. Memoize expensive derived rows through application or framework reactivity. See [Chart Definitions](./chart-grammar.md#source-charts-docs-concepts-chart-definitions-md).

### Marks choose geometry

A mark turns data and channel values into scene nodes and interaction points:

```ts
lineY(rows, {
  x: 'date',
  y: 'revenue',
  z: 'region',
})
```

- `lineY` chooses connected line geometry.
- `x` and `y` map compatible fields to positional channels.
- `z` partitions observations into independent lines and feeds the default categorical color mapping.

Built-in marks infer observation identity from a unique top-level `id`, nested
`data.id`, or mark-specific positional value. Add `key` only when none
represents the entity.

Choose a mark for the analytical task, then layer other marks to add context. [Marks and Layering](./chart-grammar.md#source-charts-docs-concepts-marks-and-layering-md) describes the built-in families.

### Channels map data to meaning

A channel is usually a compatible field name:

```ts
dot(rows, {
  x: 'revenue',
  y: 'retention',
  z: 'segment',
  r: 'accounts',
})
```

It can also be an accessor when the value is derived:

```ts
dot(rows, {
  x: (row) => row.revenue / row.accounts,
  y: 'retention',
})
```

Accessors receive `(datum, { index, data })` and remain fully typed. Field
channels are filtered by the value type the mark accepts, so TypeScript rejects
a date field where a numeric bar length is required.

Channels describe mappings. Constant appearance options such as `stroke: '#2563eb'` or `fillOpacity: 0.2` describe a fixed style. The distinction keeps semantic encodings visible in source.

Read [Data and Channels](./chart-grammar.md#source-charts-docs-concepts-data-and-channels-md) for missing values, accessors, keys, grouping, color, and radius.

### Scale factories derive semantic space

Pass a factory when its domain should follow the mark channels:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'

const axes = {
  x: {
    scale: scalePoint,
    axis: { label: 'Month' },
  },
  y: {
    scale: scaleLinear,
    nice: true,
    grid: true,
    axis: { label: 'Revenue' },
  },
}
```

The marks supply the domain, the factory supplies the mapping, and TanStack
Charts supplies the responsive range. Pass a configured scale instance when
the application owns a fixed domain.

### Guides explain scales

Axis guide options live next to their scale:

```ts
const y = {
  scale: revenueScale,
  grid: true,
  axis: {
    label: 'Monthly revenue',
    ticks: {
      count: 5,
      format: (value: number) => `${Math.round(value / 1_000)}k`,
    },
  },
}
```

The scale maps values. The guide makes that mapping legible. `ticks`, `format`, `label`, `grid`, `reverse`, `tickRotate`, and `labelOffset` are presentation controls for the axis; they do not replace scale semantics.

Omitted margins are measured from the actual guides. See [Layout, Axes, and Coordinates](./chart-grammar.md#source-charts-docs-concepts-layout-axes-and-coordinates-md).

### Layers build richer charts

Marks render in array order. Put context behind the primary data and annotations above it:

```ts group=layered-chart env=charts file=/src/chart.ts entry
import { areaY, defineChart, dot, lineY } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const rows = [
  { month: 'Jan', value: 14 },
  { month: 'Feb', value: 18 },
  { month: 'Mar', value: 16 },
  { month: 'Apr', value: 23 },
  { month: 'May', value: 27 },
  { month: 'Jun', value: 25 },
]

export default defineChart({
  marks: [
    areaY(rows, {
      x: 'month',
      y: 'value',
      fill: '#93c5fd',
      fillOpacity: 0.35,
    }),
    lineY(rows, {
      x: 'month',
      y: 'value',
      stroke: '#2563eb',
      strokeWidth: 2,
    }),
    dot(rows, {
      x: 'month',
      y: 'value',
      r: 4,
      fill: '#2563eb',
    }),
  ],
  scales: {
    x: {
      scale: () => scaleBand<string>().padding(0.12),
    },
    y: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: { label: 'Value' },
    },
  },
})
```

The area establishes context, the line carries the trend, and the dots keep
each observation visible. All three marks share the same rows and scales.

### Definitions compile the grammar

`defineChart` preserves the relationship between datum types, channel values, configured scales, axes, scenes, and interaction callbacks.

- An **object definition** closes over stable data and options.
- A **responsive definition** receives the current size and default build-time
  theme.

The definition is also the application memoization boundary. Keep reusable
definitions at module scope. In a component, memoize the complete definition
against the application values it captures.

### Rendering is downstream

The grammar does not contain DOM or framework lifecycle code. It compiles to a keyed `ChartScene` containing:

- Resolved chart and margin bounds
- Resolved x, y, and color mappings
- Renderer-neutral scene nodes
- Interaction points that retain original data
- Theme and gradient resources

The built-in SVG renderer, DOM and framework hosts, static exporter, and custom
renderers all consume that same result.

Continue with [Chart Definitions](./chart-grammar.md#source-charts-docs-concepts-chart-definitions-md), or start from a task in [Choosing a Chart](./chart-grammar.md#source-charts-docs-guides-choosing-a-chart-md).

<a id="source-charts-docs-concepts-layout-axes-and-coordinates-md"></a>

## Layout Axes And Coordinates

Source: `charts:docs/concepts/layout-axes-and-coordinates.md`.

TanStack Charts gives as much space as possible to the plot while keeping chart-owned guides inside the surface. The normal path is container-responsive and uses automatic margins.

### Surface, margin, and plot rectangle

Every scene has three nested regions:

```text
surface: scene.width × scene.height
└─ automatic or explicit margins
   └─ plot rectangle: scene.chart
```

`scene.chart` contains:

```ts
interface ChartBounds {
  x: number
  y: number
  width: number
  height: number
}
```

Marks, grids, clipping, pointer focus, and copied scale ranges use this resolved plot rectangle.

### Container responsiveness

Omit `width` on the DOM host or framework adapter:

```tsx
<Chart
  definition={chart}
  height={360}
  initialWidth={640}
  ariaLabel="Monthly revenue"
/>
```

The host observes its container and coalesces width changes into an animation frame. `initialWidth` is used when a real width is not yet available and for deterministic server output.

Use `aspectRatio` when height should follow width:

```tsx
<Chart
  definition={chart}
  aspectRatio={16 / 9}
  initialWidth={640}
  ariaLabel="Monthly revenue"
/>
```

Set a fixed `width` only for an intentionally fixed graphic such as export, print, or email.

Responsive definitions receive the current `width` and `height`, so presentation can adapt to the chart container:

```ts
const chart = defineChart(({ width }) => ({
  marks: [lineY(rows, { x: 'date', y: 'value' })],
  scales: {
    x: {
      scale: xScale,
      axis: {
        ticks: { count: width < 420 ? 4 : 8 },
        tickLabels: { rotate: width < 520 ? -30 : undefined },
      },
    },
    y: {
      scale: yScale,
      axis: { label: width < 480 ? undefined : 'Weekly downloads' },
    },
  },
}))
```

### Automatic margins

Leave `margin` undefined for normal charts. The layout solver accounts for:

- Formatted tick-label width and height
- Rotated tick-label bounds
- First and last tick overhang
- Axis titles and their offsets
- Text-mark bounds, including anchors, pixel offsets, and rotation
- Current container font metrics
- Optional color legends

The solver may resolve scales and text-mark positions more than once, but marks
render once against the final plot rectangle. `clip: true` keeps the plot
boundary authoritative, so clipped text does not expand automatic margins.

Explicit margins lock only the sides you provide:

```ts
const chart = defineChart({
  marks,
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },

  margin: { left: 80 },
})
```

Here the left margin is exactly `80`; top, right, and bottom remain automatic.

`margin: 0` locks every side to zero:

```ts
const sparkline = defineChart({
  marks: [lineY(values)],
  guides: false,
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },

  margin: 0,
})
```

Use that combination for sparklines and intentionally chrome-free embedded graphics.

### Text measurement

Static scenes use deterministic text estimates. The DOM host and browser
framework adapters measure painted glyph bounds with the chart container's
inherited font and relayout after web fonts load.

Advanced renderers can supply `measureText`. Its metrics include painted x and y offsets relative to the requested anchor and baseline, not only width and height. This is necessary for correct containment of rotated and anchored labels.

Automatic margins contain chart-owned guides and Cartesian `text` marks. Axis
tick labels are thinned against their measured, optionally rotated bounds.
Explicit text placement remains responsible for data-label collisions.

### Axis guide options

Each axis combines a required scale factory or instance with optional guide controls:

```ts
const x = {
  scale: xScale,
  grid: false,
  axis: {
    ticks: {
      count: 6,
      format: (date: Date) => monthFormatter.format(date),
    },
    tickLabels: { rotate: -30 },
    label: { text: 'Month', offset: 12 },
  },
}
```

| Option            | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `axis`            | Configure the axis or hide it with `false`           |
| `axis.line`       | Show or hide the baseline                            |
| `axis.ticks`      | Configure candidates, stubs, padding, and formatting |
| `axis.tickLabels` | Configure label rotation and collision thinning      |
| `axis.label`      | Configure the axis title and offset                  |
| `grid`            | Draw grid lines at semantic candidates               |
| `reverse`         | Reverse the responsive range                         |

The y grid defaults to visible and the x grid defaults to hidden when `grid` is omitted.

Candidate generation and label layout are separate. Choose at most one of
`axis.ticks.count`, `axis.ticks.spacing`, and `axis.ticks.values`. Grid lines
and tick stubs use the generated candidates; label thinning does not remove
either. `axis.ticks.size: 0` removes stubs while retaining labels and grid
lines.

Rotation and thinning are independent. Thinning is enabled by default and
uses measured rotated bounds:

```ts
const x = {
  scale: xScale,
  axis: {
    ticks: { spacing: 80 },
    tickLabels: {
      rotate: -35,
      thin: { minGap: 8, priority: 'ends', keep: importantDates },
    },
  },
}
```

Hard-kept labels are retained even when they collide. Values absent from the
candidate set add labels only.

Hide one guide without removing its scale:

```ts
const x = {
  scale: xScale,
  axis: false,
}
```

Hide every axis and grid while keeping scales for marks:

```ts
const chart = defineChart({
  marks,
  guides: false,
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },
})
```

Set a reserved scale to `null` only when no mark uses that dimension. For
example, a `ruleY`-only chart uses `scales: { x: null, y: { scale: yScale } }`.

### Multiple axes

Add a named scale when one coordinate system needs an independent mapping.
Declare whether it maps x or y, choose its axis side, then bind the relevant
mark to its ID:

```ts
const chart = defineChart({
  marks: [
    lineY(revenue, { x: 'date', y: 'value' }),
    lineY(margin, {
      x: 'date',
      y: 'percent',
      yScale: 'margin',
    }),
  ],
  scales: {
    x: { scale: dateScale },
    y: { scale: revenueScale, axis: { label: 'Revenue' } },
    margin: {
      channel: 'y',
      scale: marginScale,
      side: 'right',
      axis: { label: 'Margin' },
    },
  },
})
```

`xScale` and `yScale` bind marks to scale IDs, not axis IDs. Axes visualize the
scale registry entries. Multiple axes on one side stack outward and take part
in automatic margin measurement.

### Scale ranges and coordinate direction

Scale factories derive domains from marks. Configured instances retain fixed
semantic domains. TanStack Charts supplies ranges from `scene.chart`.

For a normal cartesian chart:

- x increases from the left edge to the right edge.
- continuous y increases from the bottom edge to the top edge.
- a y band scale lays categories from top to bottom.

`reverse: true` flips the range. It does not reorder or mutate the source domain.

See [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) for scale selection, responsive ownership, and
pixel-to-value inversion.

### Continuous viewports

A continuous axis can present one semantic window of a larger content domain:

```ts
const x = {
  scale: scaleUtc().domain([historyStart, historyEnd]),
  viewport: {
    domain: [visibleStart, visibleEnd],
    translate: dragOffset,
  },
}
```

The configured or inferred scale domain describes the complete content.
`viewport.domain` is the committed semantic window used for mapping, axes, and
grid lines. `viewport.translate` is a transient output-space offset applied
after that mapping.

Viewport ownership is resolved for each mark and each axis. A mark that
materializes an active viewport axis is content on that axis by default. The
compiler gives each such mark its own plot-bounded clip layer and applies only
the translations for axes it owns. Axes and grid lines stay fixed. Marks that
do not depend on the translated axis also stay fixed, such as a frame or a
y-only annotation during an x drag. Custom marks can override either axis as
`'content'` or `'fixed'` through `InitializedMark.viewport`.

Marks, focus layers, interaction points, and tooltip anchors use the same
presented coordinates. `scene.points` retains every content point, including
off-window points, for rendering and diagnostics. The interaction host limits
pointer strategies and keyboard navigation to clipped content points whose
presented anchors are inside the plot clip. Points from marks with fixed
viewport ownership remain candidates outside the plot.
`viewportInteractionPoints(scene)` returns that subset without changing
`scene.points`.

Translation is expressed in screen-direction scene pixels: positive x moves
content right, negative x moves it left, positive y moves it down, and negative
y moves it up. Domain order and `reverse` do not change those directions.

This makes paged history one chart and one continuous line rather than a guide
chart overlaid with several plot charts. During a drag, keep the committed
domain fixed and update only `translate`. To settle one page, animate the
translation to one plot width, then update the semantic domain and reset the
translation to zero in the same application commit.

Viewport domains accept two distinct finite numbers or two distinct finite
Dates. The scale must be configured or inferable, continuous, invertible,
unclamped, and independently accept domain and range assignment. Band,
ordinal, quantize, clamped, and getter-only scales are rejected. An authored
`axis.viewport` cannot be applied to an opaque custom `ChartScale`; a custom
resolver can instead return a complete `ResolvedScale.viewport` that it owns.
A logarithmic content domain and viewport domain must contain finite, nonzero
numbers and remain on the same side of zero.

The resolved scale exposes both coordinate systems:

```ts
const { contentDomain, domain, translate, map } = scene.scales.x.viewport!
```

`scene.scales.x.map(value)` is the committed, untranslated coordinate used to
construct geometry. `viewport.map(value)` returns its presented coordinate.

### Non-cartesian coordinates

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
[Polar and Radar Charts](./examples-advanced.md#source-charts-docs-examples-polar-and-radar-md) and
[Maps and Spatial Charts](./examples-advanced.md#source-charts-docs-examples-maps-and-spatial-md).

### Band alignment

A band scale returns the start of a band. TanStack Charts centers the resolved positional value:

```text
band start ├──────── bandwidth ────────┤
                         ▲
                  mapped chart value
```

This gives bars, dots, text, ticks, and interaction points a shared categorical center.

Bars use the full primary bandwidth minus their `inset`:

```ts
barX(rows, {
  x: 'value',
  y: 'category',
  inset: 2,
})
```

The band scale's `paddingInner` and `paddingOuter` determine category spacing.
`inset` removes additional pixels from both bar edges after layout.

For side-by-side bars, `layout: group()` subdivides the primary bandwidth. See
[Bars and Rankings](./examples-core.md#source-charts-docs-examples-bars-and-rankings-md).

### Scene and pointer coordinates

Scene nodes and `ChartPoint.x` and `ChartPoint.y` use absolute scene coordinates, including the margin offset.

Application overlays can align to the plot:

```ts
const scene = host.getScene()
const overlayStyle = {
  left: `${scene.chart.x}px`,
  top: `${scene.chart.y}px`,
  width: `${scene.chart.width}px`,
  height: `${scene.chart.height}px`,
}
```

DOM pointer coordinates must first be converted into scene coordinates using
the rendered surface bounds. Chart-owned focus and the first-party brush, cursor,
and zoom behaviors do this automatically against resolved scales. A custom
gesture can use the resolved scale's optional `invert` operation.

### Clipping and overflow

`clip: true` clips marks to `scene.chart`. Guides and legends remain outside the clip:

```ts
const chart = defineChart({
  marks,
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },

  clip: true,
})
```

Automatic margins only reserve space for chart-owned guides and legends. Application HTML overlays, external controls, and custom renderer chrome own their own layout.

### Complete horizontal ranking

```ts group=horizontal-ranking env=charts file=/src/chart.ts entry
import { barX, defineChart, ruleX } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { citywages } from './data'

const rows = [...citywages]
  .sort((left, right) => right.POP_2015 - left.POP_2015)
  .slice(0, 8)

const compact = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export default defineChart({
  marks: [
    ruleX([0], { stroke: '#94a3b8', strokeOpacity: 0.6 }),
    barX(rows, {
      x: 'POP_2015',
      y: 'Metro',
      fill: '#2563eb',
      inset: 2,
      radius: 3,
    }),
  ],
  scales: {
    x: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: {
        label: '2015 population',
        ticks: { format: (value) => compact.format(value) },
      },
    },
    y: {
      scale: () => scaleBand<string>().paddingInner(0.12).paddingOuter(0.06),
    },
  },
})
```

```ts group=horizontal-ranking file=/src/data.ts collapsed
export interface MetroPopulation {
  Metro: string
  POP_2015: number
}

export const citywages: readonly MetroPopulation[] = [
  { Metro: 'New York–Newark–Jersey City', POP_2015: 20_182_305 },
  { Metro: 'Los Angeles–Long Beach–Anaheim', POP_2015: 13_340_068 },
  { Metro: 'Chicago–Naperville–Elgin', POP_2015: 9_532_569 },
  { Metro: 'Dallas–Fort Worth–Arlington', POP_2015: 7_206_144 },
  { Metro: 'Houston–The Woodlands–Sugar Land', POP_2015: 6_656_947 },
  { Metro: 'Washington–Arlington–Alexandria', POP_2015: 6_097_684 },
  { Metro: 'Philadelphia–Camden–Wilmington', POP_2015: 6_069_875 },
  { Metro: 'Miami–Fort Lauderdale–West Palm Beach', POP_2015: 6_012_331 },
]
```

This chart needs only the lightweight linear and band scale entries.

For responsive layout recipes, see [Responsive Charts](./production.md#source-charts-docs-guides-responsive-charts-md). For the exact shape of scenes and resolved bounds, see [Runtime and Scene Reference](./runtime-scales-reference.md#source-charts-docs-reference-runtime-and-scene-md).

<a id="source-charts-docs-concepts-marks-and-layering-md"></a>

## Marks And Layering

Source: `charts:docs/concepts/marks-and-layering.md`.

A mark turns data and channel values into renderer-neutral scene nodes. Marks are small, composable units; a chart type is usually a useful arrangement of several marks rather than a separate component.

### Built-in mark families

| Visual task                                   | Start with                   |
| --------------------------------------------- | ---------------------------- |
| Trend or connected path                       | `lineY`                      |
| Difference between two connected paths        | `differenceY`, `differenceX` |
| Least-squares trend and confidence band       | `linearRegressionY`          |
| Range, band, or filled trend                  | `areaY`, `areaX`             |
| Category comparison                           | `barY`, `barX`               |
| Interval, heatmap cell, or rectangular region | `rect`, `cell`               |
| Relationship or individual observation        | `dot`, `hexagon`             |
| Tukey distribution summary                    | `boxY`, `boxX`               |
| Baseline, threshold, or reference             | `ruleX`, `ruleY`             |
| Label or annotation                           | `text`                       |
| Directed relationship                         | `arrow`, `link`, `vector`    |
| Compact distribution glyph                    | `tickX`, `tickY`             |
| Plot frame                                    | `frame`                      |
| Small-multiple composition                    | `facet`, `facetChart`        |
| Pie, donut, gauge, or cyclic profile          | `polar` and radial marks     |
| Projected GeoJSON                             | `geoShape`                   |

Start from the analytical question in
[Choosing a Chart](./chart-grammar.md#source-charts-docs-guides-choosing-a-chart-md). The
[Mark Reference](./specifications.md#source-charts-docs-reference-index-md) lists every channel and
style option. Polar and geographic marks use explicit capability subpaths.

### Layer order is declaration order

Marks earlier in the array paint behind later marks:

```ts
const marks = [
  areaY(rangeRows, rangeOptions),
  ruleY([target], ruleOptions),
  lineY(actualRows, lineOptions),
  dot(highlightedRows, dotOptions),
  text(labels, textOptions),
]
```

A useful default order is:

1. Background regions and filled areas
2. Reference bands and rules
3. Primary bars or lines
4. Highlight dots, ticks, or vectors
5. Labels and annotations

There is no separate overlay subsystem. An annotation is another mark with its own data, channels, and stable identity.

### Opt individual marks into Canvas

Import the Canvas renderer and attach it only to paint-heavy marks:

```ts
import { canvasChartRenderer } from '@tanstack/charts/canvas'

const marks = [
  areaY(denseRange, {
    x: 'date',
    y1: 'low',
    y2: 'high',
    renderer: canvasChartRenderer,
  }),
  lineY(summary, { x: 'date', y: 'value' }),
  dot(highlights, { x: 'date', y: 'value' }),
  text(labels, { x: 'date', y: 'value', text: 'label' }),
]
```

The host keeps axes, guides, and marks without `renderer` in SVG. It creates
ordered SVG and Canvas layers from the mark declaration order, so a Canvas
mark can sit behind, between, or in front of SVG marks. Focus, tooltips,
keyboard navigation, responsive updates, SSR shell adoption, and export still
use the shared chart host.

Cartesian and radial mark option objects accept `renderer`. A
`compositeMark` can select a renderer for its complete output, or its children
can select their own renderers when the parent does not. The same nested
selection works inside facets and `polar`.

Importing `@tanstack/charts/canvas` is the opt-in boundary that adds the Canvas
painter to the bundle. Reuse a stable renderer instance across updates. The
exported `canvasChartRenderer` singleton already has stable identity. Creating
a new renderer or changing the renderer sequence replaces the affected layer
composition.

### Decorative layers

When two layered marks describe the same observations, choose one interaction
owner. For example, dots can own focus and tooltips while the connected line
remains visual:

```ts
import { dot, lineY } from '@tanstack/charts'
import { decorative } from '@tanstack/charts/mark/decorative'

const marks = [
  decorative(lineY(rows, { x: 'date', y: 'value' })),
  dot(rows, { x: 'date', y: 'value' }),
]
```

`decorative(mark)` preserves the mark's scale channels, domains, layout-label
measurement, motion, and painted geometry. It removes interaction points and
scene ownership, so the layer cannot add a second keyboard stop, tooltip, or
activation target. The input must be an always-painted mark without focus or
state behavior.

### Mark identity

Every mark has an `id`. When omitted, it is derived from the mark type and array position.

Provide an explicit `id` when:

- Marks appear conditionally.
- Marks reorder.
- Two definitions should reconcile the same conceptual layer.
- Application code needs a stable `markId` in interaction points.

```ts
lineY(rows, {
  id: 'actual-revenue',
  x: 'date',
  y: 'actual',
})
```

Built-in marks infer datum identity from a unique top-level `id`, nested
`data.id`, or mark-specific position. Supply `key` when that inferred value is
not the entity's stable identity.

### Grouped geometry

An explicit `z` partitions geometry that should not connect:

```ts
lineY(rows, {
  x: 'date',
  y: 'value',
  z: 'region',
})
```

Each region becomes an independent line. Area marks use the same grouping
rule. When `z` is omitted on a connected line or area, an authored `color`
channel supplies the path groups as well as color semantics. Explicit `z`
always wins when the two fields differ.

Bars stack their single quantitative channel by default. Use
`layout: group({ scale })` for side-by-side bars; it groups by `z` when present
and otherwise by discrete `color`. Explicit `y1`/`y2` or `x1`/`x2` channels
opt out of implicit stacking and preserve authored intervals.

### Line and area gaps

`lineY` and `areaY` split geometry at missing or invalid positional values:

```ts
interface Reading {
  id: string
  time: Date
  low: number | null
  high: number | null
}

areaY(readings, {
  x: 'time',
  y1: 'low',
  y2: 'high',
})
```

The break is intentional evidence that no interval was materialized for that observation. Do not replace missing data with zero unless zero is semantically correct.

### Baselines and intervals

Bar and area marks accept explicit endpoints:

```ts
areaY(rows, {
  x: 'date',
  y1: 'minimum',
  y2: 'maximum',
})

barY(rows, {
  x: 'category',
  y1: 'start',
  y2: 'end',
})
```

When `y1` or `x1` is omitted, bar and area baselines default to zero where that mark supports it. Supplying both endpoints makes the interval semantics explicit and includes both sides in scale materialization.

Rectangles are the general interval mark:

```ts
rect(windows, {
  x1: 'start',
  x2: 'end',
  y1: 'minimum',
  y2: 'maximum',
})
```

### Style values and visual channels

Some appearance options are constants:

```ts
lineY(rows, {
  x: 'date',
  y: 'value',
  stroke: '#2563eb',
  strokeWidth: 2.5,
  strokeOpacity: 0.9,
})
```

Marks that accept `VisualChannel` options can also derive a style from each row:

```ts
barX(rows, {
  x: 'value',
  y: 'label',
  fill: (row) => (row.highlighted ? '#f97316' : '#94a3b8'),
})
```

Use a semantic group or color channel and configured color scale when color represents data consistently across observations. Use a visual accessor for local styling that is not a shared scale.

### Clipping

Set `clip: true` on the chart definition when marks must not paint outside the resolved plot rectangle:

```ts
const chart = defineChart({
  marks,
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },

  clip: true,
})
```

Clipping applies to the chart’s mark group, not axes or legends. Leave it off when an intentional annotation or marker should extend beyond the plot.

### Complete range-band composition

```ts group=temperature-range env=charts file=/src/chart.ts entry
import { scaleUtc } from 'd3-scale'
import { areaY, defineChart, lineY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { sfTemperatures } from './data'

export default defineChart({
  marks: [
    areaY(sfTemperatures, {
      id: 'daily-range',
      x: 'date',
      y1: 'low',
      y2: 'high',
      fill: '#60a5fa',
      fillOpacity: 0.24,
    }),
    lineY(sfTemperatures, {
      id: 'daily-low',
      x: 'date',
      y: 'low',
      stroke: '#2563eb',
      strokeWidth: 1.5,
    }),
    lineY(sfTemperatures, {
      id: 'daily-high',
      x: 'date',
      y: 'high',
      stroke: '#dc2626',
      strokeWidth: 1.5,
    }),
  ],
  scales: {
    x: {
      scale: scaleUtc,
      axis: { label: 'Day' },
    },
    y: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: { label: 'Temperature (°F)' },
    },
  },
})
```

```ts group=temperature-range file=/src/data.ts collapsed
export interface DailyTemperature {
  date: Date
  high: number
  low: number
}

export const sfTemperatures: readonly DailyTemperature[] = [
  { date: new Date('2026-07-01T00:00:00Z'), high: 68, low: 55 },
  { date: new Date('2026-07-02T00:00:00Z'), high: 71, low: 56 },
  { date: new Date('2026-07-03T00:00:00Z'), high: 66, low: 54 },
  { date: new Date('2026-07-04T00:00:00Z'), high: 69, low: 55 },
  { date: new Date('2026-07-05T00:00:00Z'), high: 73, low: 57 },
  { date: new Date('2026-07-06T00:00:00Z'), high: 70, low: 56 },
]
```

The numeric y axis uses the lightweight linear scale. The x axis upgrades to
D3 UTC so spacing and ticks preserve elapsed time; install `d3-scale` and
`@types/d3-scale` for that mapping.

### Custom marks

Use `createMark` when the needed geometry cannot be expressed by composing built-ins. A custom mark should still:

- Materialize scale channels explicitly.
- Use the resolved chart scales.
- Emit stable keyed scene nodes.
- Emit typed interaction points when the geometry represents observations.
- Reuse theme, clipping, and renderer-neutral scene primitives.

Most custom visualizations should remain compositions of built-in marks plus application-prepared rows. Reach for a custom mark only when the geometry itself is new. See [Custom Marks and Renderers](./composition.md#source-charts-docs-guides-custom-marks-and-renderers-md).

<a id="source-charts-docs-concepts-scales-and-d3-md"></a>

## Scales And D3

Source: `charts:docs/concepts/scales-and-d3.md`.

TanStack Charts accepts callable, copyable scale factories and instances. Start
with the exact compact scale entry that matches the mapping. Upgrade only the
axis, color, or radius mapping whose semantics require D3.

- **TanStack compact scales** cover numeric linear, categorical band and point,
  and ordinal mappings without a production D3 dependency.
- **D3** adds temporal, nonlinear, radial, interpolated, and statistical scale
  semantics plus optional shape, time, and spatial algorithms.
- **TanStack Charts** infers factory domains from mark channels, assigns
  responsive pixel ranges, lays out guides, compiles scenes, and renders them.

Compact and D3 scales implement the same chart-facing contract and can be used
in one definition. There is no hidden D3 umbrella import.

`@tanstack/charts` declares `d3-array`, `d3-shape`, `d3-geo`, `d3-delaunay`,
`d3-hexbin`, `d3-contour`, `d3-force`, `d3-sankey`, and `d3-hierarchy` because its
transforms, polar and D3 curve features, geo features, and optional spatial,
network, and hierarchy entries own those implementations. They are not peers
and require no `use` configuration. Bundlers tree-shake unused algorithms and
geometry, and exact feature subpaths remain available when an application
wants a narrower import.

### Start with compact scales

Install TanStack Charts for ordinary numeric and categorical charts:

```sh
pnpm add @tanstack/charts
```

Import one exact family:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scalePoint } from '@tanstack/charts/scales/point'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
```

There is intentionally no aggregate `/scales` export. Each exact scale subpath
fits the same callable, `domain`, `range`, and `copy` contract consumed by
TanStack Charts.

The compact linear scale has numeric, two-stop domains and ranges. It supports
mapping, `invert`, `clamp`, `nice`, ticks, basic numeric tick formatting, and
copying. The categorical families support D3-compatible domain interning,
padding, alignment, rounding, bandwidth, unknown values, and copying.

Choose the smallest family that preserves the data's meaning:

| Mapping                                                    | Start with                           | Upgrade when                                                                    |
| ---------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| Numeric x or y                                             | `@tanstack/charts/scales/linear`     | The mapping needs piecewise domains, nonnumeric output, or custom interpolation |
| Categories with width, such as bars                        | `@tanstack/charts/scales/band`       | The mapping needs behavior outside the documented compact band contract         |
| Categories without width, such as line or dot positions    | `@tanstack/charts/scales/point`      | The values must instead be spaced by elapsed time                               |
| Stable categorical colors                                  | `@tanstack/charts/scales/ordinal`    | The color mapping is sequential, diverging, quantile, quantize, or threshold    |
| Dates spaced by elapsed time and calendar-aware ticks      | `d3-scale` `scaleTime` or `scaleUtc` | —                                                                               |
| Logarithmic, power, symlog, square-root, or radial mapping | The corresponding `d3-scale` family  | —                                                                               |

`scaleBand` and `scalePoint` accept `Date` values as categories. They preserve
distinct dates and first-seen order, but they do not represent elapsed time. A
Friday and the following Monday occupy adjacent categorical positions. Use
`scaleTime` or `scaleUtc` when the weekend must occupy its real temporal span or
when the axis needs calendar-aware ticks.

An axis formatter does not by itself require a larger scale. Pass
`Intl.NumberFormat`, `Intl.DateTimeFormat`, or another application formatter to
the guide. Upgrade to D3 when the scale's own tick, interpolation, or domain
semantics are required.

### Upgrade one scale at a time

A definition does not need one scale implementation for every mapping. This
time-series chart upgrades x to D3 while keeping its ordinary numeric y scale
compact:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleUtc } from 'd3-scale'

const chart = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value' })],
  scales: {
    x: { scale: scaleUtc, nice: true },
    y: { scale: scaleLinear, nice: true },
  },
})
```

Add `d3-scale` and `@types/d3-scale` because this source imports `scaleUtc`.
The compact scale entries ship their own declarations.

### Direct dependency ownership

If application source imports a `d3-*` module, declare that module and its
matching TypeScript package directly:

```sh
pnpm add d3-scale
pnpm add -D @types/d3-scale
```

Do not declare a D3 module merely because another package uses it internally. A
chart that directly upgrades only its temporal axis should declare only
`d3-scale`; bundlers should not retain unused shape, force, geo, zoom, or
hierarchy code. Apply the same direct-dependency rule when source imports
`d3-array`, `d3-shape`, or another granular D3 module.

This rule also applies when definitions live in framework component source.
The adapter mounts a definition; it does not own the D3 imports used to author
it.

`@tanstack/charts` declares `d3-array`, `d3-shape`, and `d3-geo` because its
numeric-bin and stack transforms, polar and D3 curve features, and geo features
own those implementations. They are not peers and require no `use`
configuration. Bundlers tree-shake unused algorithms and geometry, and exact
feature subpaths remain available when an application wants a narrower import.

### Capability map

Use the official D3 pages as the API reference for each algorithm. TanStack Charts documentation only describes how its output crosses the chart boundary.

| Need                                                               | D3 module                                                   | How it enters TanStack Charts                                                                                |
| ------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Quantitative, temporal, categorical, log, radial, and color scales | [`d3-scale`](https://d3js.org/d3-scale)                     | Pass a factory for an inferred domain or an instance for a fixed domain                                      |
| Sequential, diverging, and categorical color schemes               | [`d3-scale-chromatic`](https://d3js.org/d3-scale-chromatic) | Pass an interpolator or scheme to a configured D3 color scale                                                |
| Extents, grouping, aggregation, bins, sorting, and statistics      | [`d3-array`](https://d3js.org/d3-array)                     | Convert source data into rows, domains, or thresholds before creating marks                                  |
| Stacks, pies, arcs, curves, and shape generators                   | [`d3-shape`](https://d3js.org/d3-shape)                     | Feed pie intervals and curve factories to polar marks, or bridge a Cartesian curve with `d3Curve`            |
| Calendar intervals                                                 | [`d3-time`](https://d3js.org/d3-time)                       | Build bins, ticks, rounded selections, and date windows in application code                                  |
| Numeric formatting                                                 | [`d3-format`](https://d3js.org/d3-format)                   | Pass a formatter to an axis or tooltip option                                                                |
| Time formatting                                                    | [`d3-time-format`](https://d3js.org/d3-time-format)         | Pass a formatter to an axis or tooltip option                                                                |
| Quadtrees                                                          | [`d3-quadtree`](https://d3js.org/d3-quadtree)               | Implement an optional `ChartSpatialIndexFactory`                                                             |
| Delaunay and Voronoi geometry                                      | [`d3-delaunay`](https://d3js.org/d3-delaunay)               | Use exact optional `delaunayLink` or `voronoi` marks; import directly for a custom spatial index or geometry |
| DOM selection for optional D3 gesture controllers                  | [`d3-selection`](https://d3js.org/d3-selection)             | Imported privately by first-party brush and zoom behaviors; import directly for a different DOM controller   |
| Brushes                                                            | [`d3-brush`](https://d3js.org/d3-brush)                     | Use exact optional `brushX`; import directly for a different application-owned gesture                       |
| Pan and zoom                                                       | [`d3-zoom`](https://d3js.org/d3-zoom)                       | Use exact optional `zoomX` with a controlled semantic window; import directly for a different gesture policy |
| Hierarchies and layouts                                            | [`d3-hierarchy`](https://d3js.org/d3-hierarchy)             | Use exact optional `treeLayout` for flat tidy trees and `treemap` for responsive rectangle tiling            |
| Force simulation                                                   | [`d3-force`](https://d3js.org/d3-force)                     | Use exact optional `forceLayout` for static settlement; import directly for a live application controller    |
| Sankey flow layout                                                 | [`d3-sankey`](https://github.com/d3/d3-sankey)              | Use exact optional `sankeyDiagram` for responsive layout and ordinary child-mark composition                 |
| Geographic projections and paths                                   | [`d3-geo`](https://d3js.org/d3-geo)                         | Pass a responsive projection factory to `geoShape`                                                           |

An optional algorithm does not necessarily need final chart layout.
`treeLayout` and `forceLayout` produce semantic data-space coordinates, so
native `link`, `dot`, and `text` marks can map their output through ordinary
positional scales. Treemap topology depends on the final plot aspect ratio and
its padding is measured in pixels, so the exact `treemap` mark owns both the
responsive D3 layout and its downward-increasing screen coordinates. Sankey
column allocation, padding, and proportional link width also resolve in final
pixels; `sankeyDiagram` then composes ordinary marks over immutable node and
link rows. Density estimation and Delaunay geometry likewise run after scale
ranges resolve. Keep live force controllers in application state; the exact
Charts force entry owns deterministic static settlement only.

### Positional scales follow materialized dimensions

Every materialized positional dimension declares its scale:

```ts
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const spec = {
  marks,
  scales: {
    x: { scale: scaleBand },
    y: { scale: scaleLinear, nice: true },
  },
}
```

Positionless marks use explicit null entries:

```ts
import { defineChart, frame } from '@tanstack/charts'

const borderOnlyChart = defineChart({
  marks: [frame()],
  scales: {
    x: null,
    y: null,
  },
})
```

A mark with x values requires a non-null x scale. A mark with y values requires
a non-null y scale. One-dimensional charts use `null` only for the unused
entry. The scale factory chooses the mapping; materialized mark channels
supply its domain.

### Factory domains come from marks

Pass the factory itself when the domain should cover the rendered data:

```ts
import { scalePoint } from '@tanstack/charts/scales/point'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const chart = defineChart({
  marks: [lineY(rows, { x: 'month', y: 'value' })],
  scales: {
    x: { scale: scalePoint },
    y: { scale: scaleLinear, nice: true },
  },
})
```

Continuous factories use the finite extent of their channels. Band and point
factories use distinct values in first-seen order. Bars and areas include zero
when they use an implicit zero baseline. Empty channels retain the factory's
native domain.

Return a scale from a zero-argument factory when it needs configuration before
domain inference:

```ts
import { scaleBand } from '@tanstack/charts/scales/band'

const x = {
  scale: () => scaleBand<string>().padding(0.16),
}
```

Use the axis `nice` option because nicening must happen after inference.

### Fixed domains remain application semantics

Pass a scale instance when the domain must not follow the rendered marks:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleUtc } from 'd3-scale'

const normalizedY = {
  scale: scaleLinear().domain([0, 1]),
}

const windowedX = {
  scale: scaleUtc().domain([windowStart, windowEnd]),
}
```

Be equally deliberate with:

- Whether a log scale is valid for all values
- Whether time is local or UTC
- Which categories exist when some are filtered out
- Whether multiple facets share a domain
- Whether a color domain must remain stable across sessions

The instance rule is the same for compact and D3 scales. Use the implementation
that owns the required mapping semantics, then configure the application-owned
domain on that instance.

### Responsive ranges belong to TanStack Charts

Do not assign pixel ranges to positional scales used by the chart:

```ts
const xScale = scaleUtc
const yScale = scaleLinear
```

For each scene, TanStack Charts:

1. Creates a factory scale or copies a configured instance.
2. Calculates the plot rectangle after guide measurement.
3. Assigns the current responsive pixel range to the copy.
4. Uses the copy for marks, ticks, grids, and interaction points.

The source scale is never mutated. This makes one module-level definition safe across container resizes, server rendering, multiple mounted hosts, and facets.

The `reverse` axis option reverses the responsive range without changing the domain:

```ts
const y = {
  scale: scaleLinear,
  reverse: true,
}
```

### Categorical scales and bandwidth

Pass the compact band-scale factory for categorical positions:

```ts
import { scaleBand } from '@tanstack/charts/scales/band'

const categoryScale = () =>
  scaleBand<string>().paddingInner(0.12).paddingOuter(0.06)
```

TanStack Charts applies the plot range, reads the scale bandwidth, and treats the mapped value as the center of the band for mark and interaction coordinates. Bars use the primary bandwidth by default.

For grouped bars, use `layout: group({ scale })`. The supplied band scale is
copied and its range is assigned within the primary band. Grouping is explicit;
the default length-channel geometry is stacked.

### Color scales

Omitting `color.scale` uses the chart theme’s ordinal palette for categorical group values:

```ts
const chart = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value', z: 'region' })],
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },
})
```

Use a configured compact ordinal scale for semantic stability:

```ts
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'

const regionColor = scaleOrdinal(
  ['North', 'South', 'West'],
  ['#2563eb', '#f97316', '#10b981'],
)

const chart = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value', z: 'region' })],
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },

  color: {
    scale: regionColor,
    legend: colorLegend({ label: 'Region' }),
  },
})
```

The color scale is copied before use. Unlike positional scales, its range is semantic color output and remains the range you configured.

Use a factory when a custom color mapping should infer its domain:

```ts
const color = {
  scale: () => scaleOrdinal<string, string>().range(['#2563eb', '#f97316']),
}
```

Upgrade the color mapping to `d3-scale` when numeric values need sequential or
diverging interpolation, or when authored policy needs quantile, quantize, or
threshold bins. `d3-scale-chromatic` supplies optional color schemes; it is a
separate direct dependency when imported.

### Full D3 scale semantics

Replace only the compact factory whose contract is insufficient. Import that
factory directly from `d3-scale`:

- `scaleUtc` and `scaleTime` preserve elapsed-time spacing and calendar ticks.
- `scaleLog`, `scalePow`, and `scaleSymlog` express nonlinear quantitative
  comparisons.
- `scaleSqrt` and `scaleRadial` map magnitude to symbol radius or area.
- `scaleSequential`, `scaleDiverging`, `scaleQuantile`, `scaleQuantize`, and
  `scaleThreshold` express quantitative or stepped color policy.
- D3 `scaleLinear` supports piecewise domains and ranges, nonnumeric range
  interpolation, custom interpolators, and the rest of the complete D3 linear
  contract.

The factory-versus-instance and responsive-range rules do not change after an
upgrade.

### Radius scales

`dot` treats `r` as pixels unless `rScale` is supplied:

```ts
import { scaleSqrt } from 'd3-scale'

dot(rows, {
  x: 'revenue',
  y: 'retention',
  r: 'accounts',
  rScale: {
    scale: () => scaleSqrt().range([3, 24]),
  },
})
```

The radius factory infers `[0, maximum]` from `r`. A configured scale instance
still keeps its explicit domain. D3 owns the radius mapping; the chart owns dot
geometry and rendering.

### Curves

Straight lines and areas do not need `d3-shape`. Opt into a curve only when the design requires it:

```ts
import { curveMonotoneX } from 'd3-shape'
import { d3Curve, lineY } from '@tanstack/charts'

lineY(rows, {
  x: 'date',
  y: 'value',
  curve: d3Curve(curveMonotoneX),
})
```

`d3Curve` adapts a D3 curve factory to the small line-and-area curve contract. Importing it is explicit so a straight chart does not need the shape path.

Horizontal `areaX` marks use the separate `d3AreaXCurve` bridge from `@tanstack/charts/d3/area-x`.

### Transforms produce rows

TanStack Charts includes typed, data-first helpers for common transforms:

```ts
import { binX } from '@tanstack/charts/transform/bin'

const histogram = binX(rows, {
  value: 'value',
  thresholds: 20,
})
```

Pass the result to `rect`, `barY`, `lineY`, `dot`, or a custom mark. The helpers
use compact row-oriented kernels or isolated granular D3 implementations while
retaining typed source lineage. Domain-specific D3 transforms still work
directly; no adapter or library-owned series shape is required. Keep
substantial transforms beside the definition and memoize them through
application reactivity.

The same rule applies to stacks, pies, hierarchies, force layouts, and
server-prepared intervals: preserve the useful output as typed rows, then map
it through mark channels. A responsive geographic projection instead belongs
in `geoShape`'s projection factory because its pixel range depends on the final
plot bounds.

### Pixel-to-value inversion

`brushX`, `continuousCursor`, `zoomX`, and free `cursorHost` bindings own
final-scale inversion for their normal gestures. A custom crop or gesture can
read the same optional inverse from the resolved scene scale:

```ts
const scene = host.getScene()
const invertX = scene.scales.x.invert
if (!invertX) throw new Error('This interaction requires an invertible x scale')

const selectedDate = invertX(pointerX)
```

For a normal continuous y axis, the resolved scale already owns its reversed
pixel range:

```ts
const invertY = scene.scales.y.invert
if (!invertY) throw new Error('This interaction requires an invertible y scale')

const selectedValue = invertY(pointerY)
```

Apply the application’s precision policy after inversion. For example, round a day-based selection with a D3 time interval or round a currency threshold to the supported increment. Pixels do not imply semantic precision.

A free cursor needs no `valueAt` callback for ordinary numeric or temporal
axes. Provide one only to replace inversion with explicit snapping, rounding,
or another semantic mapping. Missing and non-invertible scales require that
override.

When the application owns a custom gesture, disable the native nearest-point
focus strategy if the two interactions would conflict. See
[Interactions and Selections](./interaction-accessibility.md#source-charts-docs-guides-interactions-and-selections-md).

### Log-scale example

```ts group=log-scale env=charts file=/src/chart.ts entry
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleLog } from 'd3-scale'
import { defineChart, dot } from '@tanstack/charts'
import { flare, type FlareRow } from './data'

type SizedFlareRow = FlareRow & { size: number }

const rows = flare.filter((row): row is SizedFlareRow => row.size !== null)

export default defineChart({
  marks: [
    dot(rows, {
      x: 'size',
      y: (row) => row.name.split('.').length - 1,
      key: 'name',
      r: 4,
      fill: '#2563eb',
    }),
  ],
  scales: {
    x: {
      scale: scaleLog().domain([200, 30_000]),
      grid: true,
      axis: { label: 'Class size' },
    },
    y: {
      scale: scaleLinear,
      grid: true,
      axis: { label: 'Hierarchy depth' },
    },
  },
})
```

```ts group=log-scale file=/src/data.ts collapsed
export interface FlareRow {
  name: string
  size: number | null
}

export const flare: readonly FlareRow[] = [
  { name: 'flare.analytics.cluster', size: 3938 },
  { name: 'flare.analytics.graph', size: 10_871 },
  { name: 'flare.analytics.optimization', size: 5731 },
  { name: 'flare.display', size: 12_867 },
  { name: 'flare.query', size: 2779 },
  { name: 'flare.unresolved', size: null },
]
```

This chart upgrades only x. Install `d3-scale` and `@types/d3-scale` for
`scaleLog`; the ordinary numeric y mapping remains compact.

### Custom scales are the final extension

Use `ChartScale` only when neither a compact nor D3 callable scale can express
the mapping. Its resolver owns the complete domain, finite mapping, ticks,
formatting, bandwidth, and response to the supplied chart range. A custom scale
is appropriate for context-aware mappings that need the resolved chart options,
not as a wrapper around an existing compact or D3 scale.

See
[Custom Extensions](./rendering-composition-reference.md#source-charts-docs-reference-custom-extensions-md)
for the resolver contract.

For chart-side scale, guide, and color types, see
[Scales, Guides, and Color Reference](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md).

<a id="source-charts-docs-guides-choosing-a-chart-md"></a>

## Choosing A Chart

Source: `charts:docs/guides/choosing-a-chart.md`.

Start with the comparison a reader must make. A chart type is the result of
that decision, not the starting point.

TanStack Charts does not inspect a dataset and choose a chart automatically.
Data exploration, cleaning, and recommendation belong in application tooling
or an authoring skill. The runtime receives data that is ready to encode.

### Task-first choices

| Reader task                     | First choice                           | Common alternatives                                                     |
| ------------------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| Follow change over ordered time | Line                                   | Area for accumulated magnitude; bars for discrete periods               |
| Compare named categories        | Horizontal bars                        | Dots or lollipops when a zero baseline is not the message               |
| Compare two values per category | Dumbbell or slopegraph                 | Grouped bars when absolute magnitude matters                            |
| Inspect a relationship          | Scatterplot                            | Bubble scatterplot for a third quantitative value                       |
| Inspect one distribution        | Histogram                              | ECDF when cumulative probability matters                                |
| Compare distributions           | Boxplot or violin                      | Faceted histograms when shape details matter                            |
| Show an interval                | Range area, interval bar, or error bar | Candlestick for financial open-high-low-close data                      |
| Show composition                | Stacked bars or areas                  | Normalized stack for proportions; mosaic for two categorical dimensions |
| Show a matrix                   | Heatmap                                | Labeled cells for small matrices                                        |
| Repeat the same view by group   | Facets                                 | Linked views when each panel needs a different role                     |
| Show topology                   | Node-link diagram                      | Matrix encoding when the network is dense                               |
| Edit or navigate a time range   | Chart plus semantic controls           | Controlled brush or zoom behavior; application-owned scrubber or editor |

The [chart examples](./examples-core.md#source-charts-docs-examples-index-md) show these choices as executable
compositions.

### Check the data shape

Before choosing marks, identify:

- the observation represented by one row;
- quantitative, temporal, ordinal, and nominal fields;
- whether missing values mean unknown, zero, or a deliberate gap;
- whether order is semantic or merely presentational;
- which rows share a series or group;
- whether values are points or intervals;
- whether aggregation would answer the question more clearly than raw marks.

Keep those rows in their natural application shape. Use
[channels](./chart-grammar.md#source-charts-docs-concepts-data-and-channels-md) to map fields or accessors into
visual properties. Do not convert data into a library-owned series structure.

### Prefer the smallest complete composition

Use this escalation order:

1. One built-in mark or first-party composite mark.
2. Several built-in marks sharing scales.
3. Facets or explicitly linked views.
4. D3-prepared rows passed to built-in marks.
5. `compositeMark` for a reusable unit made only from ordinary marks.
6. A custom mark that emits scene nodes.
7. An application-owned overlay or gesture controller.

Prefer a first-party mark when it owns inseparable semantics. `boxX` and `boxY`
accept raw observations and keep quartiles, fences, whiskers, outliers, and
lineage aligned. A candlestick remains a useful link-plus-ranged-rectangle
composition. A focus-and-context view is two charts sharing semantic state.

See [Marks and Layering](./chart-grammar.md#source-charts-docs-concepts-marks-and-layering-md),
[Faceting and Composition](./composition.md#source-charts-docs-guides-faceting-and-composition-md), and
[Custom Marks and Renderers](./composition.md#source-charts-docs-guides-custom-marks-and-renderers-md) for the
corresponding boundaries.

### Avoid misleading defaults

- Bar charts should normally include zero on the quantitative axis.
- Line charts imply an ordered continuum. Do not connect unordered categories.
- Area encodings compare distance from a baseline. Use explicit interval
  endpoints when the baseline is not zero.
- Stacks make totals easy to compare but interior layers harder to compare.
- Bubble radius must use an area-preserving radial scale.
- Dual quantitative axes often make unrelated movement look related. Prefer
  aligned small multiples.
- Three-dimensional effects distort position, length, and area. Keep analytical
  marks planar.
- More raw marks are not automatically more honest. For dense data, choose a
  bounded representation that preserves the question.

The [Large Data](./production.md#source-charts-docs-guides-large-data-md) guide covers the raw-versus-encoded decision.

### Verify the result

A chart is ready when:

- its title or surrounding text states the question;
- the axes and legend identify units;
- ordering and aggregation are intentional;
- color is not the only carrier of essential state;
- missing and empty states are explicit;
- focus and keyboard behavior match pointer behavior;
- updates preserve keys, selection, and viewport state;
- the chart remains readable at its smallest supported container;
- a table or textual summary is available when exact values are essential.

If the first attempt fails one of these checks, change the representation
before adding decorative complexity.

<a id="source-charts-docs-guides-typescript-md"></a>

## Typescript

Source: `charts:docs/guides/typescript.md`.

TanStack Charts is designed so ordinary chart code names its application types
once. Data, channel outputs, scale domains, focus points, and framework props
then infer from the definition.

### Infer from mark channels

<!-- docs-example: typescript-inference typecheck -->

```ts
import { scaleTime } from 'd3-scale'
import { defineChart, lineY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'

interface Reading {
  id: string
  recordedAt: Date
  temperature: number
}

const readings: readonly Reading[] = []

const definition = defineChart({
  marks: [
    lineY(readings, {
      x: 'recordedAt',
      y: 'temperature',
    }),
  ],
  scales: {
    x: { scale: scaleTime },
    y: { scale: scaleLinear },
  },
})
```

Here the datum is `Reading`, x values are `Date`, and y values are `number`.
An incompatible scale or channel field fails at the definition instead of
surfacing later in a tooltip callback.

### Capture application values

```ts
function createTrafficDefinition(rows: readonly Reading[]) {
  return defineChart({
    marks: [
      lineY(rows, {
        x: 'recordedAt',
        y: 'temperature',
      }),
    ],
    scales: {
      x: { scale: scaleTime },
      y: { scale: scaleLinear },
    },
  })
}
```

Framework components should memoize the complete definition:

```tsx
const definition = useMemo(() => createTrafficDefinition(readings), [readings])

return <Chart definition={definition} ariaLabel="Temperature history" />
```

Definition identity tells the host when captured application data or options
changed. A responsive definition callback still rebuilds when the host size
changes:

```ts
function createTrafficDefinition(rows: readonly Reading[]) {
  return defineChart(({ width }) => ({
    marks: [
      lineY(rows, {
        x: 'recordedAt',
        y: 'temperature',
      }),
    ],
    scales: {
      x: { scale: scaleTime },
      y: { scale: scaleLinear },
    },

    margin: width < 480 ? 24 : 40,
  }))
}
```

### Keep literal information

Prefer:

- field-name channels such as `x: 'recordedAt'`;
- typed accessors when a value is derived;
- `defineChart({...})` or a responsive `defineChart(() => ({...}))`;
- `satisfies` when naming a configuration object separately.

Avoid annotating an intermediate object as broad `ChartSpec` before passing it
to `defineChart`. That discards the literal mark tuple used for axis and
callback inference.

The mark tuple determines the value type accepted by each reserved positional
scale. `scales.x` and `scales.y` are always present in canonical definitions.
Use `null` for a dimension that no mark materializes. Named scale selectors on
marks keep those values out of the reserved entry's inferred type.

### Callback types

Focus and selection callbacks receive the original datum and inferred
coordinate types:

```tsx
<Chart
  definition={definition}
  ariaLabel="Temperature readings"
  onSelect={(point) => {
    if (!point) return
    point.datum.recordedAt // Date
    point.xValue // Date
    point.yValue // number
  }}
/>
```

Do not cast a callback parameter or re-find its datum by key. If inference has
degraded to `unknown`, move back to the definition and look for an erased mark
tuple, an `any` annotation, or an untyped custom scale.

### Extract inferred types

The public type utilities are useful at extension boundaries:

```ts
import type {
  ChartMarkDatum,
  ChartSpecDatum,
  ChartSpecXValue,
  ChartSpecYValue,
} from '@tanstack/charts'
import type {
  ChartMarkPointX,
  ChartMarkPointY,
} from '@tanstack/charts/mark/scale-values'
```

Use them to describe reusable helpers without repeating a datum or coordinate
union manually. The exact utility contracts are listed in
[Types](./types.md#source-charts-docs-reference-types-md).

### Custom marks

`createMark<TDatum, TXValue, TYValue, TXScaleId, TYScaleId>` keeps interaction
points and scale values aligned for the common case. The scale ID parameters
default to `x` and `y`. Provide them when a custom mark selects named scales so
its values do not widen the reserved scale types. Use the advanced scale-value
factory when the materialized axis domain differs from the point anchor or
when a custom mark is positionless and declares both scale value types as
`never`.

See [Custom Marks and Renderers](./composition.md#source-charts-docs-guides-custom-marks-and-renderers-md). A custom
extension that requires `as unknown as`, a private import, or suppressed type
errors indicates a missing public boundary and should be reduced to a failing
type test.

### Type tests

Keep positive and negative examples near reusable definitions:

```ts
// @ts-expect-error chart options do not accept formal input
mountChart(container, {
  definition,
  input: { rows: readings },
  ariaLabel: 'Readings',
})
```

Use `@ts-expect-error` only when the test asserts a specific rejected contract.
Do not use it to make application examples compile.

### No-cast checklist

- Datum and captured application values are typed at the application boundary.
- Channel fields are checked against the datum.
- Scale domains match inferred coordinate types.
- Definitions preserve their literal mark tuple.
- Adapters infer props from the definition.
- Callbacks receive original typed data.
- Custom extensions expose, rather than erase, their generic relationship.
