# Layout Axes And Coordinates — Surface, margin, and plot rectangle

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Surface, margin, and plot rectangle

Every scene has three nested regions:

```text
surface: scene.width × scene.height
└─ automatic or explicit margins
   └─ plot rectangle: scene.chart
```

`scene.chart` contains:

```ts
interface ChartBounds {
  x: number
  y: number
  width: number
  height: number
}
```

Marks, grids, clipping, pointer focus, and copied scale ranges use this resolved plot rectangle.
