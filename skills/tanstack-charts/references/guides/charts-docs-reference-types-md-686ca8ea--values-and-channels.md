# Types — Values and channels

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Values and channels

```ts
type ChartValue = number | string | Date
type ChartKey = string | number

interface ChannelAccessorContext<TDatum> {
  index: number
  data: readonly TDatum[]
}

type ChannelAccessor<TDatum, TValue> = (
  datum: TDatum,
  context: ChannelAccessorContext<TDatum>,
) => TValue

type Channel<TDatum, TValue> =
  ChannelField<TDatum, TValue> | ChannelAccessor<TDatum, TValue>

type VisualChannel<TDatum, TValue> = TValue | ChannelAccessor<TDatum, TValue>
```

The corresponding public type names are `Channel`, `ChannelAccessor`,
`ChannelAccessorContext`, and `VisualChannel`.

A `Channel` accepts only datum keys whose declared values are compatible with
the channel, or an accessor that derives a value from the row. Its context
contains the index and full readonly data array. A `VisualChannel` replaces
the field-name form with a constant: it accepts either one constant value or
an accessor.

```ts
import { lineY } from '@tanstack/charts'

interface Row {
  date: Date
  value: number
  label: string
  series: 'actual' | 'forecast'
}

lineY(rows, {
  x: 'date', // Date
  y: 'value', // number
  z: 'series',
  stroke: (row) => (row.series === 'actual' ? '#2563eb' : '#60a5fa'),
})
```

`ChannelField`, `ChannelOutput`, `OptionChannelOutput`,
`WidenChartValue`, and `ChartAxisValue` are exported for extension authors.
Literal chart values widen to their semantic primitive so a literal row does
not produce an unusably narrow scale or callback type.
