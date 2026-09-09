# Interactions And Selections — Invert resolved scales

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Invert resolved scales

First-party behaviors use the final resolved scale. A custom gesture can read
the same optional inverse from the scene:

```ts
const invertX = scene.scales.x.invert
if (!invertX) throw new Error('This interaction requires an invertible x scale')

const date = invertX(pointerX)
```

The resolved y scale already owns its reversed pixel range:

```ts
const invertY = scene.scales.y.invert
if (!invertY) throw new Error('This interaction requires an invertible y scale')

const value = invertY(pointerY)
```

Apply UTC month snapping, numeric rounding, minimum ranges, and domain clamps
after inversion. Those policies are application semantics, not scale math.
This date example uses a D3 time scale; the lightweight linear scale supports
the same resolved mapping and inversion flow for numeric gestures.
Free cursor bindings already consume the resolved inverse. Their `valueAt`
callback is reserved for snapping or another semantic override.

The [Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md) page is the sole source for
D3 ownership and official interaction-module links.
