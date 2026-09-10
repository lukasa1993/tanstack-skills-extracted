# Rules Links Arrows Vectors And Ticks — `tickX` and `tickY`

[Guide and prerequisites](./charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md-364694cb.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `tickX` and `tickY`

Ticks draw a short rule centered at a scaled point:

- `tickX` draws a vertical rule, so its length spans the y direction.
- `tickY` draws a horizontal rule, so its length spans the x direction.

```ts
tickX(rows, { x: 'category', y: 'value', z: 'series' })
tickY(rows, { x: 'value', y: 'category', length: 16 })
tickY(summaries, { x: 'category', y: 'median', span: 0.36 })
```

```ts
function tickX<TDatum>(
  source: Iterable<TDatum>,
  options: TickXOptions<TDatum>,
): ChartMark<TDatum, InferredX, InferredY>

function tickY<TDatum>(
  source: Iterable<TDatum>,
  options: TickYOptions<TDatum>,
): ChartMark<TDatum, InferredX, InferredY>
```

Both share:

| Option          | Type                            | Default                                      | Meaning                             |
| --------------- | ------------------------------- | -------------------------------------------- | ----------------------------------- |
| `id`            | `string`                        | Layer-derived                                | Stable mark ID                      |
| `x`, `y`        | required channels               | —                                            | Tick center                         |
| `z`             | `Channel<TDatum, ChartKey?>`    | No group                                     | Interaction group                   |
| `color`         | `Channel<TDatum, ChartKey?>`    | `z`                                          | Value sent to the chart color scale |
| `key`           | `Channel<TDatum, ChartKey>`     | Top/nested `id`, then index                  | Stable identity                     |
| `stroke`        | `VisualChannel<TDatum, string>` | Resolved color                               | Final tick paint override           |
| `strokeOpacity` | `number`                        | SVG default                                  | Stroke opacity                      |
| `strokeWidth`   | `number`                        | `1.5`                                        | Stroke width                        |
| `length`        | `number`                        | Perpendicular scale bandwidth, otherwise `6` | Total length before inset           |
| `span`          | `number`                        | None                                         | Total length in category-step units |
| `inset`         | `number`                        | `0`                                          | Pixels removed from both ends       |

Available length is clamped to at least zero after subtracting twice the inset.
`length` and `span` are mutually exclusive. `span` requires a point or band
scale on the perpendicular axis and uses the complete configured domain,
including empty category slots, to derive its step.
Each valid row emits one interaction point at the tick center.
