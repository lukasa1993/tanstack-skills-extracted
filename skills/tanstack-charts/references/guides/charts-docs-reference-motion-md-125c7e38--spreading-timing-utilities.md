# Motion — Spreading timing utilities

[Guide and prerequisites](./charts-docs-reference-motion-md-125c7e38.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Spreading timing utilities

Use the isolated timing entry when the definition only needs motion policy:

```ts
import { stagger } from '@tanstack/charts/motion/definition'

const definition = defineChart({
  motion: {
    path: 'morph',
    ...stagger({ each: 35, by: 'series', roles: ['arc', 'bar'] }),
  },
  marks,
  scales: {
    x: null,
    y: null,
  },
})
```

`stagger()` returns one context-aware `delay` field for direct object spread.
It uses `datumIndex` by default, can use `seriesIndex`, defaults to the `enter`
phase, and can filter by phase and semantic role. `offset` delays the first
target. Normal object-spread order controls precedence, so an explicit `delay`
written after `...stagger()` replaces it.

```ts
interface ChartMotionStaggerOptions {
  each: number
  offset?: number
  by?: 'datum' | 'series'
  phase?: ChartMotionPhase | readonly ChartMotionPhase[]
  roles?: ChartMotionRole | readonly ChartMotionRole[]
}
```

`stagger()` is also exported from `@tanstack/charts/motion`. The dedicated
`/motion/definition` entry excludes the SVG renderer and spring solver.
