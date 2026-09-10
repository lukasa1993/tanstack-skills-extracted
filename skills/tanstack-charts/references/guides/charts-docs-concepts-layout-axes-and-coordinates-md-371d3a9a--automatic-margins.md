# Layout Axes And Coordinates — Automatic margins

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Automatic margins

Leave `margin` undefined for normal charts. The layout solver accounts for:

- Formatted tick-label width and height
- Rotated tick-label bounds
- First and last tick overhang
- Axis titles and their offsets
- Text-mark bounds, including anchors, pixel offsets, and rotation
- Current container font metrics
- Optional color legends

The solver may resolve scales and text-mark positions more than once, but marks
render once against the final plot rectangle. `clip: true` keeps the plot
boundary authoritative, so clipped text does not expand automatic margins.

Explicit margins lock only the sides you provide:

```ts
const chart = defineChart({
  marks,
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },

  margin: { left: 80 },
})
```

Here the left margin is exactly `80`; top, right, and bottom remain automatic.

`margin: 0` locks every side to zero:

```ts
const sparkline = defineChart({
  marks: [lineY(values)],
  guides: false,
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },

  margin: 0,
})
```

Use that combination for sparklines and intentionally chrome-free embedded graphics.
