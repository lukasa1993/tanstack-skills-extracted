# Bar And Rect — `rect`

[Guide and prerequisites](./charts-docs-reference-marks-bar-and-rect-md-ba5b9a5c.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## `rect`

`rect` draws one independent x/y interval per valid row:

```ts
const mark = rect(events, {
  x1: 'start',
  x2: 'end',
  y: 'lane',
  z: 'status',
})
```

```ts
function rect<TDatum>(
  source: Iterable<TDatum>,
  options: RectOptions<TDatum>,
): ChartMark<
  TDatum,
  InferredPointX,
  InferredPointY,
  InferredScaleX,
  InferredScaleY
>
```

### Options

| Option        | Type                           | Default                                | Meaning                                              |
| ------------- | ------------------------------ | -------------------------------------- | ---------------------------------------------------- |
| `id`          | `string`                       | Layer-derived                          | Stable mark ID                                       |
| `x`           | `Channel<TDatum, ChartValue?>` | Row index                              | X center/category and preferred semantic focus value |
| `x1`          | `Channel<TDatum, ChartValue?>` | `x`, or row index when x is absent     | First x endpoint                                     |
| `x2`          | `Channel<TDatum, ChartValue?>` | `x`                                    | Second x endpoint                                    |
| `y`           | `Channel<TDatum, ChartValue?>` | Numeric datum                          | Y center/category and preferred semantic focus value |
| `y1`          | `Channel<TDatum, ChartValue?>` | `y`                                    | First y endpoint                                     |
| `y2`          | `Channel<TDatum, ChartValue?>` | `y`                                    | Second y endpoint                                    |
| `z`           | `Channel<TDatum, ChartKey?>`   | No group                               | Interaction group                                    |
| `color`       | `Channel<TDatum, ChartKey?>`   | `z`                                    | Value sent to the chart color scale                  |
| `key`         | `Channel<TDatum, ChartKey>`    | Top/nested `id`, x/y tuple, then index | Stable identity                                      |
| `fill`        | `string`                       | Resolved color                         | Final constant fill override                         |
| `fillOpacity` | `number`                       | SVG default                            | Fill opacity                                         |
| `stroke`      | `string`                       | None                                   | Constant stroke                                      |
| `strokeWidth` | `number`                       | SVG default                            | Stroke width                                         |
| `inset`       | `number`                       | `0.75`                                 | Pixels removed from all four edges                   |
| `radius`      | `number`                       | None                                   | Corner radius                                        |
| `states`      | `readonly ChartMarkState[]`    | None                                   | Focus-driven presentation overrides                  |

Both endpoints must be valid chart values. Endpoint order may be reversed.

When two semantic endpoints are equal and the resolved scale has bandwidth,
the rect spans that complete band. Otherwise it spans the mapped endpoint
distance. This lets `x: 'column', y: 'row'` create a heatmap cell without
manually deriving boundaries.

The interaction coordinate is the geometric center before inset. Semantic
point values use a valid `x` and `y`. An omitted `x` defaults to the row index;
an invalid x falls back to `x2`. An omitted or invalid y falls back to `y2`
unless the datum itself is numeric. Scale typing still includes all interval
endpoints, so a heterogeneous interval remains honest without widening
interaction callbacks unnecessarily.
