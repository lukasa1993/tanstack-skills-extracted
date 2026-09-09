# Transforms — Functions

[Guide and prerequisites](./charts-docs-reference-transforms-md-6acdd0ab.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Functions

| Export                     | Result                                                   |
| -------------------------- | -------------------------------------------------------- |
| `fold`                     | Wide rows repeated into authored field/value pairs       |
| `groupBy`                  | Named group fields, reducer outputs, and lineage         |
| `binX`, `binY`             | Numeric intervals on one axis                            |
| `binXY`                    | Numeric cells with x and y intervals                     |
| `binTimeX`, `binTimeY`     | Calendar-aligned intervals from a supplied time interval |
| `rollingWindow`            | Flat input rows extended with rolling outputs            |
| `cumulative`               | Flat input rows extended with running outputs            |
| `rank`                     | Flat input rows extended with ranks                      |
| `normalize`                | Flat input rows extended with normalized values          |
| `select`                   | Selected original rows                                   |
| `stackRowsX`, `stackRowsY` | Flat input rows extended with stack endpoints            |
| `mosaicX`, `mosaicY`       | Two normalized proportional interval dimensions          |
| `boxRows`                  | Tukey summary and outlier rows by category               |
| `linearRegressionRowsX/Y`  | Sampled least-squares fits and confidence bounds         |
| `waterfall`                | Ordered signed contributions as cumulative intervals     |
| `quantile`                 | A reusable quantile reducer factory                      |
| `treeLayout`               | Tidy-tree node and link rows in semantic coordinates     |
| `forceLayout`              | Settled nodes, resolved links, and padded x/y domains    |

Granular entry points are:

- `@tanstack/charts/transform`
- `@tanstack/charts/transform/bin`
- `@tanstack/charts/transform/bin-time`
- `@tanstack/charts/transform/bin-xy`
- `@tanstack/charts/transform/cumulative`
- `@tanstack/charts/transform/fold`
- `@tanstack/charts/transform/group`
- `@tanstack/charts/transform/mosaic`
- `@tanstack/charts/transform/normalize`
- `@tanstack/charts/transform/rank`
- `@tanstack/charts/transform/reduce`
- `@tanstack/charts/transform/select`
- `@tanstack/charts/transform/stack`
- `@tanstack/charts/transform/waterfall`
- `@tanstack/charts/transform/rolling-window`
- `@tanstack/charts/box`
- `@tanstack/charts/regression`
- `@tanstack/charts/hierarchy/tree`
- `@tanstack/charts/network/force`

Numeric, two-dimensional, and calendar bins are separate so specialized
binning does not enlarge an ordinary histogram.

Numeric `thresholds` accepts a count, complete boundary array, or a
D3-compatible threshold callback such as `thresholdScott`.

Collection transforms use action names such as `fold`, `groupBy`,
`rollingWindow`, and `normalize`. A `*RowsX` or `*RowsY` name is reserved for
prepared rows paired with a same-named mark family, such as `boxRows` and
`linearRegressionRowsX/Y`. Reducers remain scoped to the reduce entry and use
analytical names such as `delta`.
