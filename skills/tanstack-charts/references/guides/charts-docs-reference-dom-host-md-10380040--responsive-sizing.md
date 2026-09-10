# Dom Host — Responsive sizing

[Guide and prerequisites](./charts-docs-reference-dom-host-md-10380040.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Responsive sizing

When `width` is absent, the host reads the container's content-box width. When
both `height` and a valid `aspectRatio` are absent, it also reads the
content-box height. Padding and borders stay outside the scene. The host
observes either container-owned dimension with the container document's
`ResizeObserver`.

```ts
mountChart(container, {
  definition,
  aspectRatio: 16 / 9,
  initialWidth: 720,
  ariaLabel: 'Traffic over time',
})
```

The fallback order is:

1. explicit `width`
2. positive container content width
3. `initialWidth`
4. `640`

Height is explicit `height`, then a positive finite `aspectRatio`, then a
positive finite container content height, then `320`. Explicit height and
aspect ratio remain authoritative when the container's CSS height changes. A
fixed `width` disables width observation but does not disable height
observation when both `height` and a valid `aspectRatio` are absent. The host
schedules responsive relayout on the document's animation frame and skips
responsive relayouts when neither live dimension changed. Zero and nonfinite
measurements do not replace the current scene. Resize relayout commits
immediately by default; set `svgAnimation.resize` to `true` to animate it.
Container-owned height must resolve independently of the chart surface, such
as a fixed-height card, grid row, flex item, or remaining track. When the chart
itself would size a `height: auto` container, supply `height` or `aspectRatio`
instead so the surface is not also its own resize input.

The host temporarily assigns `position: relative` when the container's
computed position is static, because local DOM tooltips are absolutely
positioned inside it. Adding the `portal` extension to the tooltip options
instead places the tooltip in the browser top layer through a manual Popover,
or directly under the `ownerDocument` body as a fixed fallback, and positions
it against the viewport. `destroy` restores the previous inline position when
the host owned that change and removes its tooltip.
