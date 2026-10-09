# Migrate V8 To V9

<a id="source-tanstack-angular-table-migrate-v8-to-v9"></a>

Published skill · `@tanstack/angular-table@9.2.8`.

[Topic index](../framework-angular.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Migrate V8 To V9](./tanstack-table-core-migrate-v8-to-v9-654ca275.md).

Load `intent load @tanstack/table-core#migrate-v8-to-v9` first and audit its entire shared checklist. It owns feature registration, row-model slots, state/reset changes, prototype methods, logical pinning, sizing/resizing, sorting, selection, helpers, and TypeScript mappings.

## Framework prerequisites

Angular 19 or newer is required (`@angular/core >=19`).

## Angular migration checklist

- [ ] Replace `createAngularTable` with `injectTable` in a valid Angular injection context.
- [ ] Hoist features, columns, and factories outside the signal-tracked initializer.
- [ ] Read state through signal-backed atoms; wire controlled signals with value-or-updater callbacks or stable Angular Store atoms.
- [ ] Import current FlexRender directives, distinguish render functions from component types, and preserve instance-method receivers.
- [ ] Audit repeated options and component registries for the optional `createTableHook`/`injectAppTable` path.

## Apply the affected mappings

Read [adapter-migration](../assets/tanstack-angular-table-migrate-v8-to-v9/references/adapter-migration.md) when changing construction, rendering, state, or app hooks. Read the relevant core migration references for each affected shared API; this adapter checklist does not replace that audit.

For complete v9 construction examples, read [getting-started](./tanstack-angular-table-getting-started-b8ab31c4.md#source-tanstack-angular-table-getting-started). For reactive state repairs, read [table-state](./tanstack-angular-table-table-state-d17d401d.md#source-tanstack-angular-table-table-state).

## Final checks

- [ ] All shared core migration checks and affected mappings have been applied.
- [ ] The framework checklist above passes with the current adapter declarations.
- [ ] Model inputs remain stable and state changes reach their reactive owner.

## API discovery

This section is an exact duplicate. Read [API discovery in Getting Started](./tanstack-angular-table-getting-started-b8ab31c4.md).
