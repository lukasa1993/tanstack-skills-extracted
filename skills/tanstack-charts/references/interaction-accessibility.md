# Interaction and accessibility

Focus, tooltips, interaction, selection, and accessibility.

<a id="source-charts-docs-guides-accessibility-md"></a>

## Accessibility

Source: `charts:docs/guides/accessibility.md`.

Accessibility is part of the chart contract, not a final annotation pass.
TanStack Charts provides named SVG and Canvas surfaces plus shared focus
primitives; the application still owns the surrounding explanation, controls,
and exact-value alternative.

### Name the chart

Every DOM host and framework adapter requires `ariaLabel`:

```tsx
<Chart
  definition={definition}
  ariaLabel="Weekly downloads for three packages"
/>
```

Use `ariaDescription` when the reader needs context that is not already
visible nearby:

```tsx
<Chart
  definition={definition}
  ariaLabel="Weekly downloads for three packages"
  ariaDescription="Values are seven-day totals. Missing weeks are rendered as gaps."
/>
```

The SVG renderer emits an image role, a chart roledescription, and a `<desc>`
when a description is supplied. The Canvas renderer places the same image role,
name, roledescription, description, and tab index on its root while keeping all
five canvas descendants `aria-hidden`. Do not put instructions, conclusions,
and all underlying data into one enormous accessible name.

### Preserve semantic context outside the surface

A chart should usually be accompanied by:

- a visible heading;
- a short statement of what is being compared;
- units and time range;
- a source note when relevant;
- a summary or table when exact values matter.

Use normal HTML for this content. It is easier to navigate, select, translate,
and print than text embedded in SVG.

### Keyboard focus and selection

Chart-owned focus supports pointer and keyboard navigation over chart points.
Leave `keyboard` enabled when a chart is interactive. Focus callbacks expose
the same typed `ChartPoint` data regardless of input method.

If the application replaces chart-owned focus with a brush, zoom, editor, or rich
overlay:

- provide semantic buttons, sliders, inputs, or table rows;
- keep visible focus styles;
- expose current state in text;
- support Escape when an interaction can be cancelled;
- use live announcements sparingly for meaningful committed changes;
- make touch targets at least 44 CSS pixels where practical.

