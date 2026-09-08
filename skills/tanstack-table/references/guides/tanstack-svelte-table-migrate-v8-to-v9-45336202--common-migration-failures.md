# Migrate V8 To V9 — Common Migration Failures

[Guide and prerequisites](./tanstack-svelte-table-migrate-v8-to-v9-45336202.md) · Published skill · `@tanstack/svelte-table@9.2.4`.

## Common Migration Failures

### CRITICAL: Running v9 on Svelte 3/4

Upgrade to Svelte 5 first. Writable-store-era table setup is not a supported v9 adapter contract.

### HIGH: Moving the feature but not its row model

Register both the feature and its `create*RowModel()` slot. Leaving `get*RowModel` on table options silently leaves the v9 processing pipeline incomplete.

### HIGH: Snapshotting a rune value

Use `get data() { return data }`; a one-time `data` snapshot does not remain reactive.

### HIGH: Keeping removed Svelte selectors

Remove second arguments from `createTable` and `createAppTable`, replace selected `table.state` reads with `table.atoms.<slice>.get()` or `table.store.get()`, and remove `subscribeTable`, `SubscribeSource`, and selected-state generic parameters. V9 intentionally has no compatibility layer for these APIs.

### HIGH: Destructuring instance methods

Keep calls bound to row/cell/column/header instances; shallow copies do not contain prototype methods.
