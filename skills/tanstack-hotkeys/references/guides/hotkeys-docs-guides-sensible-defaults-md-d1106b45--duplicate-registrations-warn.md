# Sensible Defaults — Duplicate registrations warn

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Duplicate registrations warn

Registering two hotkeys with the same canonical binding, target, scope, and event type logs a console warning in development and runs both callbacks. Set `conflictBehavior` to `'error'` or `'allow'` to customize this.

Dev warnings check `process.env.NODE_ENV`, so bundlers strip them in production. If you load the library without a bundler (no `process` global), use `validateHotkey` or `assertValidHotkey` to validate strings, or set `conflictBehavior: 'error'`.
