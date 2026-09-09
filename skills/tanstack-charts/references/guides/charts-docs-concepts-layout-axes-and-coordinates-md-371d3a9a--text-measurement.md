# Layout Axes And Coordinates — Text measurement

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Text measurement

Static scenes use deterministic text estimates. The DOM host and browser
framework adapters measure painted glyph bounds with the chart container's
inherited font and relayout after web fonts load.

Advanced renderers can supply `measureText`. Its metrics include painted x and y offsets relative to the requested anchor and baseline, not only width and height. This is necessary for correct containment of rotated and anchored labels.

Automatic margins contain chart-owned guides and Cartesian `text` marks. Axis
tick labels are thinned against their measured, optionally rotated bounds.
Explicit text placement remains responsible for data-label collisions.
