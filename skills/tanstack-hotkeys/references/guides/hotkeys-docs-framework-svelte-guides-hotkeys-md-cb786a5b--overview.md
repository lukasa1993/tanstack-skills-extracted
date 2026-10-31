# Hotkeys — Overview

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

`createHotkey` registers a keyboard shortcut while the component that calls it is mounted, and `createHotkeys` registers several. For hotkeys that belong to one element, `createHotkeyAttachment` and `createHotkeysAttachment` do the same through `{@attach}`. All four take the same hotkeys and options. To register hotkeys outside Svelte components, use the [hotkey manager](./hotkeys-docs-framework-svelte-guides-hotkey-manager-md-b315025c.md#source-hotkeys-docs-framework-svelte-guides-hotkey-manager-md).
