# Hotkeys — Basic usage

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

## Basic usage

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { useHotkey, formatForDisplay } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
	@tracked count = 0
	@tracked enabled = true
	save = () => this.count++
	toggle = () => { this.enabled = !this.enabled }
	label = formatForDisplay('Mod+S')

	<template>
		{{useHotkey 'Mod+S' this.save enabled=this.enabled}}
		<button type="button" {{on 'click' this.toggle}}>Toggle shortcut</button>
		<p>Press <kbd>{{this.label}}</kbd>. Saved {{this.count}} times.</p>
	</template>
}
```

### Callback context

Callbacks receive the original `KeyboardEvent` and `HotkeyCallbackContext`. Read `context.hotkey` for the normalized binding and `context.parsedHotkey` for its resolved identity. Narrow `parsed.code !== undefined` before reading a physical code.

```ts
import type { HotkeyCallback } from '@tanstack/ember-hotkeys'

const save: HotkeyCallback = (event, context) => {
	console.log(event.type, context.hotkey, context.parsedHotkey)
}
```

### Raw object bindings

Use either `key` for a logical character or `code` for a physical position. Modifier flags are optional. `mod` selects Command on macOS and Control elsewhere.

```hbs
{{useHotkey (hash key='S' mod=true) this.save}}
```

Import `hash` from `@ember/helper` for inline objects, or pass a component property containing a typed `RawHotkey`.

### Changing a binding

Keep the binding in application state. Recorder results such as `Alt+[KeyS]` can be passed directly to the registration API. Keep an initial binding separately if the UI needs a reset button.

```hbs
{{useHotkey this.binding this.save}}
```
