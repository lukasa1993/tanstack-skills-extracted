# Scales Guides And Color — Gradient legend

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Gradient legend

```ts
import { colorGradientLegend } from '@tanstack/charts/legend'

colorGradientLegend({
  label: 'Density',
  steps: 48,
  width: 240,
  format: (value) => value.toFixed(1),
  placement: 'bottom',
})
```

```ts
interface ColorGradientLegendOptions {
  label?: string
  steps?: number
  width?: number
  format?: (value: number) => string
  placement?: 'top' | 'bottom'
}
```

`steps` defaults to `32` and is clamped to at least `2`. `width` defaults to
`240`, uses at least `80` when space permits, and is finally capped by the
inner chart width. The legend requires a numeric first and last color-domain
value and throws for a nonnumeric domain.
