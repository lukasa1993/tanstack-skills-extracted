# Scales Guides And Color — Automatic guide layout

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Automatic guide layout

When a margin side is omitted, the scene compiler measures:

- formatted tick glyph bounds
- tick rotation
- first and last label overhang
- axis title bounds and offset
- Cartesian `text`-mark anchors, pixel offsets, and rotation
- color legend height

The DOM host measures the inherited container font and relayouts after web
fonts load. Static compilation uses deterministic estimates unless
`measureText` is supplied. Explicit margin sides remain locked, and
`clip: true` prevents clipped mark labels from expanding the plot.

```ts
interface ChartTextMeasurer {
  (
    text: string,
    options: {
      fontSize: number
      fontWeight?: number
      fontFamily: string
      fontStyle: string
      fontStretch: string
      letterSpacing: number
      direction: 'ltr' | 'rtl' | 'inherit'
      locale?: string
      fontScale: number
      anchor: 'start' | 'middle' | 'end'
      baseline: 'auto' | 'middle' | 'hanging'
    },
  ): {
    x: number
    y: number
    width: number
    height: number
  }
}
```

The returned `x` and `y` locate the painted glyph box relative to the requested
anchor and baseline. Pass the measurer through a host, adapter, runtime render,
or `createChartScene` layout options. The callback is synchronous; a host owns
font loading or asynchronous native measurement and recompiles the scene when
those metrics become ready. `fontScale` applies to the painted font size and
letter spacing, so custom measurers must include it in their result.
