# Transforms — Static force layouts

[Guide and prerequisites](./charts-docs-reference-transforms-md-6acdd0ab.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Static force layouts

`forceLayout` runs a stopped D3 force simulation synchronously and returns
ordinary rows for native marks. Import it from its exact optional entry:

```ts
import { forceLayout } from '@tanstack/charts/network/force'

const graph = forceLayout(nodes, links, {
  nodeKey: 'id',
  source: 'source',
  target: 'target',
  iterations: 300,
  domainPadding: 0.2,
  forces: [
    { type: 'link', distance: 42 },
    { type: 'manyBody', strength: -120 },
    { type: 'center', x: 0, y: 0 },
    { type: 'collide', radius: 9, strength: 0.9 },
    { type: 'x', x: 0, strength: 0.03 },
    { type: 'y', y: 0, strength: 0.03 },
  ],
})
```

The built-in force descriptors are explicit and applied in authored order.
`link` accepts link-row distance and strength channels. `manyBody.strength`,
`collide.radius`, and the `x` and `y` targets and strengths accept node-row
channels. `center` coordinates and `collide.strength` are fixed values. Each
built-in force type may appear at most once.

Named custom factories accept any native D3-compatible force:

```ts
import { forceRadial } from 'd3-force'

const graph = forceLayout(nodes, links, {
  nodeKey: 'id',
  source: 'source',
  target: 'target',
  forces: [
    { type: 'manyBody', strength: -80 },
    {
      type: 'custom',
      name: 'radial',
      create: () => forceRadial(120, 0, 0).strength(0.08),
    },
  ],
})
```

`create` receives one `ForceFactoryContext` with the private mutable node and
link clones, immutable resolved endpoint-key arrays, and a `nodeKey` accessor
compatible with `d3.forceLink().id(...)`. The factory must return a D3 `Force`.
The working-clone types reserve D3's simulation fields; valid numeric node
seeds are retained, while conflicting source fields cannot leak into D3 state.
Names are nonempty and unique across custom and built-in forces. Factories may
configure or close over the private records, but must not add, remove, or
reorder them. The transform validates collection identity and final finite
coordinates.

The transform clones its inputs before D3 mutates simulation state. Output
nodes retain non-reserved source fields and add `x`, `y`, `vx`, `vy`, `source`,
and `sourceIndexes`. Output links retain their raw endpoint keys and add
resolved node references, source and target indexes, `x1`, `y1`, `x2`, `y2`,
`sourceRows`, and `sourceIndexes`. The result also contains `xDomain` and
`yDomain` for configured positional scales.

Node keys must be unique, and every link endpoint must match one. Stable input
and deterministic force factories produce repeatable static settlement. The
simulation remains stopped and ticks synchronously; a custom force does not
gain a timer or live-state ownership. The transform is eager, chart-size
independent, and uncached; memoize it with other derived data when a framework
component rebuilds unchanged input.

This API does not run a live simulation or own drag state. Products that need
continuous physics or node dragging should keep that controller and its
positions in application state, then render the current rows through normal
marks.
