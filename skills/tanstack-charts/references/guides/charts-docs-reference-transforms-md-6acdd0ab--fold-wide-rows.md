# Transforms — Fold wide rows

[Guide and prerequisites](./charts-docs-reference-transforms-md-6acdd0ab.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Fold wide rows

`fold` turns selected fields into long-form rows while preserving the other
source fields:

```ts
import { fold } from '@tanstack/charts/transform/fold'

const points = fold(rows, {
  fields: ['R90_10_1980', 'R90_10_2015'] as const,
  as: { key: 'periodField', value: 'inequality' },
})
```

Output is source-row-major, then follows authored `fields` order. Each point
retains the source row's other properties and adds `periodField`, `inequality`,
`source`, and `sourceIndexes`. Omitting `as` uses `key` and `value`. Values are
not filtered, so `null`, `undefined`, and `NaN` remain available to subsequent
transforms or application logic.

Use a literal field tuple so the output key and value remain correlated when
TypeScript narrows the key. Duplicate fields, identical output names, and the
reserved `source` or `sourceIndexes` output names throw synchronously with a
`fold:` error. Output names may replace source fields; lineage retains the
original row.
