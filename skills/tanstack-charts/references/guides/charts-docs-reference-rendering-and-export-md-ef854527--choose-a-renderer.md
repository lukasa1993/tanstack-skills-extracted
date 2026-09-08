# Rendering And Export — Choose a renderer

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Choose a renderer

Renderer code stays behind explicit entry points:

| Use                              | Import                                                |
| -------------------------------- | ----------------------------------------------------- |
| Default vanilla SVG host         | `mountChart` from `@tanstack/charts/dom`              |
| Vanilla Canvas host              | `mountCanvasChart` from `@tanstack/charts/canvas`     |
| Tween and spring SVG renderer    | `motion` from `@tanstack/charts/motion`               |
| Renderer-neutral host            | `mountChartRenderer` from `@tanstack/charts/renderer` |
| Default React SVG component      | `Chart` from `@tanstack/charts/react`                 |
| Default Preact SVG component     | `Chart` from `@tanstack/charts/preact`                |
| Default Vue SVG component        | `Chart` from `@tanstack/charts/vue`                   |
| Default Solid SVG component      | `Chart` from `@tanstack/charts/solid`                 |
| Default Svelte SVG component     | `Chart` from `@tanstack/charts/svelte`                |
| Default Angular SVG component    | `Chart` from `@tanstack/charts/angular`               |
| Default Lit SVG element          | `Chart` from `@tanstack/charts/lit`                   |
| Default Alpine SVG directive     | `charts` from `@tanstack/charts/alpine`               |
| React Native SVG component       | `Chart` from `@tanstack/charts/react-native`          |
| React Canvas component           | `Chart` from `@tanstack/charts/react/canvas`          |
| React custom-renderer component  | `Chart` from `@tanstack/charts/react/core`            |
| Default Octane SVG component     | `Chart` from `@tanstack/charts/octane`                |
| Octane Canvas component          | `Chart` from `@tanstack/charts/octane/canvas`         |
| Octane custom-renderer component | `Chart` from `@tanstack/charts/octane/core`           |

The default package and adapter entries do not import Canvas. Applications pay
for it only when they import a Canvas entry. Motion is likewise isolated behind
`@tanstack/charts/motion`. The `/core` adapter entries accept an explicit
`renderer` without choosing one for the application.

A default SVG host can still compose selected Canvas marks. Import
`canvasChartRenderer` from `@tanstack/charts/canvas` and attach it to those
marks. The default adapter remains the host, and the Canvas painter enters the
module graph through that explicit import.
