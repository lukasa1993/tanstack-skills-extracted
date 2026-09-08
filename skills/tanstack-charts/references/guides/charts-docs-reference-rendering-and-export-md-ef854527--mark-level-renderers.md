# Rendering And Export — Mark-level renderers

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Mark-level renderers

Built-in Cartesian, radial, and composite marks accept a `renderer` option.
Passing `canvasChartRenderer` opts that mark into Canvas while axes, guides,
and marks without the option keep the host renderer:

```ts
import { areaY, defineChart, lineY, text } from '@tanstack/charts'
import { canvasChartRenderer } from '@tanstack/charts/canvas'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleUtc } from 'd3-scale'

const definition = defineChart({
  marks: [
    areaY(denseRows, {
      x: 'time',
      y: 'value',
      renderer: canvasChartRenderer,
    }),
    lineY(summaryRows, { x: 'time', y: 'value' }),
    text(labels, { x: 'time', y: 'value', text: 'label' }),
  ],
  scales: {
    x: { scale: scaleUtc },
    y: { scale: scaleLinear },
  },
})
```

Adjacent nodes with the same renderer share a layer. Alternating renderer runs
remain in declaration order, including nested runs inside facets, composites,
and `polar`. Server output contains one accessible mixed root with
deterministic child shells, and the browser adopts those shells. Direct
`renderChartSvg(scene, options)` calls remain an explicit SVG serialization of
the complete renderer-neutral scene and do not run surface composition.

The universal mark contract stays small:

```ts
interface ChartMarkRenderer {
  readonly kind: 'chart-layer-renderer'
  readonly id: string
}

interface ChartMarkOptions {
  renderer?: ChartMarkRenderer
}
```

A renderer that mounts one DOM layer implements the complete composition
contract:

```ts
interface ChartLayerRenderer<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>
  extends ChartRenderer<TDatum, TXValue, TYValue>, ChartMarkRenderer {
  compose: (
    defaultRenderer: ChartRenderer<TDatum, TXValue, TYValue>,
  ) => ChartRenderer<TDatum, TXValue, TYValue>
}

interface UniversalChartLayerRenderer
  extends UniversalChartRenderer, ChartMarkRenderer {
  compose: (
    defaultRenderer: ChartRenderer<any, any, any>,
  ) => ChartRenderer<any, any, any>
}
```

The first non-default mark renderer supplies the compositor. The built-in
Canvas renderer can compose normal `ChartRenderer` surfaces and exposes the
result as one `ChartSurface`.

Mark motion and renderer selection are independent in the authoring API. The
built-in factories preserve both options, and `createMark` keeps motion as its
second argument and accepts the renderer as its third. The optional
`motion()` renderer consumes tween and spring policy only on layers it owns.
`canvasChartRenderer` paints the final mark scene and does not interpret that
policy. A host `svgAnimation` can still crossfade complete Canvas frames while
SVG layers reconcile keyed elements. Changing the layer renderer sequence
remounts the composition, so that structural update does not animate between
the old and new surface layout.
