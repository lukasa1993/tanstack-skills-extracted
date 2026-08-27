# Other official guides

Official guidance not covered by a narrower topic.

<a id="source-tanstack-charts-build-chart-interactions"></a>

## Build Chart Interactions

Source: `tanstack-charts-build-chart-interactions`.

## Build Chart Interactions

Use **trigger → inspect → decide → build → verify**. Charts owns renderer-neutral interaction mechanics; the application owns accepted semantic state, persistence, product policy, and equivalent non-pointer controls.

### Setup

Start with native focus and tooltip behavior before adding controlled state:

```ts
import { defineChart, lineY } from '@tanstack/charts'
import { crosshair } from '@tanstack/charts/crosshair'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { tooltip } from '@tanstack/charts/tooltip'

const rows = [
  { week: 'May 4', value: 820 },
  { week: 'May 11', value: 960 },
  { week: 'May 18', value: 1_140 },
]

export const chart = defineChart({
  marks: [
    lineY(rows, { x: 'week', y: 'value', points: true }),
    crosshair({ x: { label: true }, y: false }),
  ],
  scales: {
    x: { scale: scalePoint },
    y: { scale: scaleLinear },
  },
  focus: 'nearest-x',
  maxFocusDistance: Number.POSITIVE_INFINITY,
  tooltip,
})
```

Keep the finite default focus distance when empty space should clear inspection.

### Core Patterns

#### Choose interaction ownership

| Need                                                                         | Owner                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------ |
| Nearest datum, grouped tooltip, snapped crosshair, keyboard point navigation | chart focus                                |
| Semantic selection, free cursor, handle, brush, zoom, interactive legend     | first-party control plus controlled signal |
| Shared accepted range, persistence, playback, editing, rich pinned details   | application state/UI                       |

Read [the interaction state matrix](./assets/tanstack-charts-build-chart-interactions/references/interaction-state.md) before combining controls.

#### Coordinate chart and application selection by key

```ts
import { defineChart, dot } from '@tanstack/charts'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { keyedSelection, whenSelected } from '@tanstack/charts/selection'

const observations = [
  { id: 'a', speed: 12, efficiency: 32 },
  { id: 'b', speed: 18, efficiency: 27 },
]

let selectedId: string | null = null

const selection = keyedSelection<
  (typeof observations)[number],
  string,
  number,
  number
>({
  selected: controlledSignal(selectedId, (next) => {
    selectedId = next
  }),
  key: (datum) => datum.id,
})

export const chart = defineChart({
  marks: [
    dot(observations, {
      id: 'observations',
      x: 'speed',
      y: 'efficiency',
      key: 'id',
    }),
    whenSelected(
      dot(observations, {
        id: 'selected-observation',
        x: 'speed',
        y: 'efficiency',
        key: 'id',
        r: 7,
      }),
      selection,
    ),
  ],
  scales: {
    x: { scale: scaleLinear },
    y: { scale: scaleLinear },
  },
  selection,
})
```

Rebuild the definition with the accepted controlled value. A signal is a snapshot and callback, not a hidden store.

#### Synchronize semantic values, not pixels

Use one `createChartCursor` controller across definitions when charts should resolve the same x/y value through their own scales. Keep crosshair presentation in each definition. Never copy DOM coordinates or mutate another chart's SVG.

#### Add portaling only for containment boundaries

Use native tooltip content first. Add `portal` when overflow, transforms, or stacking contexts clip the surface. Use framework adapter tooltip bodies only when the product requires rich interactive content.

### Common Mistakes

#### CRITICAL Mutating SVG for focus presentation

Wrong:

```ts
onRender={({ svg }) => svg.insertBefore(activeBand, svg.firstChild)}
```

Correct:

```ts
marks: [
  whenFocused(bandX(rows, { x: 'date' }), { match: 'x' }),
  lineY(rows, channels),
]
```

DOM mutation bypasses scene identity, SSR, Canvas, React Native, motion, and cleanup. Current focus marks replace an older workaround that still appears in issue examples.

Source: GitHub issue 9; `API-FRICTION.md` F-178

#### HIGH Focusing a point-less rule

Wrong:

```ts
whenFocused(ruleX(dates), { match: 'x' })
```

Correct:

```ts
focusGuideX(rows, { x: 'date', y: 'value', xRule: {} })
```

Rules emit no interaction points, so a focus filter has no candidate identity. Current focus-guide primitives replace this legacy pattern.

Source: GitHub issue 32; `API-FRICTION.md` F-237

#### CRITICAL Treating callbacks as complete behavior

Wrong: attach only an `onRangeChange` or key callback to an overlay.

Correct: use the matching controlled control (`keyedSelection`, `continuousCursor`, `handleX`, `brushX`, or `zoomX`) and store its accepted semantic value in application state.

A callback alone does not define capture, clamping, cancellation, keyboard operations, or ownership.

Source: `API-FRICTION.md` F-075; `docs/guides/interactions-and-selections.md`

#### HIGH Keeping tooltips inside clipped ancestors

Wrong:

```ts
tooltip: {
  use: tooltip
}
```

Correct:

```ts
tooltip: {
  use: (tooltip, portal)
}
```

Overflow, transforms, and stacking contexts can trap a correctly positioned tooltip.

Source: `API-FRICTION.md` F-133; `docs/guides/tooltips-and-focus.md`

#### HIGH Letting decorative layers own duplicate points

Wrong: make every area, line, dot, label, and highlight layer over one observation independently focusable.

Correct: choose one semantic interaction owner and use `decorative`, `whenFocused`, or `whenSelected` for supporting presentation.

Duplicate points create repeated keyboard stops, focus candidates, activations, and tooltip rows.

Source: `API-FRICTION.md` F-218; `docs/guides/tooltips-and-focus.md`

#### HIGH Tension: rich interaction versus portable rendering

Prefer marks, controls, semantic state, and host extensions over DOM-only overlays. Verify pointer and keyboard paths, static fallback, teardown, and any native equivalent.

See also: `./other-guides.md#source-tanstack-charts-ship-accessible-charts` and `./other-guides.md#source-tanstack-charts-extend-tanstack-charts`

### References

- [Interaction ownership and state machines](./assets/tanstack-charts-build-chart-interactions/references/interaction-state.md)

See also: `./other-guides.md#source-tanstack-charts-coordinate-charts-with-tanstack`, `./other-guides.md#source-tanstack-charts-ship-accessible-charts`, and `./other-guides.md#source-tanstack-charts-update-and-animate-charts` — interaction requires explicit cross-surface ownership, keyboard parity, and stable identity across updates.

<a id="source-tanstack-charts-compose-marks-and-views"></a>

## Compose Marks And Views

Source: `tanstack-charts-compose-marks-and-views`.

## Compose Marks and Views

Use **trigger → inspect → decide → build → verify**. A chart type is usually a composition of marks with shared scales, not a component to look up by name.

### Setup

Layer broad context first and direct evidence last:

```ts
import { areaY, defineChart, dot, lineY, ruleY, text } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'

const rows = [
  { month: 'Jan', low: 72, value: 80, high: 89, label: '' },
  { month: 'Feb', low: 77, value: 86, high: 96, label: '' },
  { month: 'Mar', low: 84, value: 94, high: 106, label: 'Launch' },
]

export const chart = defineChart({
  marks: [
    areaY(rows, { id: 'range', x: 'month', y1: 'low', y2: 'high' }),
    ruleY([90], { id: 'target' }),
    lineY(rows, { id: 'trend', x: 'month', y: 'value' }),
    dot(
      rows.filter((row) => row.label),
      { id: 'events', x: 'month', y: 'value' },
    ),
    text(
      rows.filter((row) => row.label),
      {
        id: 'event-labels',
        x: 'month',
        y: 'value',
        text: 'label',
        dy: -10,
      },
    ),
  ],
  scales: {
    x: { scale: scalePoint },
    y: { scale: scaleLinear },
  },
})
```

Declaration order is paint order. Each mark may use a different datum type.

### Core Patterns

#### Give one layer interaction ownership

```ts
import { defineChart, dot, lineY } from '@tanstack/charts'
import { decorative } from '@tanstack/charts/mark/decorative'

const rows = [
  { id: 'jan', month: 'Jan', value: 80 },
  { id: 'feb', month: 'Feb', value: 86 },
]

export const chart = defineChart({
  marks: [
    decorative(lineY(rows, { x: 'month', y: 'value' })),
    dot(rows, { x: 'month', y: 'value', key: 'id' }),
  ],
})
```

`decorative` keeps geometry and scale materialization but removes duplicate focus, tooltip, and activation points.

#### Use explicit geometry groups

```ts
import { lineY } from '@tanstack/charts'

const rows = [
  { date: '2026-08-01', region: 'North', value: 42, status: 'healthy' },
  { date: '2026-08-01', region: 'South', value: 37, status: 'healthy' },
]

export const lines = lineY(rows, {
  x: 'date',
  y: 'value',
  z: 'region',
  color: 'status',
})
```

Keep geometry identity (`z`) separate from paint semantics (`color`) when they differ.

#### Choose the smallest complete composition

