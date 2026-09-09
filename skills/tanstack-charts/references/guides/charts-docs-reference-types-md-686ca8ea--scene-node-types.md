# Types — Scene-node types

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Scene-node types

`SceneNode` is the union of:

- `SceneGroup`
- `SceneRule`
- `ScenePolyline`
- `SceneArea`
- `SceneDot`
- `SceneRect`
- `SceneLabel`

`ScenePolygonRing` is one closed boundary. `ScenePolygon` is an exterior ring
followed by zero or more holes; `SceneArea.polygons` can contain several
disconnected polygons. `SceneStyle` is shared presentation. `ChartSize`,
`ChartBounds`, `ChartMargin`, `ChartLayoutOptions`, `ChartTextTypography`,
`ChartTextMeasurer`, `ChartTextMeasureOptions`, and `ChartTextMetrics` describe
scene and text geometry. Typography includes family, style, stretch, letter
spacing, direction, locale, and host font scale.

See [Scene nodes](./charts-docs-reference-runtime-and-scene-md-e3fcc593.md#source-charts-docs-reference-runtime-and-scene-md).
