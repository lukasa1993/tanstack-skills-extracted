# Focus And Interaction — Controlled keyed selection

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Controlled keyed selection

Import controlled semantic selection from its exact subpath:

```ts
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { keyedSelection, whenSelected } from '@tanstack/charts/selection'
```

`keyedSelection(options)` returns a `KeyedSelection` controller. Its
`KeyedSelectionOptions` contain:

| Option     | Meaning                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| `selected` | Controlled signal holding a semantic key or `null`, with typed reasons   |
| `key`      | Maps a datum and `{ point }` context to a semantic key or a nullish skip |

The key callback's second parameter is a typed `KeyedSelectionKeyContext`.
Controlled interaction state uses `ControlledSignal<TValue, TReason>`; its
change callback receives the proposed value and a
`ControlledSignalChangeContext<TReason>` containing `{ reason }`.

Place that controller on `ChartDefinitionOptions.selection`. Pointer click,
Enter, and Space pass the activated point to the controller. A blank-surface
click clears an existing selection. The controlled signal proposes a complete
replacement; Charts does not mutate its snapshot. Rebuild the definition with
the accepted value.

`KeyedSelectionChange` is a discriminated union:

- `{ type: 'select', value, point, source }` proposes a non-null semantic key;
- `{ type: 'clear', value: null, point: null, source }` proposes clearing it.

`source` is the `ChartSelectionSource` value `pointer` or `keyboard`. Selecting
the currently selected key still emits `select`, so application policy can
decide whether repeated activation is a no-op or another action. Returning
`null` or `undefined` from `key` ignores activation for that point.

`whenSelected(mark, selection)` returns the same ordinary mark filtered by the
controlled key after domains resolve. The full mark still contributes scale
channels and domains. Its final geometry retains every fragment owned by a
matching point, while interaction metadata and points are removed. It is
therefore a decorative overlay and cannot create a duplicate focus or
activation target. Duplicate semantic keys intentionally paint every match.

Selection does not replace focus, tooltip pinning, or application UI. A linked
HTML table, live status, clear action, and persistence remain outside the
definition and can update the same controlled key.
