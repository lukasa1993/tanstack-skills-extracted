# Custom Marks And Renderers — Start with composition

[Guide and prerequisites](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Start with composition

Before creating a mark, check whether the result is a combination of:

- lines or areas;
- rectangles or cells;
- dots or hexagons;
- rules, links, ticks, arrows, or vectors;
- text or frames;
- facets;
- polar arcs, radial paths, dots, or guides;
- projected GeoJSON;
- optional scalar contours, density contours, spatial bins, topology marks,
  hierarchy layouts, or Sankey flow composition.

Composition retains built-in type inference, focus metadata, animation, and
subpath bundle boundaries. The [chart examples](./charts-docs-examples-index-md-af22062f.md#source-charts-docs-examples-index-md) show
candlesticks, networks, and annotations built this way. Boxplots use the
first-party [`boxX` and `boxY` marks](./charts-docs-reference-marks-box-md-aab0dd81.md#source-charts-docs-reference-marks-box-md), which keep
their statistical steps aligned instead of exposing prepared child datasets.

For example, a regular scalar grid belongs in the optional
[`contour` mark](./charts-docs-reference-marks-contour-md-76f842db.md#source-charts-docs-reference-marks-contour-md), not a case-owned D3 path and
scene-node loop. A weighted directed graph belongs in
[`sankeyDiagram`](./charts-docs-reference-marks-sankey-md-7c353525.md#source-charts-docs-reference-marks-sankey-md), whose callback composes
ordinary links, rectangles, and labels after responsive layout.
