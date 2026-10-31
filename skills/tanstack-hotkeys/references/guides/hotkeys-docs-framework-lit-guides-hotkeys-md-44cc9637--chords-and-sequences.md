# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Chords and sequences

A hotkey is one of two kinds:

- A **chord** is keys pressed together, such as `'Mod+S'`, or a single key, such as `'Escape'`.
- A **sequence** is chords pressed one after another, such as `['G', 'H']`. Write it as an array of chords.

```ts
@hotkey('Mod+K') // Mod and K together
openSearch() {}

@hotkey(['G', 'H']) // G, then H
goHome() {}
```

Every decorator, controller, and option in this guide accepts both kinds, and most examples use chords. [Sequences](./hotkeys-docs-framework-lit-guides-sequences-md-8de222df.md#source-hotkeys-docs-framework-lit-guides-sequences-md) covers how sequences match, the time allowed between steps, and sequences that start with the same chord.
