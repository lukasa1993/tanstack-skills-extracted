# Scales And D3 — Custom scales are the final extension

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Custom scales are the final extension

Use `ChartScale` only when neither a compact nor D3 callable scale can express
the mapping. Its resolver owns the complete domain, finite mapping, ticks,
formatting, bandwidth, and response to the supplied chart range. A custom scale
is appropriate for context-aware mappings that need the resolved chart options,
not as a wrapper around an existing compact or D3 scale.

See
[Custom Extensions](./charts-docs-reference-custom-extensions-md-9e8eefa0.md#source-charts-docs-reference-custom-extensions-md)
for the resolver contract.

For chart-side scale, guide, and color types, see
[Scales, Guides, and Color Reference](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md#source-charts-docs-reference-scales-guides-and-color-md).
