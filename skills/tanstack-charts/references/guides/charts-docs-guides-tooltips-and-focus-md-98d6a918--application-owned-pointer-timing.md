# Tooltips And Focus — Application-owned pointer timing

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Application-owned pointer timing

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
[Controlled point inspection](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md#source-charts-docs-guides-interactions-and-selections-md)
for the complete ownership boundary.
