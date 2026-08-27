# Composite and hierarchy marks

Composite, network, hierarchy, rule, frame, and waffle mark reference.

<a id="source-charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md"></a>

## Rules Links Arrows Vectors And Ticks

Source: `charts:docs/reference/marks/rules-links-arrows-vectors-and-ticks.md`.

These marks cover reference lines, independent segments, directed
relationships, fixed-pixel vectors, and compact glyphs. They compose with any
other mark and use the chart's shared positional and color scales.

```ts
import {
  arrow,
  link,
  ruleX,
  ruleY,
  tickX,
  tickY,
  vector,
} from '@tanstack/charts'
```

### `ruleX` and `ruleY`

`ruleX` draws a vertical rule through the complete inner chart height.
`ruleY` draws a horizontal rule through the complete inner chart width.

```ts
ruleX(events, { x: 'date', stroke: '#dc2626' })
ruleY([0], { strokeOpacity: 0.7, strokeDasharray: '4 2' })
```

```ts
function ruleX<TDatum>(
  source: Iterable<TDatum>,
  options?: RuleXOptions<TDatum>,
): ChartMark<never, InferredX, never>

function ruleY<TDatum>(
  source: Iterable<TDatum>,
  options?: RuleYOptions<TDatum>,
): ChartMark<never, never, InferredY>
```

Options are orientation-specific:

| Option            | Type                            | Default                               | Meaning                             |
| ----------------- | ------------------------------- | ------------------------------------- | ----------------------------------- |
| `id`              | `string`                        | Layer-derived                         | Stable mark ID                      |
| `x`               | `Channel<TDatum, ChartValue?>`  | Datum itself when it is a chart value | `ruleX` position                    |
| `y`               | `Channel<TDatum, ChartValue?>`  | Datum itself when it is a chart value | `ruleY` position                    |
| `color`           | `Channel<TDatum, ChartKey?>`    | No value                              | Value sent to the chart color scale |
| `stroke`          | `VisualChannel<TDatum, string>` | Resolved color or theme foreground    | Final rule paint override           |
| `strokeOpacity`   | `number`                        | `0.5`                                 | Stroke opacity                      |
| `strokeWidth`     | `number`                        | SVG default                           | Stroke width                        |
| `strokeDasharray` | `string`                        | None                                  | SVG dash array                      |

Rules emit no interaction points and therefore do not participate in native
focus or tooltips. Their datum type is intentionally absent from the chart's
interaction union.

### `link`

`link` draws one independent segment per row. It is appropriate for networks,
slopegraphs, error intervals, and annotations. Use `lineY` when consecutive
rows form one path.

```ts
link(edges, {
  x1: 'sourceX',
  y1: 'sourceY',
  x2: 'targetX',
  y2: 'targetY',
  z: 'kind',
  strokeWidth: (edge) => edge.weight,
  lineCap: 'butt',
})
```

```ts
function link<TDatum>(
  source: Iterable<TDatum>,
  options: LinkOptions<TDatum>,
): ChartMark<TDatum, InferredEndpointX, InferredEndpointY>
```

| Option            | Type                            | Default                | Meaning                             |
| ----------------- | ------------------------------- | ---------------------- | ----------------------------------- |
| `id`              | `string`                        | Layer-derived          | Stable mark ID                      |
| `x1`, `y1`        | required channels               | —                      | First endpoint                      |
| `x2`, `y2`        | required channels               | —                      | Second endpoint                     |
| `z`               | `Channel<TDatum, ChartKey?>`    | No group               | Interaction group                   |
| `color`           | `Channel<TDatum, ChartKey?>`    | `z`                    | Value sent to the chart color scale |
| `key`             | `Channel<TDatum, ChartKey>`     | Top/nested `id`, index | Stable identity                     |
| `stroke`          | `VisualChannel<TDatum, string>` | Resolved color         | Final segment paint override        |
| `strokeOpacity`   | `VisualChannel<TDatum, number>` | SVG default            | Stroke opacity                      |
| `strokeWidth`     | `VisualChannel<TDatum, number>` | `1.5`                  | Stroke width                        |
| `strokeDasharray` | `string`                        | None                   | SVG dash array                      |
| `lineCap`         | `"butt" \| "round" \| "square"` | `"round"`              | Stroke cap                          |
| `curve`           | `ChartCurve`                    | Straight rule          | Optional path generator             |

With no curve, the scene contains a rule. With a curve, it contains a
two-point polyline with the generated path. The interaction coordinate is the
pixel midpoint; semantic `xValue` and `yValue` are the second endpoint.

The optional `d3Curve` bridge and granular algorithm boundary are documented in
[Line and area](./marks-cartesian-statistical.md#source-charts-docs-reference-marks-line-and-area-md) and
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md).

### `arrow`

`arrow` draws one straight directed segment with a fixed-pixel head:

```ts
arrow(edges, {
  x1: 'sourceX',
  y1: 'sourceY',
  x2: 'targetX',
  y2: 'targetY',
  headLength: 10,
  headAngle: 28,
})
```

```ts
function arrow<TDatum>(
  source: Iterable<TDatum>,
  options: ArrowOptions<TDatum>,
): ChartMark<TDatum, InferredEndpointX, InferredEndpointY>
```

| Option          | Type                            | Default                | Meaning                                         |
| --------------- | ------------------------------- | ---------------------- | ----------------------------------------------- |
| `id`            | `string`                        | Layer-derived          | Stable mark ID                                  |
| `x1`, `y1`      | required channels               | —                      | Tail endpoint                                   |
| `x2`, `y2`      | required channels               | —                      | Head endpoint                                   |
| `z`             | `Channel<TDatum, ChartKey?>`    | No group               | Interaction group                               |
| `color`         | `Channel<TDatum, ChartKey?>`    | `z`                    | Value sent to the chart color scale             |
| `key`           | `Channel<TDatum, ChartKey>`     | Top/nested `id`, index | Stable identity                                 |
| `stroke`        | `VisualChannel<TDatum, string>` | Resolved color         | Final arrow paint override                      |
| `strokeOpacity` | `number`                        | SVG default            | Stroke opacity                                  |
| `strokeWidth`   | `number`                        | `1.5`                  | Stroke width                                    |
| `headLength`    | `number`                        | `8`                    | Head length in pixels, clamped to at least zero |
| `headAngle`     | `number`                        | `30`                   | Half-angle in degrees                           |

