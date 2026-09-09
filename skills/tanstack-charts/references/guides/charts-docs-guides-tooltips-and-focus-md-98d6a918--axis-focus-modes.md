# Tooltips And Focus — Axis focus modes

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Axis focus modes

| Mode        | Result                                                                    |
| ----------- | ------------------------------------------------------------------------- |
| omitted     | One nearest painted geometry or point in two dimensions                   |
| `nearest-x` | The containing mark, otherwise one point prioritizing x distance          |
| `nearest-y` | The containing mark, otherwise one point prioritizing y distance          |
| `group-x`   | The containing mark first, plus its semantic x group; otherwise nearest x |
| `group-y`   | The containing mark first, plus its semantic y group; otherwise nearest y |

Grouped focus is appropriate for comparing several series at the same date or
category. A sparse snapped cursor can opt into
`maxFocusDistance: Number.POSITIVE_INFINITY`; keep the finite default when
empty space should mean no focus.