The [Interactions and Selections](./interaction-accessibility.md#source-charts-docs-guides-interactions-and-selections-md) guide
defines the ownership boundary.

`interactiveColorLegend` uses native browser buttons with `aria-pressed`, a
named group, 44-pixel minimum targets, and stable focus across controlled
updates. Static SVG output keeps only a visual fallback, so pair exported
charts with text or a table when series visibility must remain actionable.

`brushX` exposes its ordered handles as horizontal sliders when `values` is
provided. Arrow keys move one authored value, Home and End move to the allowed
range edge, and Escape restores the range from the active pointer gesture.
Give both handles distinct names and format their semantic values. The DOM
overlay works with SVG and Canvas hosts; static SVG and React Native need an
application-owned range input for equivalent operation.

`continuousCursor` paints an unsnapped pointer guide but does not expose that
presentation-only overlay as a keyboard task. Pair its controlled x/y position
with named sliders or inputs and visible status text. Escape clears a visible
cursor through the behavior; the semantic controls should update the same
controlled position. Static SVG and React Native retain accepted guide paint
but still need those application-owned controls for operation.

`handleX` exposes one named horizontal slider. Left or Down moves to the
previous authored value, Right or Up moves to the next, and Home and End move
to the candidate endpoints. Its `format` result becomes `aria-valuetext`; the
pointer target is 44 pixels high by default. Escape restores the gesture
origin while a pointer or touch drag is active. Static SVG and React Native
retain the accepted handle paint but need an application-owned semantic input.

`zoomX` exposes one named plot surface with visible focus. Plus and minus zoom,
the arrow keys pan, Home resets, and Escape cancels an active gesture. Wheel
input is captured only while that surface is focused; an unfocused chart must
not trap page scrolling. Keep a visible Reset button and current-window text
bound to the same controlled window. Static SVG and React Native render the
accepted window but need application-owned semantic zoom controls.

### Never rely on color alone

Pair semantic color with at least one other signal:

- direct labels;
- shape or stroke pattern;
- ordering;
- position;
- text in a legend or linked table;
- selected outlines and `aria-pressed` state.

Check contrast against the actual application background in both light and
dark modes. The theme cannot infer whether an arbitrary data color is
accessible.

### Motion

The default SVG tween and optional `motion()` renderer respect
`prefers-reduced-motion` by default. Keep `respectReducedMotion: true` unless
an application has a stronger accessible motion policy. Reduced motion snaps
entrance, update, and focus-state changes to final geometry without scheduling
animation frames.

Motion should explain continuity between states. It should not:

- delay access to current values;
- loop without a pause control;
- move the focus target away from keyboard users;
- encode the only evidence of a change.

See [Dynamic Data and Animation](./composition.md#source-charts-docs-guides-dynamic-data-and-animation-md) for the
lightweight tween and optional spring renderer boundaries.

### Tooltips are supplemental

The built-in tooltip exposes its structured rows through a polite status region.
It is not a replacement for a label, axis, legend, or data table. Essential
information must remain available without hovering.

For complex framework content, use the adapter's tooltip-body composition
surface. Its transient body is inert, so a display-only nested chart can remain
visible but does not enter the focus or accessibility order. Render controls
only while `pinned` is true. The pinned surface has non-modal dialog semantics,
Escape and `dismiss()` close it, and focus returns to the chart when dismissal
starts inside the body. Controls still need an intentional tab order and
accessible names.

Use `tooltip.visibility: 'pinned'` when no transient surface should be
announced. Focus and pinned mark styling remain available, while the tooltip
element and framework body mount only after activation.

### Linked table pattern

For analytical and operational charts, a linked table gives readers exact
values and a familiar navigation surface. Selection state should be shared
semantically, rather than inferred from DOM nodes.

Use `keyedSelection` and `whenSelected` for chart activation and selected
geometry. Keep the semantic HTML table, status announcement, and clear control
in the application, bound to the same controlled selected key.

```tsx group=linked-chart-table env=charts-react file=/src/App.tsx entry
import { useMemo, useState } from 'react'
import { Chart } from '@tanstack/charts/react'
import { createDefinition } from './chart'
import { rows } from './data'

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const definition = useMemo(
    () => createDefinition(selectedId, setSelectedId),
    [selectedId],
  )

  const selected = rows.find((row) => row.id === selectedId)

  return (
    <section>
      <Chart
        definition={definition}
        height={280}
        ariaLabel="Customer onboarding observations"
        ariaDescription="Select a point or a table row to inspect the same observation."
      />
      <div>
        <p role="status" aria-live="polite">
          {selected
            ? `${selected.product}: ${selected.setupMinutes} minutes, satisfaction ${selected.satisfaction}`
            : 'No observation selected'}
        </p>
        <button
          type="button"
          disabled={!selected}
          onClick={() => setSelectedId(null)}
        >
          Clear selection
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <caption>Customer onboarding observations</caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Setup minutes</th>
            <th scope="col">Satisfaction</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSelected = row.id === selectedId
            return (
              <tr key={row.id}>
                <th scope="row">
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedId(row.id)}
                    style={{
                      minHeight: 44,
                      fontWeight: isSelected ? 700 : undefined,
                    }}
                  >
                    {row.product}
                    {isSelected ? ' — selected' : ''}
                  </button>
                </th>
                <td>{row.setupMinutes}</td>
                <td>{row.satisfaction}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
```

```ts group=linked-chart-table file=/src/chart.ts
import { defineChart, dot } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { keyedSelection, whenSelected } from '@tanstack/charts/selection'
import { rows, type Observation } from './data'

export function createDefinition(
  selectedId: string | null,
  onSelect: (id: string | null) => void,
) {
  const selection = keyedSelection<Observation, string, number, number>({
    selected: controlledSignal(selectedId, (next) => onSelect(next)),
    key: (datum) => datum.id,
  })

  return defineChart({
    marks: [
      dot(rows, {
        id: 'observations',
        x: 'setupMinutes',
        y: 'satisfaction',
        key: 'id',
        r: 5,
      }),
      whenSelected(
        dot(rows, {
          id: 'selected-observation',
          x: 'setupMinutes',
          y: 'satisfaction',
          key: 'id',
          r: 8,
          strokeWidth: 3,
        }),
        selection,
      ),
    ],
    x: { scale: scaleLinear, axis: { label: 'Setup time (minutes)' } },
    y: { scale: scaleLinear, grid: true, axis: { label: 'Satisfaction' } },
    selection,
  })
}
```

```ts group=linked-chart-table file=/src/data.ts collapsed
export interface Observation {
  id: string
  product: string
  setupMinutes: number
  satisfaction: number
}

export const rows: readonly Observation[] = [
  { id: 'atlas', product: 'Atlas', setupMinutes: 18, satisfaction: 9 },
  { id: 'beacon', product: 'Beacon', setupMinutes: 31, satisfaction: 7 },
  { id: 'comet', product: 'Comet', setupMinutes: 24, satisfaction: 8 },
  { id: 'delta', product: 'Delta', setupMinutes: 42, satisfaction: 6 },
  { id: 'ember', product: 'Ember', setupMinutes: 15, satisfaction: 10 },
]
```

[Open the full linked chart-and-table catalog case](https://tanstack.com/charts/catalog/82-chart-table-selection/).

### Testing checklist

Test the finished application, not only the SVG or Canvas element:

1. Navigate the page and chart with a keyboard.
2. Confirm visible focus and a logical navigation order.
3. Operate selection, pinning, zoom, and editing without a pointer.
4. Verify focus and selection persist correctly after data updates.
5. Enable reduced motion.
6. Test light, dark, forced-colors, and increased text size.
7. Inspect the accessible name and description.
8. Confirm exact values are available outside hover-only UI.
9. Confirm status and errors are not encoded only by color.
10. Use a screen reader on the complete task flow.

Automated checks can catch missing names and invalid roles, but they cannot
decide whether the representation communicates the right thing.

<a id="source-charts-docs-guides-interactions-and-selections-md"></a>

## Interactions And Selections

Source: `charts:docs/guides/interactions-and-selections.md`.

TanStack Charts owns datum focus, selection, crosshair presentation, optional
cursor bindings, and the mechanics of explicitly imported chart controls. The
application owns accepted semantic values, shared controller identity, and
product policy.

This boundary keeps the default host small and lets applications use
battle-tested interaction controllers only when needed.

### Choose the owner

Use native chart focus for:

- nearest-point inspection;
- grouped axis tooltips;
- snapped crosshairs;
- synchronized focus cursors;
- keyboard point navigation;
- point activation.

Use a first-party controlled chart control for:

- categorical series visibility through `interactiveColorLegend`;
- semantic point selection through `keyedSelection`;
- an unsnapped numeric or temporal plot position through `continuousCursor`;
- one ordered scale value through `handleX`;
- a scale-bound horizontal range through `brushX`;
- a controlled numeric or temporal x window through `zoomX`;
- other controls that explicitly accept a `ControlledSignal`.

Use controlled application state for:

- shared cursor-controller identity and programmatic cursor values;
- accepted brush, zoom, and pan domains;
- focus-and-context windows;
- synchronized-view layout and domain policy;
- scrollable resource lanes;
- playback timing and play/pause controls;
- editable intervals;
- rich pinned tooltips.

See [Tooltips and Focus](./interaction-accessibility.md#source-charts-docs-guides-tooltips-and-focus-md) for chart-owned datum inspection.

### Cursors and crosshairs

`crosshair` is presentation; `createChartCursor` is state. A crosshair without
a cursor binding follows the chart's local `ChartFocusState`:

```ts
import { crosshair } from '@tanstack/charts/crosshair'

const definition = defineChart({
  marks: [
    lineY(rows, { x: 'date', y: 'value' }),
    crosshair({ x: { label: true }, y: false }),
  ],
  x: { scale: scaleUtc },
  y: { scale: scaleLinear },
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

#### Synchronize focus by value

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

#### Track free coordinates

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
  x: { scale: xScale },
  y: { scale: yScale },
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

### Controlled signals

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

### Controlled keyed selection

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

### Continuous cursor

Use `continuousCursor` for an arbitrary x/y plot position that must not snap to
a datum:

```ts
import { defineChart, dot } from '@tanstack/charts'
import {
  continuousCursor,
  type ContinuousCursorChange,
  type ContinuousCursorPosition,
} from '@tanstack/charts/interaction/cursor'
import { controlledSignal } from '@tanstack/charts/interaction/signal'

type Position = ContinuousCursorPosition<number, number>

const definition = defineChart({
  marks: [dot(rows, { x: 'horsepower', y: 'economy' })],
  x: { scale: horsepowerScale },
  y: { scale: economyScale },
  controls: [
    continuousCursor({
      position: controlledSignal<
        Position | null,
        ContinuousCursorChange<number, number>
      >(cursorPosition, (next, { reason }) => {
        if (reason.type === 'commit' || reason.type === 'clear') {
          setCursorPosition(next)
        }
      }),
      xLabel: { format: (value) => `HP ${value.toFixed(1)}` },
      yLabel: { format: (value) => `MPG ${value.toFixed(1)}` },
    }),
  ],
})
```

Both scales must be invertible numeric or temporal scales. The behavior uses
their final resolved ranges, including a reversed y range, and clamps values to
the plot. This is the same default inversion used by a free `cursorHost`
binding. Rules and the marker are enabled by default. Axis labels are opt-in.

A `null` controlled position leaves pointer previews transient. Click or tap
proposes a `commit`; accepting its non-null position pins the cursor. A second
activation or Escape proposes `clear`. Pointer leave and cancellation clear an
unpinned preview. `ContinuousCursorChange` distinguishes `preview`, `commit`,
and `clear`, records pointer, touch, or keyboard source, and preserves the
origin position.

The SVG and Canvas DOM hosts replace the static scene fallback with a host
overlay, so pointer movement repaints the guide without rebuilding the chart
scene. Static SVG and React Native paint an accepted non-null position but do
not provide pointer input. Pair the cursor with semantic sliders or inputs and
visible status text for keyboard and nonvisual operation. Those controls can
write the same application-owned position.

### Custom interaction loop

Use this lower-level loop when no first-party behavior owns the gesture:

1. Render the definition from semantic state.
2. Read `scene.chart` and resolved scales in `onRender`.
3. Convert pointer geometry into semantic values.
4. Clamp, snap, or validate those values as product policy.
5. Update application state.
6. Let the next definition produce the scene.

Do not mutate SVG geometry directly and then attempt to reconcile application
state afterward.

### Controlled point inspection

Use the chart's interaction controller when the application owns pointer
timing but still wants the definition's focus strategy, focus marks, and
tooltip. Long-press inspection is one example:

```tsx
let interaction: ChartInteractionController<Row, Date, number> | undefined

const definition = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value', key: 'id' })],
  x: { scale: scaleUtc() },
  y: { scale: scaleLinear() },
  focus: 'nearest-x',
  pointer: false,
  tooltip,
})

const chart = (
  <Chart
    definition={definition}
    ariaLabel="Portfolio history"
    onRender={(context) => {
      interaction = context.interaction
    }}
  />
)

function inspect(clientX: number, clientY: number) {
  interaction?.setControlledFocus(interaction.resolvePointer(clientX, clientY))
}

function stopInspecting() {
  interaction?.setControlledFocus(null)
}
```

`resolvePointer` uses the current renderer presentation, including an active
motion or viewport transform, and returns the scene position, primary point,
and complete focus group. `setControlledFocus` paints the same definition-owned
focus and tooltip as chart-owned pointer input. Pass `{ pinned: true }` when the
configured sticky tooltip should accept interaction.

For a drag that does not require a nearby datum, use
`interaction.clientToScene(clientX, clientY)`. It applies the renderer's full
client-to-scene transform without coupling viewport movement to point focus.

`pointer: false` disables automatic pointer move, leave, and click handling. It
does not disable keyboard navigation. Controlled focus has separate ownership,
so unrelated mouse-leave and focus-out events cannot clear it. The stable
controller is available as `host.interaction` and in every `onRender` context.

### Invert resolved scales

First-party behaviors use the final resolved scale. A custom gesture can read
the same optional inverse from the scene:

```ts
const invertX = scene.scales.x.invert
if (!invertX) throw new Error('This interaction requires an invertible x scale')

const date = invertX(pointerX)
```

The resolved y scale already owns its reversed pixel range:

```ts
const invertY = scene.scales.y.invert
if (!invertY) throw new Error('This interaction requires an invertible y scale')

const value = invertY(pointerY)
```

Apply UTC month snapping, numeric rounding, minimum ranges, and domain clamps
after inversion. Those policies are application semantics, not scale math.
This date example uses a D3 time scale; the lightweight linear scale supports
the same resolved mapping and inversion flow for numeric gestures.
Free cursor bindings already consume the resolved inverse. Their `valueAt`
callback is reserved for snapping or another semantic override.

The [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) page is the sole source for
D3 ownership and official interaction-module links.

### Disable competing datum focus

When a gesture has no datum inspection at all, disable chart-owned focus explicitly:

```ts
import { focusDisabled } from '@tanstack/charts/focus/disabled'

const gestureDefinition = defineChart(definition, {
  focus: focusDisabled,
  keyboard: false,
})

mountChart(element, {
  definition: gestureDefinition,
  ariaLabel: 'Selectable monthly range',
  onRender: mountBrushOverlay,
})
```

This prevents an application-owned gesture from competing with the host's
point marker and tooltip. First-party host controls such as `brushX` and
`zoomX` isolate their own events.

Use `pointer: false` plus the interaction controller when the application owns
the gesture but the chart should still own datum focus. `focusDisabled` does
not remove keyboard accessibility from application-owned controls.
A definition `cursor` in `free` mode already owns the host pointer path and
does not require `pointer: false` or `focusDisabled`.

### Brush selection

A complete brush owns:

- drag start, move, end, and cancellation;
- reverse dragging normalization;
- semantic snapping;
- a visible selected range;
- focusable handles or equivalent range inputs;
- current-range text;
- reset behavior;
- selection preservation after data updates.

Import the optional first-party behavior and bind it to application state:

```tsx group=controlled-brush env=charts-react file=/src/App.tsx entry
import { useMemo, useState } from 'react'
import { defineChart, lineY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import {
  brushX,
  type BrushRange,
  type BrushXChange,
} from '@tanstack/charts/interaction/brush'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { Chart } from '@tanstack/charts/react'
import { rows } from './data'

const weeks = rows.map((row) => row.week)
const initialRange: BrushRange<number> = { start: 2, end: 6 }

export default function App() {
  const [range, setRange] = useState<BrushRange<number>>(initialRange)
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          lineY(rows, {
            x: 'week',
            y: 'signups',
            points: true,
            stroke: '#2563eb',
            strokeWidth: 2.5,
          }),
        ],
        x: { scale: scaleLinear().domain([1, 8]) },
        y: { scale: scaleLinear, grid: true, axis: { label: 'Signups' } },
        controls: [
          brushX({
            range: controlledSignal<BrushRange<number>, BrushXChange<number>>(
              range,
              (next, { reason }) => {
                if (reason.type === 'commit') setRange(next)
              },
            ),
            values: weeks,
            format: (week) => `Week ${week}`,
            ariaLabel: 'Reporting range',
            startAriaLabel: 'Range start',
            endAriaLabel: 'Range end',
          }),
        ],
      }),
    [range],
  )

  const isInitial =
    range.start === initialRange.start && range.end === initialRange.end

  return (
    <section>
      <Chart
        definition={definition}
        height={280}
        ariaLabel="Weekly signups with a selectable reporting range"
      />
      <p role="status" aria-live="polite">
        Current range: weeks {range.start}–{range.end}
      </p>
      <button
        type="button"
        disabled={isInitial}
        onClick={() => setRange({ ...initialRange })}
      >
        Reset range
      </button>
    </section>
  )
}
```

```ts group=controlled-brush file=/src/data.ts collapsed
export const rows = [
  { week: 1, signups: 18 },
  { week: 2, signups: 24 },
  { week: 3, signups: 31 },
  { week: 4, signups: 29 },
  { week: 5, signups: 42 },
  { week: 6, signups: 48 },
  { week: 7, signups: 46 },
  { week: 8, signups: 57 },
]
```

`values` defines semantic order, snapping, and keyboard steps. It is required
for strings and for keyboard handles. Number and Date brushes may omit it only
with `keyboard: false` and an invertible scale. The range remains non-null: a
blank click proposes a snapped zero-width range, which application policy can
expand into a fixed focus window.

Change reasons distinguish pointer previews, commits, and cancellation from
keyboard commits and cancellation. Rebuild the definition with the accepted
range. The behavior retains active controlled echoes, cancels divergent
external updates, normalizes reverse drags, clamps to the final plot, and
ignores synthetic D3 move events.

SVG and Canvas DOM hosts replace the static scene fallback with one accessible
brush overlay. Static SVG and React Native retain the visual selection only;
native applications must supply their own semantic range control. Import
`d3-brush` and `d3-selection` directly only for a different application-owned
gesture.

[Open the monthly time-series brush catalog case](https://tanstack.com/charts/catalog/89-brush-range-selection/).

### Scale-bound handle

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
  x: { scale: utcScale },
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

### Zoom and pan

Keep zoom state as a semantic window, not an opaque DOM transform. Import the
optional first-party behavior and bind it to the same window used by the x
scale:

```ts
import { defineChart, lineY } from '@tanstack/charts'
import {
  zoomX,
  type ZoomXChange,
  type ZoomXWindow,
} from '@tanstack/charts/interaction/zoom'
import { controlledSignal } from '@tanstack/charts/interaction/signal'

