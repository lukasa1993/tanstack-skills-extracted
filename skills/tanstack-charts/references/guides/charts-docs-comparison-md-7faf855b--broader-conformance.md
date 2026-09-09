# Comparison — Broader conformance

[Guide and prerequisites](./charts-docs-comparison-md-7faf855b.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Broader conformance

The catalog corpus contains 117 TanStack/reference pairs: 79 sourced from
Observable Plot, 27 from Recharts, and 11 from Apache ECharts. Twenty-two pairs
carry executable interaction scenarios. Those counts describe selected
reference coverage, not each library's feature ceiling or a list of built-in
TanStack chart types. Chart.js participates in the standard and stress suites,
not the catalog corpus.

The catalog displays each renderer entry, its transitive support and transform
files, and provenance for imported demo datasets. Its report counts the
complete authored source closure and publishes the source-line ratio for every
pair; moving a transform or layout into a support module does not remove it
from the comparison, while raw snapshot rows are not treated as chart
authoring.

TanStack deliberately keeps several responsibilities outside the default
runtime:

| Responsibility                                      | Owner                                                |
| --------------------------------------------------- | ---------------------------------------------------- |
| Binning, grouping, stacking, and statistics         | Hoistable TanStack transforms or granular D3 modules |
| Spatial layouts                                     | Application code using a suitable layout library     |
| Brush and zoom                                      | Controlled application state plus an exact behavior  |
| Scrubber and editor state                           | Application state and optional direct manipulation   |
| Data fetching, cleaning, filtering, and persistence | The application's data and state layers              |

Choose Chart.js when Canvas-first standard charts and its plugin ecosystem fit
the application. Choose Apache ECharts for a broad built-in controller and
chart catalog with Canvas or SVG output. Choose Recharts for a React-native SVG
component model. Choose Observable Plot for concise exploratory marks and
transforms. Choose TanStack Charts when one typed, framework-independent
definition must grow from standard charts into application-specific SVG or
Canvas composition while keeping D3 and state ownership explicit.
