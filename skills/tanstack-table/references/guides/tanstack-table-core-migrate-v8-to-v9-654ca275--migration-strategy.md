# Migrate V8 To V9 — Migration strategy

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Migration strategy

1. Make the v8 table pass its existing tests before changing it.
2. Migrate construction and features while preserving behavior.
3. Let TypeScript expose missing features and stale names.
4. Migrate state ownership and rendering through the adapter skill.
5. Test every enabled client/server row-model stage and interaction.
6. Replace temporary `stockFeatures` usage with explicit features when practical.

Treat `useLegacyTable` as a deprecated, React-only emergency bridge. It bundles every feature, can exceed the v8 bundle, and must not become the target architecture. Import it only from `@tanstack/react-table/legacy` when an existing incremental migration requires it.
