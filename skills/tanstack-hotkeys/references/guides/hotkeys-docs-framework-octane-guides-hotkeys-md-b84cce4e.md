# Hotkeys

<a id="source-hotkeys-docs-framework-octane-guides-hotkeys-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

[Topic index](../other-guides.md) · [Source provenance](../SOURCES.md)

`useHotkey` registers a shortcut with the shared `HotkeyManager`. Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler supplies hook identity, so call hooks at stable component call sites. Use the plural hooks for lists that change length. Do not supply the compiler's internal slot argument yourself.

Registration callbacks and options refresh after each commit. Registrations and recorder subscriptions are released when the component unmounts. Element targets are DOM nodes, not React ref objects. Use a callback ref that updates component state so the hook sees a newly mounted or replaced element.

## Logical keys and physical positions

This section is an exact duplicate. Read [Logical keys and physical positions in Hotkeys](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md).

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

## Updating options

Pass current options when the component renders. Hooks synchronize those options with the existing registration. You do not need to call `setOptions` in application code. Provider defaults and recorder options follow the same component update lifecycle.

Property getters are read when the hook runs. They do not subscribe to external state independently of the component. Keep changing values in framework state so the component updates, and avoid creating an options object once with an initial state snapshot.

## Default options

| Option | Default | Behavior |
| --- | --- | --- |
| `enabled` | `true` | Execute matching callbacks. |
| `preventDefault` | `true` | Prevent the browser's default action. |
| `stopPropagation` | `true` | Stop the event from bubbling to ancestor listeners. |
| `eventType` | `'keydown'` | Listen on key press rather than release. |
| `requireReset` | `false` | Allow held-key repeats. |
| `ignoreInputs` | Smart default | Allow Control/Meta combinations and Escape in inputs. |
| `target` | `document` | Listen for events that reach the document. |
| `platform` | Detected | Resolve `Mod` for the current platform. |
| `conflictBehavior` | `'warn'` | Warn about duplicate bindings while allowing them. |

These defaults let application shortcuts replace browser shortcuts. Opt out of prevention or propagation control when the browser or an ancestor must also handle the event.

### Smart input handling

By default, Control/Meta shortcuts and Escape work in text inputs, textareas, selects, and contentEditable elements. Single keys and Shift/Alt combinations are ignored there because they can be normal typing. Button-type inputs do not block hotkeys.

### Shared default options

Set `hotkey` defaults in `HotkeysProvider`. Options passed to an individual hook override provider defaults. For a plural hook, each definition's options override its common options. See the [provider setup](./hotkeys-docs-framework-octane-quick-start-md-ecf7a027.md#source-hotkeys-docs-framework-octane-quick-start-md).

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

## Current callbacks and automatic cleanup

Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler supplies hook identity, so call hooks at stable component call sites. Use the plural hooks for lists that change length. Do not supply the compiler's internal slot argument yourself.

Registration callbacks and options refresh after each commit. Registrations and recorder subscriptions are released when the component unmounts. Element targets are DOM nodes, not React ref objects. Use a callback ref that updates component state so the hook sees a newly mounted or replaced element.

## Registering multiple hotkeys

Use `useHotkeys` to register a dynamic list. Per-definition options override common options. Removing an entry unregisters it. Each entry has the shared [HotkeyDefinition](https://github.com/TanStack/hotkeys/blob/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/docs/reference/adapter/interfaces/HotkeyDefinition.md) shape.

```tsx
useHotkeys(
	shortcuts,
	{ enabled },
)
```

```ts
import type { HotkeyDefinition } from '@tanstack/octane-hotkeys'

const shortcuts: Array<HotkeyDefinition> = [
	{ hotkey: 'Mod+S', callback: () => console.log('Save') },
	{ hotkey: 'Mod+Z', callback: () => console.log('Undo'), options: { enabled: false } },
]
```

Derive the definitions from reactive application state. Pass an empty array when no shortcuts should be registered.

The adapter identifies entries by array index, normalized binding, and target. Changing identity replaces the registration; unchanged identities retain their handle and receive updated callbacks and options. Reordering entries can replace registrations.

## Metadata

This section is an exact duplicate. Read [Metadata in Hotkeys](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md).

## Introspecting registrations

Read `hotkeys` and `sequences` from `useHotkeyRegistrations()`. Disabled entries stay listed; destroyed registrations disappear. Both arrays include options and metadata. Hotkey views include enabled state and trigger counts; sequence views include sequence steps and progress.

```tsx
import { useHotkey, useHotkeyRegistrations, formatForDisplay } from '@tanstack/octane-hotkeys'

export function Shortcuts() @{
	useHotkey('Mod+S', () => console.log('Saved'), {
		meta: { name: 'Save', description: 'Save the document', group: 'File' },
	})
	const registrations = useHotkeyRegistrations()
	<div>
		<ul>
			@for (const registration of registrations.hotkeys) {
				<li><kbd>{formatForDisplay(registration.hotkey)}</kbd> {registration.options.meta?.name}</li>
			}
		</ul>
	</div>
}
```

Read `registrations.sequences` in the same way. Format each sequence step with `formatForDisplay` and join the labels with an arrow. Group entries by `registration.options.meta?.group` when building a help panel.

## The hotkey manager

The manager is a shared singleton. The adapter owns registrations, not the manager itself. Do not destroy the singleton when a component unmounts.

```ts
import { getHotkeyManager } from '@tanstack/octane-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

Try the [useHotkey example](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/octane/useHotkey), [useHotkeys example](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/octane/useHotkeys), and [kitchen sink](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/octane/kitchen-sink). See the [API reference](https://github.com/TanStack/hotkeys/blob/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/docs/framework/octane/reference/index.md) for full signatures.
