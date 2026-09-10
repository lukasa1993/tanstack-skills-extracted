# Focus And Interaction — Controlled cursors

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Controlled cursors

Import the controller and host extension from the isolated cursor entry when
interaction state must be shared or set programmatically:

```ts
import { createChartCursor, cursorHost } from '@tanstack/charts/cursor'

const sharedDate = createChartCursor<Date, number>()

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
  cursor: {
    use: cursorHost,
    controller: sharedDate,
    mode: 'focus',
    match: 'x',
    pin: true,
  },
})
```

```ts
function createChartCursor<
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(
  initialState: ChartCursorState<TXValue, TYValue> | null = null,
): ChartCursorController<TXValue, TYValue>
```

Every definition cursor binding accepts these common fields:

| Option       | Default  | Meaning                                      |
| ------------ | -------- | -------------------------------------------- |
| `use`        | Required | Cursor host extension, normally `cursorHost` |
| `controller` | Required | Observable structural cursor controller      |
| `mode`       | Required | `focus` or `free` binding discriminator      |
| `pin`        | `false`  | Enables activation to pin and dismiss        |

Mode-specific fields are:

| Mode    | Option  | Default       | Meaning                                     |
| ------- | ------- | ------------- | ------------------------------------------- |
| `focus` | `match` | `xy`          | Semantic axes shared between hosts          |
| `free`  | `x`     | Scale inverse | Optional x-axis `valueAt` semantic override |
| `free`  | `y`     | Scale inverse | Optional y-axis `valueAt` semantic override |

A free cursor inverts each coordinate through that destination scene's
resolved scale by default. Reversed ranges and responsive plot geometry need
no copied scale. A missing or non-invertible scale requires an explicit
`valueAt(context)` callback for that axis. Use the callback to replace default
inversion with observed-value snapping, rounding, or another semantic mapping;
return `undefined` for an intentionally coordinate-only axis.

`createChartCursor` remains a three-method structural store. `cursorHost` opts
the binding into platform-neutral cursor policy without adding that policy to
charts that do not use cursors. Adapter and renderer authors can import the
projection, focus, presentation, and session helpers from
`@tanstack/charts/cursor/host`; application code normally uses the token from
`@tanstack/charts/cursor`.

`ChartCursorExtensionToken` is the environment-neutral binding contract.
`cursorHost` implements it as a `ChartCursorHostExtension`. Adapter authors
call `createChartCursorHostSession(binding)` to create an ownership-safe
`ChartCursorHostSession` for one mounted binding.

That host entry uses `createFocusChartCursorState` and
`createFreeChartCursorState` to publish state, then
`resolveChartCursorPresentation` and `resolveChartCursorFocus` to project it
into each scene. `resolveChartPointerFocus` composes built-in axis focus with
painted containment and returns `undefined` for default nearest focus so a host
can apply its spatial index or renderer geometry. `resolveChartFocusStrategy`
converts a built-in focus name to its grouping strategy.
`resolveFocusPresentation` finally produces renderer-neutral underlay and
overlay nodes. An empty array from `resolveChartPointerFocus` means an explicit
strategy found no target. Pass `scene.points` (the default) as its final
argument to enable painted containment. A distinct array explicitly signals
active renderer presentation points and preserves anchor resolution while
those interpolated points are authoritative.

Use the same controller in several browser or React Native definitions to
synchronize by semantic value rather than pixel position. In `focus` mode,
pointer, responder, keyboard, or accessibility focus publishes a
value-anchored cursor. Each subscribing host maps the value through its own
scales, resolves its own local point and focus group, and paints its crosshair
and tooltip. `match` defaults to `xy`; choose `x` or `y` for an axis cursor.
The originating point's group is retained as the preferred series when more
than one local point matches. Optional `ChartCursorState.origin` carries
`{ key, markId, datumIndex }` to retain the local point when equal values
repeat, including across facets. A unique `key` plus `markId` survives data
reordering; `datumIndex` disambiguates duplicate keys. A consuming scene
ignores the tie-breaker when its key and mark do not exist, then resolves from
the portable semantic `value` and preferred `group`.

`free` mode follows plot coordinates without resolving a datum:

```ts
const freeCursor = createChartCursor<Date, number>()

const definition = defineChart(baseDefinition, {
  cursor: {
    use: cursorHost,
    controller: freeCursor,
    mode: 'free',
    pin: true,
  },
})
```

The host publishes normalized plot coordinates so the free cursor survives a
responsive relayout, while resolved-scale inversion adds semantic values for
labels and application state. `valueAt` is an explicit replacement when the
interaction needs snapping or another precision policy. Programmatic state may
instead use `anchor: 'value'`,
`anchor: 'normalized'`, or `anchor: 'scene'`. Only the anchor's coordinate
space is authoritative; the other fields are diagnostics from the host that
last emitted the state.

`createChartCursor` returns `getState`, `setState`, and `subscribe`. Passing
`null` clears the cursor, and `setState` accepts a previous-state updater.
Unpinned host-owned state clears on pointer or responder cancellation, leave,
and blur. Cleanup is ownership-safe: a host clears only the exact unpinned
state object it most recently published to that controller. State replaced by
the application or another host, and pinned state, survives that host's
cleanup, rebinding, and unmount.

With `pin: true`, click or tap pins. Browser focus cursors toggle through Enter
or Space and dismiss through Escape; React Native focus cursors expose the
equivalent activate and escape accessibility actions. A pinned free cursor can
be toggled by another click or tap, or cleared programmatically.

Free mode deliberately does not invent keyboard datum navigation. When its
values are part of the reader's task, pair it with a labeled semantic control
or status output. A focus-mode cursor inherits the chart's existing keyboard
navigation and accessible tooltip behavior.

Definition cursor bindings have browser and React Native host parity. DOM
renderer hosts publish pointer and keyboard interaction. React Native `Chart`
publishes responder gestures and, for focus mode, accessibility navigation,
activation, and dismissal. Both hosts subscribe to programmatic updates and
shared controllers. Free mode deliberately remains a coordinate gesture with
no invented keyboard or accessibility datum order.
