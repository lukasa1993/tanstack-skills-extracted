# Custom Hotkey Recording — Overview

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-custom-hotkey-recording-md-376391c6.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

`useHotkeyRecorder` lets users customize a shortcut by pressing the keys directly, just like IDE or operating system settings panels. You only need it when users can rebind shortcuts. Pair it with [App Hotkeys](./hotkeys-docs-framework-react-guides-app-hotkeys-md-211e92b7.md#source-hotkeys-docs-framework-react-guides-app-hotkeys-md) to validate, persist, and list customized bindings app-wide.

While any recorder is listening, registered hotkeys pause automatically so pressing `Mod+S` to record it doesn't also trigger Save.
