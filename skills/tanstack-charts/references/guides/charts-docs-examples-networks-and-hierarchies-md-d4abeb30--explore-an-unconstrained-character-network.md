# Networks And Hierarchies — Explore an unconstrained character network

[Guide and prerequisites](./charts-docs-examples-networks-and-hierarchies-md-d4abeb30.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Explore an unconstrained character network

A force-directed layout can reveal clusters and bridges when positions are not
already meaningful. It also introduces motion, stochastic initialization, and
collision policy that can make comparison unstable.

<!-- ::chart-example id=40-force-directed-network height=480 -->

Use the exact optional transform for a settled static network:

```ts
import { defineChart, dot, link, text } from '@tanstack/charts'
import { forceLayout } from '@tanstack/charts/network/force'
import { scaleLinear } from 'd3-scale'

const graph = forceLayout(nodes, links, {
  nodeKey: 'id',
  source: 'source',
  target: 'target',
  iterations: 300,
  forces: [
    { type: 'link', distance: 42 },
    { type: 'manyBody', strength: -120 },
    { type: 'center' },
    { type: 'collide', radius: 9 },
  ],
})

const chart = defineChart({
  marks: [
    link(graph.links, {
      x1: 'x1',
      y1: 'y1',
      x2: 'x2',
      y2: 'y2',
      key: ({ source, target }) => `${source}->${target}`,
    }),
    dot(graph.nodes, { x: 'x', y: 'y', color: 'group', key: 'id' }),
    text(graph.nodes, { x: 'x', y: 'y', text: 'id', key: 'id' }),
  ],
  scales: {
    x: { scale: scaleLinear().domain(graph.xDomain) },
    y: { scale: scaleLinear().domain(graph.yDomain) },
  },
})
```

`forceLayout` clones both inputs, applies the explicit forces in authored
order, runs a fixed number of synchronous ticks, resolves link endpoints, and
returns padded domains. It is chart-size independent: resizing remaps the
settled coordinates and does not require another simulation. Keep node and
link order stable when comparisons must repeat exactly, and memoize the
transform when unchanged data would otherwise rebuild it.

`forceLayout` is not a live simulation controller. If drag-to-reposition is
part of the product, run the live controller outside the chart, store its
positions in application state, and provide a keyboard-accessible alternative
or detail control. The chart scene remains a projection of that controlled
state.
