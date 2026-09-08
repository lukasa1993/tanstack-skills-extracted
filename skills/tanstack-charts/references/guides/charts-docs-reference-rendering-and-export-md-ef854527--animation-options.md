# Rendering And Export — Animation options

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Animation options

```ts
interface ChartAnimationOptions {
  duration?: number
  easing?:
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | ((progress: number) => number)
  respectReducedMotion?: boolean
  resize?: boolean
}
```

| Option                 | Default      | Meaning                                                |
| ---------------------- | ------------ | ------------------------------------------------------ |
| `duration`             | `240`        | Animation length in milliseconds, clamped to zero      |
| `easing`               | `'ease-out'` | Named built-in easing or a progress-mapping function   |
| `respectReducedMotion` | `true`       | Lets a host suppress animation for reduced-motion mode |
| `resize`               | `false`      | Animates responsive and explicit host size changes     |

On a definition, `svgAnimation: true` uses `240` milliseconds, `ease-out`, and respects
`prefers-reduced-motion: reduce`. A numeric duration is clamped to at least
zero. A custom easing receives raw progress from `0` to `1`.

`respectReducedMotion` and `resize` are definition policies enforced by the
host. Direct
`reconcileChartSvg(container, markup, animation)` calls run the supplied
animation without consulting media queries or render reasons.

Host animation begins only after the initial render. Updates without a scene
render do not start an animation; the current animation options apply to the
next reconciliation. Responsive and explicit size changes commit immediately
unless `resize: true`.

Stable mark IDs and resolved datum identities are essential for meaningful
transitions.
