# Focus And Interaction — Default behavior

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Default behavior

With no custom focus strategy:

- pointer movement finds the nearest point within `maxFocusDistance`
- pointer leave or cancellation clears unpinned focus
- the SVG uses `tabIndex` (`0` by default) when `keyboard` is enabled
- focusing the SVG selects the first point in the keyboard task order
- arrow keys move through points sorted by pixel x, then pixel y
- `Home` and `End` move to the first and last point
- `Enter` and Space toggle an enabled sticky tooltip and call `onSelect` for
  the focused point
- pressing the pointer outside both the chart and the tooltip dismisses a pinned tooltip
- a configured selection controller receives the same focused point before
  `onSelect`
- a click focuses and selects the nearest point, or selects `null` on the
  blank surface
- the renderer's focus ring follows the primary point

`maxFocusDistance` defaults to `48` scene pixels. Set `tabIndex` to control
normal tab-order participation while keeping keyboard handling enabled. Set
`keyboard: false` to remove keyboard navigation and force tab index `-1`.
Authored `whenFocused` marks compose with the primary-point ring. Set
definition `focusRing: false` only when authored focus geometry replaces that
indicator.

Use `focusGuideX` or `focusGuideY` from `@tanstack/charts/focus/guide` for
datum-bound rules, markers, and axis labels. Their active geometry uses stable
structural keys, so the optional motion renderer can animate rapid focus
retargets without an application SVG or frame loop. See
[Focus guide marks](./charts-docs-reference-marks-focus-guide-md-7c751ac1.md#source-charts-docs-reference-marks-focus-guide-md).

Set `pointer: false` when the application owns the pointer gesture but still
wants chart focus, focus marks, and tooltips. Automatic pointer move, leave,
and click handling stops; keyboard navigation remains independent. Resolve and
paint application-owned focus through `host.interaction` or the interaction
controller reported by `onRender`.

### Interaction geometry

When neither `focus` nor `spatialIndex` is supplied, pointer resolution has two
stages:

1. The topmost interactive scene primitive containing the pointer wins. The
   resolver traverses the final scene in reverse paint order and applies nested
   translations and clips.
2. If no primitive contains the pointer, its `interaction.affinity` ranks the
   fallback. `x` and `y` compare distance from that axis boundary first and use
   complete geometry distance to break ties; `xy` compares complete geometry
   distance; `geometry` has no off-shape fallback.

`maxFocusDistance` applies to that primary boundary distance, not necessarily
to the point used as the tooltip and keyboard anchor. A semantic point that is
not attached to a scene primitive retains anchor-based two-dimensional
distance.

The primitive is the geometry source of truth: `rect` includes its rounded
corners, `dot` uses its radius, `area` uses its polygon, and `polyline` and
`rule` use their stroked paths. Its `interaction` attaches either one semantic
point or the ordered points represented by a continuous primitive. Groups and
labels cannot carry interaction metadata.

Built-in marks attach these natural defaults:

| Mark                     | Scene primitive       | Fallback |
| ------------------------ | --------------------- | -------- |
| `barY`                   | Rounded rectangle     | `x`      |
| `barX`                   | Rounded rectangle     | `y`      |
| `lineY`                  | Stroked polyline      | `x`      |
| `areaY`                  | Filled area           | `x`      |
| `areaX`                  | Filled area           | `y`      |
| `rect`, `dot`, `hexagon` | Rect, circle, polygon | `xy`     |
| `bandX`                  | Rounded rectangle     | `x`      |
| `bandY`                  | Rounded rectangle     | `y`      |

Facet layout rewrites the primitive's attached point references while leaving
the primitive in local coordinates. The resolver therefore observes the same
post-layout translations and clips as SVG and Canvas instead of maintaining a
second geometry copy. Inline mark states similarly return a resolved scene to
the host; during a transition, pointer selection intentionally follows that
destination scene rather than interpolating a second hit-test scene.

With an active axis viewport, the host calls
`viewportInteractionPoints(scene, presentationPoints)` before pointer,
keyboard, custom-focus, or spatial-index resolution. Off-window anchors from
clipped viewport content remain in `scene.points` but are not focus candidates;
fixed-ownership mark points remain eligible. Direct scene consumers can pass
that filtered list as the optional final argument to
`findNearestPoint(scene, x, y, maxDistance, points)` so primitive hit testing
uses the same candidate set.

For curved `polyline` and `area` nodes, the current resolver uses the
primitive's structured point geometry. Exact picking against an optional
authored SVG path string remains a separate refinement.

Built-in axis focus modes compose painted containment with axis snapping. When
the pointer is inside an interactive primitive, the topmost painted mark seeds
the primary point. Outside painted geometry, the configured axis mode uses its
normal nearest-axis fallback. A custom strategy replaces this host behavior.
