# Formatting Display — Overview

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `useFormatForDisplay` returns a function that formats chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. `useFormatForDisplay` works wherever your labels render:

| Where labels render | What to set up |
| --- | --- |
| Only in the browser | Nothing |
| On the server with FastBoot | A scope's `platform`, set from the request. See [Format labels in server-rendered apps](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md#format-labels-in-server-rendered-apps) |
| In a page prerendered with Prember | Nothing, or a block that skips FastBoot. See [Static and prerendered pages](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md#static-and-prerendered-pages) |
