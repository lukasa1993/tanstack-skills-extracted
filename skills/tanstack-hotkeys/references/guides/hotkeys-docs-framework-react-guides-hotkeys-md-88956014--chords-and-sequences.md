# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Chords and sequences

A hotkey is one of two kinds:

- A **chord** is keys pressed together, such as `'Mod+S'`, or a single key, such as `'Escape'`.
- A **sequence** is chords pressed one after another, such as `['G', 'H']`. Write it as an array of chords.

```tsx
useHotkey('Mod+K', () => openSearch()) // Mod and K together
useHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every hook and option in this guide accepts both kinds, and most examples use chords. [Sequences](./hotkeys-docs-framework-react-guides-sequences-md-00eadae7.md#source-hotkeys-docs-framework-react-guides-sequences-md) covers how sequences match, the time allowed between steps, and sequences that start with the same chord.