Escalate in this order:

1. One built-in or first-party composite mark.
2. Several built-in marks sharing scales.
3. Facets or named views.
4. D3-prepared rows passed to built-in marks.
5. `compositeMark` built from ordinary marks.
6. A custom mark that emits renderer-neutral scene nodes.
7. An application-owned overlay or gesture controller.

Read [the mark-selection matrix](./assets/tanstack-charts-compose-marks-and-views/references/mark-selection.md) before creating a custom mark.

#### Use facets for repeated questions, views for distinct roles

Use `facetChart` when every panel asks the same question over a group. Use `composeViews` for focus-and-context, marginal summaries, or panels with distinct roles. Keep semantic shared state in the application; do not synchronize views through DOM nodes.

### Common Mistakes

#### CRITICAL Encoding the chart as one custom path

Wrong: emit one path containing the complete visualization.

Correct: retain mark-local data, channels, scales, and interaction points; extend only the geometry that built-ins cannot express.

A monolithic path discards automatic domains, typed rows, portable rendering, focus ownership, and composability.

Source: `docs/concepts/grammar-of-graphics.md`; `docs/guides/custom-marks-and-renderers.md`

#### MEDIUM Expecting an area to draw its line

Wrong:

```ts
marks: [areaY(rows, { x: 'date', y: 'value' })]
```

Correct:

```ts
marks: [
  areaY(rows, { x: 'date', y: 'value' }),
  lineY(rows, { x: 'date', y: 'value' }),
]
```

Area and line are independent layers with independent style, state, and point ownership.

Source: `docs/reference/marks/line-and-area.md`

#### HIGH Letting decorative layers own duplicate points

Wrong: layer line, area, dots, and labels over the same rows with every mark interactive.

Correct: choose the semantic owner and wrap always-painted supporting marks with `decorative`.

Duplicate points create repeated keyboard stops, focus candidates, and tooltip rows.

Source: `API-FRICTION.md` F-218; `docs/guides/tooltips-and-focus.md`

#### HIGH Rebuilding supported coordinates in userland

Wrong: project polar, spatial, hierarchy, or network geometry into arbitrary pixels before chart layout.

Correct: use first-party coordinate/layout primitives, or a resolved-layout mark when final bounds are truly required.

Userland projection hides responsive final-bounds work and duplicates capability modules. Current first-party primitives fixed many early gaps, but old examples still encourage application-owned engines.

Source: `API-FRICTION.md` F-117, F-199–F-208; `docs/examples/index.md`

### References

- [Mark selection and composition matrix](./assets/tanstack-charts-compose-marks-and-views/references/mark-selection.md)

See also: `./other-guides.md#source-tanstack-charts-build-chart-interactions` and `./other-guides.md#source-tanstack-charts-extend-tanstack-charts` — layering determines point ownership, and native composition should be exhausted before extension.

<a id="source-tanstack-charts-configure-scales-guides-color"></a>

## Configure Scales Guides Color

Source: `tanstack-charts-configure-scales-guides-color`.

## Configure Scales, Guides, and Color

Use **trigger → inspect → decide → build → verify**. The application owns semantic domains and color policy; TanStack Charts owns inferred domains, responsive positional ranges, guide measurement, and final paint resolution.

### Setup

Use factories for inferred domains and configured instances for fixed semantic domains:

```ts
import { colorLegend, defineChart, lineY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
import { scalePoint } from '@tanstack/charts/scales/point'

const rows = [
  { week: 'May 4', package: 'core', downloads: 820 },
  { week: 'May 11', package: 'core', downloads: 960 },
  { week: 'May 4', package: 'react', downloads: 610 },
  { week: 'May 11', package: 'react', downloads: 730 },
]

const color = scaleOrdinal<string, string>()
  .domain(['core', 'react'])
  .range(['#2563eb', '#f97316'])

export const chart = defineChart({
  marks: [lineY(rows, { x: 'week', y: 'downloads', z: 'package' })],
  scales: {
    x: { scale: () => scalePoint<string>().padding(0.2) },
    y: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: { label: 'Downloads' },
    },
  },
  color: { scale: color, legend: colorLegend({ label: 'Package' }) },
})
```

### Core Patterns

#### Choose a scale by semantics

- Numeric position → compact `scaleLinear`.
- Categories with width → compact `scaleBand`.
- Categories without width → compact `scalePoint`.
- Stable categorical paint → compact `scaleOrdinal`.
- Elapsed time, nonlinear transforms, radial mapping, statistical bins, or continuous color → exact `d3-scale` family.

Read [the ownership matrix](./assets/tanstack-charts-configure-scales-guides-color/references/scale-guide-ownership.md) before configuring a D3 instance.

#### Share domains intentionally

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'

export const percentScale = scaleLinear().domain([0, 1])

export const sharedPercentAxis = {
  scale: percentScale,
  axis: {
    label: 'Conversion rate',
    ticks: { format: (value: number) => `${Math.round(value * 100)}%` },
  },
}
```

A configured instance keeps the domain stable across filtering, facets, or linked views. Charts copies it and assigns the current range.

#### Keep series identity separate from paint

```ts
import { lineY } from '@tanstack/charts'

const rows = [
  { date: '2026-08-01', series: 'api', status: 'healthy', value: 91 },
  { date: '2026-08-01', series: 'worker', status: 'healthy', value: 84 },
]

export const mark = lineY(rows, {
  x: 'date',
  y: 'value',
  z: 'series',
  color: 'status',
})
```

Use `z` for geometry groups, `color` for semantic scale values, and `fill`/`stroke` for final local paint overrides.

#### Separate tick candidates from label collision

Tick count, spacing, or values chooses candidates. Label thinning, rotation, formatting, and priority decide which candidate labels remain readable. Automatic margins contain guides; they do not make every label legible.

### Common Mistakes

#### CRITICAL Assigning positional pixel ranges

Wrong:

```ts
x: {
  scale: scaleLinear().range([0, 640])
}
```

Correct:

```ts
x: {
  scale: scaleLinear
}
```

The final plot range changes after container measurement and guide margins resolve.

Source: `API-FRICTION.md` F-002; `docs/concepts/scales-and-d3.md`

#### CRITICAL Using a default instance for inference

Wrong:

```ts
y: {
  scale: scaleLinear()
}
```

Correct:

```ts
y: {
  scale: scaleLinear
}
```

A scale instance owns its domain; the factory delegates domain inference to chart channels.

Source: `CHANGELOG.md` 0.0.1 migration; `docs/concepts/scales-and-d3.md`

#### HIGH Using color as geometry identity accidentally

Wrong:

```ts
lineY(rows, { x: 'date', y: 'value', color: 'status' })
```

Correct:

```ts
lineY(rows, {
  x: 'date',
  y: 'value',
  z: 'series',
  color: 'status',
})
```

When `z` is absent, a discrete color channel can also partition connected geometry.

Source: `API-FRICTION.md` F-009, F-013; `docs/concepts/data-and-channels.md`

#### HIGH Treating containment as collision avoidance

Wrong: rely on automatic margins to solve dense tick labels.

Correct: define candidate spacing, thinning priority, rotation, abbreviation, or a different responsive composition.

Margins keep guides inside the surface; they do not guarantee labels avoid each other.

Source: `API-FRICTION.md` F-023, F-160; `docs/guides/responsive-charts.md`

#### HIGH Tension: responsive adaptation versus comparison stability

Reduce labels or change composition at narrow widths, but do not silently change a shared domain, threshold, or category-color assignment to make the chart fit.

See also: `./other-guides.md#source-tanstack-charts-design-responsive-charts` § Common Mistakes

### References

- [Scale, guide, grouping, and color ownership](./assets/tanstack-charts-configure-scales-guides-color/references/scale-guide-ownership.md)

See also: `./other-guides.md#source-tanstack-charts-design-responsive-charts` and `./other-guides.md#source-tanstack-charts-debug-and-verify-charts` — final ranges depend on layout, and blank charts often expose scale-contract failures.

<a id="source-tanstack-charts-coordinate-charts-with-tanstack"></a>

## Coordinate Charts With Tanstack

Source: `tanstack-charts-coordinate-charts-with-tanstack`.

## Coordinate Charts With TanStack

Run **trigger → inspect → decide → build → verify** across the complete product state graph. Assign one owner to each row projection, semantic key, filter, selection, viewport, revision, transaction, and timing policy before connecting libraries.

### Setup

#### Inspect the ownership graph

Record these boundaries before writing adapters:

| Concern                                                   | Normal owner                                   | Chart input                                                       |
| --------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| Remote fetching, cache, freshness, retry                  | Query                                          | resolved semantic snapshot plus status                            |
| Normalized records, live queries, optimistic transactions | DB or sync collection                          | keyed projection plus sync state                                  |
| Grid filtering, sorting, grouping, pagination             | Table when grid-local; application when shared | explicitly chosen row-model frontier                              |
| Visual encoding, focus, scene, renderer                   | Charts                                         | prepared rows and committed behavior options                      |
| Shared client intent                                      | Store or application state                     | semantic filters, keys, and domains                               |
| Restorable navigation state                               | Router search                                  | validated compact intent, never pixels or row objects             |
| Mounted grid window                                       | Virtual                                        | no analytical effect unless “visible rows” is the stated question |
| Burst, queue, or batch policy                             | Pacer                                          | paced source revisions or committed actions                       |
| Draft controls and validation                             | Form or local state                            | committed, valid intent                                           |
| SSR request and hydration                                 | Start or framework lifecycle                   | deterministic data revision, locale, and initial geometry         |

