# Polar — `radialArc`

[Guide and prerequisites](./charts-docs-reference-marks-polar-md-29a92849.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `radialArc`

```ts
function radialArc<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialArcOptions<TDatum>,
): PolarMark<TDatum>
```

`radialArc` renders one D3 arc per valid interval.

| Option            | Meaning                                                        |
| ----------------- | -------------------------------------------------------------- |
| `id`, `className` | Stable layer ID and optional class                             |
| `startAngle`      | Start-angle channel; defaults to datum `startAngle`            |
| `endAngle`        | End-angle channel; defaults to datum `endAngle`                |
| `padAngle`        | Padding-angle channel; defaults to datum `padAngle`, then zero |
| `innerRadius`     | `PolarLength`; defaults to zero                                |
| `outerRadius`     | `PolarLength`; defaults to the layout radius                   |
| `cornerRadius`    | D3 arc corner radius as a `PolarLength`                        |
| `padRadius`       | Explicit D3 arc padding radius as a `PolarLength`              |
| `generator`       | Responsive D3 arc factory for advanced per-datum geometry      |
| `key`             | Stable arc identity; defaults to top/nested `id`, then index   |
| `z`               | Geometry and interaction group                                 |
| `color`           | Color-scale value; defaults to `z`                             |
| `fill`            | Final constant or datum-derived paint override                 |
| `fillOpacity`     | Fill opacity                                                   |
| `stroke`          | Constant or datum-derived boundary stroke                      |
| `strokeOpacity`   | Boundary opacity                                               |
| `strokeWidth`     | Boundary width                                                 |
| `strokeDasharray` | Boundary dash array                                            |
| `opacity`         | Whole-arc opacity                                              |

Each arc attaches its sampled painted boundary to its interaction point.
Default nearest focus therefore follows the visible slice, including holes,
rounded corners, reversed sweeps, and custom D3 generators, instead of using
only the centroid anchor.

Use the native `pie` transform for flat typed rows with source lineage. D3
`pie` output remains valid interoperability input because its `startAngle`,
`endAngle`, and `padAngle` fields are also the channels this mark needs. A pie,
donut, and gauge differ only in inner radius and angular interval.

`generator` replaces the default D3 arc configuration for bespoke per-datum
geometry. Its factory receives the final `PolarLayoutContext`; keep the D3
generator context `null` so it returns SVG path data. Standard hierarchy
partitioning belongs to the optional
[`sunburst`](./charts-docs-reference-marks-sunburst-md-ebf0a51e.md#source-charts-docs-reference-marks-sunburst-md) mark, which accepts flat source rows and preserves
their lineage.
