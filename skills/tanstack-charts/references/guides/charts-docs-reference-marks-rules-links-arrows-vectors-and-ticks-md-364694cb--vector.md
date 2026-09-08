# Rules Links Arrows Vectors And Ticks — `vector`

[Guide and prerequisites](./charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md-364694cb.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## `vector`

`vector` places a fixed-pixel directed vector at a scaled anchor:

```ts
vector(wind, {
  x: 'longitude',
  y: 'latitude',
  length: 'speed',
  rotate: 'bearing',
  anchor: 'middle',
  z: 'region',
})
```

```ts
function vector<TDatum>(
  source: Iterable<TDatum>,
  options: VectorOptions<TDatum>,
): ChartMark<TDatum, InferredX, InferredY>
```

| Option          | Type                                 | Default                | Meaning                                         |
| --------------- | ------------------------------------ | ---------------------- | ----------------------------------------------- |
| `id`            | `string`                             | Layer-derived          | Stable mark ID                                  |
| `x`, `y`        | required channels                    | —                      | Scaled anchor                                   |
| `length`        | `number \| Channel<TDatum, number?>` | `12`                   | Vector length in pixels                         |
| `rotate`        | `number \| Channel<TDatum, number?>` | `0`                    | Clockwise degrees; zero points up               |
| `anchor`        | `'start' \| 'middle' \| 'end'`       | `'middle'`             | Which vector position stays at x/y              |
| `z`             | `Channel<TDatum, ChartKey?>`         | No group               | Interaction group                               |
| `color`         | `Channel<TDatum, ChartKey?>`         | `z`                    | Value sent to the chart color scale             |
| `key`           | `Channel<TDatum, ChartKey>`          | Top/nested `id`, index | Stable identity                                 |
| `stroke`        | `VisualChannel<TDatum, string>`      | Resolved color         | Final stroke override                           |
| `strokeOpacity` | `number`                             | SVG default            | Stroke opacity                                  |
| `strokeWidth`   | `number`                             | `1.5`                  | Stroke width                                    |
| `headLength`    | `number`                             | `5`                    | Head length in pixels, clamped to at least zero |
| `headAngle`     | `number`                             | `30`                   | Head half-angle in degrees                      |

Length and rotation must be finite. Negative length reverses the body direction
while preserving the rotation convention. The interaction point remains the
scaled x/y anchor for every anchor mode.
