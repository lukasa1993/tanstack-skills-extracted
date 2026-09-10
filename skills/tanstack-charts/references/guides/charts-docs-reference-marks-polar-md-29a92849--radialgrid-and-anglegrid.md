# Polar — `radialGrid` and `angleGrid`

[Guide and prerequisites](./charts-docs-reference-marks-polar-md-29a92849.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `radialGrid` and `angleGrid`

```ts
function radialGrid(options?: RadialGridOptions): PolarGuide
function angleGrid(options?: AngleGridOptions): PolarGuide
```

`radialGrid` draws radius values as circles or polygons. Its `scale` option
selects a named radius scale, and `angleScale` selects the angle scale used for
polygon rings. Supply explicit `values`, or let `ticks` request values from the
selected radius scale. Labels are off by default. Label angle, offset,
rotation, format, fill, and font size are configurable. Ring `fill` and
`fillOpacity` can layer filled circle or polygon grids behind the chart marks.

`angleGrid` draws spokes for explicit `values` or the selected angle domain.
Its `scale` option selects a named angle scale. It can show labels around the
circumference with `format` and `labelOffset`. Labels are on by default and
use the same outside-anchor rule as
`radialText({ anchor: "outside" })` unless `labelAnchor` is supplied. Both
guides accept ID, class, stroke, opacity, width, and dash styling.

Guide label position and orientation can be constants or callbacks through
`PolarGuideLabelOption`. Each callback receives a `PolarGuideLabelContext`
with the semantic `value`, `index`, angle, radius, local x/y position, and
complete layout. Use `labelAnchor`, `labelBaseline`, `labelDx`, `labelDy`, and
`labelRotate` without rebuilding the guide. `labelClassName` targets the label
group. Guides are decorative and emit no interaction points.

Every guide returns a `PolarGuideScene`:

```ts
interface PolarGuideScene {
  background: readonly SceneNode[]
  foreground?: readonly SceneNode[]
}
```

`polar` collects every guide background in declaration order, renders all
marks, then appends every optional foreground in the same guide order. The
built-in grids put rings and spokes in `background` and labels in
`foreground`, keeping labels legible without painting grid geometry over the
data.

The exported option contracts are `PolarOptions`, `PolarScales`,
`PolarPositionChannel`, `PolarPositionScaleOptions`, `RadialArcOptions`,
`RadialBarRadiusOptions`, `RadialBarAngleOptions`, `RadialLineOptions`,
`RadialAreaOptions`, `RadialDotOptions`, `RadialTextOptions`,
`RadialRuleOptions`, `RadialGridOptions`, and `AngleGridOptions`. The coordinate contracts are `PolarAngleOptions`,
`PolarRadiusOptions`, `PolarResolvedScale`, `PolarLayoutContext`,
`PolarLength`, `PolarGuideLabelContext`, `PolarGuideLabelOption`, `PolarMark`,
`PolarGuide`, and `PolarGuideScene`. `PolarMark` and `PolarGuide` annotate
built-in constructor results rather than a supported custom-extension
boundary.

See [Polar and Radar Charts](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md#source-charts-docs-examples-polar-and-radar-md) for pie,
donut, gauge, radar, radial bar, numeric line, and numeric scatter
compositions.
