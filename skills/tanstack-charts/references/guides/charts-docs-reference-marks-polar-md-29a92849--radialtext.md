# Polar — `radialText`

[Guide and prerequisites](./charts-docs-reference-marks-polar-md-29a92849.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `radialText`

```ts
function radialText<TDatum>(
  source: Iterable<TDatum>,
  options?: RadialTextOptions<TDatum>,
): PolarMark<TDatum>
```

`radialText` maps `angle` and `radius` channels through the container's copied
polar scales, then positions labels with D3's radial point projection. It
accepts `angleScale`, `radiusScale`, `text`, `key`, `z`, `color`, fill, font
size and weight, anchor, baseline, rotation, and pixel `dx`/`dy`.
`radiusOffset` is a signed constant or per-datum
visual channel applied in pixels after the semantic radius is mapped. It does
not contribute to the radius domain. Set `anchor: "outside"` to resolve
`start`, `middle`, or `end` from the final mapped angle. Exact and near-exact
top and bottom angles use `middle`. A nonfinite resolved offset omits that
label and its interaction point.

Use it for arc labels, donut-center values, and gauge readouts without leaving
the polar coordinate system. Its interaction point follows the final radial
offset plus `dx`/`dy` while retaining the original semantic radius value. Its
key defaults to a unique top-level or nested `data.id`, then row index.
