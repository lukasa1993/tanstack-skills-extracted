# Custom Hotkey Recording — Overview

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md-3971f427.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

`createHotkeyRecorder` lets users customize a shortcut by pressing the keys directly, like the shortcut settings in an IDE or an operating system. It's only needed when users can rebind shortcuts. Pair it with [App Hotkeys](./hotkeys-docs-framework-svelte-guides-app-hotkeys-md-bdf9b10d.md#source-hotkeys-docs-framework-svelte-guides-app-hotkeys-md) to validate, persist, and list customized bindings app-wide.

While any recorder is listening, registered hotkeys pause automatically so pressing `Mod+S` to record it doesn't also trigger Save.
