# Dom Host — Overview

[Guide and prerequisites](./charts-docs-reference-dom-host-md-10380040.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

`mountChart` is the framework-neutral default SVG browser host. It owns
responsive measurement, scene updates, keyed SVG reconciliation, animation,
pointer and keyboard interaction, built-in DOM tooltips, font relayout, and cleanup.

```ts
import { defineChart } from '@tanstack/charts'
import { mountChart } from '@tanstack/charts/dom'
import { tooltip } from '@tanstack/charts/tooltip'
```
