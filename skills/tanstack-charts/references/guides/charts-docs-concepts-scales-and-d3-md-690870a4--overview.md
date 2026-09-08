# Scales And D3 — Overview

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

TanStack Charts accepts callable, copyable scale factories and instances. Start
with the exact compact scale entry that matches the mapping. Upgrade only the
axis, color, or radius mapping whose semantics require D3.

- **TanStack compact scales** cover numeric linear, categorical band and point,
  and ordinal mappings without a production D3 dependency.
- **D3** adds temporal, nonlinear, radial, interpolated, and statistical scale
  semantics plus optional shape, time, and spatial algorithms.
- **TanStack Charts** infers factory domains from mark channels, assigns
  responsive pixel ranges, lays out guides, compiles scenes, and renders them.

Compact and D3 scales implement the same chart-facing contract and can be used
in one definition. There is no hidden D3 umbrella import.

`@tanstack/charts` declares `d3-array`, `d3-shape`, `d3-geo`, `d3-delaunay`,
`d3-hexbin`, `d3-contour`, `d3-force`, `d3-sankey`, and `d3-hierarchy` because its
transforms, polar and D3 curve features, geo features, and optional spatial,
network, and hierarchy entries own those implementations. They are not peers
and require no `use` configuration. Bundlers tree-shake unused algorithms and
geometry, and exact feature subpaths remain available when an application
wants a narrower import.
