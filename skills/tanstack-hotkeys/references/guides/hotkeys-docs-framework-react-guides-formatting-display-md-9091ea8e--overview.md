# Formatting Display — Overview

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

Format hotkeys for display whenever they appear in buttons, menus, tooltips, cheat sheets, or settings screens. Store the raw hotkey string (such as `'Mod+S'`) and format it at render time. Labels are for humans, never for registering or storing.

`useFormatForDisplay` returns a formatter that adapts to the user's operating system (`⌘ S` on macOS, `Ctrl+S` elsewhere) and keyboard layout:

| Where labels render | Extra setup |
| --- | --- |
| Browser-only (Vite SPA, client apps) | None |
| Server-rendered then hydrated | Set `platform` on `HotkeysProvider` from the request ([SSR & Hydration](./hotkeys-docs-framework-react-guides-ssr-md-35086cce.md#source-hotkeys-docs-framework-react-guides-ssr-md)) |
| Static or prerendered pages | None, or wrap in a client-only component ([Static pages](./hotkeys-docs-framework-react-guides-ssr-md-35086cce.md#source-hotkeys-docs-framework-react-guides-ssr-md)) |
