# Comparison — Bundle snapshot

[Guide and prerequisites](./charts-docs-comparison-md-7faf855b.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Bundle snapshot

Baseline date: `2026-09-10`.

Controlled ranges cover 12 independently built, minified browser consumers:
line, bar, area, and scatter at basic, interactive, and advanced tiers. Only
Recharts has a separate incremental result because that lane externalizes
React and React DOM.

External figures are not comparable to the controlled cold-page ranges. Most
come from a [Bundlephobia main-export snapshot published on July 7,
2026](https://apexcharts.com/blog/state-of-javascript-charting-2026/). The
Vega-Lite, AG Charts, and uPlot main exports were read from Bundlephobia on July
31, 2026. Modular imports can be smaller, especially for
[AG Charts](https://www.ag-grid.com/charts/javascript/module-registry/).

| Library            | Bundle size                            | React externalized | Evidence                                                   |
| ------------------ | -------------------------------------- | -----------------: | ---------------------------------------------------------- |
| TanStack Charts    | 41.56–47.68 KiB                        |     Not applicable | Controlled suite                                           |
| D3                 | 90 KB gzip                             |                  — | External main export                                       |
| Chart.js           | 44.70–58.21 KiB                        |                  — | Controlled suite                                           |
| Apache ECharts     | 153.10–173.18 KiB                      |                  — | Controlled suite                                           |
| Recharts           | 153.08–168.27 KiB                      |   94.96–109.96 KiB | Controlled suite                                           |
| visx               | 49 KB gzip                             |                  — | External `@visx/xychart` main export                       |
| Plotly.js          | ~250 kB partial; ~3.6 MB full min+gzip |                  — | [Vendor distribution figures](https://plotly.com/graphs/)  |
| Lightweight Charts | 60 KB gzip                             |                  — | External main export                                       |
| ApexCharts         | 164 KB gzip                            |                  — | External main export                                       |
| Nivo               | 143 KB gzip                            |                  — | External main export                                       |
| Highcharts         | 100 KB gzip                            |                  — | External main export                                       |
| Victory            | 105 KB gzip                            |                  — | External main export                                       |
| uPlot              | 22 KB gzip                             |                  — | External `uplot@1.6.32` main export                        |
| Vega-Lite          | 87 KB gzip                             |                  — | External `vega-lite@6.4.3`; excludes the peer Vega runtime |
| Observable Plot    | 83.34–91.94 KiB                        |                  — | Controlled suite                                           |
| Bklit UI           | —                                      |                  — | Registry-installed source; no fixed package bundle         |
| AG Charts          | 367 KB gzip                            |                  — | External `ag-charts-community@14.0.2` main export          |

The tracked baseline distinguishes the TanStack workspace revision from
competitor package versions and records the complete chart/tier matrix; the
deterministic bundle gate rejects either kind of drift.

The table does not report install size or runtime speed. The controlled
comparison builds the current TanStack workspace source and the pinned
competitor packages. Browser timing is meaningful only within one machine and
browser run, so this page does not publish a cross-machine timing leaderboard.
