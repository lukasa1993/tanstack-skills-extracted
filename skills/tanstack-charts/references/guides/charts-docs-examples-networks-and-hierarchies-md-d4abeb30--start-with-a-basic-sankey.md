# Networks And Hierarchies — Start with a basic Sankey

[Guide and prerequisites](./charts-docs-examples-networks-and-hierarchies-md-d4abeb30.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Start with a basic Sankey

The smallest useful Sankey shows a single input splitting into two paths and
recombining into one output. Link width is the only quantitative encoding in
this example; nodes and links use the chart theme, and every node gets one
short name.

Use this version as the starting point when the structure matters more than
styling. Its four explicit links preserve a total flow of 10 through a 60/40
split.

The definition supplies semantic rows and composes ordinary marks after the
responsive layout resolves:

```ts group=basic-sankey env=charts file=/src/chart.ts entry
import { defineChart, link, rect, text } from '@tanstack/charts'
import { sankeyDiagram } from '@tanstack/charts/network/sankey'
import { links, nodes } from './data'

export default defineChart({
  marks: [
    sankeyDiagram({
      nodes,
      links,
      nodeKey: 'id',
      source: 'source',
      target: 'target',
      value: 'value',
      align: 'left',
      nodePadding: 28,
      inset: { left: 16, right: 16, top: 24, bottom: 12 },
      marks: ({ nodes: layoutNodes, links: layoutLinks }) =>
        [
          link(layoutLinks, {
            x1: 'x1',
            y1: 'y1',
            x2: 'x2',
            y2: 'y2',
            key: 'key',
            strokeWidth: (flow) => flow.width,
          }),
          rect(layoutNodes, {
            x1: 'x0',
            x2: 'x1',
            y1: 'y0',
            y2: 'y1',
            key: 'key',
            inset: 0,
          }),
          text(layoutNodes, {
            x: 'x',
            y: (node) => node.y0 - 8,
            text: (node) => node.data.label,
            key: 'key',
            fill: 'currentColor',
            fontSize: 12,
            fontWeight: 650,
          }),
        ] as const,
    }),
  ],
  scales: {
    x: null,
    y: null,
  },
  guides: false,
  margin: 0,
})
```

```ts group=basic-sankey file=/src/data.ts collapsed
export const nodes = [
  { id: 'input', label: 'Input' },
  { id: 'path-a', label: 'Path A' },
  { id: 'path-b', label: 'Path B' },
  { id: 'output', label: 'Output' },
]

export const links = [
  { source: 'input', target: 'path-a', value: 6 },
  { source: 'input', target: 'path-b', value: 4 },
  { source: 'path-a', target: 'output', value: 6 },
  { source: 'path-b', target: 'output', value: 4 },
]
```

[Open the interactive basic Sankey catalog example](https://tanstack.com/charts/catalog/111-basic-sankey/).
