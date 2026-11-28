# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Chords and sequences

A hotkey is either a chord or a sequence:

- **Chord.** Keys pressed together (such as `'Mod+S'`) or a single key (such as `'Escape'`).
- **Sequence.** Chords pressed one after another (such as `['G', 'H']`), written as an array.

```ts
injectHotkey('Mod+K', () => this.openSearch()) // Mod and K together
injectHotkey(['G', 'H'], () => this.goHome()) // G, then H
```

Every function and option in this guide accepts both. See [Sequences](./hotkeys-docs-framework-angular-guides-sequences-md-58c19666.md#source-hotkeys-docs-framework-angular-guides-sequences-md) for sequence rules such as timeouts and overlapping prefixes.
