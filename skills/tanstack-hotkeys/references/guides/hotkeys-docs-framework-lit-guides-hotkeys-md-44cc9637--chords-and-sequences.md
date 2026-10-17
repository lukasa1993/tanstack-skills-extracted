# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## Chords and sequences

A hotkey is either a **chord**, keys pressed together such as `'Mod+S'`, or a **sequence**, chords pressed one after another such as `['G', 'G']`. Every API in this guide accepts both, and a one-step array such as `['Mod+S']` is the chord `'Mod+S'`.

```ts
@hotkey('Mod+S') // chord
save() {}

@hotkey(['G', 'G'], { timeout: 500 }) // sequence
scrollToTop() {}

@hotkey('Escape', { requireReset: true }) // chord-only option
close() {}
```

Most options apply to both kinds. `requireReset` applies only to chords and `timeout` only to sequences, and TypeScript rejects options that don't match the hotkey. When the kind isn't known statically, such as a `Hotkey` loaded from settings, only the shared options are accepted. Defaults apply only to the kinds that support them. See the [Sequences Guide](./hotkeys-docs-framework-lit-guides-sequences-md-8de222df.md#source-hotkeys-docs-framework-lit-guides-sequences-md) for timing and matching, and the [App Hotkeys Guide](./hotkeys-docs-framework-lit-guides-app-hotkeys-md-6d116aa2.md#source-hotkeys-docs-framework-lit-guides-app-hotkeys-md) to declare hotkeys up front and let users customize them.
