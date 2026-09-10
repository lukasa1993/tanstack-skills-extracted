# Bar And Rect — Grouped bars

[Guide and prerequisites](./charts-docs-reference-marks-bar-and-rect-md-ba5b9a5c.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Grouped bars

Grouping is explicit:

```ts
barY(rows, {
  x: 'quarter',
  y: 'revenue',
  color: 'region',
  layout: group(),
})
```

`group()` creates a secondary band scale inside the primary categorical band.
Use `group({ padding: 0.2 })` for the common spacing control, or pass
`group({ scale })` when subgroup order is fixed application state.
`GroupOptions` is the reusable configuration shape for those `padding` and
`scale` controls.

An explicit `z` supplies subgroup identity. If `z` is omitted, a discrete
`color` channel may supply identity after grouped geometry has been selected.
When both are present, `z` controls placement and interaction grouping while
`color` remains independent. A continuous color channel cannot infer series.

The mark throws when:

- the scale has no `bandwidth` method
- a grouped row has a null effective group value
- a group value is outside the group-scale domain or maps to a nonfinite position

Repeated positions stack by default. `layout: group()` is the explicit opt-in
to side-by-side geometry.