Fail condition: two libraries can independently change the same semantic state, or the chart receives rows without a named scope and revision.

#### Name each row projection

Do not pass “the rows” between surfaces. Name the analytical frontier:

- `sourceRows`: canonical records available to this client.
- `eligibleRows`: records after shared business filters.
- `summaryRows`: chart grain after aggregation or binning.
- `detailRows`: grid grain before presentation-only sorting or pagination.
- `visibleRows`: currently mounted virtual items; usually presentation only.
- `selectedRows`: rows resolved from stable semantic keys.

Document whether grid sorting, filtering, grouping, pagination, or selection changes the chart question. Use the [Table and data-grid reference](./assets/tanstack-charts-coordinate-charts-with-tanstack/references/table-and-data-grid.md) for row-model choices.

### Core Patterns

#### Derive once, project deliberately

Use one semantic projection owner, then expose separate summary and detail outputs:

```ts
const analysis = projectOrders(sourceRows, sharedIntent)

const tableData = analysis.detailRows
const chartDefinition = defineChart({
  marks: [
    lineY(analysis.summaryRows, {
      x: 'day',
      y: 'revenue',
      color: 'region',
      key: ({ datum }) => `${datum.region}:${datum.day.toISOString()}`,
    }),
  ],
  scales: {
    x: { scale: scaleUtc },
    y: { scale: scaleLinear },
  },
})
```

Do not independently restate eligibility, aggregation, or metric formulas in Table accessors and chart transforms. Presentation-only table sort and pagination may remain grid-owned.

#### Synchronize semantic intent, not component internals

Share values such as:

- entity IDs or aggregate bucket keys;
- validated filters and comparison periods;
- committed scale domains or time windows;
- selected metric and grouping dimension;
- data revision and “as of” status.

Keep DOM nodes, row indexes, chart pixels, virtual indexes, tooltip bodies, and Table row objects inside their owning surface.

#### Separate transient, committed, and persisted state

Use three phases where interaction can write data:

1. **Transient**: hover, pointer position, drag preview, and active handle remain local and cheap.
2. **Committed**: selection, accepted brush domain, and submitted filters update shared application or URL state once.
3. **Persisted**: DB or server writes expose pending, confirmed, failed, and rollback states explicitly.

Do not write every pointer frame to Router, Query, a sync engine, or a database transaction. Read [Query, DB, and sync](./assets/tanstack-charts-coordinate-charts-with-tanstack/references/query-db-and-sync.md) when records are live or writable.

#### Pace at the expensive boundary

Choose timing by semantics:

- debounce draft search or filters that should wait for intent;
- throttle disposable visual previews that need bounded frequency;
- queue writes when every operation must persist;
- batch compatible mutations, telemetry, or source revisions;
- preserve latest-wins correctness for chart presentation even when writes are lossless.

Do not add a second scheduler around work already bounded by the chart host, live-query engine, or framework.

#### Verify the full synchronization sequence

1. Load one named data revision into both surfaces.
2. Apply a shared filter and prove summary totals reconcile with detail rows.
3. Sort and paginate the grid; prove the chart changes only when intended.
4. Select from chart and grid; prove both resolve the same semantic keys.
5. Apply an optimistic update; distinguish pending from confirmed output.
6. Roll back or receive a remote update; preserve surviving selection and clear missing keys.
7. Restore URL state, hydrate, resize, virtualize, and destroy without duplicate subscriptions or writes.

### Common Mistakes

#### CRITICAL Charting the final rendered row model accidentally

Wrong: feed the chart whatever rows the grid currently renders.

Correct: choose the filtered, grouped, pre-pagination, page, or selected frontier because it matches the stated comparison.

Table row models can include sorting, grouping, expansion, and pagination. The final grid row model is a presentation result, not an automatically valid analytical dataset.

Source: TanStack Table row-model guide

#### CRITICAL Keying coordination by row or virtual index

Wrong: synchronize `row.index`, array position, or virtual item index.

Correct: define an application-level entity or aggregate key and adapt both Table and Charts to it.

Indexes change under sorting, filtering, pagination, streaming, and virtualization. Grouped Table row IDs may also contain presentation suffixes.

Source: TanStack Table rows guide; `API-FRICTION.md` F-120, F-131, and F-239

#### CRITICAL Duplicating filtering and aggregation

Wrong: implement the KPI in a Table aggregation function and again in chart preparation.

Correct: derive one named semantic projection that can feed the grid, chart, table alternative, export, and tests.

Independent pipelines drift on null policy, denominators, time boundaries, and later product changes.

Source: `docs/guides/transforms-and-reactivity.md`; `API-FRICTION.md` F-128 and F-163

#### CRITICAL Creating a bidirectional state loop

Wrong: chart selection sets a Table filter whose change recreates chart selection and writes the URL again.

Correct: assign one owner, normalize one event into semantic intent, and let every surface derive from that state without echoing equivalent updates.

Feedback loops cause redundant renders, history spam, flicker, and state that cannot settle.

Source: Charts interaction ownership; TanStack Router search-state guidance

#### HIGH Treating optimistic rows as confirmed history

Wrong: animate an optimistic mutation into the ordinary historical series with no pending state.

Correct: carry sync or transaction status into the semantic projection, differentiate pending values when decision-relevant, and verify rollback.

TanStack DB applies optimistic state before persistence and can replace or roll it back after synchronization.

Source: TanStack DB mutations and live-query guides

#### CRITICAL Persisting every interaction frame

Wrong: write every brush, handle, resize, or pointer update through Router, Query invalidation, or a sync transaction.

Correct: preview locally, pace expensive derivation if necessary, and commit one semantic value at the interaction boundary.

Frame-rate state is presentation. Persistence needs validation, cancellation, ordering, and conflict semantics.

Source: Charts interaction guides; TanStack Pacer timing guidance

#### HIGH Treating virtualization as analytical filtering

Wrong: chart only mounted grid rows because Virtual currently exposes them.

Correct: chart the intended source or filtered projection; use mounted rows only for an explicitly viewport-scoped question.

Virtual controls render work, not dataset meaning.

Source: TanStack Virtual virtualizer reference

### References

- [Table and data grids](./assets/tanstack-charts-coordinate-charts-with-tanstack/references/table-and-data-grid.md)
- [Query, DB, and sync engines](./assets/tanstack-charts-coordinate-charts-with-tanstack/references/query-db-and-sync.md)
- [TanStack application state and lifecycle](./assets/tanstack-charts-coordinate-charts-with-tanstack/references/tanstack-application-state.md)

See also: `./other-guides.md#source-tanstack-charts-prepare-chart-data`, `./other-guides.md#source-tanstack-charts-build-chart-interactions`, `./other-guides.md#source-tanstack-charts-update-and-animate-charts`, and `./other-guides.md#source-tanstack-charts-debug-and-verify-charts`.

<a id="source-tanstack-charts-debug-and-verify-charts"></a>

## Debug And Verify Charts

Source: `tanstack-charts-debug-and-verify-charts`.

## Debug and Verify Charts

Run **trigger → inspect → decide → build → verify** at the narrowest layer that owns the failure. Do not change rendering before proving prepared rows, channels, scales, and scene geometry are correct.

### Semantic and Scene Checks

#### Check: deterministic scene invariants

Expected:

```ts
import {
  createChartScene,
  defineChart,
  lineY,
  renderChartSvg,
} from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'

const rows = [
  { month: 'Jan', value: 42 },
  { month: 'Feb', value: 58 },
  { month: 'Mar', value: 76 },
]

const definition = defineChart({
  marks: [lineY(rows, { x: 'month', y: 'value', points: true })],
  scales: {
    x: { scale: scalePoint },
    y: { scale: scaleLinear },
  },
})

export const scene = createChartScene(definition, { width: 640, height: 360 })
export const svg = renderChartSvg(scene, { ariaLabel: 'Monthly value' })

if (scene.points.length !== rows.length) throw new Error('Point count mismatch')
if (scene.chart.width <= 0) throw new Error('Empty plot width')
if (/NaN|Infinity/.test(svg)) throw new Error('Invalid numeric SVG output')
```

Fail condition: expected points/domains are absent, geometry is non-finite, or final bounds are empty.

Fix: diagnose in the layer order below before mounting a host.

#### Check: diagnose in ownership order

1. Prepared rows, order, intervals, missing values, and units.
2. Materialized mark channels and grouping.
3. Resolved scale domains, ranges, bandwidths, ticks, and log validity.
4. `scene.chart` bounds and guide margins.
5. Scene node keys, geometry, clipping, and interaction points.
6. Renderer input and serialized/static output.
7. Mounted surface, framework lifecycle, fonts, and application CSS.

