# Transforms — Types

[Guide and prerequisites](./charts-docs-reference-transforms-md-6acdd0ab.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Types

Value and grouping contracts are `TransformAccessor`,
`TransformAccessorContext`, `TransformField`, `TransformValue`,
`TransformValueOutput`, `TransformKey`, `TransformGroupSpec`,
`TransformGroupRow`, `TransformOrder`, `TransformOrderOptions`, and
`TransformLineage`.

Reducer contracts are `TransformNumericReducer`, `TransformReducer`,
`TransformReduceContext`, `TransformOutputSpec`, `TransformOutputs`,
`TransformOutputValue`, and `TransformOutputRow`.

Group exports are `GroupByOptions` and `GroupByDatum`. Numeric bin exports are
`BinOptions`, `BinXDatum`, and `BinYDatum`. Two-dimensional bin exports are
`BinXYOptions` and `BinXYDatum`. Calendar bin exports are `TimeIntervalLike`,
`BinTimeOptions`, and `BinTimeDatum`.

Fold exports are `FoldField`, `FoldOutputNames`, `FoldOptions`, and
`FoldDatum`.

Rolling exports are `RollingWindowOptions`, `RollingWindowDatum`, and `RollingWindowAnchor`.
Cumulative exports are `CumulativeOptions` and `CumulativeDatum`. Rank exports
are `RankOptions`, `RankDatum`, and `RankTies`.

Normalization exports are `NormalizeOptions`, `NormalizeDatum`,
`NormalizeBasis`, and `NormalizeContext`. Selection exports are
`SelectOptions`, `SelectMethod`, and `SelectContext`. Row-stack exports are
`StackRowsXOptions`, `StackRowsXDatum`, `StackRowsYOptions`, and
`StackRowsYDatum`.

Mosaic exports are `MosaicOptions`, `MosaicXDatum`, and `MosaicYDatum`.

Waterfall exports are `WaterfallKind`, `WaterfallOptions`, `WaterfallDatum`,
`WaterfallStepDatum`, and `WaterfallTotalDatum`.

Static force-layout exports are `forceLayout`, `ForceLayoutOptions`,
`ForceDescriptor`, `ForceNumericValue`, `ForceLinkDescriptor`,
`ForceManyBodyDescriptor`, `ForceCenterDescriptor`, `ForceCollideDescriptor`,
`ForceXDescriptor`, `ForceYDescriptor`, `ForceFactoryDescriptor`,
`ForceFactory`, `ForceFactoryContext`, `ForceLayoutWorkingNode`,
`ForceLayoutWorkingLink`, `ForceLayoutResult`, `ForceLayoutNode`,
`ForceLayoutLink`, and `ForceLinkLineage`.

Tidy-tree exports are `treeLayout`, `TreeOrientation`, `TreeNodeContext`,
`TreeNodeComparator`, `TreeNodeSeparation`, `TreeLayoutPathOptions`,
`TreeLayoutParentOptions`, `TreeLayoutOptions`, `TreeLayoutNode`,
`TreeLayoutLink`, and `TreeLayoutResult`.
