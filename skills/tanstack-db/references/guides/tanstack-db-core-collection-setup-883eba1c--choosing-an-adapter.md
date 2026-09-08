# Collection Setup — Choosing an Adapter

[Guide and prerequisites](./tanstack-db-core-collection-setup-883eba1c.md) · Published skill · `@tanstack/db@0.8.7`.

## Choosing an Adapter

| Backend                          | Adapter                         | Package                             |
| -------------------------------- | ------------------------------- | ----------------------------------- |
| REST API / TanStack Query        | `queryCollectionOptions`        | `@tanstack/query-db-collection`     |
| ElectricSQL (real-time Postgres) | `electricCollectionOptions`     | `@tanstack/electric-db-collection`  |
| PowerSync (SQLite offline)       | `powerSyncCollectionOptions`    | `@tanstack/powersync-db-collection` |
| RxDB (reactive database)         | `rxdbCollectionOptions`         | `@tanstack/rxdb-db-collection`      |
| TrailBase (event streaming)      | `trailBaseCollectionOptions`    | `@tanstack/trailbase-db-collection` |
| No backend (UI state)            | `localOnlyCollectionOptions`    | `@tanstack/db`                      |
| Browser localStorage             | `localStorageCollectionOptions` | `@tanstack/db`                      |

If the user specifies a backend (e.g. Electric, PowerSync), use that adapter directly. Only use `localOnlyCollectionOptions` when there is no backend yet — the collection API is uniform, so swapping to a real adapter later only changes the options creator.
