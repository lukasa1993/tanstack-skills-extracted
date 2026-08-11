# Rendering and composition reference

Adapters, extensions, hosts, rendering, export, transforms, and view composition.

<a id="source-charts-docs-reference-adapter-controller-md"></a>

## Adapter Controller

Source: `charts:docs/reference/adapter-controller.md`.

The adapter controller is the low-level lifecycle used by framework bindings.
Application code normally uses its framework's chart component or
[`mountChart`](./rendering-composition-reference.md#source-charts-docs-reference-dom-host-md).

### Entry points

```ts
import {
  createChartAdapter,
  resolveChartAdapterLayout,
  type ChartAdapter,
  type ChartAdapterLayout,
  type ChartAdapterLayoutOptions,
} from '@tanstack/charts/adapter'
import { createChartRendererAdapter } from '@tanstack/charts/adapter/renderer'
```

`createChartAdapter` accepts the SVG-oriented `ChartHostOptions`.
`createChartRendererAdapter` accepts `ChartRendererHostOptions`, including an
explicit `renderer`, so a framework can expose a renderer-neutral binding.

### Controller factories

```ts
function createChartAdapter<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(
  initialOptions: ChartHostOptions<TDatum, TXValue, TYValue>,
): ChartAdapter<
  ChartHostOptions<TDatum, TXValue, TYValue>,
  TDatum,
  TXValue,
  TYValue
>
```

```ts
function createChartRendererAdapter<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(
  initialOptions: ChartRendererHostOptions<TDatum, TXValue, TYValue>,
): ChartAdapter<
  ChartRendererHostOptions<TDatum, TXValue, TYValue>,
  TDatum,
  TXValue,
  TYValue
>
```

Both factories preserve the definition's datum and coordinate types from the
host options and return the same lifecycle contract:

```ts
interface ChartAdapter<
  TOptions,
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  prerender: () => string
  mount: (container: HTMLElement) => void
  update: (options: TOptions) => void
  getScene: () => ChartScene<TDatum, TXValue, TYValue> | undefined
  destroy: () => void
}
```

| Method        | Contract                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prerender()` | Compiles the current options at the resolved initial size and returns the selected renderer's deterministic markup.                                |
| `mount()`     | Mounts into one container. Calling it again while mounted throws. A preceding prerender shares the controller's runtime.                           |
| `update()`    | Replaces the complete options object. Before mount it updates later prerender and mount work; after mount it forwards the update to the live host. |
| `getScene()`  | Returns `undefined` before mount, including after prerender, and the current compiled scene after mount.                                           |
| `destroy()`   | Releases the mounted host, runtime, observers, renderer surface, and interaction listeners. Repeated calls after cleanup have no effect.           |

Keep one controller per framework component instance.

### Prerender and mount

```ts
const adapter = createChartAdapter(options)

const initialMarkup = adapter.prerender()

// In the browser lifecycle:
container.innerHTML = initialMarkup
adapter.mount(container)

adapter.update(nextOptions)
adapter.destroy()
```

A server controller and browser controller are separate instances. The
browser's initial render and mount should reuse one browser controller. The
renderer decides which compatible shell or root it adopts. The [SSR and Hydration
guide](./production.md#source-charts-docs-guides-ssr-and-hydration-md) covers framework integration
requirements.

### Initial layout

```ts
interface ChartAdapterLayoutOptions {
  width?: number
  height?: number
  initialWidth?: number
  aspectRatio?: number
}

interface ChartAdapterLayout {
  aspectRatio?: number
  initialWidth: number
  initialHeight: number
}

function resolveChartAdapterLayout(
  options: ChartAdapterLayoutOptions,
): ChartAdapterLayout
```

`resolveChartAdapterLayout` makes server geometry deterministic before browser
measurement:

| Result          | Resolution                                                                      |
| --------------- | ------------------------------------------------------------------------------- |
| `initialWidth`  | `width`, then `initialWidth`, then `640`                                        |
| `aspectRatio`   | The supplied value only when it is finite and greater than zero                 |
| `initialHeight` | `height`, then `initialWidth / aspectRatio` when the ratio is valid, then `320` |

An explicit `width` therefore overrides `initialWidth`, and an explicit
`height` overrides ratio-derived height. Framework adapters can also use the
validated `aspectRatio` to keep the container stable until its measured width
is available.

### Ownership boundary

The controller owns chart runtime and host cleanup. The framework binding owns
component identity, native lifecycle hooks, reactive option assembly, and
container presentation. Use the renderer-neutral factory only when the
framework entry accepts an application-selected
[`ChartRenderer`](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).

<a id="source-charts-docs-reference-custom-extensions-md"></a>

## Custom Extensions

Source: `charts:docs/reference/custom-extensions.md`.

TanStack Charts exposes narrow inversion-of-control boundaries around its
scene compiler. Prefer composition with built-in marks first. Add an extension
when the chart requires geometry or behavior that cannot be expressed without
distorting its data model.

### Composite marks

`compositeMark` groups ordinary marks behind one stable parent identity:

```ts
import { compositeMark } from '@tanstack/charts/mark/composite'

function compositeMark<
  TMarks extends readonly ChartMark<any, any, any, any, any>[],
>(
  marks: TMarks,
  options?: CompositeMarkOptions<ChartMarkDatum<TMarks[number]>>,
): ChartMark<
  ChartMarkDatum<TMarks[number]>,
  ChartMarkPointX<TMarks[number]>,
  ChartMarkPointY<TMarks[number]>,
  ChartMarkScaleX<TMarks[number]>,
  ChartMarkScaleY<TMarks[number]>
>
```

`CompositeMarkOptions` contains optional `id` and `motion` fields. The result
preserves the union of child datum and positional types. Initialization merges
the children's semantic channels under parent and child namespaces. Rendering
keeps child order, namespaces scene keys and mark IDs, and retains each child
point as a separate interaction target. Parent and child motion definitions
merge under the resolved child namespace, with child fields taking precedence.

Every child must have a unique ID and an ordinary initialized `render` method.
A child that owns `resolveLayout` is rejected; keep one resolved-layout owner
instead of nesting scheduling lifecycles. See
[Custom Marks and Renderers](./composition.md#source-charts-docs-guides-custom-marks-and-renderers-md)
for composition guidance.

### Custom marks

```ts
import { createMark } from '@tanstack/charts'
```

```ts
function createMark<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(
  initialize: (
    context: MarkInitializeContext,
  ) => MarkInitialization<TDatum, TXValue, TYValue>,
  motion?: ChartMotionDefinition<TDatum>,
): ChartMark<TDatum, TXValue, TYValue>
```

Initialization runs once per scene compilation and receives the mark's layer
index:

```ts
interface MarkInitializeContext {
  markIndex: number
}

interface InitializedMark<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  id: string
  channels: Readonly<Record<string, MaterializedChannel>>
  motion?: ChartMotionDefinition<any>
  viewport?: Readonly<Partial<Record<'x' | 'y', 'content' | 'fixed'>>>
  focusGuideOnly?: boolean
  layoutLabels?(context: MarkRenderContext): readonly SceneLabel[]
  render(context: MarkRenderContext): MarkScene<TDatum, TXValue, TYValue>
  resolveLayout?(
    context: MarkResolvedLayoutContext,
  ): ResolvedMarkLayout<TDatum, TXValue, TYValue>
}
```

`MarkInitialization` also accepts a `ResolvedLayoutMarkInitialization`, which
has `resolveLayout` instead of an initial `render`. `createMark` normalizes both
forms to `InitializedMark`, so wrappers around ordinary marks retain a callable
`render`.

The optional factory `motion` is copied onto each initialized mark. An
initializer may return its own `motion` when a composite or resolved layout
needs a scene-local policy; that value takes precedence over the factory
fallback.

Materialized channels declare semantic values before scale resolution:

```ts
interface MaterializedChannel {
  scale?: string
  values: readonly unknown[]
  includeZero?: boolean
}
```

Use `scale: 'x'`, `scale: 'y'`, or `scale: 'color'` for shared chart scales.
`includeZero` is a hint available to a custom scale resolver. Filter invalid
values before materializing them.

`viewport` overrides presentation ownership independently for x and y. Without
an override, a mark is viewport content on an axis when one of its materialized
channels uses that axis. `'content'` forces the mark into that axis's clipped,
translated layer even when no channel establishes the relationship. `'fixed'`
keeps the mark stationary on that axis even when a channel contributes to its
domain. This ownership does not change scale-domain contribution.

The exported `ChartContinuousDomain<TValue>` type represents viewport state as
either `readonly [number, number]` or `readonly [Date, Date]`, narrowed by the
mark and axis value type. Numeric and temporal endpoints cannot be mixed.

Render nodes and points with `context.scales[axis].map`. The scene compiler
applies the mark's viewport translation and remaps its interaction-point
references. `scale.viewport?.map` is for consumers that need the final
presented coordinate outside mark rendering.

The render context provides final geometry and shared presentation:

```ts
interface MarkRenderContext {
  markIndex: number
  surface: ChartBounds
  chart: ChartBounds
  scales: Readonly<Record<string, ResolvedScale>>
  theme: ChartTheme
  color(value: ChartKey | null | undefined): string
  colors: ResolvedColorScale
  layout: ChartLayoutOptions
}
```

#### Final-screen mark layout

Use `resolveLayout` when binning, collision avoidance, topology, or responsive
packing depends on final positional scales and inner bounds:

```ts
interface MarkResolvedLayoutContext {
  markIndex: number
  chart: ChartBounds
  scales: Readonly<Record<string, ResolvedScale>>
  theme: ChartTheme
  layout: ChartLayoutOptions
}

