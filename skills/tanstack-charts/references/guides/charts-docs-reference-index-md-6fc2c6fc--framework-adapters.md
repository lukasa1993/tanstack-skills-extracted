# Index — Framework adapters

[Guide and prerequisites](./charts-docs-reference-index-md-6fc2c6fc.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Framework adapters

| Framework | Start                                             | Adapter behavior                           | Component API                                                        |
| --------- | ------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| React     | [Quick start](./charts-docs-framework-react-quick-start-md-75004790.md#source-charts-docs-framework-react-quick-start-md)  | [Adapter](./charts-docs-framework-react-adapter-md-173a5842.md#source-charts-docs-framework-react-adapter-md)   | [`Chart`](./charts-docs-framework-react-reference-chart-md-0c0d868c.md#source-charts-docs-framework-react-reference-chart-md)                     |
| Preact    | —                                                 | [Adapter](./charts-docs-framework-preact-adapter-md-66591c4e.md#source-charts-docs-framework-preact-adapter-md)  | [`Chart`](./charts-docs-framework-preact-reference-chart-md-a4765ba0.md#source-charts-docs-framework-preact-reference-chart-md)                    |
| Vue       | —                                                 | [Adapter](./charts-docs-framework-vue-adapter-md-d7e382de.md#source-charts-docs-framework-vue-adapter-md)     | [`Chart`](./charts-docs-framework-vue-reference-chart-md-c55f0cc9.md#source-charts-docs-framework-vue-reference-chart-md)                       |
| Solid     | —                                                 | [Adapter](./charts-docs-framework-solid-adapter-md-cf732459.md#source-charts-docs-framework-solid-adapter-md)   | [`Chart`](./charts-docs-framework-solid-reference-chart-md-18b62c2a.md#source-charts-docs-framework-solid-reference-chart-md)                     |
| Svelte    | —                                                 | [Adapter](./charts-docs-framework-svelte-adapter-md-b9959b13.md#source-charts-docs-framework-svelte-adapter-md)  | [`Chart`](./charts-docs-framework-svelte-reference-chart-md-3ead8997.md#source-charts-docs-framework-svelte-reference-chart-md)                    |
| Angular   | —                                                 | [Adapter](./charts-docs-framework-angular-adapter-md-314154ab.md#source-charts-docs-framework-angular-adapter-md) | [`Chart`](./charts-docs-framework-angular-reference-chart-md-d3a1d893.md#source-charts-docs-framework-angular-reference-chart-md)                   |
| Lit       | —                                                 | [Adapter](./charts-docs-framework-lit-adapter-md-16871155.md#source-charts-docs-framework-lit-adapter-md)     | [`Chart`, `defineChartElement`](./charts-docs-framework-lit-reference-chart-md-ce66ce5f.md#source-charts-docs-framework-lit-reference-chart-md) |
| Alpine    | —                                                 | [Adapter](./charts-docs-framework-alpine-adapter-md-9404e3c3.md#source-charts-docs-framework-alpine-adapter-md)  | [`charts`](./charts-docs-framework-alpine-reference-chart-md-f52f25f9.md#source-charts-docs-framework-alpine-reference-chart-md)                   |
| Octane    | [Quick start](./charts-docs-framework-octane-quick-start-md-de2f4c44.md#source-charts-docs-framework-octane-quick-start-md) | [Adapter](./charts-docs-framework-octane-adapter-md-84d0f010.md#source-charts-docs-framework-octane-adapter-md)  | [`Chart`](./charts-docs-framework-octane-reference-chart-md-5d2228b4.md#source-charts-docs-framework-octane-reference-chart-md)                    |

Every default `Chart` starts with SVG and can opt selected marks into Canvas.
React and Octane also provide `/canvas` entries for a completely Canvas chart
and `/core` entries that require an explicit `ChartRenderer`.
