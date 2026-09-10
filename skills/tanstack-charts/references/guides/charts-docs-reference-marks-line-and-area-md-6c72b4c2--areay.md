# Line And Area — `areaY`

[Guide and prerequisites](./charts-docs-reference-marks-line-and-area-md-6c72b4c2.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `areaY`

`areaY` fills between a numeric upper channel and a numeric lower baseline
along x.

```ts
const mark = areaY(rows, {
  x: 'date',
  y1: 'low',
  y2: 'high',
  z: 'series',
})
```

```ts
function areaY<TDatum>(
  source: Iterable<TDatum>,
  options?: AreaYOptions<TDatum>,
): ChartMark<TDatum, InferredX, number>
```

### Options

| Option        | Type                                 | Default                        | Meaning                                                        |
| ------------- | ------------------------------------ | ------------------------------ | -------------------------------------------------------------- |
| `id`          | `string`                             | Layer-derived                  | Stable mark ID                                                 |
| `x`           | `Channel<TDatum, ChartValue?>`       | Row index                      | Shared horizontal position                                     |
| `y`           | `Channel<TDatum, number?>`           | Numeric datum                  | Layer thickness; implicitly stacked at each x                  |
| `y1`          | `number \| Channel<TDatum, number?>` | Implicit stack start           | Explicit lower boundary                                        |
| `y2`          | `number \| Channel<TDatum, number?>` | Implicit stack end             | Explicit upper boundary; takes precedence over y               |
| `z`           | `Channel<TDatum, ChartKey?>`         | No explicit group              | Area grouping; overrides color grouping                        |
| `color`       | `Channel<TDatum, ChartKey?>`         | `z`                            | Color-scale value; groups when `z` is absent                   |
| `key`         | `Channel<TDatum, ChartKey>`          | Top/nested `id`, x, then index | Stable interaction identity                                    |
| `fill`        | `VisualChannel<TDatum, string>`      | Resolved color                 | Final area paint; evaluated from the group's first row         |
| `fillOpacity` | `number`                             | `0.2`                          | Fill opacity                                                   |
| `stroke`      | `VisualChannel<TDatum, string>`      | None                           | Optional boundary stroke, evaluated from the group's first row |
| `strokeWidth` | `number`                             | SVG default                    | Boundary stroke width                                          |
| `curve`       | `ChartCurve`                         | Straight segments              | Optional path generator                                        |
| `layout`      | `StackLayout`                        | Implicit diverging stack       | Configured stack order or offset                               |
| `states`      | `readonly ChartMarkState[]`          | None                           | Focus-driven presentation overrides                            |

Without explicit endpoints, repeated x positions stack by series. `z` defines
series; a discrete `color` channel may infer it when `z` is absent. Use
`layout: stack(options)` for explicit order, reversal, normalization,
centering, or wiggle offset. Supplying `y1` or `y2` opts out and preserves
authored interval boundaries.

Use `order: 'inside-out'` with `offset: 'wiggle'` for nonnegative
streamgraphs. Inside-out order follows series peaks and totals. The completed
wiggle stack is translated once so the global minimum start is zero; individual
positions are not rebased. Positions and series retain first-seen order, and a
missing position/series pair contributes zero to layout without emitting a
synthetic point.

Input order and null-gap behavior match the line marks. Each valid row emits
one point at the upper `y2`/`y` value, not at the lower baseline.
