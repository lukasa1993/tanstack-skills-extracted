# Formatting Display — Overview

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-formatting-display-md-6f8642f5.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `FormatForDisplayController` has a `format` function that formats chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. In the browser, the controller detects the platform. With Lit SSR, set the controller's `platform` from the request. See [Format labels in server-rendered apps](./hotkeys-docs-framework-lit-guides-formatting-display-md-6f8642f5.md#format-labels-in-server-rendered-apps).
