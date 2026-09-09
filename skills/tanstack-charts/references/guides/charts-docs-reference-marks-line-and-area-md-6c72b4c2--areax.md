# Line And Area — `areaX`

[Guide and prerequisites](./charts-docs-reference-marks-line-and-area-md-6c72b4c2.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## `areaX`

`areaX` is the transposed interval area: it fills between left and right
numeric x values along y.

```ts
const mark = areaX(rows, {
  y: 'category',
  x1: 'minimum',
  x2: 'maximum',
  z: 'series',
})
```

```ts
function areaX<TDatum>(
  source: Iterable<TDatum>,
  options?: AreaXOptions<TDatum>,
): ChartMark<TDatum, number, InferredY>
```

### Options

| Option        | Type                                 | Default                        | Meaning                                           |
| ------------- | ------------------------------------ | ------------------------------ | ------------------------------------------------- |
| `id`          | `string`                             | Layer-derived                  | Stable mark ID                                    |
| `x`           | `Channel<TDatum, number?>`           | Numeric datum                  | Layer thickness; implicitly stacked at each y     |
| `x1`          | `number \| Channel<TDatum, number?>` | Implicit stack start           | Explicit left boundary                            |
| `x2`          | `number \| Channel<TDatum, number?>` | Implicit stack end             | Explicit right boundary; takes precedence over x  |
| `y`           | `Channel<TDatum, ChartValue?>`       | Row index                      | Shared vertical position                          |
| `z`           | `Channel<TDatum, ChartKey?>`         | No explicit group              | Area grouping; overrides color grouping           |
| `color`       | `Channel<TDatum, ChartKey?>`         | `z`                            | Color-scale value; groups when `z` is absent      |
| `key`         | `Channel<TDatum, ChartKey>`          | Top/nested `id`, y, then index | Stable interaction identity                       |
| `fill`        | `VisualChannel<TDatum, string>`      | Resolved color                 | Final paint, evaluated from the group's first row |
| `fillOpacity` | `number`                             | `0.2`                          | Fill opacity                                      |
| `stroke`      | `VisualChannel<TDatum, string>`      | None                           | Optional boundary stroke                          |
| `strokeWidth` | `number`                             | SVG default                    | Boundary stroke width                             |
| `curve`       | `AreaXCurve`                         | Straight segments              | Optional transposed path generator                |
| `layout`      | `StackLayout`                        | Implicit diverging stack       | Configured stack order or offset                  |
| `states`      | `readonly ChartMarkState[]`          | None                           | Focus-driven presentation overrides               |

Without explicit endpoints, repeated y positions stack by series. Supplying
`x1` or `x2` opts out and preserves authored interval boundaries. Each valid
row emits one point at its right `x2`/`x` value.

Line and area paths have one paint value. When both channels are present,
`z` wins for grouping and `color` may supply a different semantic paint value.
Keep `color` constant within each explicit `z` group; the first row supplies
the path color.
