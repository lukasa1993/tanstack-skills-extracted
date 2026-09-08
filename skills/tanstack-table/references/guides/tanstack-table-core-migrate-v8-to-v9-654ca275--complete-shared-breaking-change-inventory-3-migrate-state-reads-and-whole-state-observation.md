# Migrate V8 To V9 — Complete shared breaking-change inventory: 3. Migrate state reads and whole-state observation

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete shared breaking-change inventory: 3. Migrate state reads and whole-state observation


`table.getState()` and the top-level `onStateChange` option are removed. Individual `on[Slice]Change` callbacks remain.

| V8 need                         | V9 shared surface                                   |
| ------------------------------- | --------------------------------------------------- |
| Full current snapshot           | `table.store.state`                                 |
| One current slice               | `table.atoms.<slice>.get()`                         |
| Adapter-selected reactive state | `table.state` where the adapter exposes it          |
| Observe all changes             | `table.store.subscribe(...)`                        |
| Control one slice               | `state.<slice>` plus `on<Slice>Change`              |
| Externally own one slice        | `atoms.<slice>` with a writable TanStack Store atom |
| Internal state                  | omit both `state.<slice>` and `atoms.<slice>`       |

Load the adapter `table-state` skill before choosing reactive reads; adapters intentionally differ. When both an external atom and `state` provide a slice, the atom wins. Table writes go directly to that atom, and `table.reset()` does not reset externally owned atoms.