If the scene is wrong, changing the renderer cannot repair it. If the scene is correct, stop changing transforms and scales.

### Interaction and Lifecycle Checks

#### Check: verify a user sequence

1. Focus a known datum by pointer.
2. Verify primary/grouped semantic points and tooltip content.
3. Pin or select it.
4. Reorder, filter, update, resize, or interrupt motion.
5. Verify state follows a surviving key and clears when the key disappears.
6. Traverse and activate the same information by keyboard.
7. Destroy the host and verify no observer, event, tooltip, or frame survives.

#### Check: pair screenshots with semantic assertions

Use screenshots for label collision, font metrics, gradients, clipping, crossings, themes, and dense aliasing. Fix data, fonts, viewport, device scale, animation, locale, time zone, and revision. Pair the image with geometry and state assertions.

### Package and Performance Checks

#### Check: test a packed consumer

Install the produced tarball in a minimal consumer. Verify documented root and exact subpath imports, SSR evaluation, ESM tree shaking, optional peer boundaries, retained modules, declaration output, and runtime behavior.

#### Check: performance samples have correctness gates

Every accepted sample must prove the requested revision painted, representative geometry is finite/in-bounds, expected points exist, no lifecycle error occurred, and interaction belongs to the latest scene. Report environment, data/scene size, warmup, sample count, percentiles, and capability set.

### Common Mistakes

#### CRITICAL Casting a rejected definition

Wrong:

```tsx
<Chart definition={definition as any} ariaLabel="Revenue" />
```

Correct: repair the row type, channel, scale domain, mixed mark union, host-specific tooltip type, or custom-mark contract at its source.

A cast hides the mismatch and leaves runtime semantics dishonest.

Source: `docs/guides/typescript.md`; `docs/reference/types.md`

#### CRITICAL Asserting only element existence

Wrong: assert that an SVG, path, or canvas exists.

Correct: assert semantic domains, final bounds, geometry, resolved datum/group, update sequence, accessibility, and teardown at the layer that owns each behavior.

Presence does not prove correctness.

Source: `API-FRICTION.md` F-036, F-073, F-081; `docs/guides/testing-and-debugging.md`

#### HIGH Testing workspace source instead of packed exports

Wrong: approve because monorepo tests resolve source aliases.

Correct: install the packed package into a consumer and test public exports, peers, declarations, SSR, and bundles there.

Workspace resolution can hide missing exports, browser globals, retained optional dependencies, and publish-file omissions.

Source: `API-FRICTION.md` F-090, F-139, F-167, F-224

#### HIGH Trusting one aggregate performance number

Wrong: report one mount median for one chart.

Correct: separate preparation, scene build, paint, sustained pointer work, updates, dashboard lifecycle, correctness gates, and bundle capability.

An aggregate can hide stale output, invalid attempts, or a cost shifted into another layer.

Source: `API-FRICTION.md` F-078–F-084; `docs/guides/bundle-size-and-performance.md`

#### HIGH Tension: motion continuity versus current-state correctness

Final-frame checks miss stale focus, guides, geometry, or latest-wins violations during interruption. Test the state transition while it is happening.

See also: `./other-guides.md#source-tanstack-charts-update-and-animate-charts` and `./other-guides.md#source-tanstack-charts-design-responsive-charts`

### Release Summary

- [ ] Types pass without casts or suppressed inference.
- [ ] Empty, missing, duplicate, negative, and invalid data cases pass.
- [ ] Scene semantics and geometry pass at narrow and wide sizes.
- [ ] Pointer, keyboard, selection, update, interruption, and teardown pass.
- [ ] SSR/static output and accessibility pass.
- [ ] Packed consumer exports and bundles pass.
- [ ] Performance samples include correctness gates and target workload shape.

See also: `./other-guides.md#source-tanstack-charts-coordinate-charts-with-tanstack` — chart-grid reconciliation, URL restoration, sync status, optimistic rollback, and virtualized teardown require product-level sequences.

<a id="source-tanstack-charts-design-a-chart"></a>

## Design A Chart

Source: `tanstack-charts-design-a-chart`.

## Design a Chart From a User Goal

Use this scenario loop: **trigger → inspect → decide → build → verify**. Do not begin with a chart type, even when the request names one.

### Setup

Turn the request into this brief before writing chart code:

```ts
interface ChartBrief {
  question: string
  decision: string
  observation: string
  metric: { value: string; unit: string; denominator?: string }
  comparison:
    'time' | 'category' | 'distribution' | 'relationship' | 'composition'
  evidence: readonly string[]
}

export const brief: ChartBrief = {
  question:
    'Which acquisition channel improved conversion without losing volume?',
  decision: 'Choose where to increase next-month spend',
  observation: 'one row per channel and month',
  metric: { value: 'conversionRate', unit: '%', denominator: 'sessions' },
  comparison: 'time',
  evidence: ['conversion rate', 'sessions', 'month', 'channel'],
}
```

If the question, observation, unit, denominator, or decision is unknown, inspect the data and surrounding product before choosing marks.

### Core Patterns

#### Match the form to the reader's comparison

- Change over ordered time → line; discrete periods → bars.
- Named-category magnitude → sorted horizontal bars or dots.
- Distribution → histogram, ECDF, box, violin, or faceted histograms.
- Relationship → scatterplot; add size only for a meaningful third quantity.
- Composition → stack for totals, normalized stack for proportions, mosaic for two categorical dimensions.
- Flow, hierarchy, network, or spatial questions → use their first-party layouts only when topology is the question.

Read [the visual-task matrix](./assets/tanstack-charts-design-a-chart/references/visual-task-matrix.md) for the full routing table.

#### Separate observed, target, and projected values

```ts
import { areaY, defineChart, lineY, ruleY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'

const rows = [
  { month: 'Jan', actual: 82, forecast: null, low: null, high: null },
  { month: 'Feb', actual: 91, forecast: null, low: null, high: null },
  { month: 'Mar', actual: null, forecast: 96, low: 88, high: 106 },
  { month: 'Apr', actual: null, forecast: 103, low: 90, high: 119 },
]

export const chart = defineChart({
  marks: [
    areaY(rows, { x: 'month', y1: 'low', y2: 'high', fillOpacity: 0.15 }),
    lineY(rows, { x: 'month', y: 'actual', strokeWidth: 2.5 }),
    lineY(rows, { x: 'month', y: 'forecast', strokeDasharray: '5 4' }),
    ruleY([100], { strokeDasharray: '2 3' }),
  ],
  scales: {
    x: { scale: scalePoint },
    y: { scale: scaleLinear, axis: { label: 'Indexed revenue' } },
  },
})
```

Use different channels for status and uncertainty. A continuous unqualified line implies equal epistemic status.

#### Define proof before polish

For every chart, verify:

- the visual answers the stated question;
- axes, legend, title, or adjacent copy identify units and comparison;
- ordering, aggregation, missing-value policy, and baseline are deliberate;
- exact-value tasks have a table or textual equivalent;
- the smallest supported container preserves the important comparison;
- pointer, keyboard, updates, and empty states tell the same story.

### Common Mistakes

#### CRITICAL Starting with the requested chart type

Wrong: implement “make this a pie chart” before identifying the comparison.

Correct: restate the decision and recommend the form that makes that comparison perceptually direct. If the user retains a weaker form, state its analytical limitation and preserve the underlying semantics.

A familiar chart can answer a different question than the user needs.

Source: `docs/guides/choosing-a-chart.md`

#### HIGH Showing a rate without its denominator

Wrong: show conversion rate alone.

Correct: keep sessions or eligible population in the prepared row and expose it beside the rate or in the tooltip.

Normalized values can reverse interpretation when volume changes.

Source: `API-FRICTION.md` F-217; `docs/reference/transforms.md`

#### CRITICAL Rendering projections as observed history

Wrong: connect actuals and forecasts with one undifferentiated line.

Correct: encode the forecast boundary, projected segment, and uncertainty explicitly.

Continuous treatment implies equal certainty.

Source: `docs/examples/lines-and-areas.md`; `docs/reference/marks/difference.md`

#### HIGH Choosing area or angle for precise ranking

Wrong: rank close values with wedges, bubbles, or interior stack layers.

Correct: use aligned position or length when exact ordering is the reader's task.

Area and angle emphasize shape or part-to-whole relationships, not precise rank.

Source: `docs/guides/choosing-a-chart.md`; `docs/examples/bars-and-rankings.md`

#### HIGH Tension: analytical honesty versus visual simplicity

Simplifying aggregation can hide denominators, lineage, uncertainty, or missing-value policy. Preserve the evidence needed to interpret the result before reducing visual detail.

See also: `./other-guides.md#source-tanstack-charts-prepare-chart-data` § Common Mistakes

### References

- [Analytical task and visual-form matrix](./assets/tanstack-charts-design-a-chart/references/visual-task-matrix.md)

See also: `./other-guides.md#source-tanstack-charts-prepare-chart-data` and `./other-guides.md#source-tanstack-charts-compose-marks-and-views` — the analytical task determines both the transform and mark composition.

<a id="source-tanstack-charts-design-responsive-charts"></a>

