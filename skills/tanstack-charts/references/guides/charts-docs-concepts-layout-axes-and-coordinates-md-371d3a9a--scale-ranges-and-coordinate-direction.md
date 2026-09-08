# Layout Axes And Coordinates — Scale ranges and coordinate direction

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Scale ranges and coordinate direction

Scale factories derive domains from marks. Configured instances retain fixed
semantic domains. TanStack Charts supplies ranges from `scene.chart`.

For a normal cartesian chart:

- x increases from the left edge to the right edge.
- continuous y increases from the bottom edge to the top edge.
- a y band scale lays categories from top to bottom.

`reverse: true` flips the range. It does not reorder or mutate the source domain.

See [Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md) for scale selection, responsive ownership, and
pixel-to-value inversion.
