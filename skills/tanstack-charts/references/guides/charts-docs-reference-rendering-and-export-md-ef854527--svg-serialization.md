# Rendering And Export — SVG serialization

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## SVG serialization

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
