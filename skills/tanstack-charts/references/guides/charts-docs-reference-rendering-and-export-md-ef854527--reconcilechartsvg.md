# Rendering And Export — `reconcileChartSvg`

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `reconcileChartSvg`

```ts
import { reconcileChartSvg } from '@tanstack/charts/reconcile'

const cancel = reconcileChartSvg(container, nextMarkup, {
  duration: 240,
  easing: 'ease-out',
})

cancel()
```

```ts
function reconcileChartSvg(
  container: HTMLElement,
  markup: string,
  animation?: ChartAnimationOptions,
): () => void
```

The reconciler adopts a compatible existing root, matches children by
`data-ts-key`, moves retained nodes into their new order, inserts entries, and
removes exits. When a node has no explicit key, same-tag sibling order is a
fallback identity.

Without animation, changed attributes and structure commit synchronously.
With animation:

- numeric attributes with compatible string structure interpolate
- entries fade from zero opacity
- exits fade to zero and are then removed
- noninterpolable values commit immediately
- a returned cancellation function stops the current frame loop

The DOM host calls reconciliation and cancellation for you.

Custom SVG renderers that already own a keyed subtree can reconcile only that
subtree without reparsing or walking the surrounding chart:

```ts
import { reconcileChartSvgFragment } from '@tanstack/charts/reconcile'

const cancel = reconcileChartSvgFragment(currentGroup, nextGroupMarkup, {
  duration: 180,
})
```

```ts
function reconcileChartSvgFragment(
  currentRoot: SVGElement,
  markup: string,
  animation?: ChartAnimationOptions,
): () => void
```

The fragment root must keep the same namespace and element name to preserve
its identity. Otherwise the reconciler replaces it. Child keying, tweening,
and cancellation match `reconcileChartSvg`.
