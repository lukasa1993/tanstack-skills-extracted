# Custom Extensions — Custom marks

[Guide and prerequisites](./charts-docs-reference-custom-extensions-md-9e8eefa0.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Custom marks

```ts
import { createMark } from '@tanstack/charts'
```

```ts
function createMark<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
  TXScaleId extends string = 'x',
  TYScaleId extends string = 'y',
>(
  initialize: (
    context: MarkInitializeContext,
  ) => MarkInitialization<TDatum, TXValue, TYValue>,
  motion?: ChartMotionDefinition<TDatum>,
  renderer?: ChartMarkRenderer,
): ChartMark<TDatum, TXValue, TYValue, TXValue, TYValue, TXScaleId, TYScaleId>
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

The optional third `renderer` argument is copied onto the nodes returned by
both direct `render` and resolved-layout render paths. It does not replace or
shift the motion argument. Use a stable `ChartMarkRenderer` instance so an
update can reuse its existing surface composition.

Materialized channels declare semantic values before scale resolution:

```ts
interface MaterializedChannel {
  scale?: string
  values: readonly unknown[]
  includeZero?: boolean
}
```

Use a `ChartSpec.scales` ID for a positional channel. The reserved `x` and `y`
IDs are the defaults; additional IDs select named scales. Use `scale: 'color'`
for the shared color scale, and do not reuse `color` as a positional scale ID.
Pass named position IDs through the `createMark` scale ID type parameters so
their values do not widen the reserved scale types. `includeZero` is a hint
available to a custom scale resolver. Filter invalid values before
materializing them.

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

### Final-screen mark layout

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
[Custom Marks and Renderers](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md#source-charts-docs-guides-custom-marks-and-renderers-md).

### Mark requirements

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
[Runtime and scene](./charts-docs-reference-runtime-and-scene-md-e3fcc593.md#source-charts-docs-reference-runtime-and-scene-md).
