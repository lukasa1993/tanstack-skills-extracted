# Interactions And Selections — Scale-bound handle

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Scale-bound handle

Use `handleX` for one ordered value that the reader can drag or move with a
keyboard, such as a playback position:

```ts
import { defineChart, lineY } from '@tanstack/charts'
import {
  handleX,
  type HandleXChange,
} from '@tanstack/charts/interaction/handle'
import { controlledSignal } from '@tanstack/charts/interaction/signal'

const definition = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value' })],
  scales: {
    x: { scale: utcScale },
    y: null,
  },
  controls: [
    handleX({
      value: controlledSignal<Date, HandleXChange<Date>>(currentDate, (next) =>
        setCurrentDate(next),
      ),
      values: observedDates,
      cross: { edge: 'bottom', offset: 8 },
      ariaLabel: 'Playback position',
      format: (date) => dayFormat(date),
    }),
  ],
})
```

`values` is the ordered snapping and keyboard domain. The controlled value
must be one of those candidates. `cross` places the track above or below the
plot, or at a semantic y value with `{ value }`. The default vertical rule
connects the track and plot; set `ruleStyle: false` to omit it.

Pointer and touch movement proposes `preview` changes. Release proposes a
`commit`; cancellation proposes the gesture origin. Arrow keys move one
candidate and Home or End selects an endpoint. Every keyboard move commits
immediately. The SVG and Canvas DOM hosts provide one named horizontal slider
with a 44-pixel hit target by default. Static SVG and React Native paint the
accepted track, rule, and handle but require an application-owned semantic
control for input.

Charts owns final-scale positioning, nearest-candidate snapping, pointer
capture, cancellation, keyboard movement, painting, and host teardown. The
application owns playback clocks, play/pause controls, status text, and
persistence.