## Design Responsive Charts

Source: `tanstack-charts-design-responsive-charts`.

## Design Responsive Charts

Use **trigger → inspect → decide → build → verify**. Adapt to the chart container and information priority; do not equate responsive design with stretching geometry.

### Setup

Omit host width, choose height deliberately, and use the responsive definition only for surface-dependent decisions:

```ts
import { barX, defineChart, mountChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const rows = [
  { feature: 'Account recovery', requests: 128 },
  { feature: 'Saved searches', requests: 95 },
  { feature: 'Audit export', requests: 72 },
]

const definition = defineChart(({ width }) => ({
  marks: [barX(rows, { x: 'requests', y: 'feature' })],
  scales: {
    x: {
      scale: scaleLinear,
      nice: true,
      axis: { ticks: { count: width < 420 ? 3 : 6 } },
    },
    y: { scale: () => scaleBand<string>().padding(0.1) },
  },
}))

const element = document.querySelector<HTMLElement>('#feature-chart')
if (!element) throw new Error('Missing #feature-chart')

export const host = mountChart(element, {
  definition,
  height: 320,
  initialWidth: 640,
  ariaLabel: 'Weekly feature requests',
})
```

The container's grid or flex item must be allowed to shrink, usually with `min-width: 0`.

### Core Patterns

#### Adapt information in priority order

At narrower containers:

1. Reduce tick candidates and optional annotations.
2. Thin, abbreviate, rotate, or directly label essential values.
3. Change orientation or facet layout without changing metric semantics.
4. Aggregate only when the question remains valid.
5. Replace the chart with a focused summary or accessible table when the comparison no longer fits.

Keep domains, thresholds, units, and category-color assignments stable when readers compare the same chart across sizes.

#### Distinguish surface bounds from plot bounds

The responsive builder receives full surface `width` and `height`. Axes, legends, and measured text later determine `scene.chart`, the final inner plot. Use:

- responsive builder context for surface breakpoints and representation choice;
- custom-mark render bounds for plot-space geometry;
- `host.getScene().chart` for application overlays after render.

Do not duplicate margin math in application code.

#### Treat topology as responsive state

Waffle packing, treemaps, Sankey columns, facets, Delaunay links, hexbins, density contours, and label fit can change membership or arrangement when final bounds change. Verify semantic keys and interaction state after topology changes, not only node dimensions.

#### Use deterministic initial geometry

Supply the same `initialWidth` for equivalent server renders. The client adopts the measured container width after hydration. Use fixed `width` only for exports, benchmarks, or another application-owned frame.

### Common Mistakes

#### CRITICAL Adapting to viewport width

Wrong:

```ts
const compact = window.innerWidth < 640
```

Correct:

```ts
defineChart(({ width }) => ({
  marks,
  scales: {
    x: {
      scale: scaleLinear,
      axis: { ticks: { count: width < 420 ? 4 : 8 } },
    },
    y: { scale: scaleLinear },
  },
}))
```

Dashboard panels and embeds can be narrow inside a wide viewport.

Source: `docs/guides/responsive-charts.md`

#### CRITICAL Using surface width as plot width

Wrong: compute bins, collisions, or overlay positions directly from responsive builder width.

Correct: perform exact pixel work from resolved custom-mark bounds or `scene.chart`.

Guides and legends reduce the final plot after the builder returns.

Source: `API-FRICTION.md` F-116, F-219; `docs/guides/responsive-charts.md`

#### HIGH Assuming resize only stretches geometry

Wrong: preserve old treemap, facet, waffle, Delaunay, hexbin, or label topology and scale its pixels.

Correct: let the owning resolved-layout primitive recompute from final bounds and preserve semantic keys through the change.

Many final-pixel layouts change topology, not only size.

Source: waffle, treemap, Delaunay, and hexbin mark references

#### HIGH Using fixed width for application charts

Wrong:

```ts
mountChart(element, { definition, width: 640, height: 320, ariaLabel })
```

Correct:

```ts
mountChart(element, {
  definition,
  height: 320,
  initialWidth: 640,
  ariaLabel,
})
```

Fixed width opts out of container measurement; missing `initialWidth` or shrink constraints causes different SSR or overflow failures.

Source: `docs/guides/responsive-charts.md`; `API-FRICTION.md` F-111

#### CRITICAL Assigning positional pixel ranges

Wrong:

```ts
x: {
  scale: scaleLinear().range([0, 640])
}
```

Correct:

```ts
x: {
  scale: scaleLinear
}
```

The range must follow the final plot after container measurement and guide margins resolve.

Source: `API-FRICTION.md` F-002; `docs/concepts/scales-and-d3.md`

#### HIGH Treating containment as collision avoidance

Wrong: expect automatic margins to make every long tick label readable.

Correct: choose responsive candidate spacing, thinning, rotation, abbreviation, or a different composition.

Margins contain guides inside the surface; they do not resolve every label-label collision.

Source: `API-FRICTION.md` F-023, F-160; `docs/guides/responsive-charts.md`

#### HIGH Tension: responsive adaptation versus comparison stability

Reduce guide density and change composition without silently changing what position, color, or a threshold means.

See also: `./other-guides.md#source-tanstack-charts-configure-scales-guides-color` § Common Mistakes

#### HIGH Tension: motion continuity versus current-state correctness

Responsive relayout should commit immediately by default. Animating every observed resize can leave geometry behind the actual panel size and repeatedly interrupt transitions.

See also: `./other-guides.md#source-tanstack-charts-update-and-animate-charts` and `./other-guides.md#source-tanstack-charts-debug-and-verify-charts`

See also: `./other-guides.md#source-tanstack-charts-ship-accessible-charts` and `./other-guides.md#source-tanstack-charts-update-and-animate-charts` — initial size, label priority, and resize policy affect hydration, accessibility, and motion.

<a id="source-tanstack-charts-extend-tanstack-charts"></a>

## Extend Tanstack Charts

Source: `tanstack-charts-extend-tanstack-charts`.

## Extend TanStack Charts

Use **trigger → inspect → decide → build → verify**. Extend the narrowest ownership boundary after proving built-in marks, first-party layouts, transforms, facets, views, and controlled behaviors cannot express the required semantics.

### Setup

Create a renderer-neutral mark with declared scale values and deterministic scene keys:

```ts
import { createMark, defineChart } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'

interface ThresholdDatum {
  id: string
  value: number
}

const threshold = createMark<ThresholdDatum, never, number>(({ markIndex }) => {
  const datum: ThresholdDatum = { id: 'target', value: 75 }

  return {
    id: `threshold-${markIndex}`,
    channels: { y: { scale: 'y', values: [datum.value] } },
    render({ chart, scales, theme }) {
      const y = scales.y.map(datum.value)
      return {
        nodes: [
          {
            kind: 'rule',
            key: datum.id,
            x1: chart.x,
            x2: chart.x + chart.width,
            y1: y,
            y2: y,
            style: { stroke: theme.foreground, strokeOpacity: 0.55 },
          },
        ],
      }
    },
  }
})

export const chart = defineChart({
  marks: [threshold],
  scales: {
    x: null,
    y: { scale: scaleLinear },
  },
})
```

This mark is decorative, so it emits no fake interaction point.

### Core Patterns

#### Escalate through extension boundaries

1. Built-in or first-party composite mark.
2. Several built-in marks.
3. Facet or named view composition.
4. D3/application-prepared semantic rows.
5. `compositeMark` for a reusable group of ordinary marks.
6. `createMark` for new renderer-neutral geometry.
7. `resolveLayout` only for final-bounds topology or collision.
8. Custom control for reusable semantic behavior.
9. Custom renderer/host for a different platform surface.

Read [the extension protocol matrix](./assets/tanstack-charts-extend-tanstack-charts/references/extension-protocols.md) before choosing a boundary.

#### Materialize values before rendering

Initialization declares every semantic value that must establish x, y, or color domains. Rendering maps those values through resolved scales. Never infer a private positional domain inside `render`.

#### Emit honest interaction points

Only emit points for semantic targets. Each point keeps the original datum, stable key, semantic values, resolved coordinates, and group/color identity. Attach the same point object to the scene primitive it paints. Use focus anchors for reveal-only geometry and focus guides for data-less cursor presentation.

#### Use final-layout callbacks only for final-layout work

Use `resolveLayout` for binning, collision, packing, or topology that depends on resolved scales and inner bounds. Keep semantic row transforms eager and outside render. Keep layout callbacks synchronous, pure, and deterministic because margin solving can call them more than once.

### Common Mistakes

#### CRITICAL Reading or mutating the DOM during scene generation

Wrong: query text, append SVG, or inspect browser layout in `initialize`, `resolveLayout`, or `render`.

Correct: consume the supplied bounds, scales, theme, text layout, and scene contracts; put platform lifecycle in a renderer or host extension.

Scene compilation must remain deterministic for SSR, Canvas, native, export, and tests.

Source: `docs/guides/custom-marks-and-renderers.md`; `packages/charts-core/src/mark.ts`

#### CRITICAL Inferring a private positional domain in render

Wrong: derive a local domain and scale after chart scales have resolved.

