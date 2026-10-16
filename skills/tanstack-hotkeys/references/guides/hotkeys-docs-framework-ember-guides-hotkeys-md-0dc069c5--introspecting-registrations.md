# Hotkeys — Introspecting registrations

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## Introspecting registrations

Use the `useHotkeyRegistrations` utility to get a live view of every registration, chords and sequences together. It's the building block for shortcut palettes and help dialogs.

```gts
import Component from '@glimmer/component'
import { useHotkey, useHotkeyRegistrations, formatForDisplay } from '@tanstack/ember-hotkeys'

export default class Shortcuts extends Component {
	registrations = useHotkeyRegistrations(this)
	meta = { name: 'Save', description: 'Save the document', group: 'File' }
	save = () => console.log('Saved')
	<template>
		{{useHotkey 'Mod+S' this.save meta=this.meta}}
		<ul>
			{{#each this.registrations.hotkeys key='id' as |registration|}}
				<li><kbd>{{formatForDisplay registration.hotkey}}</kbd> {{registration.options.meta.name}}</li>
			{{/each}}
		</ul>
	</template>
}
```

The tracked `hotkeys` array holds one list of registration views. Each view has an `id`, the `hotkey`, its `options` (including `meta`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedHotkey`; sequence views add `parsedSequence` and `matchedStepCount`, the steps matched so far in the current attempt. Disabled entries stay listed; unmounted registrations disappear. Format any hotkey with `formatForDisplay`, and group entries by `options.meta?.group` when building a help panel.

Registrations only exist while their components are mounted. To list hotkeys from routes that have not rendered, declare them with [app hotkeys](./hotkeys-docs-framework-ember-guides-app-hotkeys-md-c66d9482.md#source-hotkeys-docs-framework-ember-guides-app-hotkeys-md).
