# Devtools Marketplace — Plugin ID Matching

[Guide and prerequisites](./tanstack-devtools-marketplace-8bf06759.md) · Published skill · `@tanstack/devtools@0.14.2`.

## Plugin ID Matching

When the marketplace checks if a plugin is already active, it uses `pluginId` for matching. The matching logic in `packages/devtools/src/tabs/marketplace/plugin-utils.ts` does:

1. If `pluginId` is set, checks whether any registered plugin's ID starts with or contains the `pluginId` (case-insensitive).
2. Otherwise falls back to matching on `packageName` and extracting keyword segments.

Set a custom `pluginId` when your plugin registers with an ID that differs from the default (lowercased package name with non-alphanumeric characters replaced by `-`). For example, `@tanstack/react-form-devtools` registers as `tanstack-form-4` at runtime, so the registry entry uses `pluginId: 'tanstack-form'` to match it.
