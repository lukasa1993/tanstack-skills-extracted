# Hotkeys — Handle duplicate hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Handle duplicate hotkeys

Registering the same canonical binding on the same target, scope, and `eventType` logs a console warning in development and runs both callbacks. `Mod+S` and `Meta+S` are identical on macOS. Customize this with `conflictBehavior`:

- `'warn'` (default) logs a development warning and keeps both registrations
- `'error'` throws an error
- `'allow'` keeps both silently

Two sequences conflict only when all steps match, so `['G', 'H']` and `['G', 'S']` do not. Registrations in different [scopes](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) don't conflict either. When both are active, the [higher-precedence scope](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) wins for overlapping chords and for a sequence that completes in both. Sequences in both scopes still advance, so a dialog's `['G', 'G']` doesn't stop a page's `['G', 'I']`.
