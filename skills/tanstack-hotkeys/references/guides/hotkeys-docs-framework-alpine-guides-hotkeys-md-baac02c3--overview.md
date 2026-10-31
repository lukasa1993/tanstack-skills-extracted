# Hotkeys — Overview

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

`createHotkey` registers a keyboard shortcut, and `createHotkeys` registers several. Call them on an owner from `createHotkeysScope`, and destroy the owner when the component is destroyed. Both functions take the same hotkeys and options. To register hotkeys outside Alpine components, use the [hotkey manager](./hotkeys-docs-framework-alpine-guides-hotkey-manager-md-37a873d6.md#source-hotkeys-docs-framework-alpine-guides-hotkey-manager-md).
