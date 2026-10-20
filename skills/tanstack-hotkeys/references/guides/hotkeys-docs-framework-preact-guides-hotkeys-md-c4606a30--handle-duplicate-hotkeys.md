# Hotkeys — Handle duplicate hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Handle duplicate hotkeys

When you register a hotkey that is already registered on the same target and in the same scope, TanStack Hotkeys logs a warning, and both callbacks run. Set `conflictBehavior` to change that:

- `'warn'` (default) logs a warning and keeps both registrations.
- `'error'` throws an error.
- `'replace'` unregisters the existing registration.
- `'allow'` keeps both without a warning.

The comparison resolves modifiers first, so `Mod+S` and `Meta+S` are duplicates on macOS. Two sequences are duplicates when all their steps match. Sequences that only start with the same chord, such as `['G', 'H']` and `['G', 'S']`, are not duplicates.

The same hotkey in two different [scopes](./hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md-830bfdea.md#source-hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md) is not a duplicate either. When both scopes are active, the scope with higher precedence handles the key. See [Nested scopes win](./hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md-830bfdea.md#source-hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md).
