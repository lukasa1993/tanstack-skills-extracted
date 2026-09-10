# Types — Callback shape

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Callback shape

Public callbacks take at most two arguments: primary data or purpose first,
then a named context or options object. A callback without a distinct primary
payload takes one context object. Standard comparators, exact upstream
protocols, paired geometry, and consumer-called service methods are explicit
exceptions.
