# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.12.0`.

## Chords and sequences

A hotkey is either a **chord**, keys pressed together such as `'Mod+S'`, or a **sequence**, chords pressed one after another such as `['G', 'G']`. Every API in this guide accepts both, and a one-step array such as `['Mod+S']` is the chord `'Mod+S'`.

```tsx
useHotkey('Mod+S', () => save()) // chord
useHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 }) // sequence
useHotkey('Escape', () => close(), { requireReset: true }) // chord-only option
```

Most options apply to both kinds. `requireReset` applies only to chords and `timeout` only to sequences, and TypeScript rejects options that don't match the hotkey. When the kind isn't known statically, such as a `Hotkey` loaded from settings, only the shared options are accepted. Defaults apply only to the kinds that support them. See the [Sequences Guide](./hotkeys-docs-framework-octane-guides-sequences-md-dc8f8bbf.md#source-hotkeys-docs-framework-octane-guides-sequences-md) for timing and matching, and the [App Hotkeys Guide](./hotkeys-docs-framework-octane-guides-app-hotkeys-md-ade4f49f.md#source-hotkeys-docs-framework-octane-guides-app-hotkeys-md) to declare hotkeys up front and let users customize them.
