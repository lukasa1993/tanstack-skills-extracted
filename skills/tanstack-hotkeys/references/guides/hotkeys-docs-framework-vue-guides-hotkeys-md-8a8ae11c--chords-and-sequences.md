# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Chords and sequences

A hotkey is either a chord or a sequence:

- **Chord.** Keys pressed together (such as `'Mod+S'`) or a single key (such as `'Escape'`).
- **Sequence.** Chords pressed one after another (such as `['G', 'H']`), written as an array.

```ts
useHotkey('Mod+K', () => openSearch()) // Mod and K together
useHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every function and option in this guide accepts both. See [Sequences](./hotkeys-docs-framework-vue-guides-sequences-md-9eb4426e.md#source-hotkeys-docs-framework-vue-guides-sequences-md) for sequence rules such as timeouts and overlapping prefixes.
