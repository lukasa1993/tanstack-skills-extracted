# Formatting Display — Overview

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-formatting-display-md-505d4885.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

Format hotkeys for display whenever they appear in buttons, menus, tooltips, cheat sheets, or settings screens. Store the raw hotkey (such as `'Mod+S'`) and format it at render time. Labels are for humans, never for registering or storing.

`getFormatForDisplay` returns a formatter that adapts to the user's operating system (`⌘ S` on macOS, `Ctrl+S` elsewhere) and keyboard layout. It formats chord strings, physical chords such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences:

| Where labels render | Extra setup |
| --- | --- |
| Browser-only (Vite SPA, client apps) | None |
| Server-rendered then hydrated | Set `platform` on `HotkeysProvider` from the request ([SSR & Hydration](./hotkeys-docs-framework-svelte-guides-ssr-md-7ec58d3e.md#source-hotkeys-docs-framework-svelte-guides-ssr-md)) |
| Static or prerendered pages | None, or render only in the browser ([Static pages](./hotkeys-docs-framework-svelte-guides-ssr-md-7ec58d3e.md#source-hotkeys-docs-framework-svelte-guides-ssr-md)) |
