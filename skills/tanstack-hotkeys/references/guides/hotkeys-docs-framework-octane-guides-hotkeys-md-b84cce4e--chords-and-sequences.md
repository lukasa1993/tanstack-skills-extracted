# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Chords and sequences

A hotkey is either a chord or a sequence:

- **Chord.** Keys pressed together (such as `'Mod+S'`) or a single key (such as `'Escape'`).
- **Sequence.** Chords pressed one after another (such as `['G', 'H']`), written as an array.

```tsx
useHotkey('Mod+K', () => openSearch()) // Mod and K together
useHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every hook and option in this guide accepts both. See [Sequences](./hotkeys-docs-framework-octane-guides-sequences-md-dc8f8bbf.md#source-hotkeys-docs-framework-octane-guides-sequences-md) for sequence rules such as timeouts and overlapping prefixes.
