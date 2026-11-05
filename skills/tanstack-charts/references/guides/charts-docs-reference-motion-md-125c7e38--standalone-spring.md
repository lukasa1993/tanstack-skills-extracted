# Motion — Standalone spring

[Guide and prerequisites](./charts-docs-reference-motion-md-125c7e38.md) · Release-matched documentation · `@tanstack/charts@1.4.0`.

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
oscillator. Values use caller units; velocities use those units per second.
The defaults are `stiffness: 170`, `damping: 26`, `mass: 1`,
`restSpeed: 0.01`, and `restDelta: 0.005`. A sample is `done` when both the
absolute distance to the target is at most `restDelta` and the absolute
velocity is at most `restSpeed`. A completed sample returns the exact target
with zero velocity. The standalone sampler has no clock or 10-second cutoff;
that safety limit belongs to the motion renderer. Seed a new
`ChartSpringState` from the prior sample to preserve momentum across targets.
