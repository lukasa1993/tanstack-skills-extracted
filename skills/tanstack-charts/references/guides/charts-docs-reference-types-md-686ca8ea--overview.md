# Types — Overview

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@1.1.0`.

TanStack Charts is inference-first. A mark's source data and channel selectors
flow through its definition into scales, axis formatters, host and adapter
callbacks, focus callbacks, and selection callbacks. Normal application code
should not cast chart definitions or supply adapter generics.

Browser applications can import types from the package root. Platform-neutral
libraries can import the same definition, mark, scene, runtime, focus, and
tooltip-model contracts from `@tanstack/charts/types`; DOM host and renderer
types remain available from the root.

The `@tanstack/charts/types/core` entry exposes the module that declares the
core types. TypeScript uses this entry when emitting inferred declarations
for exported marks and chart definitions. You do not need to annotate those
exports or import package-internal files.

This entry also exposes the supporting inference and extension contracts:

| Type                             | Purpose                                                       |
| -------------------------------- | ------------------------------------------------------------- |
| `ChartSpecBase`                  | Shared guide, color, resource, and layout options             |
| `StoredChartSpec`                | Stored marks and scale registry used by definition inference  |
| `CheckedChartSpec`               | Checks a stored spec against its marks' scale requirements    |
| `MarkScaleBindings`              | Optional named x and y scale bindings                         |
| `MarkChannelOutput`              | Inferred channel output with a widened fallback               |
| `MarkCallOptions`                | Combines inferred selectors with non-inferred options         |
| `DecorativeChartMark`            | Marks geometry as decorative while retaining its source types |
| `ChartLegendPlacement`           | Top or bottom placement for a color legend                    |
| `ChartHostControl`               | Scene descriptor for an optional host control                 |
| `ChartHostControlExtensionToken` | Renderer-neutral identity and factory for a host control      |
