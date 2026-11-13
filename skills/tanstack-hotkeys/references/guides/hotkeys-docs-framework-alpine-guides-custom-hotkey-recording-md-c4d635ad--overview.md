# Custom Hotkey Recording — Overview

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

> [!IMPORTANT]
> `scope.createHotkeyRecorder` was removed in `@tanstack/alpine-hotkeys` v0.10.0, so apps that don't record hotkeys don't ship the recorder. Call `createHotkeyRecorder(scope, options)` instead, or `$hotkeyRecorder(options)` after you install `hotkeyRecorderPlugin`.

`createHotkeyRecorder` lets users choose a hotkey by pressing it, as shortcut editors in system settings and IDEs do. Pass it an owner from `createHotkeysScope`, which destroys the recorder with its other hotkeys. You only need it if users can change your app's hotkeys. To save their choices and list them in a cheat sheet, pair it with [app hotkeys](./hotkeys-docs-framework-alpine-guides-app-hotkeys-md-06d36fd9.md#source-hotkeys-docs-framework-alpine-guides-app-hotkeys-md).

While any recorder is listening, registered hotkeys don't fire, so pressing `Mod+S` to record it doesn't also save. You don't need to disable them yourself.
