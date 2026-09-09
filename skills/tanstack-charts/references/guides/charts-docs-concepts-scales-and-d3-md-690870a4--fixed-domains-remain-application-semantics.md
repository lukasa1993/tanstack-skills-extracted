# Scales And D3 — Fixed domains remain application semantics

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Fixed domains remain application semantics

Pass a scale instance when the domain must not follow the rendered marks:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleUtc } from 'd3-scale'

const normalizedY = {
  scale: scaleLinear().domain([0, 1]),
}

const windowedX = {
  scale: scaleUtc().domain([windowStart, windowEnd]),
}
```

Be equally deliberate with:

- Whether a log scale is valid for all values
- Whether time is local or UTC
- Which categories exist when some are filtered out
- Whether multiple facets share a domain
- Whether a color domain must remain stable across sessions

The instance rule is the same for compact and D3 scales. Use the implementation
that owns the required mapping semantics, then configure the application-owned
domain on that instance.
