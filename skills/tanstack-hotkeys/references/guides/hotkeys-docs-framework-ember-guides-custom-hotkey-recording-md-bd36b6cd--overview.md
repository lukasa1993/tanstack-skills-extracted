# Custom Hotkey Recording — Overview

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md-bd36b6cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

> [!IMPORTANT]
> `createHotkeysScope(...).useHotkeyRecorder` was removed in `@tanstack/ember-hotkeys` v0.9.0, so apps that set defaults but don't record hotkeys don't ship the recorder. Pass the scope as the third argument instead: `useHotkeyRecorder(this, options, this.hotkeys)`.

`useHotkeyRecorder` lets users choose a hotkey by pressing it, as shortcut editors in system settings and IDEs do. You only need it if users can change your app's hotkeys. To save their choices and list them in a cheat sheet, pair it with [app hotkeys](./hotkeys-docs-framework-ember-guides-app-hotkeys-md-c66d9482.md#source-hotkeys-docs-framework-ember-guides-app-hotkeys-md).

While any recorder is listening, registered hotkeys don't fire, so pressing `Mod+S` to record it doesn't also save. You don't need to disable them yourself.
