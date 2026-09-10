# Layout Axes And Coordinates — Clipping and overflow

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Clipping and overflow

`clip: true` clips marks to `scene.chart`. Guides and legends remain outside the clip:

```ts
const chart = defineChart({
  marks,
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },

  clip: true,
})
```

Automatic margins only reserve space for chart-owned guides and legends. Application HTML overlays, external controls, and custom renderer chrome own their own layout.