Correct: materialize positional channel values during initialization, then map with `context.scales`.

Private domains prevent coordinated guides, layers, focus, and views.

Source: `docs/reference/custom-extensions.md`; archived custom-mark notes

#### HIGH Conflating interaction and scale values

Wrong:

```ts
createMark<Datum, PointX, PointY>(initialize)
```

Correct:

```ts
createMarkWithScaleValues<Datum, PointX, PointY, ScaleX, ScaleY>(initialize)
```

Use the exceptional factory when an interval or layout focuses one semantic value but materializes different endpoint types on its scales.

Source: `API-FRICTION.md` F-094; `docs/reference/types.md`

#### HIGH Running side effects in resolved layout

Wrong: update application state, mutate cached rows, allocate a persistent controller, or read external changing state from `resolveLayout`.

Correct: derive the returned layout solely from inputs and capture local derived rows in its render closure.

Margin and responsive solving may evaluate the callback repeatedly.

Source: hexbin and Sankey references

#### HIGH Tension: rich interaction versus portable rendering

Custom DOM behavior is easy to prototype but breaks renderer parity. Prefer renderer-neutral points, focus guides, controls, and semantic application state; isolate platform code in the host seam.

See also: `./other-guides.md#source-tanstack-charts-build-chart-interactions` and `./other-guides.md#source-tanstack-charts-ship-accessible-charts`

### References

- [Extension protocol matrix](./assets/tanstack-charts-extend-tanstack-charts/references/extension-protocols.md)

See also: `./other-guides.md#source-tanstack-charts-compose-marks-and-views` and `./other-guides.md#source-tanstack-charts-debug-and-verify-charts` — justify extensions against native composition and verify them across renderer boundaries.

<a id="source-tanstack-charts-migrate-to-tanstack-charts"></a>

## Migrate To Tanstack Charts

Source: `tanstack-charts-migrate-to-tanstack-charts`.

This skill requires `design-a-chart` and `debug-and-verify-charts`. Read them first to preserve the analytical task and define parity evidence.

## Migrate Charts to TanStack Charts

Use **trigger → inspect → decide → build → verify**. Translate semantic ownership, not component names or generated DOM. Keep the old chart available until parity evidence passes.

### Integration Setup

Inventory the current chart before changing code:

```ts
export interface MigrationInventory {
  question: string
  rowGrain: string
  metrics: readonly string[]
  transforms: readonly string[]
  layers: readonly string[]
  domains: readonly string[]
  interactions: readonly string[]
  accessibility: readonly string[]
  exports: readonly string[]
  performanceBudget: string
}

export const inventory: MigrationInventory = {
  question: 'How did weekly revenue change by product?',
  rowGrain: 'one row per product and week',
  metrics: ['revenue USD', 'orders'],
  transforms: ['weekly aggregation'],
  layers: ['line per product', 'target rule'],
  domains: ['shared weekly x', 'zero-based revenue y', 'stable product color'],
  interactions: ['grouped x tooltip', 'keyboard inspection'],
  accessibility: ['figure label', 'adjacent summary'],
  exports: ['static SVG'],
  performanceBudget: '12 charts, 2,000 visible points, responsive updates',
}
```

Record which layer currently owns every item. Do not assume the source renderer owns transforms, domains, or product state just because its API config mentions them.

### Core Integration Patterns

#### Translate through the grammar

For each source layer, map:

1. source rows and row grain;
2. eager analytical transforms;
3. mark-local layout;
4. positional, grouping, color, and interval channels;
5. semantic scale domains;
6. marks and layer order;
7. focus and controlled application state;
8. renderer, adapter, and export lifecycle.

Use the source-specific references only after this inventory.

#### Migrate one ownership boundary at a time

A safe sequence is:

1. Freeze source data preparation and capture fixtures.
2. Build a static TanStack scene from the same prepared rows.
3. Match scales, marks, labels, and empty/missing behavior.
4. Add focus and tooltip semantics.
5. Add controlled selection, brush, zoom, or application overlays.
6. Wire the target framework adapter and SSR lifecycle.
7. Compare bundle and sustained interaction/update performance.
8. Remove the source renderer only after rollback is no longer needed.

#### Prove parity by scenarios

| Surface       | Evidence                                                         |
| ------------- | ---------------------------------------------------------------- |
| Data          | fixture rows and transform outputs match                         |
| Visual        | geometry, domains, guides, labels, color, missing/negative cases |
| Interaction   | pointer and keyboard focus, grouping, pinning, controlled state  |
| Lifecycle     | mount, update, resize, SSR/hydration, destroy                    |
| Accessibility | meaningful name, equivalent values/actions, summary/table        |
| Export        | SVG/Canvas/static output and fonts/resources                     |
| Packaging     | packed consumer imports and retained optional modules            |
| Performance   | target dashboard shape under sustained pointer/update work       |

#### Keep a comparison switch

During production migration, use the same prepared rows and accepted application state for old and new renderers. A temporary feature flag or development harness should switch rendering ownership without changing analytics.

### Common Mistakes

#### CRITICAL Translating component names one for one

Wrong: find the TanStack component with the closest source-library name.

Correct: map data, transform, scale, geometry, interaction, and lifecycle ownership independently.

Source components combine responsibilities differently, so name matching preserves syntax instead of behavior.

Source: `docs/guides/migrating.md`

#### CRITICAL Replacing transforms and renderer together

Wrong: rewrite grouping, stacking, forecasting, and rendering in one change.

Correct: freeze and test analytical rows first; migrate renderer ownership against those fixtures; move transforms later only with separate evidence.

Changing both makes visual drift impossible to classify.

Source: `docs/guides/migrating.md`; archived TanStack Stats migration notes

#### CRITICAL Calling screenshot similarity complete parity

Wrong: approve after one viewport screenshot resembles the source.

Correct: test the scenario matrix for focus, keyboard, updates, pinning, export, packages, and performance.

A final image does not prove behavior or lifecycle ownership.

Source: `API-FRICTION.md` F-036, F-073, F-081; `docs/guides/migrating.md`

#### HIGH Reimplementing source internals blindly

Wrong: port D3 selections, plugin lifecycle, source scale math, and every private helper into custom marks.

Correct: keep proven application/D3/SQL preparation at first, express supported semantics through TanStack primitives, and extend only a verified gap.

Blind ports preserve accidental architecture and bypass renderer-neutral ownership.

Source: `docs/guides/migrating.md`; `API-FRICTION.md` F-127

### References

- [Observable Plot](./assets/tanstack-charts-migrate-to-tanstack-charts/references/observable-plot.md)
- [Recharts](./assets/tanstack-charts-migrate-to-tanstack-charts/references/recharts.md)
- [Chart.js](./assets/tanstack-charts-migrate-to-tanstack-charts/references/chart-js.md)
- [ECharts](./assets/tanstack-charts-migrate-to-tanstack-charts/references/echarts.md)
- [Direct D3](./assets/tanstack-charts-migrate-to-tanstack-charts/references/d3.md)

See also: `./other-guides.md#source-tanstack-charts-design-a-chart` and `./other-guides.md#source-tanstack-charts-debug-and-verify-charts` — restate the analytical task and prove parity beyond screenshots.

<a id="source-tanstack-charts-prepare-chart-data"></a>

## Prepare Chart Data

Source: `tanstack-charts-prepare-chart-data`.

## Prepare Chart Data

Use **trigger → inspect → decide → build → verify**. Keep analytical preparation outside responsive layout and preserve the row lineage needed by tooltips, selection, tables, and drill-down.

### Setup

Prepare semantic rows once, then pass them to marks:

```ts
import { groupBy, lineY, rollingWindow } from '@tanstack/charts'

interface Order {
  day: string
  region: string
  amount: number
}

export function prepareRevenue(orders: readonly Order[]) {
  const daily = groupBy(orders, {
    by: { region: 'region', day: 'day' },
    outputs: {
      revenue: { value: 'amount', reduce: 'sum' },
      orders: { reduce: 'count' },
    },
  })

  return rollingWindow(daily, {
    by: 'region',
    orderBy: 'day',
    size: 7,
    partial: false,
    outputs: { revenue7d: { value: 'revenue', reduce: 'sum' } },
  })
}

const prepared = prepareRevenue([
  { day: '2026-08-01', region: 'West', amount: 120 },
  { day: '2026-08-02', region: 'West', amount: 160 },
])

export const revenueMark = lineY(prepared, {
  x: 'day',
  y: 'revenue7d',
  z: 'region',
})
```

### Core Patterns

#### Choose the owner by scope

| Work                                     | Owner                                      |
| ---------------------------------------- | ------------------------------------------ |
| Calculation from one row                 | channel accessor                           |
| Reusable cross-row result                | eager data transform                       |
| Geometry meaningful only inside one mark | `layout: stack()` or `layout: group()`     |
| Product-specific enrichment or filtering | ordinary application function              |
| Pixel-space work after margins resolve   | resolved-layout mark, not a data transform |

#### Compose structural and analytical transforms

