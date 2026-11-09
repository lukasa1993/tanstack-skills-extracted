# Motion — Observing motion and styling SVG

[Guide and prerequisites](./charts-docs-reference-motion-md-125c7e38.md) · Release-matched documentation · `@tanstack/charts@1.5.0`.

## Observing motion and styling SVG

`getPresentationPoints()` and `subscribePresentationPoints()` on a mounted
surface report scene geometry for interaction alignment, not a general
animation-complete event. When a scene run finishes, the motion renderer
publishes the destination scene's `points` array. Once that scene is settled,
`getPresentationPoints()` returns `undefined` because no temporary geometry is
needed. A snap can also publish destination points without an animation.
Cancellation does not mean the interrupted destination was reached, and a new
render can immediately replace the run. Unsubscribe when the observer is no
longer needed.

These methods do not report completion of tooltip or focus-guide animations.
There is currently no public callback for completion of every motion layer.
For an application-owned animation, the standalone spring's `sample().done`
reports completion of that sampler only.

`data-ts-motion-state`, `data-ts-motion-progress`, and `data-ts-motion-role`
are private renderer bookkeeping, not supported completion or CSS hooks.
Their presence and removal differ across track types, snaps, and cancellation.
Do not use them to decide when application CSS can take over a property the
renderer is animating. Use mark states and definition-local motion for chart
effects, or keep application-owned animation on a separate element.

The same [compatibility policy](./charts-docs-compatibility-md-3e5072ae.md#source-charts-docs-compatibility-md) applies to
undocumented `ts-chart__*` selectors and group nesting, including mark, axis,
grid, focus-layer, focus-guide, and crosshair containers. Use authored
`className` options where a mark documents them, or classes on nodes produced
by your own [custom mark](./charts-docs-reference-custom-extensions-md-9e8eefa0.md#source-charts-docs-reference-custom-extensions-md). Wrapping a built-in mark's
public `initialize` method does not make its internal node nesting a stable
styling API. Cartesian marks and guides without a documented `className`
option do not currently provide an equivalent supported class hook.
