# Layout Axes And Coordinates — Continuous viewports

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Continuous viewports

A continuous axis can present one semantic window of a larger content domain:

```ts
const x = {
  scale: scaleUtc().domain([historyStart, historyEnd]),
  viewport: {
    domain: [visibleStart, visibleEnd],
    translate: dragOffset,
  },
}
```

The configured or inferred scale domain describes the complete content.
`viewport.domain` is the committed semantic window used for mapping, axes, and
grid lines. `viewport.translate` is a transient output-space offset applied
after that mapping.

Viewport ownership is resolved for each mark and each axis. A mark that
materializes an active viewport axis is content on that axis by default. The
compiler gives each such mark its own plot-bounded clip layer and applies only
the translations for axes it owns. Axes and grid lines stay fixed. Marks that
do not depend on the translated axis also stay fixed, such as a frame or a
y-only annotation during an x drag. Custom marks can override either axis as
`'content'` or `'fixed'` through `InitializedMark.viewport`.

Marks, focus layers, interaction points, and tooltip anchors use the same
presented coordinates. `scene.points` retains every content point, including
off-window points, for rendering and diagnostics. The interaction host limits
pointer strategies and keyboard navigation to clipped content points whose
presented anchors are inside the plot clip. Points from marks with fixed
viewport ownership remain candidates outside the plot.
`viewportInteractionPoints(scene)` returns that subset without changing
`scene.points`.

Translation is expressed in screen-direction scene pixels: positive x moves
content right, negative x moves it left, positive y moves it down, and negative
y moves it up. Domain order and `reverse` do not change those directions.

This makes paged history one chart and one continuous line rather than a guide
chart overlaid with several plot charts. During a drag, keep the committed
domain fixed and update only `translate`. To settle one page, animate the
translation to one plot width, then update the semantic domain and reset the
translation to zero in the same application commit.

Viewport domains accept two distinct finite numbers or two distinct finite
Dates. The scale must be configured or inferable, continuous, invertible,
unclamped, and independently accept domain and range assignment. Band,
ordinal, quantize, clamped, and getter-only scales are rejected. An authored
`axis.viewport` cannot be applied to an opaque custom `ChartScale`; a custom
resolver can instead return a complete `ResolvedScale.viewport` that it owns.
A logarithmic content domain and viewport domain must contain finite, nonzero
numbers and remain on the same side of zero.

The resolved scale exposes both coordinate systems:

```ts
const { contentDomain, domain, translate, map } = scene.scales.x.viewport!
```

`scene.scales.x.map(value)` is the committed, untranslated coordinate used to
construct geometry. `viewport.map(value)` returns its presented coordinate.
