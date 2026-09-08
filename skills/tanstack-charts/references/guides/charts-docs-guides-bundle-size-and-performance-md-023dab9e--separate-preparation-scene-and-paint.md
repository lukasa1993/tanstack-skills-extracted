# Bundle Size And Performance — Separate preparation, scene, and paint

[Guide and prerequisites](./charts-docs-guides-bundle-size-and-performance-md-023dab9e.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Separate preparation, scene, and paint

Measure three layers independently:

1. Data preparation: sorting, grouping, binning, stacking, or layout.
2. Scene build: channels, scales, guides, marks, and focus points.
3. Surface paint: SVG serialization and keyed reconciliation, or Canvas draw
   calls, plus optional animation.

This separation reveals whether an expensive chart needs a better encoding, a
framework-memoized transform, fewer scene nodes, or a different renderer.
