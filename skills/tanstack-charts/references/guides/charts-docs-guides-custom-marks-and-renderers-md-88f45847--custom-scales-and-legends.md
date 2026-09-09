# Custom Marks And Renderers — Custom scales and legends

[Guide and prerequisites](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Custom scales and legends

Configured callable scales are the normal path. `ChartScale`,
`ChartColorScale`, and `ChartColorLegend` exist for context-aware adapters that
need chart range, theme, or responsive legend geometry.

Keep specialized scale dependencies in the module that uses them. A line-only
bundle must not pay for a custom scale registered elsewhere.

See [Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md) and
[Legends and Color](./charts-docs-guides-legends-and-color-md-715f4e34.md#source-charts-docs-guides-legends-and-color-md).
