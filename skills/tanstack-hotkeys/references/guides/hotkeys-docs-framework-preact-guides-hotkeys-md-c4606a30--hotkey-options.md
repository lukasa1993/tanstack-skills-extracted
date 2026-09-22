# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Hotkey options

### `enabled`

Controls whether the hotkey is active. Defaults to `true`.

Disabled hotkeys remain registered in the manager and stay visible in devtools; only execution is suppressed. Hooks update `enabled` on the existing registration instead of unregistering and re-registering.

```tsx
const [isEditing, setIsEditing] = useState(false)

// Only active when editing
useHotkey('Mod+S', () => save(), { enabled: isEditing })
```

### `preventDefault`

Automatically calls `event.preventDefault()` when the hotkey fires. Defaults to `true`.

```tsx
// Browser default is prevented by default
useHotkey('Mod+S', () => save())

// Opt out when you want the browser's default behavior
useHotkey('Mod+S', () => save(), { preventDefault: false })
```

### `stopPropagation`

Calls `event.stopPropagation()` when the hotkey fires. Defaults to `true`.

```tsx
// Event propagation is stopped by default
useHotkey('Escape', () => closeModal())

// Opt out when you need the event to bubble
useHotkey('Escape', () => closeModal(), { stopPropagation: false })
```

### `eventType`

Whether to listen on `keydown` (default) or `keyup`.

```tsx
// Fire when the key is released
useHotkey('Shift', () => deactivateMode(), { eventType: 'keyup' })
```

### `requireReset`

When `true`, the hotkey only fires once per key press. The key must be released and pressed again to fire again. Defaults to `false`.

```tsx
// Only fires once per Escape press, not on key repeat
useHotkey('Escape', () => closePanel(), { requireReset: true })
```

### `ignoreInputs`

When `true`, the hotkey doesn't fire when the user is focused on a text input, textarea, select, or contentEditable element. Button-type inputs (`type="button"`, `"submit"`, `"reset"`) are not ignored, so shortcuts like Mod+S work when the user has tabbed to a form button. When unset, a smart default applies: `Ctrl`/`Meta` shortcuts and `Escape` fire in inputs; single keys and `Shift`/`Alt` combos are ignored.

```tsx
// Single key - ignored in inputs by default (smart default)
useHotkey('K', () => openSearch())

// Mod+S and Escape - fire in inputs by default (smart default)
useHotkey('Mod+S', () => save())
useHotkey('Escape', () => closeDialog())

// Override: force a single key to fire in inputs
useHotkey('Enter', () => submit(), { ignoreInputs: false })
```

Set `ignoreInputs: false` or `true` explicitly to override the smart default.

### `target`

The DOM element to attach the event listener to. Defaults to `document`. Can be a DOM element, `document`, `window`, or a Preact ref.

```tsx
import { useRef } from 'preact/hooks'

function Panel() {
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Only listens for events on this specific element
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  return (
    <div ref={panelRef} tabIndex={0}>
      <p>Panel content</p>
    </div>
  )
}
```

> [!NOTE]
> When using a ref as the target, make sure the element is focusable (has `tabIndex`) so it can receive keyboard events.

### `conflictBehavior`

Controls what happens when you register a hotkey that's already registered. Options:

- `'warn'` (default) - Logs a warning but allows the registration
- `'error'` - Throws an error
- `'replace'` - Replaces the existing registration
- `'allow'` - Allows multiple registrations silently

```tsx
useHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

### `platform`

Override the auto-detected platform. Useful for testing or for applications that need to force a specific platform behavior.

```tsx
useHotkey('Mod+S', () => save(), { platform: 'mac' })
```
