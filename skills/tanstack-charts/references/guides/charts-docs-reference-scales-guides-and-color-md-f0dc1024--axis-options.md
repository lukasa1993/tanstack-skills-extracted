# Scales Guides And Color — Axis options

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Axis options

```ts
interface ChartPositionScaleOptions<
  TValue extends ChartValue,
> extends ChartAxisOptions<TValue> {
  channel?: 'x' | 'y'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

interface ChartGuideLineStyle {
  stroke?: string
  strokeOpacity?: number
  strokeWidth?: number
  strokeDasharray?: string
  lineCap?: 'butt' | 'round' | 'square'
}

interface ChartAxisOptions<TValue extends ChartValue> {
  scale: ChartScale | ChartScaleInput<TValue>
  nice?: boolean | number
  reverse?: boolean
  viewport?: ChartAxisViewportOptions<Extract<TValue, ChartContinuousValue>>
  grid?: boolean | ChartGuideLineStyle
  axis?:
    | false
    | {
        line?: boolean | ChartGuideLineStyle
        ticks?:
          | false
          | {
              count?: number
              spacing?: number
              values?: readonly TValue[]
              size?: number
              padding?: number
              format?: (value: TValue) => string
            }
        tickLabels?:
          | false
          | {
              rotate?: number
              fontSize?:
                | number
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => number | undefined)
              fontWeight?:
                | number
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => number | undefined)
              opacity?:
                | number
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => number | undefined)
              anchor?:
                | 'start'
                | 'middle'
                | 'end'
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => 'start' | 'middle' | 'end' | undefined)
              dx?:
                | number
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => number | undefined)
              dy?:
                | number
                | ((
                    context: ChartAxisTickLabelContext<TValue>,
                  ) => number | undefined)
              thin?:
                | boolean
                | {
                    minGap?: number
                    priority?: 'ends'
                    keep?: readonly TValue[]
                  }
            }
        label?:
          | string
          | {
              text: string
              offset?: number | 'auto'
              fontSize?: number
              fontWeight?: number
              fill?: string
              opacity?: number
              motion?: ChartMotionDefinition
            }
      }
}
```

| Option     | Default                      | Meaning                                                                  |
| ---------- | ---------------------------- | ------------------------------------------------------------------------ |
| `scale`    | Required                     | Compact or D3 factory, configured instance, or custom `ChartScale`.      |
| `nice`     | `false`                      | Nice the resolved domain using the responsive or supplied tick count.    |
| `reverse`  | `false`                      | Reverses the responsive pixel range without changing the caller's scale. |
| `viewport` | None                         | Commits a continuous semantic window and optional transient translation. |
| `grid`     | `false`                      | Draws grid rules from semantic tick candidates.                          |
| `axis`     | Inferred axis                | Axis line, tick candidates, labels, and title; `false` hides the axis.   |
| `channel`  | Inferred for `x` and `y`     | Required on named scales; selects the Cartesian channel and range.       |
| `side`     | `bottom` for x; `left` for y | Places an x axis on top/bottom or a y axis on left/right.                |

Set `grid` or `axis.line` to a `ChartGuideLineStyle` object to enable the
guide and override its stroke, opacity, width, dash pattern, or line cap.
Omitted style fields keep the normal theme defaults. An empty object is
equivalent to `true`, and `axis.line` styles only the axis baseline, not its
tick stubs. Use finite non-negative widths and opacity values from zero to one.

```ts
type ChartContinuousValue = number | Date

type ChartContinuousDomain<
  TValue extends ChartContinuousValue = ChartContinuousValue,
> =
  | (Extract<TValue, number> extends never ? never : readonly [number, number])
  | (Extract<TValue, Date> extends never ? never : readonly [Date, Date])

interface ChartAxisViewportOptions<
  TValue extends ChartContinuousValue = ChartContinuousValue,
> {
  domain: ChartContinuousDomain<TValue>
  translate?: number
}
```

