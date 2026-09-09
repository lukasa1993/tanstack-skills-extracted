# Custom Extensions — Custom focus and gestures

[Guide and prerequisites](./charts-docs-reference-custom-extensions-md-9e8eefa0.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Custom focus and gestures

`ChartFocusStrategy` owns pointer resolution, focus grouping, and keyboard task
order. Its `resolve(points, context)` and `group(points, context)` methods keep
coordinates and the active point in named context bags. Rich gestures can
instead disable chart-owned focus and maintain selection or viewport state in
the application.

See [Focus and interaction](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md).