const definition = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value' })],
  x: { scale: utcScale.copy().domain([window.start, window.end]) },
  controls: [
    zoomX({
      window: controlledSignal<ZoomXWindow<Date>, ZoomXChange<Date>>(
        window,
        (next) => setWindow(next),
      ),
      extent: fullExtent,
      scaleExtent: [1, 8],
      ariaLabel: 'Zoomable revenue window',
      format: (date) => dayFormat(date),
    }),
  ],
})
```

`extent` is the complete allowed x domain. `scaleExtent` is `[1, maximum]` and
defaults to `[1, Infinity]`. The behavior owns final-scale inversion,
pointer-anchored wheel zoom, drag and horizontal-wheel pan, touch input,
keyboard zoom and pan, clamping, cancellation, and teardown. It captures the
wheel only after its plot surface receives focus, so normal page scrolling
remains available beforehand.

Every proposal is a complete number or Date window. `ZoomXChange` distinguishes
gesture `preview`, `commit`, and `cancel` events, includes the gesture origin,
and records its action and source. Rebuild the definition with every accepted
preview for live movement; a cancel proposes the origin. Keyboard changes
commit immediately.

Keep visible-row filtering or clipping, y-domain policy, status, reset and
recovery controls, follow-latest behavior, and persistence in the application.
A reset updates the same controlled window. Import `d3-zoom` directly only
when the application needs a different gesture policy.

### Linked views

Store one semantic cursor, selection, or domain and derive every view from it.
For focus cursors, share a `createChartCursor` controller with `match: 'x'` or
`match: 'y'`. Each view can have an independent opposite-axis scale while
sharing a date or category.

Validate outgoing events by semantic value, not matching pixel positions.
Different chart sizes and margins should still resolve the same selection.

### Timelines and editors

Scrubbers and editable ranges should pair direct manipulation with native
controls:

- range input for a playhead;
- two range inputs or date inputs for an interval;
- Play/Pause and Reset buttons;
- visible duration or current-frame text;
- Escape or Cancel for reversible edits;
- live announcements for committed changes.

The chart renders the controlled state. It does not become the form control.

### Scrollable lanes

For resource timelines, native horizontal overflow is often better than
capturing the wheel:

- keep the lane label rail fixed;
- let the timeline region scroll;
- preserve viewport-relative geometry after updates;
- keep task details reachable by keyboard;
- avoid clipping axis labels at the scroll boundary.

### Lifecycle

An interaction controller may install pointer capture, event listeners,
observers, nested chart hosts, or animation frames. `onRender` can update an
existing controller, but the application surface must destroy every resource
when the chart unmounts or ownership changes. `createChartCursor` itself owns
no platform resources; hosts unsubscribe when destroyed. A host clears only
the exact unpinned state object that it most recently published. If the
application or another host has replaced the controller state, cancellation,
rebinding, or unmount leaves that newer state intact. Pinned state also
survives lifecycle cleanup until an explicit dismissal or programmatic clear.

### Interaction checklist

- State is semantic and controlled.
- Crosshair presentation is derived from focus or a cursor binding instead of
  DOM mutation.
- Geometry comes from `scene.chart` and configured scale copies.
- Chart-owned focus is disabled only when another complete interaction owns the
  surface.
- Pointer, keyboard, and touch reach equivalent outcomes.
- Wheel capture does not unexpectedly trap page scrolling.
- Dragging survives out-of-bounds movement and cancellation.
- Range limits, snapping, and reset are explicit.
- State remains valid after data and size updates.
- External listeners, overlays, and nested hosts are destroyed.

<a id="source-charts-docs-guides-tooltips-and-focus-md"></a>

## Tooltips And Focus

Source: `charts:docs/guides/tooltips-and-focus.md`.

The DOM host provides a small automatic path for the common case:

- find the nearest chart point;
- draw a focus marker;
- show locale-aware text;
- expose the same point to pointer and keyboard users;
- notify typed application callbacks.

Use that path until the product needs richer interaction.

### Default nearest point

Import the built-in tooltip extension and add it to the definition:

```ts
import { tooltip } from '@tanstack/charts/tooltip'

