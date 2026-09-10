# Scales And D3 — Responsive ranges belong to TanStack Charts

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Responsive ranges belong to TanStack Charts

Do not assign pixel ranges to positional scales used by the chart:

```ts
const xScale = scaleUtc
const yScale = scaleLinear
```

For each scene, TanStack Charts:

1. Creates a factory scale or copies a configured instance.
2. Calculates the plot rectangle after guide measurement.
3. Assigns the current responsive pixel range to the copy.
4. Uses the copy for marks, ticks, grids, and interaction points.

The source scale is never mutated. This makes one module-level definition safe across container resizes, server rendering, multiple mounted hosts, and facets.

The `reverse` axis option reverses the responsive range without changing the domain:

```ts
const y = {
  scale: scaleLinear,
  reverse: true,
}
```
