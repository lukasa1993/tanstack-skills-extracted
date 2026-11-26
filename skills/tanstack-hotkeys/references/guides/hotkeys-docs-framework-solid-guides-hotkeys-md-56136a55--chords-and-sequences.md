# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Chords and sequences

A hotkey is either a chord or a sequence:

- **Chord.** Keys pressed together (such as `'Mod+S'`) or a single key (such as `'Escape'`).
- **Sequence.** Chords pressed one after another (such as `['G', 'H']`), written as an array.

```tsx
createHotkey('Mod+K', () => openSearch()) // Mod and K together
createHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every primitive and option in this guide accepts both kinds. See [Sequences](./hotkeys-docs-framework-solid-guides-sequences-md-ea3dff4a.md#source-hotkeys-docs-framework-solid-guides-sequences-md) for sequence rules such as timeouts and overlapping prefixes.
