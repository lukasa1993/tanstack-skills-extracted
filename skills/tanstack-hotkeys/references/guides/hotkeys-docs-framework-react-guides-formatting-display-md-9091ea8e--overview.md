# Formatting Display — Overview

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md) · Release-matched documentation · `@tanstack/hotkeys@0.24.0`.

> [!NOTE]
> Showing hotkey labels on the page is one of the few parts of TanStack Hotkeys that needs extra care in server-rendered apps. The server doesn't know the user's operating system, so a label it renders can differ from the label the browser renders, which causes a hydration error. The library has helpers that prevent this. See [Format labels in server-rendered apps](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md#format-labels-in-server-rendered-apps).

Use `formatForDisplay` whenever a hotkey appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. It accepts chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. Pick the API by where your labels render:

| Where labels render | Use |
| --- | --- |
| Only in the browser, such as a Vite single-page app | `formatForDisplay(hotkey)` |
| On the server, then hydrated | `useFormatForDisplay()`, with the provider's `platform` set from the request. See [Format labels in server-rendered apps](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md#format-labels-in-server-rendered-apps) |
| In a static or prerendered page | `formatForDisplay` inside a client-only wrapper. See [Static and prerendered pages](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md#static-and-prerendered-pages) |
| Anywhere, for a platform you already know | `formatForDisplay(hotkey, { platform })` |
