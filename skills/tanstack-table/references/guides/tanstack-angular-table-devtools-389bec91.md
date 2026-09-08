# Devtools

<a id="source-tanstack-angular-table-devtools"></a>

Published skill · `@tanstack/angular-table-devtools@9.2.4`.

[Topic index](../framework-angular.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).
Prerequisite: [Devtools](./tanstack-table-devtools-c60d6343.md).

This skill builds on @tanstack/table-core#core and @tanstack/table-devtools#devtools.

## Setup

```ts
import { Component } from '@angular/core'
import { injectTable, tableFeatures } from '@tanstack/angular-table'
import { injectTanStackTableDevtools } from '@tanstack/angular-table-devtools'

const features = tableFeatures({})
const columns = [{ accessorKey: 'id' }]
const data: Array<{ id: string }> = []

@Component({ selector: 'users-table', template: 'Users table registered' })
export class UsersTable {
  readonly table = injectTable(() => ({
    key: 'users-table',
    features,
    columns,
    data,
  }))

  constructor() {
    injectTanStackTableDevtools(() => ({ table: this.table }))
  }
}
```

Provide the Angular TanStack Devtools host once at application configuration level as documented in `docs/devtools.md`.

## Hooks and Components

The injector options function may return `table: undefined` or an `enabled` function to remove/disable registration reactively.

## Common Mistakes

### CRITICAL Injector called outside context

Wrong: call `injectTanStackTableDevtools` from an arbitrary callback after bootstrap.

Correct: call it in a component/service field initializer or constructor injection context.

The adapter uses Angular injection and effects for lifecycle cleanup.

Source: TanStack/table:packages/angular-table-devtools/src/injectTanStackTableDevtools.ts

### HIGH Missing table key

Wrong: register an otherwise valid table without `options.key`.

Correct: assign a stable unique key before injection registration.

Core registration logs an error and skips keyless targets.

Source: TanStack/table:packages/table-devtools/src/tableTarget.ts

### MEDIUM isDevMode no-op misunderstood

Wrong: expect default Angular exports to render production Devtools.

Correct: keep standard setup development-only; use `/production` only when explicitly requested.

The package index switches exports using Angular `isDevMode()`.

Source: TanStack/table:packages/angular-table-devtools/src/index.ts

## API Discovery

Inspect `node_modules/@tanstack/angular-table-devtools/dist/index.d.ts` and `injectTanStackTableDevtools.d.ts` for current injection options.
