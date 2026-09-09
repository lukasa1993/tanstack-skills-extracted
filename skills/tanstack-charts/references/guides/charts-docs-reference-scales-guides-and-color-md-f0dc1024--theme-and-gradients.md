# Scales Guides And Color — Theme and gradients

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Theme and gradients

The built-in theme is described in [Chart spec](./charts-docs-reference-chart-spec-md-b8fe14b4.md#source-charts-docs-reference-chart-spec-md).
Chart gradients are independent SVG resources:

```ts
interface ChartLinearGradient {
  id: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  stops: readonly {
    offset: number
    color: string
    opacity?: number
  }[]
}
```

Coordinates and offsets are normalized from `0` to `1` by the default SVG
renderer. Omitted coordinates form a vertical gradient from bottom to top.
Use an `idPrefix` when charts share a document; see
[Rendering and export](./charts-docs-reference-rendering-and-export-md-ef854527.md#source-charts-docs-reference-rendering-and-export-md).
