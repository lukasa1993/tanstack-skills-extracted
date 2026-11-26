# Custom Hotkey Recording — Migrating from v0.9 and earlier

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Migrating from v0.9 and earlier

> [!NOTE]
> `scope.createHotkeyRecorder` was removed in `@tanstack/alpine-hotkeys` v0.10.0, so apps that don't record hotkeys don't ship the recorder. Call `createHotkeyRecorder(scope, options)` instead, or `$hotkeyRecorder(options)` after you install `hotkeyRecorderPlugin`.
