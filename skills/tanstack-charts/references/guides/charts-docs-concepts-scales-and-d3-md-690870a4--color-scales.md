# Scales And D3 — Color scales

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Color scales

Omitting `color.scale` uses the chart theme’s ordinal palette for categorical group values:

```ts
const chart = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value', z: 'region' })],
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },
})
```

Use a configured compact ordinal scale for semantic stability:

```ts
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'

const regionColor = scaleOrdinal(
  ['North', 'South', 'West'],
  ['#2563eb', '#f97316', '#10b981'],
)

const chart = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value', z: 'region' })],
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },

  color: {
    scale: regionColor,
    legend: colorLegend({ label: 'Region' }),
  },
})
```

The color scale is copied before use. Unlike positional scales, its range is semantic color output and remains the range you configured.

Use a factory when a custom color mapping should infer its domain:

```ts
const color = {
  scale: () => scaleOrdinal<string, string>().range(['#2563eb', '#f97316']),
}
```

Upgrade the color mapping to `d3-scale` when numeric values need sequential or
diverging interpolation, or when authored policy needs quantile, quantize, or
threshold bins. `d3-scale-chromatic` supplies optional color schemes; it is a
separate direct dependency when imported.
