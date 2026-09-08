# Devtools Marketplace — How Auto-Install Works

[Guide and prerequisites](./tanstack-devtools-marketplace-8bf06759.md) · Published skill · `@tanstack/devtools@0.14.2`.

## How Auto-Install Works

The auto-install pipeline lives in `packages/devtools-vite/src/inject-plugin.ts`. Understanding it clarifies why `pluginImport` matters:

1. **Package installation** -- The Vite plugin detects the project's package manager and runs the appropriate install command.
2. **File detection** -- It scans project files for imports from `@tanstack/react-devtools`, `@tanstack/solid-devtools`, `@tanstack/vue-devtools`, etc.
3. **AST transformation** -- It parses the file with oxc-parser, finds the `<TanStackDevtools />` JSX element, and modifies the `plugins` prop via MagicString.
4. **Import insertion** -- It adds `import { <importName> } from '<packageName>'` after the last existing import.
5. **Plugin injection** -- Based on `pluginImport.type`:
   - `'function'`: Appends `ImportName()` directly to the plugins array
   - `'jsx'`: Appends `{ name: '<title>', render: <ImportName /> }` to the plugins array

If `pluginImport` is missing, step 3-5 are skipped entirely. The package gets installed but the user must manually wire it into the `plugins` prop.
