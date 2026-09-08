# Transforms — Tidy hierarchy trees

[Guide and prerequisites](./charts-docs-reference-transforms-md-6acdd0ab.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Tidy hierarchy trees

`treeLayout` turns flat path or parent-reference rows into positioned nodes and
links. Import it from its exact optional entry:

```ts
import { treeLayout } from '@tanstack/charts/hierarchy/tree'

const hierarchy = treeLayout(rows, {
  path: 'name',
  delimiter: '.',
  orientation: 'left',
  nodeSize: [1, 1],
})
```

Use `path` and an optional one-character `delimiter` for full semantic paths.
Missing path ancestors are imputed with `data: null` and empty lineage. Use
`id` and `parentId` instead when every node is an explicit row:

```ts
const hierarchy = treeLayout(rows, {
  id: 'id',
  parentId: 'parentId',
})
```

The two input forms are mutually exclusive. IDs must be unique, every
non-root parent must exist, and the rows must form one acyclic hierarchy.
`sort` and `separation` receive immutable `TreeNodeContext` objects with
identity, raw data, depth, height, `internal`/`external` flags, and lineage. Input
order remains the child order when `sort` is omitted.

Path-mode IDs use canonical slash form and `name` is the terminal path segment.
Explicit-parent IDs are opaque, so `name` is the complete authored ID even
when it contains a slash.

Output nodes contain `id`, `parentId`, `name`, nullable `data`, `depth`,
`height`, `internal`, `external`, `x`, `y`, `source`, and `sourceIndexes`.
Each link contains stable source and target IDs, resolved endpoint nodes and
indexes, `x1`, `y1`, `x2`, `y2`, and the target node's raw-row lineage. A link
uses its target ID as its own ID because each non-root tree node has one
incoming link. Endpoint indexes are null when the corresponding path ancestor
was imputed.

`orientation` selects the root anchor: `left` is the default, with `right`,
`top`, and `bottom` also available. `nodeSize` is `[breadth, depth]` in semantic
data-space units. Normal positional scales own responsive projection, so this
eager transform does not depend on final chart bounds. It is uncached; memoize
unchanged hierarchy input with other derived data.
