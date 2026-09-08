# Scales Guides And Color — D3 scale upgrades

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## D3 scale upgrades

Compact and D3 scales can coexist in one chart. This definition upgrades only
its temporal x mapping:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleUtc } from 'd3-scale'

const x = { scale: scaleUtc, nice: true }
const y = { scale: scaleLinear, nice: true }
```

Use `scaleTime` or `scaleUtc` when dates need elapsed-time spacing or
calendar-aware ticks. Compact band and point scales accept `Date` categories,
but adjacent categories remain equally spaced regardless of the time between
them.

Other D3-only scale families cover logarithmic, power, symlog, square-root,
radial, sequential, diverging, quantile, quantize, and threshold mappings. D3
linear scales add piecewise domains and ranges, nonnumeric interpolation, and
custom interpolators. The factory-versus-instance and responsive-range rules
remain unchanged after an upgrade.
