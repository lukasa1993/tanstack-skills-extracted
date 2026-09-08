# Interactions And Selections — Interaction checklist

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Interaction checklist

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
