# Focus And Interaction — Horizontal brush

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Horizontal brush

Import `brushX` from `@tanstack/charts/interaction/brush` and place it in
`ChartDefinitionOptions.controls`. Its `range` is a controlled
`BrushRange<TValue>` with inclusive semantic `start` and `end` values.

`BrushXChange` reports `preview`, `commit`, or `cancel`, the proposed and
origin ranges, the pointer or keyboard source, and whether the selection,
start, end, or a new blank region was manipulated. Explicit `values` determine
order, snapping, slider indices, and keyboard steps. String values require
them. Number and Date values may instead use scale inversion only when
`keyboard: false`.

`BrushXValuesOptions<TValue>` is the candidate-backed form.
`BrushXContinuousOptions<number | Date>` is the invertible, pointer-only form.
`BrushXSource` distinguishes pointer and keyboard commits, while
`BrushXTarget` identifies the selection, start handle, end handle, or newly
drawn region.

The behavior resolves against the final x scale and plot bounds. SVG and
Canvas DOM hosts mount the same D3-backed overlay and contain its events before
normal chart focus or selection. Static SVG and React Native paint the
renderer-neutral range and handles without interactive host controls. The
application still owns fixed-window expansion, validation, linked-view layout,
status text, persistence, and any native semantic control.
