---
name: tanstack-solid-table-table-state
description: "Read and control Table v9 state in solid. Use for tracked reads, subscriptions, controlled slices, and framework-specific reactive boundaries."
license: "MIT"
metadata:
  internal: true
  tanstack-framework: "solid"
  tanstack-library: "@tanstack/solid-table"
  tanstack-library-version: "9.2.7"
  tanstack-package: "@tanstack/solid-table"
  tanstack-package-version: "9.2.7"
  tanstack-requires: "[\"tanstack-table-core-table-state\"]"
  tanstack-source-skill: "table-state"
  tanstack-sources: "[\"TanStack/table:docs/framework/solid/guide/table-state.md\",\"TanStack/table:examples/solid/basic-external-state\",\"TanStack/table:packages/solid-table/src/createTable.ts\"]"
  tanstack-type: "framework"
---

# Solid table state

Before starting, run `intent load @tanstack/table-core#table-state` for shared ownership, initialization, updates, and resets.

## Read reactive state

The adapter backs table atoms with Solid signals and memos. Read `table.atoms.<slice>.get()` inside JSX, `createMemo`, `createEffect`, or another tracked scope. A value captured once outside tracking is only a snapshot. Solid has no React-style selected `table.state`.

`table.Subscribe` is deprecated and adds no subscription or tracking scope. Read `table.atoms` directly inside JSX, memos, or effects. Component bodies are untracked; keep reads inside tracked scopes. Track the required atoms instead of adding whole-store forced rerenders.

## Control a slice

Keep features and columns stable. Expose changing data and controlled state through getters. Solid setters already accept Table's raw values and updater functions:

```tsx
import { createMemo, createSignal } from 'solid-js'
import {
  createTable,
  rowPaginationFeature,
  tableFeatures,
  type PaginationState,
} from '@tanstack/solid-table'

const features = tableFeatures({ rowPaginationFeature })
const columns = [{ accessorKey: 'name' }]

export function PageControl() {
  const [data] = createSignal([{ name: 'Ada' }])
  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const table = createTable({
    features,
    columns,
    get data() {
      return data()
    },
    state: {
      get pagination() {
        return pagination()
      },
    },
    onPaginationChange: setPagination,
  })
  const pageSize = createMemo(() => table.atoms.pagination.get().pageSize)
  return (
    <button onClick={() => table.setPageSize(50)}>
      {pageSize()} rows per page
    </button>
  )
}
```

When wrapping a setter to add a side effect, resolve both updater forms before storing the result. For shared atom ownership, use `createAtom` from `@tanstack/solid-store` and pass it in `atoms.<slice>`.

For external atoms, custom updater wrappers, or tracking failures, read [reactivity details](./references/reactivity.md). If this task changes processing features, run `intent load @tanstack/table-core#table-features` and read the relevant feature references.

## API discovery

Inspect `node_modules/@tanstack/solid-table/dist/createTable.d.ts` and `reactivity.d.ts`; inspect `@tanstack/solid-store` declarations for external atoms.
