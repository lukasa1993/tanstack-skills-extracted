# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.12.0`.

## Chords and sequences

A hotkey is either a **chord**, keys pressed together such as `'Mod+S'`, or a **sequence**, chords pressed one after another such as `['G', 'G']`. Every API in this guide accepts both, and a one-step array such as `['Mod+S']` is the chord `'Mod+S'`.

```gts
{{useHotkey 'Mod+S' this.save}}
{{useHotkey (array 'G' 'G') this.scrollToTop timeout=500}}
{{useHotkey 'Escape' this.close requireReset=true}}
```

Most options apply to both kinds. `requireReset` applies only to chords and `timeout` only to sequences; an option that doesn't match the hotkey's kind is ignored. In JavaScript, `useHotkeys` definitions are typed by their hotkey, so TypeScript rejects mismatched options there. Defaults apply only to the kinds that support them. See the [Sequences Guide](./hotkeys-docs-framework-ember-guides-sequences-md-0637d856.md#source-hotkeys-docs-framework-ember-guides-sequences-md) for timing and matching, and the [App Hotkeys Guide](./hotkeys-docs-framework-ember-guides-app-hotkeys-md-c66d9482.md#source-hotkeys-docs-framework-ember-guides-app-hotkeys-md) to declare hotkeys up front and let users customize them.
