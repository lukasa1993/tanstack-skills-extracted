# Tooltips And Focus — Default nearest point

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Default nearest point

Import the built-in tooltip extension and add it to the definition:

```ts
import { tooltip } from '@tanstack/charts/tooltip'

const interactiveDefinition = defineChart(definition, { tooltip })

const host = mountChart(element, {
  definition: interactiveDefinition,
  height: 320,
  ariaLabel: 'Weekly downloads',
})
```

The default focus strategy resolves one nearest point in two dimensions.
`maxFocusDistance` defaults to 48 scene pixels. Empty space farther from any
point clears transient focus.
