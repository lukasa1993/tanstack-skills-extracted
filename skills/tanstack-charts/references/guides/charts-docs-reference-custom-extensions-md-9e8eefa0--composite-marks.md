# Custom Extensions — Composite marks

[Guide and prerequisites](./charts-docs-reference-custom-extensions-md-9e8eefa0.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Composite marks

`compositeMark` groups ordinary marks behind one stable parent identity:

```ts
import { compositeMark } from '@tanstack/charts/mark/composite'

function compositeMark<
  TMarks extends readonly ChartMark<any, any, any, any, any>[],
>(
  marks: TMarks,
  options?: CompositeMarkOptions<ChartMarkDatum<TMarks[number]>>,
): ChartMark<
  ChartMarkDatum<TMarks[number]>,
  ChartMarkPointX<TMarks[number]>,
  ChartMarkPointY<TMarks[number]>,
  ChartMarkScaleX<TMarks[number]>,
  ChartMarkScaleY<TMarks[number]>
>
```

`CompositeMarkOptions` contains optional `id`, `motion`, and `renderer` fields.
The result preserves the union of child datum and positional types. Initialization merges
the children's semantic channels under parent and child namespaces. Rendering
keeps child order, namespaces scene keys and mark IDs, and retains each child
point as a separate interaction target. Parent and child motion definitions
merge under the resolved child namespace, with child fields taking precedence.

Every child must have a unique ID and an ordinary initialized `render` method.
A child that owns `resolveLayout` is rejected; keep one resolved-layout owner
instead of nesting scheduling lifecycles. See
[Custom Marks and Renderers](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md#source-charts-docs-guides-custom-marks-and-renderers-md)
for composition guidance.
