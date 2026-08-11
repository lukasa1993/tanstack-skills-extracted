# Production and migration

Responsive layout, performance, SSR, testing, export, authoring, and migration.

<a id="source-charts-docs-guides-ai-authoring-md"></a>

## Ai Authoring

Source: `charts:docs/guides/ai-authoring.md`.

TanStack Charts uses a small grammar so an agent can reason from data and
intent instead of selecting a monolithic chart component. The safest authoring
path is explicit and repeatable.

### The authoring sequence

1. State the analytical question in one sentence.
2. Identify each field's semantic type: quantitative, temporal, ordinal, or
   identifier.
3. Choose the smallest mark composition that answers the question.
4. Choose compact scales for common positional and categorical color channels.
5. Decide which preparation belongs in application code, D3, SQL, or a server.
6. Add accessible labeling and the default focus/tooltip behavior.
7. Verify a static scene before adding animation or interaction.
8. Add custom behavior only at a documented extension boundary.

Start at [Choosing a Chart](./chart-grammar.md#source-charts-docs-guides-choosing-a-chart-md), then use the relevant
[example family](./examples-core.md#source-charts-docs-examples-index-md).

### Canonical sources

Use one documentation owner for each decision:

- grammar and channel semantics:
  [Grammar of Graphics](./chart-grammar.md#source-charts-docs-concepts-grammar-of-graphics-md);
- compact scales and D3 upgrade ownership:
  [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md);
- responsive layout:
  [Responsive Charts](./production.md#source-charts-docs-guides-responsive-charts-md);
- focus and tooltip behavior:
  [Tooltips and Focus](./interaction-accessibility.md#source-charts-docs-guides-tooltips-and-focus-md);
- large-data representation:
  [Large Data](./production.md#source-charts-docs-guides-large-data-md);
- exact signatures and options:
  [API Reference](./specifications-types.md#source-charts-docs-reference-index-md).

Do not reconstruct an API from an example when the reference owns the
signature. Do not restate D3 behavior when the D3 bridge links to its
authoritative documentation.

### Choose the smallest scale

Use this order before adding `d3-scale`:

| Semantic need                                        | First choice                      |
| ---------------------------------------------------- | --------------------------------- |
| Numeric two-stop axis                                | `@tanstack/charts/scales/linear`  |
| Categorical intervals such as bars                   | `@tanstack/charts/scales/band`    |
| Categorical positions such as dots                   | `@tanstack/charts/scales/point`   |
| Categorical colors                                   | `@tanstack/charts/scales/ordinal` |
| Time, UTC, nonlinear, piecewise, or continuous color | Granular `d3-scale` import        |

Pass the compact factory itself when the rendered channels should determine
the domain. Return a configured scale from a zero-argument factory when it
needs padding or another option before inference. Pass an instance when the
domain is application state. Never assign a positional pixel range; Charts
owns the responsive range.

Upgrade only the scale whose semantics exceed the compact subset. For example,
a continuous UTC x axis may use D3 while a numeric y axis remains compact.
Using one D3 scale does not require replacing compact band, point, linear, or
ordinal scales elsewhere in the chart.

### Prefer complete, typed examples

Generated code should include:

- every import and its exact subpath;
- the datum and captured application-value interfaces;
- scale construction;
- a complete chart definition;
- complete adapter or host usage;
- a meaningful `ariaLabel`;
- stable inferred or explicit identity;
- empty and constant-domain policies when applicable.

For a compact chart, import exact `@tanstack/charts/scales/*` entries and do not
add `d3-scale` or `@types/d3-scale`. If an advanced scale requires D3, declare
the granular runtime and matching type package as direct application
dependencies and state which missing compact capability required the upgrade.

It should not require readers to invent undeclared variables, hidden imports,
casts, or CSS needed for correctness.

### Use the public boundary

Allowed building blocks are public package exports and documented external
modules. Never import a private source file because it appears convenient in
the repository.

If the requested result cannot be expressed:

1. Try built-in mark composition.
2. Use a public custom mark.
3. Use a custom focus strategy, spatial index, or SVG renderer when that is the
   actual missing boundary.
4. Reduce any remaining gap to a small failing example and record the API
   friction.

Do not hide a missing capability behind `any`, double casts, or manual DOM
mutation.

### Validate generated work

Run, in order:

1. Type checking with no unexpected suppression.
2. A deterministic scene assertion.
3. A browser interaction test when the chart is interactive.
4. Light and dark visual checks.
5. A narrow production bundle measurement when a new capability is imported.

For compact-scale work, verify that the bundle retains the selected family but
not `d3-scale`, `d3-format`, `d3-interpolate`, or sibling compact families.

For changing charts, also test reorder, resize, empty data, replacement data,
and a burst that must settle on the latest definition.

### Request template

Use this structure when asking an agent to build a chart:

```text
Question:
Data shape and semantic field types:
Required encodings:
Interaction and selection:
Responsive container:
Accessibility summary:
Expected update behavior:
Bundle constraints:
Acceptance checks:
```

When information is missing, choose documented defaults for presentation.
Ask before inventing analytical semantics, aggregations, or selection behavior
that would change the meaning of the data.

### Skills boundary

Data exploration, chart recommendation, anomaly investigation, and iterative
analysis belong in agent skills. The runtime remains a small deterministic
rendering library.

Skills should route back to these canonical pages and official data-tool
documentation. They should add problem-solving procedures and validation, not
copy the API reference into another source of truth.

<a id="source-charts-docs-guides-bundle-size-and-performance-md"></a>

## Bundle Size And Performance

Source: `charts:docs/guides/bundle-size-and-performance.md`.

TanStack Charts is split around capability boundaries. A chart should pay for
its marks and the specific analytical or spatial primitives it imports, not a
universal chart catalog.

### Import the narrow path

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

### Add D3 by capability

Start with compact scales, then import a granular D3 module when its full
semantics fit the chart. Typical upgrade triggers are continuous time or UTC,
logarithmic and other transformed scales, piecewise or nonnumeric
interpolation, continuous color, curves, specialized transforms, and spatial
indexes.

The upgrade is per scale. A calendar x axis can use D3 while its numeric y axis
stays compact:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleUtc } from 'd3-scale'

const x = { scale: scaleUtc, nice: true }
const y = { scale: scaleLinear, nice: true }
```

Declare `d3-scale` and `@types/d3-scale` directly when application source uses
that import. A stacked area may add `d3-shape`; a large nearest-point
interaction may add a spatial index. Do not install the `d3` umbrella for one
capability.

The canonical dependency map and official references live in
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md).

### Measure the complete feature

Compare production bundles that render the same behavior:

- the same chart family and curve;
- the same number and kind of guides;
- the same tooltip and keyboard behavior;
- the same framework adapter;
- the same data preparation;
- the same export or spatial capability, when used.

Report raw, gzip, and Brotli sizes. Record the package manager lockfile,
bundler, minifier, target, and entry source. A root package tarball size or an
unminified source count is not a user bundle measurement.

The [library comparison](./getting-started.md#source-charts-docs-comparison-md) publishes the current pinned
four-chart, three-tier bundle snapshot and its limits.

The repository's bundle gates use isolated entries so adding a complex mark
cannot silently increase the smallest chart. Polar has separate arc-only, pie
allocation, radial-label, radial-bar, gauge, and scale-backed line/scatter
ceilings; sunburst has an incremental ceiling over the equivalent D3 partition
kernel; geography has its own projected-shape ceiling. The ordinary line,
representative-mark, DOM, and framework entries remain exact byte locks.

### Separate preparation, scene, and paint

Measure three layers independently:

1. Data preparation: sorting, grouping, binning, stacking, or layout.
2. Scene build: channels, scales, guides, marks, and focus points.
3. Surface paint: SVG serialization and keyed reconciliation, or Canvas draw
   calls, plus optional animation.

This separation reveals whether an expensive chart needs a better encoding, a
framework-memoized transform, fewer scene nodes, or a different renderer.

### Choose a sane representation

The fastest way to render too much data is to avoid rendering it:

- bin dense distributions;
- aggregate repeated categories;
- use an envelope or sampled line when individual points are not readable;
- restrict a time chart to a controlled visible window;
- use facets only when each panel remains interpretable;
- virtualize application chrome and lanes when only a subset is visible.

Every visible SVG node carries DOM and paint cost. Canvas removes the
per-element DOM cost, but not scene construction, draw work, interaction-point
memory, or visual overplotting. More marks are justified only when they
communicate more information.

See [Large Data](./production.md#source-charts-docs-guides-large-data-md) for representation thresholds and
interaction policies.

### Update efficiently

- Keep fixed definitions at module scope.
- Memoize captured-data definitions until their application values change.
- Reuse derived data references when source data is unchanged.
- Let marks infer identity from IDs or unique positions; supply `key` only when
  that identity is unavailable or can change.
- Memoize expensive derived data in the application.
- Bound streaming windows.
- Build a spatial index only when a measurement justifies it.
- Disable animation for high-frequency updates or reduced-motion users.

The host reconciles nodes by key and starts interrupted animation from the
currently painted geometry. Stable identity helps both correctness and
performance; it does not reduce the cost of an unnecessarily large scene.

### Performance acceptance

For each supported feature, keep a reproducible gate for:

- cold render time;
- warm update and reorder time;
- resize time;
- node count;
- interaction latency;
- retained heap after repeated mount/update/destroy;
- smallest relevant production bundle.

Compare at multiple data sizes and identify the first size where the
representation itself stops being sensible. Performance claims should name
the fixture and percentile, not imply one universal winner.

See [Testing and Debugging](./production.md#source-charts-docs-guides-testing-and-debugging-md) for correctness gates
that must accompany performance results.

<a id="source-charts-docs-guides-exporting-md"></a>

## Exporting

Source: `charts:docs/guides/exporting.md`.

TanStack Charts' built-in export helpers have three paths:

- render a `ChartScene` directly to an SVG string;
- serialize an SVG that is already mounted in a browser;
- rasterize a mounted SVG or Canvas chart.

Choose based on whether export needs computed browser styles.

### Render a scene to SVG

`renderChartSvg` is deterministic and DOM-free:

```ts
import { createChartScene, renderChartSvg } from '@tanstack/charts'

const scene = createChartScene(definition, {
  width: 960,
  height: 540,
})

const svg = renderChartSvg(scene, {
  ariaLabel: 'Quarterly revenue',
  ariaDescription: 'Revenue rose in three of four quarters.',
  idPrefix: 'quarterly-revenue',
})
```

For a responsive definition, create a runtime with its datum, x-value, and
y-value generics, then call `render(...)` with the definition and explicit
size. See [Runtime and Scene](./runtime-scales-reference.md#source-charts-docs-reference-runtime-and-scene-md)
and [SSR and Hydration](./production.md#source-charts-docs-guides-ssr-and-hydration-md).

Use explicit export dimensions. Responsive browser dimensions are a display
policy, not a reproducible file size.

### Serialize a mounted chart

The export subpath copies a mounted chart and inlines presentation properties
that depend on CSS:

```ts
import { downloadChartSvg, serializeChartSvg } from '@tanstack/charts/export'

const serialized = serializeChartSvg(chartContainer, {
  width: 1200,
  height: 675,
})

downloadChartSvg(chartContainer, 'quarterly-revenue.svg', {
  width: 1200,
  height: 675,
})
```

The target may be the chart SVG or an ancestor containing `svg.ts-chart`.
Focus decoration is omitted by default; set `includeFocus: true` when it is
part of the intended artifact. This includes authored `whenFocused` geometry,
the primary focus ring, and the currently painted crosshair or controlled
cursor guide.

### Export PNG, JPEG, or WebP

Raster export is browser-only and is isolated behind the same export subpath:

```ts
import { downloadChartImage, renderChartImage } from '@tanstack/charts/export'

const blob = await renderChartImage(chartContainer, {
  width: 1200,
  height: 675,
  scale: 2,
  background: '#ffffff',
  type: 'image/png',
})

await downloadChartImage(chartContainer, 'quarterly-revenue.png', {
  scale: 2,
  background: '#ffffff',
})
```

`scale` controls raster density, not chart layout. A 1200 × 675 chart at scale
2 produces a 2400 × 1350 canvas while retaining the 1200 × 675 visual
coordinate system.

### Export a Canvas chart

Pass the Canvas root or an ancestor containing it to the same
`renderChartImage` or `downloadChartImage` functions. Without focus, the
exporter draws the stable base bitmap at the requested dimensions and scale.
Set `includeFocus: true` to composite the live background, focus underlay,
ordinary scene, and focus overlay layers in that order. Crosshair guides use
the same underlay and overlay canvases.

Canvas focus is painted on underlay and overlay canvases so pointer movement
does not repaint the base scene. Applications that need only the raw base
bitmap may also call `toBlob()` or `toDataURL()` on
`CanvasChartSurface.canvas`; it contains the chart background and ordinary
scene but no transient focus. `backgroundCanvas`, `focusUnderCanvas`,
`sceneCanvas`, and `focusCanvas` expose the modeled live layers. Unlike
SVG serialization, Canvas export does not retain vector geometry, accessible
markup, or independently styleable nodes.

### Theme and resource policy

Export the theme intended for the artifact. A chart following application dark
mode should usually receive an explicit light theme and background for a
document or print workflow.

Gradients and clips require stable resource IDs. Supply `idPrefix` when
rendering multiple chart exports into the same document. If a custom SVG
renderer is in use, it must preserve the scene's gradients, accessibility
metadata, and scoped IDs.

### Security and portability

Chart text is escaped by the SVG renderer. Custom renderers and custom tooltip
HTML remain application-owned.

Before exporting a chart that references external images, fonts, or CSS,
decide whether the consumer can reach those resources. Self-contained SVG
needs embedded or inlined assets.

### Export checklist

- File dimensions are explicit.
- The export theme and background are intentional.
- The accessible name and description describe the exported state.
- Resource IDs are scoped.
- Fonts and external resources are portable.
- Focus decoration is included only when meaningful.
- Raster scale is chosen for the target medium.
- A Canvas export intentionally includes or excludes focus layers.

See [Rendering and Export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md) for every
function and option.

<a id="source-charts-docs-guides-large-data-md"></a>

## Large Data

Source: `charts:docs/guides/large-data.md`.

Large-data charting starts with representation, not renderer throughput.

Ask:

1. What question must the chart answer?
2. Must a reader inspect every observation?
3. How many independently useful marks fit in the available pixels?
4. Which totals, extrema, order, or identities must never be lost?
5. How frequently does the source update?

Raw output is correct only while independently rendering every observation is
both meaningful and affordable.

### Count every stage

Track four quantities:

- **source**: rows received by the application;
- **represented**: source rows accounted for by the encoding;
- **prepared**: rows or vertices passed to marks;
- **rendered**: scene nodes and path vertices, plus the selected renderer's DOM
  or draw work.

Do not describe a million-row chart as a million rendered points when the
visible result is a few thousand aggregate cells. The bounded output is a
feature, but its accounting must be honest.

### Bounded representations

| Problem                          | Representation                           | Invariant                                                  |
| -------------------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| Dense point cloud                | Fixed density grid                       | Cell counts sum to source count                            |
| High-rate ordered signal         | Pixel-width first/min/max/last envelope  | Every row belongs to one bucket and global extrema survive |
| Numeric distribution             | Fixed-boundary histogram                 | Bin counts sum to source count                             |
| High-cardinality categories      | Leading categories plus Other            | Leading and remainder totals sum to source count           |
| Large time range with a viewport | Domain-clipped or width-bounded envelope | Visible extrema and boundary continuity survive            |

Choose bucket count from the task and available resolution. A test fixture's
grid or threshold count is not a universal default.

<!-- ::chart-example id=73-many-point-scatter height=480 -->

### When raw output is still useful

- One line path can retain many ordered observations without creating one DOM
  node per row.
- A scatterplot creates an independently addressable mark for every
  observation.
- Stable keys make rolling updates reuse surviving nodes.

Identity reuse reduces allocation and replacement. It cannot make ten thousand
independent SVG elements a sensible default when those elements compete for
the same pixels.

Switch representations before the raw update cost exceeds the product's frame
budget or the output stops being readable.

### When Canvas helps

The optional Canvas renderer removes per-node SVG DOM and reconciliation cost.
It can be useful when a measured bottleneck is SVG element creation or paint.
It does not remove channel materialization, scale and guide work, scene
compilation, path construction, or `ChartPoint` creation.

A dot mark still produces one scene node and one interaction point per
observation. Default nearest-point focus still scans those points linearly.
Supply a measured `spatialIndex` when individual points are still the correct
pointer target, and use a focus strategy with a bounded `navigation` order
when every observation is not a useful keyboard stop.

Do not treat Canvas as permission to promise a million independently
interactive marks. Compare source, represented, prepared, and rendered counts;
measure compilation, paint, interaction, and memory; then aggregate, sample,
or bound the window when the representation exceeds the product budget.

### Transform ownership

Put width-independent aggregation in application code. Memoize it with the
framework's computed-state primitive when it should survive a presentation
change.

Surface-responsive transforms may use the responsive builder's full scene width.
Exact screen-space transforms need the final inner plot bounds and resolved
scales, so implement them in a custom mark's render phase or an
application-owned overlay. Keep either cost visible rather than hiding it in
an unrelated renderer.

```ts
function summarizeDensity(rows: Input['rows']) {
  return summarizeSource(rows)
}

function createDensityChart(rows: Input['rows']) {
  const summary = summarizeDensity(rows)

  return defineChart(({ width }) => {
    const thresholds = width < 480 ? 12 : width < 900 ? 24 : 40
    const bins = buildSemanticBins(summary, { thresholds })
    return densitySpec(bins)
  })
}
```

The full scene dimensions equal final plot dimensions only for a deliberately
guide-free, zero-margin chart. See
[Responsive Charts](./production.md#source-charts-docs-guides-responsive-charts-md) for the
geometry boundary.

Use the official D3 modules linked from
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) for grouping, binning, summary
statistics, spatial indexing, and shape preparation. TanStack Charts consumes
the resulting rows and intervals.

### Interaction over dense output

First decide whether the encoded mark or the original observation is the focus
target.

- Focus aggregate cells when the chart communicates density.
- Provide drill-down or a linked table when readers need original rows.
- Use a spatial index only when individual points remain the correct
  representation.
- Keep keyboard navigation bounded to useful targets instead of stepping
  through every source observation.
- Keep exact values outside hover-only UI.

An index can accelerate nearest-point lookup. It does not reduce scene size,
DOM or draw count, path construction, paint cost, or visual overplotting.

### Streaming windows

For a rolling source:

- store complete history outside the renderer when the product needs it;
- pass a bounded window or envelope;
- preserve keys for surviving observations;
- decide whether the viewport follows the newest data;
- preserve a locked viewport during offscreen updates;
- announce meaningful offscreen changes through application UI.

Measure same-key value changes, partial rolls, full replacement, resize, and a
sustained update stream. A fast mount does not prove a healthy update path.

### Performance measurement

Separate:

- deterministic source creation;
- analytical preparation;
- scene compilation;
- SVG serialization;
- DOM reconciliation;
- Canvas painting;
- pointer activation and sustained movement;
- memory after repeated updates and destroy.

Validation hashes and invariant checks belong outside timed preparation.
Report failed correctness cells as failures, not as fast results.

The repository's stress harness provides product-shaped and encoded workloads:

```bash
pnpm benchmark:stress:quick
pnpm benchmark:stress:standard
```

Use focused filters while developing, then run the canonical profile before a
release. See [Bundle Size and Performance](./production.md#source-charts-docs-guides-bundle-size-and-performance-md)
for current budgets and import boundaries.

### Large-data checklist

- The representation answers the stated question.
- Every source row is accounted for or sampling is disclosed.
- Totals, extrema, ordering, and identity invariants are executable.
- Source, represented, prepared, and rendered counts are reported separately.
- Width-dependent preparation invalidates on resize.
- Output complexity is bounded in its native units.
- Rolling data preserves surviving keys.
- Dense focus targets match the represented meaning.
- Exact values have a table, drill-down, or textual alternative.

<a id="source-charts-docs-guides-migrating-md"></a>

## Migrating

Source: `charts:docs/guides/migrating.md`.

Migration is a semantic exercise, not a component-name translation. First
describe what the existing chart means and how users operate it. Then express
that behavior with data preparation, scales, marks, and host options.

### Inventory the current contract

Record:

- input rows and derived fields;
- sorting, grouping, bins, stacks, and normalization;
- x, y, color, size, and grouping semantics;
- domain, baseline, padding, curve, and missing-value policy;
- axes, labels, legends, annotations, and margins;
- tooltip grouping and formatting;
- pointer, keyboard, selection, zoom, and playback behavior;
- responsive breakpoints and first-render size;
- animation identity and interruption behavior;
- accessible name, summary, and table;
- current bundle and performance measurements.

Screenshots alone do not capture these decisions.

### Preserve transforms

Keep proven application, server, SQL, or D3 transforms for the first migration.
Pass their output to marks directly. Rewriting analytical logic at the same
time makes it difficult to tell whether a visual difference is a renderer
regression or a changed calculation.

Move or simplify transforms only after parity is measured. The dependency
boundary is explained in [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md).

### Translate to the grammar

Map each visible layer independently:

- line or area series;
- bars, rectangles, or cells;
- dots or hexagons;
- rules, links, ticks, arrows, or vectors;
- text and frame annotations;
- facet panels.

Then assign explicit scales and guides. Complex charts are usually several
ordinary marks sharing a coordinate system, not one specialized chart type.

### Consolidate package imports

Install `@tanstack/charts` once and keep the framework peers and D3 modules
that application source imports directly. Move TanStack scale and adapter
imports to package subpaths:

| Previous import                         | Current import                          |
| --------------------------------------- | --------------------------------------- |
| `@tanstack/charts-scales/<family>`      | `@tanstack/charts/scales/<family>`      |
| `@tanstack/react-charts`                | `@tanstack/charts/react`                |
| `@tanstack/react-charts/<capability>`   | `@tanstack/charts/react/<capability>`   |
| `@tanstack/react-native-charts`         | `@tanstack/charts/react-native`         |
| `@tanstack/react-native-charts/tooltip` | `@tanstack/charts/react-native/tooltip` |
| `@tanstack/octane-charts`               | `@tanstack/charts/octane`               |
| `@tanstack/octane-charts/<capability>`  | `@tanstack/charts/octane/<capability>`  |
| `@tanstack/<framework>-charts`          | `@tanstack/charts/<framework>`          |

The same mapping applies to React and Octane `/core` entries and React
`/tooltip`. Exact ESM entry graphs and `sideEffects: false` preserve capability
and framework tree shaking inside the single published package.

For the current breaking API:

- move axis presentation under `axis`;
- use `axis: false` to hide one axis while retaining its scale;
- move candidate count and formatting under `axis.ticks`;
- move rotation and thinning under `axis.tickLabels`;
- use a single bar/area value as stack length, explicit endpoints to opt out,
  and `layout: group()` for side-by-side bars;
- replace renderer-specific focus decoration with `whenFocused`.
- replace duration-only spring approximations with
  `motion({ transition: { type: 'spring', ... } })` and put chart-, mark-,
  datum-, or guide-specific policy on the definition;
- add `type: 'tween'` to focus-state transitions that previously supplied only
  `duration` and `easing`.
- replace channel `(datum, index, data)` accessors with
  `(datum, { index, data })`;
- replace facet `chart(data, key)` builders with `chart(data, { key })`;
- replace focus `resolve(points, x, y, maxDistance)` and
  `group(points, point)` implementations with `resolve(points, context)` and
  `group(points, { point })`;
- replace spatial-index `(points, scene)` factories with
  `(points, { scene })`;
- replace legend `height(itemCount, width, colors)` implementations with
  `height(itemCount, context)`. The previous `width` value is now
  `context.chart.width`;
- replace controlled-signal `(value, reason)` callbacks with
  `(value, { reason })`;
- replace keyed-selection `key(datum, point)` callbacks with
  `key(datum, { point })`;
- replace focus-guide `format(value, point)` callbacks with
  `format(value, { point })`;
- replace interactive-legend `itemAriaLabel(value, visible)` callbacks with
  `itemAriaLabel(value, { visible })`; and
- use the second `ChartTooltipContentContext` argument in `format` and
  `formatGroup` when formatter output depends on pinned state or axis
  formatting.

See [Marks and Layering](./chart-grammar.md#source-charts-docs-concepts-marks-and-layering-md) and the
[Example Gallery](./examples-core.md#source-charts-docs-examples-index-md).

### Establish parity gates

Use the same frozen data and dimensions on both implementations. Compare:

- prepared values and scale domains;
- representative geometry and baselines;
- bar bandwidth and alignment;
- line gaps and curve crossings;
- axis ticks, rotation, titles, and automatic margins;
- tooltip rows, colors, and formatted values;
- focus, selection, and keyboard paths;
- light and dark output;
- update, resize, and reorder state preservation;
- production bundle and render/update measurements.

Prefer numeric and behavioral assertions. Use screenshot diffs for the
remaining painted details.

### Migrate incrementally

A reliable order is:

1. Render a static, fixed-size chart.
2. Match scales, marks, and guides.
3. Add responsive sizing and automatic margins.
4. Match tooltip and keyboard focus.
5. Match selection and controlled viewport state.
6. Capture live values in framework-memoized definitions.
7. Add animation.
8. Measure production bundles and update performance.
9. Remove the old renderer after the parity suite passes.

Keep a temporary renderer switch only as a migration verification tool with a
defined removal gate. It should not become permanent application architecture.

### Know what not to migrate

Do not preserve accidental internals:

- generated DOM structure;
- private renderer hooks;
- broad package imports;
- pixel constants compensating for clipped labels;
- unstable array-index keys;
- manual tooltips that duplicate the default focus model.

Preserve user-visible meaning and behavior. Replace implementation accidents
with the documented TanStack Charts boundary.

### Close the migration

Before deleting the old path:

- all chart modes and empty states have parity coverage;
- accessibility and reduced motion pass;
- representative production data has been exercised;
- the new path meets explicit bundle and performance budgets;
- rollback is a version or commit, not two live renderers;
- newly discovered API friction is resolved or documented at the correct
  layer.

See [Testing and Debugging](./production.md#source-charts-docs-guides-testing-and-debugging-md) and
[Bundle Size and Performance](./production.md#source-charts-docs-guides-bundle-size-and-performance-md).

<a id="source-charts-docs-guides-responsive-charts-md"></a>

## Responsive Charts

Source: `charts:docs/guides/responsive-charts.md`.

TanStack Charts treats width and height differently:

- width is normally measured from the chart container;
- height is a product decision supplied as pixels or an aspect ratio;
- scale factories infer domains while configured instances retain fixed domains;
- TanStack Charts copies those scales and assigns responsive pixel ranges.

This keeps a definition stable while the same chart moves between a dashboard
card, a split pane, and a full-width report.

### Container-responsive width

Omit `width` from `mountChart` or framework adapter options to follow the
container. The shared DOM host observes the container and updates only when
its measured width changes.

```ts
const host = mountChart(element, {
  definition,
  height: 320,
  ariaLabel: 'Weekly downloads',
})
```

The container must have a resolvable width. In grid and flex layouts, the
common requirement is `min-width: 0` on the grid or flex child:

```css
.chart-card {
  min-width: 0;
}
```

Supply `width` only when an application deliberately owns fixed geometry, such
as an export frame or a benchmark.

### Height and aspect ratio

Use one of these policies:

- `height`: fixed product height in CSS pixels;
- a positive, finite `aspectRatio`: derive height from the measured width;
- neither: use the host default.

Do not supply both as competing policies. A fixed height is usually more stable
for dashboards and scrolling pages. An aspect ratio is useful for editorial
layouts where the chart should scale as one visual block. Invalid ratios fall
back to the default height.

### Automatic guide space

Omit `margin` for normal charts. The scene solver reserves the minimum space
required by:

- formatted tick labels;
- rotated tick bounds;
- first and last tick overhang;
- axis titles;
- legends;
- inherited font metrics in a DOM host.

```ts group=responsive-long-labels env=charts file=/src/chart.ts entry
import { barX, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { rows } from './data'

export default defineChart({
  marks: [
    barX(rows, {
      x: 'weeklyRequests',
      y: 'feature',
      fill: '#7c3aed',
      inset: 1,
    }),
  ],
  x: {
    scale: scaleLinear,
    nice: true,
    grid: true,
    axis: { ticks: { count: 5 }, label: 'Weekly requests' },
  },
  y: {
    scale: () => scaleBand<string>().padding(0.1),
  },
})
```

```ts group=responsive-long-labels file=/src/data.ts collapsed
export const rows = [
  { feature: 'Self-service account recovery', weeklyRequests: 128 },
  { feature: 'Saved searches and alerting', weeklyRequests: 95 },
  { feature: 'Audit log export', weeklyRequests: 72 },
  { feature: 'Custom retention policies', weeklyRequests: 44 },
  { feature: 'Role-based access controls', weeklyRequests: 31 },
]
```

An explicit side locks only that side:

```ts
margin: {
  left: 96
}
```

`margin: 0` locks every side and is appropriate for guide-free sparklines.
Axis labels thin automatically after candidate generation and optional
rotation. Use `axis.ticks.spacing`, `axis.tickLabels.rotate`, hard-kept labels,
or a different representation when labels compete for the same axis space.

[Open the full horizontal-ranking catalog case](https://tanstack.com/charts/catalog/bar-horizontal-ranking/).

### Text measurement

Static scenes use deterministic text estimates. DOM and framework SVG hosts
measure painted text with the inherited container font and relayout after web
fonts finish loading.

Use `measureText` only when another renderer or layout system owns text
measurement. It runs synchronously during scene compilation and receives the
text plus the resolved font family, style, stretch, size, weight, letter
spacing, direction, locale, font scale, anchor, and baseline. It returns the
painted box relative to the requested origin. A host that loads fonts or
measures them asynchronously owns that readiness lifecycle and renders the
scene again when its synchronous metrics change.

The resolved geometry is available after every render:

```ts
const scene = host.getScene()

scene.margin
scene.chart
scene.scales
```

Use `scene.chart` to align application-owned overlays. Do not calculate a
parallel plot rectangle from guessed margins.

### Deterministic server output

A server cannot measure a future browser container. Supply `initialWidth` when
the initial SVG must have deterministic geometry:

```tsx
<Chart
  definition={definition}
  initialWidth={640}
  height={320}
  ariaLabel="Weekly downloads"
/>
```

The client adopts the real container width after hydration. Use the same
`initialWidth` for all requests that render the same layout; do not derive it
from browser-only APIs on the server.

See [SSR and Hydration](./production.md#source-charts-docs-guides-ssr-and-hydration-md) for the complete lifecycle.

### Responsive construction

Most data transforms should depend only on application data. The responsive
builder receives the full scene width and height, so it can choose breakpoints,
tick counts, or a surface-relative representation.

Those values are not the final inner plot bounds. Automatic guides and legends
resolve `scene.chart` after the builder returns. Exact plot-space collision,
binning, or label placement belongs in a custom mark's render phase, which
receives the final chart bounds and resolved scales, or in an application
overlay driven by `onRender`.

```ts
function summarizeRows(rows: Input['rows']) {
  return summarize(rows)
}

function createDefinition(rows: Input['rows']) {
  const summary = summarizeRows(rows)

  return defineChart(({ width }) =>
    buildResponsiveSpec(summary, {
      compact: width < 480,
    }),
  )
}
```

For a deliberately guide-free `margin: 0` scene, the full surface and inner
plot can coincide. Do not assume that equivalence for ordinary automatic
layout.

Responsive relayout commits immediately even when animation is enabled for
data updates. Set `svgAnimation: { resize: true }` only when size interpolation is
intentional.

The [Dynamic Data and Animation](./composition.md#source-charts-docs-guides-dynamic-data-and-animation-md) guide explains
the two phases. The [D3 integration contract](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md)
explains why application code should not set positional pixel ranges.

### Responsive checklist

- The container can shrink because its grid or flex child uses `min-width: 0`.
- Width is omitted unless fixed geometry is intentional.
- Height or aspect ratio is an explicit product choice.
- Scale domains remain semantic and independent from pixels.
- Automatic margins are enabled unless the chart is deliberately guide-free.
- Long labels are tested at the smallest supported width.
- Overlays use `scene.chart`, not duplicated margin math.
- SSR uses a deterministic `initialWidth`.
- Final plot-space work reads custom-mark render bounds or `scene.chart`.

<a id="source-charts-docs-guides-ssr-and-hydration-md"></a>

## Ssr And Hydration

Source: `charts:docs/guides/ssr-and-hydration.md`.

TanStack Charts builds a platform-neutral scene before the selected renderer
produces output. React, Preact, Vue, Solid, Svelte, and Octane use the same
runtime and renderer on the server and in the browser.

### Adapter support

| Adapter                                    | Server output                       | Browser contract                                    |
| ------------------------------------------ | ----------------------------------- | --------------------------------------------------- |
| [React](./framework-react.md#source-charts-docs-framework-react-adapter-md)     | Complete SVG; Canvas shell          | Hydrates and adopts the existing surface            |
| [Preact](./framework-preact.md#source-charts-docs-framework-preact-adapter-md)   | Complete SVG                        | Hydrates before the shared host mounts              |
| [Vue](./framework-vue.md#source-charts-docs-framework-vue-adapter-md)         | Complete SVG                        | Hydrates before the shared host mounts              |
| [Solid](./framework-solid.md#source-charts-docs-framework-solid-adapter-md)     | Complete SVG                        | Hydrates before the shared host mounts              |
| [Svelte](./framework-svelte.md#source-charts-docs-framework-svelte-adapter-md)   | Complete SVG                        | Hydrates before the shared host mounts              |
| [Octane](./framework-octane.md#source-charts-docs-framework-octane-adapter-md)   | Complete SVG; Canvas shell          | Hydrates and adopts the existing surface            |
| [Angular](./framework-angular.md#source-charts-docs-framework-angular-adapter-md) | Not yet a verified adapter contract | Browser mount, immutable update, and teardown       |
| [Lit](./framework-lit.md#source-charts-docs-framework-lit-adapter-md)         | Not yet a verified adapter contract | Browser registration, update, disconnect, reconnect |
| [Alpine](./framework-alpine.md#source-charts-docs-framework-alpine-adapter-md)   | None                                | Browser-only directive                              |

For adapters with server output, the browser must render the same definition,
dimensions, formatters, and component tree. Angular and Lit may run
inside applications with their own server infrastructure, but this library
does not yet promise or test adapter hydration for them.

### Give the server a real size

The server cannot measure a container. Supply one of these policies:

- `width` and `height` for a fixed-size chart;
- `width` and `aspectRatio` for a fixed-width proportional chart;
- `initialWidth` and `height` for a responsive chart;
- `initialWidth` and `aspectRatio` when height should follow width.

```tsx
<Chart
  definition={trafficChart}
  ariaLabel="Daily traffic"
  initialWidth={720}
  aspectRatio={16 / 9}
/>
```

The adapter uses an explicit `width` before `initialWidth` when deriving the
server height. After mounting, a responsive host observes the container and
renders at its measured width. Pick an `initialWidth` close to the layout's
common size to minimize the first responsive adjustment.

See [Responsive Charts](./production.md#source-charts-docs-guides-responsive-charts-md) for the complete size policy.

### Keep output deterministic

Server and first-client output must agree for the same definition, size, and
options. In particular:

- keep fixed definitions at module scope and recreate captured-data definitions
  from the same resolved data;
- sort unordered collections before creating marks;
- do not read `window`, layout, time, locale, or random values while building a
  definition;
- pass locale-sensitive formatters explicitly;
- rely on inferred IDs or unique positions, and supply explicit keys when the
  data has no stable identity;
- provide `idPrefix` when multiple render roots need coordinated resource IDs.

Responsive chart functions are synchronous. Fetch and transform data in the
application's server/data layer, then capture the resolved data in the
definition.

### Hydration ownership

Server and browser executions create separate runtime instances. Within the
browser adapter's own initial render and layout-effect mount, the DOM host
receives the already created browser runtime.

Do not conditionally replace a chart with a different component only because
the code is executing on the server. That creates a different tree and gives
up the shared render path.

### Canvas server shell

`@tanstack/charts/react/canvas` and `@tanstack/charts/octane/canvas` render a
deterministic accessible shell on the server: a named chart root and five
`aria-hidden` canvas elements with the initial scene dimensions. The hidden
stable base bitmap preserves the raw `canvas` surface, while four live layers
model background, focus underlay, ordinary scene, and focus overlay paint. No
server Canvas API or pixel painting is required.

The client renders the same shell, adopts its existing root and canvases, sizes
their backing stores for the device-pixel ratio, paints the scene, and attaches
the shared interaction host. The first image appears after client mount; use
the default SVG adapter when visible server-rendered geometry is required.

### Fonts and text measurement

Automatic guide margins depend on text metrics. The server uses deterministic
fallback measurement unless you provide `measureText`. The browser host
remeasures when fonts become available and schedules a new layout.

`ChartTextMeasurer` is deliberately synchronous. Its options include the
resolved family, style, stretch, letter spacing, direction, locale, and font
scale so server and native implementations can use the same typography
contract. Hosts own asynchronous font readiness and request another render
after their available metrics change.

For strict pixel parity:

1. Use a font available in both environments.
2. Supply a deterministic `ChartTextMeasurer`.
3. Supply the same `ChartTextTypography`, including locale and font scale, in
   both environments.

Most applications should allow the browser's post-font layout correction
instead of shipping a font engine to the server.

### Render without a framework

`createChartRuntime` and `renderChartSvg` form the server boundary:

```ts
import { createChartRuntime, renderChartSvg } from '@tanstack/charts'

const runtime = createChartRuntime<TrafficRow, Date, number>()
const scene = runtime.render(definition, { width: 720, height: 400 })

const svg = renderChartSvg(scene, {
  ariaLabel: 'Daily traffic',
  idPrefix: 'traffic',
})

runtime.destroy()
```

`renderChartSvg` returns a string and does not require a DOM. A custom
`ChartRenderer.prerender` may produce another deterministic shell. Browser-only
focus, tooltip, reconciliation or paint, animation, and export begin when its
surface mounts.

### Hydration checklist

- Server data is fully resolved before chart rendering.
- Initial dimensions are explicit and representative.
- Definition, transformed data, and formatting are deterministic.
- Keys and `idPrefix` are stable.
- The same adapter and definition render on both sides.
- Browser-only work lives in host callbacks or application effects.
- Font-driven relayout is expected or a text measurer is supplied.

See the selected framework adapter page and
[Runtime and Scene](./runtime-scales-reference.md#source-charts-docs-reference-runtime-and-scene-md) for the exact contracts.

<a id="source-charts-docs-guides-testing-and-debugging-md"></a>

## Testing And Debugging

Source: `charts:docs/guides/testing-and-debugging.md`.

A useful chart test answers more than “did a surface appear?” Test at the
narrowest layer that owns the behavior.

### Test the scene first

`createChartScene` gives static definitions a deterministic, DOM-free result:

```ts
import { createChartScene } from '@tanstack/charts'

const scene = createChartScene(definition, {
  width: 640,
  height: 360,
})

expect(scene.points).toHaveLength(rows.length)
expect(scene.scales.x.domain).toEqual(expectedDates)
expect(scene.chart.width).toBeGreaterThan(0)
```

For responsive definitions, create a runtime and call `render` with an exact
surface size.
Scene tests are suited to:

- materialized domains and ticks;
- mark and guide geometry;
- clipping and margins;
- focus-point metadata;
- stable node keys;
- deterministic themes and gradients.

Avoid asserting the complete scene object when only one semantic invariant
matters.

### Test serialized SVG

Use `renderChartSvg` to verify:

- accessible name and description;
- resource ID scoping;
- expected SVG element kinds;
- absence of invalid numeric output;
- deterministic server markup.

Prefer structural assertions over a full string snapshot. A formatting change
should not obscure a geometry regression.

### Test the DOM host

Mount into a real or sufficiently complete DOM when behavior depends on:

- responsive measurement;
- pointer or keyboard focus;
- sticky tooltips;
- selection callbacks;
- keyed reconciliation;
- interrupted animation;
- font-driven relayout;
- export of computed styles.

Always call `destroy()` and verify observers, frames, tooltip nodes, and event
listeners do not survive.

Run the same focus, keyboard, tooltip, selection, responsive-update, and
destroy sequences against SVG and Canvas when renderer parity matters. Those
behaviors belong to the shared host; renderer tests should concentrate on
surface adoption, coordinate conversion, paint, and cleanup.

For Canvas, test deterministic server-shell markup without installing Canvas
APIs. Use a Canvas 2D mock for draw-call and device-pixel-ratio assertions, then
use browser screenshots for representative paths, clipping, gradients, text,
themes, and focus-overlay composition. Do not use a raw pixel or data-URL
snapshot as the only semantic assertion.

### Test interaction as a sequence

Describe the user path and its semantic assertion:

1. Move to a known chart coordinate.
2. Verify the resolved datum and grouped points.
3. Select or pin it.
4. Update, resize, reorder, or filter the chart.
5. Verify focus is preserved when the key survives and cleared when it does
   not.
6. Verify keyboard access reaches the same information.

This catches state-preservation failures that a static screenshot cannot.

### Visual regression tests

Use screenshots for painted properties that are hard to express as numbers:

- label overlap;
- automatic margins;
- curve and area crossings;
- gradients and clipping;
- high-density aliasing;
- light and dark themes.

Fix fonts, viewport, device scale, animation state, locale, time zone, and data
revision. Pair the screenshot with geometry assertions so a visually small but
semantically important error cannot hide in the diff threshold.

### Accessibility tests

At minimum verify:

- the SVG or Canvas root has a meaningful accessible name;
- descriptions summarize the current chart, not every point;
- keyboard focus can enter and traverse the chart when enabled;
- focus and selection callbacks expose the same data as pointer interaction;
- reduced-motion disables nonessential animation;
- an adjacent table or summary exists when exact values are required.

See [Accessibility](./interaction-accessibility.md#source-charts-docs-guides-accessibility-md).

### Diagnose by layer

When output is wrong, inspect in this order:

1. Prepared rows and intervals.
2. Materialized mark channels.
3. Resolved scale domains, ranges, bandwidths, and ticks.
4. `scene.chart` bounds and margins.
5. Scene nodes and interaction points.
6. Renderer input and static output.
7. Mounted surface and application styling.

If the scene is correct but the surface is wrong, the defect belongs to
rendering, reconciliation or paint, or styling. If the channel values are
wrong, changing the renderer will not fix the cause.

### Performance tests need correctness gates

A timed run is valid only if it also verifies:

- the requested revision painted;
- expected nodes and points exist;
- representative geometry is finite and in bounds;
- no page or lifecycle errors occurred;
- the interaction result belongs to the latest scene.

Exclude invalid attempts from rankings. Report warmup, sample count, percentile,
environment, data size, and renderer capability. See
[Bundle Size and Performance](./production.md#source-charts-docs-guides-bundle-size-and-performance-md).
