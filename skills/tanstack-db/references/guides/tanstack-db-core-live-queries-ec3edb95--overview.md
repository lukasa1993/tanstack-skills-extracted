# Live Queries — Overview

[Guide and prerequisites](./tanstack-db-core-live-queries-ec3edb95.md) · Published skill · `@tanstack/db@0.9.0`.

# Live Queries

> This skill builds on db-core.

TanStack DB live queries use a SQL-like fluent query builder to create **reactive derived collections** that automatically update when underlying data changes. The query engine compiles queries into incremental view maintenance (IVM) pipelines using differential dataflow (d2ts), so only deltas are recomputed.

All operators, string functions, math functions, and aggregates are incrementally maintained. Prefer them over equivalent JS code.
