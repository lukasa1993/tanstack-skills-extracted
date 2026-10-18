# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Chords and sequences

A hotkey is one of two kinds:

- A **chord** is keys pressed together, such as `'Mod+S'`, or a single key, such as `'Escape'`.
- A **sequence** is chords pressed one after another, such as `['G', 'H']`. Write it as an array of chords.

```ts
useHotkey('Mod+K', () => openSearch()) // Mod and K together
useHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every composable and option in this guide accepts both kinds, and most examples use chords. [Sequences](./hotkeys-docs-framework-vue-guides-sequences-md-9eb4426e.md#source-hotkeys-docs-framework-vue-guides-sequences-md) covers how sequences match, the time allowed between steps, and sequences that start with the same chord.
