# Hotkeys — Basic usage

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

## Basic usage

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'

class Editor {
	count = 0
	enabled = true
	scope = createHotkeysScope()
	label = formatForDisplay('Mod+S')

	init() {
		this.scope.createHotkey('Mod+S', () => this.count++,
			() => ({ enabled: this.enabled }))
	}

	destroy() {
		this.scope.destroy()
	}
}

Alpine.data('editor', () => new Editor())
Alpine.start()
```

Use the `editor` markup from the [quick start](./hotkeys-docs-framework-alpine-quick-start-md-3845b066.md#source-hotkeys-docs-framework-alpine-quick-start-md).

### Callback context

Callbacks receive the original `KeyboardEvent` and `HotkeyCallbackContext`. Read `context.hotkey` for the normalized binding and `context.parsedHotkey` for its resolved identity. Narrow `parsed.code !== undefined` before reading a physical code.

```ts
this.scope.createHotkey('Mod+S', (event, context) => {
	console.log(event.type, context.hotkey, context.parsedHotkey)
})
```

### Raw object bindings

Use either `key` for a logical character or `code` for a physical position. Modifier flags are optional. `mod` selects Command on macOS and Control elsewhere.

```ts
this.scope.createHotkey({ key: 'S', mod: true }, () => console.log("Save"))
```

### Changing a binding

Keep the binding in application state. Recorder results such as `Alt+[KeyS]` can be passed directly to the registration API. Keep an initial binding separately if the UI needs a reset button.

```ts
this.scope.createHotkey(() => this.binding, () => console.log("Save"))
```
