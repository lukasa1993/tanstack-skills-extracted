# With Tanstack Query

<a id="source-tanstack-preact-table-with-tanstack-query"></a>

Published skill · `@tanstack/preact-table@9.2.4`.

[Topic index](../framework-preact.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Client Vs Server](./tanstack-table-core-client-vs-server-32e9d046.md).
Prerequisite: [Getting Started](./tanstack-preact-table-getting-started-c2713634.md).
Prerequisite: [Table State](./tanstack-preact-table-table-state-dc1496a8.md).

This skill builds on `@tanstack/table-core#client-vs-server`, `getting-started`, and `table-state`. Query fetches already processed rows; Table's manual flags only declare that boundary.

## Setup

```tsx
import { keepPreviousData, useQuery } from '@tanstack/preact-query'
import { useCreateAtom, useSelector } from '@tanstack/preact-store'
import {
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from '@tanstack/preact-table'

const features = tableFeatures({ rowPaginationFeature })
const emptyRows: Array<{ id: string }> = []
const paginationAtom = useCreateAtom({ pageIndex: 0, pageSize: 20 })
const pagination = useSelector(paginationAtom, (value) => value)
const result = useQuery({
  queryKey: ['people', pagination],
  queryFn: () => fetchPeople(pagination),
  placeholderData: keepPreviousData,
})
const table = useTable({
  features,
  columns,
  data: result.data?.rows ?? emptyRows,
  rowCount: result.data?.rowCount,
  atoms: { pagination: paginationAtom },
  manualPagination: true,
})
```

## Core Patterns

### Key requests by every server-owned slice

```tsx
useQuery({
  queryKey: ['people', pagination, sorting],
  queryFn: () => fetchPeople({ pagination, sorting }),
})
```

### Pass cached rows directly

```tsx
useTable({ features, columns, data: result.data?.rows ?? emptyRows })
```

## Common Mistakes

### HIGH Importing React Query APIs

Wrong:

```tsx
import { useQuery } from '@tanstack/react-query'
```

Correct:

```tsx
import { useQuery } from '@tanstack/preact-query'
```

Use native Preact Query and Store integrations throughout the composition.

Source: `examples/preact/with-tanstack-query`

### HIGH Reusing one cache key

Wrong:

```tsx
useQuery({ queryKey: ['people'], queryFn: () => fetchPeople(pagination) })
```

Correct:

```tsx
useQuery({
  queryKey: ['people', pagination],
  queryFn: () => fetchPeople(pagination),
})
```

Each processed server result needs a key that includes its request state.

Source: `examples/preact/with-tanstack-query`

### HIGH Expecting manual flags to fetch

Wrong:

```tsx
useTable({ features, columns, data, manualPagination: true })
```

Correct:

```tsx
useTable({
  features,
  columns,
  data: result.data?.rows ?? emptyRows,
  rowCount: result.data?.rowCount,
  manualPagination: true,
})
```

Manual pagination bypasses local processing; it neither calls the backend nor invents totals.

Source: `docs/framework/preact/guide/pagination.md`

## API Discovery

Inspect installed `node_modules/@tanstack/preact-table/dist/index.d.ts` and the relevant core feature source; inspect `@tanstack/preact-query` source for exact query APIs.