const interactiveDefinition = defineChart(definition, { tooltip })

const host = mountChart(element, {
  definition: interactiveDefinition,
  height: 320,
  ariaLabel: 'Weekly downloads',
})
```

The default focus strategy resolves one nearest point in two dimensions.
`maxFocusDistance` defaults to 48 scene pixels. Empty space farther from any
point clears transient focus.

### Axis focus modes

| Mode        | Result                                                                    |
| ----------- | ------------------------------------------------------------------------- |
| omitted     | One nearest painted geometry or point in two dimensions                   |
| `nearest-x` | The containing mark, otherwise one point prioritizing x distance          |
| `nearest-y` | The containing mark, otherwise one point prioritizing y distance          |
| `group-x`   | The containing mark first, plus its semantic x group; otherwise nearest x |
| `group-y`   | The containing mark first, plus its semantic y group; otherwise nearest y |

Grouped focus is appropriate for comparing several series at the same date or
category. A sparse snapped cursor can opt into
`maxFocusDistance: Number.POSITIVE_INFINITY`; keep the finite default when
empty space should mean no focus.

### Angular focus

Use `focusGroupAngle` for the radial equivalent of `group-x`:

```ts
import { defineChart, type ChartDefinition } from '@tanstack/charts'
import { focusGroupAngle } from '@tanstack/charts/polar'
import { tooltip } from '@tanstack/charts/tooltip'

