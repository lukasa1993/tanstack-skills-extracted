# Hotkeys — Property getters

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

## Property getters

Property getters and functions returning an options object are both supported. Read reactive state inside the getter. A plain value such as `{ enabled: currentValue }` captures the value when that object is created.

The adapter reads option properties inside its reactive computation and updates registrations automatically. Callbacks such as `onRecord` and `onCancel` remain functions; the adapter does not call them to resolve options. Tracking is shallow; callback bodies and nested objects are not evaluated to discover dependencies. Keep getters free of side effects. Ordinary option changes preserve registration identity. Changing the target moves the registration to that target.

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

class Editor {
	enabled = true
	scope = createHotkeysScope()

	init() {
		const component = this
		this.scope.createHotkey('Mod+S', () => console.log('Save'), {
			get enabled() {
				return component.enabled
			},
		})
	}

	destroy() {
		this.scope.destroy()
	}
}

Alpine.data('editor', () => new Editor())
```

You can also pass `() => ({ enabled: this.enabled })` inside `init()`. Capture the component in `init()` so getters read Alpine's reactive proxy. Alpine applies registration changes when its effect runs. Both forms work for scope defaults, common options, sequences, and recorders. Property getters also work in per-definition options.
