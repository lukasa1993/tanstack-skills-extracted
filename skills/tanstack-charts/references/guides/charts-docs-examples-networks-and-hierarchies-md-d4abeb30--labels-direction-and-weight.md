# Networks And Hierarchies — Labels, direction, and weight

[Guide and prerequisites](./charts-docs-examples-networks-and-hierarchies-md-d4abeb30.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Labels, direction, and weight

- Use arrowheads only for genuinely directed edges.
- Encode link weight sparingly; wide overlapping links can hide nodes.
- Label selected or important nodes instead of every node in a dense graph.
- Use color for stable semantic groups, not whichever cluster happens to be
  near another after a simulation.
- Provide a searchable list or details panel for nodes that cannot be labeled
  directly.

Custom link paths or non-cartesian layouts may need a public custom mark. Start
with built-in links, dots, and text, then use
[Custom Marks and Renderers](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md#source-charts-docs-guides-custom-marks-and-renderers-md) only for
geometry that composition cannot express.
