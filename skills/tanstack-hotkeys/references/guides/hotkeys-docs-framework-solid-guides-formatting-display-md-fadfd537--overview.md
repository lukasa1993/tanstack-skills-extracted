# Formatting Display — Overview

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-formatting-display-md-fadfd537.md) · Release-matched documentation · `@tanstack/hotkeys@0.26.0`.

> [!WARNING]
> **Server rendering? Don't render labels with `formatForDisplay`.** It doesn't read the provider's `platform`, so without a `platform` option it renders Linux labels on the server, such as `Ctrl+S`. Solid keeps the server's text when it hydrates, so Mac users keep `Ctrl+S`, and Solid doesn't warn. Use `createFormatForDisplay()` instead, and set the provider's `platform` from the request. See [Format labels in server-rendered apps](./hotkeys-docs-framework-solid-guides-formatting-display-md-fadfd537.md#format-labels-in-server-rendered-apps).

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `formatForDisplay` accepts chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. Pick the API by where your labels render:

| Where labels render | Use |
| --- | --- |
| Only in the browser, such as a Vite single-page app | `formatForDisplay(hotkey)` |
| On the server, then hydrated | `createFormatForDisplay()`, with the provider's `platform` set from the request. See [Format labels in server-rendered apps](./hotkeys-docs-framework-solid-guides-formatting-display-md-fadfd537.md#format-labels-in-server-rendered-apps) |
| In a static or prerendered page | `formatForDisplay` inside a client-only wrapper. See [Static and prerendered pages](./hotkeys-docs-framework-solid-guides-formatting-display-md-fadfd537.md#static-and-prerendered-pages) |
| Anywhere, for a platform you already know | `formatForDisplay(hotkey, { platform })` |
