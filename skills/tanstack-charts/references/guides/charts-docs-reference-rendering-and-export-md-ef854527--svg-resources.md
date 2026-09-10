# Rendering And Export — SVG resources

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## SVG resources

```ts
import { renderChartSvg } from '@tanstack/charts/svg'
import { renderChartSvgWithResources } from '@tanstack/charts/svg/resources'
```

`renderChartSvg` and the compatible explicit
`renderChartSvgWithResources(scene, options)` entry both:

- emit declared linear and radial gradients in `<defs>`
- scope gradient IDs with sanitized `idPrefix`
- rewrite matching `url(#gradient-id)` paints
- emit clip paths for scene groups with `clip` bounds

Default SVG hosts and framework adapters use this behavior without a custom
`renderSvg`. Use a stable, document-unique `idPrefix`. Gradient coordinates and
stop offsets are clamped to `0..1` and emitted as percentages. A radial
gradient defaults to center `(0.5, 0.5)` and radius `0.5`; each omitted focal
coordinate inherits the matching center coordinate.

The React Native adapter emits matching `LinearGradient` and `RadialGradient`
resources through `react-native-svg`. Its `Chart` generates an `idPrefix` with
`useId()` unless the application supplies one, then scopes resource IDs and
rewrites matching paints in the same way as the web adapters.
