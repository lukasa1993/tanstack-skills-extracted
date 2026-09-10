# Scales Guides And Color — Overview

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

Pass a compatible scale factory when its domain should come from mark channels.
Pass a scale instance when the domain is fixed application state. TanStack
Charts copies the resolved scale, assigns its responsive pixel range, and uses
that copy for marks, ticks, and interaction. A supplied instance is never
mutated.

Put positional mappings in the chart's `scales` registry. The reserved `x`
and `y` entries are the default bindings for Cartesian marks:

```ts
const scales = {
  x: { scale: scaleBand, axis: { label: 'Product' } },
  y: { scale: scaleLinear, grid: true, axis: { label: 'Revenue' } },
}
```

Start with the exact compact scale entry for numeric linear, band, point, or
ordinal mappings. Upgrade one mapping to D3 only when it needs temporal,
nonlinear, radial, interpolated, or statistical scale semantics. The
[Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md) guide owns that decision and direct
dependency guidance. This page documents the TanStack Charts contract around
both implementations.
