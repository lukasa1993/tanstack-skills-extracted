# Scales Guides And Color — Theme and gradients

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Theme and gradients

The built-in theme is described in [Chart spec](./charts-docs-reference-chart-spec-md-b8fe14b4.md#source-charts-docs-reference-chart-spec-md).
Chart gradients are renderer-neutral resources:

```ts
interface ChartGradientBase {
  id: string
  stops: readonly ChartGradientStop[]
}

interface ChartGradientStop {
  offset: number
  color: string
  opacity?: number
}

interface ChartLinearGradient extends ChartGradientBase {
  type?: 'linear'
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}

interface ChartRadialGradient extends ChartGradientBase {
  type: 'radial'
  cx?: number
  cy?: number
  r?: number
  fx?: number
  fy?: number
}

type ChartGradient = ChartLinearGradient | ChartRadialGradient
```

Coordinates and stop offsets use SVG-style `objectBoundingBox` values
normalized from `0` to `1`. Renderers clamp values to that range. Stops keep
their authored order, and an offset below the previous stop is clamped forward
to the previous offset. A linear gradient may omit `type` for compatibility.
Its omitted coordinates form a vertical gradient from bottom to top, from
`(0, 1)` to `(0, 0)`. A radial gradient requires `type: 'radial'`; `cx`, `cy`,
and `r` default to `0.5`, while omitted `fx` and `fy` independently inherit the
resolved center coordinate.

Reference either kind from a mark's `fill` or `stroke` as `url(#resource-id)`.
SVG and React Native support both kinds for fills and strokes. Canvas renders
exact `objectBoundingBox` radial fills, including the elliptical result on a
non-square shape. Canvas radial strokes are not supported because a nonuniform
bounds transform would also distort stroke width; the Canvas renderer throws
instead of painting a misleading approximation. Linear gradients continue to
support Canvas fills and strokes.

`ChartGradient`, `ChartGradientBase`, `ChartGradientStop`,
`ChartLinearGradient`, and `ChartRadialGradient` are type exports from
`@tanstack/charts`, `@tanstack/charts/universal`, and
`@tanstack/charts/types`. Use an `idPrefix` when charts share a document; see
[Rendering and export](./charts-docs-reference-rendering-and-export-md-ef854527.md#source-charts-docs-reference-rendering-and-export-md).
