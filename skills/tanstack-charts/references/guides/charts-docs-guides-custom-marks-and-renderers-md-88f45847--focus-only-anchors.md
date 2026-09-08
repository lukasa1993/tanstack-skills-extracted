# Custom Marks And Renderers — Focus-only anchors

[Guide and prerequisites](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Focus-only anchors

A decorative mark can still support `whenFocused` without becoming a pointer
target. Return `focusAnchors` beside its nodes:

```ts
return {
  nodes: [node],
  focusAnchors: [
    {
      key: node.key,
      markId: id,
      group: null,
      datum,
      datumIndex: index,
      yValue: datum.value,
    },
  ],
}
```

The anchor key must identify the node or keyed group it reveals. Include only
the semantic axes the geometry owns: a horizontal rule supplies `yValue`; a
vertical rule supplies `xValue`. `focusAnchors` are read only when the mark is
wrapped in `whenFocused` and never enter pointer hit testing, tooltip data, or
keyboard navigation.
