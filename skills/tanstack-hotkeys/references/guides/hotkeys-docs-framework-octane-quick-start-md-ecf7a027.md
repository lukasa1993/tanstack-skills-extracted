# Quick Start

<a id="source-hotkeys-docs-framework-octane-quick-start-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

[Topic index](../framework-octane.md) · [Source provenance](../SOURCES.md)

Install `@tanstack/octane-hotkeys` with the [installation instructions](./hotkeys-docs-installation-md-bb05b3dc.md#source-hotkeys-docs-installation-md). This guide builds a save shortcut and shows the component lifecycle used by the other APIs.

## Your first hotkey

Put this code in a `.tsrx` file compiled with the Octane toolchain. Add `<div id="root"></div>` to the host HTML.

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

Press Command+S on macOS or Control+S on Windows and Linux. The count increases and the browser save dialog is prevented. The toggle disables execution while preserving the registration.

`Mod` resolves to the primary platform modifier. Use `Mod+[KeyS]` instead when the shortcut must follow the physical S position.

## Registration and cleanup

Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler supplies hook identity, so call hooks at stable component call sites. Use the plural hooks for lists that change length. Do not supply the compiler's internal slot argument yourself.

Registration callbacks and options refresh after each commit. Registrations and recorder subscriptions are released when the component unmounts. Element targets are DOM nodes, not React ref objects. Use a callback ref that updates component state so the hook sees a newly mounted or replaced element.

## Common patterns

### Multiple hotkeys


```tsx
useHotkey('Mod+S', () => console.log('Save'))
useHotkey('Mod+Z', () => console.log('Undo'))
useHotkey('Mod+Shift+Z', () => console.log('Redo'))
```

Each registration is independent. For a dynamic list, use `useHotkeys` as shown in the [hotkeys guide](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md#source-hotkeys-docs-framework-octane-guides-hotkeys-md).

### Scoped hotkeys

Pass an actual element as `target`. A `null` target defers registration until the element exists. Make the element focusable with `tabindex="0"`. See the [complete scoped example](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md#source-hotkeys-docs-framework-octane-guides-hotkeys-md).

### Conditional hotkeys


```tsx
useHotkey('Mod+S', () => console.log("Save"), { enabled })
```

Use Octane component state for the enabled flag.

### Multi-key sequences


```tsx
useHotkeySequence(['G', 'G'], () => window.scrollTo({ top: 0 }))
```

Release G between presses. Automatic key repeats do not advance sequences.

### Tracking held keys and displaying hints


```tsx
import { useHeldKeys, useHeldKeyCodes, useKeyHold, useHotkeyHint } from '@tanstack/octane-hotkeys'

export function KeyStatus() @{
	const held = useHeldKeys()
	const codes = useHeldKeyCodes()
	const shift = useKeyHold('Shift')
	const hint = useHotkeyHint('Mod+S')

	<div>
		<p>{held.join(' + ') || 'No keys held'}</p>
		@for (const key of held) {
			<p>{key}: {codes[key]}</p>
		}
		@if (shift) { <button type="button">Delete permanently</button> }
		@if (hint) { <kbd>Save</kbd> }
	</div>
}
```

Use `formatForDisplay(binding)` for platform-specific labels. Keep the original binding in state; a display label is not a registration string.

## Default options provider

Place the provider above components that call hotkey hooks.

```tsx
import { HotkeysProvider } from '@tanstack/octane-hotkeys'

export function Root() @{
	<div>
		<HotkeysProvider defaultOptions={{
			hotkey: { preventDefault: true },
			hotkeySequence: { timeout: 1500 },
			hotkeyRecorder: { onCancel: () => console.log('Cancelled') },
			hotkeySequenceRecorder: { idleTimeoutMs: 2000 },
		}}>
			<Editor />
		</HotkeysProvider>
	</div>
}
```

`useDefaultHotkeysOptions()` reads the nearest provider's defaults and returns an empty object outside a provider. `useHotkeysContext()` returns `{ defaultOptions }`, or `null` outside a provider. Nested providers replace the outer defaults; call-specific options and per-definition options still take precedence.

## Examples and next steps

- [Hotkeys](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md#source-hotkeys-docs-framework-octane-guides-hotkeys-md)
- [Sequences](./hotkeys-docs-framework-octane-guides-sequences-md-dc8f8bbf.md#source-hotkeys-docs-framework-octane-guides-sequences-md)
- [Hotkey recording](./hotkeys-docs-framework-octane-guides-hotkey-recording-md-e248b1bd.md#source-hotkeys-docs-framework-octane-guides-hotkey-recording-md)
- [Sequence recording](./hotkeys-docs-framework-octane-guides-sequence-recording-md-4831c5ef.md#source-hotkeys-docs-framework-octane-guides-sequence-recording-md)
- [Key state tracking](./hotkeys-docs-framework-octane-guides-key-state-tracking-md-2c543667.md#source-hotkeys-docs-framework-octane-guides-key-state-tracking-md)
- [Formatting and display](./hotkeys-docs-framework-octane-guides-formatting-display-md-13293bb7.md#source-hotkeys-docs-framework-octane-guides-formatting-display-md)
- [Kitchen sink](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/octane/kitchen-sink)
- [API reference](https://github.com/TanStack/hotkeys/blob/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/docs/framework/octane/reference/index.md)
