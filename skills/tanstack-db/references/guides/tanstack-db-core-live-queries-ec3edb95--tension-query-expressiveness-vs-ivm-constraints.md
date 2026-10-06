# Live Queries — Tension: Query expressiveness vs. IVM constraints

[Guide and prerequisites](./tanstack-db-core-live-queries-ec3edb95.md) · Published skill · `@tanstack/db@0.12.0`.

## Tension: Query expressiveness vs. IVM constraints

The query builder looks like SQL but has constraints that SQL does not:

- **Equality joins only** -- use `eq()` or nonempty nested `and()` equalities. OR and inequalities are unsupported.
- **orderBy required for limit/offset** -- non-deterministic pagination cannot be incrementally maintained.
- **distinct requires select** -- deduplication needs an explicit projection.
- **fn.select() cannot be used with groupBy()** -- the compiler must statically analyze select to discover aggregate functions.

These constraints exist because the underlying d2ts differential dataflow engine requires them for correct incremental view maintenance.

See also: ./tanstack-react-db-ba0ab260.md#source-tanstack-react-db for React hooks (`useLiveQuery`, `useLiveSuspenseQuery`, `useLiveInfiniteQuery`).
