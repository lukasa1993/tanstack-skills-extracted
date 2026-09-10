# Dom Host — Host options

[Guide and prerequisites](./charts-docs-reference-dom-host-md-10380040.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Host options

The default SVG host requires `definition` and `ariaLabel`.

| Option               | Default                 | Meaning                                                                                                               |
| -------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `definition`         | Required                | [Chart definition](./charts-docs-reference-chart-definitions-md-6855d09b.md#source-charts-docs-reference-chart-definitions-md). Its identity is the application update boundary.                          |
| `ariaLabel`          | Required                | Accessible chart name placed on the SVG.                                                                              |
| `ariaDescription`    | None                    | Optional SVG description.                                                                                             |
| `height`             | Container or `320`      | Fixed scene height in CSS pixels. When absent, a valid aspect ratio, then positive container content height, owns it. |
| `aspectRatio`        | None                    | Computes height as `width / aspectRatio` when `height` is absent and the ratio is positive and finite.                |
| `width`              | Container content width | Fixed scene width. Supplying it disables width observation.                                                           |
| `initialWidth`       | `640`                   | Width used when a responsive container has not produced a positive measurement.                                       |
| `className`          | None                    | Extra class on the rendered chart surface, not the container.                                                         |
| `idPrefix`           | Empty                   | Prefix for renderer-owned resource IDs. Use a unique value for resource-aware charts.                                 |
| `tabIndex`           | `0`                     | SVG tab index while keyboard behavior is enabled.                                                                     |
| `onFocusChange`      | None                    | Receives the primary focused point or `null`.                                                                         |
| `onFocusGroupChange` | None                    | Receives all points selected by the current focus strategy.                                                           |
| `onSelect`           | None                    | Receives the clicked or keyboard-activated point, or `null` for an empty click.                                       |
| `onRender`           | None                    | Runs after reconciliation with the container, default SVG, complete surface, scene, and interaction controller.       |
| `renderSvg`          | `renderChartSvg`        | Replaces the scene-to-SVG renderer.                                                                                   |
| `measureText`        | DOM font measurer       | Replaces guide text measurement.                                                                                      |

The definition owns these chart controls:

| Option             | Default                   | Meaning                                                                                                       |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `maxFocusDistance` | `48`                      | Maximum scene-pixel distance for default pointer focus                                                        |
| `focus`            | Nearest point             | Pointer grouping and keyboard navigation strategy; `false` disables chart-owned focus and its generated layer |
| `focusRing`        | `true`                    | Generated primary-point indicator; an options object styles it and `false` keeps authored focus layers only   |
| `cursor`           | None                      | Focus-snapped or free application-owned cursor binding                                                        |
| `spatialIndex`     | Linear nearest-point scan | Dense-data nearest-point index                                                                                |
| `svgAnimation`     | `false`                   | Keyed attribute, enter, and exit animation                                                                    |
| `pointer`          | `true`                    | Automatic pointer focus, leave, and click handling                                                            |
| `keyboard`         | `true`                    | Keyboard focus and navigation                                                                                 |
| `tooltip`          | `false`                   | Built-in DOM tooltip content, placement, layering, and pinning                                                |

Definition `keyboard: false` takes precedence over host `tabIndex`. A negative
custom tab index can keep chart keyboard behavior available for programmatic
focus without placing the chart in the normal tab order.

Interaction options are detailed in
[Focus and interaction](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md). Renderer and animation
options are detailed in [Rendering and export](./charts-docs-reference-rendering-and-export-md-ef854527.md#source-charts-docs-reference-rendering-and-export-md).
