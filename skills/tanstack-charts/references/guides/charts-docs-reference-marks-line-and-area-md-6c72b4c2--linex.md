# Line And Area — `lineX`

[Guide and prerequisites](./charts-docs-reference-marks-line-and-area-md-6c72b4c2.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `lineX`

`lineX` is the transposed line mark. It connects numeric x values along a
numeric, categorical, or temporal y channel:

```ts
const mark = lineX(rows, {
  x: 'value',
  y: 'category',
  z: 'series',
  points: true,
})
```

```ts
function lineX<TDatum>(
  source: Iterable<TDatum>,
  options?: LineXOptions<TDatum>,
): ChartMark<TDatum, number, InferredY>
```

Its options transpose `lineY`: `x` is the numeric value channel and defaults
to a numeric datum; `y` is the longitudinal `ChartValue` channel and defaults
to row index. Identity falls back to y, invalid rows create segment gaps, and
input order remains path order. Grouping, paint, points, curves, states, and
motion use the same contract. Line interaction follows y affinity so keyboard
and pointer traversal match the longitudinal axis.

`lineX` inherits these stroke-shape options from the shared line contract:

| Option     | Type                     | Default   | Meaning               |
| ---------- | ------------------------ | --------- | --------------------- |
| `lineCap`  | `SceneStyle["lineCap"]`  | `"round"` | Stroke endpoint shape |
| `lineJoin` | `SceneStyle["lineJoin"]` | `"round"` | Stroke corner shape   |
