# Interactions And Selections — Controlled point inspection

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Controlled point inspection

Use the chart's interaction controller when the application owns pointer
timing but still wants the definition's focus strategy, focus marks, and
tooltip. Long-press inspection is one example:

```tsx
let interaction: ChartInteractionController<Row, Date, number> | undefined

const definition = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value', key: 'id' })],
  scales: {
    x: { scale: scaleUtc() },
    y: { scale: scaleLinear() },
  },

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
