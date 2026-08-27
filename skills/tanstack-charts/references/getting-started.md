# Getting started

Overview, comparison, installation, and quick start.

<a id="source-charts-docs-comparison-md"></a>

## Comparison

Source: `charts:docs/comparison.md`.

The latest published TanStack Charts release is `0.16.0`, while this page
measures unreleased workspace source against pinned competitor packages. This
comparison records architectural differences and reproducible evidence without
turning untested behavior into a checkmark.

### Tested versions

| Library                                                                                | Package              | Measured source     |
| -------------------------------------------------------------------------------------- | -------------------- | ------------------- |
| [TanStack Charts](./getting-started.md#source-charts-docs-overview-md)                                                       | `@tanstack/charts`   | workspace `3df87d7` |
| [Chart.js](https://www.chartjs.org/docs/latest/)                                       | `chart.js`           | npm `4.5.1`         |
| [Apache ECharts](https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/) | `echarts`            | npm `6.1.0`         |
| [Recharts](https://recharts.github.io/en-US/)                                          | `recharts`           | npm `3.10.1`        |
| [Observable Plot](https://observablehq.com/plot/features/plots)                        | `@observablehq/plot` | npm `0.6.17`        |

The competitor versions are exact package pins, not latest versions inferred
at page render time. The measured TanStack workspace revision is `3df87d7`.

### Capability matrix

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
| [TanStack Charts](./getting-started.md#source-charts-docs-overview-md)                                                       | ✅ Built in         | ✅ Built in   | ✅ Built in       | ✅ Built in             | ✅ `onSelect`            | ✅ Built in       | ✅ Observed              | Measured |
| [D3](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md)                                                      | ✅ Modules          | 🟡 Authored   | 🟡 Authored       | ✅ Primitives           | ✅ Brush and events      | ✅ Transitions    | 🟡 Host layout           | Docs     |
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
| [TanStack Charts](./getting-started.md#source-charts-docs-overview-md)                                                       | ✅ Default           | ✅ Optional renderer       | ✅ Core + adapters     | 🟢 MIT                                                                                              |
| [D3](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md)                                                      | ✅ Yes               | ✅ Yes                     | ✅ Yes                 | 🟢 ISC                                                                                              |
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

### Bundle snapshot

Baseline date: `2026-08-26`.

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
| TanStack Charts    | 38.96–44.98 KiB                        |     Not applicable | Controlled suite                                           |
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

### Broader conformance

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

### Evidence and reproduction

- [Standard comparison protocol](https://github.com/TanStack/charts/blob/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/benchmarks/comparison/README.md)
- [Current tracked bundle baseline](https://github.com/TanStack/charts/blob/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/benchmarks/comparison/bundle-baseline.json)
- [Pinned release-source bundle baseline](https://github.com/TanStack/charts/blob/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/benchmarks/comparison/bundle-baseline.json)
- [Stress protocol](https://github.com/TanStack/charts/blob/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/benchmarks/comparison/stress/README.md)
- [Catalog conformance protocol](https://github.com/TanStack/charts/blob/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/benchmarks/conformance/README.md)

```sh
pnpm benchmark:size
pnpm benchmark:check
pnpm benchmark:stress:quick
pnpm conformance:quick
```

The browser-backed commands require the pinned Playwright browser. Read the
[bundle and performance guide](./production.md#source-charts-docs-guides-bundle-size-and-performance-md) before
interpreting results, and use the [migration guide](./production.md#source-charts-docs-guides-migrating-md) to
establish application-specific parity before replacing an existing library.

<a id="source-charts-docs-installation-md"></a>

## Installation

Source: `charts:docs/installation.md`.

These docs follow unreleased `main`, the official Alpha line. The latest
published release is TanStack Charts `0.16.0`; use its
[release-source docs](https://github.com/TanStack/charts/tree/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/docs)
for the exact surface. Alpha releases use regular `0.x` versions and may break
APIs between minor releases. Install TanStack Charts in each application that
authors chart definitions:

```sh
pnpm add @tanstack/charts
```

Add the selected framework peers when the application uses an adapter subpath:

```sh
# React
pnpm add @tanstack/charts react react-dom

# React Native
pnpm add @tanstack/charts react@^19.2.3 react-native@^0.86.0 react-native-svg@^15.15.4

# Preact
pnpm add @tanstack/charts preact

# Vue
pnpm add @tanstack/charts vue

# Solid
pnpm add @tanstack/charts solid-js

# Svelte
pnpm add @tanstack/charts svelte

# Angular
pnpm add @tanstack/charts @angular/core @angular/platform-browser

# Lit
pnpm add @tanstack/charts lit

# Alpine
pnpm add @tanstack/charts alpinejs

# Octane
pnpm add @tanstack/charts octane
```

Definitions and marks come from the package root. Adapter subpaths connect the
shared runtime to a framework lifecycle while preserving separate module-graph
boundaries for tree shaking.

Optional capabilities use exact subpaths from the same package:

```ts
import { contour } from '@tanstack/charts/spatial/contour'
import { focusGuideX } from '@tanstack/charts/focus/guide'
import { brushX } from '@tanstack/charts/interaction/brush'
import { continuousCursor } from '@tanstack/charts/interaction/cursor'
import { handleX } from '@tanstack/charts/interaction/handle'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { zoomX } from '@tanstack/charts/interaction/zoom'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { keyedSelection, whenSelected } from '@tanstack/charts/selection'
import { forceLayout } from '@tanstack/charts/network/force'
import { sankeyDiagram } from '@tanstack/charts/network/sankey'
import { treeLayout } from '@tanstack/charts/hierarchy/tree'
import { treemap } from '@tanstack/charts/hierarchy/treemap'
import { sunburst } from '@tanstack/charts/hierarchy/sunburst'
```

The algorithm-backed subpaths own their `d3-contour`, `d3-force`,
`d3-sankey`, `d3-hierarchy`, `d3-brush`, `d3-zoom`, and `d3-selection`
implementations. The continuous cursor uses resolved scale inversion and adds
no D3 dependency. The scale handle uses the shared candidate-axis kernel and
also adds no D3 dependency. Install a corresponding D3 module in the
application only when application source imports it directly.

Eager transforms also have exact subpaths when a library needs a narrow import:

```ts
import { fold } from '@tanstack/charts/transform/fold'
```

`fold` is implemented by TanStack Charts and does not require an application
D3 dependency.

### Framework compatibility

| Adapter subpath                 | Framework peers                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `@tanstack/charts/react`        | React and React DOM `^19.0.0`                                                   |
| `@tanstack/charts/react-native` | React `^19.2.3`, React Native `^0.86.0`, and `react-native-svg` `>=15.15.4 <16` |
| `@tanstack/charts/preact`       | Preact `>=10`                                                                   |
| `@tanstack/charts/vue`          | Vue `>=3.5`                                                                     |
| `@tanstack/charts/solid`        | Solid `>=1.8`                                                                   |
| `@tanstack/charts/svelte`       | Svelte `^5.20.0`                                                                |
| `@tanstack/charts/angular`      | Angular core and platform browser `>=19`                                        |
| `@tanstack/charts/lit`          | Lit `>=3.1.3`                                                                   |
| `@tanstack/charts/alpine`       | Alpine `>=3.15`                                                                 |
| `@tanstack/charts/octane`       | Octane `^0.1.13`                                                                |

Framework peers are optional at the package level because package managers
cannot scope peers to individual export subpaths. Install only the peers for
the selected adapter. Use the framework's normal renderer or application
package when the application needs browser mounting or server rendering.

### React Native and Expo

The React Native adapter is experimental and renders through
`react-native-svg`. Expo 57 applications can install the package and the SVG
version selected by Expo:

```sh
pnpm add @tanstack/charts
pnpm exec expo install react-native-svg
```

Bare React Native 0.86 applications install the renderer directly:

```sh
pnpm add @tanstack/charts react react-native react-native-svg@^15.15.4
```

Run `bundle exec pod install` from `ios/` after adding it to a bare iOS
application. Metro does not reliably remove unused exports from a large barrel,
so import exact chart capabilities and choose the native host explicitly:

```tsx
import { lineY } from '@tanstack/charts/line'
import { defineChart } from '@tanstack/charts/scene'
import { Chart } from '@tanstack/charts/react-native'
import { tooltip } from '@tanstack/charts/react-native/tooltip'
```

Packed tarballs are typechecked and bundled through default bare React Native
and Expo Metro configurations on iOS and Android. The workspace Expo 57
fixture also renders in Expo Go on an iOS simulator. Native responder and
accessibility cursor behavior has component regression coverage. Bare-native
and Android simulator runs, physical devices, visual parity, and screen-reader
verification are not currently part of the release gate.

### Choose scale capabilities

`@tanstack/charts/scales/*` covers the common numeric linear, band, point, and
ordinal mappings. Import each family from its exact entry:

```ts
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
import { scalePoint } from '@tanstack/charts/scales/point'
```

There is no aggregate `/scales` export. Each exact scale entry includes its own
TypeScript declarations and no D3 runtime dependency.

Use `d3-scale` when a chart needs time or UTC scales, logarithmic, power,
symlog, square-root, radial, sequential, diverging, quantile, quantize, or
threshold scales, piecewise or nonnumeric interpolation, or full D3 formatting
semantics:

```sh
pnpm add d3-scale
pnpm add -D @types/d3-scale
```

TanStack Charts accepts those D3 factories and configured instances through
the same scale contract. Your application must declare every `d3-*` module
that its source imports. Strict package managers do not expose transitive
dependencies as an application import contract.

The core package declares the `d3-array`, `d3-shape`, `d3-geo`, `d3-delaunay`,
`d3-hexbin`, `d3-contour`, `d3-force`, `d3-sankey`, `d3-hierarchy`, `d3-brush`,
and `d3-selection` implementations owned by its transforms, curve and geo
features, and optional spatial, network, hierarchy, and brush entries. They are
normal dependencies, not peer requirements, and bundlers remove unused
algorithms and geometry from application bundles.

Add direct data transforms or shape interpolation only when application source
imports them:

```sh
pnpm add d3-array d3-shape
pnpm add -D @types/d3-array @types/d3-shape
```

Other capabilities remain equally granular:

```sh
# Examples: install only what the application imports
pnpm add d3-geo d3-quadtree d3-delaunay d3-selection d3-zoom d3-brush d3-time d3-scale-chromatic
pnpm add -D @types/d3-geo @types/d3-quadtree @types/d3-delaunay @types/d3-selection @types/d3-zoom @types/d3-brush @types/d3-time @types/d3-scale-chromatic
```

Do not install the `d3` umbrella package just because a chart uses one D3 capability. Named modules keep ownership visible and make the measured consumer bundle reflect the chart that was actually authored. [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) is the single guide to this boundary and links to the corresponding official D3 documentation.

### Package-manager examples

The same package contains the core, compact scales, adapters, and optional
capability subpaths:

```sh
# npm
npm install @tanstack/charts

# yarn
yarn add @tanstack/charts

# pnpm
pnpm add @tanstack/charts

# bun
bun add @tanstack/charts
```

Install the selected adapter's required framework peers. A shared definition
can move between adapter subpaths without changing marks, channels, scales, or
captured data.

### Import boundaries

Use the package root for ordinary application authoring:

```ts
import { defineChart, lineY, mountChart } from '@tanstack/charts'
```

Use subpath exports when an authored library needs a hard capability boundary:

```ts
import { lineY } from '@tanstack/charts/line'
import { mountChart } from '@tanstack/charts/dom'
import { renderChartSvg } from '@tanstack/charts/svg'
```

Use the universal barrel when definitions and scene compilation must not make
the browser host reachable:

```ts
import {
  createChartRuntime,
  defineChart,
  lineY,
} from '@tanstack/charts/universal'
import type { ChartDefinition } from '@tanstack/charts/types'
```

The root remains the browser-oriented compatibility entry. Subpaths expose the
same contracts behind explicit capability boundaries.

Optional capabilities have explicit entries:

```ts
import { d3Curve } from '@tanstack/charts/d3/shape'
import { renderChartImage } from '@tanstack/charts/export'
import { focusGroupX } from '@tanstack/charts/focus'
import { tooltip } from '@tanstack/charts/tooltip'
import { portal } from '@tanstack/charts/tooltip/portal'
import { mountCanvasChart } from '@tanstack/charts/canvas'
import { mountChartRenderer } from '@tanstack/charts/renderer'
import { polar, radialArc } from '@tanstack/charts/polar'
import { geoShape } from '@tanstack/charts/geo'
```

Canvas remains optional in framework code too:

```tsx
import { Chart as ReactCanvasChart } from '@tanstack/charts/react/canvas'
import { Chart as ReactRendererChart } from '@tanstack/charts/react/core'
import { Chart as OctaneCanvasChart } from '@tanstack/charts/octane/canvas'
import { Chart as OctaneRendererChart } from '@tanstack/charts/octane/core'
```

The default entries are SVG-based. React and Octane currently provide the
optional `/canvas` and `/core` entries.

Polar and geographic marks are intentionally absent from the package root.
Their subpaths keep `d3-shape` and `d3-geo` unreachable from ordinary
Cartesian consumers.

### TypeScript

TanStack Charts, including its compact scale entries, ships its own
declarations. Install the matching `@types/d3-*` package for each D3 module your
TypeScript source imports.

Normal chart authoring should not require adapter generics or casts:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { defineChart, lineY } from '@tanstack/charts'

const values = [4, 9, 7]

const chart = defineChart({
  marks: [lineY(values)],
  scales: {
    x: { scale: scaleLinear },
    y: { scale: scaleLinear },
  },
})
```

If a channel or scale does not type-check, correct the source type, field, accessor, scale domain, or definition. The [TypeScript guide](./chart-grammar.md#source-charts-docs-guides-typescript-md) covers inference and advanced custom marks.

### Browser and server requirements

Chart definitions, scene creation, and SVG string rendering do not require a
browser. The vanilla hosts require normal DOM APIs and use `ResizeObserver`
when width is responsive. Canvas rendering additionally requires Canvas 2D;
curved, polar, and geographic path data requires `Path2D`. React and Octane
Canvas entries emit an accessible shell on the server, then paint pixels and
connect the shared host on the client.

Use `initialWidth` for deterministic server and hidden-container output. See [SSR and Hydration](./production.md#source-charts-docs-guides-ssr-and-hydration-md) for adapter-specific setup.

### Verify the installation

Create a small scene without mounting it:

<!-- docs-example: installation-check typecheck -->

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { createChartScene, defineChart, lineY } from '@tanstack/charts'

const chart = defineChart({
  marks: [lineY([2, 5, 3])],
  scales: {
    x: { scale: scaleLinear },
    y: { scale: scaleLinear },
  },
})

const scene = createChartScene(chart, { width: 640, height: 320 })

console.log(scene.chart, scene.points.length)
```

Both positional scales are required. A missing scale is an authoring error rather than a hidden fallback.

Continue with the [Quick Start](./getting-started.md#source-charts-docs-quick-start-md), then open the adapter page
for the framework that owns the chart component.

<a id="source-charts-docs-overview-md"></a>

## Overview

Source: `charts:docs/overview.md`.

These docs follow unreleased `main`, the official Alpha line. The latest
published TanStack Charts release is `0.16.0`. Alpha uses regular `0.x`
versions, and APIs may change between minor releases. See
[Alpha stability](./other-guides.md#source-charts-docs-stability-md) for the release contract.

TanStack Charts is a small, framework-agnostic chart grammar for TypeScript and
JavaScript. Give each mark its natural data, map fields or accessors to visual
channels, and use compact scales to define common numeric and categorical
axes. TanStack Charts compiles that declaration into a responsive, keyed scene
and renders accessible SVG by default, with Canvas available as an opt-in
surface.

TanStack Charts builds on the grammar-of-graphics tradition established by
[Leland Wilkinson](https://doi.org/10.1007/0-387-28695-0) and developed through
projects such as [ggplot2](https://ggplot2.tidyverse.org/),
[Vega-Lite](https://vega.github.io/vega-lite/), and
[Observable Plot](https://observablehq.com/plot/). Observable Plot is the
closest API influence for mark-local data, channels, and layered composition.
TanStack Charts applies those ideas to typed application infrastructure with
explicit scale and algorithm boundaries, responsive scene compilation, and
framework lifecycle.

The library is designed for two equally important authors:

- People should get polished, responsive charts from a short declaration.
- AI should be able to compose, inspect, and modify charts without learning an application-specific series model or guessing at hidden behavior.

The same definition can feed the vanilla DOM host and framework adapters.
React and Octane also provide optional Canvas entries; the experimental React
Native adapter consumes definitions from the universal entry.

### A chart is a composition

```ts group=overview-composition env=charts file=/src/chart.ts entry
import { defineChart, dot, lineY } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const signups = [
  { month: 'Jan', value: 42 },
  { month: 'Feb', value: 58 },
  { month: 'Mar', value: 51 },
  { month: 'Apr', value: 73 },
  { month: 'May', value: 86 },
]

export default defineChart({
  marks: [
    lineY(signups, {
      x: 'month',
      y: 'value',
      stroke: '#2563eb',
      strokeWidth: 2,
    }),
    dot(signups, {
      x: 'month',
      y: 'value',
      fill: '#2563eb',
      r: 4,
    }),
  ],
  scales: {
    x: {
      scale: () => scaleBand<string>().padding(0.2),
    },
    y: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: { label: 'Signups' },
    },
  },
})
```

The line and dots use the same rows and scales. Their array order puts the
points above the line. [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) explains when to
replace these compact scales with specialized mappings.

### What TanStack Charts owns

TanStack Charts owns the parts that make a declarative chart reliable inside an application:

- A grammar of typed marks, channels, scales, guides, and layers
- Container-responsive pixel ranges and automatic guide margins
- A renderer-neutral scene with stable keys
- Default SVG rendering, keyed DOM reconciliation, optional Canvas painting,
  and interruptible animation
- Pointer and keyboard focus, selection callbacks, and built-in tooltips
- Framework-agnostic runtime state with thin framework adapters
- Light and dark mode defaults based on inherited color and CSS variables
- Public extension points for custom marks, focus strategies, spatial indexes, and renderers

### Keep ownership explicit

TanStack Charts keeps data preparation explicit and optional algorithms behind
narrow imports.

| Responsibility                                                                                         | Owner                                                            |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Common numeric and categorical scale mappings                                                          | Exact `@tanstack/charts/scales/*` subpaths                       |
| Common group, bin, rollingWindow, normalize, select, and row-stack transforms                          | TanStack's eager data-transform helpers                          |
| Temporal, nonlinear, piecewise, spatial, and other specialized algorithms                              | Exact TanStack entries, granular D3 modules, or application code |
| Fetching, cleaning, profiling, and exploratory analysis                                                | Your data layer, server, or AI workflow                          |
| Mark-channel domain inference, responsive ranges, guide layout, scenes, rendering, and chart lifecycle | TanStack Charts                                                  |
| Page controls, queries, filters, persistence, memoization, and application state                       | Your application                                                 |

Prepared data can come from TanStack transforms, D3, SQL, a server, or
ordinary TypeScript; marks consume it without requiring a special series
container.

### Defaults for the common case

The normal path is intentionally short:

- Omit `width` to follow the chart container.
- Omit `margin` to measure axes, tick labels, rotation, and titles automatically.
- Supply `ariaLabel`; keyboard focus is enabled by default.
- Add the `tooltip` extension when a built-in value tooltip is enough.
- Start with compact linear, band, point, and ordinal scales; upgrade only the
  scale that needs fuller D3 semantics.
- Let built-in marks infer stable identity from IDs or unique positions; supply
  a stable `key` when that identity is unavailable or can change.
- Let field names, datum types, scales, interaction points, and adapters infer without casts.
- Use inherited `currentColor` and the `--ts-chart-*` CSS variables for automatic theme integration.

Every automatic behavior has an explicit escape hatch. The [Guides](./production.md#source-charts-docs-guides-responsive-charts-md) cover those controls by task rather than repeating the API reference.

### Package subpaths

Install only `@tanstack/charts`. Its ESM subpaths expose compact scales,
framework adapters, renderers, and optional capabilities while preserving
their tree-shakeable module boundaries. For example, React uses
`@tanstack/charts/react`, React Native uses
`@tanstack/charts/react-native`, and compact linear scales use
`@tanstack/charts/scales/linear`.

### Where to go next

- [Compare Libraries](./getting-started.md#source-charts-docs-comparison-md) — evaluate Chart.js, Apache ECharts, Recharts, Observable Plot, and TanStack Charts against the pinned evidence.
- [Installation](./getting-started.md#source-charts-docs-installation-md) — install Charts, framework peers, and any D3 modules your source imports directly.
- [Quick Start](./getting-started.md#source-charts-docs-quick-start-md) — define, mount, update, and destroy a responsive chart.
- [Grammar of Graphics](./chart-grammar.md#source-charts-docs-concepts-grammar-of-graphics-md) — understand how data, marks, channels, scales, and layers fit together.
- [Choosing a Chart](./chart-grammar.md#source-charts-docs-guides-choosing-a-chart-md) — start from the analytical question.
- [Example Gallery](./examples-core.md#source-charts-docs-examples-index-md) — run and edit complete compositions.
- [Migrating](./production.md#source-charts-docs-guides-migrating-md) — preserve semantics and establish parity before removing an existing renderer.
- [AI Authoring](./production.md#source-charts-docs-guides-ai-authoring-md) — give an agent the smallest reliable path from intent to verified output.

<a id="source-charts-docs-quick-start-md"></a>

## Quick Start

Source: `charts:docs/quick-start.md`.

This walkthrough uses the framework-agnostic DOM host. The same chart
definition passes unchanged to any supported
[framework adapter](./getting-started.md#source-charts-docs-installation-md).

Install TanStack Charts:

```sh
pnpm add @tanstack/charts
```

### 1. Add a chart container

```html
<div id="monthly-revenue-chart"></div>
```

The host follows the container width when `width` is omitted.

### 2. Define the data and chart

<!-- docs-example: core-quick-start typecheck -->

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { defineChart, lineY, mountChart } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'

interface RevenueMonth {
  month: string
  revenue: number
}

const monthlyRevenue: readonly RevenueMonth[] = [
  { month: 'Jan', revenue: 42_000 },
  { month: 'Feb', revenue: 58_000 },
  { month: 'Mar', revenue: 76_000 },
  { month: 'Apr', revenue: 64_000 },
  { month: 'May', revenue: 81_000 },
]

const monthlyRevenueChart = defineChart({
  marks: [
    lineY(monthlyRevenue, {
      id: 'monthly-revenue',
      x: 'month',
      y: 'revenue',
      points: true,
      stroke: '#2563eb',
    }),
  ],
  scales: {
    x: {
      scale: () => scalePoint<string>().padding(0.2),
      axis: { label: 'Month' },
    },
    y: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: { label: 'Revenue (USD)' },
    },
  },

  tooltip,
})
```

The compact point and linear scales cover this categorical and numeric chart
without a D3 dependency. The original revenue row flows through the mark and
into interaction callbacks; no cast or manual chart generic is needed.

### 3. Mount it

```ts
const container = document.querySelector<HTMLElement>('#monthly-revenue-chart')

if (!container) {
  throw new Error('Missing #monthly-revenue-chart container')
}

const options = {
  definition: monthlyRevenueChart,
  height: 360,
  initialWidth: 640,
  ariaLabel: 'Monthly revenue',
}

const host = mountChart(container, options)
```

`initialWidth` is the deterministic fallback for server output, hidden containers, and the first frame before measurement. Once visible, the host uses `ResizeObserver` to follow the container.

### 4. Update the chart

Host options only cover mounting concerns such as size and accessibility:

```ts
host.update({
  ...options,
  height: 420,
})
```

When data, visual options, focus, tooltips, keyboard policy, or animation
change, create a new definition and pass it to `host.update`. In a framework
component, memoize the complete definition against the values it captures. See
[Chart definitions](./chart-grammar.md#source-charts-docs-concepts-chart-definitions-md).

### 5. Clean up

```ts
host.destroy()
```

Destroying the host removes observers, event listeners, animations, tooltips, and chart markup. Framework adapters do this automatically during unmount.

### What the declaration means

- `lineY(monthlyRevenue, ...)` chooses a line mark and keeps each source row as
  the interaction datum.
- `x: 'month'` and `y: 'revenue'` map existing source fields.
- The unique month gives each observation stable positional identity across updates.
- Compact scale factories infer domains from mark channels and own mapping behavior.
- TanStack Charts copies those scales and assigns responsive pixel ranges.
- `label`, `format`, and `grid` configure the axis guide without changing the scale.
- Omitted margins are measured automatically from the rendered labels and titles.
- `ariaLabel` names the chart; pointer and keyboard focus use the same inferred points.

Read [Grammar of Graphics](./chart-grammar.md#source-charts-docs-concepts-grammar-of-graphics-md) for the full model, then browse the [Example Gallery](./examples-core.md#source-charts-docs-examples-index-md) for complete compositions.
