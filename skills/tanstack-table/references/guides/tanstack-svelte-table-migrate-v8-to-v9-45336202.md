# Migrate V8 To V9

<a id="source-tanstack-svelte-table-migrate-v8-to-v9"></a>

Published skill · `@tanstack/svelte-table@9.2.8`.

[Topic index](../framework-svelte.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Migrate V8 To V9](./tanstack-table-core-migrate-v8-to-v9-654ca275.md).

# Svelte v8-to-v9 migration checklist

Before starting, run `intent load @tanstack/table-core#migrate-v8-to-v9`. Audit its entire shared checklist and read the detailed core mappings for APIs present in the application. This checklist adds the Svelte-specific changes.

Framework prerequisite: Svelte 5 (`svelte ^5.0.0`); migrate Svelte 3/4 components before Table.

## Adapter audit

- [ ] Upgrade to Svelte 5 and replace old writable-store table setup with runes/getters.
- [ ] Replace `createSvelteTable` with `createTable`; preserve changing data and controlled slices through getters.
- [ ] Configure explicit features/row-model slots and complete the shared core checklist.
- [ ] Remove creation selectors, selected `table.state`, `subscribeTable`, and `SubscribeSource` from earlier v9 code.
- [ ] Update `SvelteTable` to two generic parameters and `AppSvelteTable` to five; remove selected-state generics from `useTableContext`.
- [ ] Read atoms/store in templates or tracked runes. Use per-slice updater callbacks, `createTableState`, or external Svelte Store atoms instead of global `onStateChange`.
- [ ] Render with `FlexRender`, `renderComponent`, or `renderSnippet`. Use the shipped rune-aware `createTableHook` only for repeated conventions.

## Load the affected details

When the audit finds old Svelte construction, state, rendering, or app-hook code, read [adapter migration details](../assets/tanstack-svelte-table-migrate-v8-to-v9/references/adapter-migration.md) before editing it. For a replacement render scaffold, read [getting started](./tanstack-svelte-table-getting-started-0192405f.md#source-tanstack-svelte-table-getting-started). For controlled or stale state after migration, read [table state](./tanstack-svelte-table-table-state-fe47e547.md#source-tanstack-svelte-table-table-state).

Shared pinning, sizing, sorting, selection, prototype-method, type, and registry changes stay in the core migration references. Renaming `createSvelteTable` alone does not complete the migration.

## Verify the migration

- [ ] Type-check against the installed v9 adapter and exercise every enabled client/manual feature flow.
- [ ] Verify external state writes, reactive data replacement, and the framework rendering paths changed above.
- [ ] Complete the core checklist, including layout and selection behavior when those features are used.
- [ ] Replace temporary `stockFeatures` when the target is explicit feature tree-shaking.

## API discovery

Inspect `node_modules/@tanstack/svelte-table/dist/index.d.ts` and the exported adapter declarations. Use `node_modules/@tanstack/table-core/dist/index.d.ts` for shared APIs.