The arrowhead stays the same pixel size as scales and container dimensions
change. The interaction coordinate and semantic x/y values are the head
endpoint.

### `vector`

`vector` places a fixed-pixel directed vector at a scaled anchor:

```ts
vector(wind, {
  x: 'longitude',
  y: 'latitude',
  length: 'speed',
  rotate: 'bearing',
  anchor: 'middle',
  z: 'region',
})
```

```ts
function vector<TDatum>(
  source: Iterable<TDatum>,
  options: VectorOptions<TDatum>,
): ChartMark<TDatum, InferredX, InferredY>
```

| Option          | Type                                 | Default                | Meaning                                         |
| --------------- | ------------------------------------ | ---------------------- | ----------------------------------------------- |
| `id`            | `string`                             | Layer-derived          | Stable mark ID                                  |
| `x`, `y`        | required channels                    | —                      | Scaled anchor                                   |
| `length`        | `number \| Channel<TDatum, number?>` | `12`                   | Vector length in pixels                         |
| `rotate`        | `number \| Channel<TDatum, number?>` | `0`                    | Clockwise degrees; zero points up               |
| `anchor`        | `'start' \| 'middle' \| 'end'`       | `'middle'`             | Which vector position stays at x/y              |
| `z`             | `Channel<TDatum, ChartKey?>`         | No group               | Interaction group                               |
| `color`         | `Channel<TDatum, ChartKey?>`         | `z`                    | Value sent to the chart color scale             |
| `key`           | `Channel<TDatum, ChartKey>`          | Top/nested `id`, index | Stable identity                                 |
| `stroke`        | `VisualChannel<TDatum, string>`      | Resolved color         | Final stroke override                           |
| `strokeOpacity` | `number`                             | SVG default            | Stroke opacity                                  |
| `strokeWidth`   | `number`                             | `1.5`                  | Stroke width                                    |
| `headLength`    | `number`                             | `5`                    | Head length in pixels, clamped to at least zero |
| `headAngle`     | `number`                             | `30`                   | Head half-angle in degrees                      |

Length and rotation must be finite. Negative length reverses the body direction
while preserving the rotation convention. The interaction point remains the
scaled x/y anchor for every anchor mode.

### `tickX` and `tickY`

Ticks draw a short rule centered at a scaled point:

- `tickX` draws a vertical rule, so its length spans the y direction.
- `tickY` draws a horizontal rule, so its length spans the x direction.

```ts
tickX(rows, { x: 'category', y: 'value', z: 'series' })
tickY(rows, { x: 'value', y: 'category', length: 16 })
tickY(summaries, { x: 'category', y: 'median', span: 0.36 })
```

```ts
function tickX<TDatum>(
  source: Iterable<TDatum>,
  options: TickXOptions<TDatum>,
): ChartMark<TDatum, InferredX, InferredY>

function tickY<TDatum>(
  source: Iterable<TDatum>,
  options: TickYOptions<TDatum>,
): ChartMark<TDatum, InferredX, InferredY>
```

Both share:

| Option          | Type                            | Default                                      | Meaning                             |
| --------------- | ------------------------------- | -------------------------------------------- | ----------------------------------- |
| `id`            | `string`                        | Layer-derived                                | Stable mark ID                      |
| `x`, `y`        | required channels               | —                                            | Tick center                         |
| `z`             | `Channel<TDatum, ChartKey?>`    | No group                                     | Interaction group                   |
| `color`         | `Channel<TDatum, ChartKey?>`    | `z`                                          | Value sent to the chart color scale |
| `key`           | `Channel<TDatum, ChartKey>`     | Top/nested `id`, then index                  | Stable identity                     |
| `stroke`        | `VisualChannel<TDatum, string>` | Resolved color                               | Final tick paint override           |
| `strokeOpacity` | `number`                        | SVG default                                  | Stroke opacity                      |
| `strokeWidth`   | `number`                        | `1.5`                                        | Stroke width                        |
| `length`        | `number`                        | Perpendicular scale bandwidth, otherwise `6` | Total length before inset           |
| `span`          | `number`                        | None                                         | Total length in category-step units |
| `inset`         | `number`                        | `0`                                          | Pixels removed from both ends       |

Available length is clamped to at least zero after subtracting twice the inset.
`length` and `span` are mutually exclusive. `span` requires a point or band
scale on the perpendicular axis and uses the complete configured domain,
including empty category slots, to derive its step.
Each valid row emits one interaction point at the tick center.

### Invalid rows and identity

Links, arrows, vectors, and ticks skip rows with any invalid required
positional value. Links and arrows require all four endpoints. Stable `key`
channels are especially important for independent segments because keyed
reconciliation otherwise falls back to row index.

<a id="source-charts-docs-reference-marks-sankey-md"></a>

## Sankey

Source: `charts:docs/reference/marks/sankey.md`.

`sankeyDiagram` lays out a directed weighted graph in final plot pixels, then
composes ordinary marks over its nodes and links. Source rows stay semantic;
the application does not clone D3 records, resolve mutated endpoints, or
materialize positioned DTOs.

