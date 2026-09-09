# Rendering And Export — SVG resources

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## SVG resources

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
