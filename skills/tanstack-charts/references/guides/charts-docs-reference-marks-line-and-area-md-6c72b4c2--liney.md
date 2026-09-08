# Line And Area — `lineY`

[Guide and prerequisites](./charts-docs-reference-marks-line-and-area-md-6c72b4c2.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## `lineY`

`lineY` connects consecutive valid rows within each path group. An explicit
`z` defines the groups. When `z` is omitted and `color` is present, `color`
defines them.

```ts
const mark = lineY(rows, {
  x: 'date',
  y: 'value',
  z: 'series',
  points: true,
})
```

```ts
function lineY<TDatum>(
  source: Iterable<TDatum>,
  options?: LineYOptions<TDatum>,
): ChartMark<TDatum, InferredX, number>
```

### Options

| Option            | Type                            | Default                        | Meaning                                        |
| ----------------- | ------------------------------- | ------------------------------ | ---------------------------------------------- |
| `id`              | `string`                        | Layer-derived                  | Stable mark ID                                 |
| `x`               | `Channel<TDatum, ChartValue?>`  | Row index                      | Horizontal value                               |
| `y`               | `Channel<TDatum, number?>`      | Numeric datum                  | Vertical value                                 |
| `z`               | `Channel<TDatum, ChartKey?>`    | No explicit group              | Path grouping; overrides color grouping        |
| `color`           | `Channel<TDatum, ChartKey?>`    | `z`                            | Color-scale value; groups when `z` is absent   |
| `key`             | `Channel<TDatum, ChartKey>`     | Top/nested `id`, x, then index | Stable interaction and scene identity          |
| `stroke`          | `VisualChannel<TDatum, string>` | Resolved color                 | Final path paint; evaluated from the first row |
| `strokeOpacity`   | `number`                        | SVG default                    | Stroke opacity                                 |
| `strokeWidth`     | `number`                        | `2.25`                         | Stroke width                                   |
| `strokeDasharray` | `string`                        | None                           | SVG dash array                                 |
| `points`          | `boolean`                       | `false`                        | Draws a radius-`2.5` dot at each valid point   |
| `curve`           | `ChartCurve`                    | Straight segments              | Optional path generator                        |
| `states`          | `readonly ChartMarkState[]`     | None                           | Focus-driven presentation overrides            |

Input order is path order. Sort rows before creating the mark when semantic x
order differs from input order. A null row flushes the current segment; later
valid rows begin a new segment in the same group.

Each valid row emits one interaction point at its scaled x/y coordinate.
`groupLabel` is the string form of the effective path group, or the mark ID
without a group.
