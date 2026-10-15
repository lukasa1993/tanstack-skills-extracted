# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.12.0`.

## Hotkey options

### `enabled`

Set `enabled` to false to suppress execution. The registration remains in the live registry, and changing this option updates its existing handle.

### `preventDefault`

Set `preventDefault: false` to preserve the browser's action. The default prevents actions such as the browser's Save Page dialog.

### `stopPropagation`

Set `stopPropagation: false` to allow an event to bubble to an ancestor target. This is independent of preventing the browser default.

### `eventType`

Set `eventType: 'keyup'` to execute when the key is released. The default is `'keydown'`.

### `requireReset`

Set `requireReset: true` for actions that must run once per press. The key must be released before another press can trigger the action.

### `ignoreInputs`

Use `ignoreInputs: true` to ignore typing targets even for Control/Meta shortcuts. Use `false` to allow a single key such as Enter inside an input. Omitting the option restores smart input handling.

### `target`

Targets can be an element, `document`, or `window`. A `null` target defers registration; an omitted target uses `document`. Changing the target moves the registration and removes listeners from the previous target when no registrations remain.


```tsx
import { useState } from 'octane'
import { useHotkey } from '@tanstack/octane-hotkeys'

export function Panel() @{
	const [target, setTarget] = useState<HTMLDivElement | null>(null)
	useHotkey('Escape', () => console.log('Close focused panel'), { target })
	<div>
		<div ref={setTarget} tabIndex={0}>Focus here and press Escape.</div>
	</div>
}
```

The callback ref updates state when the element mounts or changes. A ref object is not an accepted target.

### `conflictBehavior`

Duplicate registrations on the same target use one of these policies:

- `'warn'`: log a warning and keep both registrations.
- `'error'`: throw an error.
- `'replace'`: replace the existing registration.
- `'allow'`: keep both without warning.

### `platform`

Pass `'mac'`, `'windows'`, or `'linux'` to override detection. Use the same platform when formatting labels or calculating modifier hints.
