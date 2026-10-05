# Migrate V8 To V9

<a id="source-tanstack-react-table-migrate-v8-to-v9"></a>

Published skill · `@tanstack/react-table@9.2.6`.

[Topic index](../framework-react.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Migrate V8 To V9](./tanstack-table-core-migrate-v8-to-v9-654ca275.md).

# React v8-to-v9 migration checklist

Before starting, run `intent load @tanstack/table-core#migrate-v8-to-v9`. Audit its entire shared checklist and read the detailed core mappings for APIs present in the application. This checklist adds the React-specific changes.

Framework prerequisite: React 18 or newer (`react >=18`).

## Adapter audit

- [ ] Replace `useReactTable` with `useTable`; remove any temporary `useLegacyTable` from `@tanstack/react-table/legacy`.
- [ ] Keep model inputs stable and use explicit `tableFeatures` plus its row-model slots. Audit every shared change through the core checklist.
- [ ] Replace render reads with selected `table.state`, `table.Subscribe`, or `useSelector`. Atom/store snapshots alone do not subscribe React.
- [ ] Pair each controlled `state` slice with its updater callback, or supply a stable React Store atom. Remove the global `onStateChange` option.
- [ ] Check compiler-memoized children hiding builder-method reads; subscribe inside the child or pass the selected value to it.
- [ ] Use `table.FlexRender` or standalone `FlexRender` where appropriate; `flexRender` remains supported.
- [ ] Introduce `tableOptions` or `createTableHook` only for repeated conventions; preserve app wrapper and typed-context boundaries.

## Load the affected details

When the audit finds old React construction, state, rendering, or app-hook code, read [adapter migration details](../assets/tanstack-react-table-migrate-v8-to-v9/references/adapter-migration.md) before editing it. For a replacement render scaffold, read [getting started](./tanstack-react-table-getting-started-d10c472e.md#source-tanstack-react-table-getting-started). For controlled or stale state after migration, read [table state](./tanstack-react-table-table-state-6e56d1e0.md#source-tanstack-react-table-table-state).

Shared pinning, sizing, sorting, selection, prototype-method, type, and registry changes stay in the core migration references. Renaming `useReactTable` alone does not complete the migration.

## Verify the migration

- [ ] Type-check against the installed v9 adapter and exercise every enabled client/manual feature flow.
- [ ] Verify external state writes, reactive data replacement, and the framework rendering paths changed above.
- [ ] Complete the core checklist, including layout and selection behavior when those features are used.
- [ ] Replace temporary `stockFeatures` when the target is explicit feature tree-shaking and remove `useLegacyTable`.

## API discovery

Inspect `node_modules/@tanstack/react-table/dist/index.d.ts` and the exported adapter declarations. Use `node_modules/@tanstack/table-core/dist/index.d.ts` for shared APIs.
