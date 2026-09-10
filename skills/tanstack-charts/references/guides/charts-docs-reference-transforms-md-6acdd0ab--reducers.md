# Transforms — Reducers

[Guide and prerequisites](./charts-docs-reference-transforms-md-6acdd0ab.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Reducers

Every output names its reducer. `count` omits `value`; numeric reducers require
it. Compact built-in strings are `count`, `sum`, `mean`, `min`, and `max`.
Tree-shakeable reducer functions provide `median`, `variance`, `deviation`,
`first`, `last`, `delta`, and `ratio` without adding them to every
aggregation bundle.

Custom reducers receive one object with `values`, selected `data`, source
`indexes`, and the named `group` object. `quantile(probability)` returns a
custom reducer.

Empty `count` and `sum` results are zero. Other empty numeric results are
`NaN`. `variance` and `deviation` use the sample denominator and return `NaN`
for fewer than two finite values. If a singleton group needs a zero-width
interval, state that policy in a small authored reducer.

Numeric reducers ignore non-finite channel values, while `source`,
`sourceIndexes`, and a custom reducer's `data` still describe every input row
in the group. Filter invalid observations before `groupBy` when lineage should
contain only contributors.
