# Build Drizzle Adapter — Only if you are publishing this as a package

[Guide and prerequisites](./tanstack-ai-persistence-build-drizzle-adapter-5655a048.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## Only if you are publishing this as a package

Everything above assumes the file lives in the app. If instead you are shipping
a reusable `drizzle` adapter to npm, the same store bodies apply, plus:

- **Peer deps** `@tanstack/ai`, `@tanstack/ai-persistence`, `drizzle-orm >=0.44.0`;
  dev dep `drizzle-kit`. Keep the module root free of Node built-ins so it is
  edge-safe, and put any `node:sqlite` convenience factory behind a `/sqlite`
  subpath.
- **Type `db` structurally** so a consumer's client is assignable:
  `Pick<BaseSQLiteDatabase<'sync' | 'async', unknown>, 'select' | 'insert' | 'update' | 'delete'>`.
- **Multi-dialect**: take a `provider: 'sqlite' | 'pg'` option, declare
  overloads so `db` and `schema` must agree, and add a runtime dialect check so
  a mismatched pair fails at construction rather than on first query.
- **BYO schema**: accept `drizzlePersistence(db, { schema })`, validate the
  tables/columns exist at construction, and pin the required column shapes with
  a compile-time contract type.
- **Never bundle SQL migrations or a runner.** Either re-export the stock tables
  from a `/sqlite-schema` subpath so the consumer's `drizzle-kit` picks them up,
  or emit an owned starter schema file with a small CLI. An opt-in
  `ensureTables(db)` issuing `CREATE TABLE IF NOT EXISTS` is fine for local dev,
  kept clearly separate from their journal. Pick one DDL owner per database.
- Run `runPersistenceConformance` once per dialect.
