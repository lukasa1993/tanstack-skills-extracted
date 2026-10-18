# Sensible Defaults — Duplicate registrations warn

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Duplicate registrations warn

Registering a hotkey that is already registered on the same target logs a console warning, and both callbacks run. A warning surfaces accidental duplicates during development without breaking an app that intentionally shares a shortcut. Duplicates are compared in canonical form, so `Mod+S` and `Meta+S` are duplicates on macOS.

Set `conflictBehavior` to `'replace'` to replace the existing registration, `'error'` to throw, or `'allow'` to silence the warning.
