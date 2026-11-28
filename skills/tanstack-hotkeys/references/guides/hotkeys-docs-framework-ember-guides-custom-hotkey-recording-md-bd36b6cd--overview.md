# Custom Hotkey Recording — Overview

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md-bd36b6cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

`useHotkeyRecorder` lets users choose a hotkey by pressing it, as shortcut editors in system settings and IDEs do. Use it only when users can change the app's hotkeys. To save their choices and list them in a cheat sheet, pair it with [app hotkeys](./hotkeys-docs-framework-ember-guides-app-hotkeys-md-c66d9482.md#source-hotkeys-docs-framework-ember-guides-app-hotkeys-md).

While any recorder is listening, registered hotkeys don't fire, so pressing `Mod+S` to record it doesn't also save. The app doesn't need to disable them.
