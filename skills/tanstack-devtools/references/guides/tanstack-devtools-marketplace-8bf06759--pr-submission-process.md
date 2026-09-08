# Devtools Marketplace — PR Submission Process

[Guide and prerequisites](./tanstack-devtools-marketplace-8bf06759.md) · Published skill · `@tanstack/devtools@0.14.2`.

## PR Submission Process

1. **Publish your package to npm.** The marketplace links to npm for installation; the package must be publicly available.

2. **Fork and clone** the [TanStack/devtools](https://github.com/TanStack/devtools) repository.

3. **Edit `packages/devtools/src/tabs/plugin-registry.ts`.** Add your entry to the `PLUGIN_REGISTRY` object under the `THIRD-PARTY PLUGINS` comment section:

   ```ts
   // ==========================================
   // THIRD-PARTY PLUGINS - Examples
   // ==========================================
   // External contributors can add their plugins below!
   ```

4. **Open a PR** against the `main` branch. Title format: `feat(marketplace): add <your-plugin-name>`.

5. **The PR will be reviewed** by TanStack maintainers. Common review feedback:
   - Missing `pluginImport` -- reviewers will ask you to add it
   - Missing `framework` -- required for marketplace filtering
   - Missing `requires.minVersion` -- avoids runtime errors for users on older versions
   - Incorrect `importName` -- must match the exact named export from your package