```ts
import { normalize, select } from '@tanstack/charts'
import { fold } from '@tanstack/charts/transform/fold'

const services = [
  { service: 'api', latency: 180, throughput: 820 },
  { service: 'worker', latency: 240, throughput: 510 },
]

const folded = fold(services, {
  fields: ['latency', 'throughput'] as const,
  as: { key: 'metric', value: 'measurement' },
})

const normalized = normalize(folded, {
  by: 'metric',
  value: 'measurement',
  basis: 'extent',
  as: 'relativeMeasurement',
})

export const baselines = select(normalized, {
  by: 'metric',
  select: 'first',
})
```

Each stage should have one semantic responsibility and a named output.

#### Order path data before mark construction

```ts
import { lineY } from '@tanstack/charts'

const rows = [
  { date: new Date('2026-08-03'), value: 14 },
  { date: new Date('2026-08-01'), value: 10 },
  { date: new Date('2026-08-02'), value: 12 },
]

const ordered = [...rows].sort((left, right) => +left.date - +right.date)

export const trend = lineY(ordered, { x: 'date', y: 'value' })
```

Scale domains do not reorder line or area topology.

#### Preserve direct lineage

TanStack transforms record their immediate input in `source`. If application code creates additional derived rows, preserve equivalent references when focus, drill-down, or audit must reach the original observations.

Read [the transform decision table](./assets/tanstack-charts-prepare-chart-data/references/transforms.md) before combining transform families.

### Common Mistakes

#### CRITICAL Sorting after creating the mark

Wrong:

```ts
const mark = lineY(rows, { x: 'date', y: 'value' })
rows.sort((left, right) => +left.date - +right.date)
```

Correct:

```ts
const ordered = [...rows].sort((left, right) => +left.date - +right.date)
const mark = lineY(ordered, { x: 'date', y: 'value' })
```

Line and area marks capture input order as path order.

Source: `docs/reference/marks/line-and-area.md`

#### HIGH Running eager transforms in responsive builders

Wrong:

```ts
defineChart(({ width }) => ({
  marks: [lineY(rollingWindow(rows, options), channels)],
}))
```

Correct:

```ts
const prepared = rollingWindow(rows, options)
defineChart(({ width }) => ({ marks: [lineY(prepared, channels)] }))
```

Responsive builders may rerun for size and layout changes while source rows remain unchanged.

Source: `docs/guides/transforms-and-reactivity.md`; `API-FRICTION.md` F-128

#### HIGH Manually accumulating ordinary stacks

Wrong: maintain application running totals for each x value and series.

Correct:

```ts
barY(rows, {
  x: 'quarter',
  y: 'revenue',
  z: 'product',
  layout: stack(),
})
```

Native stack layout owns missing series, negative values, order, and updates. Fixed in the current API, but agents trained on early examples may still generate manual accumulation.

Source: GitHub issue 9; `API-FRICTION.md` F-163

#### HIGH Flattening derived rows without lineage

Wrong: replace aggregated rows with unlabeled numeric tuples.

Correct: keep named outputs, grouping fields, and direct source references through each application-owned step.

Tooltips, selection, and drill-down otherwise lose the records that contributed to the value.

Source: `docs/reference/transforms.md`; `docs/guides/transforms-and-reactivity.md`

#### HIGH Tension: analytical honesty versus visual simplicity

Aggregation and normalization reduce visual noise but can hide denominators, sample sizes, uncertainty, and missing-value policy. Prepare the evidence required by `design-a-chart` before reducing row detail.

See also: `./other-guides.md#source-tanstack-charts-design-a-chart` § Common Mistakes

### References

- [Transform selection and output contracts](./assets/tanstack-charts-prepare-chart-data/references/transforms.md)

See also: `./other-guides.md#source-tanstack-charts-configure-scales-guides-color`, `./other-guides.md#source-tanstack-charts-build-chart-interactions`, and `./other-guides.md#source-tanstack-charts-coordinate-charts-with-tanstack` — derived values determine domains, legends, tooltip content, available lineage, and shared chart-grid projections.

<a id="source-tanstack-charts-ship-accessible-charts"></a>

## Ship Accessible Charts

Source: `tanstack-charts-ship-accessible-charts`.

## Ship Accessible Charts

Run **trigger → inspect → decide → build → verify** before release. A chart is shipped only when its semantic alternative, adapter lifecycle, SSR policy, renderer, exports, package boundaries, and teardown are proven in a consumer-shaped scenario.

### Accessibility Checks

#### Check: the name identifies the comparison

Expected:

```ts
const hostOptions = {
  definition,
  height: 320,
  initialWidth: 640,
  ariaLabel: 'Weekly downloads for Core and React packages',
  ariaDescription: 'Values are seven-day totals. Missing weeks appear as gaps.',
}
```

Fail condition: the label says only “chart”, repeats a visible heading without the metric, or omits the comparison and period.

Fix: name the metric, compared entities, and time scope; put conclusions and detailed values in normal application content.

#### Check: critical values have an equivalent representation

Expected: a visible heading and units, plus an adjacent summary or semantic table when precise values or application decisions depend on the chart.

Fail condition: the only way to retrieve an essential value is pointer hover, color, motion, or visual estimation.

Fix: bind the same semantic rows or selected key to application text/table controls.

#### Check: every interaction has a non-pointer path

Expected: native point keyboard navigation, semantic buttons/inputs for free cursors and range controls, visible focus, cancel/reset paths, and meaningful committed-state text.

Fail condition: a transparent pointer overlay is the sole control surface.

Fix: use first-party controls where their keyboard contract fits and application-owned semantic controls otherwise.

### Lifecycle Checks

#### Check: SSR uses a supported adapter and deterministic inputs

Expected:

```ts
import {
  createChartRuntime,
  defineChart,
  lineY,
  renderChartSvg,
} from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleUtc } from 'd3-scale'

interface TrafficRow {
  date: Date
  visits: number
}

const rows: readonly TrafficRow[] = [
  { date: new Date('2026-08-10T00:00:00Z'), visits: 820 },
  { date: new Date('2026-08-11T00:00:00Z'), visits: 910 },
]

const definition = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'visits' })],
  scales: {
    x: { scale: scaleUtc },
    y: { scale: scaleLinear },
  },
})

const runtime = createChartRuntime<TrafficRow, Date, number>()
const scene = runtime.render(definition, { width: 720, height: 400 })

export const svg = renderChartSvg(scene, {
  ariaLabel: 'Daily traffic',
  idPrefix: 'daily-traffic',
})

runtime.destroy()
```

Fail condition: definition construction reads browser layout, random values, local time, or unresolved async data; or the selected adapter does not promise SSR.

Fix: resolve data before render, use deterministic formatting and dimensions, and follow the selected adapter reference.

#### Check: mount, update, and cleanup stay adapter-owned

Expected: one runtime per mounted adapter instance, complete immutable option updates, stable definitions until captured values change, and cleanup on unmount/disconnect.

Fail condition: application code calls DOM measurement or mounts a browser host during server render, or retains observers/listeners after removal.

Fix: use the adapter lifecycle or `mountChart` only in a browser-owned mount phase and call `destroy()` at teardown.

### Renderer and Export Checks

#### Check: renderer choice matches the task

- SVG: visible server geometry, vector export, DOM styling, ordinary interactive charts.
- Canvas: high scene counts or raster-first output; server emits an accessible shell, not pixels.
- Static SVG: deterministic server/export artifact without browser interaction.
- React Native SVG: explicit native target with device-level validation.

#### Check: export is reproducible

Expected: explicit dimensions, theme/background, scoped IDs, portable fonts/assets, intentional focus inclusion, and a meaningful exported name/description.

Fail condition: export depends on current responsive pixels or unreachable application CSS/resources.

Fix: render an explicit scene or serialize/rasterize with explicit artifact policy.

### Common Mistakes

#### CRITICAL Using a generic accessible label

Wrong: `ariaLabel: 'Chart'`.

Correct: identify the metric, entities, period, and unit needed to understand the figure.

A generic label exposes a focusable graphic without useful identity.

Source: `docs/guides/accessibility.md`

#### HIGH Making the chart the only representation

Wrong: require hover or visual estimation for exact operational values.

Correct: render a summary, table, or application controls from the same semantic data/state.

The chart surface is supplemental when exact values are critical.

Source: `docs/guides/accessibility.md`; archived responsive/accessibility notes

#### CRITICAL Mounting a browser host during server rendering

Wrong: call `mountChart` or adapter DOM mount from a server lifecycle.

Correct: prerender a deterministic scene through a supported SSR adapter or `renderChartSvg`, then mount the browser host only after a real element exists.

Measurement and mutation require browser elements. Older Angular workarounds were especially prone to this boundary error.

Source: GitHub issue 56; `docs/guides/ssr-and-hydration.md`

#### HIGH Putting behavior on adapter props

Wrong:

```tsx
<Chart definition={chart} tooltip keyboard />
```

Correct:

```tsx
const interactive = defineChart(chart, { tooltip, keyboard: true })
<Chart definition={interactive} ariaLabel="Revenue by month" />
```

Focus, tooltip, keyboard, controls, cursors, and SVG animation belong to the reusable definition; adapters own surface lifecycle and framework body composition. The current definition API replaces legacy adapter behavior props.

