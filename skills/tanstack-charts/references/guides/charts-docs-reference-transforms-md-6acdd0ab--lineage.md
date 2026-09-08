# Transforms — Lineage

[Guide and prerequisites](./charts-docs-reference-transforms-md-6acdd0ab.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Lineage

Aggregations expose `source` and `sourceIndexes`. Row-extending transforms
expose the source rows used for that derived value. This supports inspection,
tooltips, drill-down, and subsequent transforms without renderer knowledge.

Lineage is direct to the immediate input. In a `fold` → `normalize` pipeline,
the normalized row points to its folded input, and that folded row points to
the original source row. `select` returns the chosen input rows unchanged.

See [Transforms and Reactivity](./charts-docs-guides-transforms-and-reactivity-md-38773ca5.md#source-charts-docs-guides-transforms-and-reactivity-md) for
composition and memoization guidance.
