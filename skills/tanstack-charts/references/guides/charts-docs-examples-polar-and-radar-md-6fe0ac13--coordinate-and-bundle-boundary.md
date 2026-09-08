# Polar And Radar — Coordinate and bundle boundary

[Guide and prerequisites](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Coordinate and bundle boundary

`polar()` is a positionless container mark. It resolves one center and radius,
copies configured angle/radius scales, paints guide backgrounds, child marks,
then guide foreground labels, and emits ordinary scene nodes and focus points.
The outer chart therefore omits both Cartesian axes.

The polar entry uses D3 arc and radial path generators internally. Application
source can use compact angle and radius scales or upgrade either one to
`d3-scale`; curve factories and application-owned pie layout can come directly
from `d3-shape`. See
[Polar Marks](./charts-docs-reference-marks-polar-md-29a92849.md#source-charts-docs-reference-marks-polar-md) for the complete API and
[Bundle Size and Performance](./charts-docs-guides-bundle-size-and-performance-md-023dab9e.md#source-charts-docs-guides-bundle-size-and-performance-md) for
the isolated consumer budgets.

`radialArc` also accepts existing D3 pie DTOs as interoperability input; native
`pie` is preferred when flat fields, transform lineage, and direct gap
semantics are wanted.