declare const radialDefinition: ChartDefinition

const interactiveDefinition = defineChart(radialDefinition, {
  focus: focusGroupAngle,
  tooltip,
})
```

The nearest radial ray selects the semantic angle, the closest radius becomes
primary, and the tooltip receives one point per series at that angle. The
strategy uses the same finite `maxFocusDistance` policy as axis grouping.
Ordinary pie and donut charts can keep default nearest focus: `radialArc`
attaches the exact painted slice geometry, including the donut hole.

Default `primary` and `group` presentation follows the canonical focused scene
points. Equal x/y/series values in another facet do not implicitly paint a
second focus marker. To synchronize a visual cursor across facets without
turning those mirrors into additional selected data, add an ordinary focus
mark with `whenFocused(..., { match: 'x' })` or `match: 'y'`. The tooltip and
focus callback still receive the resolver's primary point or explicit focus
group.

```ts
whenFocused(bandX(rows, { x: 'date' }), { match: 'x' })
whenFocused(bandY(rows, { y: 'value' }), { match: 'y' })
```

These are presentation filters, not alternate selection strategies. The first
paints a vertical band wherever the focused x value exists; the second paints a
horizontal band wherever the focused y value exists. `whenFocused` can only
reveal geometry already emitted by its authored mark. It cannot move one
stable band between values.

Use the data-less `crosshair` mark when one renderer-native guide should follow
the active focus instead of revealing authored geometry for a matching datum:

```ts group=focused-crosshair env=charts file=/src/chart.ts entry
import { defineChart, lineY } from '@tanstack/charts'
import { crosshair } from '@tanstack/charts/crosshair'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { tooltip } from '@tanstack/charts/tooltip'
import { rows } from './data'

