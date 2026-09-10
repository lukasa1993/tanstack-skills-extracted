# Bar And Rect — Bar bandwidth

[Guide and prerequisites](./charts-docs-reference-marks-bar-and-rect-md-ba5b9a5c.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Bar bandwidth

With a band scale on the categorical axis, bars use its responsive bandwidth.
With a nonband scale, the mark estimates width from the smallest distance
between distinct mapped positions and uses 80 percent of that distance. A
single-position fallback is capped at 48 pixels.

For predictable categorical bars, use a configured band scale and set its
padding. Scale setup and ownership are documented in
[Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md).

`inset` is applied after band or inferred layout and is clamped to at least
zero. A sufficiently large inset produces a zero-width or zero-height bar
rather than negative geometry.

`maxThickness` caps the painted width for `barY` or height for `barX` in final
chart pixels. The mark applies the cap after grouped-band layout and `inset`,
then centers the narrower bar in its resolved band. Narrow responsive bands
keep their natural size. Negative finite values clamp to zero; nonfinite values
do not cap the bar. Inline-state `inset` overrides remain absolute, but their
resolved geometry still honors the cap.
