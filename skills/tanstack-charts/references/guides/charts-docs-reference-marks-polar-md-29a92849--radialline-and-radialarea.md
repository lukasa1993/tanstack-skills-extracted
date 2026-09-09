# Polar — `radialLine` and `radialArea`

[Guide and prerequisites](./charts-docs-reference-marks-polar-md-29a92849.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## `radialLine` and `radialArea`

```ts
function radialLine<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialLineOptions<TDatum>,
): PolarMark<TDatum>

function radialArea<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialAreaOptions<TDatum>,
): PolarMark<TDatum>
```

Both marks use `angle` and `radius` channels and accept `id`, `className`,
`angleScale`, `radiusScale`, `key`, `z`, `color`, and a D3 curve factory. The
channels default to row index and a numeric datum. `color` contributes to the
chart color scale and defaults to `z`. When `z` is omitted, an authored
`color` also partitions the paths. When both are present, `z` remains the
explicit geometry and interaction group. `radialLine` accepts final stroke,
dash, opacity, and optional `points` styling. `radialArea` accepts final fill
and stroke styling plus `radius1` for an explicit inner scale value; `radius1`
defaults to zero.

Their datum key defaults to a unique top-level or nested `data.id`, then a
unique angle within each effective path group, then row index.

Input order is path order. Use a closed D3 curve such as
`curveLinearClosed` for radar polygons. An explicit `z`, or `color` when `z`
is absent, creates one path per group. `radialArea` can carry its own stroke;
layer a closed `radialLine` only when the outline needs independent styling.
