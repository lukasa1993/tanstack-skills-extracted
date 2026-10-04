# Hotkeys — Registering multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

## Registering multiple hotkeys

Use `useHotkeys` to register a dynamic list. Per-definition options override common options. Removing an entry unregisters it. Each entry has the shared [HotkeyDefinition](https://github.com/TanStack/hotkeys/blob/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/docs/reference/adapter/interfaces/HotkeyDefinition.md) shape.

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { useHotkeys } from '@tanstack/ember-hotkeys'
import type { HotkeyDefinition } from '@tanstack/ember-hotkeys'

export default class Menu extends Component {
	@tracked enabled = true
	@tracked shortcuts: Array<HotkeyDefinition> = [
		{ hotkey: 'Mod+S', callback: () => console.log('Save') },
		{ hotkey: 'Mod+Z', callback: () => console.log('Undo'), options: { enabled: false } },
	]
	<template>{{useHotkeys this.shortcuts enabled=this.enabled}}</template>
}
```

Replace the tracked array when adding or removing entries, or derive it in a getter from tracked application state.

The adapter identifies entries by array index, normalized binding, and target. Changing identity replaces the registration; unchanged identities retain their handle and receive updated callbacks and options. Reordering entries can replace registrations.
