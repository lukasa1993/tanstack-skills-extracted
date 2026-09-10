# Dom Host — `ChartHost`

[Guide and prerequisites](./charts-docs-reference-dom-host-md-10380040.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `ChartHost`

```ts
interface ChartHost<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  readonly interaction: ChartInteractionController<TDatum, TXValue, TYValue>
  update(options: ChartHostOptions<TDatum, TXValue, TYValue>): void
  getScene(): ChartScene<TDatum, TXValue, TYValue>
  destroy(): void
}
```

### `interaction`

The stable interaction controller resolves client coordinates through the
current renderer presentation and can paint application-owned focus:

```ts
const position = host.interaction.clientToScene(event.clientX, event.clientY)
const target = host.interaction.resolvePointer(event.clientX, event.clientY)
host.interaction.setControlledFocus(target)

host.interaction.setControlledFocus(null)
```

A pointer resolution preserves pointer ownership across scene updates and
presentation frames. A raw point uses programmatic ownership unless `source`
is supplied explicitly.

Use definition `pointer: false` when a long-press, drag mode, or another
application gesture decides when point inspection begins. Keyboard navigation
remains enabled independently. See
[Interactions and Selections](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md#source-charts-docs-guides-interactions-and-selections-md).

### `update`

`update` replaces the complete option set. Keep required options in every call.
It renders synchronously when definition identity, size, accessibility,
renderer, keyboard, ID, or text measurement changes. Interaction callbacks,
tooltip formatting, focus strategy, animation settings, and the spatial index
can update without rebuilding the scene.

An interrupted animated render is canceled before the next reconciliation.
When the focused observation can be restored after a scene rebuild, focus and
grouped focus are repainted against its new coordinates.

### `getScene`

Returns the current compiled scene. It is useful for aligned application UI,
diagnostics, or custom interaction. Treat it as immutable.

### `destroy`

`destroy` is idempotent. It disconnects resize and font listeners, cancels
scheduled work and animation, removes interaction listeners, clears the
container, and releases an inline positioning change owned by the host. A
destroyed host ignores later updates.
