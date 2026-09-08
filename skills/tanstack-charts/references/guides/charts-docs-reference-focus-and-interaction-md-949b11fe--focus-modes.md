# Focus And Interaction — Focus modes

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Focus modes

Use a preset for built-in focus behavior:

```ts
import { tooltip } from '@tanstack/charts/tooltip'

const groupedDownloads = defineChart(definition, {
  focus: 'group-x',
  tooltip,
})
```

| Preset      | Pointer resolution                                                     | Group returned to callbacks and tooltip                               | Keyboard navigation                     |
| ----------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------- |
| `nearest`   | Nearest painted geometry or point in two dimensions                    | Primary point only                                                    | Every point                             |
| `nearest-x` | Containing painted mark; otherwise nearest x, then nearest y           | Primary point only                                                    | Every point                             |
| `nearest-y` | Containing painted mark; otherwise nearest y, then nearest x           | Primary point only                                                    | Every point                             |
| `group-x`   | Containing painted mark; otherwise nearest x, then nearest y at that x | One point per group sharing the semantic x value; primary point first | One representative per semantic x value |
| `group-y`   | Containing painted mark; otherwise nearest y, then nearest x at that y | One point per group sharing the semantic y value; primary point first | One representative per semantic y value |

Grouping compares semantic values, including dates by timestamp. Duplicate
points with the same `group` value are reduced to one member in grouped focus.

The equivalent `focusGroupX`, `focusGroupY`, `focusNearestX`, and `focusNearestY`
strategy objects remain available from `@tanstack/charts/focus` for composition
or direct strategy use. The exact exported objects receive the same host-level
containment behavior as their presets. A strategy that wraps or copies one of
them is custom and owns its complete pointer resolution.

`focusGroupAngle` is available from `@tanstack/charts/polar`. It resolves the
nearest radial ray, groups points with the same semantic angle value, and
orders keyboard tasks by angle. Use it for grouped radar, polar-line, and
radial-dot tooltips. Painted `radialArc` geometry already participates in
default nearest focus.
