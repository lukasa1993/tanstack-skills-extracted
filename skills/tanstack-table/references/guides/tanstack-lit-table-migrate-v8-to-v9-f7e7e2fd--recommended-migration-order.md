# Migrate V8 To V9 — Recommended Migration Order

[Guide and prerequisites](./tanstack-lit-table-migrate-v8-to-v9-f7e7e2fd.md) · Published skill · `@tanstack/lit-table@9.2.4`.

## Recommended Migration Order

1. Replace the v8 controller options thunk with a host-only typed `TableController`.
2. Pass current options to `controller.table(options, selector?)` in render.
3. Move features, row models, and registries into `tableFeatures`.
4. Update selected state, controlled ownership, and rendering.
5. Apply every shared API and type rename below.
6. Treat `stockFeatures` as a temporary audit bridge; explicit features are the production target.

```ts
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

class PeopleTable extends LitElement {
  private controller = new TableController<typeof features, Person>(this)

  protected render() {
    const table = this.controller.table({ features, columns, data: this.data })
    return html`<span>${table.getRowModel().rows.length} rows</span>`
  }
}
```
