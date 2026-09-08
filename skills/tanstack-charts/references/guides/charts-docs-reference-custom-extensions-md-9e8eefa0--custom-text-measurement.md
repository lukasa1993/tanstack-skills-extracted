# Custom Extensions — Custom text measurement

[Guide and prerequisites](./charts-docs-reference-custom-extensions-md-9e8eefa0.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Custom text measurement

`ChartTextMeasurer` lets nonbrowser rendering, special fonts, or an
application-owned typography engine provide painted glyph bounds. It affects
guide geometry, not mark text rendering. It is synchronous and receives the
complete resolved `ChartTextTypography`; hosts re-render after asynchronous
font readiness changes.

See [Automatic guide layout](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md#source-charts-docs-reference-scales-guides-and-color-md)
for the contract.
