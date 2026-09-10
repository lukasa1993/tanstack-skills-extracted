# Networks And Hierarchies — Customize a Sankey

[Guide and prerequisites](./charts-docs-examples-networks-and-hierarchies-md-d4abeb30.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Customize a Sankey

A Sankey diagram makes conservation and decomposition visible at the same
time: link width carries quantity, while each node marks a meaningful subtotal
or outcome. This Apple FY22 income statement follows product and service
revenue through gross profit, operating costs, operating profit, and net
profit.

<!-- ::chart-example id=111-sankey-flow height=500 -->

`sankeyDiagram` owns the responsive flow layout, D3 mutation isolation,
endpoint resolution, proportional widths, identity, and source lineage. Its
`marks` callback keeps the income statement's authored order, compact wording,
label side, two-line values, backdrops, title, and semantic colors beside the
native `link`, `rect`, and `text` definitions. The application does not import
`d3-sankey`; the exact Charts subpath keeps it out of unrelated consumers.

Keep every intermediate subtotal balanced. Use direct labels and tone as well
as color so profit and cost paths remain identifiable. See the
[Sankey diagram reference](./charts-docs-reference-marks-sankey-md-7c353525.md#source-charts-docs-reference-marks-sankey-md) for responsive layout
options and immutable node/link fields.