interface ResolvedMarkLayout<TDatum, TXValue, TYValue> {
  channels?: Readonly<Record<string, MaterializedChannel>>
  states?: InitializedMark<TDatum, TXValue, TYValue>['states']
  layoutLabels?(context: MarkRenderContext): readonly SceneLabel[]
  render(context: MarkRenderContext): MarkScene<TDatum, TXValue, TYValue>
}
```

The margin solver may call `resolveLayout` more than once. Keep it synchronous,
pure, deterministic, and free of application state. Initial channels alone
establish x/y domains. Resolved channels replace them for final
non-positional inference, including color; resolved x/y values never re-domain
the positional scales. Derived rows stay inside the returned render closure
instead of becoming a cross-mark transform graph.

If a custom mark emits labels that should participate in automatic margins,
return the same positioned labels from `layoutLabels`. The solver may call it
more than once with different responsive ranges; keep it pure. `render` still
runs once with the final layout. The built-in Cartesian `text` mark provides
this hook.

Return keyed scene nodes and, when the mark participates in native
interaction, typed points:

```ts
interface MarkScene<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  nodes: readonly SceneNode[]
  points?: readonly ChartPoint<TDatum, TXValue, TYValue>[]
  focusAnchors?: readonly ChartFocusAnchor[]
  focusGuides?: readonly MarkFocusGuide[]
}

type MarkFocusGuide = Omit<SceneFocusGuide, 'placement'> & {
  placement?: SceneFocusGuide['placement']
}
```

`focusAnchors` let `whenFocused` reveal decorative geometry without making it
a pointer or keyboard target. `focusGuides` describe data-less presentation
resolved from current focus or cursor state. `MarkFocusGuide` has the final
`SceneFocusGuide` fields except that `placement` is optional. Omit it to let
mark order place a guide under or over the first ordinary mark. Supply it only
when a composed nested scene must preserve an already resolved placement.
Every focus guide supplies a `resolve` callback that receives
`SceneFocusGuideResolveContext` and returns one transient `SceneNode` or
`undefined`. The callback stays attached to the optional guide instead of
becoming unconditional renderer policy. Import `resolveCrosshairGuide` from
`@tanstack/charts/crosshair` to reuse the built-in rule, band, label, and marker
behavior.

Set `focusGuideOnly: true` on an initialized mark that contributes only these
dynamic guides and no ordinary base-scene content. This explicit
classification keeps the mark out of the first-ordinary-mark boundary used by
default placement. `surface` is the required full-surface bounds; `chart` is
the inner plot. Guide rules normally clip to `chart`, while labels may use
`surface` for clamping.

The practical contracts are in
[Custom Marks and Renderers](./composition.md#source-charts-docs-guides-custom-marks-and-renderers-md).

#### Mark requirements

- Give the mark a stable ID. Derive a fallback from `markIndex` only when layer
  order is stable.
- Materialize every value needed to establish positional domains during
  initialization.
- Map through `context.scales`; do not recalculate responsive ranges.
- Declare `viewport` ownership when channel inference does not match the
  mark's content or fixed annotation behavior.
- Give each scene node and point a deterministic key.
- Keep presentation-only focus anchors keyed to the nodes they reveal.
- Emit finite geometry only.
- Preserve the original datum and index in every interaction point.
- Use one honest focus coordinate and semantic x/y pair per point.
- Keep semantic row transforms eager and outside `render`; use
  `resolveLayout` only for work that requires final screen geometry.

The scene node and point shapes are documented in
[Runtime and scene](./runtime-scales-reference.md#source-charts-docs-reference-runtime-and-scene-md).

### Distinct point and scale values

Interval geometry may materialize endpoint value types that differ from its
interaction anchor types. Use the exceptional subpath:

```ts
import { createMarkWithScaleValues } from '@tanstack/charts/mark/scale-values'
```

```ts
function createMarkWithScaleValues<
  TDatum,
  TXPointValue extends ChartValue,
  TYPointValue extends ChartValue,
  TXScaleValue extends ChartValue,
  TYScaleValue extends ChartValue,
>(
  initialize: (
    context: MarkInitializeContext,
  ) => MarkInitialization<TDatum, TXPointValue, TYPointValue>,
  motion?: ChartMotionDefinition<TDatum>,
): ChartMark<TDatum, TXPointValue, TYPointValue, TXScaleValue, TYScaleValue>
```

The subpath also exports `ChartMarkPointX`, `ChartMarkPointY`,
`ChartMarkScaleX`, and `ChartMarkScaleY`. Use it only when the distinction is
real; ordinary custom marks should use `createMark`.

### Curves

`ChartCurve` supplies precomputed path data for line and y-oriented area marks:

```ts
interface ChartCurve {
  line(points: readonly (readonly [number, number])[]): string
  area(
    top: readonly (readonly [number, number])[],
    bottom: readonly (readonly [number, number])[],
  ): string
}
```

`AreaXCurve` has the transposed contract:

```ts
interface AreaXCurve {
  areaX(
    right: readonly (readonly [number, number])[],
    left: readonly (readonly [number, number])[],
  ): string
}
```

The optional bridges `d3Curve` from `@tanstack/charts/d3/shape` and
`d3AreaXCurve` from `@tanstack/charts/d3/area-x` adapt a supplied curve factory
to these contracts. D3 module ownership and granular imports are documented in
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md).

### Custom positional scales

A custom `ChartScale` resolves semantic values and the responsive range into a
complete mapping and tick set. This is an unchecked math boundary; prefer a
configured callable scale when possible.

See [Custom scales](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md)
for the exact context and return type.

### Custom color scales and legends

`ChartColorScale` maps observed values, domain/range hints, and theme tokens to
a `ResolvedColorScale`. `ChartColorLegend` independently reserves layout height
and emits a scene node.

See [Color](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md) and
[Custom legends](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md).

### Custom text measurement

`ChartTextMeasurer` lets nonbrowser rendering, special fonts, or an
application-owned typography engine provide painted glyph bounds. It affects
guide geometry, not mark text rendering. It is synchronous and receives the
complete resolved `ChartTextTypography`; hosts re-render after asynchronous
font readiness changes.

See [Automatic guide layout](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md)
for the contract.

### Spatial indexes

`ChartSpatialIndexFactory` replaces the default linear pointer lookup without
changing scene compilation. Build a point-only index from its first argument,
or use `context.scene` from its second argument to index resolved primitive
bounds. Return the nearest original point within the requested distance. The
host recreates the index when the scene or factory changes.

See [Spatial indexes](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md). The
appropriate granular spatial primitive can be brought through the boundary
described in [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md).

### Custom focus and gestures

`ChartFocusStrategy` owns pointer resolution, focus grouping, and keyboard task
order. Its `resolve(points, context)` and `group(points, context)` methods keep
coordinates and the active point in named context bags. Rich gestures can
instead disable chart-owned focus and maintain selection or viewport state in
the application.

See [Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).

### Custom renderers

A `ChartRenderer` owns both deterministic server markup and one mounted
`ChartSurface`. The surface renders scenes, converts browser coordinates to
scene coordinates, paints focus, and releases renderer-owned resources.
`mountChartRenderer` keeps responsive sizing, runtime updates, focus,
keyboard, tooltip, and selection behavior shared across renderers.

Custom surfaces should resolve authored focus layers and data-less guides with
`resolveFocusPresentation(scene, focus, pointer, cursor)`, then paint its
`under` nodes, the base scene, and its `over` nodes in that order.

The scene compiler has already converted every mark-emitted `MarkFocusGuide`
to a `SceneFocusGuide` with required `placement` before a renderer receives the
scene. `resolveFocusPresentation` calls each guide's resolver with its local
focus, pointer, and cursor context. A custom renderer should consume those
resolved nodes and final placement through that helper; it should not call
guide resolvers or infer mark order again.

Use `@tanstack/charts/renderer` directly or the framework `/core` entries.
The optional built-in implementation at `@tanstack/charts/canvas` demonstrates
the boundary without changing the default SVG imports.

For an SVG-only serialization change, pass a `ChartSvgRenderer` as `renderSvg`
to the compatibility host or adapt it with `createSvgChartRenderer` from
`@tanstack/charts/svg/renderer`. Preserve the SVG root, stable DOM keys,
accessible name, coordinate system, and focus presentation expected by that
adapter.

Default SVG serialization already preserves declared gradients and group
clips; see [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).

<a id="source-charts-docs-reference-dom-host-md"></a>

## Dom Host

Source: `charts:docs/reference/dom-host.md`.

`mountChart` is the framework-neutral default SVG browser host. It owns
responsive measurement, scene updates, keyed SVG reconciliation, animation,
pointer and keyboard interaction, built-in DOM tooltips, font relayout, and cleanup.

```ts
import { defineChart } from '@tanstack/charts'
import { mountChart } from '@tanstack/charts/dom'
import { tooltip } from '@tanstack/charts/tooltip'
```

### Signature

```ts
function mountChart<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(
  container: HTMLElement,
  initialOptions: ChartHostOptions<TDatum, TXValue, TYValue>,
  runtime?: ChartRuntime<TDatum, TXValue, TYValue>,
): ChartHost<TDatum, TXValue, TYValue>
```

The optional runtime is for adapters or advanced applications that already
rendered an initial scene. Ownership transfers to the host: `host.destroy()`
also destroys that runtime. In ordinary vanilla use, omit it.

### Basic use

```ts
const options = {
  definition: defineChart(definition, { tooltip }),
  height: 320,
  ariaLabel: 'Weekly revenue',
}

