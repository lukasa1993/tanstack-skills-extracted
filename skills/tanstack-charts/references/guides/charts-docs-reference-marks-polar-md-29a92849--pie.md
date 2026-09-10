# Polar — `pie`

[Guide and prerequisites](./charts-docs-reference-marks-polar-md-29a92849.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `pie`

```ts
function pie<TDatum extends object>(
  source: Iterable<TDatum>,
  options: PieOptions<TDatum>,
): PieDatum<TDatum>[]
```

`pie` eagerly allocates a nonnegative value channel into angle intervals. It
does not render geometry or depend on chart dimensions.

| Option       | Type                      | Default     | Meaning                                      |
| ------------ | ------------------------- | ----------- | -------------------------------------------- |
| `value`      | `TransformValue<number>`  | Required    | Nonnegative value allocated to each interval |
| `orderBy`    | `TransformValue`          | None        | Explicit angular ordering value              |
| `order`      | `ascending \| descending` | `ascending` | Direction applied to `orderBy`               |
| `startAngle` | `number`                  | `0`         | Overall start angle in radians               |
| `endAngle`   | `number`                  | `2π`        | Overall end angle in radians                 |
| `gapAngle`   | `number`                  | `0`         | Direct empty angle between visible slices    |

Output rows remain in source order. `index` records angular order, `value` is
the resolved finite value, `fraction` is its share of the positive total, and
`startAngle`, `endAngle`, and `angle` are the visible interval and midpoint.
Each row also carries direct `source` and `sourceIndexes` lineage. Missing or
non-finite values are omitted, zero is retained, and negative values fail.

`gapAngle` is radius-independent. A complete revolution includes a seam gap;
a partial range uses only internal gaps and preserves both authored endpoints.
The output `padAngle` is intentionally `0` compatibility metadata so the
default `radialArc` accessors do not pad an already-gapped interval a second
time. Use the mark's `padAngle` and `padRadius` only when D3's radius-dependent
arc padding is wanted instead.

The derived fields `value`, `index`, `fraction`, `startAngle`, `endAngle`,
`angle`, `padAngle`, `source`, and `sourceIndexes` overwrite source fields with
the same names. Stable identity is not synthesized; preserve a semantic source
field and pass it to the consuming mark's `key` channel.
