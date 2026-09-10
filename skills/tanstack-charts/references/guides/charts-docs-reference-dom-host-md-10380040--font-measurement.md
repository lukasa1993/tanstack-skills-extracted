# Dom Host — Font measurement

[Guide and prerequisites](./charts-docs-reference-dom-host-md-10380040.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Font measurement

The default DOM measurer inherits the container's computed font family, style,
stretch, weight, direction, and letter spacing. Measurements are cached. The
host clears that cache and relayouts when:

- the inherited font signature changes during `update`
- the document font set emits `loadingdone`

Pass `measureText` to own the geometry or to make browser and nonbrowser output
use the same metrics. See
[Scales, guides, and color](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md#source-charts-docs-reference-scales-guides-and-color-md)
for the function contract.
