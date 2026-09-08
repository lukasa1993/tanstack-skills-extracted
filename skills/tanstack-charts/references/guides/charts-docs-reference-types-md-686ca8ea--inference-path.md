# Types — Inference path

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Inference path

```text
source datum
  → mark channel outputs
  → ChartMark point and scale value types
  → ChartSpec scale registry and definition datum/x/y unions
  → scale and formatter types
  → host and adapter callback types
```

Marks in one chart may have different datum types. The definition exposes their
union. TypeScript narrowing is therefore required when a callback handles
heterogeneous layers.

`ChartMarkScaleX` and `ChartMarkScaleY` control the value types accepted by the
reserved scale entries. Canonical definitions always include `scales.x` and
`scales.y`; use `null` when a dimension is unused. A mark bound to another
scale ID does not widen the reserved entry's value type.

Rect and custom interval marks can distinguish materialized scale values from
interaction point values. The exported extractors are:

`ChartMarkDatum`, `ChartSpecDatum`, `ChartSpecXValue`, and `ChartSpecYValue`
are available from the root entry point. The four `ChartMarkPoint*` and
`ChartMarkScale*` extractors below come from the exceptional
`@tanstack/charts/mark/scale-values` subpath.

| Type                     | Extracts                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `ChartMarkDatum<TMark>`  | Original datum                                                                                 |
| `ChartMarkPointX<TMark>` | Interaction x value; exported from `@tanstack/charts/mark/scale-values`                        |
| `ChartMarkPointY<TMark>` | Interaction y value; exported from `@tanstack/charts/mark/scale-values`                        |
| `ChartMarkScaleX<TMark>` | All x values materialized for scale typing; exported from `@tanstack/charts/mark/scale-values` |
| `ChartMarkScaleY<TMark>` | All y values materialized for scale typing; exported from `@tanstack/charts/mark/scale-values` |
| `ChartSpecDatum<TSpec>`  | Datum union across marks                                                                       |
| `ChartSpecXValue<TSpec>` | Interaction x union across marks                                                               |
| `ChartSpecYValue<TSpec>` | Interaction y union across marks                                                               |

Stateful mark presentation uses `ChartMarkStateContext` as one object bag for
the datum, index, data, point, focus, pointer, and matching helper. A
`ChartMarkStateSelector` handles the common declarative cases, while callbacks
can return any `ChartMarkStateValue`. `ChartMarkStateStyle` is the complete
style vocabulary; `ChartDotStateStyle`, `ChartBarStateStyle`,
`ChartRectStateStyle`, `ChartLineStateStyle`, `ChartAreaStateStyle`, and
`ChartTextStateStyle` narrow it to properties each mark can render.
