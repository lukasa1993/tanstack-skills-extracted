# Sensible Defaults — Duplicate registrations warn

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Duplicate registrations warn

Registering a hotkey that is already registered on the same target logs a console warning in development, and both callbacks run. A warning surfaces accidental duplicates during development without breaking an app that intentionally shares a shortcut. Duplicates are compared in canonical form, so `Mod+S` and `Meta+S` are duplicates on macOS.

Set `conflictBehavior` to `'replace'` to replace the existing registration, `'error'` to throw, or `'allow'` to silence the warning.

TanStack Hotkeys logs warnings only in development, and it reads `process.env.NODE_ENV` to tell. A bundler's development build logs them. A production build, where the bundler sets `process.env.NODE_ENV` to `'production'`, skips them and drops the warning code.

A page that loads the library's files as published, with no bundler, has no `process` global. The library can't read `process.env.NODE_ENV` there, so it logs no warnings. There, check a hotkey with `validateHotkey`, which returns its problems, or `assertValidHotkey`, which throws for an invalid one. To find duplicates, set `conflictBehavior` to `'error'`, which throws in every build.
