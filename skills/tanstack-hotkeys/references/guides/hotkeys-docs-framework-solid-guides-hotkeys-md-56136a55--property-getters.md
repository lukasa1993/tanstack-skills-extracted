# Hotkeys — Property getters

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

## Property getters

Property getters and functions returning an options object are both supported. Read reactive state inside the getter. A plain value such as `{ enabled: currentValue }` captures the value when that object is created.

The adapter reads option properties inside its reactive computation and updates registrations automatically. Callbacks such as `onRecord` and `onCancel` remain functions; the adapter does not call them to resolve options. Tracking is shallow; callback bodies and nested objects are not evaluated to discover dependencies. Keep getters free of side effects. Ordinary option changes preserve registration identity. Changing the target moves the registration to that target.

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

export function SaveShortcut(props: { enabled: boolean; onSave: () => void }) {
	createHotkey('Mod+S', () => props.onSave(), {
		get enabled() {
			return props.enabled
		},
	})
	return null
}
```

You can also pass `() => ({ enabled: props.enabled })`. Both forms work for common options, sequences, and recorders. Property getters also work in per-definition options. `HotkeysProvider` follows replacement `defaultOptions` objects and getters within defaults. Per-call options override provider defaults, and per-definition options override common options.
