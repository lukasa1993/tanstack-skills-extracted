# Polar — `radialDot`

[Guide and prerequisites](./charts-docs-reference-marks-polar-md-29a92849.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## `radialDot`

```ts
function radialDot<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialDotOptions<TDatum>,
): PolarMark<TDatum>
```

`radialDot` uses the same angle/radius channel defaults. It also accepts `id`,
`className`, `angleScale`, `radiusScale`, `key`, `z`, `color`, `r`, `rScale`,
fill, stroke, and opacity styling. Radius defaults to 3.5 pixels. Each valid
datum emits one interaction point with its original angle/radius values and
projected screen position. Its key defaults to a unique top-level or nested
`data.id`, then row index.
