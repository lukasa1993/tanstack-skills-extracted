# Devtools

<a id="source-tanstack-vue-table-devtools"></a>

Published skill · `@tanstack/vue-table-devtools@9.2.0`.

[Topic index](../framework-vue.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).
Prerequisite: [Devtools](./tanstack-table-devtools-c60d6343.md).

This skill builds on @tanstack/table-core#core and @tanstack/table-devtools#devtools.

## Setup

```vue
<script setup lang="ts">
import { useTable, tableFeatures } from '@tanstack/vue-table'
import { useTanStackTableDevtools } from '@tanstack/vue-table-devtools'

const table = useTable({
  key: 'users-table',
  features: tableFeatures({}),
  columns: [],
  data: [],
})

useTanStackTableDevtools(table)
</script>

<template><div>Users table registered</div></template>
```

Mount the Vue TanStackDevtools host once with `tableDevtoolsPlugin({})`, following `docs/devtools.md`.

## Hooks and Components

The hook accepts a table or ref-like table and tracks replacement. Keep that reactive wrapper intact rather than unwrapping once.

## Common Mistakes

### HIGH Ref unwrapped before registration

Wrong: read a ref once and register only that snapshot.

Correct: pass the ref/maybe-ref shape accepted by the hook.

The adapter watches the resolved table and cleans up when it changes.

Source: TanStack/table:packages/vue-table-devtools/src/useTanStackTableDevtools.ts

### HIGH Missing or duplicate key

Wrong: omit `key` or reuse a key across mounted tables.

Correct: use one descriptive stable key for each target.

The registry skips keyless tables and replaces duplicate targets.

Source: TanStack/table:packages/table-devtools/src/tableTarget.ts

### MEDIUM Development gate mistaken for broken plugin

Wrong: expect the default panel/plugin/hook in production.

Correct: keep normal Devtools development-only unless explicitly importing `/production`.

The package index selects no-op exports outside development.

Source: TanStack/table:packages/vue-table-devtools/src/index.ts

## API Discovery

Inspect `node_modules/@tanstack/vue-table-devtools/dist/index.d.ts` and `useTanStackTableDevtools.d.ts` for current ref handling.
