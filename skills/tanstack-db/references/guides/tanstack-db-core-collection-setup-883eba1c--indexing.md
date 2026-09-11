# Collection Setup — Indexing

[Guide and prerequisites](./tanstack-db-core-collection-setup-883eba1c.md) · Published skill · `@tanstack/db@0.9.0`.

## Indexing

Indexing is opt-in. The `autoIndex` option defaults to `"off"`. To enable automatic indexing, set `autoIndex: "eager"` and provide a `defaultIndexType`:

```ts
import { BasicIndex } from '@tanstack/db'

createCollection(
  queryCollectionOptions({
    autoIndex: 'eager',
    defaultIndexType: BasicIndex,
    // ...
  }),
)
```

Without `defaultIndexType`, setting `autoIndex: "eager"` throws a `CollectionConfigurationError`. You can also create indexes manually with `collection.createIndex()` and remove them with `collection.removeIndex()`.
