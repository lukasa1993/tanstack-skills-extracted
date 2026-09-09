# Types — Marks and scenes

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Marks and scenes

| Type                               | Purpose                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| `ChartMark`                        | Public initialized-mark factory plus inferred point, scale value, and scale ID types |
| `ChartMarkOptions`                 | Shared optional mark renderer contract                                               |
| `ChartMarkRenderer`                | Universal renderer-selection token stored on mark-owned scene nodes                  |
| `CartesianChartMark`               | Cartesian mark alias that derives selected x and y scale IDs from its options        |
| `OptionScaleId`                    | Resolves an optional named-scale selector to its fallback scale ID                   |
| `MarkInitializeContext`            | Mark layer index                                                                     |
| `InitializedMark`                  | Stable ID, channels, viewport ownership, render, and optional resolved layout        |
| `MarkInitialization`               | Direct-render or resolved-layout initializer result                                  |
| `ResolvedLayoutMarkInitialization` | Layout initializer before `createMark` normalization                                 |
| `MaterializedChannel`              | Values contributed to an optional named scale                                        |
| `MarkRenderContext`                | Final chart bounds, scales, theme, color resolver, and layout                        |
| `MarkResolvedLayoutContext`        | Final positional scales and bounds for pure mark-local layout                        |
| `ResolvedMarkLayout`               | Final channels, labels, states, and render closure from resolved layout              |
| `MarkScene`                        | Mark-owned nodes plus optional interaction points, focus anchors, and guides         |
| `MarkFocusGuide`                   | Mark-emitted focus guide with optional placement                                     |
| `ChartScene`                       | Complete renderer-neutral output                                                     |
| `ChartPoint`                       | Typed interaction target                                                             |
| `ChartFocusAnchor`                 | Focus-filter identity that does not participate in hit testing                       |
| `SceneFocusGuide`                  | Data-less guide descriptor resolved against focus or cursor state                    |
| `SceneFocusGuideAxis`              | One crosshair axis rule or categorical band, plus an optional label                  |
| `SceneFocusGuideBand`              | Resolved categorical bandwidth, inset, radius, and paint                             |
| `SceneFocusGuideLabel`             | Focus-guide label formatter, spacing, font, and paint                                |
| `SceneFocusGuideMarker`            | Focus-guide intersection marker geometry and paint                                   |
| `SceneFocusGuideResolveContext`    | Scene, guide, local focus, pointer, and cursor passed to a guide resolver            |
| `SceneFocusGuideResolver`          | Optional-guide policy that returns one transient scene node                          |
| `ChartFocusPresentation`           | Transient renderer-neutral underlay and overlay nodes                                |
| `SceneInteraction`                 | Semantic point or points attached to a rendered scene primitive                      |
| `ChartTick`                        | Semantic value, formatted label, and pixel position                                  |
| `ResolvedScale`                    | Final positional scale                                                               |
| `ResolvedColorScale`               | Final color scale                                                                    |

Scene geometry and interaction point fields are documented in
[Runtime and scene](./charts-docs-reference-runtime-and-scene-md-e3fcc593.md#source-charts-docs-reference-runtime-and-scene-md).
