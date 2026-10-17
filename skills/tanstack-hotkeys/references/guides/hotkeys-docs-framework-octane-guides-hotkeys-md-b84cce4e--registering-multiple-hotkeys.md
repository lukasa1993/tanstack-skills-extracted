# Hotkeys — Registering multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## Registering multiple hotkeys

Use `useHotkeys` to register a dynamic list. Per-definition options override common options. Removing an entry unregisters it. Each entry has the shared [UseHotkeyDefinition](https://github.com/TanStack/hotkeys/blob/2a5a38a89a05794de7b8bd85c7c57b6607f7e5e5/docs/framework/octane/reference/type-aliases/UseHotkeyDefinition.md) shape.

```tsx
useHotkeys(
	shortcuts,
	{ enabled },
)
```

```ts
import type { UseHotkeyDefinition } from '@tanstack/octane-hotkeys'

const shortcuts: Array<UseHotkeyDefinition> = [
	{ hotkey: 'Mod+S', callback: () => console.log('Save') },
	{ hotkey: 'Mod+Z', callback: () => console.log('Undo'), options: { enabled: false } },
]
```

Derive the definitions from reactive application state. Pass an empty array when no shortcuts should be registered.

The adapter identifies entries by array index, normalized binding, and target. Changing identity replaces the registration; unchanged identities retain their handle and receive updated callbacks and options. Reordering entries can replace registrations.
