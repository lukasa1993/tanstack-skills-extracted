# Formatting Display — Overview

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `useFormatForDisplay` returns a function that formats chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it at render time. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. In the browser, `useFormatForDisplay` detects the platform. With FastBoot, set a scope's `platform` from the request. See [SSR & Hydration](./hotkeys-docs-framework-ember-guides-ssr-md-78704d49.md#source-hotkeys-docs-framework-ember-guides-ssr-md).
