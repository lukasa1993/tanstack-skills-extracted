# Rendering And Export — Canvas renderer

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Canvas renderer

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
> extends ChartLayerRenderer<TDatum, TXValue, TYValue> {
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
prerender-reuse contract as [`mountChart`](./charts-docs-reference-dom-host-md-10380040.md#source-charts-docs-reference-dom-host-md), including
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
[SSR and Hydration](./charts-docs-guides-ssr-and-hydration-md-ff83bc62.md#source-charts-docs-guides-ssr-and-hydration-md).

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
