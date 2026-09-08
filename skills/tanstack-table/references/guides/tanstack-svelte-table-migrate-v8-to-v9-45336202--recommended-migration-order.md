# Migrate V8 To V9 — Recommended Migration Order

[Guide and prerequisites](./tanstack-svelte-table-migrate-v8-to-v9-45336202.md) · Published skill · `@tanstack/svelte-table@9.2.4`.

## Recommended Migration Order

1. Upgrade to Svelte 5 and replace v8 stores with runes/getters.
2. Rename `createSvelteTable` to `createTable`.
3. Define explicit `tableFeatures`, then move row models and registries into it.
4. Update state reads/ownership and rendering.
5. Apply every shared API and type rename below.
6. Use `stockFeatures` only as a temporary audit bridge; explicit features are the production target.

```ts
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

const table = createTable({
  features,
  columns,
  get data() {
    return data
  },
})
```
