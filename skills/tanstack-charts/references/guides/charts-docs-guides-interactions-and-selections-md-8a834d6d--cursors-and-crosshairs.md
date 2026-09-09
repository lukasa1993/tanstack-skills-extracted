# Interactions And Selections — Cursors and crosshairs

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Cursors and crosshairs

`crosshair` is presentation; `createChartCursor` is state. A crosshair without
a cursor binding follows the chart's local `ChartFocusState`:

```ts
import { crosshair } from '@tanstack/charts/crosshair'

const definition = defineChart({
  marks: [
    lineY(rows, { x: 'date', y: 'value' }),
    crosshair({ x: { label: true }, y: false }),
  ],
  scales: {
    x: { scale: scaleUtc },
    y: { scale: scaleLinear },
  },

  focus: 'group-x',
  maxFocusDistance: Number.POSITIVE_INFINITY,
})
```

This gives pointer and keyboard users one snapped vertical guide. It does not
create a point, change the focus strategy, or require an SVG overlay.

On a categorical axis, `x: { band: true }` or `y: { band: true }` replaces
that axis rule with a cursor band sized from the resolved scale bandwidth. A
band options object controls inset, radius, fill, stroke, and opacity. Use
separate crosshair marks when the band should paint below the data and the
other axis rule should paint above it. Zero-bandwidth axes emit no band.

### Synchronize focus by value

Share one controller between definitions when several browser or React Native
charts should resolve the same semantic value through their own scales:

```ts
import { createChartCursor, cursorHost } from '@tanstack/charts/cursor'

const sharedDate = createChartCursor<Date, number>()
const cursor = {
  use: cursorHost,
  controller: sharedDate,
  mode: 'focus' as const,
  match: 'x' as const,
  pin: true,
}

const throughputDefinition = defineChart(throughputSpec, { cursor })
const errorsDefinition = defineChart(errorsSpec, { cursor })
```

Focus mode publishes `anchor: 'value'`. Each chart resolves that date to its
own local point and focus group; no chart copies another chart's pixels.
Pointer, keyboard, restored, and programmatic sources remain visible in the
shared state. `match` defaults to `xy` and can be `x` or `y`. Focus state may
also carry an optional local `origin` point identity to break ties between
repeated equal values, including facets. A stable `key` plus `markId` survives
data reordering; `datumIndex` disambiguates duplicate keys. A chart ignores the
origin when its key and mark do not exist locally and resolves from the
portable semantic `value` and preferred `group`.

### Track free coordinates

Free mode updates without selecting a datum. The host stores normalized plot
coordinates and derives semantic values through each resolved scale's inverse:

```ts
const freeCursor = createChartCursor<Date, number>()
const xScale = scaleUtc().domain([start, end])
const yScale = scaleLinear().domain([0, maximum])

const definition = defineChart({
  marks: [
    dot(rows, { x: 'date', y: 'value' }),
    crosshair({
      x: { label: true },
      y: { label: true },
      marker: true,
    }),
  ],
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },

  cursor: {
    use: cursorHost,
    controller: freeCursor,
    mode: 'free',
    pin: true,
  },
})
```

The resolved final ranges own inversion, including a reversed y range. Add an
axis `valueAt` only to replace that default with observed-value snapping,
rounding, or another semantic policy. A missing or non-invertible scale
requires such an override; returning `undefined` keeps that axis
coordinate-only.

Set semantic state directly when another control owns the cursor:

```ts
freeCursor.setState({
  anchor: 'value',
  value: { x: selectedDate, y: selectedValue },
  source: 'programmatic',
  pinned: true,
})

freeCursor.setState(null)
```

With `pin: true`, click or tap pins the current cursor and another activation
dismisses it. Browser focus mode also supports Enter, Space, and Escape. React
Chart-owned focus exposes equivalent activate and escape accessibility
actions. Free mode has no invented keyboard or accessibility point order; pair
it with labeled date/number inputs, a range control, or textual status when
arbitrary values are part of the reader's task. The crosshair itself is visual
and `aria-hidden`.

Browser renderer hosts and React Native `Chart` both bind focus and free
cursors. They share controller state, semantic focus resolution, coordinate
projection, and crosshair presentation; only their event plumbing differs.
React Native uses responder gestures and accessibility actions instead of DOM
pointer and key events.

Application code imports `createChartCursor`, `cursorHost`, and cursor state
types from `@tanstack/charts/cursor`. Every cursor binding supplies
`use: cursorHost`, keeping cursor policy out of charts that do not opt in. The
adapter-facing
`@tanstack/charts/cursor/host` entry contains the platform-neutral projection
and focus helpers used to implement a host; ordinary chart definitions do not
need it.
