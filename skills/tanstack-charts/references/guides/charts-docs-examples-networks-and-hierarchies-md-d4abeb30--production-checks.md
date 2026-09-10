# Networks And Hierarchies — Production checks

[Guide and prerequisites](./charts-docs-examples-networks-and-hierarchies-md-d4abeb30.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Production checks

- Confirm that links represent a documented relationship.
- Bound node and edge counts or aggregate the graph before rendering.
- Keep node and edge IDs stable across revisions.
- Make layout initialization and ordering deterministic when comparison
  matters.
- Test disconnected nodes, cycles, missing parents, duplicate edges, and empty
  graphs.
- Do not rely on color or pointer hover as the only identification path.
- Preserve keyboard focus and selection after layout updates.
- Measure dense cases with [Large Data](./charts-docs-guides-large-data-md-937914ac.md#source-charts-docs-guides-large-data-md).
