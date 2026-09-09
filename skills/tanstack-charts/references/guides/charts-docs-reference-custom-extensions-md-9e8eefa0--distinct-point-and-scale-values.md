# Custom Extensions — Distinct point and scale values

[Guide and prerequisites](./charts-docs-reference-custom-extensions-md-9e8eefa0.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Distinct point and scale values

Interval geometry may materialize endpoint value types that differ from its
interaction anchor types. Use the exceptional subpath:

```ts
import { createMarkWithScaleValues } from '@tanstack/charts/mark/scale-values'
```

```ts
function createMarkWithScaleValues<
  TDatum,
  TXPointValue extends ChartValue,
  TYPointValue extends ChartValue,
  TXScaleValue extends ChartValue,
  TYScaleValue extends ChartValue,
  TXScaleId extends string = 'x',
  TYScaleId extends string = 'y',
>(
  initialize: (
    context: MarkInitializeContext,
  ) => MarkInitialization<TDatum, TXPointValue, TYPointValue>,
  motion?: ChartMotionDefinition<TDatum>,
  renderer?: ChartMarkRenderer,
): ChartMark<
  TDatum,
  TXPointValue,
  TYPointValue,
  TXScaleValue,
  TYScaleValue,
  TXScaleId,
  TYScaleId
>
```

The subpath also exports `ChartMarkPointX`, `ChartMarkPointY`,
`ChartMarkScaleX`, and `ChartMarkScaleY`. Use it only when the distinction is
real; ordinary custom marks should use `createMark`. Pass named scale IDs in
the last two type parameters when the mark does not use reserved `x` or `y`.
