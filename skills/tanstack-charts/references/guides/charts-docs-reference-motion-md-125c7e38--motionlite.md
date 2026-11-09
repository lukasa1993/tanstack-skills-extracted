# Motion — `motionLite`

[Guide and prerequisites](./charts-docs-reference-motion-md-125c7e38.md) · Release-matched documentation · `@tanstack/charts@1.5.0`.

## `motionLite`

```ts
import { motionLite } from '@tanstack/charts/motion/lite'

const renderer = motionLite({ duration: 240, easing: 'ease-out' })
```

Pass this renderer to the DOM host or a browser framework adapter. Import it
directly from `/motion/lite`; it is not re-exported from the root or `/motion`.
Existing `motion()` imports and behavior are unchanged.

### `ChartMotionLiteOptions`

The optional argument to `motionLite()` has the following fields.

`motionLite()` fades the entire SVG, including guides, on the first client
paint. Updates reuse keyed SVG nodes and tween compatible numeric attributes
and path command skeletons. New and removed keyed elements fade; incompatible
path skeletons snap to the new path. Adopted server-rendered SVG does not replay
the entrance. Static prerendering always paints final geometry.

| Option                 | Default      | Meaning                                                        |
| ---------------------- | ------------ | -------------------------------------------------------------- |
| `initial`              | `true`       | Fade the first client paint                                    |
| `duration`             | `240`        | Finite, non-negative milliseconds; `0` disables animation      |
| `easing`               | `'ease-out'` | `linear`, `ease`, `ease-in`, `ease-out`, or `ease-in-out`      |
| `respectReducedMotion` | `true`       | Snap renders when the user's reduced-motion preference matches |
| `resize`               | `false`      | Tween size changes instead of committing immediately           |

The entrance uses browser CSS easing through Web Animations. Updates use the
SVG reconciler's named easing curves. If Web Animations is unavailable, the
first paint is immediate and supported SVG updates still animate. Updates
during entrance keep the fade running; a reduced-motion render or an immediate
resize cancels it. Destroying the host cancels both entrance and update motion.

This renderer owns its duration and easing, ignoring `svgAnimation` and
definition-level motion timing. It does not include springs, velocity
continuity, staggering, rolling paths, specialized bar/arc entrances, or
inherited tooltip motion. Default focus and inline states use the existing SVG
renderer. Hit testing and tooltips use destination geometry during updates,
not interpolated presentation points. Use `motion()` when interactions must
follow moving marks, or for definition-local timing and tooltip springs.
