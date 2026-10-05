# Getting Started

<a id="source-tanstack-angular-table-getting-started"></a>

Published skill · `@tanstack/angular-table@9.2.6`.

[Topic index](../framework-angular.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).

Load `intent load @tanstack/table-core#core` first for the headless model, stable inputs, and column inference.

## Setup

```ts
import { Component, signal } from '@angular/core'
import { FlexRender, injectTable, tableFeatures } from '@tanstack/angular-table'

type Person = { name: string; age: number }
const features = tableFeatures({})
const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
]

@Component({
  selector: 'app-table',
  imports: [FlexRender],
  template: `<table>
    <tbody>
      @for (row of table.getRowModel().rows; track row.id) {
        <tr>
          @for (cell of row.getAllCells(); track cell.id) {
            <td>
              <ng-container *flexRenderCell="cell; let value">{{
                value
              }}</ng-container>
            </td>
          }
        </tr>
      }
    </tbody>
  </table>`,
})
export class TableComponent {
  readonly data = signal<Person[]>([{ name: 'Ada', age: 36 }])
  readonly table = injectTable(() => ({ features, columns, data: this.data() }))
}
```

## Construction and rendering

Call `injectTable` in a component, directive, or service field initializer, or another valid Angular injection context. The adapter binds its cleanup to that context.

Signals read in the options initializer rerun it and call `setOptions`. Keep features, factories, and columns outside the initializer; return stable data references and derive transformed data with `computed` outside it.

Import `FlexRender` for `*flexRender`, `*flexRenderCell`, `*flexRenderHeader`, and `*flexRenderFooter`. Render values can be primitives, `TemplateRef`, component types, or `flexRenderComponent(...)`. Use `flexRenderComponent` for Angular component types; ordinary render functions are already supported directly.

## Read for the task

- When adding or configuring optional features, load `intent load @tanstack/table-core#table-features` and read only references for the requested behavior.
- For state ownership or reactive reads, read [table-state](./tanstack-angular-table-table-state-d17d401d.md#source-tanstack-angular-table-table-state).
- When tables share features, defaults, or reusable UI, read [create-table-hook](../assets/tanstack-angular-table-getting-started/references/create-table-hook.md).
- When Query supplies data or server processing, read [with-tanstack-query](../assets/tanstack-angular-table-getting-started/references/with-tanstack-query.md).
- When virtualizing rows or columns, read [with-tanstack-virtual](../assets/tanstack-angular-table-getting-started/references/with-tanstack-virtual.md).
- When upgrading v8 code, read [migrate-v8-to-v9](./tanstack-angular-table-migrate-v8-to-v9-0face369.md#source-tanstack-angular-table-migrate-v8-to-v9).

## API discovery

Inspect `node_modules/@tanstack/angular-table/dist/types/` for the bundled public declarations. Inspect feature APIs under `node_modules/@tanstack/table-core/dist/features/`.
