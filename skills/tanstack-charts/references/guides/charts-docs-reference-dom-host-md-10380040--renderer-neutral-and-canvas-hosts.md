# Dom Host — Renderer-neutral and Canvas hosts

[Guide and prerequisites](./charts-docs-reference-dom-host-md-10380040.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Renderer-neutral and Canvas hosts

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