Source: chart-behavior migration in `CHANGELOG.md`; React chart reference

#### HIGH Importing the universal barrel on native

Wrong: use `@tanstack/charts/universal` for every native chart.

Correct: use exact core mark/scale/scene and `@tanstack/charts/react-native` subpaths unless cross-platform authoring justifies the universal bundle.

Exact imports protect Metro and native declaration environments from unrelated browser and optional capability code.

Source: `API-FRICTION.md` F-154, F-171, F-173, F-256; React Native package README

#### HIGH Tension: rich interaction versus portable rendering

DOM convenience can break static SVG, Canvas, native, SSR, or keyboard equivalence. Keep semantics in definitions and application state; use platform-specific body/host extensions only at the presentation seam.

See also: `./other-guides.md#source-tanstack-charts-build-chart-interactions` and `./other-guides.md#source-tanstack-charts-extend-tanstack-charts`

### Pre-Deploy Summary

- [ ] Meaningful name and concise description.
- [ ] Visible units, time range, and source context.
- [ ] Exact-value summary/table where required.
- [ ] Pointer, keyboard, touch, and cancel/reset scenarios.
- [ ] Reduced-motion and non-color evidence.
- [ ] Supported SSR policy with deterministic initial geometry.
- [ ] Stable definition, mark, datum, and resource IDs.
- [ ] Mount, update, resize, font relayout, and destroy verified.
- [ ] Renderer and export behavior verified from a packed consumer.
- [ ] Native claims verified on target devices when applicable.

### References

- [React](./assets/tanstack-charts-ship-accessible-charts/references/react.md)
- [Preact](./assets/tanstack-charts-ship-accessible-charts/references/preact.md)
- [Vue](./assets/tanstack-charts-ship-accessible-charts/references/vue.md)
- [Solid](./assets/tanstack-charts-ship-accessible-charts/references/solid.md)
- [Svelte](./assets/tanstack-charts-ship-accessible-charts/references/svelte.md)
- [Angular](./assets/tanstack-charts-ship-accessible-charts/references/angular.md)
- [Lit](./assets/tanstack-charts-ship-accessible-charts/references/lit.md)
- [Alpine](./assets/tanstack-charts-ship-accessible-charts/references/alpine.md)
- [Octane](./assets/tanstack-charts-ship-accessible-charts/references/octane.md)
- [React Native](./assets/tanstack-charts-ship-accessible-charts/references/react-native.md)
- [Renderers and export](./assets/tanstack-charts-ship-accessible-charts/references/renderers-and-export.md)

See also: `./other-guides.md#source-tanstack-charts-debug-and-verify-charts` — SSR, accessibility, renderer, and package claims need consumer-level evidence.

<a id="source-tanstack-charts-update-and-animate-charts"></a>

## Update And Animate Charts

Source: `tanstack-charts-update-and-animate-charts`.

## Update and Animate Charts

Use **trigger → inspect → decide → build → verify**. Definition identity is the application update boundary; mark and datum identities determine what survives it.

### Setup

Create a new definition only when captured data or visual policy changes, then update the host with that definition:

```ts
import { barX, defineChart, mountChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

interface Row {
  id: string
  label: string
  value: number
}

function createRanking(rows: readonly Row[]) {
  const ranked = [...rows].sort((left, right) => right.value - left.value)

  return defineChart({
    svgAnimation: { duration: 280, easing: 'ease-out' },
    marks: [barX(ranked, { id: 'ranking', x: 'value', y: 'label', key: 'id' })],
    scales: {
      x: { scale: scaleLinear, nice: true },
      y: { scale: () => scaleBand<string>().padding(0.1) },
    },
  })
}

const element = document.querySelector<HTMLElement>('#ranking')
if (!element) throw new Error('Missing #ranking')

const firstRows: readonly Row[] = [
  { id: 'core', label: 'Core', value: 82 },
  { id: 'react', label: 'React', value: 74 },
]

const options = {
  definition: createRanking(firstRows),
  height: 280,
  ariaLabel: 'Package ranking',
}

export const host = mountChart(element, options)

export function updateRanking(rows: readonly Row[]) {
  host.update({ ...options, definition: createRanking(rows) })
}
```

Framework adapters use their native memoization primitive around the complete definition.

### Core Patterns

#### Stabilize three identities

1. **Definition identity** — stable until captured values change.
2. **Mark `id`** — stable across conditional layers and reorder.
3. **Datum `key`** — stable entity identity, independent of row position or mutable metrics.

Verify that focus, selection, tooltip pinning, and exit motion follow the semantic entity after reorder.

#### Choose the smallest motion contract

- `svgAnimation: true` for lightweight keyed SVG tweening.
- `svgAnimation` options for duration, easing, and reduced-motion policy.
- `motion()` renderer only when spring continuity, a timing cascade, or rolling path behavior is part of the product contract.
- No animation for static export, server output, or changes where transition would imply false continuity.

Resize animation defaults off. Keep it off for ordinary observed containers.

#### Bound streaming work

Keep source history outside the chart, pass a bounded visible window, preserve keys for retained samples, keep viewport state controlled, and coalesce upstream updates when only the latest state matters.

#### Verify interruption, not only endpoints

Apply an update during enter, update, exit, focus motion, resize, and rolling movement. The latest accepted definition must win; focused or selected semantic identity must not jump to another row.

### Common Mistakes

#### CRITICAL Creating a fresh definition every render

Wrong: call the definition factory during every unrelated application render.

Correct: keep the definition stable until a captured row or visual-policy value changes; use the framework's native memoization primitive or update it deliberately in a vanilla owner.

Unnecessary identity changes invalidate work and can reset presentation state.

Source: definition-identity migration in `CHANGELOG.md`; `docs/guides/dynamic-data-and-animation.md`

#### CRITICAL Keying entities by row position

Wrong:

```ts
barX(rows, { x: 'value', y: 'name', key: (_row, index) => index })
```

Correct:

```ts
barX(rows, { x: 'value', y: 'name', key: 'id' })
```

Insertion, deletion, and reorder retarget geometry, focus, and exit motion when index is identity.

Source: `API-FRICTION.md` F-131, F-239; `docs/guides/dynamic-data-and-animation.md`

#### HIGH Animating every responsive resize

Wrong:

```ts
svgAnimation: {
  resize: true
}
```

Correct:

```ts
svgAnimation: true
```

Container observation can repeatedly restart transitions and leave layout behind the actual panel.

Source: `API-FRICTION.md` F-129; `docs/guides/responsive-charts.md`

#### HIGH Morphing rolling samples by index

Wrong: key a shifting time window by array index.

Correct: key each observation by stable timestamp or event ID and let removed/added samples exit and enter at the window edges.

Index identity turns old times into different samples instead of preserving retained observations.

Source: `API-FRICTION.md` F-240; `docs/guides/dynamic-data-and-animation.md`

#### HIGH Tension: motion continuity versus current-state correctness

Visual continuity cannot make stale state acceptable. Verify rapid retargeting, interrupted exits, active focus, and resize while motion is in flight.

See also: `./other-guides.md#source-tanstack-charts-design-responsive-charts` and `./other-guides.md#source-tanstack-charts-debug-and-verify-charts`

See also: `./other-guides.md#source-tanstack-charts-build-chart-interactions` and `./other-guides.md#source-tanstack-charts-coordinate-charts-with-tanstack` — stable mark and datum identity preserves controlled interaction across local, synchronized, and optimistic updates.

<a id="source-charts-docs-stability-md"></a>

## Stability

Source: `charts:docs/stability.md`.

TanStack Charts is in Alpha. Packages use regular `0.x` versions on the normal
`latest` npm tag, without an `-alpha` suffix or separate release channel.

Alpha is ready for evaluation and early application integration. It is not a
stable API promise. Pin an exact version in production applications and test an
upgrade before changing that pin.

### Version contract

All public TanStack Charts packages move together as one fixed release group.

- Patch releases fix defects and do not intentionally remove or rename public
  APIs. A fix may correct rendering or interaction that was observably wrong.
- Minor releases may add features and may contain breaking API changes while
  the package major remains `0`.
- The project will publish a stable-release compatibility policy before `1.0`.

### Public surface

The public surface is the package export map and the APIs documented on this
site. Source files, internal modules, unexported types, generated scene details,
and undocumented behavior may change without a migration path.

Framework adapters share the same chart definition and release version. Their
runtime support and peer ranges are listed in
[Installation](./getting-started.md#source-charts-docs-installation-md).

### Breaking changes

A breaking Alpha release must include a changeset, changelog entry, and concrete
migration instructions. We will use a development warning ahead of removal when
that warning is practical and useful, but Alpha does not promise a minimum
deprecation window.

Production bundles do not retain development migration warnings. Removed APIs
fail through TypeScript or an actionable runtime error instead of silently
falling back to an older interpretation.

### Report a regression

[Open a GitHub issue](https://github.com/TanStack/charts/issues/new/choose) with
the exact package version, framework, browser or native runtime, a minimal
reproduction, and the expected and actual result. A regression in a patch
release is treated as a defect against this policy.
