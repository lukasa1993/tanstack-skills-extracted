# Migrate V8 To V9

<a id="source-tanstack-solid-table-migrate-v8-to-v9"></a>

Published skill · `@tanstack/solid-table@9.2.7`.

[Topic index](../framework-solid.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Migrate V8 To V9](./tanstack-table-core-migrate-v8-to-v9-654ca275.md).

# Solid v8-to-v9 migration checklist

Before starting, run `intent load @tanstack/table-core#migrate-v8-to-v9`. Audit its entire shared checklist and read the detailed core mappings for APIs present in the application. This checklist adds the Solid-specific changes.

Framework prerequisite: Solid 1.3 or newer (`solid-js >=1.3`).

## Adapter audit

- [ ] Replace `createSolidTable` with `createTable` in a Solid owner.
- [ ] Keep features and columns stable; preserve changing data and controlled state through getters.
- [ ] Configure explicit features/row-model slots and complete the shared core checklist.
- [ ] Replace `getState()` with narrow tracked atom reads, or intentional whole-store reads. Remove global `onStateChange`.
- [ ] Pair a controlled getter with its Solid setter, or supply a Solid Store atom. Handle both value and functional updater forms.
- [ ] Keep atom reads inside JSX, memos, or effects. Replace deprecated `table.Subscribe` wrappers with direct `table.atoms` reads. Component bodies are untracked.
- [ ] Replace function rendering with `FlexRender` components; adopt `tableOptions` and `createTableHook` only for repeated conventions.

## Load the affected details

When the audit finds old Solid construction, state, rendering, or app-hook code, read [adapter migration details](../assets/tanstack-solid-table-migrate-v8-to-v9/references/adapter-migration.md) before editing it. For a replacement render scaffold, read [getting started](./tanstack-solid-table-getting-started-c05fd401.md#source-tanstack-solid-table-getting-started). For controlled or stale state after migration, read [table state](./tanstack-solid-table-table-state-6d957041.md#source-tanstack-solid-table-table-state).

Shared pinning, sizing, sorting, selection, prototype-method, type, and registry changes stay in the core migration references. Renaming `createSolidTable` alone does not complete the migration.

## Verify the migration

- [ ] Type-check against the installed v9 adapter and exercise every enabled client/manual feature flow.
- [ ] Verify external state writes, reactive data replacement, and the framework rendering paths changed above.
- [ ] Complete the core checklist, including layout and selection behavior when those features are used.
- [ ] Replace temporary `stockFeatures` when the target is explicit feature tree-shaking.

## API discovery

Inspect `node_modules/@tanstack/solid-table/dist/index.d.ts` and the exported adapter declarations. Use `node_modules/@tanstack/table-core/dist/index.d.ts` for shared APIs.
