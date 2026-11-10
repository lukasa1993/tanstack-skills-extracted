# Formatting Display — Overview

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

> [!WARNING]
> **Server rendering? Don't render labels with `formatForDisplay`.** It doesn't read the scope's `platform`, so without a `platform` option it renders Linux labels on the server, such as `Ctrl+S`. When the app boots in the browser, Mac users see the label change to `⌘ S`. Use `useFormatForDisplay(scope)` instead, and set the scope's `platform` from the request. See [Format labels in server-rendered apps](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md#format-labels-in-server-rendered-apps).

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `formatForDisplay` accepts chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. Pick the API by where your labels render:

| Where labels render | Use |
| --- | --- |
| Only in the browser | `formatForDisplay(hotkey)` |
| On the server with FastBoot | `useFormatForDisplay(scope)`, with the scope's `platform` set from the request. See [Format labels in server-rendered apps](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md#format-labels-in-server-rendered-apps) |
| In a page prerendered with Prember | `formatForDisplay` in a block that skips FastBoot. See [Static and prerendered pages](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md#static-and-prerendered-pages) |
| Anywhere, for a platform you already know | `formatForDisplay(hotkey, { platform })` |
