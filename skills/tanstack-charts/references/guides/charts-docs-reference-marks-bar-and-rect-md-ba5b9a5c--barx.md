# Bar And Rect — `barX`

[Guide and prerequisites](./charts-docs-reference-marks-bar-and-rect-md-ba5b9a5c.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `barX`

`barX` draws horizontal bars from `x1` to `x2` at y.

```ts
const mark = barX(rows, {
  x: 'value',
  y: 'category',
})
```

```ts
function barX<TDatum>(
  source: Iterable<TDatum>,
  options?: BarXOptions<TDatum>,
): ChartMark<TDatum, number, InferredY>
```

Its options transpose `barY`:

| Option         | Type                                 | Default                        | Meaning                                     |
| -------------- | ------------------------------------ | ------------------------------ | ------------------------------------------- |
| `id`           | `string`                             | Layer-derived                  | Stable mark ID                              |
| `x`            | `Channel<TDatum, number?>`           | Numeric datum                  | Length; implicitly stacked at each y        |
| `x1`           | `number \| Channel<TDatum, number?>` | Implicit stack start           | Explicit baseline endpoint                  |
| `x2`           | `number \| Channel<TDatum, number?>` | Implicit stack end             | Explicit value endpoint; takes precedence   |
| `y`            | `Channel<TDatum, ChartValue?>`       | Row index                      | Bar category or center                      |
| `z`            | `Channel<TDatum, ChartKey?>`         | No group                       | Group identity; color fallback when omitted |
| `color`        | `Channel<TDatum, ChartKey?>`         | `z`                            | Independent color-scale value               |
| `key`          | `Channel<TDatum, ChartKey>`          | Top/nested `id`, y, then index | Stable identity                             |
| `fill`         | `VisualChannel<TDatum, string>`      | Resolved `color`               | Final bar paint override                    |
| `fillOpacity`  | `number`                             | SVG default                    | Fill opacity                                |
| `layout`       | `GroupLayout \| StackLayout`         | Implicit diverging stack       | Configures grouping or stack order/offset   |
| `inset`        | `number`                             | `0`                            | Pixels removed from both categorical edges  |
| `maxThickness` | `number`                             | Unbounded                      | Maximum painted height after grouping/inset |
| `radius`       | `BarRadius<TDatum>`                  | None                           | Uniform, physical, or semantic end radii    |
| `states`       | `readonly ChartMarkState[]`          | None                           | Focus-driven presentation overrides         |

The interaction point is at the `x2`/`x` endpoint and group-band center.
