# Scales Guides And Color — Color

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Color

Data-paint marks accept a semantic `color` channel. On marks that also expose
`z`, grouping remains independent and supplies the color value only when
`color` is omitted. `fill` and `stroke` are final paint overrides, so they do
not contribute to the scale or legend.

Omit `color.scale` to use the theme palette. Use the compact ordinal scale when
categories need a stable application-owned mapping:

```ts
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'

const statusColor = scaleOrdinal(
  ['healthy', 'warning', 'critical'],
  ['#16a34a', '#f59e0b', '#dc2626'],
)
```

Upgrade color to D3 for continuous interpolation or quantile, quantize, and
threshold policy.

```ts
interface ConfiguredColorScaleLike<TValue extends ChartKey, TOutput> {
  (value: TValue): TOutput
  copy: () => ConfiguredColorScaleLike<TValue, TOutput>
  domain?: () => readonly TValue[]
  range?: () => readonly TOutput[]
}

interface ChartColorOptions {
  scale?: ConfiguredColorScaleLike<any, any> | ChartColorScaleFactory<any, any>
  resolver?: ChartColorScale
  domain?: readonly ChartKey[]
  range?: readonly string[]
  nice?: boolean | number
  legend?: ChartColorLegend
}
```

| Option     | Default                 | Meaning                                                           |
| ---------- | ----------------------- | ----------------------------------------------------------------- |
| `scale`    | None                    | Compatible factory with inference or instance with a fixed domain |
| `resolver` | None                    | Custom color-scale resolver                                       |
| `domain`   | Observed channel values | Domain hint for factory, built-in, or custom resolution           |
| `range`    | See below               | Range for a factory, the built-in scale, or a custom resolver     |
| `nice`     | `false`                 | Nice a factory or configured continuous color scale               |
| `legend`   | None                    | Legend layout and scene renderer shown above the inner chart      |

Resolution order:

1. `color.scale`, created or copied before use
2. custom `color.resolver`
3. the built-in ordinal scale using `domain` or observed channel values and
   `range` or the theme palette

A color-scale factory is classified by its capabilities:

- ordinal factories infer first-seen distinct values;
- continuous and quantize factories infer the finite extent;
- quantile factories receive the complete numeric population;
- threshold factories require an explicit domain of authored cuts.

The theme palette is the range default only for the built-in ordinal scale.
A D3 factory must receive `color.range` or return a scale already configured
with a non-empty string range or interpolator; bare D3 factories retain
numeric or empty defaults that are not valid paint. Multi-stop continuous
ranges receive evenly spaced domain stops across the extent. A supplied scale
instance retains its domain and range. Outputs are converted to strings. A
custom `ChartColorScale` receives observed values, optional domain and range,
and the resolved theme, then returns:

```ts
interface ResolvedColorScale {
  type: string
  kind?: 'categorical' | 'continuous' | 'quantile' | 'quantize' | 'threshold'
  domain: readonly ChartKey[]
  range: readonly string[]
  thresholds?: readonly number[]
  map(value: ChartKey | null | undefined): string
}
```

`ChartKey` is `string | number`. On the built-in and configured-scale paths, a
null color value maps to the first range color or `currentColor`. A custom
`ChartColorScale` owns its null mapping through `ResolvedColorScale.map`. A
custom stepped scale supplies exact interior legend boundaries with
`thresholds`; D3 quantile, quantize, and threshold scales derive them
automatically.
