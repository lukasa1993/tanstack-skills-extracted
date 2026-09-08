# Build Cloudflare Adapter — 1. Read the app before writing anything

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## 1. Read the app before writing anything

| Find                   | Where to look                                                                                    | What it decides                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| D1 binding name        | `wrangler.jsonc` `d1_databases[].binding`                                                        | `env.DB` vs `env.AI_STATE` in the factory         |
| How `env` reaches code | the Worker `fetch(request, env)`, or an async-local helper (`getDb()`, `getCloudflareContext()`) | Whether the factory takes `env` or reads a helper |
| Drizzle or raw D1      | `drizzle-orm` in `package.json`, a `src/db/schema.ts`                                            | Which recipe below to follow                      |
| Migrations dir         | `wrangler.jsonc` `migrations_dir`, default `migrations/`                                         | Where the new `.sql` file goes                    |
| Existing table names   | the current migrations / schema                                                                  | Prefix (`chat_*`) so nothing collides             |
