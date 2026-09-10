# Rules Links Arrows Vectors And Ticks — `ruleX` and `ruleY`

[Guide and prerequisites](./charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md-364694cb.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `ruleX` and `ruleY`

`ruleX` draws a vertical rule through the complete inner chart height.
`ruleY` draws a horizontal rule through the complete inner chart width.

```ts
ruleX(events, { x: 'date', stroke: '#dc2626' })
ruleY([0], { strokeOpacity: 0.7, strokeDasharray: '4 2' })
```

```ts
function ruleX<TDatum>(
  source: Iterable<TDatum>,
  options?: RuleXOptions<TDatum>,
): ChartMark<never, InferredX, never>

function ruleY<TDatum>(
  source: Iterable<TDatum>,
  options?: RuleYOptions<TDatum>,
): ChartMark<never, never, InferredY>
```

Options are orientation-specific:

| Option            | Type                            | Default                               | Meaning                             |
| ----------------- | ------------------------------- | ------------------------------------- | ----------------------------------- |
| `id`              | `string`                        | Layer-derived                         | Stable mark ID                      |
| `x`               | `Channel<TDatum, ChartValue?>`  | Datum itself when it is a chart value | `ruleX` position                    |
| `y`               | `Channel<TDatum, ChartValue?>`  | Datum itself when it is a chart value | `ruleY` position                    |
| `color`           | `Channel<TDatum, ChartKey?>`    | No value                              | Value sent to the chart color scale |
| `stroke`          | `VisualChannel<TDatum, string>` | Resolved color or theme foreground    | Final rule paint override           |
| `strokeOpacity`   | `number`                        | `0.5`                                 | Stroke opacity                      |
| `strokeWidth`     | `number`                        | SVG default                           | Stroke width                        |
| `strokeDasharray` | `string`                        | None                                  | SVG dash array                      |

Rules emit no interaction points and therefore do not participate in native
focus or tooltips. Their datum type is intentionally absent from the chart's
interaction union.
