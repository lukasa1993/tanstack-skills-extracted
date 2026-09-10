# Motion — Standalone spring

[Guide and prerequisites](./charts-docs-reference-motion-md-125c7e38.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Standalone spring

```ts
import { createChartSpring } from '@tanstack/charts/spring'

const spring = createChartSpring({ stiffness: 170, damping: 18, mass: 1 })
const sample = spring.sample(16, { from: 0, to: 100, velocity: 0 })
```

```ts
interface ChartSpringOptions {
  stiffness?: number
  damping?: number
  mass?: number
  restSpeed?: number
  restDelta?: number
}

interface ChartSpringState {
  from: number
  to: number
  velocity?: number
}

interface ChartSpringSample {
  value: number
  velocity: number
  done: boolean
}

interface ChartSpring {
  readonly options: Readonly<Required<ChartSpringOptions>>
  sample(elapsedMs: number, state?: ChartSpringState): ChartSpringSample
}
```

`createChartSpring` returns an analytic, frame-rate-independent damped harmonic
oscillator. Values and velocities use caller units per second. Seed a new
`ChartSpringState` from the prior sample to preserve momentum across targets.
