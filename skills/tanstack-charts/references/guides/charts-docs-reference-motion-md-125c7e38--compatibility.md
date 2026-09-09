# Motion — Compatibility

[Guide and prerequisites](./charts-docs-reference-motion-md-125c7e38.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Compatibility

- Compatible numeric attributes and path command skeletons interpolate.
- Incompatible element types or path topology use keyed enter/exit opacity.
- Stable keys preserve DOM identity, velocity, and presentation points.
- Crosshair rules, bands, labels, and markers follow the same keyed interruption
  behavior as focused marks.
- SVG interaction follows animated presentation geometry for keyed built-in and
  custom marks.
- Static SVG and Canvas ignore definition motion and paint final geometry.
- The optional renderer is browser SVG only; it is not a Web Animations, View
  Transitions, Canvas, or native adapter.