const host = mountChart(container, options)

host.update({
  ...options,
  height: 400,
})

host.destroy()
```

Application changes use a new definition:

```ts
const host = mountChart(container, {
  definition: createDefinition(rows, 'revenue'),
  ariaLabel: 'Revenue by month',
})
```

The definition identity is the application update boundary. Responsive
definitions still rebuild when their resolved surface size changes.

### Renderer-neutral and Canvas hosts

Use the lower-level host when the surface is not necessarily SVG:

```ts
import { canvasChartRenderer } from '@tanstack/charts/canvas'
import { mountChartRenderer } from '@tanstack/charts/renderer'

const host = mountChartRenderer(container, {
  definition: defineChart(definition, { tooltip }),
  renderer: canvasChartRenderer,
  ariaLabel: 'Weekly revenue',
})
```

`mountChartRenderer` accepts `ChartRendererHostOptions` and returns a
`ChartRendererHost`. Its host lifecycle matches `mountChart`, but `renderer`
is required and `onRender` receives a
`ChartRendererRenderContext` containing the live `ChartSurface`.

For the built-in Canvas renderer, `mountCanvasChart` from
`@tanstack/charts/canvas` removes the explicit `renderer` option and returns a
`CanvasChartHost`. Both hosts preserve the same `interaction`, `update`,
`getScene`, and `destroy` model.

### Host options

The default SVG host requires `definition` and `ariaLabel`.

| Option               | Default           | Meaning                                                                                                |
| -------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `definition`         | Required          | [Chart definition](./specifications-types.md#source-charts-docs-reference-chart-definitions-md). Its identity is the application update boundary.           |
| `ariaLabel`          | Required          | Accessible chart name placed on the SVG.                                                               |
| `ariaDescription`    | None              | Optional SVG description.                                                                              |
| `height`             | `320`             | Fixed scene height in CSS pixels.                                                                      |
| `aspectRatio`        | None              | Computes height as `width / aspectRatio` when `height` is absent and the ratio is positive and finite. |
| `width`              | Container width   | Fixed scene width. Supplying it disables resize observation.                                           |
| `initialWidth`       | `640`             | Width used when a responsive container has not produced a positive measurement.                        |
| `className`          | None              | Extra class on the rendered SVG, not the container.                                                    |
| `idPrefix`           | Empty             | Prefix for renderer-owned resource IDs. Use a unique value for resource-aware charts.                  |
| `tabIndex`           | `0`               | SVG tab index while keyboard behavior is enabled.                                                      |
| `onFocusChange`      | None              | Receives the primary focused point or `null`.                                                          |
| `onFocusGroupChange` | None              | Receives all points selected by the current focus strategy.                                            |
| `onSelect`           | None              | Receives the clicked or keyboard-activated point, or `null` for an empty click.                        |
| `onRender`           | None              | Runs after reconciliation with the container, live SVG, scene, and interaction controller.             |
| `renderSvg`          | `renderChartSvg`  | Replaces the scene-to-SVG renderer.                                                                    |
| `measureText`        | DOM font measurer | Replaces guide text measurement.                                                                       |

The definition owns these chart controls:

| Option             | Default                   | Meaning                                                                                                       |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `maxFocusDistance` | `48`                      | Maximum scene-pixel distance for default pointer focus                                                        |
| `focus`            | Nearest point             | Pointer grouping and keyboard navigation strategy; `false` disables chart-owned focus and its generated layer |
| `focusRing`        | `true`                    | Generated primary-point focus indicator; `false` keeps authored focus layers only                             |
| `cursor`           | None                      | Focus-snapped or free application-owned cursor binding                                                        |
| `spatialIndex`     | Linear nearest-point scan | Dense-data nearest-point index                                                                                |
| `svgAnimation`     | `false`                   | Keyed attribute, enter, and exit animation                                                                    |
| `pointer`          | `true`                    | Automatic pointer focus, leave, and click handling                                                            |
| `keyboard`         | `true`                    | Keyboard focus and navigation                                                                                 |
| `tooltip`          | `false`                   | Built-in DOM tooltip content, placement, layering, and pinning                                                |

Definition `keyboard: false` takes precedence over host `tabIndex`. A negative
custom tab index can keep chart keyboard behavior available for programmatic
focus without placing the chart in the normal tab order.

Interaction options are detailed in
[Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md). Renderer and animation
options are detailed in [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).

### Responsive sizing

When `width` is absent, the host reads the container's bounding width and
observes it with the container document's `ResizeObserver`.

```ts
mountChart(container, {
  definition,
  aspectRatio: 16 / 9,
  initialWidth: 720,
  ariaLabel: 'Traffic over time',
})
```

The fallback order is:

1. explicit `width`
2. positive container width
3. `initialWidth`
4. `640`

Height is explicit `height`, then a positive finite `aspectRatio`, then `320`.
The host schedules responsive relayout on the document's animation frame and
skips renders when the measured width has not changed. Resize relayout commits
immediately by default; set `svgAnimation.resize` to `true` to animate it.

The host temporarily assigns `position: relative` when the container's
computed position is static, because local DOM tooltips are absolutely
positioned inside it. Adding the `portal` extension to the tooltip options
instead places the tooltip in the browser top layer through a manual Popover,
or directly under the `ownerDocument` body as a fixed fallback, and positions
it against the viewport. `destroy` restores the previous inline position when
the host owned that change and removes its tooltip.

### Font measurement

The default DOM measurer inherits the container's computed font family, style,
stretch, weight, direction, and letter spacing. Measurements are cached. The
host clears that cache and relayouts when:

- the inherited font signature changes during `update`
- the document font set emits `loadingdone`

Pass `measureText` to own the geometry or to make browser and nonbrowser output
use the same metrics. See
[Scales, guides, and color](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md)
for the function contract.

### `ChartHost`

```ts
interface ChartHost<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  readonly interaction: ChartInteractionController<TDatum, TXValue, TYValue>
  update(options: ChartHostOptions<TDatum, TXValue, TYValue>): void
  getScene(): ChartScene<TDatum, TXValue, TYValue>
  destroy(): void
}
```

#### `interaction`

The stable interaction controller resolves client coordinates through the
current renderer presentation and can paint application-owned focus:

```ts
const position = host.interaction.clientToScene(event.clientX, event.clientY)
const target = host.interaction.resolvePointer(event.clientX, event.clientY)
host.interaction.setControlledFocus(target)

