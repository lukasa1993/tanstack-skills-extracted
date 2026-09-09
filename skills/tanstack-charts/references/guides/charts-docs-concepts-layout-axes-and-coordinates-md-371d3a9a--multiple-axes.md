# Layout Axes And Coordinates — Multiple axes

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Multiple axes

Add a named scale when one coordinate system needs an independent mapping.
Declare whether it maps x or y, choose its axis side, then bind the relevant
mark to its ID:

```ts
const chart = defineChart({
  marks: [
    lineY(revenue, { x: 'date', y: 'value' }),
    lineY(margin, {
      x: 'date',
      y: 'percent',
      yScale: 'margin',
    }),
  ],
  scales: {
    x: { scale: dateScale },
    y: { scale: revenueScale, axis: { label: 'Revenue' } },
    margin: {
      channel: 'y',
      scale: marginScale,
      side: 'right',
      axis: { label: 'Margin' },
    },
  },
})
```

`xScale` and `yScale` bind marks to scale IDs, not axis IDs. Axes visualize the
scale registry entries. Multiple axes on one side stack outward and take part
in automatic margin measurement.
