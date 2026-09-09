# Rules Links Arrows Vectors And Ticks — `arrow`

[Guide and prerequisites](./charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md-364694cb.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## `arrow`

`arrow` draws one straight directed segment with a fixed-pixel head:

```ts
arrow(edges, {
  x1: 'sourceX',
  y1: 'sourceY',
  x2: 'targetX',
  y2: 'targetY',
  headLength: 10,
  headAngle: 28,
})
```

```ts
function arrow<TDatum>(
  source: Iterable<TDatum>,
  options: ArrowOptions<TDatum>,
): ChartMark<TDatum, InferredEndpointX, InferredEndpointY>
```

| Option          | Type                            | Default                | Meaning                                         |
| --------------- | ------------------------------- | ---------------------- | ----------------------------------------------- |
| `id`            | `string`                        | Layer-derived          | Stable mark ID                                  |
| `x1`, `y1`      | required channels               | —                      | Tail endpoint                                   |
| `x2`, `y2`      | required channels               | —                      | Head endpoint                                   |
| `z`             | `Channel<TDatum, ChartKey?>`    | No group               | Interaction group                               |
| `color`         | `Channel<TDatum, ChartKey?>`    | `z`                    | Value sent to the chart color scale             |
| `key`           | `Channel<TDatum, ChartKey>`     | Top/nested `id`, index | Stable identity                                 |
| `stroke`        | `VisualChannel<TDatum, string>` | Resolved color         | Final arrow paint override                      |
| `strokeOpacity` | `number`                        | SVG default            | Stroke opacity                                  |
| `strokeWidth`   | `number`                        | `1.5`                  | Stroke width                                    |
| `headLength`    | `number`                        | `8`                    | Head length in pixels, clamped to at least zero |
| `headAngle`     | `number`                        | `30`                   | Half-angle in degrees                           |

The arrowhead stays the same pixel size as scales and container dimensions
change. The interaction coordinate and semantic x/y values are the head
endpoint.
