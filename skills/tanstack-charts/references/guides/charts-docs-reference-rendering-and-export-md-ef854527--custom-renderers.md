# Rendering And Export — Custom renderers

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Custom renderers

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
  readonly layers?: readonly ChartSurface<TDatum, TXValue, TYValue>[]
  readonly defaultElement?: Element
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
  readonly capabilities?: ChartRendererCapabilities
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

`element` is the one accessible, interactive root. `layers`, when present,
lists child surfaces from back to front. `defaultElement` is the topmost
surface element owned by the host's default renderer. SVG-oriented
`ChartRenderContext` callbacks expose that element as `svg` and also include
the complete renderer-neutral `surface`. `ChartRendererRenderContext` exposes
the complete surface directly.

```ts
interface ChartRenderContext<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  container: HTMLElement
  svg: SVGSVGElement
  scene: ChartScene<TDatum, TXValue, TYValue>
  surface: ChartSurface<TDatum, TXValue, TYValue>
  interaction: ChartInteractionController<TDatum, TXValue, TYValue>
}
```

| Member                          | Responsibility                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `ChartRenderer.id`              | Stable renderer identifier                                                                                                     |
| `ChartRenderer.capabilities`    | Expose optional versioned services that the shared host injects into extensions                                                |
| `prerender()`                   | Return deterministic accessible markup for the supplied scene and render options                                               |
| `mount()`                       | Adopt or create a surface in the container and connect renderer-owned environment observers                                    |
| `ChartSurface.renderer`         | Refer to the renderer that created the surface; a different renderer object on update replaces the surface                     |
| `ChartSurface.element`          | Expose the accessible, focusable root used by shared keyboard and focus handling                                               |
| `ChartSurface.layers`           | Expose ordered child surfaces when this surface composes more than one renderer                                                |
| `ChartSurface.defaultElement`   | Expose the topmost element owned by the host's default renderer                                                                |
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

Renderer capabilities are structural so independently bundled package
entrypoints do not need shared object or symbol identity. A renderer can expose
`capabilities.tooltipMotion` with protocol `1`; the host creates its controller
and injects it as `ChartTooltipExtensionContext.motion`. Renderers that omit the
capability do not load or run tooltip motion code.

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
`ChartRendererCapabilities`, `ChartRendererTooltipMotionCapability`,
`ChartTooltipMotionController`, `ChartTooltipMotionSnapshot`,
`ChartRendererRenderContext`, `ChartRendererHostCommonOptions`,
`ChartRendererHostOptions`, and `ChartRendererHost` describe the complete
boundary.

Import `resolveChartRenderer` from `@tanstack/charts/renderer` when implementing
a host outside the shared adapters. The function returns the effective renderer
for prerendering or mounting a scene. It returns the default when every node
uses that renderer. Otherwise it asks the first non-default
`ChartLayerRenderer` to compose the ordered layers with the default renderer.
The shared DOM host and `createChartRendererAdapter` perform this resolution
automatically.

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

See [Custom extensions](./charts-docs-reference-custom-extensions-md-9e8eefa0.md#source-charts-docs-reference-custom-extensions-md) before
replacing the shared renderer.
