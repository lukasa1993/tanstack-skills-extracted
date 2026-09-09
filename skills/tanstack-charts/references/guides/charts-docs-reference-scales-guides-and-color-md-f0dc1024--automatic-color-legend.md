# Scales Guides And Color — Automatic color legend

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Automatic color legend

```ts
import { colorLegend } from '@tanstack/charts/legend'

colorLegend({
  label: 'Package',
  itemWidth: 120,
  width: 240,
  format: (value) => value.toFixed(0),
  placement: 'bottom',
})
```

```ts
interface ColorLegendOptions {
  label?: string
  itemWidth?: number
  width?: number
  format?: (value: number) => string
  placement?: 'top' | 'bottom'
}
```

`itemWidth` defaults to `110` and is clamped to a minimum of `64`. Items wrap
to responsive columns for categorical scales. Continuous scales render a
sampled ramp. Quantize, quantile, and threshold scales render exact range bins
at their resolved thresholds. `width` and `format` configure the quantitative
forms. `placement` defaults to `top`.
