# Types — Definitions

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Definitions

| Type                                  | Purpose                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `ChartSpec`                           | Marks plus a positional scale registry, guides, color, resources, and layout  |
| `StaticChartDefinition`               | A directly compilable spec with inferred datum and semantic x/y phantom types |
| `ResponsiveChartDefinition`           | Responsive chart builder                                                      |
| `ChartDefinition`                     | Static or responsive union                                                    |
| `ChartDefinitionForTooltipHost`       | Definition restricted to one tooltip host brand                               |
| `DomChartDefinition`                  | Definition compatible with the DOM tooltip host                               |
| `ComposableStaticChartDefinition`     | Static definition safe to embed in a composed view                            |
| `ComposableResponsiveChartDefinition` | Responsive definition safe to embed in a composed view                        |
| `ComposableChartDefinition`           | Static or responsive composable definition                                    |
| `ChartBuildContext`                   | Current size and platform-default build-time theme                            |

The complete overloads and runtime rules are in
[Chart Definition API](./charts-docs-reference-chart-definitions-md-6855d09b.md#source-charts-docs-reference-chart-definitions-md).
