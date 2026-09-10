# Motion — Rolling paths

[Guide and prerequisites](./charts-docs-reference-motion-md-125c7e38.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Rolling paths

Path morphing matches SVG path commands. That is useful when values change in
place, but a rolling time series should keep each retained sample intact and
move the trace left:

```ts
const definition = defineChart({
  motion: {
    path: {
      update: 'rolling',
      x: 'shift',
      y: 'reproject',
      fallback: 'snap',
    },
    transition: { type: 'tween', duration: 800, easing: 'linear' },
  },
  marks: [lineY(rows, { x: 'time', y: 'value', key: 'id' })],
  scales: {
    x: { scale: scaleUtc().domain([visibleStart, visibleEnd]) },
    y: { scale: scaleLinear().domain([0, 100]) },
  },

  clip: true,
})
```

Include enough keyed samples before `visibleStart` to cover the largest
expected update batch. A valid rolling update installs the completed path
beyond the right clip, applies one affine transform that reproduces the prior
frame, and animates that transform to identity. Retained samples therefore move
as one piece while new samples enter from the right.

The renderer validates the update before animating it:

- retained keys must be the exact old suffix and new prefix;
- the keyed primitive must remain a line or remain an area;
- added and removed sample counts must balance;
- retained semantic x, y, interval, and group values must be unchanged;
- every retained x coordinate must share one translation;
- the plot bounds must be stable and the path must be inside a clip;
- neither the previous nor target path may have a nonzero transient x or y
  viewport translation;
- the target geometry must cover both clip edges throughout the shift;
- custom path strings and neighbor-sensitive curves do not use the affine
  path.

Omitting `y` is equivalent to `y: 'fixed'` and requires unchanged screen y
coordinates. `y: 'reproject'` also
accepts a changed continuous y-domain when one affine y transform maps the new
projection back to the previous frame. This preserves the path geometry while
the line shifts and the y-axis updates. Keep an area's baseline semantically
stable, such as `y1: 0`, so both edges can be reprojected.

`fallback` defaults to `'snap'`. An update that does not satisfy the rolling
contract is installed without an unrelated path morph. Use
`fallback: 'morph'` only when command interpolation is the intended failure
behavior.

A valid update that interrupts another rolling update composes the transform
currently painted on the path with the next shift, then continues toward the
new target. It does not reset to either completed scene. Presentation points,
focus marks, and an active tooltip follow the same composed geometry.

Authored point dots and default focus circles use the path's rolling timing.
Entering points begin under the composed transform, exiting points travel out
through the clip, and snap fallback removes stale exiting presentation points
in the same commit as the path. A focus layer can update immediately during
data motion; geometry or style from an inline mark state waits until the active
data transition settles so it cannot cancel the rolling transform. Back-to-back
updates retain the latest requested state and apply it when the feed becomes
idle; a feed that never becomes idle keeps state geometry deferred while focus
layers and tooltips continue to follow presentation points.

Rolling motion rejects a nonzero `viewport.translate` on either axis because
the viewport and path would otherwise own competing transient transforms.
Commit the viewport domain and reset its translation before the rolling data
update, or expect the configured snap-or-morph fallback.

Use fixed plot margins so changing tick-label widths cannot change the affine
frame. Use linear segments or a curve whose visible control points do not
change when a sample is appended.

`motion()` renders SVG clip paths and gradients itself, so `clip: true` applies
to the animated marks without a separate resource renderer.
