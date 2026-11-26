# Hotkeys — Handle duplicate hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Handle duplicate hotkeys

Registering a hotkey that already exists on the same target, in the same scope, and for the same event type logs a warning in development, and both callbacks run. Set `conflictBehavior` to change that:

- `'warn'` (default) logs a warning in development and keeps both registrations.
- `'error'` throws an error.
- `'allow'` keeps both without a warning.

The comparison resolves modifiers first, so `Mod+S` and `Meta+S` are duplicates on macOS. Two sequences are duplicates when all their steps match. Sequences that only start with the same chord, such as `['G', 'H']` and `['G', 'S']`, are not duplicates.

The same hotkey in two different scopes is not a duplicate either. When both scopes are active, the scope with higher precedence handles overlapping chords and a sequence that completes in both. Sequences in both scopes still advance, so a dialog's `['G', 'G']` doesn't stop a page's `['G', 'I']`.