`ChartContinuousDomain` keeps numeric and temporal endpoints homogeneous at
the type boundary. At runtime, a viewport requires two distinct finite values
and a configured or inferable continuous scale with `invert`, ticks, clamping
disabled, and independently configurable domain and range behavior. Band,
ordinal, quantize, clamped, and getter-only scale inputs are rejected. An
authored `axis.viewport` is also rejected for a custom `ChartScale`.
Logarithmic content and viewport domains must be finite, nonzero, and stay on
the same side of zero.

`translate` is applied in screen-direction scene pixels after semantic
mapping: positive x moves right and positive y moves down, regardless of
domain order or `reverse`. Guides remain fixed. Viewport-dependent marks are
clipped and translated per mark and per owned axis; see
[Continuous viewports](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md#source-charts-docs-concepts-layout-axes-and-coordinates-md).

Set `scales.x` or `scales.y` to `null` only when no mark uses that positional
scale. To keep the scale while hiding its axis, use `axis: false`. Grid
visibility remains independent.

Without an explicit `axis.ticks` policy, the responsive target is
`clamp(2, floor(chart.width / 92), 8)` for x and
`clamp(2, floor(chart.height / 48), 7)` for y. The configured scale may return
a different number of ticks.

`count`, `spacing`, and `values` are mutually exclusive candidate policies.
`count` is a scale hint, `spacing` derives that hint from the final axis length,
and `values` supplies exact semantic candidates. Grid lines and tick stubs use
these candidates before label thinning.

Tick labels are horizontal and collision-thinned by default. Rotation is
explicit and independent:

```ts
import { scaleUtc } from 'd3-scale'

const x = {
  scale: scaleUtc,
  axis: {
    ticks: { spacing: 80, size: 0 },
    tickLabels: {
      rotate: -35,
      thin: {
        minGap: 8,
        priority: 'ends',
        keep: [launchDate],
      },
    },
  },
}
```

`thin: false` renders every candidate label. `keep` is a hard guarantee:
kept values render even if they collide with one another. A kept value outside
the candidate set adds only a label, not a tick stub or grid line.

Tick-label presentation accepts constants or accessors. Accessors run on every
candidate before thinning and receive the semantic value, stable candidate
index, resolved center position, and resolved band width. Continuous scales
report a bandwidth of zero. Returning `undefined` preserves the normal value
for that candidate.

```ts
interface ChartAxisTickLabelContext<TValue extends ChartValue> {
  value: TValue
  index: number
  position: number
  bandwidth: number
}

const x = {
  scale: scaleBand<number>().domain(weeks),
  axis: {
    tickLabels: {
      fontSize: 13,
      opacity: 0.62,
      anchor: ({ index }) => (index === 0 ? 'start' : undefined),
      dx: ({ index, bandwidth }) => (index === 0 ? -bandwidth / 2 : undefined),
    },
  },
}
```

`anchor` defaults to an outward anchor derived from x rotation or the y-axis
side. The automatic value accounts for the host's inline direction. `dx` and
`dy` apply after the normal tick position and padding. Resolved font size,
weight, anchor, offset, opacity, and rotation all participate in collision
thinning and automatic margins. Numeric typography follows tick-label motion;
anchor changes snap.

Axis titles keep the compact string form when only text is needed. Use the
object form for title typography, paint, offset, or motion:

```ts
const y = {
  scale: scaleLinear,
  axis: {
    label: {
      text: 'Average order value (PLN)',
      fontSize: 14,
      fontWeight: 500,
      fill: '#363636',
      opacity: 0.9,
    },
  },
}
```

`fill` sets the text color. Omitted presentation fields retain the existing
title defaults: responsive 10 or 11 pixel sizing on x, 11 pixels on y, weight
600, theme foreground fill, and 0.76 fill opacity. Configured font size and
weight participate in text measurement, automatic offsets, and automatic
margins for SVG, Canvas, and native rendering.
