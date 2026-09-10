# Interactions And Selections — Controlled keyed selection

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Controlled keyed selection

Use `keyedSelection` when chart activation and application UI share one stable
datum key:

```ts
import { defineChart, dot } from '@tanstack/charts'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { keyedSelection, whenSelected } from '@tanstack/charts/selection'

const selection = keyedSelection<Observation, string, number, number>({
  selected: controlledSignal(selectedId, (next, { reason }) => {
    setSelectedId(next)
  }),
  key: (datum) => datum.id,
})

const definition = defineChart({
  marks: [
    dot(observations, {
      id: 'observations',
      x: 'flipperLength',
      y: 'bodyMass',
      key: 'id',
    }),
    whenSelected(
      dot(observations, {
        id: 'selected-observation',
        x: 'flipperLength',
        y: 'bodyMass',
        key: 'id',
        r: 7,
        strokeWidth: 2,
      }),
      selection,
    ),
  ],
  scales: {
    x: null,
    y: null,
  },
  selection,
})
```

Click, Enter, and Space propose the selected key through the controlled signal.
A blank-surface click proposes `null` when a selection exists. The change
reason distinguishes `select` from `clear` and records whether activation came
from `pointer` or `keyboard`. A nullish key makes that point non-selectable.

`whenSelected` is an ordinary authored mark filtered after scale domains
resolve. Its complete data and channels still contribute to the domains, but
only geometry whose point matches the selected key is painted. The filtered
overlay is decorative: it emits no second focus or activation point. If one
logical point owns several scene fragments, every matching fragment remains.

Focus and selection are independent. Focus can move without changing the
controlled key, and a selected overlay does not replace the normal focus ring.
Keep semantic tables, status announcements, clear buttons, persistence, and
product-specific key policy in application UI. Those controls can update the
same selected value used to rebuild the definition.
