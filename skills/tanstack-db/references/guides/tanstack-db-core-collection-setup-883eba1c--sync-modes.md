# Collection Setup — Sync Modes

[Guide and prerequisites](./tanstack-db-core-collection-setup-883eba1c.md) · Published skill · `@tanstack/db@0.8.7`.

## Sync Modes

```ts
queryCollectionOptions({
  syncMode: 'eager', // default — loads all data upfront
  // syncMode: "on-demand", // loads only what live queries request
  // syncMode: "progressive", // (Electric only) query subset first, full sync in background
})
```

| Mode          | Best for                                                       | Data size |
| ------------- | -------------------------------------------------------------- | --------- |
| `eager`       | Mostly-static datasets                                         | <10k rows |
| `on-demand`   | Search, catalogs, large tables                                 | >50k rows |
| `progressive` | Collaborative apps needing instant first paint (Electric only) | Any       |

Calling `collection.preload()` on an on-demand collection is a no-op. Create
the live query for the required subset and call `liveQuery.preload()` instead.

For Query Collection request cancellation, cleanup boundaries, and shared
`QueryClient` behavior, read
[the Query adapter reference](../assets/tanstack-db-core-collection-setup/references/query-adapter.md#request-cancellation-and-cleanup).
