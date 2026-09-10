# Focus And Interaction — Spatial indexes

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Spatial indexes

The default lookup scans the cached scene targets linearly. Dense charts can
inject an index:

```ts
type ChartSpatialIndexFactory<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> = (
  points: readonly ChartPoint<TDatum, TXValue, TYValue>[],
  context: ChartSpatialIndexFactoryContext<TDatum, TXValue, TYValue>,
) => ChartSpatialIndex<TDatum, TXValue, TYValue>
```

The host rebuilds the index when the scene or definition changes. The index
owns its search algorithm and must apply `maxDistance`. Point-only factories
can ignore the second argument; geometry-aware indexes can traverse
`context.scene` and use primitive bounds as their acceleration layer.
Use the granular spatial primitive appropriate to the data; the boundary is
described in [Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md).

Supplying an index also replaces default primitive containment and affinity
ranking; the host does not add a linear safety scan after an indexed query. An
index that wants identical geometry semantics should index scene-primitive
bounds and perform exact shape checks on its candidates.

A custom `focus` strategy takes precedence over `spatialIndex` for pointer
resolution.
