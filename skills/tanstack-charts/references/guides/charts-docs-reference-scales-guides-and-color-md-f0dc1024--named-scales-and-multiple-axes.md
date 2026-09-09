# Scales Guides And Color — Named scales and multiple axes

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Named scales and multiple axes

The reserved `x` and `y` entries are the default bindings for Cartesian marks.
Add another entry when a mark needs an independent mapping, then bind that mark
with `xScale` or `yScale`:

```ts
const chart = defineChart({
  marks: [
    lineY(revenue, { x: 'date', y: 'value' }),
    lineY(conversion, {
      x: 'date',
      y: 'rate',
      yScale: 'conversion',
    }),
  ],
  scales: {
    x: { scale: scaleUtc },
    y: {
      scale: scaleLinear,
      grid: true,
      axis: { label: 'Revenue' },
    },
    conversion: {
      channel: 'y',
      scale: scaleLinear,
      side: 'right',
      axis: {
        label: 'Conversion',
        ticks: { format: (value: number) => `${Math.round(value * 100)}%` },
      },
    },
  },
})
```

<!-- ::chart-example id=70-composed-chart height=480 -->

A named scale must declare `channel: 'x'` or `channel: 'y'`. Its mark binding
must use the same channel. The ID `color` is reserved for the shared visual
color scale and cannot name a Cartesian position scale.

Every non-null scale renders an axis by default. Set `axis: false` when a
mapping should not draw another axis. X scales can use the top or bottom side,
and y scales can use the left or right side. Axes on the same side stack
outward and contribute their measured size to the automatic margin.
