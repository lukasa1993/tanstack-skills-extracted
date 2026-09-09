# Focus And Interaction — Continuous cursor

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Continuous cursor

Import `continuousCursor` from `@tanstack/charts/interaction/cursor` and place
it in `ChartDefinitionOptions.controls`. Its `position` is a controlled
`ContinuousCursorPosition<TXValue, TYValue> | null`. Both values must be
numbers or dates backed by invertible scales.

`ContinuousCursorChange` reports one of:

- `preview` for pointer or touch movement, leave, and cancellation;
- `commit` when click or tap proposes a pinned position; or
- `clear` when a pinned cursor is toggled off or Escape is pressed.

Every reason includes the proposed `value`, the controlled `origin`, a
`source`, and a more specific `cause`. Rebuild the definition with an accepted
commit or clear. Pointer previews remain host-local while the controlled value
is `null`, avoiding a chart-scene render for each movement.

`xRule`, `yRule`, and `marker` configure renderer-neutral guide geometry and
are enabled by default. `xLabel` and `yLabel` are opt-in and accept semantic
formatters plus side, offset, padding, background, text, stroke, and typography
options. The behavior resolves all geometry against the final plot and scale
ranges.

SVG and Canvas DOM hosts mount the same contained pointer overlay. Static SVG
and React Native retain only the guide for an accepted non-null position. The
overlay is presentation-only, so applications should pair it with semantic
sliders or inputs, status text, and any persistence or rounding policy.

This differs from `focusGuideX` and `focusGuideY`: focus guides retarget to a
datum-owned chart point and participate in mark motion, while
`continuousCursor` tracks an unsnapped value pair without creating a focus or
selection point.

The public cursor types divide state, event, and presentation concerns:

| Type                                        | Contract                                                           |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `ContinuousCursorValue`                     | A finite `number` or valid `Date`                                  |
| `ContinuousCursorPosition<TX, TY>`          | The semantic x/y pair                                              |
| `ContinuousCursorPointerSource`             | Pointer or touch preview/commit source                             |
| `ContinuousCursorSource`                    | Pointer, touch, or keyboard clear source                           |
| `ContinuousCursorChange<TX, TY>`            | Preview, commit, and clear reason union                            |
| `ContinuousCursorRuleOptions`               | Rule stroke, opacity, width, dash, and cap                         |
| `ContinuousCursorMarkerOptions`             | Marker radius, fill, stroke, and opacity                           |
| `ContinuousCursorLabelOptions<TValue>`      | Formatter, side, spacing, box, text, stroke, and typography        |
| `ContinuousCursorOptions<TXValue, TYValue>` | Controlled position plus x/y rule, marker, and label configuration |
