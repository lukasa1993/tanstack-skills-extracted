# Scales Guides And Color — Fixed domains

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Fixed domains

Pass a scale instance when the domain is semantic application state:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'

const y = {
  scale: scaleLinear().domain([0, 100]),
}
```

Instances retain:

- their semantic domain
- continuous, temporal, logarithmic, ordinal, or band mapping behavior
- tick generation and default tick formatting
- clamping, unknown values, interpolation, and padding configured by the caller

TanStack Charts owns:

- factory-domain inference
- the responsive pixel range
- y-range orientation and optional axis reversal
- centering values within a band
- guide placement, label measurement, and margins

Scale copies make one configured scale safe to reuse across responsive scenes.
