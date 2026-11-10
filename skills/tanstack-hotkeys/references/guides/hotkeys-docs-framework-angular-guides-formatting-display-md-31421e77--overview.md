# Formatting Display — Overview

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

> [!WARNING]
> **Server rendering? Don't render labels with `formatForDisplay`.** It doesn't read the provider's `platform`, so without a `platform` option it renders Linux labels on the server, such as `Ctrl+S`. When Angular hydrates the component, Mac users see the label change to `⌘ S`. Use `injectFormatForDisplay()` instead, and set the provider's `platform` from the request. See [Format labels in server-rendered apps](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md#format-labels-in-server-rendered-apps).

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `formatForDisplay` accepts chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. Pick the API by where your labels render:

| Where labels render | Use |
| --- | --- |
| Only in the browser, such as an app without server rendering | `formatForDisplay(hotkey)` |
| On the server, then hydrated | `injectFormatForDisplay()`, with the provider's `platform` set from the request. See [Format labels in server-rendered apps](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md#format-labels-in-server-rendered-apps) |
| In a static or prerendered page | `formatForDisplay` in a block that renders only in the browser. See [Static and prerendered pages](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md#static-and-prerendered-pages) |
| Anywhere, for a platform you already know | `formatForDisplay(hotkey, { platform })` |
