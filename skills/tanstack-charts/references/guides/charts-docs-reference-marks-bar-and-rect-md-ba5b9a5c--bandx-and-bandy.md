# Bar And Rect — `bandX` and `bandY`

[Guide and prerequisites](./charts-docs-reference-marks-bar-and-rect-md-ba5b9a5c.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `bandX` and `bandY`

`bandX` paints the complete plot height at each x value. `bandY` paints the
complete plot width at each y value. They are ordinary marks used for
categorical backgrounds and focus presentation:

```ts
whenFocused(
  bandX(rows, {
    x: 'category',
    fill: '#64748b',
    fillOpacity: 0.14,
    inset: -6,
  }),
  { match: 'x' },
)
```

`BandXOptions` and `BandYOptions` provide the positional channel, `z`, `color`,
`key`, `fill`, `fillOpacity`, `inset`, and `radius`. `bandX.width` and
`bandY.height` can replace scale or inferred bandwidth with an explicit
nonnegative scene-pixel size, which is useful for a one-pixel focus cursor. A
negative inset expands the resolved band. The helpers are also available from
`@tanstack/charts/band`.
