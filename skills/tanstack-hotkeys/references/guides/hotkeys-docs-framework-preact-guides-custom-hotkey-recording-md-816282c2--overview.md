# Custom Hotkey Recording — Overview

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-custom-hotkey-recording-md-816282c2.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

`useHotkeyRecorder` lets users customize a shortcut by pressing the keys directly, just like IDE or operating system settings panels. You only need it when users can rebind shortcuts. Pair it with [App Hotkeys](./hotkeys-docs-framework-preact-guides-app-hotkeys-md-426d55b2.md#source-hotkeys-docs-framework-preact-guides-app-hotkeys-md) to validate, persist, and list customized bindings app-wide.

While any recorder is listening, registered hotkeys pause automatically so pressing `Mod+S` to record it doesn't also trigger Save.
