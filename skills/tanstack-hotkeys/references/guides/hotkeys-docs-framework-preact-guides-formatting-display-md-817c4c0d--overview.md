# Formatting Display — Overview

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-formatting-display-md-817c4c0d.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

> [!WARNING]
> **Server rendering? Don't render labels with `formatForDisplay`.** It doesn't read the provider's `platform`, so without a `platform` option it renders Linux labels on the server, such as `Ctrl+S`. When Preact hydrates, Mac users see the label change to `⌘ S`, and a label in an attribute, such as a `title`, keeps `Ctrl+S`. Use `useFormatForDisplay()` instead, and set the provider's `platform` from the request. See [Format labels in server-rendered apps](./hotkeys-docs-framework-preact-guides-formatting-display-md-817c4c0d.md#format-labels-in-server-rendered-apps).

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `formatForDisplay` accepts chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. Pick the API by where your labels render:

| Where labels render | Use |
| --- | --- |
| Only in the browser, such as a Vite single-page app | `formatForDisplay(hotkey)` |
| On the server, then hydrated | `useFormatForDisplay()`, with the provider's `platform` set from the request. See [Format labels in server-rendered apps](./hotkeys-docs-framework-preact-guides-formatting-display-md-817c4c0d.md#format-labels-in-server-rendered-apps) |
| In a static or prerendered page | `formatForDisplay` inside a client-only wrapper. See [Static and prerendered pages](./hotkeys-docs-framework-preact-guides-formatting-display-md-817c4c0d.md#static-and-prerendered-pages) |
| Anywhere, for a platform you already know | `formatForDisplay(hotkey, { platform })` |
