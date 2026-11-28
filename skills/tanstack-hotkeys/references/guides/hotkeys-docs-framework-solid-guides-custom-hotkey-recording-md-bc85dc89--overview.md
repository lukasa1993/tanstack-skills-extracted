# Custom Hotkey Recording — Overview

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md-bc85dc89.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

`createHotkeyRecorder` lets users customize a shortcut by pressing the keys directly, as shortcut editors in system settings and IDEs do. It's needed only when users can rebind shortcuts. Pair it with [App Hotkeys](./hotkeys-docs-framework-solid-guides-app-hotkeys-md-acd9069d.md#source-hotkeys-docs-framework-solid-guides-app-hotkeys-md) to validate, persist, and list customized bindings app-wide.

While any recorder is listening, registered hotkeys pause automatically so pressing `Mod+S` to record it doesn't also trigger Save.
