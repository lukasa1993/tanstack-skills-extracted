# Advanced visualization patterns

Facets, interaction, maps, networks, polar charts, themes, and motion.

<a id="source-charts-docs-examples-facets-and-multiple-views-md"></a>

## Facets And Multiple Views

Source: `charts:docs/examples/facets-and-multiple-views.md`.

Facets repeat one encoding across groups. Multiple-view compositions place
different but related encodings together. Both reduce the amount of data one
plot must carry, but they answer different questions.

Use facets when every panel has the same role. Use distinct linked views when
one panel provides context, a marginal distribution, controls, or detail for
another.

### Choose the layout

| Reader question                                                  | Start with                                 |
| ---------------------------------------------------------------- | ------------------------------------------ |
| How does the same distribution differ across cohorts?            | Shared-scale facets                        |
| How does a bivariate relationship relate to each marginal shape? | Scatterplot with marginal histograms       |
| Which portion of a long time domain should the detail view show? | Focus-plus-context views                   |
| Must every group use a different scale or mark composition?      | Independent named chart views              |
| Should selecting one view filter or highlight another?           | Linked views with shared application state |

[Faceting and Composition](./composition.md#source-charts-docs-guides-faceting-and-composition-md) owns the
implementation boundary. This page helps choose a layout and verify its
comparison semantics.

### Repeat one encoding by group

Faceted distributions give each cohort its own panel while preserving a common
binning and positional scale. The reader can compare both local shape and
absolute position without decoding overlapping fills.

<!-- ::chart-example id=51-faceted-distributions height=480 -->

Use shared domains when position should be directly comparable. Independent
domains can make local variation easier to see, but they can also exaggerate
small differences. If independent scales are intentional, give panels their
own guides and state the policy.

Keep the denominator visible by grouping both transforms:

```ts
const bins = normalize(
  binX(rows, {
    value: 'body_mass_g',
    by: 'species',
    thresholds,
    outputs: { count: { reduce: 'count' } },
  }),
  {
    value: 'count',
    by: 'species',
    basis: 'sum',
    as: 'proportion',
  },
)
```

`binX` owns aggregate lineage and `normalize` divides each species by its own
count. Omit the second `by` only when the global population is the intended
denominator.

### Add marginal context

A scatterplot with marginal histograms combines three roles:

- The central plot shows the joint relationship.
- The top histogram shows the x distribution.
- The side histogram shows the y distribution.

<!-- ::chart-example id=57-scatter-marginal-histograms height=480 -->

All regions can derive from the same raw observations, but they do not share
the same marks or plot rectangle. This example uses public `binX` and `binY`
transforms inside three ordinary chart definitions. Place them with
`composeViews` and `grid`, then use `shareX` and `shareY` to match the
scatterplot's resolved scales and plot ranges. `viewGrid` is concise syntax for
the same non-overlapping layout.

Use separate chart hosts when each view needs independent interaction or an
independent accessible label. See
[View Composition](./rendering-composition-reference.md#source-charts-docs-reference-view-composition-md) for the single-figure
layout contract.

### Overlay a summary

An inset can use a different coordinate system from the chart behind it. This
places a donut summary over a Cartesian detail chart without teaching either
child about the other:

```ts
import { composeViews, fill, inset, layer } from '@tanstack/charts/view'

const definition = composeViews({
  views: {
    detail: detailDefinition,
    summary: donutDefinition,
  },
  layout: layer(
    fill('detail'),
    inset('summary', {
      relativeTo: 'detail',
      anchor: 'top-right',
      width: 160,
      height: 160,
      offset: 12,
    }),
  ),
})
```

The inset is anchored to the complete detail frame. It is clipped to its own
frame and shrinks proportionally when the host is too small. Because the child
scenes share one outer interaction model, empty inset space and the donut hole
leave detail geometry behind them eligible for focus.

### Pair detail with context

A focus-plus-context layout uses a compact overview to control the explicit
domain of a larger detail chart. The selection is semantic application state,
not a rectangle stored inside one renderer.

<!-- ::chart-example id=83-focus-context-window height=480 -->

The overview should retain the complete domain. The detail should receive the
selected start and end as its configured scale domain. Pointer, touch, and
keyboard controls should update the same semantic values, and those values
should survive data revisions and resizes.

See [Interactions and Selections](./interaction-accessibility.md#source-charts-docs-guides-interactions-and-selections-md) for
controlled brushes, zoom, and linked state.

### Coordinate views by values, not pixels

Shared selection, cursor, category, or domain state belongs in the application:

1. A view emits a semantic value through focus, selection, or a controlled
   gesture.
2. Application state validates and stores that value.
3. Each view derives its own definition and configured scales.
4. Each chart compiles a new scene through its normal update path.

Do not query one SVG for a pixel and apply that pixel directly to another view.
Different margins, widths, orientations, and scales can represent the same
semantic value at different coordinates.

For focus-driven cursors, `createChartCursor` provides that application-owned
state without an overlay or callback relay:

```ts
import { createChartCursor, cursorHost } from '@tanstack/charts/cursor'

const sharedDate = createChartCursor<Date, number>()
const cursor = {
  use: cursorHost,
  controller: sharedDate,
  mode: 'focus' as const,
  match: 'x' as const,
  pin: true,
}

const current = defineChart(currentSpec, { cursor })
const previous = defineChart(previousSpec, { cursor })
```

Pointer, responder, keyboard, or accessibility focus in either browser or
React Native chart stores the semantic date. Every subscriber maps that date
through its own x scale, resolves its local focus group, and paints its own
`crosshair({ y: false })`. Widths, margins, and y domains can differ. A pinned
cursor remains shared until another activation, an escape action, or a
programmatic clear dismisses it.

Use `anchor: 'value'` when setting a controller programmatically for semantic
sync. Normalized or scene anchors intentionally share relative or local pixel
coordinates instead.

### Production checks

- Use one repeated encoding for true facets; use named views when roles differ.
- Place every named composed view exactly once.
- Make shared versus independent domains explicit.
- Keep bin boundaries, group order, color meaning, and units comparable.
- Give each independently interactive view its own accessible label.
- Preserve selection and viewport state across data and size updates.
- Avoid duplicating a full axis on every panel when shared outer guides are
  accurate.
- Verify panel order at narrow widths in
  [Responsive Charts](./production.md#source-charts-docs-guides-responsive-charts-md).
- Provide a table or textual summary when exact cross-panel comparison matters.

For the underlying row and channel model, see
[Data and Channels](./chart-grammar.md#source-charts-docs-concepts-data-and-channels-md).

<a id="source-charts-docs-examples-interactive-charts-md"></a>

## Interactive Charts

Source: `charts:docs/examples/interactive-charts.md`.

Interaction should help the reader inspect, navigate, select, or edit semantic
data. It should not turn a chart into a second application state system.

TanStack Charts owns nearest-point focus, grouped focus, keyboard point
navigation, point selection callbacks, and native structured tooltips. The
application owns interactions that change a domain, viewport, persistent
selection, or product record.

### Choose the interaction

| Reader task                                                  | Start with                                     |
| ------------------------------------------------------------ | ---------------------------------------------- |
| Inspect one point or a same-x group                          | Native chart focus and tooltip                 |
| Follow focus with one rule or crosshair                      | Data-less `crosshair` mark                     |
| Paint existing geometry for the active datum/group           | `whenFocused` around an ordinary mark          |
| Synchronize focus or free coordinates between charts         | Shared `createChartCursor` controller          |
| Resize, recolor, or fade existing marks during focus         | Inline mark `states`                           |
| Keep rich framework detail open, including another chart     | Pinned composed tooltip body                   |
| Navigate a wide schedule without changing its semantic scale | Native horizontal scrolling                    |
| Crop and pan a continuous domain                             | Controlled zoom and viewport state             |
| Edit an interval or record                                   | Controlled direct manipulation plus form input |

[Interactions and Selections](./interaction-accessibility.md#source-charts-docs-guides-interactions-and-selections-md) defines
the controlled gesture loop. [Tooltips and Focus](./interaction-accessibility.md#source-charts-docs-guides-tooltips-and-focus-md)
defines the native inspection path.

### Compare focus marks

A focused dot can resize and restyle the existing pointer target:

```ts
dot(rows, {
  x: 'Date',
  y: 'Close',
  r: 3,
  fill: '#2563eb',
  states: [
    {
      when: { focus: 'primary' },
      style: { r: 7, stroke: 'Canvas', strokeWidth: 2 },
      transition: { type: 'tween', duration: 140, easing: 'ease-out' },
    },
  ],
})
```

<!-- ::chart-example id=34-pointer-tooltip height=480 -->

A focused band emphasizes the shared x value for every series. Its position
before the lines places it underneath them:

```ts
marks: [
  whenFocused(
    bandX(dates, {
      x: 'date',
      fill: '#64748b',
      fillOpacity: 0.14,
      inset: 3,
    }),
    { match: 'x' },
  ),
  lineY(rows, { x: 'date', y: 'unemployed', color: 'industry' }),
]
```

[Open the grouped focus example](https://tanstack.com/charts/catalog/35-grouped-tooltip/)
to inspect its live chart and complete source.

### Follow focus with a crosshair

A crosshair is one dynamic guide driven by the existing focus state. It is not
one hidden rule per datum:

```ts
marks: [
  crosshair({
    x: {
      band: {
        inset: 0,
        radius: 3,
        fill: '#64748b',
        fillOpacity: 0.16,
      },
      label: true,
    },
    y: false,
  }),
  barY(rows, { x: 'period', y: 'value', color: 'series', inset: 4 }),
  crosshair({
    x: false,
    y: { strokeDasharray: '4 4', label: true },
  }),
]
```

It follows pointer and keyboard focus, stays out of hit testing, and renders
through SVG, Canvas, motion, and chart-owned focus presentation. The first guide
uses categorical bandwidth to paint below the bars; with bar inset 4 and band
inset 0, it extends 4 pixels past each bar edge. Its x label shows the focused
period. The second guide paints the dotted y rule above the bars and labels the
focused stack endpoint. Set `maxFocusDistance` to
`Number.POSITIVE_INFINITY` only when the guides should remain snapped across
the complete plot.

[Open the stacked cursor-band example](https://tanstack.com/charts/catalog/119-stacked-bar-band-cursor/)
to inspect the live chart and complete source.

For synchronized charts or a free two-dimensional cursor, create one
controller from `@tanstack/charts/cursor` and bind it through definition
`cursor`. Focus mode shares semantic x/y values and local charts map them to
their own pixels. Free mode shares controlled coordinates without selecting a
datum. The complete state and inversion examples are in
[Interactions and Selections](./interaction-accessibility.md#source-charts-docs-guides-interactions-and-selections-md).

### Pin and expand rich detail

This energy tooltip stays compact on hover or keyboard focus. Click, Enter, or
Space pins the same surface, adds solar coverage to its native rows, and
smoothly reveals the detailed consumption and generation breakdown, including
an ordinary nested chart. Hover remains chart focus only; framework detail
mounts after click or keyboard activation.

<!-- ::chart-example id=84-pinned-nested-chart-tooltip height=500 -->

The definition owns stable point identity, the pinned mark state,
`visibility: 'pinned'`, placement, portaling, Escape, and focus return. The
adapter body receives the pinned point and mounts an ordinary nested chart.
The application retains only the same-species cohort policy, close-button
presentation, and child-chart content.

The definition's `content` callback receives `pinned`, so it can keep the
transient summary short and add structured rows only after activation. The
React `renderTooltipBody` callback receives that updated `defaultBody` and the
same pinned state:

```tsx
<TooltipChart
  definition={definition}
  renderTooltipBody={({ points, defaultBody, pinned, dismiss }) => (
    <EnergyTooltip
      month={points[0].datum}
      summary={defaultBody}
      expanded={pinned}
      onClose={dismiss}
    />
  )}
/>
```

The detail wrapper stays mounted and transitions from
`grid-template-rows: 0fr` to `1fr`; its direct child uses `min-height: 0` and
`overflow: hidden`. This animates intrinsic height without measuring content.
The transient body remains inert, controls render only while pinned, and the
nested consumption chart has its own accessible label and lifecycle.

Add the `portal` extension to escape clipped ancestors and use viewport
collision handling. Wire the close button to `dismiss`; the shared host also
owns Escape, focus return, and non-modal dialog semantics.

### Scroll a wide schedule

Native horizontal scrolling is often better than zoom for resource lanes. It
preserves a stable time scale and gives the browser proven wheel, touch, and
keyboard behavior.

<!-- ::chart-example id=85-scrollable-resource-lanes height=480 -->

Keep lane labels in a fixed rail and place the timeline in the scroll region.
Preserve lane order, task keys, scroll position, and viewport-relative geometry
across data updates. Do not capture vertical page scrolling when the timeline
only needs horizontal movement.

Position the external rail from `onRender` with `scene.scales.y.map`. Do not
construct a second band scale to reproduce chart-space label centers.

Use [Layout, Axes, and Coordinates](./chart-grammar.md#source-charts-docs-concepts-layout-axes-and-coordinates-md)
to align labels and the plotted region.

### Zoom and pan a time domain

`zoomX` changes a controlled semantic window through the normal definition.
The x scale, wheel, drag, touch, keyboard, and reset control all use the same
start and end values.

<!-- ::chart-example id=90-zoomable-time-window height=480 -->

Import `zoomX` from `@tanstack/charts/interaction/zoom`, bind its `window` to a
controlled signal, and provide the full `extent` and allowed `scaleExtent`.
The behavior owns final-scale inversion, focus-gated wheel capture,
pointer-anchored zoom, pan, touch and keyboard input, cancellation, clamping,
and teardown.

Keep the accepted window, visible-row or clipping policy, y-domain policy,
status, reset control, persistence, and follow-latest behavior in application
state. Preserve the window when data values update unless product policy
explicitly follows the latest point.

### Edit an interval

An editable timeline combines direct manipulation with native semantic
controls. The chart renders the current record; application validation decides
which edit can commit.

<!-- ::chart-example id=92-editable-event-range height=500 -->

A complete editor should:

- Preserve the event's stable ID, start, and lane while its end changes.
- Clamp the end after the start.
- Support pointer cancellation and rollback.
- Offer keyboard-adjustable handles with adequate hit targets.
- Provide a native date or range input.
- Announce the current duration and validation state.
- Keep color-independent event labels visible.

Do not mutate a rectangle and treat that painted geometry as the saved record.
Update application state, validate it, and let the next definition produce the
scene.

### State and lifecycle

Application-owned interaction state should be semantic:

- Date or numeric domain
- Selected row ID
- Start and end values
- Scroll offset
- Playback index
- Pinned datum key
- Shared cursor x/y value

Pixel geometry is derived from `scene.chart` and resolved scales on each
render. This keeps state valid after responsive layout, font changes, and
server hydration.

Controllers and overlays may install pointer capture, event listeners,
observers, nested hosts, and animation frames. Tear down every resource when
the chart unmounts or ownership changes.

### Production checks

- Pointer, keyboard, and touch reach equivalent semantic outcomes.
- Focus indicators and controls remain visible and contained.
- Wheel handling does not unexpectedly trap page scrolling.
- Dragging has commit, cancel, clamp, and out-of-bounds behavior.
- Selection and viewport survive data and size updates.
- Reset behavior is explicit.
- Native chart focus is disabled only when another complete interaction owns
  the surface.
- Rich overlays and nested charts have independent accessibility and cleanup.
- Interaction state is tested as values, not only screenshots or DOM order.

Use [Testing and Debugging](./production.md#source-charts-docs-guides-testing-and-debugging-md) for behavior
scenarios and [Accessibility](./interaction-accessibility.md#source-charts-docs-guides-accessibility-md) for equivalent
input paths.

<a id="source-charts-docs-examples-maps-and-spatial-md"></a>

## Maps And Spatial

Source: `charts:docs/examples/maps-and-spatial.md`.

Spatial charts encode values in a coordinate system whose geometry already has
meaning. A geographic map uses a projection and feature boundaries. A vector
field uses position, direction, and magnitude. Neither should be treated as an
ordinary categorical chart with decorative shapes.

### Choose the spatial encoding

| Reader question                                           | Start with                              |
| --------------------------------------------------------- | --------------------------------------- |
| How does an aggregate differ across named regions?        | Choropleth                              |
| Where did individual events occur?                        | Projected point layer                   |
| How do direction and magnitude vary over a sampled plane? | Vector field                            |
| How does a path move through space?                       | Projected line with directional context |
| Must small regions be compared precisely by value?        | Sorted bars or a table beside the map   |

The application chooses the projection and spatial sampling policy. The
opt-in `@tanstack/charts/geo` entry uses `d3-geo` to turn GeoJSON into shared
scene paths and interaction points. See
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md).

### Compare regional aggregates

A choropleth joins one value to each named geographic feature and maps that
value through a color scale.

<!-- ::chart-example id=102-world-choropleth height=480 -->

<!-- ::chart-example id=108-country-choropleth height=480 -->

<!-- ::chart-example id=109-us-state-choropleth height=480 -->

The join is part of data preparation. Match features through stable IDs, report
unmatched records, and distinguish missing values from zero. Keep the color
domain and legend explicit so one filtered region cannot silently rescale the
meaning of every other fill.

Area draws attention. A large region can appear important even when its value
is ordinary. Pair the map with a sorted table or bars when precise ranking is
part of the task.

[Legends and Color](./composition.md#source-charts-docs-guides-legends-and-color-md) covers sequential,
diverging, and threshold choices.

### Prepare atlas boundaries

TanStack accepts GeoJSON and does not bundle a political boundary dataset.
Convert an application-owned TopoJSON atlas once, validate its feature count
and IDs, then keep that geometry stable while values change.

<!-- docs-example: geo-atlas-ingest typecheck -->

```ts
import { feature } from 'topojson-client'
import worldAtlas from 'world-atlas/countries-110m.json'
import type {
  GeometryCollection,
  Objects,
  Topology,
} from 'topojson-specification'

interface AtlasProperties {
  name: string
}

type WorldObjects = Objects<AtlasProperties> & {
  countries: GeometryCollection<AtlasProperties>
}

const topology = worldAtlas as unknown as Topology<WorldObjects>
const countries = feature<AtlasProperties>(topology, topology.objects.countries)
```

`world-atlas` redistributes Natural Earth boundaries; `us-atlas` provides
Census-derived state geometry. `topojson-client.feature` performs the standard
conversion to GeoJSON consumed by `geoShape`. These remain application
dependencies, so neither their data nor the converter enters ordinary
Cartesian or geo-only consumer bundles.

### Project GeoJSON responsively

Give `geoShape` a projection factory and an explicit fit target. This
self-contained example uses a small planar floor plan. The mark fits the
projection to the final plot bounds again whenever the chart resizes.

```ts group=floor-plan env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import { geoShape } from '@tanstack/charts/geo'
import { geoIdentity } from 'd3-geo'
import { floorPlan } from './data'

export default defineChart({
  marks: [
    geoShape(floorPlan.features, {
      key: (feature) => feature.properties.id,
      projection: {
        type: geoIdentity,
        fit: floorPlan,
      },
      fill: '#dbeafe',
      stroke: '#2563eb',
      strokeWidth: 1.5,
    }),
  ],
  margin: 12,
})
```

```ts group=floor-plan file=/src/data.ts collapsed
interface FloorPlanFeature {
  type: 'Feature'
  properties: { id: number; name: string }
  geometry: {
    type: 'Polygon'
    coordinates: [number, number][][]
  }
}

interface FloorPlan {
  type: 'FeatureCollection'
  features: FloorPlanFeature[]
}

export const floorPlan: FloorPlan = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 1, name: 'Studio' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [48, 0],
            [48, 28],
            [0, 28],
            [0, 0],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 2, name: 'Office' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [52, 0],
            [84, 0],
            [84, 28],
            [52, 28],
            [52, 0],
          ],
        ],
      },
    },
  ],
}
```

`geoShape` uses `geoPath` for each feature and D3 centroids for focus. The
floor plan's source `properties.id` supplies stable identity. Supply `anchor`
only when a geographic feature needs a different semantic longitude/latitude
than its spherical centroid. The complete option contract is in
[Geo Shape Mark](./marks-spatial.md#source-charts-docs-reference-marks-geo-md).

[Open the complete 121-polygon Westport House catalog example](https://tanstack.com/charts/catalog/40-geojson-map/).

### Project points by magnitude

Point and MultiPoint features use D3 `geoPath().pointRadius()`. The `r`
channel can carry pixels directly; `rScale` maps a quantitative value first.

<!-- ::chart-example id=103-bubble-map height=480 -->

### Change the projection

The same GeoJSON can use any D3 projection factory. Sphere and graticule
geometry are ordinary `geoShape` layers.

<!-- ::chart-example id=104-orthographic-globe height=480 -->

<!-- ::chart-example id=110-projection-gallery height=520 -->

### Layer routes over geography

Polygon, LineString, and Point features can share one responsive projection.

<!-- ::chart-example id=105-route-map height=480 -->

### Show direction and magnitude

A vector field places an arrow at each sampled position. Direction uses angle;
magnitude can use length, color, or both.

<!-- ::chart-example id=42-vector-field height=480 -->

Choose a sampling density that remains legible at the smallest container. More
arrows can obscure the flow instead of adding evidence. When pixel length
encodes magnitude, define a bounded scale and disclose whether vectors were
normalized.

Vector channel and anchor options are listed in
[Rules, Links, Arrows, Vectors, and Ticks](./marks-composite.md#source-charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md).

### Projection and responsive layout

A projection turns geographic coordinates into planar geometry. Fit it to the
resolved plot bounds, not the viewport, and recompute when the chart container
changes. Preserve source longitude and latitude alongside projected
coordinates for tooltips and selection.

When a custom spatial shape must render beside `geoShape`:

- Keep path generation deterministic and DOM-free.
- Emit stable scene keys for each feature.
- Clip only when geometry should not extend beyond the plot.
- Emit interaction points or application overlays only where they carry honest
  semantic anchors.
- Keep projection and geo dependencies behind the spatial chart import.

See [Custom Marks and Renderers](./composition.md#source-charts-docs-guides-custom-marks-and-renderers-md) and
[Responsive Charts](./production.md#source-charts-docs-guides-responsive-charts-md).

### Color, boundaries, and missing data

- Use a sequential scale for ordered magnitude with one direction.
- Use a diverging scale only around a meaningful center.
- Use threshold colors when bins have defined policy meaning.
- Keep boundary strokes visible in light and dark themes without overpowering
  fill.
- Give missing, suppressed, and out-of-domain features distinct treatment.
- Avoid a categorical palette for high-cardinality numeric values.

A legend is required whenever fill or vector color carries quantitative
meaning.

### Accessibility and interaction

A map should not be the only route to critical regional values. Provide a table
or list with the same feature names, values, units, and current selection.

For interactive maps:

- Focus and selection should resolve stable feature IDs.
- Zoom and pan state belongs to the application.
- Reset, keyboard, and touch paths should reach equivalent extents.
- Wheel capture should not trap page scrolling unexpectedly.
- Tooltips should name the region or sample, value, and unit.

[Interactions and Selections](./interaction-accessibility.md#source-charts-docs-guides-interactions-and-selections-md) defines
the controlled gesture loop.

### Production checks

- Validate feature joins and report unmatched IDs.
- State projection, aggregation unit, date range, and denominator.
- Keep color domains comparable across views and revisions.
- Test antimeridian, empty, missing, and extremely small features where
  applicable.
- Bound projected point and vector counts.
- Verify labels and legends at narrow widths.
- Provide a non-spatial exact-value path through
  [Accessibility](./interaction-accessibility.md#source-charts-docs-guides-accessibility-md).

<a id="source-charts-docs-examples-networks-and-hierarchies-md"></a>

## Networks And Hierarchies

Source: `charts:docs/examples/networks-and-hierarchies.md`.

Network and hierarchy charts show relationships rather than values on two
independent quantitative axes. Node-link layouts can produce semantic
coordinates for ordinary marks. Area layouts such as treemaps and radial
partitions such as sunbursts, and weighted flows such as Sankey diagrams,
instead depend on final layout bounds and render through responsive composite
marks.

Use these views only when topology is the question. Dense networks quickly
become less legible than a matrix, grouped summary, or searchable table.

### Choose the topology

| Reader question                                                | Start with                             |
| -------------------------------------------------------------- | -------------------------------------- |
| What is the parent-child structure and depth?                  | Tidy hierarchy tree                    |
| Which positioned observations are spatial neighbors?           | Delaunay adjacency network             |
| Which dependency clusters emerge without fixed positions?      | Force-directed network                 |
| How does quantity split and recombine?                         | Basic Sankey                           |
| How does value move through staged subtotals?                  | Sankey flow diagram                    |
| How large are branches within a strict hierarchy?              | Treemap                                |
| How does branch value divide across hierarchy depth?           | Sunburst                               |
| Must many entities be compared by attributes, not connections? | A table, facets, or quantitative chart |

Layout, traversal, grouping, and collision handling belong to eager data
preparation unless they depend on final chart bounds. TanStack Charts provides
optional static tree and force transforms plus final-layout spatial, hierarchy,
and Sankey marks. [Scales and D3](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) documents that
boundary.

### Start with a basic Sankey

The smallest useful Sankey shows a single input splitting into two paths and
recombining into one output. Link width is the only quantitative encoding in
this example; nodes and links use the chart theme, and every node gets one
short name.

Use this version as the starting point when the structure matters more than
styling. Its four explicit links preserve a total flow of 10 through a 60/40
split.

The definition supplies semantic rows and composes ordinary marks after the
responsive layout resolves:

```ts group=basic-sankey env=charts file=/src/chart.ts entry
import { defineChart, link, rect, text } from '@tanstack/charts'
import { sankeyDiagram } from '@tanstack/charts/network/sankey'
import { links, nodes } from './data'

export default defineChart({
  marks: [
    sankeyDiagram({
      nodes,
      links,
      nodeKey: 'id',
      source: 'source',
      target: 'target',
      value: 'value',
      align: 'left',
      nodePadding: 28,
      inset: { left: 16, right: 16, top: 24, bottom: 12 },
      marks: ({ nodes: layoutNodes, links: layoutLinks }) =>
        [
          link(layoutLinks, {
            x1: 'x1',
            y1: 'y1',
            x2: 'x2',
            y2: 'y2',
            key: 'key',
            strokeWidth: (flow) => flow.width,
          }),
          rect(layoutNodes, {
            x1: 'x0',
            x2: 'x1',
            y1: 'y0',
            y2: 'y1',
            key: 'key',
            inset: 0,
          }),
          text(layoutNodes, {
            x: 'x',
            y: (node) => node.y0 - 8,
            text: (node) => node.data.label,
            key: 'key',
            fill: 'currentColor',
            fontSize: 12,
            fontWeight: 650,
          }),
        ] as const,
    }),
  ],
  guides: false,
  margin: 0,
})
```

```ts group=basic-sankey file=/src/data.ts collapsed
export const nodes = [
  { id: 'input', label: 'Input' },
  { id: 'path-a', label: 'Path A' },
  { id: 'path-b', label: 'Path B' },
  { id: 'output', label: 'Output' },
]

export const links = [
  { source: 'input', target: 'path-a', value: 6 },
  { source: 'input', target: 'path-b', value: 4 },
  { source: 'path-a', target: 'output', value: 6 },
  { source: 'path-b', target: 'output', value: 4 },
]
```

[Open the interactive basic Sankey catalog example](https://tanstack.com/charts/catalog/111-basic-sankey/).

### Customize a Sankey

A Sankey diagram makes conservation and decomposition visible at the same
time: link width carries quantity, while each node marks a meaningful subtotal
or outcome. This Apple FY22 income statement follows product and service
revenue through gross profit, operating costs, operating profit, and net
profit.

<!-- ::chart-example id=111-sankey-flow height=500 -->

`sankeyDiagram` owns the responsive flow layout, D3 mutation isolation,
endpoint resolution, proportional widths, identity, and source lineage. Its
`marks` callback keeps the income statement's authored order, compact wording,
label side, two-line values, backdrops, title, and semantic colors beside the
native `link`, `rect`, and `text` definitions. The application does not import
`d3-sankey`; the exact Charts subpath keeps it out of unrelated consumers.

Keep every intermediate subtotal balanced. Use direct labels and tone as well
as color so profit and cost paths remain identifiable. See the
[Sankey diagram reference](./marks-composite.md#source-charts-docs-reference-marks-sankey-md) for responsive layout
options and immutable node/link fields.

### Show a strict hierarchy

A tidy tree assigns one position per node and one link per parent-child
relationship. Direct labels make a small hierarchy readable without requiring
hover.

Use the exact optional transform for a static tidy tree:

```ts group=hierarchy-tree env=charts file=/src/chart.ts entry
import { defineChart, dot, link, text } from '@tanstack/charts'
import { treeLayout } from '@tanstack/charts/hierarchy/tree'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { rows } from './data'

const hierarchy = treeLayout(rows, {
  path: 'name',
  delimiter: '.',
})

export default defineChart({
  marks: [
    link(hierarchy.links, {
      x1: 'x1',
      y1: 'y1',
      x2: 'x2',
      y2: 'y2',
      key: 'id',
      stroke: '#94a3b8',
      strokeWidth: 1.5,
    }),
    dot(hierarchy.nodes, {
      x: 'x',
      y: 'y',
      key: 'id',
      fill: '#2563eb',
      r: 4,
    }),
    text(hierarchy.nodes, {
      x: 'x',
      y: 'y',
      text: 'name',
      key: 'id',
      fill: '#2563eb',
      anchor: (node) => (node.internal ? 'end' : 'start'),
      dx: (node) => (node.internal ? -7 : 7),
    }),
  ],
  x: { scale: scaleLinear },
  y: { scale: scaleLinear },
  guides: false,
  margin: { top: 24, right: 110, bottom: 24, left: 64 },
})
```

```ts group=hierarchy-tree file=/src/data.ts collapsed
export const rows = [
  { name: 'Product' },
  { name: 'Product.Analytics' },
  { name: 'Product.Analytics.Reports' },
  { name: 'Product.Analytics.Dashboards' },
  { name: 'Product.Platform' },
  { name: 'Product.Platform.API' },
  { name: 'Product.Platform.Workers' },
]
```

[Open the larger Flare hierarchy catalog example](https://tanstack.com/charts/catalog/36-hierarchy-tree/).

Use `id` and `parentId` instead of `path` for explicit parent-reference rows.
Path input may omit ancestors; the result includes those structural nodes with
`data: null` and empty source lineage. Explicit rows retain their original
record and index, and each link carries the target node's lineage.

`treeLayout` rejects duplicate IDs, invalid parents, multiple roots, and
cycles. Keep source order intentional because it controls child order when
`sort` is omitted. Collapsed branches remain application state; select the
visible rows before running the transform.

The default `left` orientation anchors the root at the left and grows toward
the right. `right`, `top`, and `bottom` use the same stable tidy layout, and
`nodeSize` controls semantic breadth and depth spacing. Normal scales own the
responsive mapping; resizing does not require a new hierarchy layout. Use
`sort` only when child order should differ from source order. Render links
first, then nodes and labels. See
[Rules, Links, Arrows, Vectors, and Ticks](./marks-composite.md#source-charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md)
and [Dot and Hexagon Marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-dot-and-hexagon-md).

### Compare hierarchy area

A treemap encodes each leaf's contribution as area while keeping leaves inside
their parent branch. Use it when branch size matters more than exact depth or
link tracing.

<!-- ::chart-example id=74-recharts-treemap height=480 -->

The exact optional mark accepts the same flat path or parent-reference input as
the tidy-tree transform, but it owns final-pixel rectangles and labels:

```ts
import { defineChart } from '@tanstack/charts'
import { treemap } from '@tanstack/charts/hierarchy/treemap'

const chart = defineChart({
  marks: [
    treemap(rows, {
      path: 'name',
      delimiter: '.',
      value: 'size',
      ratio: 4 / 3,
      round: true,
      color: (node) => node.ancestorIds.at(-1) ?? node.id,
      label: 'name',
      inset: 1,
      stroke: '#fff',
    }),
  ],
  guides: false,
  margin: 0,
})
```

No x or y scale is configured. Squarification uses the final inner aspect ratio,
so resizing may change which rectangles share an edge. Pixel padding and the
screen convention where y increases downward remain inside the mark.

The default child order is the authored hierarchy order. Use `sort` only when
sibling order is a deliberate encoding. In-cell labels are centered and hidden
when measured text plus `labelPadding` does not fit. Color, label, state, and
paint channels receive stable `TreemapNode` values with hierarchy metadata,
aggregate value, the source row, and its original index. See the
[Treemap Mark reference](./marks-composite.md#source-charts-docs-reference-marks-treemap-md).

### Partition hierarchy depth

A sunburst uses angle for aggregate branch value and radius for hierarchy
depth. It preserves more depth structure than a treemap, but arc length is
harder to compare precisely than aligned area or position.

Use the exact optional [`sunburst` mark](./marks-composite.md#source-charts-docs-reference-marks-sunburst-md) inside
`polar`. It accepts the same path or explicit parent-reference hierarchy input
as the other hierarchy entries, aggregates values, and allocates its sectors
after the final polar radius resolves. Use `branchId` for inherited branch
color and direct `SunburstNode` lineage for tooltips and state callbacks.

For a large hierarchy, keep the complete source data but show only the next
one or two levels below a controlled root.

<!-- ::chart-example id=126-drillable-sunburst height=480 -->

Set `rootId` to the selected node and `visibleDepth` to the number of descendant
rings. `onSelect` receives the same semantic node for pointer and keyboard
activation. The application owns the selected root and back control; the mark
retains aggregate values and stable node keys. With the motion renderer,
shared descendants interpolate their angles and radii while remaining centered
sectors. Newly revealed nodes unfold from their disappearing parent sector,
and drill-up reverses that relationship.

### Reveal spatial adjacency

A Delaunay network connects points that are neighbors in a triangulation. It
answers local spatial adjacency; it does not imply a business or causal
relationship unless the data model defines one.

<!-- ::chart-example id=37-delaunay-network height=480 -->

The optional [`delaunayLink` mark](./marks-spatial.md#source-charts-docs-reference-marks-delaunay-md) accepts the
source points directly. It projects both configured axes after final layout,
triangulates each `z` group in screen space, and retains both endpoint records
on every native link. Supply a stable point `key`; edge identity is derived
from the endpoint keys.

When Delaunay is used only for nearest-point lookup, keep the triangulation in
a `ChartSpatialIndexFactory` instead of painting its edges. See
[Tooltips and Focus](./interaction-accessibility.md#source-charts-docs-guides-tooltips-and-focus-md).

### Explore an unconstrained character network

A force-directed layout can reveal clusters and bridges when positions are not
already meaningful. It also introduces motion, stochastic initialization, and
collision policy that can make comparison unstable.

<!-- ::chart-example id=40-force-directed-network height=480 -->

Use the exact optional transform for a settled static network:

```ts
import { defineChart, dot, link, text } from '@tanstack/charts'
import { forceLayout } from '@tanstack/charts/network/force'
import { scaleLinear } from 'd3-scale'

const graph = forceLayout(nodes, links, {
  nodeKey: 'id',
  source: 'source',
  target: 'target',
  iterations: 300,
  forces: [
    { type: 'link', distance: 42 },
    { type: 'manyBody', strength: -120 },
    { type: 'center' },
    { type: 'collide', radius: 9 },
  ],
})

const chart = defineChart({
  marks: [
    link(graph.links, {
      x1: 'x1',
      y1: 'y1',
      x2: 'x2',
      y2: 'y2',
      key: ({ source, target }) => `${source}->${target}`,
    }),
    dot(graph.nodes, { x: 'x', y: 'y', color: 'group', key: 'id' }),
    text(graph.nodes, { x: 'x', y: 'y', text: 'id', key: 'id' }),
  ],
  x: { scale: scaleLinear().domain(graph.xDomain) },
  y: { scale: scaleLinear().domain(graph.yDomain) },
})
```

`forceLayout` clones both inputs, applies the explicit forces in authored
order, runs a fixed number of synchronous ticks, resolves link endpoints, and
returns padded domains. It is chart-size independent: resizing remaps the
settled coordinates and does not require another simulation. Keep node and
link order stable when comparisons must repeat exactly, and memoize the
transform when unchanged data would otherwise rebuild it.

`forceLayout` is not a live simulation controller. If drag-to-reposition is
part of the product, run the live controller outside the chart, store its
positions in application state, and provide a keyboard-accessible alternative
or detail control. The chart scene remains a projection of that controlled
state.

### Labels, direction, and weight

- Use arrowheads only for genuinely directed edges.
- Encode link weight sparingly; wide overlapping links can hide nodes.
- Label selected or important nodes instead of every node in a dense graph.
- Use color for stable semantic groups, not whichever cluster happens to be
  near another after a simulation.
- Provide a searchable list or details panel for nodes that cannot be labeled
  directly.

Custom link paths or non-cartesian layouts may need a public custom mark. Start
with built-in links, dots, and text, then use
[Custom Marks and Renderers](./composition.md#source-charts-docs-guides-custom-marks-and-renderers-md) only for
geometry that composition cannot express.

### Production checks

- Confirm that links represent a documented relationship.
- Bound node and edge counts or aggregate the graph before rendering.
- Keep node and edge IDs stable across revisions.
- Make layout initialization and ordering deterministic when comparison
  matters.
- Test disconnected nodes, cycles, missing parents, duplicate edges, and empty
  graphs.
- Do not rely on color or pointer hover as the only identification path.
- Preserve keyboard focus and selection after layout updates.
- Measure dense cases with [Large Data](./production.md#source-charts-docs-guides-large-data-md).

<a id="source-charts-docs-examples-polar-and-radar-md"></a>

## Polar And Radar

Source: `charts:docs/examples/polar-and-radar.md`.

Polar geometry is available only from `@tanstack/charts/polar`. The container
owns responsive center, angle, and radius ranges. Its eager `pie` transform
owns value allocation; granular D3 modules still own configured scales, curve
factories, and final arc/path geometry.

```ts
import {
  angleGrid,
  pie,
  polar,
  radialArc,
  radialArea,
  radialDot,
  radialGrid,
  radialLine,
  radialRule,
  radialText,
} from '@tanstack/charts/polar'
```

The package root stays Cartesian-sized when this subpath is not imported.

### Pie and donut

Use `pie` to turn totals into flat source-linked angular intervals.
`radialArc` renders the intervals. This example uses a responsive inner radius
for a donut; return `0` instead for a pie.

```ts group=polar-pie-donut env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import { pie, polar, radialArc } from '@tanstack/charts/polar'
import { alphabet } from './data'

const slices = pie(alphabet, { value: 'frequency' })
const letters = alphabet.map((row) => row.letter)

export default defineChart({
  marks: [
    polar({
      inset: 8,
      radiusRatio: 0.82,
      marks: [
        radialArc(slices, {
          innerRadius: ({ radius }) => radius * 0.58,
          cornerRadius: 4,
          color: 'letter',
          key: 'letter',
        }),
      ],
    }),
  ],
  color: {
    domain: letters,
    range: ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f97316', '#94a3b8'],
  },
})
```

```ts group=polar-pie-donut file=/src/data.ts collapsed
export interface AlphabetRow {
  letter: string
  frequency: number
}

export const alphabet: readonly AlphabetRow[] = [
  { letter: 'E', frequency: 0.12702 },
  { letter: 'T', frequency: 0.09056 },
  { letter: 'A', frequency: 0.08167 },
  { letter: 'O', frequency: 0.07507 },
  { letter: 'I', frequency: 0.06966 },
  { letter: 'Other', frequency: 0.55602 },
]
```

The same primitives cover labels, center content, padding, rounded corners,
and concentric rings. See the catalog examples for a
[labeled pie](https://tanstack.com/charts/catalog/93-labeled-pie/),
[center-content donut](https://tanstack.com/charts/catalog/94-center-donut/),
[rounded donut](https://tanstack.com/charts/catalog/95-rounded-donut/), and
[nested donut](https://tanstack.com/charts/catalog/96-nested-donut/).

Radial offsets are signed pixels applied after scale mapping. They do not
change the radius domain or reserve outer margin; leave space with
`radiusRatio`, `inset`, or chart margins.

Source order is the default. Use `orderBy` and `order` only for an explicit
angular sort. Stable arc keys must come from the original row, not the
generated slice index.

Each allocated row keeps the original fields plus direct `source` and
`sourceIndexes` lineage. Fixed allocation fields overwrite source fields with
the same names. `gapAngle` materializes direct empty space; the returned
`padAngle: 0` prevents `radialArc` from padding that interval again.

### Partial-circle gauge

A gauge is the same composition over a restricted pie interval. It is not a
separate geometry implementation.

```ts group=polar-partial-gauge env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import { pie, polar, radialArc, radialText } from '@tanstack/charts/polar'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const value = Math.max(0, Math.min(100, 72))
const reading = { id: 'complete', value } as const
const parts = [reading, { id: 'remaining', value: 100 - value }] as const
const slices = pie(parts, {
  value: 'value',
  startAngle: -Math.PI * 0.75,
  endAngle: Math.PI * 0.75,
})

export default defineChart({
  marks: [
    polar({
      radiusRatio: 0.84,
      angle: { scale: scaleLinear().domain([0, 1]) },
      radius: { scale: scaleLinear().domain([0, 1]) },
      marks: [
        radialArc(slices, {
          innerRadius: ({ radius }) => radius * 0.72,
          cornerRadius: 999,
          color: 'id',
          key: 'id',
        }),
        radialText([reading], {
          angle: 0,
          radius: 0,
          text: (row) => `${row.value}%`,
          key: 'id',
          fill: 'currentColor',
          fontSize: 20,
          fontWeight: 700,
        }),
      ],
    }),
  ],
  color: {
    domain: ['complete', 'remaining'],
    range: ['#ef4444', '#e2e8f0'],
  },
})
```

Bound the input before layout and expose the exact value outside the arc. Arc
length is useful for a compact status summary, not fine comparison. Add ticks,
a needle, and a center label only when they carry meaning; see the
[needle gauge](https://tanstack.com/charts/catalog/98-needle-gauge/) for that
composition.

### Radar profile

Radar combines an inferred angle factory and a fixed radius instance with
polar guides and radial marks. TanStack supplies both responsive ranges. The
normalization remains visible in a separate source file because it determines
the meaning of every radius.

```ts group=polar-radar env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import {
  angleGrid,
  polar,
  radialArea,
  radialGrid,
  radialLine,
} from '@tanstack/charts/polar'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { curveLinearClosed } from 'd3-shape'
import { events } from './data'
import { profile } from './normalize'

export default defineChart({
  marks: [
    polar({
      radiusRatio: 0.72,
      angle: { scale: scalePoint<string>().domain(events), wrap: true },
      radius: { scale: scaleLinear().domain([0, 1]) },
      guides: [
        radialGrid({
          values: [0.25, 0.5, 0.75, 1],
          shape: 'polygon',
        }),
        angleGrid({ labels: true }),
      ],
      marks: [
        radialArea(profile, {
          angle: 'event',
          radius: 'relativePerformance',
          curve: curveLinearClosed,
          fill: '#7c3aed',
          fillOpacity: 0.22,
        }),
        radialLine(profile, {
          angle: 'event',
          radius: 'relativePerformance',
          curve: curveLinearClosed,
          stroke: '#8b5cf6',
          strokeWidth: 2,
        }),
      ],
    }),
  ],
})
```

```ts group=polar-radar file=/src/data.ts collapsed
export interface DecathlonRow {
  Country: string
  '100 Meters': number
  'Long Jump': number
  'High Jump': number
  '100 Meter Hurdles': number
}

export const decathlon: readonly DecathlonRow[] = [
  {
    Country: 'United States',
    '100 Meters': 10.35,
    'Long Jump': 7.96,
    'High Jump': 2.05,
    '100 Meter Hurdles': 13.61,
  },
  {
    Country: 'Great Britain',
    '100 Meters': 10.44,
    'Long Jump': 7.74,
    'High Jump': 2.11,
    '100 Meter Hurdles': 13.75,
  },
  {
    Country: 'Germany',
    '100 Meters': 10.67,
    'Long Jump': 7.62,
    'High Jump': 2.08,
    '100 Meter Hurdles': 14.02,
  },
  {
    Country: 'France',
    '100 Meters': 10.58,
    'Long Jump': 7.81,
    'High Jump': 1.99,
    '100 Meter Hurdles': 13.88,
  },
]

export const events = [
  '100 Meters',
  'Long Jump',
  'High Jump',
  '100 Meter Hurdles',
] as const

export type RadarEvent = (typeof events)[number]
```

```ts group=polar-radar file=/src/normalize.ts collapsed
import { normalize, select } from '@tanstack/charts'
import { fold } from '@tanstack/charts/transform/fold'
import { decathlon, events } from './data'
import type { RadarEvent } from './data'

const timedEvents = new Set<RadarEvent>(['100 Meters', '100 Meter Hurdles'])
const folded = fold(decathlon, {
  fields: events,
  as: { key: 'event', value: 'result' },
})
const normalized = normalize(folded, {
  by: 'event',
  value: (datum) =>
    timedEvents.has(datum.event) ? -datum.result : datum.result,
  basis: 'extent',
  as: 'relativePerformance',
})

export const profile = select(normalized, {
  by: 'event',
  select: 'first',
})
```

Use radar for a small, fixed set of compatible dimensions. Keep every domain
and direction explicit, and do not rank profiles by apparent filled area. See
the [comparative radar](https://tanstack.com/charts/catalog/99-comparative-radar/)
when multiple profiles are the point of the chart.

### Numeric polar line

Lightweight linear scales map numeric angle and radius values without changing
the mark API. Here a visible transform maps observation dates to angles while
preserving the source temperature field.

```ts group=polar-line env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import {
  angleGrid,
  polar,
  radialGrid,
  radialLine,
} from '@tanstack/charts/polar'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { dayOfYearAngle, seattle2012 } from './weather'

export default defineChart({
  marks: [
    polar({
      angle: { scale: scaleLinear().domain([0, 360]) },
      radius: { scale: scaleLinear().domain([-10, 40]) },
      guides: [
        radialGrid({ values: [0, 10, 20, 30, 40] }),
        angleGrid({ values: [0, 90, 180, 270], labels: false }),
      ],
      marks: [
        radialLine(seattle2012, {
          angle: dayOfYearAngle,
          radius: 'temp_max',
          stroke: '#0f766e',
        }),
      ],
    }),
  ],
})
```

```ts group=polar-line file=/src/weather.ts collapsed
export interface WeatherRow {
  location: string
  date: Date
  temp_max: number
}

const weather: readonly WeatherRow[] = [
  { location: 'Seattle', date: new Date('2012-01-15'), temp_max: 8.3 },
  { location: 'Seattle', date: new Date('2012-03-15'), temp_max: 12.2 },
  { location: 'Seattle', date: new Date('2012-05-15'), temp_max: 18.9 },
  { location: 'Seattle', date: new Date('2012-07-15'), temp_max: 25.6 },
  { location: 'Seattle', date: new Date('2012-09-15'), temp_max: 21.1 },
  { location: 'Seattle', date: new Date('2012-11-15'), temp_max: 11.7 },
]

export const seattle2012 = weather.filter(
  (row) => row.location === 'Seattle' && row.date.getUTCFullYear() === 2012,
)

export function dayOfYearAngle(row: WeatherRow) {
  const year = row.date.getUTCFullYear()
  const start = Date.UTC(year, 0, 1)
  const end = Date.UTC(year + 1, 0, 1)
  return ((row.date.getTime() - start) / (end - start)) * 360
}
```

The [full-year polar line](https://tanstack.com/charts/catalog/106-polar-line/)
uses the same transform with the complete weather series.

### Numeric polar scatter

The same coordinate accepts independent points. Wind direction and speed stay
as explicit transforms over source `u` and `v` measurements.

```ts group=polar-scatter env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import { angleGrid, polar, radialDot, radialGrid } from '@tanstack/charts/polar'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { latitudeBand, windDirection, windSpeed } from './wind'

export default defineChart({
  marks: [
    polar({
      angle: { scale: scaleLinear().domain([0, 360]) },
      radius: { scale: scaleLinear().domain([0, 13]) },
      guides: [
        radialGrid({ values: [3, 6, 9, 12] }),
        angleGrid({ values: [0, 90, 180, 270], labels: false }),
      ],
      marks: [
        radialDot(latitudeBand, {
          angle: windDirection,
          radius: windSpeed,
          r: 4.5,
          fill: '#e11d48',
        }),
      ],
    }),
  ],
})
```

```ts group=polar-scatter file=/src/wind.ts collapsed
export interface WindRow {
  latitude: number
  u: number
  v: number
}

const wind: readonly WindRow[] = [
  { latitude: 48.125, u: 4.2, v: 1.6 },
  { latitude: 48.125, u: 2.1, v: 5.8 },
  { latitude: 48.125, u: -3.4, v: 6.2 },
  { latitude: 48.125, u: -5.1, v: -2.3 },
  { latitude: 48.125, u: 1.8, v: -4.7 },
]

export const latitudeBand = wind.filter((row) => row.latitude === 48.125)

export function windDirection(row: WindRow) {
  return (Math.atan2(row.v, row.u) * (180 / Math.PI) + 360) % 360
}

export function windSpeed(row: WindRow) {
  return Math.hypot(row.u, row.v)
}
```

The [catalog polar scatter](https://tanstack.com/charts/catalog/107-polar-scatter/)
uses a denser sample from the same latitude band.

### Radial bars

Choose the mark by the quantitative direction. A rose extends one bar through
radius for each angle band. Concentric radial bars extend through angle for
each radius band. Band padding controls categorical occupancy.

```ts group=polar-radial-bars env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import { polar, radialBarRadius } from '@tanstack/charts/polar'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { frequencies } from './data'

const letters = frequencies.map((row) => row.letter)
const maximum = Math.max(...frequencies.map((row) => row.frequency))

export default defineChart({
  marks: [
    polar({
      radiusRatio: 0.8,
      angle: { scale: () => scaleBand<string>().padding(0.12) },
      radius: {
        scale: scaleLinear().domain([0, maximum]),
        range: [({ radius }) => radius * 0.3, ({ radius }) => radius],
      },
      marks: [
        radialBarRadius(frequencies, {
          angle: 'letter',
          radius: 'frequency',
          color: 'letter',
          key: 'letter',
        }),
      ],
    }),
  ],
  color: {
    domain: letters,
    range: ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'],
  },
})
```

```ts group=polar-radial-bars file=/src/data.ts collapsed
export interface FrequencyRow {
  letter: string
  frequency: number
}

export const frequencies: readonly FrequencyRow[] = [
  { letter: 'E', frequency: 0.12702 },
  { letter: 'T', frequency: 0.09056 },
  { letter: 'A', frequency: 0.08167 },
  { letter: 'O', frequency: 0.07507 },
  { letter: 'I', frequency: 0.06966 },
]
```

An omitted radius baseline in `radialBarRadius` starts at the physical center;
the responsive radius range controls the quantitative endpoints. Supply
`radius1` when both endpoints are semantic values. Signed radius data should
use `radius1: 0` so semantic zero maps through the scale.

Use `radialBarAngle` when values should extend around the circle instead. See
the [concentric radial-bar example](https://tanstack.com/charts/catalog/100-radial-bars/).

### Polar hierarchy

The optional `sunburst` mark accepts flat hierarchy rows and owns value
aggregation, partitioning, responsive rings, and sector geometry.

```ts group=polar-sunburst env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import { sunburst } from '@tanstack/charts/hierarchy/sunburst'
import { polar } from '@tanstack/charts/polar'
import { rows } from './data'

export default defineChart({
  marks: [
    polar({
      radiusRatio: 0.88,
      startAngle: Math.PI / 2,
      endAngle: Math.PI / 2 - Math.PI * 2,
      marks: [
        sunburst(rows, {
          path: 'name',
          delimiter: '.',
          value: 'size',
          innerRadius: ({ radius }) => radius * 0.14,
          ringPadding: 2,
          color: 'branchId',
          stroke: '#fff',
        }),
      ],
    }),
  ],
  color: { range: ['#7c3aed', '#0ea5e9', '#14b8a6'] },
})
```

```ts group=polar-sunburst file=/src/data.ts collapsed
export interface PackageRow {
  name: string
  size: number | null
}

export const rows: readonly PackageRow[] = [
  { name: 'app', size: null },
  { name: 'app.ui', size: null },
  { name: 'app.ui.button', size: 8 },
  { name: 'app.ui.dialog', size: 5 },
  { name: 'app.data', size: null },
  { name: 'app.data.cache', size: 6 },
  { name: 'app.data.client', size: 11 },
]
```

Use `nodeId` and `parentId` for explicit parent-reference rows. Responsive
`innerRadius` and `outerRadius` callbacks receive the final polar radius;
`ringPadding` remains a fixed pixel gap. Every `SunburstNode` retains its
direct row and source index, while `branchId` gives descendants the color of
their first ancestor below the root. See the
[Sunburst Mark reference](./marks-composite.md#source-charts-docs-reference-marks-sunburst-md) and the
[full Flare hierarchy](https://tanstack.com/charts/catalog/101-sunburst/).

### Coordinate and bundle boundary

`polar()` is a positionless container mark. It resolves one center and radius,
copies configured angle/radius scales, paints guide backgrounds, child marks,
then guide foreground labels, and emits ordinary scene nodes and focus points.
The outer chart therefore omits both Cartesian axes.

The polar entry uses D3 arc and radial path generators internally. Application
source can use compact angle and radius scales or upgrade either one to
`d3-scale`; curve factories and application-owned pie layout can come directly
from `d3-shape`. See
[Polar Marks](./marks-spatial.md#source-charts-docs-reference-marks-polar-md) for the complete API and
[Bundle Size and Performance](./production.md#source-charts-docs-guides-bundle-size-and-performance-md) for
the isolated consumer budgets.

`radialArc` also accepts existing D3 pie DTOs as interoperability input; native
`pie` is preferred when flat fields, transform lineage, and direct gap
semantics are wanted.

### Production checks

- Keep angle for cyclic order or part-to-whole intervals.
- Use native `pie` output rather than reimplementing angle accumulation.
- Let marks infer identity from source IDs or unique positions; supply a key
  when neither is available.
- Preserve original values for tooltips and accessible summaries.
- Keep radar dimension domains, directions, and units explicit.
- Verify labels around the full circumference at narrow widths.
- Prefer aligned bars or dots when precise comparison is the primary task.

<a id="source-charts-docs-examples-themes-and-motion-md"></a>

## Themes And Motion

Source: `charts:docs/examples/themes-and-motion.md`.

These cases use one ownership model. Definitions describe chart behavior. CSS
variables supply inherited paint. Application shells compose cards and controls.

### Cases

| Case                                                                                                    | Demonstrates                                                                                     |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [Themed interactive area card](https://tanstack.com/charts/catalog/charts/120-themed-interactive-area/) | A CSS-backed gradient, sparse guides, range controls, grouped focus, a tooltip, and keyed motion |
| [Active bar dashboard](https://tanstack.com/charts/catalog/charts/121-active-bar-dashboard/)            | Metric selectors around gradient bars, a focused band ring, a tooltip, and spring transitions    |
| [Premium KPI sparklines](https://tanstack.com/charts/catalog/charts/122-premium-kpi-sparklines/)        | Three guide-free line and area hosts inside one responsive KPI grid                              |
| [Active donut metric](https://tanstack.com/charts/catalog/charts/123-active-donut-metric/)              | Native pie allocation, a selected wedge and ring, center text, legend state, and a CSS palette   |
| [Theme palette matrix](https://tanstack.com/charts/catalog/charts/124-theme-palette-matrix/)            | One chart structure rendered through neutral, vibrant, and monochrome token sets                 |

### Ownership

| Layer         | Owns                                                                                   | Does not own                                                       |
| ------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Definition    | Rows, keys, marks, scales, guides, gradients, focus, tooltip policy, and motion timing | Card layout, HTML controls, theme switching, or renderer selection |
| CSS variables | Paint tokens, `currentColor`, tooltip chrome, and application surface colors           | Data meaning, scales, geometry, or selection                       |
| App shell     | Card layout, text, controls, selected state, theme class, and the `motion()` renderer  | Mark geometry or duplicated SVG presentation                       |

Memoize or recreate the definition when rows or semantic options change. A CSS
token change does not require a new definition.

Keep each mark key stable across updates. The motion renderer uses stable keys
for DOM identity, presentation points, and spring velocity.

### Motion boundary

A `motion` value in a definition is inert policy. Pass `motion()` as the
renderer to activate tween or spring transitions.

The default SVG renderer uses `svgAnimation`. The motion renderer ignores that
option because each host has one animation owner. Static SVG and Canvas paint
the final state.

`motion()` respects reduced motion by default. React and Octane `/core` hosts
accept an explicit renderer. Renderer-neutral DOM hosts accept one too. Other
framework adapters currently expose their default SVG surface.

Read [Dynamic Data and Animation](./composition.md#source-charts-docs-guides-dynamic-data-and-animation-md) and
the [Motion reference](./interaction-motion-reference.md#source-charts-docs-reference-motion-md) for update and timing contracts.

### Paint boundary

Use CSS variables when paint follows the application theme. Use a definition
`theme` for explicit scene defaults. Declare gradients in the definition so
SVG and Canvas use the same resource.

Use a stable `idPrefix` when several charts share a document. Keep card borders,
shadows, layout, and non-chart text in the application shell.

Read [Themes and Styling](./composition.md#source-charts-docs-guides-themes-and-styling-md) for palette,
gradient, Canvas, and tooltip behavior.

### Current limits

- Chart specs declare linear gradients, but they do not declare pattern
  resources.
- `grid` and the static axis line are visibility controls. They do not accept
  stroke width, dash, or opacity.
- Use `theme.grid` for shared guide paint. Use rule marks for styled static
  annotations and `crosshair` for styled focus guides.
- `barX` and `barY` accept one radius value for all rectangle corners. They do
  not expose endpoint-only or per-corner radii.
- The optional motion renderer targets browser SVG. Static SVG, Canvas, and
  native surfaces consume the definitions but paint the final state.