export default defineChart({
  marks: [
    lineY(rows, {
      x: 'week',
      y: 'value',
      points: true,
      stroke: '#2563eb',
      strokeWidth: 2.5,
    }),
    crosshair({ x: { label: true }, y: false }),
  ],
  x: { scale: () => scalePoint<string>().padding(0.2) },
  y: { scale: scaleLinear, grid: true, axis: { label: 'Active users' } },
  focus: 'nearest-x',
  maxFocusDistance: Number.POSITIVE_INFINITY,
  tooltip,
})
```

```ts group=focused-crosshair file=/src/data.ts collapsed
export const rows = [
  { week: 'May 4', value: 820 },
  { week: 'May 11', value: 960 },
  { week: 'May 18', value: 1_140 },
  { week: 'May 25', value: 1_280 },
  { week: 'Jun 1', value: 1_210 },
  { week: 'Jun 8', value: 1_390 },
]
```

The vertical rule follows pointer and keyboard focus. The infinite distance is
an explicit continuous-snapping policy; keep the finite default when empty
space should clear focus.

`crosshair` defaults to both axis rules with no labels or marker. Setting
`band: true` or a band options object replaces that axis rule; axes with zero
bandwidth emit no band. Guides are clipped to the plot and labels are clamped
to the surface. They do not change nearest-point selection, add hit targets,
or suppress the primary focus ring. Use `focusRing: false` only when authored
cursor geometry deliberately replaces the ring. See
[Focus and Interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md)
for the complete band paint contract and controlled cursor behavior.

[Open the stacked cursor-band catalog case](https://tanstack.com/charts/catalog/119-stacked-bar-band-cursor/).

### Automatic tooltip mapping

The default `tooltip` extension renders labeled rows for the focused point.
Grouped focus uses the shared axis value as a heading and renders one row and
color swatch per series. Visible axis labels carry into the tooltip. Numbers
use the user's locale and dates use stable UTC ISO formatting.

Rect and link endpoints display as ranges. Bars and areas with an explicit
baseline display the interval length, so a stacked segment reports its own
value instead of the cumulative endpoint.

Order built-in channels, datum fields, and derived text for a single focused
point:

```ts
const definition = defineChart({
  marks,
  x,
  y,
  tooltip: {
    use: tooltip,
    items: [
      {
        channel: 'y',
        label: 'Revenue',
        text: (point) => currency(point.yValue),
      },
      {
        field: 'status',
        label: 'Status',
      },
      {
        id: 'change',
        label: 'Change',
        text: (point, { pinned }) =>
          pinned && point.datum.change != null
            ? percent(point.datum.change)
            : null,
      },
      'x',
    ],
  },
})
```

Array order is row order. A nullish field or `text` result omits the row.
Item `text`, `content`, `format`, and `formatGroup` callbacks receive `pinned`,
which is `false` during transient inspection and `true` after click, Enter, or
Space.
Use it to keep the transient tooltip compact and reveal detailed rows when the
same tooltip is pinned.
Grouped focus keeps its shared-axis heading and series rows. By default, rows
follow the marks top-to-bottom for an x-group and left-to-right for a y-group.
Override that with `sort: 'color-domain'`, `sort: 'focus'`, or a typed
comparator. Use channel items to format their heading, series names, and values.
Use `content` when a grouped tooltip needs additional columns or nested
sections.

Customize plaintext content with typed formatters:

```ts
const formattedDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    format(point, { pinned }) {
      const suffix = pinned ? ' · pinned' : ''
      return `${point.datum.label}: ${point.datum.value.toLocaleString()}${suffix}`
    },
  },
})
```

For grouped focus:

```ts
const groupedDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    formatGroup(points, { pinned }) {
      const date = points[0]?.xValue
      const heading =
        date instanceof Date ? date.toLocaleDateString() : String(date ?? '')

      return [
        pinned ? `${heading} · pinned` : heading,
        ...points.map(
          (point) =>
            `${point.groupLabel}: ${point.datum.value.toLocaleString()}`,
        ),
      ].join('\n')
    },
  },
})
```

Formatting precedence is `content`, `formatGroup`, `format`, then the automatic
content. All three callbacks receive the same `ChartTooltipContentContext`.
`content` returns safe title and row data. `format` and `formatGroup` return
plain text; returning HTML does not create DOM.

Add `className` to style the native HTML surface. Clicking pins the current
tooltip for text selection. A later click or Escape unpins it. Set
`sticky: false` to disable pinning.

Set `visibility: 'pinned'` when focus should style the chart without opening a
transient tooltip. Click, Enter, or Space can still pin the focused point; only
the pinned surface and adapter body are mounted. The default is
`visibility: 'focus'`.

### Tooltip motion

The built-in tooltip uses the active motion renderer's transition for entry,
movement between points, retargeting, and exit:

```ts
import { motion } from '@tanstack/charts/motion'

