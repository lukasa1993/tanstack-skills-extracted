# Types — Rendering types

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Rendering types

| Type                                   | Purpose                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| `RenderChartOptions`                   | Renderer-neutral accessible name, description, class, tab index, and ID prefix |
| `RenderChartSvgOptions`                | SVG specialization of `RenderChartOptions`                                     |
| `ChartSurfaceRenderOptions`            | Render options plus optional animation                                         |
| `ChartSurface`                         | Mounted root, optional child layers, painting, coordinates, focus, and cleanup |
| `ChartRenderer`                        | Server shell and browser-surface renderer contract                             |
| `ChartLayerRenderer`                   | DOM renderer that can compose itself with the host renderer                    |
| `UniversalChartLayerRenderer`          | Definition-agnostic form of `ChartLayerRenderer`                               |
| `ChartRendererCapabilities`            | Optional structural services supplied by a renderer                            |
| `ChartRendererTooltipMotionCapability` | Versioned factory for an injected tooltip motion controller                    |
| `ChartTooltipMotionController`         | Tooltip paint, hide, and cleanup motion lifecycle                              |
| `ChartTooltipMotionSnapshot`           | Tooltip position, velocity, and presence state before repaint                  |
| `ChartSvgRenderer`                     | Scene-to-SVG string function                                                   |
| `ChartAnimationOptions`                | Duration, easing, and reduced-motion policy                                    |

See [Rendering and export](./charts-docs-reference-rendering-and-export-md-ef854527.md#source-charts-docs-reference-rendering-and-export-md).
