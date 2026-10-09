# Migrate V8 To V9

<a id="source-tanstack-lit-table-migrate-v8-to-v9"></a>

Published skill · `@tanstack/lit-table@9.2.8`.

[Topic index](../framework-lit.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Migrate V8 To V9](./tanstack-table-core-migrate-v8-to-v9-654ca275.md).

Load `intent load @tanstack/table-core#migrate-v8-to-v9` first and audit its entire shared checklist. It owns feature registration, row-model slots, state/reset changes, prototype methods, logical pinning, sizing/resizing, sorting, selection, helpers, and TypeScript mappings.

## Framework prerequisites

Lit 3.1.3 or newer within v3 (`lit ^3.1.3`) and `@lit/context ^1.1.0` are required.

## Lit migration checklist

- [ ] Construct one `TableController<typeof features, TData>(this)` as a stable host field.
- [ ] Replace the v8 `controller.table` property/options thunk with `controller.table(options, selector?)` during render.
- [ ] Read selected `table.state` for rendering; use atom snapshots in handlers or stable `table.subscribe` selectors for template regions.
- [ ] Feed resolved controlled callbacks back through reactive Lit properties, or use stable external atoms.
- [ ] Switch render helpers to `FlexRender({ cell })`, `FlexRender({ header })`, or `FlexRender({ footer })` and preserve instance-method receivers.
- [ ] If app conventions repeat, construct a host-bound `useAppTable` once and call its `.table()` during render.

## Apply the affected mappings

Read [adapter-migration](../assets/tanstack-lit-table-migrate-v8-to-v9/references/adapter-migration.md) when changing construction, rendering, state, or app hooks. Read the relevant core migration references for each affected shared API; this adapter checklist does not replace that audit.

For complete v9 construction examples, read [getting-started](./tanstack-lit-table-getting-started-592e9498.md#source-tanstack-lit-table-getting-started). For reactive state repairs, read [table-state](./tanstack-lit-table-table-state-2569e6f4.md#source-tanstack-lit-table-table-state).

## Final checks

- [ ] All shared core migration checks and affected mappings have been applied.
- [ ] The framework checklist above passes with the current adapter declarations.
- [ ] Model inputs remain stable and state changes reach their reactive owner.

## API discovery

This section is an exact duplicate. Read [API discovery in Getting Started](./tanstack-lit-table-getting-started-592e9498.md).