```ts
import { defineChart, link, rect, text } from '@tanstack/charts'
import { sankeyDiagram } from '@tanstack/charts/network/sankey'

const chart = defineChart({
  marks: [
    sankeyDiagram({
      nodes,
      links,
      nodeKey: 'id',
      source: 'source',
      target: 'target',
      value: 'value',
      align: 'left',
      nodeWidth: ({ width }) => Math.max(12, width * 0.025),
      nodePadding: ({ height }) => Math.max(12, height * 0.06),
      inset: 24,
      marks: ({ nodes: layoutNodes, links: layoutLinks }) =>
        [
          link(layoutLinks, {
            x1: 'x1',
            y1: 'y1',
            x2: 'x2',
            y2: 'y2',
            key: 'key',
            strokeWidth: (flow) => Math.max(1, flow.width),
            lineCap: 'butt',
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
            y: 'y',
            text: (node) => node.data.label,
            key: 'key',
          }),
        ] as const,
    }),
  ],
  scales: {
    x: null,
    y: null,
  },
  guides: false,
})
```

The exact `@tanstack/charts/network/sankey` subpath keeps `d3-sankey` and the
resolved flow adapter out of root, universal, force-layout, and ordinary-mark
bundles. The Charts package owns `d3-sankey`; the application needs no direct
dependency unless its own source imports that module.

### Graph input

`nodes` and `links` accept iterables. `nodeKey` identifies each node; `source`
and `target` read those keys from each link; `value` reads its nonnegative
weight.

```ts
sankeyDiagram({
  nodes,
  links,
  nodeKey: 'id',
  source: 'from',
  target: 'to',
  value: 'amount',
  marks,
})
```

Keys must be strings or finite numbers. Graph validation rejects duplicate
node keys, missing endpoints, duplicate authored link keys, and negative or
nonfinite values. A nonempty graph must contain at least one positive link;
zero-valued links may coexist with positive flow. The layout also rejects
cycles.

Use `linkKey` when links can be reordered or when several links share the same
endpoints. Without it, a unique raw `id` field is used when every link has one;
otherwise keys use source, target, and parallel-link occurrence.

Input rows are never mutated. Accessors run when the mark is created; repeated
responsive layout passes use fresh private graph records.

### Options

| Option        | Type                                                | Default       | Meaning                                                      |
| ------------- | --------------------------------------------------- | ------------- | ------------------------------------------------------------ |
| `nodes`       | `Iterable<TNode>`                                   | Required      | Semantic node rows                                           |
| `links`       | `Iterable<TLink>`                                   | Required      | Semantic weighted edges                                      |
| `nodeKey`     | `TransformValue<TNode, ChartKey>`                   | Required      | Node identity                                                |
| `source`      | `TransformValue<TLink, ChartKey>`                   | Required      | Source-node identity                                         |
| `target`      | `TransformValue<TLink, ChartKey>`                   | Required      | Target-node identity                                         |
| `value`       | `TransformValue<TLink, number>`                     | Required      | Nonnegative link weight                                      |
| `linkKey`     | `TransformValue<TLink, ChartKey>`                   | Inferred      | Stable link identity                                         |
| `align`       | `SankeyAlignment \| SankeyNodeAligner`              | `justify`     | Built-in shorthand or D3-compatible node aligner             |
| `nodeSort`    | `SankeyNodeComparator<TNode> \| null`               | D3 order      | Same-column ordering; `null` preserves input order           |
| `linkSort`    | `SankeyLinkComparator<TNode, TLink> \| null`        | D3 order      | Link ordering inside each node; `null` preserves input order |
| `nodeWidth`   | `number \| (chart: ChartBounds) => number`          | `24`          | Positive final-pixel node width                              |
| `nodePadding` | `number \| (chart: ChartBounds) => number`          | `8`           | Nonnegative final-pixel separation within a layer            |
| `inset`       | `number \| SankeyInset \| responsive callback`      | `0`           | Final-pixel inset from the resolved plot bounds              |
| `iterations`  | `number`                                            | `6`           | Nonnegative integer relaxation-pass count                    |
| `marks`       | `(context: SankeyDiagramContext) => nonempty marks` | Required      | Ordinary marks over final-pixel node and link rows           |
| `id`          | `string`                                            | Layer-derived | Stable parent mark identity                                  |
| `motion`      | `ChartMotionDefinition`                             | None          | Parent motion policy merged with each child's motion policy  |

Responsive `nodeWidth`, `nodePadding`, and `inset` callbacks receive the final
`ChartBounds`. Insets may be one number or separate `top`, `right`, `bottom`,
and `left` values. The remaining extent must fit the node width and have a
positive height.

`align` also accepts a native D3 Sankey aligner or compatible callable:

```ts
import { sankeyLeft } from 'd3-sankey'

sankeyDiagram({
  // graph channels and marks
  align: sankeyLeft,
})
```

The callable receives a private `SankeyAlignmentNode` and the total column
count. Its raw node row is `node.data`; D3 topology fields such as `depth`,
`height`, `sourceLinks`, and `targetLinks` are available on the same record.
It must synchronously return an integer from `0` through `columnCount - 1`.
The mark validates that result and creates fresh working records for every
layout pass, so do not retain or mutate them.

### Child marks

The `marks` callback receives `{ id, chart, nodes, links }`. It must return at
least one ordinary mark. Positional channels in those child marks are already
final pixels, so a Sankey definition needs no x or y scale and normally hides
Cartesian guides.

The callback may run more than once while responsive margins and guides
converge. Keep it synchronous, deterministic, and free of input mutation or
external side effects.

Use the callback for presentation that belongs to the visualization: link
curve and paint, node color, label side and wording, backdrops, or a title.
Those decisions remain visible beside the marks rather than becoming hidden
layout data preparation.

Child scene keys, mark IDs, and interaction points are scoped under the
Sankey mark. Color channels, layout labels, focus states, and child motion
retain their ordinary behavior. A child cannot itself require resolved mark
layout; nested responsive layout passes are rejected.

### Node and link rows

Every `SankeyNode<TNode, TLink>` contains:

- `kind: 'node'`, stable `key`, `index`, `depth`, `height`, and `layer`;
- aggregate `value`;
- final-pixel `x0`, `x1`, `y0`, `y1`, and center `x`, `y`;
- direct raw `data`, `source`, and `sourceIndexes` lineage; and
- immutable `incomingLinks` and `outgoingLinks`.

