# Scales And D3 — Capability map

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Capability map

Use the official D3 pages as the API reference for each algorithm. TanStack Charts documentation only describes how its output crosses the chart boundary.

| Need                                                               | D3 module                                                   | How it enters TanStack Charts                                                                                |
| ------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Quantitative, temporal, categorical, log, radial, and color scales | [`d3-scale`](https://d3js.org/d3-scale)                     | Pass a factory for an inferred domain or an instance for a fixed domain                                      |
| Sequential, diverging, and categorical color schemes               | [`d3-scale-chromatic`](https://d3js.org/d3-scale-chromatic) | Pass an interpolator or scheme to a configured D3 color scale                                                |
| Extents, grouping, aggregation, bins, sorting, and statistics      | [`d3-array`](https://d3js.org/d3-array)                     | Convert source data into rows, domains, or thresholds before creating marks                                  |
| Stacks, pies, arcs, curves, and shape generators                   | [`d3-shape`](https://d3js.org/d3-shape)                     | Feed pie intervals and curve factories to polar marks, or bridge a Cartesian curve with `d3Curve`            |
| Calendar intervals                                                 | [`d3-time`](https://d3js.org/d3-time)                       | Build bins, ticks, rounded selections, and date windows in application code                                  |
| Numeric formatting                                                 | [`d3-format`](https://d3js.org/d3-format)                   | Pass a formatter to an axis or tooltip option                                                                |
| Time formatting                                                    | [`d3-time-format`](https://d3js.org/d3-time-format)         | Pass a formatter to an axis or tooltip option                                                                |
| Quadtrees                                                          | [`d3-quadtree`](https://d3js.org/d3-quadtree)               | Implement an optional `ChartSpatialIndexFactory`                                                             |
| Delaunay and Voronoi geometry                                      | [`d3-delaunay`](https://d3js.org/d3-delaunay)               | Use exact optional `delaunayLink` or `voronoi` marks; import directly for a custom spatial index or geometry |
| DOM selection for optional D3 gesture controllers                  | [`d3-selection`](https://d3js.org/d3-selection)             | Imported privately by first-party brush and zoom behaviors; import directly for a different DOM controller   |
| Brushes                                                            | [`d3-brush`](https://d3js.org/d3-brush)                     | Use exact optional `brushX`; import directly for a different application-owned gesture                       |
| Pan and zoom                                                       | [`d3-zoom`](https://d3js.org/d3-zoom)                       | Use exact optional `zoomX` with a controlled semantic window; import directly for a different gesture policy |
| Hierarchies and layouts                                            | [`d3-hierarchy`](https://d3js.org/d3-hierarchy)             | Use exact optional `treeLayout` for flat tidy trees and `treemap` for responsive rectangle tiling            |
| Force simulation                                                   | [`d3-force`](https://d3js.org/d3-force)                     | Use exact optional `forceLayout` for static settlement; import directly for a live application controller    |
| Sankey flow layout                                                 | [`d3-sankey`](https://github.com/d3/d3-sankey)              | Use exact optional `sankeyDiagram` for responsive layout and ordinary child-mark composition                 |
| Geographic projections and paths                                   | [`d3-geo`](https://d3js.org/d3-geo)                         | Pass a responsive projection factory to `geoShape`                                                           |

An optional algorithm does not necessarily need final chart layout.
`treeLayout` and `forceLayout` produce semantic data-space coordinates, so
native `link`, `dot`, and `text` marks can map their output through ordinary
positional scales. Treemap topology depends on the final plot aspect ratio and
its padding is measured in pixels, so the exact `treemap` mark owns both the
responsive D3 layout and its downward-increasing screen coordinates. Sankey
column allocation, padding, and proportional link width also resolve in final
pixels; `sankeyDiagram` then composes ordinary marks over immutable node and
link rows. Density estimation and Delaunay geometry likewise run after scale
ranges resolve. Keep live force controllers in application state; the exact
Charts force entry owns deterministic static settlement only.
