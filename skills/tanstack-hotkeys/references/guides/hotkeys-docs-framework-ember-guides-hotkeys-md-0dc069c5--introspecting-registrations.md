# Hotkeys — Introspecting registrations

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

## Introspecting registrations

Read `hotkeys` and `sequences` from `useHotkeyRegistrations(this)`. Disabled entries stay listed; destroyed registrations disappear. Both arrays include options and metadata. Hotkey views include enabled state and trigger counts; sequence views include sequence steps and progress.

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

Read `registrations.sequences` in the same way. Format each sequence step with `formatForDisplay` and join the labels with an arrow. Group entries by `registration.options.meta?.group` when building a help panel.
