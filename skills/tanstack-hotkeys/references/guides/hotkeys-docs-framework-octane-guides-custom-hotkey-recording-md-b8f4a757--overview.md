# Custom Hotkey Recording — Overview

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-custom-hotkey-recording-md-b8f4a757.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

`useHotkeyRecorder` lets users customize a shortcut by pressing the keys directly, just like IDE or operating system settings panels. You only need it when users can rebind shortcuts. Pair it with [App Hotkeys](./hotkeys-docs-framework-octane-guides-app-hotkeys-md-ade4f49f.md#source-hotkeys-docs-framework-octane-guides-app-hotkeys-md) to validate, persist, and list customized bindings app-wide.

While any recorder is listening, registered hotkeys pause automatically so pressing `Mod+S` to record it doesn't also trigger Save.
