# Custom Extensions — Curves

[Guide and prerequisites](./charts-docs-reference-custom-extensions-md-9e8eefa0.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Curves

`ChartCurve` supplies precomputed path data for line and y-oriented area marks:

```ts
interface ChartCurve {
  line(points: readonly (readonly [number, number])[]): string
  area(
    top: readonly (readonly [number, number])[],
    bottom: readonly (readonly [number, number])[],
  ): string
}
```

`AreaXCurve` has the transposed contract:

```ts
interface AreaXCurve {
  areaX(
    right: readonly (readonly [number, number])[],
    left: readonly (readonly [number, number])[],
  ): string
}
```

The optional bridges `d3Curve` from `@tanstack/charts/d3/shape` and
`d3AreaXCurve` from `@tanstack/charts/d3/area-x` adapt a supplied curve factory
to these contracts. D3 module ownership and granular imports are documented in
[Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md).
