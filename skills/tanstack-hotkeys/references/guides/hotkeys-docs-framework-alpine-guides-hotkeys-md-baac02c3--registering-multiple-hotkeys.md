# Hotkeys — Registering multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.12.0`.

## Registering multiple hotkeys

Use `createHotkeys` to register a dynamic list. Per-definition options override common options. Removing an entry unregisters it. Each entry has the shared [AlpineHotkeyDefinition](https://github.com/TanStack/hotkeys/blob/72f5d4ce8e7a0f1c9593a614fc3482dd0c3da393/docs/framework/alpine/reference/type-aliases/AlpineHotkeyDefinition.md) shape.

```ts
this.scope.createHotkeys(
	() => this.shortcuts,
	() => ({ enabled: this.enabled }),
)
```

```ts
import type { AlpineHotkeyDefinition } from '@tanstack/alpine-hotkeys'

const shortcuts: Array<AlpineHotkeyDefinition> = [
	{ hotkey: 'Mod+S', callback: () => console.log('Save') },
	{ hotkey: 'Mod+Z', callback: () => console.log('Undo'), options: { enabled: false } },
]
```

Derive the definitions from reactive application state. Pass an empty array when no shortcuts should be registered.

The adapter identifies entries by array index, normalized binding, and target. Changing identity replaces the registration; unchanged identities retain their handle and receive updated callbacks and options. Reordering entries can replace registrations.
