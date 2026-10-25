# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md) · Release-matched documentation · `@tanstack/hotkeys@0.18.0`.

## Chords and sequences

A hotkey is one of two kinds:

- A **chord** is keys pressed together, such as `'Mod+S'`, or a single key, such as `'Escape'`.
- A **sequence** is chords pressed one after another, such as `['G', 'H']`. Write it as an array of chords.

```ts
injectHotkey('Mod+K', () => this.openSearch()) // Mod and K together
injectHotkey(['G', 'H'], () => this.goHome()) // G, then H
```

Every function and option in this guide accepts both kinds, and most examples use chords. [Sequences](./hotkeys-docs-framework-angular-guides-sequences-md-58c19666.md#source-hotkeys-docs-framework-angular-guides-sequences-md) covers how sequences match, the time allowed between steps, and sequences that start with the same chord.
