# Networks And Hierarchies — Partition hierarchy depth

[Guide and prerequisites](./charts-docs-examples-networks-and-hierarchies-md-d4abeb30.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Partition hierarchy depth

A sunburst uses angle for aggregate branch value and radius for hierarchy
depth. It preserves more depth structure than a treemap, but arc length is
harder to compare precisely than aligned area or position.

Use the exact optional [`sunburst` mark](./charts-docs-reference-marks-sunburst-md-ebf0a51e.md#source-charts-docs-reference-marks-sunburst-md) inside
`polar`. It accepts the same path or explicit parent-reference hierarchy input
as the other hierarchy entries, aggregates values, and allocates its sectors
after the final polar radius resolves. Use `branchId` for inherited branch
color and direct `SunburstNode` lineage for tooltips and state callbacks.

For a large hierarchy, keep the complete source data but show only the next
one or two levels below a controlled root.

<!-- ::chart-example id=126-drillable-sunburst height=480 -->

Set `rootId` to the selected node and `visibleDepth` to the number of descendant
rings. `onSelect` receives the same semantic node for pointer and keyboard
activation. The application owns the selected root and back control; the mark
retains aggregate values and stable node keys. With the motion renderer,
shared descendants interpolate their angles and radii while remaining centered
sectors. Newly revealed nodes unfold from their disappearing parent sector,
and drill-up reverses that relationship.
