# Interactions And Selections — Controlled signals

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Controlled signals

A controlled signal is the boundary between application-owned semantic state
and a chart-owned behavior:

```ts
import { controlledSignal } from '@tanstack/charts/interaction/signal'

const visible = controlledSignal(visibleSeries, (next, { reason }) => {
  setVisibleSeries(next)
})
```

It is only a typed snapshot and callback. It does not create a chart store,
subscription, or second lifecycle. Rebuild the definition with the accepted
value, as with a controlled form input. The behavior owns interaction details;
the application owns persistence and policy.
