# Bar And Rect — `barY`

[Guide and prerequisites](./charts-docs-reference-marks-bar-and-rect-md-ba5b9a5c.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## `barY`

`barY` draws vertical bars from `y1` to `y2` at x.

```ts
const mark = barY(rows, {
  x: 'category',
  y: 'value',
})
```

```ts
function barY<TDatum>(
  source: Iterable<TDatum>,
  options?: BarYOptions<TDatum>,
): ChartMark<TDatum, InferredX, number>
```

### Options

| Option            | Type                                 | Default                        | Meaning                                          |
| ----------------- | ------------------------------------ | ------------------------------ | ------------------------------------------------ |
| `id`              | `string`                             | Layer-derived                  | Stable mark ID                                   |
| `x`               | `Channel<TDatum, ChartValue?>`       | Row index                      | Bar category or center                           |
| `y`               | `Channel<TDatum, number?>`           | Numeric datum                  | Length; implicitly stacked at each x             |
| `y1`              | `number \| Channel<TDatum, number?>` | Implicit stack start           | Explicit baseline endpoint                       |
| `y2`              | `number \| Channel<TDatum, number?>` | Implicit stack end             | Explicit value endpoint; takes precedence over y |
| `z`               | `Channel<TDatum, ChartKey?>`         | No group                       | Group identity; color fallback when omitted      |
| `color`           | `Channel<TDatum, ChartKey?>`         | `z`                            | Independent value sent to the chart color scale  |
| `key`             | `Channel<TDatum, ChartKey>`          | Top/nested `id`, x, then index | Stable scene and interaction identity            |
| `fill`            | `VisualChannel<TDatum, string>`      | Resolved `color`               | Final bar paint override                         |
| `fillOpacity`     | `number`                             | SVG default                    | Fill opacity                                     |
| `stroke`          | `VisualChannel<TDatum, string>`      | None                           | Bar outline color                                |
| `strokeOpacity`   | `number`                             | SVG default                    | Bar outline opacity                              |
| `strokeWidth`     | `number`                             | SVG default                    | Bar outline width                                |
| `strokeDasharray` | `VisualChannel<TDatum, string>`      | None                           | SVG outline dash pattern                         |
| `layout`          | `GroupLayout \| StackLayout`         | Implicit diverging stack       | Configures grouping or stack order/offset        |
| `inset`           | `number`                             | `0`                            | Pixels removed from both categorical edges       |
| `maxThickness`    | `number`                             | Unbounded                      | Maximum painted width after grouping and inset   |
| `radius`          | `number`                             | None                           | SVG rectangle corner radius                      |
| `states`          | `readonly ChartMarkState[]`          | None                           | Focus-driven presentation overrides              |

The interaction point is at the group-band center and the `y2`/`y` endpoint.
Its semantic `xValue` is x and its `yValue` is the value endpoint.
