# Bar And Rect — Stacked bars

[Guide and prerequisites](./charts-docs-reference-marks-bar-and-rect-md-ba5b9a5c.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Stacked bars

The single value channel is a length. Repeated categorical positions stack
automatically, with positive and negative values diverging from zero:

```ts
barY(rows, {
  x: 'quarter',
  y: 'revenue',
  color: 'region',
})
```

Use `z` when series identity differs from color. Add `layout: stack()` only
when the default stack needs a configured order or offset:

```ts
barY(rows, {
  x: 'quarter',
  y: 'revenue',
  color: 'segment',
  layout: stack({
    order: ['Core', 'Services'],
    offset: 'normalize',
  }),
})
```

`order` accepts input order, ascending or descending absolute totals,
inside-out streamgraph order, or an explicit series list. `reverse` reverses
the resolved order. `offset` accepts `diverging` (default), `normalize`,
`center`, or `wiggle`.

```ts
type StackOrder =
  'input' | 'ascending' | 'descending' | 'inside-out' | readonly ChartKey[]
type StackOffset = 'diverging' | 'normalize' | 'center' | 'wiggle'

interface StackAnchor {
  series: ChartKey
  fraction?: number
}

interface StackOptions {
  order?: StackOrder
  offset?: StackOffset
  reverse?: boolean
  anchor?: StackAnchor
}

interface StackLayout extends StackOptions {
  readonly type: 'stack'
}
```

`inside-out` uses each series peak and total to balance layers above and below
the stream. `wiggle` is intended for nonnegative streamgraph values. After the
wiggle offset is complete, Charts translates the whole stack so its global
minimum start is zero. It does not independently rebase each position.

Use `anchor` when ordered, nonnegative category counts should diverge around a
point inside one series. This Likert layout places the midpoint of `Neutral` at
zero:

```ts
barX(counts, {
  x: 'count',
  y: 'question',
  z: 'response',
  color: 'response',
  layout: stack({
    order: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree'],
    anchor: { series: 'Neutral', fraction: 0.5 },
  }),
})
```

`fraction` defaults to `0.5`; zero selects the series start and one selects its
end. Anchor layout zero-imputes missing position/series cells before translating
the completed stack, but it emits no synthetic rows. The anchor series may be
absent at a position. It must still appear in the resolved series order, which
an explicit `order` can establish. Anchors reject negative lengths and cannot
be combined with `normalize`, `center`, or `wiggle` offsets.

Positions and series retain first-seen order. Missing position/series pairs
contribute zero to layout without creating synthetic rows or interaction
points.

Supplying `y1` or `y2` opts out of implicit stacking and treats the channels
as authored endpoints. The same contract is transposed for `barX`.
