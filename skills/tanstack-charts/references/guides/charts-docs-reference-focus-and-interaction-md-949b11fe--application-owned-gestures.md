# Focus And Interaction — Application-owned gestures

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Application-owned gestures

Dragging, scrolling, custom crosshair overlays, and freeform range or lasso
selections can listen on a wrapper or use `onRender` to attach application
behavior to the default SVG or complete surface. Use `handleX` for one ordered
scale value, `brushX` for a normal horizontal semantic range, and `zoomX` for a
normal controlled x window. For custom gestures, keep semantic state outside
the scene and update a responsive definition by replacing its identity.

Use a definition cursor binding for snapped or free crosshairs. Keep other
semantic state outside the scene.

For application-timed datum inspection, use the stable controller instead of
reimplementing coordinate conversion and focus:

```ts
const position = interaction.clientToScene(event.clientX, event.clientY)
const target = interaction.resolvePointer(event.clientX, event.clientY)
interaction.setControlledFocus(target)
interaction.setControlledFocus(null)
```

The resolution contains the scene position, primary point, and focus group.
Passing that resolution to `setControlledFocus` infers `source: 'pointer'` and
re-resolves its held position after scene and presentation updates. Passing a
raw `ChartPoint` defaults to `source: 'programmatic'`; either source can be
overridden explicitly. Controlled focus is not cleared by unrelated
pointer-leave or focus-out events. Pass `{ pinned: true }` to make an enabled
sticky tooltip interactive.

Clean up application listeners before the next attachment or unmount.
For a completely independent renderer or interaction layer, use the scene and
extension contracts in [Custom extensions](./charts-docs-reference-custom-extensions-md-9e8eefa0.md#source-charts-docs-reference-custom-extensions-md).
