# Custom Extensions — Custom renderers

[Guide and prerequisites](./charts-docs-reference-custom-extensions-md-9e8eefa0.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Custom renderers

A `ChartRenderer` owns both deterministic server markup and one mounted
`ChartSurface`. The surface renders scenes, converts browser coordinates to
scene coordinates, paints focus, and releases renderer-owned resources.
`mountChartRenderer` keeps responsive sizing, runtime updates, focus,
keyboard, tooltip, and selection behavior shared across renderers.

Custom surfaces should resolve authored focus layers and data-less guides with
`resolveFocusPresentation(scene, focus, pointer, cursor)`, then paint its
`under` nodes, the base scene, and its `over` nodes in that order.

The scene compiler has already converted every mark-emitted `MarkFocusGuide`
to a `SceneFocusGuide` with required `placement` before a renderer receives the
scene. `resolveFocusPresentation` calls each guide's resolver with its local
focus, pointer, and cursor context. A custom renderer should consume those
resolved nodes and final placement through that helper; it should not call
guide resolvers or infer mark order again.

Use `@tanstack/charts/renderer` directly or the framework `/core` entries.
The optional built-in implementation at `@tanstack/charts/canvas` demonstrates
the boundary without changing the default SVG imports.

`ChartMarkRenderer` is the small renderer-selection token stored in universal
mark and scene types. A DOM implementation uses `ChartLayerRenderer`, which
extends `ChartRenderer` and `ChartMarkRenderer` with
`compose(defaultRenderer)`. `UniversalChartLayerRenderer` provides the same
contract for a definition-agnostic renderer. The returned compositor owns the
ordered child surfaces and exposes them through `ChartSurface.layers`.

Built-in marks accept a `ChartMarkRenderer` through their shared
`ChartMarkOptions`. Custom marks pass it as the third factory argument, after
the optional motion definition. See
[Mark-level renderers](./charts-docs-reference-rendering-and-export-md-ef854527.md#source-charts-docs-reference-rendering-and-export-md).

For an SVG-only serialization change, pass a `ChartSvgRenderer` as `renderSvg`
to the compatibility host or adapt it with `createSvgChartRenderer` from
`@tanstack/charts/svg/renderer`. Preserve the SVG root, stable DOM keys,
accessible name, coordinate system, and focus presentation expected by that
adapter.

Default SVG serialization already preserves declared gradients and group
clips; see [Rendering and export](./charts-docs-reference-rendering-and-export-md-ef854527.md#source-charts-docs-reference-rendering-and-export-md).