const renderer = motion({
  transition: {
    type: 'spring',
    stiffness: 170,
    damping: 18,
    mass: 1,
  },
})

const definition = defineChart({ marks, tooltip })

mountChartRenderer(container, {
  definition,
  renderer,
  width: 640,
  height: 360,
  ariaLabel: 'Monthly visitors',
})
```

A static chart-level transition can refine the renderer fallback:

```ts
const definition = defineChart({
  marks,
  motion: {
    transition: { type: 'spring', stiffness: 170, damping: 18, mass: 1 },
  },
  tooltip,
})
```

Set `tooltip.motion` to another transition to override both, or set it to
`false` to keep the tooltip immediate. These options customize the active
motion renderer; a static renderer stays immediate and does not import spring
physics. The renderer's reduced-motion policy also applies to the tooltip.

### Application-owned pointer timing

Set definition `pointer: false` when the application decides when inspection
begins, such as after a touch hold. Resolve the event and paint focus through
the controller exposed by `host.interaction` or `onRender`:

```ts
const target = interaction.resolvePointer(event.clientX, event.clientY)
interaction.setControlledFocus(target)

// On release or cancellation
interaction.setControlledFocus(null)
```

This keeps focus marks and tooltip content in the definition. The controller
uses presentation points, so an active path motion or viewport translation
does not detach the focus marker and tooltip from the painted datum. See
[Controlled point inspection](./interaction-accessibility.md#source-charts-docs-guides-interactions-and-selections-md)
for the complete ownership boundary.

### Anchoring and placement

Point anchoring is the stable default for scatterplots, bars, and keyboard
navigation:

```ts
const pointDefinition = defineChart(definition, {
  tooltip: { use: tooltip, anchor: 'point', placement: 'top' },
})
```

Pointer anchoring is useful when a dense mark has a large interactive
primitive. Keyboard focus falls back to the primary point:

```ts
const pointerDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    anchor: 'pointer',
    placement: ['right', 'left', 'bottom', 'top'],
    offset: 12,
  },
})
```

Grouped charts can avoid jumping between series by anchoring to the focused
group's bounding-box center:

```ts
const definition = defineChart({
  marks,
  x,
  y,
  focus: 'group-x',
  tooltip: {
    use: tooltip,
    anchor: 'group-center',
    placement: ['top', 'right', 'left', 'bottom'],
    sort: 'color-domain',
  },
})
```

Coordinates can be selected independently. This follows the focused x value
while fixing the tooltip to the top of the plot:

```ts
const fixedYDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    anchor: { x: 'value', y: 'plot-top' },
    placement: 'bottom',
    offset: 12,
  },
})
```

A custom resolver covers event ranges, maps, and application-specific
reference positions:

```ts
const customAnchorDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    anchor: (_points, { focus, pointer, plot, surface, scales }) => ({
      x: (scales.x.viewport?.map ?? scales.x.map)(focus.primary.xValue),
      y: plot.y,
    }),
    placement: 'bottom-left',
  },
})
```

Resolvers receive complete focus, pointer, plot, surface, and resolved-scale
state. Resolvers and placement use scene pixels. A nullish or non-finite custom
anchor falls back to the primary point. A placement list uses the first fit,
then the least-overflowing candidate.

### Escaping clipped containers

Keep tooltip layering with the chart definition:

```ts
import { portal } from '@tanstack/charts/tooltip/portal'

const definition = defineChart({
  marks,
  x,
  y,
  focus: 'group-x',
  tooltip: {
    use: tooltip,
    portal,
    anchor: 'group-center',
    placement: ['right', 'left', 'bottom', 'top'],
  },
})
```

The `portal` extension opens the tooltip as a manual Popover in the browser top
layer where supported. It remains a DOM descendant of the chart, so inherited
styles, ancestor selectors, and chart-scoped CSS custom properties continue to
work. If Popover is unavailable or fails, the host moves the tooltip directly
under the chart's `ownerDocument` body with fixed high-stack positioning. Both
paths escape `overflow: hidden` and local stacking contexts, use viewport
collision bounds, and reposition after scroll, viewport resize, or content
resize. Omitting `portal` keeps ordinary absolute positioning inside the chart.

For consistent fallback styling, target `tooltip.className` from a
document-level stylesheet and define required CSS custom properties on that
class or a shared document ancestor.

### Typed callbacks

Use callbacks when application UI needs the current semantic state:

```tsx
function WeeklyDownloads() {
  const groupedDefinition = defineChart(definition, { focus: 'group-x' })

  return (
    <Chart
      definition={groupedDefinition}
      ariaLabel="Weekly downloads"
      onFocusChange={(point) => {
        setFocusedRow(point?.datum ?? null)
      }}
      onFocusGroupChange={(points) => {
        setFocusedRows(points.map((point) => point.datum))
      }}
      onSelect={(point) => {
        setSelectedId(point?.datum.id ?? null)
      }}
    />
  )
}
```

`ChartPoint` includes:

- the original `datum` and its original index;
- stable point and mark keys;
- group value and label;
- typed semantic `xValue` and `yValue`;
- optional interval endpoints and range-or-difference presentation hints;
- resolved pixel `x` and `y`;
- resolved color.

Read product values from `point.datum`. Use pixel coordinates only to position
an overlay.

### Rich and nested tooltips

Framework adapters can replace only the tooltip body while the shared host
continues to own focus, ordering, anchoring, placement, portal coordinates,
and dismissal. This React example places a nested pie beside the native rows:

```tsx
import { Chart as TooltipChart } from '@tanstack/charts/react/tooltip'

