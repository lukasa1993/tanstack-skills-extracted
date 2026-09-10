# Interactions And Selections — Linked views

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Linked views

Store one semantic cursor, selection, or domain and derive every view from it.
For focus cursors, share a `createChartCursor` controller with `match: 'x'` or
`match: 'y'`. Each view can have an independent opposite-axis scale while
sharing a date or category.

Validate outgoing events by semantic value, not matching pixel positions.
Different chart sizes and margins should still resolve the same selection.
