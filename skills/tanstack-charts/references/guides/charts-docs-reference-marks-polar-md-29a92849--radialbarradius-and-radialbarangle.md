# Polar — `radialBarRadius` and `radialBarAngle`

[Guide and prerequisites](./charts-docs-reference-marks-polar-md-29a92849.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `radialBarRadius` and `radialBarAngle`

```ts
function radialBarRadius<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialBarRadiusOptions<TDatum>,
): PolarMark<TDatum>

function radialBarAngle<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialBarAngleOptions<TDatum>,
): PolarMark<TDatum>
```

The two radial-bar marks transpose ordinary bar semantics across polar axes.
`radialBarRadius` uses an angle band and a quantitative radius interval;
`radialBarAngle` uses a radius band and a quantitative angle interval. The
categorical scale must have positive bandwidth. Configure spacing through the
D3 band scale's inner and outer padding.

| Mark              | Categorical channel             | Quantitative interval                                                   |
| ----------------- | ------------------------------- | ----------------------------------------------------------------------- |
| `radialBarRadius` | `angle`; defaults to row index  | `radius` is shorthand for `radius2`; `radius1` is the optional baseline |
| `radialBarAngle`  | `radius`; defaults to row index | `angle` is shorthand for `angle2`; `angle1` is the optional baseline    |

An omitted `radialBarRadius.radius1` starts at physical radius zero, even when
`PolarRadiusOptions.range` maps semantic zero to an inner offset. An explicit
`radius1` is mapped through the radius scale. An omitted
`radialBarAngle.angle1` is semantic zero and is mapped through the angle scale.
Use the implicit physical-center radius baseline for nonnegative magnitudes.
For signed values or true radial intervals, set `radius1: 0` (or another
semantic baseline) so both endpoints map through the configured scale.

Both marks accept `id`, `className`, `angleScale`, `radiusScale`, `key`, `z`,
`color`, `fill`, fill opacity, stroke styling, opacity, and motion.
`cornerRadius` accepts a `PolarLength` or `"full"`; the latter resolves to half
the bar's radial thickness. Each valid bar emits one geometry-backed
interaction point at its quantitative endpoint and preserves its interval
endpoints for focus and tooltip formatting.
