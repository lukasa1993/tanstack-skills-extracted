# Rendering And Export — Browser image export

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Browser image export

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

The raster helpers accept a mounted SVG, Canvas, or mixed chart root, or an
ancestor containing one. SVG is serialized, decoded, and drawn into the export
canvas. Canvas uses the stable `canvas` base bitmap directly when focus is
excluded. With `includeFocus`, it composites `backgroundCanvas`,
`focusUnderCanvas`, `sceneCanvas`, and `focusCanvas` in that order. Mixed roots
draw every child surface in visual order. `serializeChartSvg` and
`downloadChartSvg` reject mixed roots and remain SVG-only.
