# Focus And Interaction — Callbacks

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Callbacks

```ts
interface ChartInteractionCallbacks {
  onFocusChange?: (point: ChartPoint | null) => void
  onFocusGroupChange?: (points: readonly ChartPoint[]) => void
  onSelect?: (point: ChartPoint | null) => void
}
```

Definitions infer callback datum and semantic x/y value types without adapter
generics. Focus callbacks run only when the primary focus key changes, except
that a scene rebuild with an existing focused key reports the point with its
new coordinates and datum.

`onSelect` reports mouse clicks and keyboard activation. A click with no point
reports `null`; Enter and Space do nothing until a point is focused. When a
definition has a selection controller, it receives the activation before the
legacy callback.
