# Hotkeys — Property getters

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

## Property getters

Registration helpers track named arguments and property getters inside definition arrays. You can keep the array stable while a getter reads tracked state:

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { useHotkeys } from '@tanstack/ember-hotkeys'
import type { HotkeyDefinition } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
	@tracked enabled = true

	definitions: Array<HotkeyDefinition> = [{
		hotkey: 'Mod+S',
		callback: () => console.log('Save'),
		options: this.createOptions(),
	}]

	createOptions() {
		const component = this
		return {
			get enabled() {
				return component.enabled
			},
		}
	}

	<template>{{useHotkeys this.definitions}}</template>
}
```

The helper reads getters during rendering and applies registration changes after rendering. This also works with `useHotkeySequences`. For a single registration, pass tracked named arguments such as `enabled=this.enabled`. Scope defaults and recorder options accept property getters or functions returning options. Recorders read current options during the active session without requiring a render.

Getters must read tracked state. A plain `{ enabled: this.enabled }` stored once does not track later changes. Callbacks remain functions and are not invoked to resolve options.
