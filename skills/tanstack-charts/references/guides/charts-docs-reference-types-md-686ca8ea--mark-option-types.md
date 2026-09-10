# Types — Mark option types

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Mark option types

Every built-in mark exports its options type from the root and its granular
subpath. Cartesian, radial, and composite option types include the shared
`ChartMarkOptions.renderer` selection:

- `LineYOptions`, `AreaYOptions`, `AreaXOptions`, `AreaXCurve`
- `BarYOptions`, `BarXOptions`
- `BandXOptions`, `BandYOptions`
- `DotOptions`, `HexagonOptions`
- `RectOptions`, `CellOptions`
- `RuleXOptions`, `RuleYOptions`
- `CrosshairOptions`, `CrosshairRuleOptions`, `CrosshairAxisOptions`,
  `CrosshairBandOptions`, `CrosshairLabelOptions`, `CrosshairMarkerOptions`
- `LinkOptions`, `ArrowOptions`, `VectorOptions`, `VectorAnchor`
- `TickXOptions`, `TickYOptions`
- `TextOptions`, `TextAnchor`
- `FrameOptions`
- `FacetOptions`, `FacetAxes`, `FacetChartContext`
- `ColorLegendOptions`, `ColorLegendItems`, `ColorLegendItemOptions`,
  `ColorLegendItemValue`, `ColorLegendItemContext`,
  `ColorLegendIndicatorOptions`, `ColorLegendIndicatorRenderContext`,
  `ColorLegendIndicatorShape`, `ColorLegendLabelOptions`,
  `ColorGradientLegendOptions`

Their public fields and defaults are owned by the
[mark reference](./charts-docs-reference-index-md-6fc2c6fc.md#source-charts-docs-reference-index-md) and
[legend reference](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md#source-charts-docs-reference-scales-guides-and-color-md).
