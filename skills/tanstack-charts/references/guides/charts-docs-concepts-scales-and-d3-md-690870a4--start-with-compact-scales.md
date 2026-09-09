# Scales And D3 — Start with compact scales

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Start with compact scales

Install TanStack Charts for ordinary numeric and categorical charts:

```sh
pnpm add @tanstack/charts
```

Import one exact family:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scalePoint } from '@tanstack/charts/scales/point'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
```

There is intentionally no aggregate `/scales` export. Each exact scale subpath
fits the same callable, `domain`, `range`, and `copy` contract consumed by
TanStack Charts.

The compact linear scale has numeric, two-stop domains and ranges. It supports
mapping, `invert`, `clamp`, `nice`, ticks, basic numeric tick formatting, and
copying. The categorical families support D3-compatible domain interning,
padding, alignment, rounding, bandwidth, unknown values, and copying.

Choose the smallest family that preserves the data's meaning:

| Mapping                                                    | Start with                           | Upgrade when                                                                    |
| ---------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| Numeric x or y                                             | `@tanstack/charts/scales/linear`     | The mapping needs piecewise domains, nonnumeric output, or custom interpolation |
| Categories with width, such as bars                        | `@tanstack/charts/scales/band`       | The mapping needs behavior outside the documented compact band contract         |
| Categories without width, such as line or dot positions    | `@tanstack/charts/scales/point`      | The values must instead be spaced by elapsed time                               |
| Stable categorical colors                                  | `@tanstack/charts/scales/ordinal`    | The color mapping is sequential, diverging, quantile, quantize, or threshold    |
| Dates spaced by elapsed time and calendar-aware ticks      | `d3-scale` `scaleTime` or `scaleUtc` | —                                                                               |
| Logarithmic, power, symlog, square-root, or radial mapping | The corresponding `d3-scale` family  | —                                                                               |

`scaleBand` and `scalePoint` accept `Date` values as categories. They preserve
distinct dates and first-seen order, but they do not represent elapsed time. A
Friday and the following Monday occupy adjacent categorical positions. Use
`scaleTime` or `scaleUtc` when the weekend must occupy its real temporal span or
when the axis needs calendar-aware ticks.

An axis formatter does not by itself require a larger scale. Pass
`Intl.NumberFormat`, `Intl.DateTimeFormat`, or another application formatter to
the guide. Upgrade to D3 when the scale's own tick, interpolation, or domain
semantics are required.
