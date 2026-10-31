# Sensible Defaults — Hotkeys that can't fire leave the key alone

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Hotkeys that can't fire leave the key alone

A hotkey that can't fire, because it's disabled or its scope is inactive or suspended, doesn't call `preventDefault`, so the browser acts on the key. Pressing `Mod+S` while a save hotkey is disabled opens the browser's Save Page dialog.

For most hotkeys, keeping the browser's action prevented is better, and we recommend `preventDefault: 'always'`. With it, a chord that can't fire still calls `preventDefault` when its keys are pressed:

- It never stops propagation, so other listeners still receive the key.
- It still skips typing in text fields when `ignoreInputs` does.
- When another hotkey handles the key, that hotkey's options apply instead.
- Sequences treat `'always'` as `true`.

To use it for every hotkey, set it in your adapter's shared defaults, as shown in [Changing the defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#changing-the-defaults).

It isn't the default because turning a hotkey off is often how an app hands a key back to the browser. With `'always'`, these hotkeys keep blocking the browser while they're off:

- **Editing and clipboard shortcuts.** A grid that enables `Mod+C`, `Mod+A`, or `Mod+Z` only while cells are selected blocks native copy, select all, and undo the rest of the time. `Mod` chords fire in text fields by default, so this includes undo while typing.
- **Single keys behind an [off switch](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#single-key-shortcuts-need-an-off-switch).** When a user turns off single-key shortcuts, `Space` and the arrow keys still don't scroll, and `/` still doesn't open Firefox's quick find.
- **Focus and native dialogs.** A disabled `Tab` hotkey keeps focus from moving off buttons and links, and a disabled `Escape` hotkey stops a native `<dialog>` from closing.

If you set `'always'` in shared defaults, set `preventDefault: true` on hotkeys like these, so the browser takes over while they're off.
