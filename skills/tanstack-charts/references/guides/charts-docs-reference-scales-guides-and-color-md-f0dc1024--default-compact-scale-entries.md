# Scales Guides And Color — Default compact scale entries

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@1.5.0`.

## Default compact scale entries

`@tanstack/charts` supplies five exact, tree-shakeable scale entries:

| Entry                             | Runtime export | Type contract  |
| --------------------------------- | -------------- | -------------- |
| `@tanstack/charts/scales/linear`  | `scaleLinear`  | `LinearScale`  |
| `@tanstack/charts/scales/band`    | `scaleBand`    | `BandScale`    |
| `@tanstack/charts/scales/point`   | `scalePoint`   | `PointScale`   |
| `@tanstack/charts/scales/ordinal` | `scaleOrdinal` | `OrdinalScale` |
| `@tanstack/charts/scales/time`    | `scaleUtc`     | `UtcScale`     |

`LinearScale` supports numeric two-stop domains and ranges, `invert`, `clamp`,
`ticks`, basic `tickFormat`, `nice`, and `copy`. `BandScale` supports
`padding`, `paddingInner`, `paddingOuter`, `align`, `round`, `rangeRound`,
`bandwidth`, `step`, and `copy`. `PointScale` exposes the corresponding point
operations with zero bandwidth. `OrdinalScale` supports explicit or implicit
domains, cyclic ranges, `unknown`, and `copy`.

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'

const y = {
  scale: scaleLinear().domain([0, 100]),
}
```

The factories and returned instances satisfy `ChartScaleInput` directly. They
are a documented subset, not a complete `d3-scale` compatibility claim. Use D3
for local-time or transformed domains, piecewise and nonnumeric interpolation,
and full D3 formatting semantics.

`UtcScale` supports two-stop Date domains and finite numeric ranges, elapsed-time
mapping, Date-valued `invert`, `clamp`, calendar-aware `ticks(count)`,
`tickFormat(count)`, `nice(count)`, and independent `copy`. Domain setters accept
Dates or millisecond timestamps and getters return new Dates. Invalid domains
throw without changing the scale. Invalid mapped values return `undefined`.

Ticks use UTC seconds, minutes, hours, epoch-aligned days, Sunday weeks, months,
quarters, and years. Default labels use English UTC calendar formatting.
`nice` expands both ascending and descending domains. Counts are hints, not an
exact number of ticks; nonpositive or nonfinite counts produce no ticks and
leave `nice` unchanged. Unlike D3, this compact entry does not accept interval
objects, format specifiers, locale configuration, or piecewise domains. Use a
guide formatter for application-specific labels or D3 for those scale features.

`ConfiguredScaleLike` may expose `invert(position)`. Charts copies that
capability onto `ResolvedScale.invert` after assigning the responsive range.
Final-screen layouts and interactions can then recover semantic values without
copying the authored scale. Band scales do not expose inversion.
