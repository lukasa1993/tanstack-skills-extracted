# Rendering And Export — `renderChartSvg`

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## `renderChartSvg`

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