export function RevenueChart() {
  return (
    <TooltipChart
      definition={definition}
      ariaLabel="Revenue by series"
      renderTooltipBody={({ points, defaultBody, pinned, dismiss }) => (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 8rem',
            gap: 12,
          }}
        >
          <div>{defaultBody}</div>
          <div>
            <SeriesPie points={points} />
            {pinned ? (
              <button type="button" onClick={dismiss}>
                Close
              </button>
            ) : null}
          </div>
        </div>
      )}
    />
  )
}
```

The nested component is an ordinary chart built from the focused group:

```tsx
import * as React from 'react'
import { defineChart, type ChartPoint } from '@tanstack/charts'
import { polar, radialArc } from '@tanstack/charts/polar'
import { Chart } from '@tanstack/charts/react'
import { pie } from 'd3-shape'

interface RevenueRow {
  date: Date
  series: string
  value: number
}

type RevenuePoint = ChartPoint<RevenueRow, Date, number>

function SeriesPie({ points }: { points: readonly RevenuePoint[] }) {
  const pieDefinition = React.useMemo(() => {
    const slices = pie<RevenuePoint>()
      .sort(null)
      .value((point) => Math.max(0, point.yValue))(points)

    return defineChart({
      marks: [
        polar({
          inset: 2,
          marks: [
            radialArc(slices, {
              key: (slice) => slice.data.key,
              fill: (slice) => slice.data.color ?? 'CanvasText',
            }),
          ],
        }),
      ],
      guides: false,
      x: null,
      y: null,
      keyboard: false,
    })
  }, [points])

  return (
    <Chart
      definition={pieDefinition}
      width={128}
      height={96}
      ariaLabel="Series share at the focused date"
    />
  )
}
```

`defaultBody` is the native title, rows, formatting, and swatches in the
adapter's native composition form. Render it as-is, wrap it, or omit it.
`points` preserves the grouped series order selected by `tooltip.sort`;
`content` exposes the same safe model when a different layout is needed.
`pinned` distinguishes transient inspection from interactive content, and
`dismiss()` clears the tooltip and returns focus to the chart when focus was
inside the body.

A custom body is inert while transient, so a display-only nested chart can stay
visible but cannot receive pointer or keyboard input. Render controls only when
`pinned` is true. The pinned body becomes a non-modal dialog; its controls
still need useful labels and intentional focus order. The adapter updates
framework content with focused-point changes and unmounts it when the tooltip
is dismissed or the parent chart unmounts.

For pin-only detail, configure `visibility: 'pinned'` in the definition. The
host then suppresses both the transient shell and the adapter body instead of
requiring the framework renderer to return an empty element.

| Adapter                      | Native body composition                            |
| ---------------------------- | -------------------------------------------------- |
| React, Preact, Solid, Octane | `renderTooltipBody` prop                           |
| Vue                          | `#tooltipBody` scoped slot                         |
| Svelte                       | `tooltipBody` snippet prop                         |
| Angular                      | `[tanstackChartTooltipBody]="definition"` template |
| Lit                          | `options.renderTooltipBody`                        |
| Alpine                       | `options.renderTooltipBody` returning DOM content  |

Each receives `points`, `content`, `defaultBody`, `pinned`, and `dismiss`.
Composition stays beside the component, slot, template, or directive options;
the framework-neutral definition still owns every tooltip behavior.

The [Interactive Charts examples](./examples-advanced.md#source-charts-docs-examples-interactive-charts-md) and
[Polar and Radar Charts](./examples-advanced.md#source-charts-docs-examples-polar-and-radar-md) show the
two pieces of the nested pie pattern.

### Keyboard behavior

With `keyboard` enabled:

- focusing the SVG selects the first navigable point;
- Arrow keys move through the strategy's navigation order;
- Home and End move to the first and last point;
- Enter or Space toggles an enabled sticky tooltip and calls `onSelect`;
- Escape dismisses a sticky tooltip.

A custom focus strategy owns both pointer resolution and navigation order.
Do not supply a pointer-only strategy.

### Dense data

Linear nearest-point search is deliberately small. For many independently
focusable points, pass a `ChartSpatialIndexFactory` built with an optional
spatial dependency. The factory also receives the resolved scene when it needs
primitive bounds rather than point anchors. The host rebuilds the index when
the scene changes.

See [Large Data](./production.md#source-charts-docs-guides-large-data-md) before adding an index: when many rows share
the same pixels, a bounded representation is usually more useful than faster
search over every raw point.

### Ownership checklist

- Use chart-owned focus for datum inspection.
- Choose two-dimensional, nearest-axis, or grouped-axis semantics explicitly.
- Keep a finite distance unless continuous snapping is intended.
- Use `crosshair` for a single focus-driven guide; use `whenFocused` to reveal
  existing data-bound geometry.
- Share semantic cursor state through `createChartCursor`, not copied pixels.
- Use native plaintext formatting for the 90% case.
- Use the `portal` extension where clipped ancestors or stacking contexts can
  hide the tooltip.
- Use the adapter's tooltip-body composition surface for framework content;
  use focus callbacks for separate application-owned surfaces.
- Give keyboard and pointer users equivalent state and selection.
- Keep interactive content pinned and dismissible.
- Let framework lifecycle destroy nested charts and external listeners with
  their owner.
