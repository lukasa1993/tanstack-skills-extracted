# Rules Links Arrows Vectors And Ticks — `link`

[Guide and prerequisites](./charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md-364694cb.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## `link`

`link` draws one independent segment per row. It is appropriate for networks,
slopegraphs, error intervals, and annotations. Use `lineY` when consecutive
rows form one path.

```ts
link(edges, {
  x1: 'sourceX',
  y1: 'sourceY',
  x2: 'targetX',
  y2: 'targetY',
  z: 'kind',
  strokeWidth: (edge) => edge.weight,
  lineCap: 'butt',
})
```

```ts
function link<TDatum>(
  source: Iterable<TDatum>,
  options: LinkOptions<TDatum>,
): ChartMark<TDatum, InferredEndpointX, InferredEndpointY>
```

| Option            | Type                            | Default                | Meaning                             |
| ----------------- | ------------------------------- | ---------------------- | ----------------------------------- |
| `id`              | `string`                        | Layer-derived          | Stable mark ID                      |
| `x1`, `y1`        | required channels               | —                      | First endpoint                      |
| `x2`, `y2`        | required channels               | —                      | Second endpoint                     |
| `z`               | `Channel<TDatum, ChartKey?>`    | No group               | Interaction group                   |
| `color`           | `Channel<TDatum, ChartKey?>`    | `z`                    | Value sent to the chart color scale |
| `key`             | `Channel<TDatum, ChartKey>`     | Top/nested `id`, index | Stable identity                     |
| `stroke`          | `VisualChannel<TDatum, string>` | Resolved color         | Final segment paint override        |
| `strokeOpacity`   | `VisualChannel<TDatum, number>` | SVG default            | Stroke opacity                      |
| `strokeWidth`     | `VisualChannel<TDatum, number>` | `1.5`                  | Stroke width                        |
| `strokeDasharray` | `string`                        | None                   | SVG dash array                      |
| `lineCap`         | `"butt" \| "round" \| "square"` | `"round"`              | Stroke cap                          |
| `curve`           | `ChartCurve`                    | Straight rule          | Optional path generator             |

With no curve, the scene contains a rule. With a curve, it contains a
two-point polyline with the generated path. The interaction coordinate is the
pixel midpoint; semantic `xValue` and `yValue` are the second endpoint.

The optional `d3Curve` bridge and granular algorithm boundary are documented in
[Line and area](./charts-docs-reference-marks-line-and-area-md-6c72b4c2.md#source-charts-docs-reference-marks-line-and-area-md) and
[Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md).
