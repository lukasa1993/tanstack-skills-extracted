---
name: tanstack-preact-table-getting-started
description: "Create and render Table v9 with the preact adapter. Route reusable createTableHook components, Query and Virtual integration, and framework setup; use table-state for reactive ownership."
license: "MIT"
metadata:
  internal: true
  tanstack-framework: "preact"
  tanstack-library: "@tanstack/preact-table"
  tanstack-library-version: "9.2.8"
  tanstack-package: "@tanstack/preact-table"
  tanstack-package-version: "9.2.8"
  tanstack-requires: "[\"tanstack-table-core\"]"
  tanstack-source-skill: "getting-started"
  tanstack-sources: "[\"TanStack/table:docs/framework/preact/guide/migrating.md\",\"TanStack/table:examples/preact/basic-use-table\",\"TanStack/table:packages/preact-table/src/index.ts\",\"TanStack/table:docs/framework/preact/guide/composable-tables.md\",\"TanStack/table:docs/framework/preact/guide/table-context.md\",\"TanStack/table:examples/preact/composable-tables\",\"TanStack/table:packages/preact-table/src/createTableHook.tsx\",\"TanStack/table:packages/preact-table/src/createTableHookContexts.tsx\",\"TanStack/table:examples/preact/with-tanstack-query\",\"TanStack/table:docs/framework/preact/guide/pagination.md\",\"TanStack/table:docs/framework/preact/guide/virtualization.md\"]"
  tanstack-type: "framework"
---

# Preact Table setup and integration

Before starting, run `intent load @tanstack/table-core#core` for the shared headless model and stable-input rules.

## Setup

```tsx
import { useState } from 'preact/hooks'
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/preact-table'

type Person = { name: string }
const features = tableFeatures({})
const helper = createColumnHelper<typeof features, Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])

export function PeopleTable() {
  const [data] = useState<Person[]>([{ name: 'Ada' }])
  const table = useTable({ features, columns, data })
  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id}>
                <table.FlexRender header={header} />
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## Essential constraints

Use native `@tanstack/preact-table` and `preact/hooks`. V8 React-through-compat setup and `useReactTable` are not the native v9 API. Keep features, columns, and fallback arrays stable across renders.

Table owns models and state. The application owns markup, CSS, interactions, and accessibility. Core-only tables use `row.getAllCells()`; visibility-aware methods need `columnVisibilityFeature`. Optional state and APIs require their features. Put row-model slots after their prerequisite features in `tableFeatures()`.

## Load by task

- For repeated features, defaults, typed contexts, or component registries, read [reusable app hooks](./references/create-table-hook.md).
- For Query-backed data, server pages, sorting, filtering, or request keys, read [TanStack Query integration](./references/with-tanstack-query.md).
- For virtual rows, columns, dynamic measurement, or infinite scrolling, read [TanStack Virtual integration](./references/with-tanstack-virtual.md).
- For controlled state, tracked reads, or render subscriptions, read [table state](../tanstack-preact-table-table-state/SKILL.md).
- For feature registration, missing feature APIs, or processing ownership, run `intent load @tanstack/table-core#table-features` and read only references needed by the task.
- For v8 code, read the [migration checklist](../tanstack-preact-table-migrate-v8-to-v9/SKILL.md).

## API discovery

Inspect `node_modules/@tanstack/preact-table/dist/index.d.ts`, then the exported adapter declarations for the installed version. Inspect optional core APIs under `node_modules/@tanstack/table-core/dist/features/`.
