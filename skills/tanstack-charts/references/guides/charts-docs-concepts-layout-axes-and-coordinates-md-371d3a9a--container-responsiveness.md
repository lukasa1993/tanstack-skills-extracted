# Layout Axes And Coordinates — Container responsiveness

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Container responsiveness

Omit `width` on the DOM host or framework adapter:

```tsx
<Chart
  definition={chart}
  height={360}
  initialWidth={640}
  ariaLabel="Monthly revenue"
/>
```

The host observes its container and coalesces width changes into an animation frame. `initialWidth` is used when a real width is not yet available and for deterministic server output.

Use `aspectRatio` when height should follow width:

```tsx
<Chart
  definition={chart}
  aspectRatio={16 / 9}
  initialWidth={640}
  ariaLabel="Monthly revenue"
/>
```

Set a fixed `width` only for an intentionally fixed graphic such as export, print, or email.

Responsive definitions receive the current `width` and `height`, so presentation can adapt to the chart container:

```ts
const chart = defineChart(({ width }) => ({
  marks: [lineY(rows, { x: 'date', y: 'value' })],
  scales: {
    x: {
      scale: xScale,
      axis: {
        ticks: { count: width < 420 ? 4 : 8 },
        tickLabels: { rotate: width < 520 ? -30 : undefined },
      },
    },
    y: {
      scale: yScale,
      axis: { label: width < 480 ? undefined : 'Weekly downloads' },
    },
  },
}))
```
