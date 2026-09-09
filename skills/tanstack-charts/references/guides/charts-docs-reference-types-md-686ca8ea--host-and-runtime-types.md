# Types — Host and runtime types

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Host and runtime types

| Type                             | Purpose                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `ChartHostCommonOptions`         | Accessibility, sizing, callbacks, and SVG renderer options                       |
| `ChartHostOptions`               | Common options plus a chart definition                                           |
| `ChartHost`                      | SVG host `interaction`, `update`, `getScene`, and `destroy`                      |
| `ChartRendererHostCommonOptions` | Renderer-neutral common options plus required renderer                           |
| `ChartRendererHostOptions`       | Renderer-neutral options plus a chart definition                                 |
| `ChartRendererHost`              | Renderer-neutral `interaction`, `update`, `getScene`, and `destroy`              |
| `ChartRuntime`                   | Repeated static or responsive scene rendering                                    |
| `ChartRuntimeOptions`            | Platform theme shared by responsive building and scene compilation               |
| `ChartRenderContext`             | Container, live default SVG, complete surface, scene, and interaction controller |
| `ChartRendererRenderContext`     | Container, live surface, scene, and interaction controller                       |

See [DOM host](./charts-docs-reference-dom-host-md-10380040.md#source-charts-docs-reference-dom-host-md) and
[Runtime and scene](./charts-docs-reference-runtime-and-scene-md-e3fcc593.md#source-charts-docs-reference-runtime-and-scene-md).
