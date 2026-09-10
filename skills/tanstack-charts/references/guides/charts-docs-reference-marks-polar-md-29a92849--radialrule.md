# Polar — `radialRule`

[Guide and prerequisites](./charts-docs-reference-marks-polar-md-29a92849.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `radialRule`

```ts
function radialRule<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialRuleOptions<TDatum>,
): PolarMark
```

`radialRule` emits one radial segment per datum. `angle`, `radius1`, and
`radius2` are scale values; `radius1` defaults to zero. The mark also accepts
`radius1Offset` and `radius2Offset` as signed constant or per-datum pixel
visual channels applied after the corresponding semantic radius is mapped.
Offsets never contribute to radius-domain inference. A nonfinite resolved
endpoint offset omits that segment. The mark also accepts `angleScale`,
`radiusScale`, `key`, `z`, `color`, stroke, opacity, width, and dash styling.
It covers gauge needles, ticks, and pie-label leaders without expanding one
logical segment into two path rows. Rules remain decorative and emit no
interaction points. Its key defaults to a unique top-level or nested
`data.id`, then a unique angle within each `z` group, then row index.

Pixel offsets do not reserve space outside the polar radius. Use
`radiusRatio`, `inset`, or chart margins when labels or leaders must remain
inside the chart surface.
