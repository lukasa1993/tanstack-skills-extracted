# Focus And Interaction — Disabling chart-owned focus

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Disabling chart-owned focus

Set `focus: false` to disable chart-owned pointer and keyboard point focus. The
scene keeps its semantic points but omits the generated default focus layer,
and the DOM host forces the chart surface out of the tab order. Explicit
focus-only marks remain available to custom renderers and programmatic paint.

```ts
import { focusDisabled } from '@tanstack/charts/focus/disabled'
```

`focusDisabled` resolves, groups, and navigates to no points. Use it when an
application owns gestures, selection paint, accessibility, and task semantics
outside the native resolver but still needs the rendered focus layer. Set
definition `keyboard: false` and omit its `tooltip` as appropriate for that
application-owned interaction.
