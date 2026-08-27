# Composition and customization

Composition, custom marks, renderers, transforms, colors, and animation.

<a id="source-charts-docs-guides-custom-marks-and-renderers-md"></a>

## Custom Marks And Renderers

Source: `charts:docs/guides/custom-marks-and-renderers.md`.

Use a custom mark when a visualization fits the shared scene model but is not
expressible as a useful composition of built-in Cartesian, polar, or
geographic marks.

Use a custom renderer when the same chart scene needs a different mounted
surface. Use a custom SVG serializer when only SVG markup or resources differ.

Neither extension should reach into private scene compiler state.

### Start with composition

Before creating a mark, check whether the result is a combination of:

- lines or areas;
- rectangles or cells;
- dots or hexagons;
- rules, links, ticks, arrows, or vectors;
- text or frames;
- facets;
- polar arcs, radial paths, dots, or guides;
- projected GeoJSON;
- optional scalar contours, density contours, spatial bins, topology marks,
  hierarchy layouts, or Sankey flow composition.

Composition retains built-in type inference, focus metadata, animation, and
subpath bundle boundaries. The [chart examples](./examples-core.md#source-charts-docs-examples-index-md) show
candlesticks, networks, and annotations built this way. Boxplots use the
first-party [`boxX` and `boxY` marks](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-box-md), which keep
their statistical steps aligned instead of exposing prepared child datasets.

For example, a regular scalar grid belongs in the optional
[`contour` mark](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-contour-md), not a case-owned D3 path and
scene-node loop. A weighted directed graph belongs in
[`sankeyDiagram`](./marks-composite.md#source-charts-docs-reference-marks-sankey-md), whose callback composes
ordinary links, rectangles, and labels after responsive layout.

### Group reusable child marks

Use `compositeMark` when a reusable unit consists entirely of ordinary marks:

```ts
import { compositeMark, dot, frame } from '@tanstack/charts'

const framedPoints = compositeMark(
  [
    frame({ id: 'border', strokeOpacity: 0.2 }),
    dot(rows, {
      id: 'points',
      x: 'date',
      y: 'value',
      key: 'id',
    }),
  ],
  { id: 'framed-points' },
)
```

The parent namespaces child channels, scene keys, points, and motion. Child
declaration order remains paint order, and datum and positional types are the
union of the children. Parent motion supplies defaults; a child's motion wins
where both specify the same field.

Child IDs must be unique. Every child retains its own interaction points, so
do not layer several interactive marks when only one semantic target should
exist. A child with its own `resolveLayout` is rejected because nested layout
scheduling would be ambiguous. Compose those marks directly in the chart or
write one custom mark with a single resolved-layout owner.

`compositeMark` is available from the root and universal entries. Import
`@tanstack/charts/mark/composite` when bundle isolation matters.

### Create a mark

`createMark` is the normal extension boundary:

<!-- docs-example: custom-mark typecheck -->

```ts
import { createMark } from '@tanstack/charts'

interface ThresholdDatum {
  id: string
  value: number
}

const threshold = createMark<ThresholdDatum, never, number>(({ markIndex }) => {
  const id = `threshold-${markIndex}`
  const datum: ThresholdDatum = { id: 'target', value: 75 }

  return {
    id,
    channels: {
      y: {
        scale: 'y',
        values: [datum.value],
      },
    },
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
            style: {
              stroke: theme.foreground,
              strokeOpacity: 0.55,
            },
          },
        ],
      }
    },
  }
})
```

`initialize` materializes channels for one scene build. `render` receives the
required full `surface` bounds, inner `chart` plot bounds, scales, theme, color
resolver, and text layout tools.

Pass a mark renderer as the third argument when the custom mark should select
its own surface:

```ts
import { canvasChartRenderer } from '@tanstack/charts/canvas'

const denseThresholds = createMark<ThresholdDatum, never, number>(
  initializeThresholds,
  undefined,
  canvasChartRenderer,
)
```

The second argument remains the optional mark motion definition. A custom mark
can pass both motion and a renderer, and neither changes the other's meaning.
The selected renderer still decides whether it consumes that motion policy.
Built-in marks expose the same renderer choice in their option object. A DOM
renderer used this way must implement `ChartLayerRenderer`, including
`compose(defaultRenderer)`, so one compositor can own the ordered child
surfaces. `canvasChartRenderer` provides that composition.

When a custom mark emits data labels, an optional `layoutLabels(context)` can
return those positioned `SceneLabel` nodes before render so unlocked margins
contain them. Keep that method pure because responsive layout may call it more
than once; the final `render` call still happens once.

For layout that genuinely requires final scales or plot bounds, return
`resolveLayout(context)` instead of an initial render. It may derive
screen-space bins, collisions, or topology and returns the final channels,
labels, states, and render closure. Positional domains still come from the
channels materialized by `initialize`; resolved channels can contribute to
color inference. The bounded margin solver may call the layout repeatedly, so
it must be pure and deterministic.

Available scene nodes:

- `group`;
- `rule`;
- `polyline`;
- `area`;
- `dot`;
- `rect`;
- `label`.

Every node requires a deterministic key.

### Interaction points

The threshold above is decorative, so it emits no points. Return `ChartPoint`
records when custom geometry should participate in focus, tooltips, keyboard
navigation, or selection.

Each point should retain:

- its original datum;
- a stable key;
- semantic x and y values;
- resolved pixel coordinates;
- group identity and color.

For a large painted mark, create the semantic point once and attach that same
object to the scene primitive that paints it:

```ts
import type { SceneRect } from '@tanstack/charts'

const point = interactionPoint(index)
const node: SceneRect = {
  kind: 'rect',
  key: point.key,
  x,
  y,
  width,
  height,
  interaction: { point, affinity: 'x' },
}

return { nodes: [node], points: [point] }
```

Use `x` for vertically oriented marks, `y` for horizontal marks, `xy` for
ordinary two-dimensional proximity, and `geometry` when only exact
containment should focus the mark. The default resolver checks containment
across every mark before applying any fallback. A continuous `polyline` or
`area` may attach all of the semantic samples it represents with
`interaction: { points, affinity }`; containment selects the closest sample
within that primitive.

Keep primitive coordinates local when returning translated groups. Scene
traversal applies nested translation, clipping, facets, and paint order after
layout. Do not calculate a second set of global hit bounds beside the rendered
node.

Omit points for decorative geometry. Do not invent fake interactive data for a
frame, grid, or threshold that should not receive focus.

### Focus-only anchors

A decorative mark can still support `whenFocused` without becoming a pointer
target. Return `focusAnchors` beside its nodes:

```ts
return {
  nodes: [node],
  focusAnchors: [
    {
      key: node.key,
      markId: id,
      group: null,
      datum,
      datumIndex: index,
      yValue: datum.value,
    },
  ],
}
```

The anchor key must identify the node or keyed group it reveals. Include only
the semantic axes the geometry owns: a horizontal rule supplies `yValue`; a
vertical rule supplies `xValue`. `focusAnchors` are read only when the mark is
wrapped in `whenFocused` and never enter pointer hit testing, tooltip data, or
keyboard navigation.

### Focus-guide marks

A mark that emits only cursor-driven rules, bands, labels, or markers declares that
role explicitly:

```ts
import { resolveCrosshairGuide } from '@tanstack/charts/crosshair'

return {
  id,
  channels: {},
  focusGuideOnly: true,
  render({ chart, surface, scales, theme }) {
    return {
      nodes: [],
      focusGuides: [
        {
          key: id,
          markId: id,
          chart,
          surface,
          x: { style: { stroke: theme.foreground } },
          projectX: (value) => {
            const scale = scales.x
            if (!scale || scale.type === 'none') return undefined
            const position = (scale.viewport?.map ?? scale.map)(value)
            return Number.isFinite(position) ? position : undefined
          },
          resolve: resolveCrosshairGuide,
        },
      ],
    }
  },
}
```

`focusGuideOnly: true` keeps a guide-only mark from becoming the first ordinary
mark used to divide underlays from overlays. `MarkScene.focusGuides` accepts
`MarkFocusGuide`. Its `placement` is optional: omit it for normal mark-order
placement. An explicit `under` or `over` is reserved for composed nested scenes
that must retain placement already resolved inside that composition. Authors
do not need to invent a placement for an ordinary guide mark.

The required `surface` bounds cover the complete chart surface; `chart` covers
the inner plot. Use `chart` for clipped rules and `surface` for labels that must
remain visible. Project semantic guide values through
`scale.viewport?.map ?? scale.map` so a transient viewport translation keeps
the guide aligned with presented content. Each guide's required `resolve`
callback receives the final guide, local focus, pointer, and projected cursor,
then returns one transient scene node or `undefined`. `resolveCrosshairGuide`
provides the built-in rule, band, label, and marker behavior. A custom guide can
supply different policy without adding it to renderer bundles that never use
the guide. A custom renderer receives final `SceneFocusGuide` values after the
compiler has filled in placement. Pass the scene to
`resolveFocusPresentation` instead of calling guide resolvers or resolving mark
order inside the renderer.

### Separate point and scale values

Most marks use the same value type for interaction and scale domains. When
they intentionally differ, import the advanced factory:

```ts
import { createMarkWithScaleValues } from '@tanstack/charts/mark/scale-values'

createMarkWithScaleValues<Datum, PointX, PointY, ScaleX, ScaleY>(initialize)
```

This is useful for interval endpoints or custom layouts whose interactive
anchor is not the complete set of values materialized on an axis.

Use `ChartMarkPointX` and `ChartMarkPointY` for the interaction contract and
`ChartMarkScaleX` and `ChartMarkScaleY` for the positional contract. Ordinary
chart code should rely on definition inference instead.

### Custom scales and legends

Configured callable scales are the normal path. `ChartScale`,
`ChartColorScale`, and `ChartColorLegend` exist for context-aware adapters that
need chart range, theme, or responsive legend geometry.

Keep specialized scale dependencies in the module that uses them. A line-only
bundle must not pay for a custom scale registered elsewhere.

See [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) and
[Legends and Color](./composition.md#source-charts-docs-guides-legends-and-color-md).

### Custom renderer

A full renderer implements `ChartRenderer` and returns a `ChartSurface`:

```ts
import { mountChartRenderer } from '@tanstack/charts/renderer'

const host = mountChartRenderer(container, {
  definition,
  renderer: myRenderer,
  ariaLabel: 'Threshold history',
})
```

The renderer owns server shell markup, its mounted element, scene painting,
focus painting, and cleanup. It can implement `clientToScene` when controlled
pointer gestures need client-coordinate conversion; the interaction controller
returns `null` when that optional capability is absent. The host retains
sizing, runtime, keyboard, tooltip, selection, and focus-strategy behavior.
Keep `prerender` deterministic and make `mount` adopt compatible server markup.

A composed surface exposes its child surfaces from back to front through
`ChartSurface.layers`. Its `element` remains the single accessible,
interactive root. `defaultElement` identifies the topmost element owned by the
host's default renderer. SVG-oriented `onRender` callbacks keep `svg` for
compatibility and also receive the complete `surface`, so application code can
inspect a mixed chart without treating the composition root as an SVG.

If `paintFocus` resolves and paints inline mark-state geometry, return that
destination `ChartScene`. The host will use it for subsequent pointer hits;
returning nothing preserves base-scene interaction for simpler renderers.
Call `resolveFocusPresentation(scene, focus, pointer, cursor)` to obtain the
authored and crosshair nodes for the renderer's underlay and overlay surfaces.

If the renderer animates point geometry, implement `getPresentationPoints`
and `subscribePresentationPoints`. This keeps stationary pointer focus,
keyboard focus, and tooltip anchors aligned with the painted frame.

Use the public `resolveFocusScene` and `focusedSceneNodes` helpers when a
custom surface supports authored focus layers. They keep normal filtered marks
and `whenFocused(..., { retarget: true })` compositions on the same
renderer-neutral selection path as the built-in surfaces.

Use `ChartRendererRenderContext.surface` instead of assuming `onRender` exposes
an SVG element. Framework consumers pass `renderer` through
`@tanstack/charts/react/core` or `@tanstack/charts/octane/core`.

### Custom SVG serializer

A `ChartSvgRenderer` accepts the complete `ChartScene` and accessible SVG
options:

```ts
const renderSvg: ChartSvgRenderer<Row, Date, number> = (scene, options) => {
  return serializeMySvg(scene, options)
}
```

Pass it through `renderSvg` on the vanilla host or any default SVG framework
adapter. Preserve:

- the accessible label and description;
- stable `data-ts-key` identity when DOM reconciliation should reuse nodes;
- the focus marker contract when chart-owned focus remains enabled;
- scoped IDs through `idPrefix`;
- deterministic server output.

The default `renderChartSvg` already emits declared gradients and group clips.
The compatible `renderChartSvgWithResources` export remains available when an
explicit resource serializer name is useful.

Mounted SVG surfaces also call the selected serializer when focus guides are
painted. That call contains a single `focus-guide-layer:under` or
`focus-guide-layer:over` group in `scene.nodes`; preserve its keyed `<g>` and
apply the same paint, clipping, and resource-ID rules as the base scene.

### Custom focus and spatial indexes

A `ChartFocusStrategy` owns pointer resolution, grouping, and keyboard
navigation. Pointer coordinates and the point being grouped arrive through
the second context bag. Its generic types must remain identical to the chart
points it receives.

A `ChartSpatialIndexFactory` builds optional nearest-point acceleration from
scene points and receives the complete resolved scene through
`context.scene`. Return original typed points from the index. Do not erase
them to `unknown` and cast them back in callbacks.

### Extension checklist

- Built-in composition was considered first.
- Channel values fully declare positional domain inputs.
- Scene generation is deterministic and DOM-free.
- Keys survive reorder and updates.
- Interactive points retain original data and exact coordinate types.
- Decorative geometry emits no fake points.
- Optional dependencies remain behind the extension import.
- Custom rendering preserves accessibility, identity, and SSR.
- No cast, private import, or suppression is needed at the public boundary.

<a id="source-charts-docs-guides-dynamic-data-and-animation-md"></a>

## Dynamic Data And Animation

Source: `charts:docs/guides/dynamic-data-and-animation.md`.

Definition identity is the application update boundary. A framework memo
captures the current data and options; Charts rebuilds the scene when that
definition changes or when the chart surface changes size.

### React

```tsx
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

function RankingChart({ rows, metric, accent }: Props) {
  const definition = useMemo(() => {
    const ranked = rows
      .map((row) => ({ label: row.label, value: row[metric] }))
      .sort((left, right) => right.value - left.value)

    return defineChart({
      svgAnimation: { duration: 280, easing: 'ease-out' },
      chart: ({ width }) => ({
        marks: [
          barX(ranked, {
            x: 'value',
            y: 'label',
            fill: accent,
          }),
        ],
        scales: {
          x: {
            scale: scaleLinear,
            nice: true,
            axis: { ticks: { count: width < 420 ? 4 : 7 } },
          },
          y: {
            scale: () => scaleBand<string>().padding(0.1),
          },
        },
      }),
    })
  }, [rows, metric, accent])

  return <Chart definition={definition} ariaLabel="Revenue ranking" />
}
```

Use the framework's native equivalent: `computed`, `createMemo`, `$derived`,
Angular `computed`, or Octane `useMemo`.

### Vanilla

```ts
host.update({
  ...options,
  definition: createRankingDefinition(nextRows, nextMetric, nextAccent),
})
```

### Stable keys

Built-in marks first use an explicit `key`, then a unique `datum.id`, then a
unique nested `datum.data.id`. Marks can also infer identity from semantic
positional channels:

```ts
barX(rows, {
  x: 'value',
  y: 'label',
})
```

Here `barX` uses the unique `y` value when rows have no `id`. `barY` uses `x`;
`lineY` and `areaY` use `x`; `areaX` uses `y`; rects and cells use their x/y
interval tuple. Dots and text try x, then y, then their x/y tuple. Inference is
scoped to each group and falls back to array position when a candidate is
incomplete or duplicated. Development builds warn once for each affected mark
instance.

Supply `key` when the inferred value is not the entity's identity or can
change independently of it. Stable identity preserves surviving SVG elements,
focused points, and transition continuity.

### Lightweight SVG tweening

`svgAnimation` accepts `true` or:

- `duration`: milliseconds;
- `easing`: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, or a
  function from normalized progress to normalized progress;
- `respectReducedMotion`: defaults to `true`;
- `resize`: defaults to `false`, so responsive relayout does not repeatedly
  restart animation.

Numeric geometry and compatible path data interpolate. Entering and exiting
nodes reconcile by key. If an update interrupts a transition, it begins from
the geometry currently painted on screen.

Static SVG, server rendering, and `createChartScene` do not include animation.

Use this path when a small default-SVG tween is enough. It has no spring
solver, definition-local timing cascade, entrance choreography, or retained
velocity.

### Optional tween and spring motion

Use `motion()` when animation quality is part of the chart contract:

```ts
import { scaleUtc } from 'd3-scale'
import { motion } from '@tanstack/charts/motion'
import { stagger } from '@tanstack/charts/motion/definition'
import { mountChartRenderer } from '@tanstack/charts/renderer'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const definition = defineChart({
  motion: {
    path: 'morph',
    ...stagger({ each: 35, roles: 'line', by: 'series' }),
  },
  marks: [
    lineY(rows, {
      x: 'date',
      y: 'actual',
      key: 'id',
    }),
    lineY(rows, {
      x: 'date',
      y: 'forecast',
      key: 'id',
      motion: { transition: { type: 'spring', mass: 1.25 } },
    }),
  ],
  scales: {
    x: { scale: scaleUtc },
    y: { scale: scaleLinear },
  },
})

const host = mountChartRenderer(container, {
  definition,
  renderer: motion({
    transition: { type: 'spring', stiffness: 170, damping: 18, mass: 1 },
  }),
  width: 640,
  height: 360,
  ariaLabel: 'Actual and forecast revenue',
})
```

Each host has one animation owner. The default SVG renderer uses `svgAnimation`.
When `motion()` is the renderer, it ignores `svgAnimation` and uses motion
declarations from the definition. A `motion` declaration configures the motion
renderer; it does not select it.

Motion declarations can live on the chart, a mark, an axis, its ticks, tick
labels, or axis label. A callback can specialize `enter`, `update`, and `exit`
by series or datum:

```ts
barY(rows, {
  x: 'month',
  y: 'revenue',
  key: 'id',
  motion(context) {
    if (context.phase === 'enter') {
      return { delay: context.datumIndex * 35 }
    }
    if (context.datum?.status === 'forecast') {
      return { transition: { type: 'tween', duration: 240 } }
    }
  },
})
```

Same-type partial transitions inherit omitted properties. Springs use physical
`stiffness`, `damping`, and `mass`; duration is not a spring parameter. Rapid
retargeting preserves the currently painted value and velocity. Keyed
interaction points move with the presentation geometry rather than jumping to
the next scene.

A `crosshair` is also keyed focus presentation. With the motion renderer, its
rules, bands, labels, and marker retain DOM identity and spring velocity while
focus retargets. Default SVG, Canvas, and native surfaces paint the same guide
at its current target without importing the browser motion runtime.

`stagger()` contributes only a context-aware delay, so it composes with
transition and path fields through normal object spread. Spring updates always
retarget immediately; an update delay is ignored so incoming momentum cannot
freeze. Use delays for spring enter/exit choreography or any tween phase.

The renderer grows entering Cartesian bars, lines, and areas from their
semantic baseline; grows radial paths from the polar center; sweeps arcs
through their authored angle; staggers bar entrances; morphs compatible
numeric SVG geometry; and keeps removed keys painted through their exit
transition. Authored delay replaces automatic staggering for that target.

`motion()` respects reduced motion and does not animate resize-only updates by
default. It adopts server-rendered SVG without replaying entrance motion by
default; pass `initial: 'always'` to replay entrance motion after hydration.
Static SVG and Canvas accept the same definitions but paint the final state.

See the [Motion reference](./interaction-motion-reference.md#source-charts-docs-reference-motion-md) for the complete cascade,
types, focus-state transitions, compatibility limits, and standalone spring
sampler.

See [Themes and Motion examples](./examples-advanced.md#source-charts-docs-examples-themes-and-motion-md) for complete
cards that separate keyed chart motion from controls, labels, and palette CSS.

### Streaming

For high-rate data:

1. Keep source history outside the chart if the product needs it.
2. Capture a bounded visible window or encoded representation.
3. Preserve keys for rows that survive the roll.
4. Keep viewport state controlled.
5. Coalesce upstream work when only the latest state matters.

For a scrolling trace, keep enough overscan before the visible x-domain to
cover the largest expected update batch, enable `clip`, and use a rolling path
contract:

```ts
const definition = defineChart({
  motion: {
    path: {
      update: 'rolling',
      x: 'shift',
      y: 'reproject',
      fallback: 'snap',
    },
    transition: { type: 'tween', duration: sampleInterval, easing: 'linear' },
  },
  marks,
  scales: {
    x: null,
    y: null,
  },
})
```

The keyed retained window moves as one affine path. `y: 'reproject'` keeps that
motion valid while a continuous y-domain changes. A failed rolling invariant
snaps instead of occasionally becoming a different interpolation. Set
`fallback: 'morph'` only when path interpolation is intentional. A valid update
that arrives during another roll composes from the transform currently painted
on screen.

Keep `viewport.translate` at zero on both the previous and target scene during
a rolling update. A nonzero transient viewport translation makes the rolling
contract fail and uses its configured fallback. Commit the viewport domain and
reset the translation before applying the next live-data window. Keep plot
margins fixed and prefer linear segments so appending a sample cannot recompute
a visible curve tangent.

The final definition passed to `host.update` is applied synchronously.

<a id="source-charts-docs-guides-faceting-and-composition-md"></a>

## Faceting And Composition

Source: `charts:docs/guides/faceting-and-composition.md`.

Composition is the main extension mechanism in TanStack Charts. Marks share a
chart specification, scales, theme, and responsive plot rectangle. More
complex views combine those same primitives instead of switching to a separate
component family.

### Layer marks

Marks are rendered in array order. Put broad background geometry first and
annotations or direct labels last:

```ts
const definition = defineChart({
  marks: [
    ruleY([0]),
    areaY(rows, { x: 'date', y1: 'low', y2: 'high' }),
    lineY(rows, { x: 'date', y: 'median' }),
    dot(highlights, { x: 'date', y: 'median' }),
    text(labels, { x: 'date', y: 'median', text: 'label' }),
  ],
  scales: {
    x: x,
    y: y,
  },
})
```

Each mark may consume a different datum type. The resulting chart interaction
type is the honest union of those datum types. Use ordinary TypeScript
narrowing when a callback handles several layers.

The canonical grammar is described in
[Marks and Layering](./chart-grammar.md#source-charts-docs-concepts-marks-and-layering-md).

### Facet one view by a field

`facetChart` repeats a mark composition for each group and returns a complete
guide-free outer definition:

```ts group=regional-facets env=charts file=/src/chart.ts entry
import { dot, facetChart, lineY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { rows } from './data'

export default facetChart(rows, {
  by: 'region',
  columns: 3,
  gap: 16,
  axes: 'outer',
  label: (region) => String(region),
  chart(data) {
    return {
      marks: [
        lineY(data, { x: 'week', y: 'orders', strokeWidth: 2 }),
        dot(data, { x: 'week', y: 'orders', r: 3.5 }),
      ],
      scales: {
        x: { scale: scaleLinear().domain([1, 4]) },
        y: {
          scale: scaleLinear().domain([0, 80]),
          grid: true,
          axis: { label: 'Orders' },
        },
      },
    }
  },
})
```

```ts group=regional-facets file=/src/data.ts collapsed
export const rows = [
  { region: 'North', week: 1, orders: 32 },
  { region: 'North', week: 2, orders: 46 },
  { region: 'North', week: 3, orders: 51 },
  { region: 'North', week: 4, orders: 64 },
  { region: 'South', week: 1, orders: 45 },
  { region: 'South', week: 2, orders: 42 },
  { region: 'South', week: 3, orders: 57 },
  { region: 'South', week: 4, orders: 61 },
  { region: 'West', week: 1, orders: 25 },
  { region: 'West', week: 2, orders: 39 },
  { region: 'West', week: 3, orders: 48 },
  { region: 'West', week: 4, orders: 70 },
]
```

Use `facet(rows, options)` instead when the repeated panels need to be one mark
inside a larger custom definition.

The default `axes: 'outer'` draws shared guides around the complete facet
grid. Use `axes: 'cell'` when each panel needs its own guides. Cell axes and
incompatible independent scales cannot be presented as one shared outer axis;
choose the option that matches the comparison.

[Open the Anscombe quartet catalog case](https://tanstack.com/charts/catalog/facets-anscombe/).

### Share domains intentionally

Shared scales make position comparable across panels. Independent domains
make local variation easier to see but can exaggerate differences.

Build shared domains once and pass configured scales to every facet. When a
panel deliberately uses an independent domain, label that policy in the
surrounding UI.

The [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) page owns scale construction
and responsive range rules.

### Compose distinct views

Not every composition is a facet. A focus-and-context chart, scatterplot with
marginal histograms, or chart with an inset summary contains views with
different roles. Use `composeViews` when they belong to one accessible figure:

```ts
import { alignX, composeViews, grid } from '@tanstack/charts/view'

const definition = composeViews({
  views: {
    overview: overviewDefinition,
    detail: detailDefinition,
  },
  layout: grid({
    rows: [
      { id: 'overview', size: 72 },
      { id: 'detail', grow: 1 },
    ],
    columns: [{ id: 'main', grow: 1 }],
    cells: {
      overview: { row: 'overview', column: 'main' },
      detail: { row: 'detail', column: 'main' },
    },
  }),
  links: [alignX('overview', 'detail')],
})
```

Use `fill`, `layer`, and `inset` when views overlap. Later layers paint above
earlier layers, and every child is clipped to its resolved frame. Use
`shareX` or `shareY` when linked views must resolve the same scale domain and
mapping; `alignX` and `alignY` align plot endpoints without sharing domains.

`viewGrid` is convenience syntax for the non-overlapping grid case. Keep
semantic selection or viewport state in application state; each child
definition consumes that state as ordinary data or domains. Use separate chart
hosts when panels need independent tooltips, keyboard behavior, or accessible
labels.

Do not coordinate charts by querying or mutating their SVG nodes.

### Composition checklist

- Layer order reflects visual occlusion and reading order.
- Each mark keeps its natural data shape and stable inferred or explicit
  identity.
- Shared scales are used only where direct positional comparison is intended.
- Facet axis policy is explicit.
- Every named `composeViews` child is placed exactly once.
- A composed definition has one outer accessible chart label and host behavior.
- Independently hosted views have independent accessible labels.
- Shared state is semantic application state, not DOM state.
- Dense dashboards destroy hosts and listeners when panels unmount.

<a id="source-charts-docs-guides-legends-and-color-md"></a>

## Legends And Color

Source: `charts:docs/guides/legends-and-color.md`.

Color has one semantic path. A mark's `color` channel contributes values to the
chart-level `color` scale and legend. `z` partitions series or interaction
groups and supplies the color value only when `color` is omitted. `fill` and
`stroke` are final paint overrides; using either bypasses scale mapping for
that paint.

### Automatic categorical color

When marks emit categorical color values and no color scale is supplied,
TanStack Charts uses the chart theme palette. This is the convenient default
for a small, stable set of categories.

For persistent product semantics, supply an explicit configured ordinal scale:

```ts
import { colorLegend, defineChart, lineY } from '@tanstack/charts'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'

const series = ['core', 'react', 'octane'] as const
const color = scaleOrdinal<string, string>()
  .domain(series)
  .range(['#2563eb', '#f97316', '#10b981'])

const definition = defineChart({
  marks: [
    lineY(rows, {
      x: 'date',
      y: 'value',
      z: 'series',
    }),
  ],
  scales: {
    x: x,
    y: y,
  },

  color: {
    scale: color,
    legend: colorLegend({ label: 'Package' }),
  },
})
```

The application owns the domain order and paint assignment. This prevents a
category from changing color when data is filtered or reordered.

### Quantitative color

Supply a D3 color-scale factory and put the numeric field on the mark's
`color` channel:

```ts
import { scaleSequential } from 'd3-scale'
import { interpolateBlues } from 'd3-scale-chromatic'
import { colorLegend } from '@tanstack/charts'

const color = {
  scale: () => scaleSequential(interpolateBlues),
  legend: colorLegend({
    label: 'Requests per minute',
    format: (value) => value.toLocaleString(),
  }),
}
```

The factory keeps the interpolator and lets the chart infer the numeric domain
from color-channel values. Continuous and quantize factories infer a finite
extent. Quantile factories receive the complete observed numeric population,
including duplicates. Threshold factories require an explicit domain because
their cuts are policy, not an extent:

```ts
import { scaleThreshold } from 'd3-scale'

const colors = ['#eff6ff', '#bfdbfe', '#60a5fa', '#1d4ed8']

const color = {
  scale: scaleThreshold<number, string>,
  domain: [5, 12, 24],
  range: colors,
  legend: colorLegend({ label: 'Incidents' }),
}
```

`d3-scale` and `d3-scale-chromatic`, with their matching type packages, are
optional direct application dependencies for these quantitative mappings.
They are never pulled into charts that do not import them. The
[scale guide](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) owns the install and API-reference
links.

### Automatic color legend

`colorLegend` reads the resolved scale:

- categorical scales render labeled swatches;
- continuous scales render a sampled ramp;
- quantize, quantile, and threshold scales render exact bins and boundaries.

Options:

- `label`: optional legend title;
- `itemWidth`: minimum categorical item width;
- `width`: preferred quantitative legend width;
- `format`: numeric boundary formatter;
- `placement`: `top` by default or `bottom`.

The legend reserves its own layout height. It is visual guidance and is hidden
from the SVG accessibility tree; essential category meaning should also be
available through direct labels, surrounding HTML, or a table.

```ts group=automatic-color-legend env=charts file=/src/chart.ts entry
import { colorLegend, defineChart, lineY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { rows } from './data'

export default defineChart({
  marks: [
    lineY(rows, {
      x: 'week',
      y: 'downloads',
      z: 'package',
      strokeWidth: 2.5,
    }),
  ],
  scales: {
    x: {
      scale: () => scalePoint<string>().padding(0.2),
      axis: { label: 'Week' },
    },
    y: {
      scale: scaleLinear,
      grid: true,
      axis: { ticks: { count: 5 }, label: 'Downloads' },
    },
  },

  color: { legend: colorLegend({ label: 'Package' }) },
})
```

```ts group=automatic-color-legend file=/src/data.ts collapsed
export const rows = [
  { week: 'May 4', package: 'core', downloads: 820 },
  { week: 'May 11', package: 'core', downloads: 960 },
  { week: 'May 18', package: 'core', downloads: 1_140 },
  { week: 'May 25', package: 'core', downloads: 1_280 },
  { week: 'May 4', package: 'react', downloads: 610 },
  { week: 'May 11', package: 'react', downloads: 730 },
  { week: 'May 18', package: 'react', downloads: 810 },
  { week: 'May 25', package: 'react', downloads: 940 },
]
```

[Open the grouped-bar catalog case](https://tanstack.com/charts/catalog/bar-grouped/).

### Explicit gradient legend

`colorGradientLegend` requires a numeric color-scale domain. Options:

- `label`: optional title;
- `steps`: rendered color samples, with a minimum of two;
- `width`: preferred width capped by the chart;
- `format`: formatter for the domain endpoints;
- `placement`: `top` by default or `bottom`.

Use `colorGradientLegend` only when a discrete scale should intentionally be
shown as a sampled ramp. It requires a numeric domain and does not invent
units or semantic thresholds.

### Controlled interactive legend

Use `interactiveColorLegend` when a categorical color value is also the series
identity:

```ts
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'

const color = {
  domain: ['core', 'react', 'octane'],
  range: ['#2563eb', '#f97316', '#10b981'],
  legend: interactiveColorLegend({
    visible: controlledSignal(visibleSeries, setVisibleSeries),
    placement: 'bottom',
    ariaLabel: 'Package visibility',
  }),
}
```

The application stores `visibleSeries`; the legend proposes the next complete
array in color-domain order. Filtering happens after scale resolution, so a
hidden series keeps its color and does not change inferred position domains.
The browser host renders native pressed-state buttons and preserves their focus
across controlled updates. Static SVG rendering keeps a visual, noninteractive
fallback.

This behavior applies to marks whose `color` channel defines series identity.
Keep a separate `z` channel when grouping and color mean different things.

### Direct labels versus legends

Prefer direct labels when:

- there are only a few lines or regions;
- labels fit near endpoints;
- the reader would otherwise move repeatedly between marks and a legend.

Prefer a legend when:

- the same category appears in many places;
- marks are too dense for direct labels;
- a shared mapping spans several views.

It is valid to use both when the legend establishes the complete domain and
direct labels help with the primary comparison.

### Theme and accessibility rules

- Keep semantic category colors stable across updates.
- Test every supplied color against light and dark backgrounds.
- Use a sequential scale for ordered magnitude and a diverging scale only when
  a meaningful center exists.
- Do not imply order with an unordered rainbow palette.
- Do not use color as the only signal for selection, status, or error.
- Use `unknown` behavior on the ordinal scale when unexpected categories must not
  silently join the domain.

See [Themes and Styling](./composition.md#source-charts-docs-guides-themes-and-styling-md) and
[Accessibility](./interaction-accessibility.md#source-charts-docs-guides-accessibility-md) for the surrounding policies.

<a id="source-charts-docs-guides-themes-and-styling-md"></a>

## Themes And Styling

Source: `charts:docs/guides/themes-and-styling.md`.

TanStack Charts inherits the surrounding application instead of installing a
global visual theme. The default chart theme uses:

- `currentColor` for foreground, muted text, and grids;
- `transparent` for the chart background;
- six CSS-variable-backed categorical colors.

Set the container's `color` and the chart follows normal light and dark CSS:

```css
.chart-card {
  color: #172033;
  background: #ffffff;
}

@media (prefers-color-scheme: dark) {
  .chart-card {
    color: #e6edf7;
    background: #111827;
  }
}
```

### Palette tokens

Override the default categorical palette at any container boundary:

```css
.revenue-chart {
  --ts-chart-1: #2563eb;
  --ts-chart-2: #f97316;
  --ts-chart-3: #10b981;
  --ts-chart-4: #8b5cf6;
  --ts-chart-5: #ec4899;
  --ts-chart-6: #06b6d4;
}
```

This is the lowest-cost path for application branding. It also preserves
automatic theme changes without rebuilding a chart definition.

### Definition-level theme

Use `theme` when a chart needs explicit scene colors:

```ts
const definition = defineChart({
  marks,
  scales: {
    x: x,
    y: y,
  },

  theme: {
    foreground: '#e5e7eb',
    muted: '#94a3b8',
    grid: '#334155',
    background: '#0f172a',
    palette: ['#38bdf8', '#fb7185', '#4ade80'],
  },
})
```

`theme` is partial. Omitted fields retain defaults. A responsive definition's
`chart` context receives the default build-time theme, which is useful when
marks need the shared palette or foreground tokens. A `theme` returned by that
same builder is merged afterward while the scene is created, so read an
application-supplied theme from the builder's captured values when it must use
those overrides.

Do not encode semantic status by reading the current theme in data
preparation. Keep meaning stable and choose theme-appropriate paint at render
time.

### Mark styling

Built-in marks expose the paint styles relevant to their geometry: fill, stroke,
opacity, widths, line caps, dashes, corner radius, and font properties. A style
can be fixed or data-driven where the mark's option accepts a visual channel.

Keep these responsibilities separate:

- scales map semantic values to visual values;
- mark options select and refine paint;
- the theme supplies shared defaults;
- application CSS controls the surrounding surface.

For categorical or quantitative color mapping, use the canonical
[Legends and Color](./composition.md#source-charts-docs-guides-legends-and-color-md) guide.

### Canvas styling

The Canvas renderer resolves scene paints such as `currentColor` and CSS
custom properties against the chart's computed environment. It inherits the
root font and repaints after relevant ancestor class, style, `data-theme`,
color-scheme, forced-colors, or viewport changes.

Rasterized scene nodes are not DOM descendants. A node's `className` therefore
cannot be targeted by a CSS selector after paint. Put data-dependent fill,
stroke, opacity, and font choices in mark options or the chart theme; use
container CSS for palette variables, inherited color, and typography.

### Gradients and clipping

Gradients are opt-in resources. Declare them on the chart:

```ts group=gradient-area env=charts file=/src/chart.ts entry
import { areaY, defineChart, lineY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { rows } from './data'

export default defineChart({
  marks: [
    areaY(rows, {
      x: 'month',
      y: 'revenue',
      fill: 'url(#revenue-fill)',
    }),
    lineY(rows, {
      x: 'month',
      y: 'revenue',
      stroke: '#2563eb',
      strokeWidth: 2,
    }),
  ],
  scales: {
    x: { scale: () => scalePoint<string>().padding(0.2) },
    y: {
      scale: scaleLinear,
      grid: true,
      axis: { label: 'Revenue (USD)' },
    },
  },

  gradients: [
    {
      id: 'revenue-fill',
      x1: 0,
      y1: 1,
      x2: 0,
      y2: 0,
      stops: [
        { offset: 0, color: '#2563eb', opacity: 0.08 },
        { offset: 1, color: '#2563eb', opacity: 0.7 },
      ],
    },
  ],
  clip: true,
})
```

```ts group=gradient-area file=/src/data.ts collapsed
export const rows = [
  { month: 'Jan', revenue: 36_000 },
  { month: 'Feb', revenue: 48_000 },
  { month: 'Mar', revenue: 45_000 },
  { month: 'Apr', revenue: 62_000 },
  { month: 'May', revenue: 76_000 },
  { month: 'Jun', revenue: 71_000 },
]
```

Use `url(#revenue-fill)` as the mark paint. Default SVG hosts emit and scope the
resource; `idPrefix` keeps resource and clip IDs distinct when several charts
share a document.

Set `clip: true` when marks should be clipped to the resolved plot rectangle.
Clipping is a geometry policy, not a substitute for correct scale domains.

Canvas consumes the same declared gradients and group clips. A Canvas gradient
needs measurable node bounds; path-only geometry with no point bounds should
use an explicit paint instead.

### HTML tooltip styling

The built-in DOM tooltip is an HTML element inside the chart container by default.
Give it a class through `tooltip.className` and style that class in application
CSS:

```ts
import { tooltip } from '@tanstack/charts/tooltip'

const definition = defineChart(baseDefinition, {
  tooltip: { use: tooltip, className: 'revenue-tooltip' },
})
```

The default tooltip chrome also reads CSS variables from the chart container.
This avoids selector specificity fights with its positioning styles:

```css
.revenue-chart {
  --ts-chart-tooltip-background: color-mix(in srgb, Canvas 92%, transparent);
  --ts-chart-tooltip-color: CanvasText;
  --ts-chart-tooltip-border: 1px solid
    color-mix(in srgb, CanvasText 12%, transparent);
  --ts-chart-tooltip-border-radius: 0.625rem;
  --ts-chart-tooltip-shadow: 0 12px 34px
    color-mix(in srgb, CanvasText 14%, transparent);
}
```

`--ts-chart-tooltip-max-width`, `--ts-chart-tooltip-padding`, and
`--ts-chart-tooltip-font` control the remaining surface defaults. A
`className` is still useful for content-specific layout.

With the `portal` extension, the preferred manual-Popover path keeps the
element under the chart in the DOM, so inheritance and scoped selectors
continue to work. If Popover is unavailable or fails, the fixed fallback moves
the element under the chart's `ownerDocument` body. Use a document-level
selector for its class and put required fallback tokens on that class or a
shared document ancestor.

Every framework adapter can compose native application content with the
default rows. See [Tooltips and Focus](./interaction-accessibility.md#source-charts-docs-guides-tooltips-and-focus-md).

See [Themes and Motion examples](./examples-advanced.md#source-charts-docs-examples-themes-and-motion-md) for complete
cards with inherited palettes, gradients, controls, and optional motion.

### Theme checklist

- Default charts inherit text color and respond to the application's color
  scheme.
- Palette CSS variables are scoped to the smallest useful container.
- Semantic status remains distinguishable without color alone.
- Explicit chart themes meet contrast requirements in every supported mode.
- Resource IDs use a stable `idPrefix` when charts share a document.
- A theme change does not recreate application data or lose focused state.

<a id="source-charts-docs-guides-transforms-and-reactivity-md"></a>

## Transforms And Reactivity

Source: `charts:docs/guides/transforms-and-reactivity.md`.

TanStack transforms are eager, deterministic data utilities. Their results can
feed a chart, table, export, test, or another transform.

```text
source rows → data transforms → mark channels → mark layout
```

Use a channel accessor for a one-row calculation, a data transform for reusable
cross-row work, and `layout: stack()` or `layout: group()` when geometry belongs
only to one mark.

### Hoist the calculation

```ts
const daily = groupBy(orders, {
  by: {
    region: 'region',
    day: (datum) => utcDay.floor(datum.createdAt),
  },
  outputs: {
    revenue: { value: 'amount', reduce: 'sum' },
    orders: { reduce: 'count' },
    averageOrder: { value: 'amount', reduce: 'mean' },
  },
})

const trends = rollingWindow(daily, {
  by: 'region',
  orderBy: 'day',
  size: 28,
  partial: false,
  outputs: {
    revenue28d: { value: 'revenue', reduce: 'sum' },
    averageOrder28d: { value: 'averageOrder', reduce: 'mean' },
  },
})

lineY(trends, { x: 'day', y: 'revenue28d', color: 'region' })
```

Unlike a mark-options transform, both intermediate datasets are normal typed
rows. Group fields are named and row transforms remain flat.

### Compose structural and analytic transforms

Keep each ownership decision visible where derived data is created:

```ts
import { normalize, select } from '@tanstack/charts'
import { fold } from '@tanstack/charts/transform/fold'

const fields = ['latency', 'throughput'] as const
const folded = fold(services, {
  fields,
  as: { key: 'metric', value: 'measurement' },
})
const normalized = normalize(folded, {
  by: 'metric',
  value: 'measurement',
  basis: 'extent',
  as: 'relativeMeasurement',
})
const firstService = select(normalized, {
  by: 'metric',
  select: 'first',
})
```

`fold` owns wide-to-long structure. `normalize` owns the cross-row numeric
comparison. `select` returns chosen rows unchanged. Metric direction, chosen
profiles, and display labels remain explicit application semantics.

### Use callbacks and escape hatches

Field names and object-bag callbacks are interchangeable:

```ts
const summaries = groupBy(rows, {
  by: { region: 'region', profitable: ({ datum }) => datum.margin > 0 },
  outputs: {
    p90: { value: 'latency', reduce: quantile(0.9) },
    custom: {
      reduce: ({ data, group }) => domainCalculation(data, group),
    },
  },
})
```

For transforms outside the built-ins, use an ordinary function:

```ts
const active = rows.filter((row) => row.active)
const enriched = active.map(enrichRow)
const summaries = groupBy(enriched, options)
```

This is the escape hatch and the composition model. There is no pipeline
protocol to learn.

### Memoize at the owner

```tsx
const histogram = useMemo(
  () => binX(observations, { value: 'latency', thresholds: 24 }),
  [observations],
)
```

Use `computed`, `createMemo`, `$derived`, or the equivalent application
primitive. TanStack Charts does not add a cache or reactive graph.

Memoize the complete pipeline when its source and options share a lifecycle.
Re-run it when the source rows, folded field tuple, metric direction, or
selection policy changes. Do not mutate a transform result and expect a chart
runtime to discover the change.

Transform option errors are synchronous. Validate dynamic field lists before
calling `fold`; duplicate fields and invalid output names fail with a `fold:`
error instead of producing ambiguous rows.

Every transform records direct lineage to its immediate input. For example,
`normalized[0].source[0]` is a folded row, while that row's `source[0]` is the
original service record. Preserve this chain when a tooltip or drill-down
needs the raw observation.

### Keep geometry separate

Color can infer stack series for stack-capable marks. Grouping remains an
explicit geometric choice:

```ts
barY(rows, { x: 'quarter', y: 'revenue', color: 'product' })

barY(rows, {
  x: 'quarter',
  y: 'revenue',
  color: 'product',
  layout: group(),
})
```

Use `stackRowsX` or `stackRowsY` when stack endpoints must be reused outside
that mark.

Granular imports such as `@tanstack/charts/transform/fold`,
`@tanstack/charts/transform/group`, and
`@tanstack/charts/transform/rolling-window` keep unrelated transform families out of
bundle-sensitive code.
