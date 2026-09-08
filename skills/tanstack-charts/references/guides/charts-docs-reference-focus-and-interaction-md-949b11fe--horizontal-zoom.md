# Focus And Interaction — Horizontal zoom

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Horizontal zoom

Import `zoomX` from `@tanstack/charts/interaction/zoom` and place it in
`ChartDefinitionOptions.controls`. Its `window` is a controlled
`ZoomXWindow<TValue>` with semantic `start` and `end` values. `TValue` must be
a number or Date backed by an invertible x scale.

`extent` defines the complete allowed x domain. `scaleExtent` defaults to
`[1, Infinity]`; its first value must be `1`, and its second value sets the
maximum zoom factor relative to the extent. The configured x scale must use
the controlled window as its domain; accepted proposals rebuild the definition
with that same window.

The behavior resolves against the final x scale and plot bounds. Its contained
SVG or Canvas host control owns pointer-anchored vertical-wheel zoom, drag and
horizontal-wheel pan, pointer and touch input, delta-mode normalization,
clamping, cancellation, and teardown. It captures wheel input only while the
plot control is focused. Plus and minus zoom around the center, arrow keys pan,
Home proposes the full extent, and Escape cancels an active gesture.

`ZoomXChange` reports `preview`, `commit`, or `cancel`; the proposed `value`,
the gesture `origin`, a `zoom`, `pan`, or `reset` action, and a wheel, pointer,
touch, or keyboard source. Wheel streams and direct manipulation preview before
their terminal event. Keyboard changes commit immediately. A cancel proposes
the origin window.

Set `keyboard: false` only when an application supplies equivalent semantic
controls. `ariaLabel` names the plot control, `ariaDescription` can replace its
generated instructions, `format` formats values in those instructions, and
`onActiveChange` observes focus without moving accepted state into Charts.

Charts does not mutate the controlled snapshot. Keep visible-row filtering or
clipping, y-domain policy, status, reset and recovery controls, follow-latest
behavior, and persistence in the application. Static SVG and React Native
render the accepted configured window but provide no zoom host control.

The public zoom types are:

| Type                   | Contract                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| `ZoomXValue`           | A finite `number` or valid `Date`                                      |
| `ZoomXWindow<TValue>`  | Semantic `start` and `end` values                                      |
| `ZoomXSource`          | Wheel, pointer, touch, or keyboard origin                              |
| `ZoomXAction`          | Zoom, pan, or reset action                                             |
| `ZoomXChange<TValue>`  | Preview, commit, and cancel reason union                               |
| `ZoomXOptions<TValue>` | Controlled window, extent, limits, accessibility, and keyboard options |