host.interaction.setControlledFocus(null)
```

A pointer resolution preserves pointer ownership across scene updates and
presentation frames. A raw point uses programmatic ownership unless `source`
is supplied explicitly.

Use definition `pointer: false` when a long-press, drag mode, or another
application gesture decides when point inspection begins. Keyboard navigation
remains enabled independently. See
[Interactions and Selections](./interaction-accessibility.md#source-charts-docs-guides-interactions-and-selections-md).

#### `update`

`update` replaces the complete option set. Keep required options in every call.
It renders synchronously when definition identity, size, accessibility,
renderer, keyboard, ID, or text measurement changes. Interaction callbacks,
tooltip formatting, focus strategy, animation settings, and the spatial index
can update without rebuilding the scene.

An interrupted animated render is canceled before the next reconciliation.
When the focused observation can be restored after a scene rebuild, focus and
grouped focus are repainted against its new coordinates.

#### `getScene`

Returns the current compiled scene. It is useful for aligned application UI,
diagnostics, or custom interaction. Treat it as immutable.

#### `destroy`

`destroy` is idempotent. It disconnects resize and font listeners, cancels
scheduled work and animation, removes interaction listeners, clears the
container, and releases an inline positioning change owned by the host. A
destroyed host ignores later updates.

### Browser ownership

The DOM host requires a live `HTMLElement` and its owning document. For static
or server rendering, compile a scene and render SVG without mounting; see
[Runtime and scene](./runtime-scales-reference.md#source-charts-docs-reference-runtime-and-scene-md) and
[Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).

<a id="source-charts-docs-reference-rendering-and-export-md"></a>

## Rendering And Export

Source: `charts:docs/reference/rendering-and-export.md`.

TanStack Charts compiles a renderer-neutral scene. The default renderer turns
that scene into accessible SVG markup; an optional Canvas renderer paints the
same scene through Canvas 2D. Both use the shared responsive, interaction,
tooltip, keyboard, and runtime host.

Use the task-oriented [Exporting guide](./production.md#source-charts-docs-guides-exporting-md) to choose
between static scene rendering, mounted SVG serialization, and raster output.

### Choose a renderer

Renderer code stays behind explicit entry points:

| Use                              | Import                                                |
| -------------------------------- | ----------------------------------------------------- |
| Default vanilla SVG host         | `mountChart` from `@tanstack/charts/dom`              |
| Vanilla Canvas host              | `mountCanvasChart` from `@tanstack/charts/canvas`     |
| Tween and spring SVG renderer    | `motion` from `@tanstack/charts/motion`               |
| Renderer-neutral host            | `mountChartRenderer` from `@tanstack/charts/renderer` |
| Default React SVG component      | `Chart` from `@tanstack/charts/react`                 |
| Default Preact SVG component     | `Chart` from `@tanstack/charts/preact`                |
| Default Vue SVG component        | `Chart` from `@tanstack/charts/vue`                   |
| Default Solid SVG component      | `Chart` from `@tanstack/charts/solid`                 |
| Default Svelte SVG component     | `Chart` from `@tanstack/charts/svelte`                |
| Default Angular SVG component    | `Chart` from `@tanstack/charts/angular`               |
| Default Lit SVG element          | `Chart` from `@tanstack/charts/lit`                   |
| Default Alpine SVG directive     | `charts` from `@tanstack/charts/alpine`               |
| React Native SVG component       | `Chart` from `@tanstack/charts/react-native`          |
| React Canvas component           | `Chart` from `@tanstack/charts/react/canvas`          |
| React custom-renderer component  | `Chart` from `@tanstack/charts/react/core`            |
| Default Octane SVG component     | `Chart` from `@tanstack/charts/octane`                |
| Octane Canvas component          | `Chart` from `@tanstack/charts/octane/canvas`         |
| Octane custom-renderer component | `Chart` from `@tanstack/charts/octane/core`           |

The default package and adapter entries do not import Canvas. Applications pay
for it only when they import a Canvas entry. Motion is likewise isolated behind
`@tanstack/charts/motion`. The `/core` adapter entries accept an explicit
`renderer` without choosing one for the application.

### React Native adapter

The React Native entry selects its native build through the package export
conditions and renders the shared scene with `react-native-svg`.

```ts
import {
  Chart,
  resolveNativePaint,
  type NativeChartRenderContext,
  type NativeChartTooltipRenderContext,
  type NativePaintContext,
  type NativePaintResolver,
} from '@tanstack/charts/react-native'
import {
  tooltip,
  type NativeChartTooltipComponent,
  type NativeChartTooltipExtension,
  type NativeChartTooltipProps,
} from '@tanstack/charts/react-native/tooltip'
```

`NativeChartRenderContext` is passed to `Chart`'s `onRender` callback.
`NativeChartTooltipRenderContext` is passed to a custom tooltip renderer.
`NativeChartTooltipProps` describes the built-in native tooltip component,
whose component and extension contracts are `NativeChartTooltipComponent` and
`NativeChartTooltipExtension`.

Use `resolveNativePaint` as the default `NativePaintResolver`. It resolves
`currentColor`, Canvas system colors, and CSS-variable fallbacks against a
`NativePaintContext`. Pass a custom resolver through `Chart` when the
application owns additional paint tokens.

### `renderChartSvg`

```ts
import { renderChartSvg } from '@tanstack/charts/svg'

const markup = renderChartSvg(scene, {
  ariaLabel: 'Weekly revenue',
  ariaDescription: 'Revenue increased through the second quarter.',
  idPrefix: 'revenue',
})
```

```ts
function renderChartSvg(
  scene: ChartScene,
  options: RenderChartSvgOptions,
): string

interface RenderChartSvgOptions {
  ariaLabel: string
  ariaDescription?: string
  className?: string
  tabIndex?: number
  idPrefix?: string
}
```

| Option            | Default  | Meaning                                               |
| ----------------- | -------- | ----------------------------------------------------- |
| `ariaLabel`       | Required | Accessible SVG name                                   |
| `ariaDescription` | None     | Escaped SVG `<desc>` content                          |
| `className`       | None     | Added after the `ts-chart` class                      |
| `tabIndex`        | `0`      | SVG tab index for direct static rendering             |
| `idPrefix`        | Empty    | Prefix passed to renderers that generate document IDs |

The SVG uses `role="img"`, `aria-roledescription="chart"`, a responsive
`width="100%"` and `height="100%"`, the scene's dimensions as its `viewBox`,
and an overflow-visible display style. A nontransparent scene background
renders as the first rect. All labels escape text and inherit the document
font.

Focus-filtered scene groups render hidden until the DOM host supplies focus
state. Data-less crosshair guides are also transient and are absent from this
static serialization because no focus or cursor state was supplied. Scene keys
become `data-ts-key` attributes for reconciliation.

### Canvas renderer

```ts
import { mountCanvasChart } from '@tanstack/charts/canvas'
import { tooltip } from '@tanstack/charts/tooltip'

const interactiveDefinition = defineChart(definition, { tooltip })

const host = mountCanvasChart(container, {
  definition: interactiveDefinition,
  ariaLabel: 'Weekly revenue',
})
```

`mountCanvasChart` has the same definition, sizing, focus, spatial-index,
keyboard, tooltip, selection, update, and destroy behavior as `mountChart`.
The renderer paints authored focus layers and crosshair guides below or above
the base scene on separate canvases, uses the browser device-pixel ratio by
default, and maps pointer coordinates back into the scene.

```ts
interface CanvasChartRendererOptions {
  pixelRatio?: number
}

interface CanvasChartSurface<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> extends ChartSurface<TDatum, TXValue, TYValue> {
  readonly element: HTMLDivElement
  readonly canvas: HTMLCanvasElement
  readonly backgroundCanvas: HTMLCanvasElement
  readonly focusUnderCanvas: HTMLCanvasElement
  readonly sceneCanvas: HTMLCanvasElement
  readonly focusCanvas: HTMLCanvasElement
}

interface CanvasChartRenderer<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> extends ChartRenderer<TDatum, TXValue, TYValue> {
  mount: (
    container: HTMLElement,
    requestRender: (force?: boolean) => void,
  ) => CanvasChartSurface<TDatum, TXValue, TYValue>
}

type CanvasChartHostOptions<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> = Omit<ChartRendererHostOptions<TDatum, TXValue, TYValue>, 'renderer'>

interface CanvasChartHost<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  update: (options: CanvasChartHostOptions<TDatum, TXValue, TYValue>) => void
  getScene: () => ChartScene<TDatum, TXValue, TYValue>
  destroy: () => void
}

function createCanvasChartRenderer<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(
  options?: CanvasChartRendererOptions,
): CanvasChartRenderer<TDatum, TXValue, TYValue>

const canvasChartRenderer: CanvasChartRenderer

