# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Chords and sequences

A hotkey is either a chord or a sequence:

- **Chord.** Keys pressed together (such as `'Mod+S'`) or a single key (such as `'Escape'`).
- **Sequence.** Chords pressed one after another (such as `['G', 'H']`), written as an array.

```ts
createHotkey('Mod+K', () => openSearch()) // Mod and K together
createHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every function and option in this guide accepts both. See [Sequences](./hotkeys-docs-framework-svelte-guides-sequences-md-05bb86f7.md#source-hotkeys-docs-framework-svelte-guides-sequences-md) for sequence rules such as timeouts and overlapping prefixes.
