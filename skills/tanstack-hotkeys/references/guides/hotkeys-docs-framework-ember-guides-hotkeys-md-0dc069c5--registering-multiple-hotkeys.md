# Hotkeys — Registering multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.12.0`.

## Registering multiple hotkeys

Use `useHotkeys` to register a dynamic list. Per-definition options override common options. Removing an entry unregisters it. Each entry has the shared [EmberHotkeyDefinition](https://github.com/TanStack/hotkeys/blob/72f5d4ce8e7a0f1c9593a614fc3482dd0c3da393/docs/framework/ember/reference/type-aliases/EmberHotkeyDefinition.md) shape.

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { useHotkeys } from '@tanstack/ember-hotkeys'
import type { EmberHotkeyDefinition } from '@tanstack/ember-hotkeys'

export default class Menu extends Component {
	@tracked enabled = true
	@tracked shortcuts: Array<EmberHotkeyDefinition> = [
		{ hotkey: 'Mod+S', callback: () => console.log('Save') },
		{ hotkey: 'Mod+Z', callback: () => console.log('Undo'), options: { enabled: false } },
	]
	<template>{{useHotkeys this.shortcuts enabled=this.enabled}}</template>
}
```

Replace the tracked array when adding or removing entries, or derive it in a getter from tracked application state.

The adapter identifies entries by array index, normalized binding, and target. Changing identity replaces the registration; unchanged identities retain their handle and receive updated callbacks and options. Reordering entries can replace registrations.
