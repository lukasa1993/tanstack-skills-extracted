# Custom Marks And Renderers — Custom focus and spatial indexes

[Guide and prerequisites](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Custom focus and spatial indexes

A `ChartFocusStrategy` owns pointer resolution, grouping, and keyboard
navigation. Pointer coordinates and the point being grouped arrive through
the second context bag. Its generic types must remain identical to the chart
points it receives.

A `ChartSpatialIndexFactory` builds optional nearest-point acceleration from
scene points and receives the complete resolved scene through
`context.scene`. Return original typed points from the index. Do not erase
them to `unknown` and cast them back in callbacks.
