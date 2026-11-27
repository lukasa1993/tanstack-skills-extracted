# Custom Hotkey Recording — Migrating from v0.8 and earlier

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md-bd36b6cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Migrating from v0.8 and earlier

> [!NOTE]
> `createHotkeysScope(...).useHotkeyRecorder` was removed in `@tanstack/ember-hotkeys` v0.9.0, so apps that set defaults but don't record hotkeys don't ship the recorder. Pass the scope as the third argument instead: `useHotkeyRecorder(this, options, this.hotkeys)`.
