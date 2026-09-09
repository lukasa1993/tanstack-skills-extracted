# Scales And D3 — Transforms produce rows

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Transforms produce rows

TanStack Charts includes typed, data-first helpers for common transforms:

```ts
import { binX } from '@tanstack/charts/transform/bin'

const histogram = binX(rows, {
  value: 'value',
  thresholds: 20,
})
```

Pass the result to `rect`, `barY`, `lineY`, `dot`, or a custom mark. The helpers
use compact row-oriented kernels or isolated granular D3 implementations while
retaining typed source lineage. Domain-specific D3 transforms still work
directly; no adapter or library-owned series shape is required. Keep
substantial transforms beside the definition and memoize them through
application reactivity.

The same rule applies to stacks, pies, hierarchies, force layouts, and
server-prepared intervals: preserve the useful output as typed rows, then map
it through mark channels. A responsive geographic projection instead belongs
in `geoShape`'s projection factory because its pixel range depends on the final
plot bounds.
