# Scales And D3 — Pixel-to-value inversion

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Pixel-to-value inversion

`brushX`, `continuousCursor`, `zoomX`, and free `cursorHost` bindings own
final-scale inversion for their normal gestures. A custom crop or gesture can
read the same optional inverse from the resolved scene scale:

```ts
const scene = host.getScene()
const invertX = scene.scales.x.invert
if (!invertX) throw new Error('This interaction requires an invertible x scale')

const selectedDate = invertX(pointerX)
```

For a normal continuous y axis, the resolved scale already owns its reversed
pixel range:

```ts
const invertY = scene.scales.y.invert
if (!invertY) throw new Error('This interaction requires an invertible y scale')

const selectedValue = invertY(pointerY)
```

Apply the application’s precision policy after inversion. For example, round a day-based selection with a D3 time interval or round a currency threshold to the supported increment. Pixels do not imply semantic precision.

A free cursor needs no `valueAt` callback for ordinary numeric or temporal
axes. Provide one only to replace inversion with explicit snapping, rounding,
or another semantic mapping. Missing and non-invertible scales require that
override.

When the application owns a custom gesture, disable the native nearest-point
focus strategy if the two interactions would conflict. See
[Interactions and Selections](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md#source-charts-docs-guides-interactions-and-selections-md).
