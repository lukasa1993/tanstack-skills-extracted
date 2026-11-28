# Formatting Display — Overview

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

Format hotkeys for display whenever they appear in buttons, menus, tooltips, cheat sheets, or settings screens. Store the raw hotkey (such as `'Mod+S'`) and format it at render time. Labels are for humans, never for registering or storing.

`injectFormatForDisplay` returns a formatter that adapts to the user's operating system (`⌘ S` on macOS, `Ctrl+S` elsewhere) and keyboard layout. It formats chord strings, physical chords such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences:

| Where labels render | Extra setup |
| --- | --- |
| Browser-only (client apps without server rendering) | None |
| Server-rendered then hydrated | Set `platform` in `provideHotkeys` from the request ([SSR & Hydration](./hotkeys-docs-framework-angular-guides-ssr-md-05bcc1b5.md#source-hotkeys-docs-framework-angular-guides-ssr-md)) |
| Static or prerendered pages | Nothing, or a block that renders only in the browser ([Static pages](./hotkeys-docs-framework-angular-guides-ssr-md-05bcc1b5.md#source-hotkeys-docs-framework-angular-guides-ssr-md)) |
