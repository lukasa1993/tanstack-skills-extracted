# Bar And Rect — `cell`

[Guide and prerequisites](./charts-docs-reference-marks-bar-and-rect-md-ba5b9a5c.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## `cell`

`cell` is `rect` without explicit endpoint options:

```ts
const mark = cell(rows, {
  x: 'weekday',
  y: 'week',
  z: 'bucket',
  fillOpacity: 0.9,
})
```

```ts
type CellOptions<TDatum> = Omit<RectOptions<TDatum>, 'x1' | 'x2' | 'y1' | 'y2'>
```

Both axes normally use band scales. `cell` shares rect rendering, defaults,
focus behavior, and class names.
