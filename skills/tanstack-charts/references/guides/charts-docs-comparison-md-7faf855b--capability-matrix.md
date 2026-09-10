# Comparison — Capability matrix

[Guide and prerequisites](./charts-docs-comparison-md-7faf855b.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Capability matrix

- ✅ Documented first-party component or API
- 🟡 Requires application composition, an external package, or explicit lifecycle work
- 🔴 No documented first-party path

“Measured” libraries are installed at the pinned versions above and exercised
by the controlled suite. “Docs” entries are reviewed against the linked
official documentation and carry no bundle or performance claim. Library rows
are sorted by GitHub repository stars read on `2026-07-31`, with TanStack
Charts pinned first. Stars are an ordering key, not an adoption measure.

| Library                                                                                | Axes and grid       | Legend        | Pointer tooltip   | Multi-series            | Selection                | Animation         | Responsive resize        | Evidence |
| -------------------------------------------------------------------------------------- | ------------------- | ------------- | ----------------- | ----------------------- | ------------------------ | ----------------- | ------------------------ | -------- |
| [TanStack Charts](./charts-docs-overview-md-6bc1476c.md#source-charts-docs-overview-md)                                                       | ✅ Built in         | ✅ Built in   | ✅ Built in       | ✅ Built in             | ✅ `onSelect`            | ✅ Built in       | ✅ Observed              | Measured |
| [D3](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md)                                                      | ✅ Modules          | 🟡 Authored   | 🟡 Authored       | ✅ Primitives           | ✅ Brush and events      | ✅ Transitions    | 🟡 Host layout           | Docs     |
| [Chart.js](https://www.chartjs.org/docs/latest/)                                       | ✅ Built in         | ✅ Plugin     | ✅ Plugin         | ✅ Datasets             | ✅ Event API             | ✅ Built in       | ✅ Observed              | Measured |
| [Apache ECharts](https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/) | ✅ Components       | ✅ Component  | ✅ Component      | ✅ Series               | ✅ Event API             | ✅ Built in       | 🟡 Explicit `resize()`   | Measured |
| [Recharts](https://recharts.github.io/en-US/)                                          | ✅ Components       | ✅ Component  | ✅ Component      | ✅ Components           | ✅ Event props           | ✅ Built in       | ✅ `ResponsiveContainer` | Measured |
| [visx](https://github.com/airbnb/visx)                                                 | ✅ Components       | ✅ Component  | ✅ Component      | ✅ Primitives           | ✅ Brush                 | 🟡 External       | ✅ `ParentSize`          | Docs     |
| [Plotly.js](https://plotly.com/javascript/)                                            | ✅ Built in         | ✅ Built in   | ✅ Built in       | ✅ Traces and subplots  | ✅ Box and lasso         | ✅ Built in       | ✅ Responsive config     | Docs     |
| [Lightweight Charts](https://tradingview.github.io/lightweight-charts/)                | ✅ Built in         | 🟡 Host       | 🟡 Host           | ✅ Series               | 🟡 Events and host       | 🔴 No transitions | ✅ `autoSize`            | Docs     |
| [ApexCharts](https://apexcharts.com/docs/installation/)                                | ✅ Built in         | ✅ Built in   | ✅ Built in       | ✅ Series               | ✅ Point and range       | ✅ Built in       | ✅ Breakpoints           | Docs     |
| [Nivo](https://nivo.rocks/about/)                                                      | ✅ Components       | ✅ Component  | ✅ Component      | ✅ Series               | ✅ Event props           | ✅ React Spring   | ✅ Responsive components | Docs     |
| [Highcharts](https://www.highcharts.com/docs/getting-started/system-requirements)      | ✅ Built in         | ✅ Built in   | ✅ Built in       | ✅ Series               | ✅ Point and range       | ✅ Built in       | ✅ Reflow                | Docs     |
| [Victory](https://commerce.nearform.com/open-source/victory/)                          | ✅ Components       | ✅ Component  | ✅ Component      | ✅ Components           | ✅ Events and containers | ✅ `animate`      | ✅ Responsive container  | Docs     |
| [uPlot](https://github.com/leeoniya/uPlot)                                             | ✅ Built in         | ✅ Built in   | 🟡 Plugin or host | ✅ Series               | ✅ Cursor and select     | 🔴 No transitions | 🟡 `setSize()`           | Docs     |
| [Vega-Lite](https://vega.github.io/vega-lite/)                                         | ✅ Guides           | ✅ Built in   | ✅ Encoding       | ✅ Layers and views     | ✅ Parameters            | 🟡 Vega or host   | ✅ Container sizing      | Docs     |
| [Observable Plot](https://observablehq.com/plot/features/plots)                        | ✅ Marks and scales | ✅ Legend API | ✅ Tip mark       | ✅ Marks and transforms | 🟡 Host composition      | 🟡 Host-owned     | 🟡 Host rerender         | Measured |
| [Bklit UI](https://bklit.com/docs/installation)                                        | ✅ Components       | ✅ Component  | ✅ Component      | ✅ `ComposedChart`      | ✅ Brush                 | ✅ Motion         | ✅ Container measure     | Docs     |
| [AG Charts](https://www.ag-grid.com/charts/javascript/installation/)                   | ✅ Components       | ✅ Component  | ✅ Component      | ✅ Series               | ✅ Enterprise            | ✅ Enterprise     | ✅ Auto-size             | Docs     |

License color:

- 🟢 Permissive open source; commercial use allowed
- 🟡 Open core or mixed open/proprietary offering
- 🟠 Commercial use is conditional or revenue-limited
- 🔴 Paid license required for commercial use

| Library                                                                                | SVG output           | Canvas or WebGL output     | Framework-neutral core | License / paid tier                                                                                 |
| -------------------------------------------------------------------------------------- | -------------------- | -------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------- |
| [TanStack Charts](./charts-docs-overview-md-6bc1476c.md#source-charts-docs-overview-md)                                                       | ✅ Default           | ✅ Optional renderer       | ✅ Core + adapters     | 🟢 MIT                                                                                              |
| [D3](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md)                                                      | ✅ Yes               | ✅ Yes                     | ✅ Yes                 | 🟢 ISC                                                                                              |
| [Chart.js](https://www.chartjs.org/docs/latest/)                                       | 🔴 Canvas only       | ✅ Default                 | ✅ Yes                 | 🟢 MIT                                                                                              |
| [Apache ECharts](https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/) | ✅ Optional renderer | ✅ Default                 | ✅ Yes                 | 🟢 Apache-2.0                                                                                       |
| [Recharts](https://recharts.github.io/en-US/)                                          | ✅ Default           | 🔴 No first-party renderer | 🔴 React only          | 🟢 MIT                                                                                              |
| [visx](https://github.com/airbnb/visx)                                                 | ✅ Default           | 🔴 No renderer             | 🔴 React only          | 🟢 MIT                                                                                              |
| [Plotly.js](https://plotly.com/javascript/)                                            | ✅ Common traces     | ✅ WebGL traces            | ✅ Yes                 | 🟢 MIT                                                                                              |
| [Lightweight Charts](https://tradingview.github.io/lightweight-charts/)                | 🔴 No renderer       | ✅ Default                 | ✅ Yes                 | 🟢 Apache-2.0                                                                                       |
| [ApexCharts](https://apexcharts.com/docs/installation/)                                | ✅ Default           | 🔴 No renderer             | ✅ Yes                 | 🟠 [Free under $2M revenue; commercial or OEM otherwise](https://apexcharts.com/license/community/) |
| [Nivo](https://nivo.rocks/about/)                                                      | ✅ Default           | ✅ Selected charts         | 🔴 React only          | 🟢 MIT                                                                                              |
| [Highcharts](https://www.highcharts.com/docs/getting-started/system-requirements)      | ✅ Default           | ✅ Boost WebGL             | ✅ Yes                 | 🔴 [Commercial; separate non-commercial terms](https://shop.highcharts.com/license-16.0.pdf)        |
| [Victory](https://commerce.nearform.com/open-source/victory/)                          | ✅ Web               | ✅ Native Skia             | 🔴 React only          | 🟢 MIT                                                                                              |
| [uPlot](https://github.com/leeoniya/uPlot)                                             | 🔴 No renderer       | ✅ Default                 | ✅ Yes                 | 🟢 MIT                                                                                              |
| [Vega-Lite](https://vega.github.io/vega-lite/)                                         | ✅ Yes               | ✅ Canvas                  | ✅ Yes                 | 🟢 BSD-3-Clause                                                                                     |
| [Observable Plot](https://observablehq.com/plot/features/plots)                        | ✅ Default           | 🔴 No first-party renderer | ✅ Yes                 | 🟢 ISC                                                                                              |
| [Bklit UI](https://bklit.com/docs/installation)                                        | ✅ Default           | 🔴 No renderer             | 🔴 React only          | 🟡 [MIT components; proprietary Studio](https://github.com/bklit/bklit-ui#license)                  |
| [AG Charts](https://www.ag-grid.com/charts/javascript/installation/)                   | 🔴 No renderer       | ✅ Default                 | ✅ Yes                 | 🟡 [MIT Community; paid Enterprise](https://www.ag-grid.com/charts/javascript/licensing/)           |

A checkmark means the named path exists; it does not claim identical defaults,
accessibility, output, or performance.

The standard suite exercises axes, guides, tooltips, legends, and multi-series
composition. Selection, animation, and resize paths are recorded but excluded
from timing. Renderer and framework rows follow each package's documented
output model.
