# Core

<a id="source-tanstack-table-core"></a>

Published skill · `@tanstack/table-core@9.2.8`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

# TanStack Table core

TanStack Table coordinates state and row processing. The renderer owns markup, styles, semantics, and interaction accessibility. Use the installed framework adapter in UI code; use `constructTable` for framework-neutral integrations.

## Minimal setup

<!-- skill-snippet:check -->

```ts
import {
  constructTable,
  createColumnHelper,
  tableFeatures,
} from '@tanstack/table-core'
import { storeReactivityBindings } from '@tanstack/table-core/store-reactivity-bindings'

type Person = { id: string; name: string }
const features = tableFeatures({
  coreReactivityFeature: storeReactivityBindings(),
})
const helper = createColumnHelper<typeof features, Person>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
const data: Person[] = [{ id: '1', name: 'Ada' }]
const table = constructTable({
  features,
  columns,
  data,
  getRowId: (row) => row.id,
})

for (const row of table.getRowModel().rows) {
  console.log(row.getAllCells().map((cell) => cell.getValue()))
}
```

## Essential constraints

- The core row model is automatic. Optional APIs and state exist only after their feature is registered.
- Keep `features`, `data`, and `columns` stable between meaningful changes. Derive changing arrays with the adapter's memo/computed mechanism; an inline `.map()`, `.filter()`, column factory, or fresh `[]` fallback invalidates model work and can cause render loops.
- Let `createColumnHelper` and `helper.columns()` preserve accessor value types. Derive feature types from the concrete registry when an explicit boundary is needed.
- Call row, cell, column, and header methods on their instance. Use `row.getValue('name')` or a callback that calls it; extracting `const { getValue } = row` loses its `this` receiver.
- Render the final `table.getRowModel().rows`. The table object itself is not a DOM component.

## Read for the current task

| Task                                                                | Read                                                                                    |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Add or repair optional features, processing slots, or prerequisites | [Feature architecture](./tanstack-table-core-table-features-d2215548.md#source-tanstack-table-core-table-features), then its relevant feature reference |
| Choose state ownership, initialize or reset state                   | [Shared state](./tanstack-table-core-table-state-2001cb1f.md#source-tanstack-table-core-table-state)                                                 |
| Fix `ColumnDef` inference, reusable options, or scoped meta         | [TypeScript inference](../assets/tanstack-table-core/references/typescript.md)                                        |
| Diagnose a missing export, option, state slice, or instance method  | [API discovery](../assets/tanstack-table-core/references/api-not-found.md)                                            |
| Implement row numbers, identity, or display-index behavior          | [Rows](../assets/tanstack-table-core/references/rows.md)                                                              |
| Author behavior beyond built-ins or typed meta                      | [Custom features](./tanstack-table-core-custom-features-cea374eb.md#source-tanstack-table-core-custom-features)                                          |
| Migrate an existing v8 table                                        | [Migration audit](./tanstack-table-core-migrate-v8-to-v9-654ca275.md#source-tanstack-table-core-migrate-v8-to-v9)                                         |

For framework construction and rendering, load the installed package's `getting-started` skill with `intent load <package>#getting-started`, replacing `<package>` with the actual adapter package, such as `@tanstack/react-table`. For reactive reads or controlled wiring, load that package's `table-state` skill directly.

## Installed API discovery

Start at `node_modules/@tanstack/table-core/dist/index.d.ts` and follow exported declarations. Adapter declaration layouts and missing-API diagnosis are in [API discovery](../assets/tanstack-table-core/references/api-not-found.md); read it when the expected export or declaration path is absent.
