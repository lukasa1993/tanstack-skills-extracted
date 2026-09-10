# Layout Axes And Coordinates — Scene and pointer coordinates

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Scene and pointer coordinates

Scene nodes and `ChartPoint.x` and `ChartPoint.y` use absolute scene coordinates, including the margin offset.

Application overlays can align to the plot:

```ts
const scene = host.getScene()
const overlayStyle = {
  left: `${scene.chart.x}px`,
  top: `${scene.chart.y}px`,
  width: `${scene.chart.width}px`,
  height: `${scene.chart.height}px`,
}
```

DOM pointer coordinates must first be converted into scene coordinates using
the rendered surface bounds. Chart-owned focus and the first-party brush, cursor,
and zoom behaviors do this automatically against resolved scales. A custom
gesture can use the resolved scale's optional `invert` operation.
