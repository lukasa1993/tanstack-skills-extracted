# Index

<a id="source-charts-docs-examples-index-md"></a>

Release-matched documentation · `@tanstack/charts@0.18.0`.

[Topic index](../examples-core.md) · [Source provenance](../SOURCES.md)

The gallery is organized by analytical question, not by package export. Start
with what the reader needs to compare, then open the family page for examples
and implementation guidance.

Each runnable chart resolves a canonical catalog case from this repository.
The examples demonstrate complete compositions, while the concept and reference
pages remain the source of truth for individual APIs.

## Choose a family

| Question                                                                         | Example family                                                        |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| How does a value change over an ordered domain?                                  | [Lines and Areas](./charts-docs-examples-lines-and-areas-md-f56bb4ec.md#source-charts-docs-examples-lines-and-areas-md)                               |
| Which categories are largest, smallest, or most changed?                         | [Bars and Rankings](./charts-docs-examples-bars-and-rankings-md-28e82163.md#source-charts-docs-examples-bars-and-rankings-md)                           |
| How are quantitative measures related?                                           | [Scatterplots and Relationships](./charts-docs-examples-scatterplots-and-relationships-md-dfd185c2.md#source-charts-docs-examples-scatterplots-and-relationships-md) |
| What is the shape, spread, or rank of a quantitative variable?                   | [Distributions](./charts-docs-examples-distributions-md-84a67bfd.md#source-charts-docs-examples-distributions-md)                                   |
| Where are values concentrated across a matrix or plane?                          | [Heatmaps and Densities](./charts-docs-examples-heatmaps-and-densities-md-a788d416.md#source-charts-docs-examples-heatmaps-and-densities-md)                 |
| What span, uncertainty, or open-high-low-close interval does each row represent? | [Intervals and Financial Charts](./charts-docs-examples-intervals-and-financial-md-5f290ac4.md#source-charts-docs-examples-intervals-and-financial-md)        |
| How does a total divide into contributions?                                      | [Stacked and Composed Charts](./charts-docs-examples-stacked-and-composition-md-e79a97ca.md#source-charts-docs-examples-stacked-and-composition-md)           |
| How should the same encoding repeat across groups?                               | [Facets and Multiple Views](./charts-docs-examples-facets-and-multiple-views-md-e510b301.md#source-charts-docs-examples-facets-and-multiple-views-md)           |
| How are entities connected or nested?                                            | [Networks and Hierarchies](./charts-docs-examples-networks-and-hierarchies-md-d4abeb30.md#source-charts-docs-examples-networks-and-hierarchies-md)             |
| How do values relate to geographic or projected space?                           | [Maps and Spatial Charts](./charts-docs-examples-maps-and-spatial-md-be409a35.md#source-charts-docs-examples-maps-and-spatial-md)                      |
| How should cyclic or radial dimensions be compared?                              | [Polar and Radar Charts](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md#source-charts-docs-examples-polar-and-radar-md)                        |
| Which thresholds, events, or derived values need explanation?                    | [Annotations and Overlays](./charts-docs-examples-annotations-and-overlays-md-a564e52b.md#source-charts-docs-examples-annotations-and-overlays-md)             |
| How can a reader inspect, select, navigate, or edit the view?                    | [Interactive Charts](./charts-docs-examples-interactive-charts-md-2668d57c.md#source-charts-docs-examples-interactive-charts-md)                         |
| How should charts inherit an application theme and move during updates?          | [Themes and Motion](./charts-docs-examples-themes-and-motion-md-37980877.md#source-charts-docs-examples-themes-and-motion-md)                           |

If two families seem plausible, use
[Choosing a Chart](./charts-docs-guides-choosing-a-chart-md-c305fbfb.md#source-charts-docs-guides-choosing-a-chart-md) to compare the reader task,
data shape, and risks of each encoding.

## Use an example without inheriting accidental choices

An example is a starting composition, not a schema for your data. Preserve your
application rows and replace the example's channels, domains, labels, and
formatters deliberately.

Before adapting a case:

1. Identify what one row represents and which fields are quantitative,
   temporal, ordinal, or nominal.
2. Decide whether the view needs raw observations, prepared summaries, or
   explicit intervals.
3. Supply scales with domains that express the intended comparison.
4. Keep only the marks that answer the question.
5. Verify the smallest supported container, light and dark themes, keyboard
   focus, and update behavior.

[Data and Channels](./charts-docs-concepts-data-and-channels-md-e25a7b78.md#source-charts-docs-concepts-data-and-channels-md) defines the row-to-channel
contract. [Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md) explains which
transforms and scale semantics belong to the application. [Transforms and
Reactivity](./charts-docs-guides-transforms-and-reactivity-md-38773ca5.md#source-charts-docs-guides-transforms-and-reactivity-md) shows how raw observations
become the rows consumed by marks.

## Build from the grammar

Most examples are several small pieces sharing a coordinate system:

- marks encode rows through channels;
- scales map values to visual ranges;
- guides explain those scales;
- layers combine complementary encodings;
- the host handles responsive layout, rendering, focus, and updates.

Read [Grammar of Graphics](./charts-docs-concepts-grammar-of-graphics-md-3b814e73.md#source-charts-docs-concepts-grammar-of-graphics-md) for that model and
[Marks and Layering](./charts-docs-concepts-marks-and-layering-md-cbd6c26d.md#source-charts-docs-concepts-marks-and-layering-md) before replacing a
composition with a custom mark.

For implementation details, use the [API Reference](./charts-docs-reference-index-md-6fc2c6fc.md#source-charts-docs-reference-index-md).
For behavior that crosses chart and application state, use the task-focused
[Guides](./charts-docs-guides-choosing-a-chart-md-c305fbfb.md#source-charts-docs-guides-choosing-a-chart-md).
