# Bar And Rect — Bar corner radii

[Guide and prerequisites](./charts-docs-reference-marks-bar-and-rect-md-ba5b9a5c.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Bar corner radii

Use a number to round every corner and preserve the existing rectangle output:

```ts
barY(rows, {
  x: 'category',
  y: 'value',
  radius: 4,
})
```

A four-value tuple controls physical corners in top-left, top-right,
bottom-right, bottom-left order. The order stays physical when a scale range or
an interval is reversed. The option is a visual channel, so an accessor can
return a different number or tuple for each row.

```ts
barY(rows, {
  x: 'category',
  y: 'value',
  radius: [6, 6, 0, 0],
})
```

Use `end` when the rounded corners should follow the semantic value endpoint.
This works for positive and negative values and for reversed scale ranges.

```ts
barY(rows, {
  x: 'category',
  y: 'value',
  radius: { end: 6 },
})
```

For an implicit stack, an omitted `stack` rounds only the exposed positive or
negative stack endpoint. For explicit intervals and grouped bars, it rounds
each bar because there is no native stack envelope. Set `stack: 'each'` to
round every implicit stack segment. An explicit `stack: 'outer'` requires an
implicit stack and rejects explicit interval endpoints and `group()` layouts.
The outer edge comes from the resolved stack geometry. If a nondiverging
offset makes intervals overlap at that edge, every touching interval receives
its own radius on the same physical envelope edge so a later fill cannot square
off the envelope. Anchor-translated stacks can expose one end on each side of
zero, and both resolved outer ends are rounded.

```ts
barY(rows, {
  x: 'category',
  y: 'value',
  z: 'series',
  radius: { end: 6, stack: 'each' },
})
```

The related public types are `RectCornerRadii`, `RectRadius`,
`BarEndRadius<TDatum>`, and `BarRadius<TDatum>`. Selective radii are clamped to
finite nonnegative values. When adjacent values do not fit, they shrink
proportionally without changing their ratio. Zero-length semantic bars have
square corners. Inline-state `radius` overrides accept the same number or
physical tuple forms.
