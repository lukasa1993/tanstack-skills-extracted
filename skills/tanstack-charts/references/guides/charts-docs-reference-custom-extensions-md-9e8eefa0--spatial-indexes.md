# Custom Extensions — Spatial indexes

[Guide and prerequisites](./charts-docs-reference-custom-extensions-md-9e8eefa0.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Spatial indexes

`ChartSpatialIndexFactory` replaces the default linear pointer lookup without
changing scene compilation. Build a point-only index from its first argument,
or use `context.scene` from its second argument to index resolved primitive
bounds. Return the nearest original point within the requested distance. The
host recreates the index when the scene or factory changes.

See [Spatial indexes](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md). The
appropriate granular spatial primitive can be brought through the boundary
described in [Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md).
