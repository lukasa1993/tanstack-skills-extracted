# Networks And Hierarchies — Reveal spatial adjacency

[Guide and prerequisites](./charts-docs-examples-networks-and-hierarchies-md-d4abeb30.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Reveal spatial adjacency

A Delaunay network connects points that are neighbors in a triangulation. It
answers local spatial adjacency; it does not imply a business or causal
relationship unless the data model defines one.

<!-- ::chart-example id=37-delaunay-network height=480 -->

The optional [`delaunayLink` mark](./charts-docs-reference-marks-delaunay-md-53f33821.md#source-charts-docs-reference-marks-delaunay-md) accepts the
source points directly. It projects both configured axes after final layout,
triangulates each `z` group in screen space, and retains both endpoint records
on every native link. Supply a stable point `key`; edge identity is derived
from the endpoint keys.

When Delaunay is used only for nearest-point lookup, keep the triangulation in
a `ChartSpatialIndexFactory` instead of painting its edges. See
[Tooltips and Focus](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md#source-charts-docs-guides-tooltips-and-focus-md).