function mountCanvasChart<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(
  container: HTMLElement,
  initialOptions: CanvasChartHostOptions<TDatum, TXValue, TYValue>,
  runtime?: ChartRuntime<TDatum, TXValue, TYValue>,
): CanvasChartHost<TDatum, TXValue, TYValue>
```

The surface's `element` is its accessible chart root. `canvas` is the stable
base bitmap: chart background plus ordinary scene, without transient focus.
It remains suitable for direct `toBlob()` and `toDataURL()` calls and is not
part of the live visual stack. The live stack is `backgroundCanvas`,
`focusUnderCanvas`, `sceneCanvas`, then `focusCanvas`. This lets an underlay
paint above an opaque chart background but below ordinary marks without
repainting the stable base bitmap on cursor movement.

A finite, positive `pixelRatio` fixes every backing store at that ratio. An
omitted value uses `devicePixelRatio`, then `1`; an invalid value uses `1`.

`CanvasChartHostOptions` removes the required `renderer` from the
renderer-neutral host options. The returned `CanvasChartHost` owns update,
scene access, and cleanup. Its optional runtime parameter has the same advanced
prerender-reuse contract as [`mountChart`](./rendering-composition-reference.md#source-charts-docs-reference-dom-host-md), including
runtime ownership on destroy.

Use `canvasChartRenderer` for the shared default instance. Call
`createCanvasChartRenderer` when the application needs a fixed `pixelRatio` or
an independently typed renderer instance.

The server-facing `prerender` step emits a deterministic, named chart shell
with five `aria-hidden` canvases: the hidden stable `canvas` base bitmap plus
the public `backgroundCanvas`, `focusUnderCanvas`, `sceneCanvas`, and
`focusCanvas` live layers. It does not attempt server-side pixel painting. The
browser adopts that shell, sizes the backing stores, paints the scene, and
attaches the shared interaction host. See
[SSR and Hydration](./production.md#source-charts-docs-guides-ssr-and-hydration-md).

Canvas is an escape hatch for paint-heavy SVG output, not an unbounded-data
mode. Scene compilation, channel arrays, scene nodes, and interaction points
still exist. A default nearest-point lookup remains linear unless the chart
supplies a `spatialIndex`; measure the complete pipeline and bound or aggregate
output when pixels cannot distinguish the observations.

Renderer-specific tradeoffs:

- Canvas updates raster pixels instead of retaining one DOM element per scene
  node.
- Canvas animation crossfades complete frames; SVG animation reconciles and
  interpolates keyed elements.
- Curved, polar, and geographic `path` geometry requires browser `Path2D`.
- Structured `SceneArea.polygons` render directly and do not require `Path2D`.
- Scene-node `className` values do not create styleable Canvas descendants.
- Gradients require geometry with measurable bounds.

### SVG resources

```ts
import { renderChartSvg } from '@tanstack/charts/svg'
import { renderChartSvgWithResources } from '@tanstack/charts/svg/resources'
```

`renderChartSvg` and the compatible explicit
`renderChartSvgWithResources(scene, options)` entry both:

- emit declared linear gradients in `<defs>`
- scope gradient IDs with sanitized `idPrefix`
- rewrite matching `url(#gradient-id)` paints
- emit clip paths for scene groups with `clip` bounds

Default SVG hosts and framework adapters use this behavior without a custom
`renderSvg`. Use a stable, document-unique `idPrefix`. Gradient coordinates and
stop offsets are clamped to `0..1` and emitted as percentages.

### `reconcileChartSvg`

```ts
import { reconcileChartSvg } from '@tanstack/charts/reconcile'

const cancel = reconcileChartSvg(container, nextMarkup, {
  duration: 240,
  easing: 'ease-out',
})

cancel()
```

```ts
function reconcileChartSvg(
  container: HTMLElement,
  markup: string,
  animation?: ChartAnimationOptions,
): () => void
```

The reconciler adopts a compatible existing root, matches children by
`data-ts-key`, moves retained nodes into their new order, inserts entries, and
removes exits. When a node has no explicit key, same-tag sibling order is a
fallback identity.

Without animation, changed attributes and structure commit synchronously.
With animation:

- numeric attributes with compatible string structure interpolate
- entries fade from zero opacity
- exits fade to zero and are then removed
- noninterpolable values commit immediately
- a returned cancellation function stops the current frame loop

The DOM host calls reconciliation and cancellation for you.

Custom SVG renderers that already own a keyed subtree can reconcile only that
subtree without reparsing or walking the surrounding chart:

```ts
import { reconcileChartSvgFragment } from '@tanstack/charts/reconcile'

const cancel = reconcileChartSvgFragment(currentGroup, nextGroupMarkup, {
  duration: 180,
})
```

```ts
function reconcileChartSvgFragment(
  currentRoot: SVGElement,
  markup: string,
  animation?: ChartAnimationOptions,
): () => void
```

The fragment root must keep the same namespace and element name to preserve
its identity. Otherwise the reconciler replaces it. Child keying, tweening,
and cancellation match `reconcileChartSvg`.

### Animation options

```ts
interface ChartAnimationOptions {
  duration?: number
  easing?:
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | ((progress: number) => number)
  respectReducedMotion?: boolean
  resize?: boolean
}
```

| Option                 | Default      | Meaning                                                |
| ---------------------- | ------------ | ------------------------------------------------------ |
| `duration`             | `240`        | Animation length in milliseconds, clamped to zero      |
| `easing`               | `'ease-out'` | Named built-in easing or a progress-mapping function   |
| `respectReducedMotion` | `true`       | Lets a host suppress animation for reduced-motion mode |
| `resize`               | `false`      | Animates responsive and explicit host size changes     |

On a definition, `svgAnimation: true` uses `240` milliseconds, `ease-out`, and respects
`prefers-reduced-motion: reduce`. A numeric duration is clamped to at least
zero. A custom easing receives raw progress from `0` to `1`.

`respectReducedMotion` and `resize` are definition policies enforced by the
host. Direct
`reconcileChartSvg(container, markup, animation)` calls run the supplied
animation without consulting media queries or render reasons.

Host animation begins only after the initial render. Updates without a scene
render do not start an animation; the current animation options apply to the
next reconciliation. Responsive and explicit size changes commit immediately
unless `resize: true`.

Stable mark IDs and resolved datum identities are essential for meaningful
transitions.

### SVG serialization

```ts
import { downloadChartSvg, serializeChartSvg } from '@tanstack/charts/export'

const source = serializeChartSvg(container, {
  width: 1200,
  height: 600,
  includeFocus: false,
})

downloadChartSvg(container, 'revenue.svg')
```

The subpath exports `serializeChartSvg`, `downloadChartSvg`, and the
`SerializeChartSvgOptions` type.

```ts
interface SerializeChartSvgOptions {
  width?: number
  height?: number
  includeFocus?: boolean
}
```

`target` may be the SVG or an ancestor containing `svg.ts-chart`. The serializer
clones the SVG, adds the XML namespace, removes focus-filtered scene layers
unless `includeFocus` is true, and resolves dimensions from options, then the
`viewBox`, then client dimensions.

The serializer can inline computed `color`, fill, fill opacity, font family,
font size, font weight, opacity, stroke, stroke opacity, stroke width, and
stroke dash array when they depend on inherited font, `currentColor`, or CSS
custom properties. Gradient stop color and opacity receive the same treatment.
Keep other CSS-dependent resource styling explicit until it is part of that
serialization contract.

`downloadChartSvg(target, filename?, options?)` defaults to `chart.svg` and
downloads an SVG blob through the target's document.

### Browser image export

```ts
import { downloadChartImage, renderChartImage } from '@tanstack/charts/export'

const blob = await renderChartImage(container, {
  type: 'image/webp',
  scale: 2,
  background: '#fff',
  quality: 0.9,
})

await downloadChartImage(container, 'revenue.png', {
  scale: 2,
})
```

The browser image functions are `renderChartImage` and
`downloadChartImage`.

```ts
interface RenderChartImageOptions extends SerializeChartSvgOptions {
  scale?: number
  background?: string
  type?: 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number
}
```

Despite its historical name, `RenderChartImageOptions` supports PNG, JPEG, and
WebP. `scale` defaults to `2` and is clamped to at least `0.1`. `type` defaults
to `image/png`.

Raster export requires:

- a browser document and window
- nonzero chart dimensions
- Canvas 2D
- successful browser decoding when the source is SVG

The promise rejects when any requirement fails or Canvas encoding returns no
blob. `downloadChartImage` defaults to `chart.png`; keep the filename extension
consistent with the selected MIME type.

The raster helpers accept a mounted SVG or Canvas chart root, or an ancestor
containing one. SVG is serialized, decoded, and drawn into the export canvas.
Canvas uses the stable `canvas` base bitmap directly when focus is excluded.
With `includeFocus`, it composites `backgroundCanvas`, `focusUnderCanvas`,
`sceneCanvas`, and `focusCanvas` in that order. `serializeChartSvg` and
`downloadChartSvg` remain SVG-only.

### Custom renderers

The renderer-neutral boundary consists of a renderer instance contract and
the mounted surface it returns:

```ts
interface ChartSurfaceRenderOptions extends RenderChartOptions {
  animation?: ChartAnimationOptions
}

interface ChartSurface<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  readonly renderer: ChartRenderer<TDatum, TXValue, TYValue>
  readonly element: Element
  render: (
    scene: ChartScene<TDatum, TXValue, TYValue>,
    options: ChartSurfaceRenderOptions,
  ) => void
  clientToScene?: (
    scene: ChartScene<TDatum, TXValue, TYValue>,
    clientX: number,
    clientY: number,
  ) => { x: number; y: number } | null
  getPresentationPoints?: () =>
    readonly ChartPoint<TDatum, TXValue, TYValue>[] | undefined
  subscribePresentationPoints?: (
    listener: (points: readonly ChartPoint<TDatum, TXValue, TYValue>[]) => void,
  ) => () => void
  paintFocus: (
    focus: ChartFocusState<TDatum, TXValue, TYValue> | null,
    pointer?: ChartTooltipPosition | null,
    cursor?: ChartCursorPresentation<TXValue, TYValue> | null,
  ) => ChartScene | void
  destroy: () => void
}

interface ChartRenderer<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  readonly id: string
  prerender: (
    scene: ChartScene<TDatum, TXValue, TYValue>,
    options: RenderChartOptions,
  ) => string
  mount: (
    container: HTMLElement,
    requestRender: (force?: boolean) => void,
  ) => ChartSurface<TDatum, TXValue, TYValue>
}

interface ChartRendererRenderContext<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  container: HTMLElement
  scene: ChartScene<TDatum, TXValue, TYValue>
  surface: ChartSurface<TDatum, TXValue, TYValue>
  interaction: ChartInteractionController<TDatum, TXValue, TYValue>
}
```

| Member                          | Responsibility                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `ChartRenderer.id`              | Stable renderer identifier                                                                                                     |
| `prerender()`                   | Return deterministic accessible markup for the supplied scene and render options                                               |
| `mount()`                       | Adopt or create a surface in the container and connect renderer-owned environment observers                                    |
| `ChartSurface.renderer`         | Refer to the renderer that created the surface; a different renderer object on update replaces the surface                     |
| `ChartSurface.element`          | Expose the accessible, focusable root used by shared keyboard and focus handling                                               |
| `render()`                      | Paint the complete scene and apply accessible name, class, tab index, ID prefix, and optional animation                        |
| `clientToScene()`               | Optionally convert viewport client coordinates to scene coordinates; the controller returns `null` when omitted or unavailable |
| `getPresentationPoints()`       | Expose renderer-owned point geometry while a scene transition is active                                                        |
| `subscribePresentationPoints()` | Notify the host as presentation geometry advances so focus and tooltips remain aligned                                         |
| `paintFocus()`                  | Paint or clear authored focus layers and guides, then optionally return the destination scene used for subsequent pointer hits |
| `destroy()`                     | Release renderer-owned animation, observers, listeners, and resources                                                          |

`requestRender()` asks the shared host to rebuild and repaint on its next
animation frame; ordinary requests proceed only when responsive width changed.
`requestRender(true)` forces the work when renderer state changed without a
width or chart-option change, such as device-pixel ratio or resolved theme
colors. Requests made before the same frame are coalesced.

Animated renderers can expose their current point geometry through
`getPresentationPoints()` and notify the host through
`subscribePresentationPoints()`. The host then resolves stationary pointers,
pinned tooltips, and keyboard focus against the painted positions rather than
the destination scene.

When focus activates inline mark-state geometry, return the resolved scene that
the surface paints. The host uses that destination scene for subsequent
pointer resolution while the renderer animates toward it. Returning `void`
keeps the base scene as the interaction source and remains valid for renderers
that do not resolve alternate scene geometry.

Custom surfaces can reuse the environment-safe focus lifecycle exported from
the root and `/universal` entries:

```ts
const focusedScene = resolveFocusScene(scene, focus).scene
const under = focusedSceneNodes(focusedScene, focus, 'under')
const over = focusedSceneNodes(focusedScene, focus, 'over')
```

`resolveFocusScene` materializes retargetable focus candidates under stable
keys. `focusedSceneNodes` returns the ordinary nodes for the requested paint
placement. `resolveFocusPresentation(scene, focus, pointer, cursor)` applies
that lifecycle and returns renderer-neutral `under` and `over` nodes. Paint
them in this order: `under`, the base scene, then `over`. The optional cursor
argument is the controller state projected into this surface's plot and can
drive a crosshair without datum focus. This is the same path used by the SVG,
Canvas, and React Native surfaces.

The shared host continues to own runtime updates, responsive sizing, text
measurement, focus resolution, keyboard behavior, built-in tooltips, selection,
and callbacks. `ChartRendererRenderContext` reports the live `surface` and the
stable interaction controller instead of assuming an SVG element.

Use `mountChartRenderer` from `@tanstack/charts/renderer`, or the React and
Octane `/core` entries, to mount a custom renderer. `RenderChartOptions`,
`ChartSurfaceRenderOptions`, `ChartSurface`, `ChartRenderer`,
`ChartRendererRenderContext`, `ChartRendererHostCommonOptions`,
`ChartRendererHostOptions`, and `ChartRendererHost` describe the complete
boundary.

SVG remains available as a renderer implementation:

```ts
import {
  createSvgChartRenderer,
  svgChartRenderer,
} from '@tanstack/charts/svg/renderer'
```

```ts
function createSvgChartRenderer<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(
  renderSvg?: ChartSvgRenderer<TDatum, TXValue, TYValue>,
): ChartRenderer<TDatum, TXValue, TYValue>

const svgChartRenderer: ChartRenderer
```

`createSvgChartRenderer` adapts a `ChartSvgRenderer` into a `ChartRenderer`.
Omitting the argument uses `renderChartSvg`. `svgChartRenderer` is the shared
preconfigured instance for renderer-neutral hosts that want the built-in SVG
surface.
Pass a `ChartSvgRenderer` as `renderSvg` to the compatibility SVG host or
default framework adapter when only SVG serialization needs to change. Such a
renderer should preserve:

- an SVG root discoverable by the host
- stable `data-ts-key` identities for reconciliation
- focus-filtered scene groups and data-less guides when chart-owned focus paint is
  desired
- the scene coordinate system and accessible name

See [Custom extensions](./rendering-composition-reference.md#source-charts-docs-reference-custom-extensions-md) before
replacing the shared renderer.

<a id="source-charts-docs-reference-transforms-md"></a>

## Transforms

Source: `charts:docs/reference/transforms.md`.

Transforms are ordinary functions: source rows in, typed derived data out.
They do not rewrite mark options, retain state, cache results, or own framework
reactivity.

### Functions

| Export                     | Result                                                   |
| -------------------------- | -------------------------------------------------------- |
| `fold`                     | Wide rows repeated into authored field/value pairs       |
| `groupBy`                  | Named group fields, reducer outputs, and lineage         |
| `binX`, `binY`             | Numeric intervals on one axis                            |
| `binXY`                    | Numeric cells with x and y intervals                     |
| `binTimeX`, `binTimeY`     | Calendar-aligned intervals from a supplied time interval |
| `rollingWindow`            | Flat input rows extended with rolling outputs            |
| `cumulative`               | Flat input rows extended with running outputs            |
| `rank`                     | Flat input rows extended with ranks                      |
| `normalize`                | Flat input rows extended with normalized values          |
| `select`                   | Selected original rows                                   |
| `stackRowsX`, `stackRowsY` | Flat input rows extended with stack endpoints            |
| `mosaicX`, `mosaicY`       | Two normalized proportional interval dimensions          |
| `boxRows`                  | Tukey summary and outlier rows by category               |
| `linearRegressionRowsX/Y`  | Sampled least-squares fits and confidence bounds         |
| `waterfall`                | Ordered signed contributions as cumulative intervals     |
| `quantile`                 | A reusable quantile reducer factory                      |
| `treeLayout`               | Tidy-tree node and link rows in semantic coordinates     |
| `forceLayout`              | Settled nodes, resolved links, and padded x/y domains    |

Granular entry points are:

- `@tanstack/charts/transform`
- `@tanstack/charts/transform/bin`
- `@tanstack/charts/transform/bin-time`
- `@tanstack/charts/transform/bin-xy`
- `@tanstack/charts/transform/cumulative`
- `@tanstack/charts/transform/fold`
- `@tanstack/charts/transform/group`
- `@tanstack/charts/transform/mosaic`
- `@tanstack/charts/transform/normalize`
- `@tanstack/charts/transform/rank`
- `@tanstack/charts/transform/reduce`
- `@tanstack/charts/transform/select`
- `@tanstack/charts/transform/stack`
- `@tanstack/charts/transform/waterfall`
- `@tanstack/charts/transform/rolling-window`
- `@tanstack/charts/box`
- `@tanstack/charts/regression`
- `@tanstack/charts/hierarchy/tree`
- `@tanstack/charts/network/force`

Numeric, two-dimensional, and calendar bins are separate so specialized
binning does not enlarge an ordinary histogram.

Numeric `thresholds` accepts a count, complete boundary array, or a
D3-compatible threshold callback such as `thresholdScott`.

Collection transforms use action names such as `fold`, `groupBy`,
`rollingWindow`, and `normalize`. A `*RowsX` or `*RowsY` name is reserved for
prepared rows paired with a same-named mark family, such as `boxRows` and
`linearRegressionRowsX/Y`. Reducers remain scoped to the reduce entry and use
analytical names such as `delta`.

### Fold wide rows

`fold` turns selected fields into long-form rows while preserving the other
source fields:

```ts
import { fold } from '@tanstack/charts/transform/fold'

const points = fold(rows, {
  fields: ['R90_10_1980', 'R90_10_2015'] as const,
  as: { key: 'periodField', value: 'inequality' },
})
```

Output is source-row-major, then follows authored `fields` order. Each point
retains the source row's other properties and adds `periodField`, `inequality`,
`source`, and `sourceIndexes`. Omitting `as` uses `key` and `value`. Values are
not filtered, so `null`, `undefined`, and `NaN` remain available to subsequent
transforms or application logic.

Use a literal field tuple so the output key and value remain correlated when
TypeScript narrows the key. Duplicate fields, identical output names, and the
reserved `source` or `sourceIndexes` output names throw synchronously with a
`fold:` error. Output names may replace source fields; lineage retains the
original row.

### Group fields

`by: 'region'` preserves the field name in the result. Compound groups use a
named object:

```ts
const daily = groupBy(orders, {
  by: {
    region: 'region',
    day: (datum) => utcDay.floor(datum.createdAt),
  },
  outputs: {
    revenue: { value: 'amount', reduce: 'sum' },
    orders: { reduce: 'count' },
  },
})
```

The result contains `region` and `day`, not an opaque `key` or tuple.

### Reducers

Every output names its reducer. `count` omits `value`; numeric reducers require
it. Compact built-in strings are `count`, `sum`, `mean`, `min`, and `max`.
Tree-shakeable reducer functions provide `median`, `variance`, `deviation`,
`first`, `last`, `delta`, and `ratio` without adding them to every
aggregation bundle.

Custom reducers receive one object with `values`, selected `data`, source
`indexes`, and the named `group` object. `quantile(probability)` returns a
custom reducer.

Empty `count` and `sum` results are zero. Other empty numeric results are
`NaN`. `variance` and `deviation` use the sample denominator and return `NaN`
for fewer than two finite values. If a singleton group needs a zero-width
interval, state that policy in a small authored reducer.

Numeric reducers ignore non-finite channel values, while `source`,
`sourceIndexes`, and a custom reducer's `data` still describe every input row
in the group. Filter invalid observations before `groupBy` when lineage should
contain only contributors.

### Ordering and flat rows

`rollingWindow` and `cumulative` accept `orderBy` and ascending or descending `order`.
Input order is used when `orderBy` is omitted. `rank` orders by its `value` and
supports competition, dense, and ordinal ties.

One-to-one transforms spread the input row and add named outputs:

```ts
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

There is no nested `datum.datum` path. A named output may intentionally replace
an input field; the original rows remain available through lineage. Structural
`source` and `sourceIndexes` names are reserved.

### Mosaic intervals

`mosaicY` allocates outer category totals across x, then normalizes y values
within each x category. Keep aggregation explicit so the definition shows
whether a cell represents a count or a weighted sum:

```ts
import { groupBy, mosaicY, rect } from '@tanstack/charts'

const counts = groupBy(responses, {
  by: { question: 'question', response: 'response' },
  outputs: { count: { reduce: 'count' } },
})

const cells = mosaicY(counts, {
  x: 'question',
  y: 'response',
  value: 'count',
  yOrder: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree'],
})

rect(cells, {
  x: 'x',
  x1: 'x1',
  x2: 'x2',
  y: 'y',
  y1: 'y1',
  y2: 'y2',
  color: 'yValue',
})
```

Each row retains the aggregate input fields and adds semantic `xValue` and
`yValue`, normalized centers and endpoints, the cell `value`, its outer-group
total, the grand total, and direct lineage. `mosaicX` transposes the policy:
y-category totals determine row heights and x values compose within each row.
Use `xOrder` and `yOrder` to make categorical ordering explicit. Duplicate
x/y pairs throw; aggregate them first with `groupBy`.

### Waterfall intervals

`waterfall` turns signed contributions into ordered cumulative intervals. It
does not derive the contributions themselves, so analytical intent remains
visible beside the chart:

```ts
import { barY, delta, rollingWindow } from '@tanstack/charts'
import { waterfall } from '@tanstack/charts/transform/waterfall'

const changes = rollingWindow(observations, {
  orderBy: 'year',
  size: 2,
  partial: false,
  outputs: { delta: { value: 'price', reduce: delta } },
})

const bridge = waterfall(changes, {
  value: 'delta',
  orderBy: 'year',
  total: true,
})

barY(bridge, {
  x: (row) => (row.kind === 'total' ? 'Total' : row.year),
  y1: 'start',
  y2: 'end',
  color: 'kind',
})
```

Each valid step retains the input row, adds `delta`, `start`, `end`, and an
`increase` or `decrease` kind, and carries one-row direct lineage. Zero is an
increase so it remains available to downstream policy. Nullish and nonfinite
values are omitted. A nonfinite cumulative result throws instead of emitting
invalid geometry.

`total: true` appends one zero-based `total` row for every nonempty group. The
total is a discriminated synthetic row containing only group fields, derived
fields, and aggregate direct lineage; it does not clone an arbitrary last
source row. `by`, `orderBy`, and `order` use the same first-seen grouping and
stable ordering contracts as the other eager transforms. Group output names
cannot collide with waterfall or lineage fields.

### Tidy hierarchy trees

`treeLayout` turns flat path or parent-reference rows into positioned nodes and
links. Import it from its exact optional entry:

```ts
import { treeLayout } from '@tanstack/charts/hierarchy/tree'

const hierarchy = treeLayout(rows, {
  path: 'name',
  delimiter: '.',
  orientation: 'left',
  nodeSize: [1, 1],
})
```

Use `path` and an optional one-character `delimiter` for full semantic paths.
Missing path ancestors are imputed with `data: null` and empty lineage. Use
`id` and `parentId` instead when every node is an explicit row:

```ts
const hierarchy = treeLayout(rows, {
  id: 'id',
  parentId: 'parentId',
})
```

The two input forms are mutually exclusive. IDs must be unique, every
non-root parent must exist, and the rows must form one acyclic hierarchy.
`sort` and `separation` receive immutable `TreeNodeContext` objects with
identity, raw data, depth, height, `internal`/`external` flags, and lineage. Input
order remains the child order when `sort` is omitted.

Path-mode IDs use canonical slash form and `name` is the terminal path segment.
Explicit-parent IDs are opaque, so `name` is the complete authored ID even
when it contains a slash.

Output nodes contain `id`, `parentId`, `name`, nullable `data`, `depth`,
`height`, `internal`, `external`, `x`, `y`, `source`, and `sourceIndexes`.
Each link contains stable source and target IDs, resolved endpoint nodes and
indexes, `x1`, `y1`, `x2`, `y2`, and the target node's raw-row lineage. A link
uses its target ID as its own ID because each non-root tree node has one
incoming link. Endpoint indexes are null when the corresponding path ancestor
was imputed.

`orientation` selects the root anchor: `left` is the default, with `right`,
`top`, and `bottom` also available. `nodeSize` is `[breadth, depth]` in semantic
data-space units. Normal positional scales own responsive projection, so this
eager transform does not depend on final chart bounds. It is uncached; memoize
unchanged hierarchy input with other derived data.

### Static force layouts

`forceLayout` runs a stopped D3 force simulation synchronously and returns
ordinary rows for native marks. Import it from its exact optional entry:

```ts
import { forceLayout } from '@tanstack/charts/network/force'

const graph = forceLayout(nodes, links, {
  nodeKey: 'id',
  source: 'source',
  target: 'target',
  iterations: 300,
  domainPadding: 0.2,
  forces: [
    { type: 'link', distance: 42 },
    { type: 'manyBody', strength: -120 },
    { type: 'center', x: 0, y: 0 },
    { type: 'collide', radius: 9, strength: 0.9 },
    { type: 'x', x: 0, strength: 0.03 },
    { type: 'y', y: 0, strength: 0.03 },
  ],
})
```

The built-in force descriptors are explicit and applied in authored order.
`link` accepts link-row distance and strength channels. `manyBody.strength`,
`collide.radius`, and the `x` and `y` targets and strengths accept node-row
channels. `center` coordinates and `collide.strength` are fixed values. Each
built-in force type may appear at most once.

Named custom factories accept any native D3-compatible force:

```ts
import { forceRadial } from 'd3-force'

const graph = forceLayout(nodes, links, {
  nodeKey: 'id',
  source: 'source',
  target: 'target',
  forces: [
    { type: 'manyBody', strength: -80 },
    {
      type: 'custom',
      name: 'radial',
      create: () => forceRadial(120, 0, 0).strength(0.08),
    },
  ],
})
```

`create` receives one `ForceFactoryContext` with the private mutable node and
link clones, immutable resolved endpoint-key arrays, and a `nodeKey` accessor
compatible with `d3.forceLink().id(...)`. The factory must return a D3 `Force`.
The working-clone types reserve D3's simulation fields; valid numeric node
seeds are retained, while conflicting source fields cannot leak into D3 state.
Names are nonempty and unique across custom and built-in forces. Factories may
configure or close over the private records, but must not add, remove, or
reorder them. The transform validates collection identity and final finite
coordinates.

The transform clones its inputs before D3 mutates simulation state. Output
nodes retain non-reserved source fields and add `x`, `y`, `vx`, `vy`, `source`,
and `sourceIndexes`. Output links retain their raw endpoint keys and add
resolved node references, source and target indexes, `x1`, `y1`, `x2`, `y2`,
`sourceRows`, and `sourceIndexes`. The result also contains `xDomain` and
`yDomain` for configured positional scales.

Node keys must be unique, and every link endpoint must match one. Stable input
and deterministic force factories produce repeatable static settlement. The
simulation remains stopped and ticks synchronously; a custom force does not
gain a timer or live-state ownership. The transform is eager, chart-size
independent, and uncached; memoize it with other derived data when a framework
component rebuilds unchanged input.

This API does not run a live simulation or own drag state. Products that need
continuous physics or node dragging should keep that controller and its
positions in application state, then render the current rows through normal
marks.

### Lineage

Aggregations expose `source` and `sourceIndexes`. Row-extending transforms
expose the source rows used for that derived value. This supports inspection,
tooltips, drill-down, and subsequent transforms without renderer knowledge.

Lineage is direct to the immediate input. In a `fold` → `normalize` pipeline,
the normalized row points to its folded input, and that folded row points to
the original source row. `select` returns the chosen input rows unchanged.

See [Transforms and Reactivity](./composition.md#source-charts-docs-guides-transforms-and-reactivity-md) for
composition and memoization guidance.

### Types

Value and grouping contracts are `TransformAccessor`,
`TransformAccessorContext`, `TransformField`, `TransformValue`,
`TransformValueOutput`, `TransformKey`, `TransformGroupSpec`,
`TransformGroupRow`, `TransformOrder`, `TransformOrderOptions`, and
`TransformLineage`.

Reducer contracts are `TransformNumericReducer`, `TransformReducer`,
`TransformReduceContext`, `TransformOutputSpec`, `TransformOutputs`,
`TransformOutputValue`, and `TransformOutputRow`.

Group exports are `GroupByOptions` and `GroupByDatum`. Numeric bin exports are
`BinOptions`, `BinXDatum`, and `BinYDatum`. Two-dimensional bin exports are
`BinXYOptions` and `BinXYDatum`. Calendar bin exports are `TimeIntervalLike`,
`BinTimeOptions`, and `BinTimeDatum`.

Fold exports are `FoldField`, `FoldOutputNames`, `FoldOptions`, and
`FoldDatum`.

Rolling exports are `RollingWindowOptions`, `RollingWindowDatum`, and `RollingWindowAnchor`.
Cumulative exports are `CumulativeOptions` and `CumulativeDatum`. Rank exports
are `RankOptions`, `RankDatum`, and `RankTies`.

Normalization exports are `NormalizeOptions`, `NormalizeDatum`,
`NormalizeBasis`, and `NormalizeContext`. Selection exports are
`SelectOptions`, `SelectMethod`, and `SelectContext`. Row-stack exports are
`StackRowsXOptions`, `StackRowsXDatum`, `StackRowsYOptions`, and
`StackRowsYDatum`.

Mosaic exports are `MosaicOptions`, `MosaicXDatum`, and `MosaicYDatum`.

Waterfall exports are `WaterfallKind`, `WaterfallOptions`, `WaterfallDatum`,
`WaterfallStepDatum`, and `WaterfallTotalDatum`.

Static force-layout exports are `forceLayout`, `ForceLayoutOptions`,
`ForceDescriptor`, `ForceNumericValue`, `ForceLinkDescriptor`,
`ForceManyBodyDescriptor`, `ForceCenterDescriptor`, `ForceCollideDescriptor`,
`ForceXDescriptor`, `ForceYDescriptor`, `ForceFactoryDescriptor`,
`ForceFactory`, `ForceFactoryContext`, `ForceLayoutWorkingNode`,
`ForceLayoutWorkingLink`, `ForceLayoutResult`, `ForceLayoutNode`,
`ForceLayoutLink`, and `ForceLinkLineage`.

Tidy-tree exports are `treeLayout`, `TreeOrientation`, `TreeNodeContext`,
`TreeNodeComparator`, `TreeNodeSeparation`, `TreeLayoutPathOptions`,
`TreeLayoutParentOptions`, `TreeLayoutOptions`, `TreeLayoutNode`,
`TreeLayoutLink`, and `TreeLayoutResult`.

<a id="source-charts-docs-reference-view-composition-md"></a>

## View Composition

Source: `charts:docs/reference/view-composition.md`.

Import view composition from the exact subpath:

```ts
import {
  alignX,
  alignY,
  composeViews,
  fill,
  grid,
  inset,
  layer,
  shareX,
  shareY,
  viewGrid,
} from '@tanstack/charts/view'
```

`composeViews(options)` combines named composable chart definitions into one
static chart definition. A child may be static or responsive. Responsive
builders receive the allocated child frame and the outer runtime's
`defaultTheme`. Each child retains its own marks, scales, guides, margins,
color, clipping, and static legends.

The public types are `ComposeViewsOptions`, `ViewDefinitions`, `ViewLayout`,
`ViewAnchor`, `ViewInsetOptions`, `ViewGridCell`, `ViewAxis`,
`ViewScaleLinkMode`, `ViewScaleLink`, `ViewTrack`, `ViewLink`, `ViewGridItem`,
`ViewGridOptions`, `ComposableChartDefinition`,
`ComposableStaticChartDefinition`, and
`ComposableResponsiveChartDefinition`.

### Overlay a donut summary

`fill`, `layer`, and `inset` can place a polar chart over a Cartesian chart:

```ts
import { defineChart } from '@tanstack/charts'
import { pie, polar, radialArc } from '@tanstack/charts/polar'
import { composeViews, fill, inset, layer } from '@tanstack/charts/view'

const summaryRows = [
  { status: 'Complete', count: 72 },
  { status: 'Remaining', count: 28 },
]

const slices = pie(summaryRows, { value: 'count' })
const summaryDefinition = defineChart({
  marks: [
    polar({
      inset: 8,
      marks: [
        radialArc(slices, {
          innerRadius: ({ radius }) => radius * 0.58,
          color: 'status',
          key: 'status',
        }),
      ],
    }),
  ],
  guides: false,
  margin: 0,
})

const definition = composeViews({
  views: {
    detail: scatterDefinition,
    summary: summaryDefinition,
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

`layer` resolves children in paint order, so the summary paints after the
detail chart. Every child is clipped to its resolved frame. Transparent summary
space and the donut hole add no interaction target, leaving detail geometry
behind them eligible for outer-chart focus.

An inset is relative to the complete resolved frame named by `relativeTo`, not
that child's inner plot rectangle. Its preferred width, height, and offset
shrink proportionally when the referenced frame is too small. The referenced
view must appear earlier in paint order.

### Layout primitives

- `fill(view)` gives one view all available bounds.
- `grid(options)` places views in non-overlapping named tracks.
- `layer(...layouts)` resolves layouts against the same bounds in paint order.
- `inset(view, options)` anchors a view inside an earlier resolved view frame.

Every key in `views` must be placed exactly once. Unknown, missing, and
duplicate view placements fail instead of producing a partial scene.

`grid` accepts fixed and flexible tracks:

- `{ id, size }` requests a fixed pixel size.
- `{ id, grow, min?, max? }` divides remaining space by `grow`.

Fixed sizes and minimums shrink deterministically when the host is smaller
than their preferred total. One view may occupy each row-and-column cell.

```ts
const definition = composeViews({
  views: {
    main: scatterDefinition,
    top: xHistogramDefinition,
    right: yHistogramDefinition,
  },
  layout: grid({
    rows: [
      { id: 'top', size: 72 },
      { id: 'main', grow: 1 },
    ],
    columns: [
      { id: 'main', grow: 1 },
      { id: 'right', size: 72 },
    ],
    gap: 8,
    cells: {
      main: { row: 'main', column: 'main' },
      top: { row: 'top', column: 'main' },
      right: { row: 'main', column: 'right' },
    },
  }),
  links: [shareX('top', 'main'), shareY('right', 'main')],
})
```

### Shared and aligned ranges

Scale links are separate from layout:

- `shareX(source, target)` and `shareY(source, target)` require equal resolved
  scale domains, order, direction, bandwidth, and mapping.
- `alignX(source, target)` and `alignY(source, target)` align plot endpoints
  while keeping each scale domain independent.

Linked views must have equal allocated frames along the linked axis. For
example, x-linked views must have the same frame x position and width.

Sharing does not copy or infer another view's domain. Configure the intended
domain on both child definitions so a mismatch fails visibly.

### Scene and interaction ownership

The composed definition has one chart host, accessible chart label, tooltip,
keyboard model, focus strategy, and animation lifecycle. Child points keep
their datum identity and receive stable view-prefixed keys and mark IDs. One
outer default focus layer covers every child; explicit child focus and
mark-state layers remain part of their child scenes.

Apply host options to the composed definition:

```ts
const interactiveDefinition = defineChart(definition, {
  keyboard: true,
  maxFocusDistance: 40,
})
```

Children must satisfy `ComposableChartDefinition`. Host-owned options and
resources that cannot be adopted into the outer scene are rejected by the
public type, including selection, controls, tooltips, keyboard options,
definition-level motion, gradients, and scene backgrounds. Runtime validation
still protects JavaScript and deliberately widened TypeScript values. Guide
motion is also rejected after a responsive child resolves. Mark-local motion
and static legends remain supported. Use an ordinary mark for a child
background.

Use separate chart hosts when panels need independent host behavior or
independent accessible labels.

### `viewGrid` convenience syntax

`viewGrid` remains an ergonomic wrapper for a non-overlapping grid. It lowers
to the same composition, layout, and scale-link machinery:

```ts
const definition = viewGrid({
  rows: [
    { id: 'top', size: 72 },
    { id: 'main', grow: 1 },
  ],
  columns: [{ id: 'main', grow: 1 }],
  gap: 8,
  views: [
    {
      id: 'top',
      row: 'top',
      column: 'main',
      share: { x: 'main' },
      chart: xHistogramDefinition,
    },
    {
      id: 'main',
      row: 'main',
      column: 'main',
      chart: scatterDefinition,
    },
  ],
})
```

Use `composeViews` when the layout combines grids, layers, or insets. Use
`viewGrid` when one named view per grid cell is the clearest expression.
