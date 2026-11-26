# Sensible Defaults — Hotkeys that can't fire leave the key alone

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Hotkeys that can't fire leave the key alone

If a hotkey is disabled (`enabled: false`) or its scope is inactive or suspended, it doesn't call `preventDefault()`. That means pressing `Mod+S` while saving is disabled opens the browser's Save dialog.

For most shortcuts, setting `preventDefault: 'always'` in your shared defaults is better. With `'always'`, a disabled or suspended chord still prevents the browser's default action:

- It never stops propagation, so other listeners still see the key.
- It still respects `ignoreInputs` while typing in fields.
- If another active hotkey handles the key, that hotkey's options take over.
- Sequences treat `'always'` as `true`.

Don't use `'always'` on hotkeys you turn off specifically to hand keys back to the browser. Set `preventDefault: true` on those instead:

- **Clipboard and editing chords.** `Mod+C`, `Mod+A`, and `Mod+Z` enabled only while canvas cells are selected would block native copy and undo in text inputs if `'always'` were set.
- **Single-key shortcuts.** Shortcuts behind an accessibility off switch would keep blocking `Space`, arrow keys, or `/` when turned off.
- **`Tab` hotkeys.** Disabling them would still trap focus.
