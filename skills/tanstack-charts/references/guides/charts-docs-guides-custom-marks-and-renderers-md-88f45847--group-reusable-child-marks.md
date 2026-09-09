# Custom Marks And Renderers — Group reusable child marks

[Guide and prerequisites](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Group reusable child marks

Use `compositeMark` when a reusable unit consists entirely of ordinary marks:

```ts
import { compositeMark, dot, frame } from '@tanstack/charts'

const framedPoints = compositeMark(
  [
    frame({ id: 'border', strokeOpacity: 0.2 }),
    dot(rows, {
      id: 'points',
      x: 'date',
      y: 'value',
      key: 'id',
    }),
  ],
  { id: 'framed-points' },
)
```

The parent namespaces child channels, scene keys, points, and motion. Child
declaration order remains paint order, and datum and positional types are the
union of the children. Parent motion supplies defaults; a child's motion wins
where both specify the same field.

Child IDs must be unique. Every child retains its own interaction points, so
do not layer several interactive marks when only one semantic target should
exist. A child with its own `resolveLayout` is rejected because nested layout
scheduling would be ambiguous. Compose those marks directly in the chart or
write one custom mark with a single resolved-layout owner.

`compositeMark` is available from the root and universal entries. Import
`@tanstack/charts/mark/composite` when bundle isolation matters.
