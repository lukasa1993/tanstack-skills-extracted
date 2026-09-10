# Focus And Interaction — Horizontal scale handle

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Horizontal scale handle

Import `handleX` from `@tanstack/charts/interaction/handle` and place it in
`ChartDefinitionOptions.controls`. It binds one controlled x value to an
explicit ordered candidate list. The controlled value must equal one of those
candidates.

`HandleXOptions<TXValue, TYValue>` contains:

| Option        | Contract                                                               |
| ------------- | ---------------------------------------------------------------------- |
| `value`       | `ControlledSignal<TXValue, HandleXChange<TXValue>>`                    |
| `values`      | Ordered candidates for scale positioning, snapping, and keyboard steps |
| `cross`       | `{ edge: 'top' \| 'bottom', offset? }` or `{ value: TYValue }`         |
| `trackStyle`  | Scene style for the horizontal candidate track                         |
| `ruleStyle`   | Scene style for the vertical rule, or `false`                          |
| `handleStyle` | Scene style for the current-value handle                               |
| `hitSize`     | Pointer target height and end padding; defaults to `44`                |
| `ariaLabel`   | Slider name; defaults to `Horizontal value`                            |
| `format`      | Formats the semantic value for `aria-valuetext`                        |
| `keyboard`    | Enables the slider keyboard task; defaults to `true`                   |
| `id`          | Stable behavior and host-control identity                              |

An edge cross places the track outside the corresponding plot edge by its
optional offset. A value cross maps the supplied semantic y value through the
final y scale and places the track inside the plot. For an edge cross, the
vertical rule spans from the opposite plot edge to the track. For a value
cross, it spans from the plot top to that value.

`HandleXCross<TValue>` names this edge-or-value union.
`HandleXPointerSource` is `pointer | touch`; `HandleXSource` adds `keyboard`
for committed and canceled changes.

`HandleXChange<TValue>` is a discriminated union. Pointer and touch gestures
propose `preview`, then `commit` on release or `cancel` with the origin value.
Arrow keys move one candidate, Home and End move to the first and last
candidate, and every keyboard change commits immediately. Each reason carries
the proposed `value`, gesture `origin`, and pointer, touch, or keyboard
`source`.

The behavior resolves against the final x and optional y scales. SVG and
Canvas DOM hosts mount the same contained slider overlay and preserve an
active gesture across accepted controlled updates. Static SVG and React Native
paint the accepted track, rule, and handle without an interactive control.
Applications retain playback timing, status, persistence, and native semantic
controls.
