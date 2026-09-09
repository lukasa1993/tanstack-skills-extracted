# Motion — Timing types

[Guide and prerequisites](./charts-docs-reference-motion-md-125c7e38.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Timing types

```ts
type ChartMotionPhase = 'enter' | 'update' | 'exit'

interface ChartMotionTweenTransition {
  type: 'tween'
  duration?: number
  easing?:
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | ((progress: number) => number)
}

interface ChartMotionSpringTransition extends ChartSpringOptions {
  type: 'spring'
}

type ChartMotionTransition =
  ChartMotionTweenTransition | ChartMotionSpringTransition

interface ChartRollingPathMotion {
  update: 'rolling'
  x: 'shift'
  y?: 'fixed' | 'reproject'
  fallback?: 'snap' | 'morph'
}

type ChartMotionPath = 'morph' | ChartRollingPathMotion

interface ChartMotionTiming<TDatum = unknown> {
  delay?: number | ((context: ChartMotionContext<TDatum>) => number | undefined)
  transition?: ChartMotionTransition
  path?: ChartMotionPath
}

type ChartMotionDefinition<TDatum = unknown> =
  | false
  | ChartMotionTiming<TDatum>
  | ((
      context: ChartMotionContext<TDatum>,
    ) => false | ChartMotionTiming<TDatum> | undefined)

interface ChartMarkMotionOptions<TDatum = unknown> {
  motion?: ChartMotionDefinition<TDatum>
}
```

`ChartMotionContext` provides `phase`, semantic `role`, stable `key`, optional
`markId`, `seriesKey`, `seriesIndex`, `datumIndex`, `datumCount`, optional typed
`datum` and `point`, and optional `axis`. `ChartMotionRole` covers marks, axes,
grid lines, ticks, tick labels, and axis labels.

Focus styles use `ChartMarkStateTransition`, which is a
`ChartMotionTransition` plus optional `respectReducedMotion`.

`path: 'morph'` is the ordinary command-by-command path interpolation. A
rolling update is configured only with the `ChartRollingPathMotion` object.