Every `SankeyLink<TNode, TLink>` contains:

- `kind: 'link'`, stable `key`, raw `data`, `sourceRows`, and
  `sourceIndexes`;
- `sourceKey`, `targetKey`, node indexes, and resolved `sourceNode` and
  `targetNode`;
- semantic `value`; and
- final-pixel `width`, `x1`, `y1`, `x2`, and `y2`.

The output rows and their lineage arrays are immutable. Node and link visual,
sort, tooltip, and motion callbacks can reach the original row through
`data`.

### Types

The exact entry exports `sankeyDiagram`, `SankeyAlignment`,
`SankeyAlignmentNode`, `SankeyNodeAligner`, `SankeyInset`,
`SankeyLayoutValue`, `SankeyEndpointContext`, `SankeyNodeContext`,
`SankeyLinkContext`, `SankeyNode`, `SankeyLink`, `SankeyDiagramContext`,
`SankeyNodeComparator`, `SankeyLinkComparator`, and `SankeyDiagramOptions`.

See [Rules, Links, Arrows, Vectors, and Ticks](./marks-composite.md#source-charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md)
for link curves and paint, and
[Networks and Hierarchies](./examples-advanced.md#source-charts-docs-examples-networks-and-hierarchies-md) for the
catalog cases.

<a id="source-charts-docs-reference-marks-sunburst-md"></a>

## Sunburst

Source: `charts:docs/reference/marks/sunburst.md`.

`sunburst` partitions a flat hierarchy into nested angular sectors. It runs
inside `polar`, so ring radii resolve from the final polar layout without
application-owned partition rows or D3 arc generators.

```ts
import { defineChart } from '@tanstack/charts'
import { sunburst } from '@tanstack/charts/hierarchy/sunburst'
import { polar } from '@tanstack/charts/polar'

const chart = defineChart({
  marks: [
    polar({
      startAngle: Math.PI / 2,
      endAngle: Math.PI / 2 - Math.PI * 2,
      marks: [
        sunburst(rows, {
          path: 'name',
          delimiter: '.',
          value: 'size',
          rootId: '/flare/analytics',
          visibleDepth: 2,
          innerRadius: ({ radius }) => radius * 0.14,
          ringPadding: 2,
          color: 'branchId',
          stroke: '#fff',
        }),
      ],
      scales: {
        angle: null,
        radius: null,
      },
    }),
  ],
  scales: {
    x: null,
    y: null,
  },
})
```

The exact `@tanstack/charts/hierarchy/sunburst` subpath keeps hierarchy
construction and partitioning out of root, universal, ordinary polar, and
radial-bar consumers.

### Hierarchy input

Path input constructs parent-child relationships from a string channel:

```ts
sunburst(rows, {
  path: 'name',
  delimiter: '.',
  value: 'size',
})
```

Explicit parent references use `nodeId` because `id` identifies the mark:

```ts
sunburst(rows, {
  id: 'package-sunburst',
  nodeId: 'id',
  parentId: 'parentId',
  value: 'size',
})
```

Path input may omit ancestors. Those structural nodes have `data: null` and
empty direct lineage. Duplicate identities, invalid parents, multiple roots,
and cycles throw before rendering. Source child order is preserved unless
`sort` is supplied.

Path-mode node IDs use the shared hierarchy contract's canonical slash form,
independent of the authored delimiter. The original row and path remain on
`data`; use them when presentation must preserve source spelling. Path-mode
`name` is the terminal path segment. Explicit-parent IDs are opaque, so their
`name` is the complete authored ID even when it contains a slash.

### Options

`SunburstPathOptions<TDatum>` and `SunburstParentOptions<TDatum>` form the
`SunburstOptions<TDatum>` union.

| Option                                        | Type                                                     | Default        | Meaning                                             |
| --------------------------------------------- | -------------------------------------------------------- | -------------- | --------------------------------------------------- |
| `path`                                        | `TransformValue<TDatum, string>`                         | Path mode only | Full hierarchy path                                 |
| `delimiter`                                   | `string`                                                 | `/`            | One-character path separator                        |
| `nodeId`                                      | `TransformValue<TDatum, string>`                         | Parent mode    | Explicit node identity                              |
| `parentId`                                    | `TransformValue<TDatum, string?>`                        | Parent mode    | Explicit parent identity                            |
| `value`                                       | `TransformValue<TDatum, number?>`                        | Required       | Nonnegative contribution aggregated through parents |
| `sort`                                        | `SunburstNodeComparator<TDatum>`                         | Source order   | Sibling comparator over immutable node values       |
| `rootId`                                      | `string`                                                 | Hierarchy root | Node whose children form the first rendered ring    |
| `visibleDepth`                                | `number`                                                 | All depths     | Maximum descendant rings below the active root      |
| `innerRadius`                                 | `PolarLength`                                            | `0`            | Responsive inner edge of the first rendered ring    |
| `outerRadius`                                 | `PolarLength`                                            | Layout radius  | Responsive outer edge of the last rendered ring     |
| `ringPadding`                                 | `number`                                                 | `0`            | Fixed CSS-pixel gap between hierarchy depths        |
| `id`, `className`                             | `string`                                                 | Derived        | Stable mark identity and optional class             |
| `z`                                           | `Channel<SunburstNode<TDatum>, ChartKey?>`               | No group       | Geometry and interaction group                      |
| `color`                                       | `Channel<SunburstNode<TDatum>, ChartKey?>`               | `z`            | Value sent to the chart color scale                 |
| `fill`, `stroke`                              | `VisualChannel<SunburstNode<TDatum>, string>`            | Color / none   | Per-sector paint                                    |
| `fillOpacity`, `strokeOpacity`, `strokeWidth` | `number`                                                 | Renderer value | Sector presentation                                 |
| `strokeDasharray`                             | `string`                                                 | None           | Sector stroke dash pattern                          |
| `opacity`                                     | `number`                                                 | Renderer value | Whole-sector opacity                                |
| `motion`                                      | `ChartMarkMotionOptions<SunburstNode<TDatum>>['motion']` | None           | Per-node motion policy                              |

Nullish values contribute zero. Other values must be finite and nonnegative.
`ringPadding` is a nonnegative pixel value. If padding consumes the available
radial span, the mark omits sectors instead of emitting inverted rings.

### Responsive partition

The enclosing `polar` mark owns the angular sweep and final center. `sunburst`
allocates each node's angle from its aggregate value and divides the resolved
`innerRadius` to `outerRadius` span into equal depth rings. The radius options
accept pixel lengths or responsive callbacks through `PolarLength`. Both
resolved radii must be finite and nonnegative; their order controls the ring
direction.

`ringPadding` remains a fixed pixel gap as the chart resizes. It does not
change the hierarchy values or angular allocation. Sectors replay the shared
renderer-neutral D3 path commands into a sampled interaction polygon, so
rounded, reversed, and complete sectors retain paint-faithful focus geometry.

### Drill-down and motion

`rootId` makes an existing hierarchy node the structural root without changing
its canonical ID or rebuilding source rows. Its children become depth one, and
the root itself is not painted. `visibleDepth` is relative to that root; hidden
descendants still contribute to aggregate values and `internal` metadata.

```ts
const definition = (rootId: string) =>
  defineChart({
    marks: [
      polar({
        marks: [
          sunburst(rows, {
            id: 'package-sunburst',
            path: 'name',
            delimiter: '.',
            value: 'size',
            rootId,
            visibleDepth: 2,
          }),
        ],
        scales: {
          angle: null,
          radius: null,
        },
      }),
    ],
    scales: {
      x: null,
      y: null,
    },
    motion: {
      transition: { type: 'tween', duration: 720, easing: 'ease-in-out' },
    },
  })
```

Rebuild the definition when application navigation changes `rootId`, and mount
it with the optional `motion()` renderer. Retained descendants keep their node
keys. Sunburst motion interpolates each sector's angles and radii, then
regenerates a valid concentric arc around the fixed polar center every frame.
Newly revealed descendants unfold from their nearest disappearing ancestor
sector. During drill-up, removed descendants collapse into their nearest
appearing ancestor. Nodes without an overlapping lineage use the normal enter
or exit opacity transition. The renderer snaps these updates when the user
requests reduced motion.

In path mode, pass the canonical slash ID such as `/flare/analytics`, not the
authored delimiter spelling. Explicit-parent IDs remain opaque.

### Nodes and lineage

The root is structural and is not painted. Every rendered sector carries one
`SunburstNode<TDatum>` with:

- stable `id`, `parentId`, and root-to-parent `ancestorIds`;
- `name`, `depth`, `height`, and `internal` / `external` metadata;
- aggregate `value`;
- `branchId`, equal to the first node below the root for that branch;
- the direct authored `data` row, or `null` for an imputed node; and
- direct `source` and `sourceIndexes` lineage.

`branchId` is useful for inherited branch color: `color: 'branchId'` gives a
top-level branch and all its descendants one color without preparing a color
field. Paint, motion, and sort callbacks receive the same immutable node
values.

### Types

The exact entry exports `sunburst`, `SunburstNode`,
`SunburstNodeComparator`, `SunburstPathOptions`, `SunburstParentOptions`, and
`SunburstOptions`.

See [Polar Marks](./marks-spatial.md#source-charts-docs-reference-marks-polar-md) for angular sweeps and responsive
`PolarLength` values.

<a id="source-charts-docs-reference-marks-text-frame-and-facet-md"></a>

## Text Frame And Facet

Source: `charts:docs/reference/marks/text-frame-and-facet.md`.

`text` annotates scaled positions, `frame` paints the resolved inner chart
bounds, and `facet` composes complete child specs into responsive small
multiples.

```ts
import { facet, facetChart, frame, lineY, text } from '@tanstack/charts'
```

### `text`

```ts
text(rows, {
  x: 'date',
  y: 'value',
  text: 'label',
  z: 'series',
  dy: -8,
})
```

```ts
function text<TDatum>(
  source: Iterable<TDatum>,
  options?: TextOptions<TDatum>,
): ChartMark<TDatum, InferredX, InferredY>
```

#### Options

| Option       | Type                                 | Default                            | Meaning                                           |
| ------------ | ------------------------------------ | ---------------------------------- | ------------------------------------------------- |
| `id`         | `string`                             | Layer-derived                      | Stable mark ID                                    |
| `x`          | `Channel<TDatum, ChartValue?>`       | Row index                          | Horizontal anchor                                 |
| `y`          | `Channel<TDatum, ChartValue?>`       | Numeric datum                      | Vertical anchor                                   |
| `text`       | `Channel<TDatum, string \| number?>` | String form of datum               | Label content                                     |
| `z`          | `Channel<TDatum, ChartKey?>`         | No group                           | Interaction group                                 |
| `color`      | `Channel<TDatum, ChartKey?>`         | `z`                                | Value sent to the chart color scale               |
| `key`        | `Channel<TDatum, ChartKey>`          | ID, x, y, x/y, index               | Stable identity                                   |
| `fill`       | `VisualChannel<TDatum, string>`      | Theme foreground or resolved color | Final label paint override                        |
| `fontSize`   | `number`                             | Inherited SVG font size            | Font size                                         |
| `fontWeight` | `number`                             | Inherited weight                   | Numeric font weight                               |
| `anchor`     | `VisualChannel<TDatum, TextAnchor>`  | `'middle'`                         | `'start'`, `'middle'`, or `'end'`                 |
| `rotate`     | `VisualChannel<TDatum, number>`      | No transform                       | Rotation in degrees around the final label origin |
| `dx`         | `VisualChannel<TDatum, number>`      | `0`                                | Horizontal pixel offset                           |
| `dy`         | `VisualChannel<TDatum, number>`      | `0`                                | Vertical pixel offset                             |
| `states`     | `readonly ChartMarkState[]`          | None                               | Focus-driven presentation overrides               |

Labels use a middle baseline. Null or undefined text skips the row; the default
for a null datum is an empty string. Invalid x/y values also skip the row.

The interaction point is at the offset label origin. Its semantic values remain
the original x/y channels. Without an explicit key, `text` tries a unique
top-level or nested `data.id`, then x, y, and the x/y tuple. Supply `key` when
positions can change while the same label should reconcile across updates.

### `frame`

`frame` draws a background, border, or both around the final inner chart
bounds:

```ts
frame({
  fill: 'color-mix(in srgb, currentColor 3%, transparent)',
  strokeOpacity: 0.25,
  radius: 8,
})
```

```ts
function frame(options?: FrameOptions): ChartMark<never, never, never>
```

| Option          | Type     | Default          | Meaning                                                             |
| --------------- | -------- | ---------------- | ------------------------------------------------------------------- |
| `id`            | `string` | Layer-derived    | Stable mark ID                                                      |
| `fill`          | `string` | `'none'`         | Constant fill                                                       |
| `fillOpacity`   | `number` | SVG default      | Fill opacity                                                        |
| `stroke`        | `string` | Theme foreground | Constant stroke                                                     |
| `strokeOpacity` | `number` | `0.35`           | Stroke opacity                                                      |
| `strokeWidth`   | `number` | `1`              | Stroke width                                                        |
| `inset`         | `number` | `0`              | Pixels removed from all chart-bound edges; clamped to at least zero |
| `radius`        | `number` | None             | Corner radius                                                       |

`frame` materializes no scale channels and emits no interaction points. Put it
before data marks when it should paint behind them.

### `facet`

`facet` groups source rows by a key and renders one complete child chart spec
per group inside the parent chart bounds.

```ts
facet(rows, {
  by: 'region',
  columns: 3,
  minWidth: 220,
  gap: 16,
  label: (region) => `Region: ${region}`,
  chart(groupRows) {
    return {
      marks: [lineY(groupRows, { x: 'date', y: 'value' })],
      scales: {
        x: { scale: makeXScale(groupRows) },
        y: { scale: makeYScale(groupRows), grid: true },
      },
    }
  },
})
```

```ts
function facet<TDatum, TChildSpec extends ChartSpec>(
  source: Iterable<TDatum>,
  options: FacetOptions<TDatum, TChildSpec>,
): ChartMark<ChartSpecDatum<TChildSpec>>
```

#### Options

| Option     | Type                                                                               | Default                   | Meaning                                                        |
| ---------- | ---------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------- |
| `id`       | `string`                                                                           | Layer-derived             | Stable outer mark ID                                           |
| `by`       | `Channel<TDatum, ChartKey>`                                                        | Required                  | String or number grouping key                                  |
| `chart`    | `(data: readonly [TDatum, ...TDatum[]], context: FacetChartContext) => TChildSpec` | Required                  | Builds one static child spec from a nonempty group             |
| `columns`  | `number`                                                                           | Automatic                 | Requested column count, floored and clamped to `1..groupCount` |
| `minWidth` | `number`                                                                           | `220`                     | Target minimum cell width used for automatic columns           |
| `gap`      | `number`                                                                           | `16`                      | Gap between rows and columns, clamped to at least zero         |
| `label`    | `boolean \| ((key) => string)`                                                     | `true`                    | Shows default key labels, formats them, or disables labels     |
| `axes`     | `'outer' \| 'cell'`                                                                | `'outer'` where shareable | Shared outside axes or independent axes in every cell          |
| `motion`   | `ChartMotionDefinition<ChartSpecDatum<TChildSpec>>`                                | None                      | Motion policy over child-mark data                             |

`FacetChartContext.key` is the materialized value for the current group.

Facet preserves first-seen group order and original row order within each
group. Non-string and non-number `by` results are skipped.

Automatic columns are:

```text
floor((availableWidth + gap) / (minWidth + gap))
```

with a minimum of one. Rows are then derived from group count. Visible facet
labels reserve 22 pixels above every child plot.

#### Outer axes

With more than one child and guides enabled, the default `axes: 'outer'`
renders y ticks on the first column, x ticks on the final occupied row, and
one shared title per dimension.

Outer axes require compatible cells:

- x and y resolved scale types, domains, ticks, labels, and direction match
- axis label, label offset, and tick rotation match
- foreground and muted theme tokens match
- no child provides its own `margin`
- no child provides a color legend
- no child sets `guides: false`

An incompatible facet throws with guidance to use `axes: 'cell'`. This
fail-fast behavior prevents a shared axis from implying a comparison the child
scales do not support.

When every child sets `guides: false`, or there is only one child, facet uses
the cell rendering path even if `axes` is omitted.

#### Cell axes

Set `axes: 'cell'` when groups need independent scales, guide options, margins,
or legends:

```ts
facet(rows, {
  by: 'region',
  axes: 'cell',
  chart: (groupRows) => buildIndependentSpec(groupRows),
})
```

Every child compiles at its own cell dimensions with the parent's text
measurement. Compilation errors are wrapped with the facet and cell key.

#### Interaction

Child `ChartPoint` coordinates are offset into the parent scene. Point keys are
prefixed with facet and group identity, so equal child keys remain unique
across cells. Datum, semantic x/y values, group, group label, and paint are
preserved. The facet's output datum type comes from the marks returned by
`chart`; grouping rows do not replace a child point's original datum. Motion
callbacks receive that same child datum type.

The facet mark itself has intentionally opaque positional types because each
child may return a different mark composition. Its child scale domains do not
participate in the parent x/y scales.

### `facetChart`

`facetChart` wraps a facet mark in a complete static definition:

```ts
const definition = facetChart(rows, {
  by: 'region',
  chart: (groupRows) => buildSpec(groupRows),
})
```

```ts
function facetChart<TDatum, TChildSpec extends ChartSpec>(
  source: Iterable<TDatum>,
  options: FacetOptions<TDatum, TChildSpec>,
): StaticChartDefinition<ChartSpecDatum<TChildSpec>>
```

The wrapper sets:

```ts
const specification = {
  marks: [facet(source, options)],
  margin: 0,
}
```

Use `facet` directly when the small multiples must be layered with other
parent-scene marks. Use `facetChart` for the usual standalone chart.

<a id="source-charts-docs-reference-marks-treemap-md"></a>

## Treemap

Source: `charts:docs/reference/marks/treemap.md`.

`treemap` converts flat hierarchy rows into area-proportional leaf rectangles.
It runs after the final plot bounds resolve, so tiling, padding, and labels use
CSS pixels without application-owned coordinates or Cartesian scales.

```ts
import { treemap } from '@tanstack/charts/hierarchy/treemap'

const mark = treemap(rows, {
  path: 'name',
  delimiter: '.',
  value: 'size',
  color: (node) => node.ancestorIds.at(-1) ?? node.id,
  label: 'name',
  inset: 1,
  stroke: '#fff',
})
```

The exact optional subpath keeps hierarchy tiling out of root and ordinary-mark
consumers.

### Hierarchy input

Path input constructs parent-child relationships from a string channel:

```ts
treemap(rows, {
  path: 'name',
  delimiter: '.',
  value: 'size',
})
```

Explicit parent references use `nodeId` because `id` is reserved for the mark:

```ts
treemap(rows, {
  id: 'package-sizes',
  nodeId: 'id',
  parentId: 'parentId',
  value: 'size',
})
```

Path input may omit ancestors. The mark imputes those structural nodes with
`data: null` and empty direct lineage. Duplicate identities, invalid parents,
multiple roots, and cycles throw before rendering. Authored child order is
preserved unless `sort` is supplied.

Path-mode IDs use canonical slash form and `name` is the terminal path segment.
Explicit-parent IDs are opaque, so `name` is the complete authored ID even
when it contains a slash.

### Options

`TreemapPathOptions<TDatum>` and `TreemapParentOptions<TDatum>` form the
`TreemapOptions<TDatum>` union.

| Option                                        | Type                                                    | Default                 | Meaning                                               |
| --------------------------------------------- | ------------------------------------------------------- | ----------------------- | ----------------------------------------------------- |
| `path`                                        | `TransformValue<TDatum, string>`                        | Path mode only          | Full hierarchy path                                   |
| `delimiter`                                   | `string`                                                | `/`                     | One-character path separator                          |
| `nodeId`                                      | `TransformValue<TDatum, string>`                        | Parent mode only        | Explicit node identity                                |
| `parentId`                                    | `TransformValue<TDatum, string?>`                       | Parent mode only        | Explicit parent identity                              |
| `value`                                       | `TransformValue<TDatum, number?>`                       | Required                | Nonnegative contribution summed through the hierarchy |
| `method`                                      | `TreemapMethod \| TreemapTile<TDatum>`                  | `squarify`              | Built-in shorthand or D3-compatible tile callable     |
| `ratio`                                       | `number`                                                | Golden ratio            | Squarify target aspect ratio, at least `1`            |
| `round`                                       | `boolean`                                               | `false`                 | Round final rectangle coordinates to pixels           |
| `paddingInner`                                | `number`                                                | `0`                     | Pixel gap between adjacent children                   |
| `paddingOuter`                                | `number`                                                | `0`                     | Pixel gap between parent edges and children           |
| `sort`                                        | `TreemapNodeComparator<TDatum>`                         | Authored order          | Sibling comparator over immutable node contexts       |
| `id`                                          | `string`                                                | Layer-derived           | Stable mark identity                                  |
| `color`                                       | `Channel<TreemapNode<TDatum>, ChartKey?>`               | No group                | Node value sent to the color scale                    |
| `fill`, `stroke`                              | `VisualChannel<TreemapNode<TDatum>, string>`            | Resolved color / none   | Per-node paint                                        |
| `fillOpacity`, `strokeOpacity`, `strokeWidth` | `number`                                                | Renderer default        | Rectangle presentation                                |
| `inset`, `radius`                             | `number`                                                | `0.75` / none           | Painted rectangle inset and corner radius             |
| `label`                                       | `Channel<TreemapNode<TDatum>, string \| number?>`       | None                    | Centered in-cell label                                |
| `labelFill`                                   | `VisualChannel<TreemapNode<TDatum>, string>`            | Theme foreground        | Label paint                                           |
| `labelFontSize`, `labelFontWeight`            | `number`                                                | `11` / renderer default | Label typography                                      |
| `labelPadding`                                | `number`                                                | `4`                     | Minimum painted pixels around a label                 |
| `states`                                      | `readonly ChartMarkState[]`                             | None                    | Focus-driven rectangle states                         |
| `motion`                                      | `ChartMarkMotionOptions<TreemapNode<TDatum>>['motion']` | None                    | Per-node motion policy                                |

Nullish values contribute zero. Other values must be nonnegative and finite.
`ratio` is valid only with `squarify`. Padding, inset, and label padding are
nonnegative CSS-pixel values.

`method` also accepts a native D3 tiler or a compatible callable:

```ts
import { treemapBinary } from 'd3-hierarchy'

treemap(rows, {
  path: 'name',
  value: 'size',
  method: treemapBinary,
})
```

A callable receives a `HierarchyRectangularNode<TreemapTileDatum<TDatum>>`
from the mark's private hierarchy copy plus the tile bounds. It must assign
child coordinates synchronously using the D3 tile contract. The datum wrapper
contains hierarchy identity, the nullable raw row, and its source index. Do
not retain or mutate the authored row. Configure callable-specific behavior in
the callable itself; `ratio` remains exclusive to the `squarify` shorthand.

### Responsive layout

Treemap row grouping depends on the final plot aspect ratio. The mark sizes the
selected tiler to the resolved inner width and height on every layout pass;
resizing may therefore change rectangle adjacency as well as dimensions.
Coordinates use the screen convention where y increases downward and never
enter a Cartesian scale.

Each pass lays out a private hierarchy copy. Value and path accessors are not
rerun, input rows are not mutated, and repeated compilation at one size is
deterministic. Stateful `resquarify` is intentionally not a method.

### Nodes, labels, and interaction

Only positive-area leaves render. Every rectangle and interaction point carries
one `TreemapNode<TDatum>` with:

- stable `id`, `parentId`, and root-to-parent `ancestorIds`;
- `name`, `depth`, `height`, and `internal` / `external` metadata;
- aggregate `value`;
- the authored `data` row, or `null` for an imputed node; and
- direct `source` and `sourceIndexes` lineage.

Color, paint, state, and label channels receive these nodes. A label is emitted
only when its measured bounds plus `labelPadding` fit inside the painted cell.
This uses the chart host's text measurer when available and the deterministic
scene estimator otherwise.

### Types

The exact entry exports `treemap`, `TreemapMethod`, `TreemapTileDatum`,
`TreemapTile`, `TreemapNode`, `TreemapNodeComparator`, `TreemapPathOptions`,
`TreemapParentOptions`, and `TreemapOptions`.

<a id="source-charts-docs-reference-marks-waffle-md"></a>

## Waffle

Source: `charts:docs/reference/marks/waffle.md`.

`waffleY` and `waffleX` divide nonnegative source values into equal visual
units. They pack directly inside the final chart bounds, so no positional
scales or application-owned cell expansion are required.

```ts
import { waffleX, waffleY } from '@tanstack/charts/waffle'

const mark = waffleY(rows, {
  y: 'share',
  color: 'category',
  unit: 0.01,
  round: true,
  gap: 2,
  radius: 2,
})
```

Both marks are also exported from `@tanstack/charts` and
`@tanstack/charts/universal`.

### Orientation

`waffleY` treats `y` as each source row's contribution. Units advance
left-to-right, then bottom-to-top. `waffleX` transposes the contract: `x`
contains the contribution and units advance bottom-to-top, then left-to-right.

```ts
function waffleY<TDatum>(
  source: Iterable<TDatum>,
  options: WaffleYOptions<TDatum>,
): ChartMark<TDatum, ChartKey, number, never, never>

function waffleX<TDatum>(
  source: Iterable<TDatum>,
  options: WaffleXOptions<TDatum>,
): ChartMark<TDatum, number, ChartKey, never, never>
```

### Options

`WaffleOptions<TDatum>` contains the shared identity, unit, paint, state, and
motion fields. `WaffleYOptions<TDatum>` adds `y` and `columns`;
`WaffleXOptions<TDatum>` adds `x` and `rows`.

| Option                                            | Type                                       | Default          | Meaning                                                    |
| ------------------------------------------------- | ------------------------------------------ | ---------------- | ---------------------------------------------------------- |
| `y`                                               | `Channel<TDatum, number?>`                 | Required by Y    | Contribution encoded by `waffleY`                          |
| `x`                                               | `Channel<TDatum, number?>`                 | Required by X    | Contribution encoded by `waffleX`                          |
| `unit`                                            | `number`                                   | `1`              | Semantic value represented by one complete cell            |
| `round`                                           | `boolean`                                  | `false`          | Round cumulative unit boundaries before allocating cells   |
| `columns`                                         | `number`                                   | Responsive       | Fixed cells per row for `waffleY`                          |
| `rows`                                            | `number`                                   | Responsive       | Fixed cells per column for `waffleX`                       |
| `gap`                                             | `number`                                   | `1`              | Empty pixels between complete cells                        |
| `radius`                                          | `number`                                   | None             | Corner radius for complete cells                           |
| `id`                                              | `string`                                   | Layer-derived    | Stable mark ID                                             |
| `z`                                               | `Channel<TDatum, ChartKey?>`               | No group         | Interaction group; color fallback when omitted             |
| `color`                                           | `Channel<TDatum, ChartKey?>`               | `z`              | Value sent to the chart color scale                        |
| `key`                                             | `Channel<TDatum, ChartKey>`                | Inferred         | Stable source-row identity                                 |
| `fill`, `stroke`                                  | `VisualChannel<TDatum, string>`            | Resolved color   | Per-row paint overrides                                    |
| `fillOpacity`, `strokeOpacity`, and `strokeWidth` | `number`                                   | Renderer default | Cell presentation                                          |
| `states`                                          | `readonly ChartMarkState[]`                | None             | Focus-driven rectangle styles applied to every source tile |
| `motion`                                          | `ChartMarkMotionOptions<TDatum>['motion']` | None             | Per-tile motion policy                                     |

`unit` must be positive and finite. Contributions must be nonnegative and
finite; nullish and nonfinite channel values are omitted. Fixed `columns` or
`rows` must be positive integers, and `gap` must be nonnegative.

### Unit boundaries

The mark allocates each row against cumulative values. With `unit: 0.01`, a
complete cell represents one percentage point. With `round: true`, cumulative
boundaries are rounded, so the complete allocation preserves the rounded total
without independently rounding every category.

When `round` is false, a category boundary may divide one cell. Each category
receives its exact fractional rectangle and the adjacent fragments meet without
an added gap. `radius` applies only to complete cells.

### Responsive packing

Without `columns` or `rows`, the mark chooses a square-cell grid from the final
plot bounds after margins and legends resolve. It may change the number of rows
or columns when the chart resizes while preserving source order and keys. Set
`columns` on `waffleY` or `rows` on `waffleX` when the grid count is part of the
chart's meaning, such as a fixed ten-by-ten percentage display.

### Source identity and interaction

Cell expansion is internal. Each visible source row contributes one interaction
point, and every complete or fractional tile for that row references the same
original datum and datum index. The quantitative point value remains the row's
contribution; cumulative start and end values are exposed as its interval.

Color-domain inference uses the original source rows, including a category that
rounds to zero visible cells. This keeps an explicitly meaningful category in a
legend without manufacturing a rendered interaction point.
