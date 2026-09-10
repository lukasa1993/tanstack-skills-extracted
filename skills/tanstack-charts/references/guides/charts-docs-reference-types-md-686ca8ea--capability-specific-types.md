# Types — Capability-specific types

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Capability-specific types

Types tied to optional capabilities are documented with the API that owns
their behavior:

- `@tanstack/charts/adapter`: `ChartAdapter`, `ChartAdapterLayout`, and
  `ChartAdapterLayoutOptions`. See
  [Adapter controller](./charts-docs-reference-adapter-controller-md-3c6899b7.md#source-charts-docs-reference-adapter-controller-md).
- `@tanstack/charts/canvas`: `CanvasChartRendererOptions`,
  `CanvasChartRenderer`, `CanvasChartSurface`, `CanvasChartHostOptions`, and
  `CanvasChartHost`. See
  [Canvas renderer](./charts-docs-reference-rendering-and-export-md-ef854527.md#source-charts-docs-reference-rendering-and-export-md).
- `@tanstack/charts/cursor`: `ChartCursorController`, cursor state and
  coordinate types, `createChartCursor`, and `cursorHost`. See
  [Controlled cursors](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/cursor/host`: `ChartCursorHostExtension`,
  `ChartCursorHostSession`, and the platform-neutral cursor lifecycle,
  projection, focus, and presentation helpers. See
  [Controlled cursors](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/export`: `SerializeChartSvgOptions` and
  `RenderChartImageOptions`. See [SVG
  serialization](./charts-docs-reference-rendering-and-export-md-ef854527.md#source-charts-docs-reference-rendering-and-export-md) and [browser
  image export](./charts-docs-reference-rendering-and-export-md-ef854527.md#source-charts-docs-reference-rendering-and-export-md).
- `@tanstack/charts/geo`: `GeoProjectionContext`, `GeoProjectionDescriptor`,
  `GeoProjectionInput`, and `GeoShapeOptions`. See
  [Geo shape](./charts-docs-reference-marks-geo-md-2e4a1799.md#source-charts-docs-reference-marks-geo-md).
- `@tanstack/charts/hierarchy/sunburst`: `SunburstNode`,
  `SunburstNodeComparator`, `SunburstPathOptions`, `SunburstParentOptions`, and
  `SunburstOptions`. See [Sunburst](./charts-docs-reference-marks-sunburst-md-ebf0a51e.md#source-charts-docs-reference-marks-sunburst-md).
- `@tanstack/charts/hierarchy/treemap`: `TreemapMethod`, `TreemapTileDatum`,
  `TreemapTile`, `TreemapNode`, `TreemapNodeComparator`,
  `TreemapPathOptions`, `TreemapParentOptions`, and `TreemapOptions`. See
  [Treemap](./charts-docs-reference-marks-treemap-md-4dc515c2.md#source-charts-docs-reference-marks-treemap-md).
- `@tanstack/charts/network/force`: built-in descriptor types,
  `ForceFactoryDescriptor`, `ForceFactory`, `ForceFactoryContext`, working
  clone types, settled node/link result types, and lineage types. See
  [Static force layouts](./charts-docs-reference-transforms-md-6acdd0ab.md#source-charts-docs-reference-transforms-md).
- `@tanstack/charts/network/sankey`: `SankeyAlignment`,
  `SankeyAlignmentNode`, `SankeyNodeAligner`, `SankeyInset`,
  `SankeyLayoutValue`, `SankeyEndpointContext`, `SankeyNodeContext`,
  `SankeyLinkContext`, `SankeyNode`, `SankeyLink`, `SankeyDiagramContext`,
  `SankeyNodeComparator`, `SankeyLinkComparator`, and `SankeyDiagramOptions`.
  See [Sankey diagram](./charts-docs-reference-marks-sankey-md-7c353525.md#source-charts-docs-reference-marks-sankey-md).
- `@tanstack/charts/selection`: `KeyedSelectionChange`,
  `KeyedSelectionKeyContext`, `KeyedSelectionOptions`, and `KeyedSelection`. See
  [Controlled keyed selection](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/focus/guide`: `FocusGuideLabelFormatContext` and focus-guide
  option types. See [Focus guide](./charts-docs-reference-marks-focus-guide-md-7c751ac1.md#source-charts-docs-reference-marks-focus-guide-md).
- `@tanstack/charts/interaction/signal`: `ControlledSignal` and
  `ControlledSignalChangeContext`. See
  [Controlled signals](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md#source-charts-docs-guides-interactions-and-selections-md).
- `@tanstack/charts/legend`: `ColorLegendOptions`, `ColorLegendItems`,
  `ColorLegendItemOptions`, `ColorLegendItemValue`, `ColorLegendItemContext`,
  `ColorLegendIndicatorOptions`, `ColorLegendIndicatorRenderContext`,
  `ColorLegendIndicatorShape`, `ColorLegendLabelOptions`,
  `ColorGradientLegendOptions`, `InteractiveColorLegendItemContext`, and
  interactive legend option/change types. See
  [Automatic color legend](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md#source-charts-docs-reference-scales-guides-and-color-md)
  and
  [Interactive categorical legend](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md#source-charts-docs-reference-scales-guides-and-color-md).
- `@tanstack/charts/interaction/brush`: `BrushRange`, `BrushXChange`,
  `BrushXSource`, `BrushXTarget`, `BrushXValuesOptions`, and
  `BrushXContinuousOptions`. See
  [Horizontal brush](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/interaction/cursor`: `ContinuousCursorValue`,
  `ContinuousCursorPosition`, `ContinuousCursorPointerSource`,
  `ContinuousCursorSource`, `ContinuousCursorChange`,
  `ContinuousCursorRuleOptions`, `ContinuousCursorMarkerOptions`,
  `ContinuousCursorLabelOptions`, and `ContinuousCursorOptions`. See
  [Continuous cursor](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/interaction/zoom`: `ZoomXValue`, `ZoomXWindow`,
  `ZoomXSource`, `ZoomXAction`, `ZoomXWheelActivation`, `ZoomXChange`, and
  `ZoomXOptions`. See
  [Horizontal zoom](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md).
- `@tanstack/charts/polar`: `PolarOptions`, `PolarScales`, `PolarMark`,
  `PolarGuide`, `PolarGuideScene`, `PolarAngleOptions`,
  `PolarRadiusOptions`, `PolarPositionChannel`, `PolarPositionScaleOptions`,
  `PolarResolvedScale`, `PolarLayoutContext`, `PolarLength`,
  `PolarGuideLabelContext`, `PolarGuideLabelOption`, `RadialArcOptions`,
  `RadialBarRadiusOptions`, `RadialBarAngleOptions`, `RadialLineOptions`,
  `RadialAreaOptions`, `RadialDotOptions`, `RadialTextOptions`,
  `RadialRuleOptions`, `RadialGridOptions`, and `AngleGridOptions`. See
  [Polar marks](./charts-docs-reference-marks-polar-md-29a92849.md#source-charts-docs-reference-marks-polar-md).
