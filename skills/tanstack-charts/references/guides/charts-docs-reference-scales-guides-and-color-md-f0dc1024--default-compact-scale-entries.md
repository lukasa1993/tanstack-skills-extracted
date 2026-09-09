# Scales Guides And Color — Default compact scale entries

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Default compact scale entries

`@tanstack/charts` supplies four exact, tree-shakeable scale entries:

| Entry                             | Runtime export | Type contract  |
| --------------------------------- | -------------- | -------------- |
| `@tanstack/charts/scales/linear`  | `scaleLinear`  | `LinearScale`  |
| `@tanstack/charts/scales/band`    | `scaleBand`    | `BandScale`    |
| `@tanstack/charts/scales/point`   | `scalePoint`   | `PointScale`   |
| `@tanstack/charts/scales/ordinal` | `scaleOrdinal` | `OrdinalScale` |

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
for temporal or transformed domains, piecewise and nonnumeric interpolation,
and full D3 formatting semantics.

`ConfiguredScaleLike` may expose `invert(position)`. Charts copies that
capability onto `ResolvedScale.invert` after assigning the responsive range.
Final-screen layouts and interactions can then recover semantic values without
copying the authored scale. Band scales do not expose inversion.
