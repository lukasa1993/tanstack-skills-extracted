# Getting Started

<a id="source-tanstack-lit-table-getting-started"></a>

Published skill · `@tanstack/lit-table@9.2.6`.

[Topic index](../framework-lit.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).

Load `intent load @tanstack/table-core#core` first for the headless model, stable inputs, and column inference.

## Setup

```ts
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import {
  FlexRender,
  TableController,
  createColumnHelper,
  tableFeatures,
} from '@tanstack/lit-table'

type Person = { id: string; name: string }

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, Person>()
const columns = columnHelper.columns([
  columnHelper.accessor('name', { header: 'Name' }),
])

@customElement('people-table')
export class PeopleTable extends LitElement {
  @state() private people: Array<Person> = [{ id: '1', name: 'Ada' }]
  private tableController = new TableController<typeof features, Person>(this)

  protected render() {
    const table = this.tableController.table({
      features,
      columns,
      data: this.people,
      getRowId: (row) => row.id,
    })

    return html`<table>
      <thead>
        ${repeat(
          table.getHeaderGroups(),
          (group) => group.id,
          (group) =>
            html`<tr>
              ${repeat(
                group.headers,
                (header) => header.id,
                (header) =>
                  html`<th>
                    ${header.isPlaceholder ? null : FlexRender({ header })}
                  </th>`,
              )}
            </tr>`,
        )}
      </thead>
      <tbody>
        ${repeat(
          table.getRowModel().rows,
          (row) => row.id,
          (row) =>
            html`<tr>
              ${repeat(
                row.getAllCells(),
                (cell) => cell.id,
                (cell) => html`<td>${FlexRender({ cell })}</td>`,
              )}
            </tr>`,
        )}
      </tbody>
    </table>`
  }
}
```

## Construction and rendering

Keep one `TableController` as a host field. V9 takes only the host in its constructor; pass current options to `controller.table(...)` during every render. Recreating the controller repeats lifecycle and subscription work.

Keep features, columns, and data stable across host updates. Use `FlexRender({ cell })`, `FlexRender({ header })`, or `FlexRender({ footer })` in Lit templates. The application owns semantic markup, accessibility, widths, and sticky positioning.

The controller selects all registered state by default. Narrow selected state only when host update cost requires it; use [table-state](./tanstack-lit-table-table-state-2569e6f4.md#source-tanstack-lit-table-table-state) for selectors and template subscriptions.

## Read for the task

- When adding or configuring optional features, load `intent load @tanstack/table-core#table-features` and read only references for the requested behavior.
- For state ownership or reactive reads, read [table-state](./tanstack-lit-table-table-state-2569e6f4.md#source-tanstack-lit-table-table-state).
- When tables share features, defaults, or reusable UI, read [create-table-hook](../assets/tanstack-lit-table-getting-started/references/create-table-hook.md).
- When virtualizing rows or columns, read [with-tanstack-virtual](../assets/tanstack-lit-table-getting-started/references/with-tanstack-virtual.md).
- When upgrading v8 code, read [migrate-v8-to-v9](./tanstack-lit-table-migrate-v8-to-v9-f7e7e2fd.md#source-tanstack-lit-table-migrate-v8-to-v9).

## API discovery

Inspect `node_modules/@tanstack/lit-table/dist/index.d.ts`, then `TableController.d.ts`, `flexRender.d.ts`, or the relevant exported declaration. Core feature APIs are in `node_modules/@tanstack/table-core/dist/features/`.
