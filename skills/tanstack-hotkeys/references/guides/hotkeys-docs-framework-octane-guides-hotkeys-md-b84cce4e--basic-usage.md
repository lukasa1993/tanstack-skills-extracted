# Hotkeys — Basic usage

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## Basic usage

```tsx
import { createRoot, delegateEvents, useState } from 'octane'
import { useHotkey, formatForDisplay } from '@tanstack/octane-hotkeys'

delegateEvents(['click'])

function Editor() @{
	const [count, setCount] = useState(0)
	const [enabled, setEnabled] = useState(true)
	useHotkey('Mod+S', () => setCount((value) => value + 1), { enabled })

	<div>
		<button type="button" onClick={() => setEnabled(!enabled)}>Toggle shortcut</button>
		<p>Press <kbd>{formatForDisplay('Mod+S')}</kbd>. Saved {count} times.</p>
	</div>
}

const root = createRoot(document.getElementById('root')!)
root.render(Editor)
```

### Callback context

Callbacks receive the original `KeyboardEvent` and `HotkeyCallbackContext`. Read `context.hotkey` for the normalized binding and `context.parsedHotkey` for its resolved identity. Narrow `parsed.code !== undefined` before reading a physical code.

```tsx
useHotkey('Mod+S', (event, context) => {
	console.log(event.type, context.hotkey, context.parsedHotkey)
})
```

### Raw object bindings

Use either `key` for a logical character or `code` for a physical position. Modifier flags are optional. `mod` selects Command on macOS and Control elsewhere.

```tsx
useHotkey({ key: 'S', mod: true }, () => console.log("Save"))
```

### Changing a binding

Keep the binding in application state. Recorder results such as `Alt+[KeyS]` can be passed directly to the registration API. Keep an initial binding separately if the UI needs a reset button.

```tsx
useHotkey(binding, () => console.log("Save"))
```
