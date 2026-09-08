# Build Cloudflare Adapter — wrangler bindings

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## wrangler bindings

```jsonc
{
  "d1_databases": [
    {
      "binding": "AI_STATE",
      "database_name": "tanstack-ai-state",
      "database_id": "<id>",
      "migrations_dir": "migrations",
    },
  ],
  "durable_objects": {
    "bindings": [{ "name": "AI_LOCKS", "class_name": "ChatLockDurableObject" }],
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["ChatLockDurableObject"] },
  ],
}
```

Durable Object locks do not use the D1 table migration set; their state is
configured through the migration tags above.
