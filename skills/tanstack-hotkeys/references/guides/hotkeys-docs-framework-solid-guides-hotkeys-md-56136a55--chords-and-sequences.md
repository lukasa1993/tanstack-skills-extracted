# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## Chords and sequences

A hotkey is either a **chord**, keys pressed together such as `'Mod+S'`, or a **sequence**, chords pressed one after another such as `['G', 'G']`. Every API in this guide accepts both, and a one-step array such as `['Mod+S']` is the chord `'Mod+S'`.

```tsx
createHotkey('Mod+S', () => save()) // chord
createHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 }) // sequence
createHotkey('Escape', () => close(), { requireReset: true }) // chord-only option
```

Most options apply to both kinds. `requireReset` applies only to chords and `timeout` only to sequences, and TypeScript rejects options that don't match the hotkey. When the kind isn't known statically, such as a `Hotkey` loaded from settings, only the shared options are accepted. Defaults apply only to the kinds that support them. See the [Sequences Guide](./hotkeys-docs-framework-solid-guides-sequences-md-ea3dff4a.md#source-hotkeys-docs-framework-solid-guides-sequences-md) for timing and matching, and the [App Hotkeys Guide](./hotkeys-docs-framework-solid-guides-app-hotkeys-md-acd9069d.md#source-hotkeys-docs-framework-solid-guides-app-hotkeys-md) to declare hotkeys up front and let users customize them.
