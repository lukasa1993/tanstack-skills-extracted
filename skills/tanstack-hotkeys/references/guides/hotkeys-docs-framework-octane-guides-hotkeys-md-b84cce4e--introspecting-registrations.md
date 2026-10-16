# Hotkeys — Introspecting registrations

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## Introspecting registrations

Use the `useHotkeyRegistrations` hook to get a live view of every registration, chords and sequences together. It's the building block for shortcut palettes and help dialogs.

```tsx
import { useHotkey, useHotkeyRegistrations, formatForDisplay } from '@tanstack/octane-hotkeys'

export function Shortcuts() @{
	useHotkey('Mod+S', () => console.log('Saved'), {
		meta: { name: 'Save', description: 'Save the document', group: 'File' },
	})
	const registrations = useHotkeyRegistrations()
	<ul>
		@for (const registration of registrations.hotkeys; key registration.id) {
			<li><kbd>{formatForDisplay(registration.hotkey)}</kbd> {registration.options.meta?.name}</li>
		}
	</ul>
}
```

The returned object's `hotkeys` array holds one list of registration views. Each view has an `id`, the `hotkey`, its `options` (including `meta`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedHotkey`; sequence views add `parsedSequence` and `matchedStepCount`, the steps matched so far in the current attempt. Disabled entries stay listed; unmounted registrations disappear. Format any hotkey with `formatForDisplay`, and group entries by `options.meta?.group` when building a help panel.

Registrations only exist while their components are mounted. To list hotkeys from routes that have not rendered, declare them with [app hotkeys](./hotkeys-docs-framework-octane-guides-app-hotkeys-md-ade4f49f.md#source-hotkeys-docs-framework-octane-guides-app-hotkeys-md).
