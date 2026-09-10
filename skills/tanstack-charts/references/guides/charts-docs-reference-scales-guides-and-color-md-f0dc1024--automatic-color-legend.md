# Scales Guides And Color — Automatic color legend

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Automatic color legend

```ts
import { colorLegend, colorLegendItems } from '@tanstack/charts/legend'

colorLegend({
  label: 'Package',
  itemWidth: 120,
  items: colorLegendItems({
    justify: 'center',
    gap: 16,
    indicator: { shape: 'square' },
    label: { fontSize: 12 },
  }),
  width: 240,
  format: (value) => value.toFixed(0),
  placement: 'bottom',
})
```

```ts
interface ColorLegendOptions<TValue extends ChartKey = ChartKey> {
  label?: string
  itemWidth?: number
  items?: ColorLegendItems<TValue>
  width?: number
  format?: (value: number) => string
  placement?: 'top' | 'bottom'
}

declare function colorLegendItems<TValue extends ChartKey = ChartKey>(
  options?: ColorLegendItemOptions<TValue>,
): ColorLegendItems<TValue>

// Opaque presentation returned by colorLegendItems().
interface ColorLegendItems<in TValue extends ChartKey = ChartKey> {}

interface ColorLegendItemContext {
  color: string
  index: number
  label: string
}

interface ColorLegendIndicatorRenderContext extends ColorLegendItemContext {
  bounds: ChartBounds
}

type ColorLegendItemValue<TValue extends ChartKey, TResult> =
  TResult | ((value: TValue, context: ColorLegendItemContext) => TResult)

type ColorLegendIndicatorShape = 'dot' | 'square' | 'line' | 'line-dot'

interface ColorLegendItemOptions<TValue extends ChartKey = ChartKey> {
  justify?: 'start' | 'center' | 'stretch'
  gap?: number
  rowGap?: number
  indicator?: ColorLegendIndicatorOptions<TValue>
  label?: ColorLegendLabelOptions<TValue>
}

interface ColorLegendIndicatorOptions<TValue extends ChartKey = ChartKey> {
  shape?: ColorLegendItemValue<TValue, ColorLegendIndicatorShape>
  width?: number
  height?: number
  gap?: number
  render?: (
    value: TValue,
    context: ColorLegendIndicatorRenderContext,
  ) => SceneNode | readonly SceneNode[]
}

interface ColorLegendLabelOptions<TValue extends ChartKey = ChartKey> {
  format?: (value: TValue) => string
  fontSize?: number
  fontWeight?: number
  fill?: ColorLegendItemValue<TValue, string>
  fillOpacity?: number
}
```

`items` applies only to categorical scales. The default `stretch`
justification uses equal-width columns. In this mode, `itemWidth` defaults to
`110` and is clamped to a minimum of `64`. `start` and `center` instead measure
each formatted label with the chart host's configured typography, wrap compact
rows, and use `gap` between items. Invalid host measurements fall back to the
same deterministic estimator used by chart layout.

Configured items default to a `16` pixel compact-layout gap, an `8` pixel row
gap, an `8` by `8` dot with a `5` pixel label gap, `11` pixel label text, and
`String` label formatting. Measured label height reserves enough room for each
row. If an indicator is wider than its allocated item, its bounds stop at the
item edge.

`indicator.shape` selects a dot, square, line, or line with an outlined point.
`width`, `height`, and `gap` reserve the indicator box and its distance from
the label. A custom `render` callback receives the categorical value plus
`{ bounds, color, index, label }`; the built-in legend still measures, wraps,
and positions the item. Label `fill` callbacks receive the same resolved color
and formatted label. A line-dot center uses the chart background, or the host's
`Canvas` color when that background is transparent, so it remains hollow on
light and dark hosts.

An item presentation can handle the same value type as its legend or a broader
one. TypeScript rejects a narrower presentation because its callbacks could
otherwise receive a value they do not accept.

Continuous scales render a sampled ramp. Quantize, quantile, and threshold
scales render exact range bins at their resolved thresholds. `width` and the
top-level `format` configure these quantitative forms, and `items` is ignored.
`placement` defaults to `top`.

This mixed-series legend uses only the resolved color scale for labels and
paint:

```ts
type Series = 'Revenue' | 'Orders'

colorLegend({
  placement: 'bottom',
  items: colorLegendItems<Series>({
    justify: 'center',
    gap: 20,
    rowGap: 10,
    indicator: {
      width: 20,
      height: 14,
      gap: 6,
      shape: (series) => (series === 'Revenue' ? 'line-dot' : 'square'),
    },
    label: {
      fontSize: 14,
      fill: (_series, { color }) => color,
    },
  }),
})
```
