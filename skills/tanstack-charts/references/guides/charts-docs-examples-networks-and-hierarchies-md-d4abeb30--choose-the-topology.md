# Networks And Hierarchies — Choose the topology

[Guide and prerequisites](./charts-docs-examples-networks-and-hierarchies-md-d4abeb30.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Choose the topology

| Reader question                                                | Start with                             |
| -------------------------------------------------------------- | -------------------------------------- |
| What is the parent-child structure and depth?                  | Tidy hierarchy tree                    |
| Which positioned observations are spatial neighbors?           | Delaunay adjacency network             |
| Which dependency clusters emerge without fixed positions?      | Force-directed network                 |
| How does quantity split and recombine?                         | Basic Sankey                           |
| How does value move through staged subtotals?                  | Sankey flow diagram                    |
| How large are branches within a strict hierarchy?              | Treemap                                |
| How does branch value divide across hierarchy depth?           | Sunburst                               |
| Must many entities be compared by attributes, not connections? | A table, facets, or quantitative chart |

Layout, traversal, grouping, and collision handling belong to eager data
preparation unless they depend on final chart bounds. TanStack Charts provides
optional static tree and force transforms plus final-layout spatial, hierarchy,
and Sankey marks. [Scales and D3](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md) documents that
boundary.
