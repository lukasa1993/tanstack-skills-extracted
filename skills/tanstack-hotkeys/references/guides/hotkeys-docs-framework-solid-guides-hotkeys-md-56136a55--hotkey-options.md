# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.10.0`.

## Hotkey options

### `enabled`

Controls whether the hotkey is active. Defaults to `true`. Use an accessor for reactive control.

Disabled hotkeys remain registered in the manager and stay visible in devtools; only execution is suppressed.

```tsx
const [isEditing, setIsEditing] = createSignal(false)

createHotkey('Mod+S', () => save(), () => ({ enabled: isEditing() }))
```

### `preventDefault`

Automatically calls `event.preventDefault()` when the hotkey fires. Defaults to `true`.

```tsx
createHotkey('Mod+S', () => save())
createHotkey('Mod+S', () => save(), { preventDefault: false })
```

### `stopPropagation`

Calls `event.stopPropagation()` when the hotkey fires. Defaults to `true`.

```tsx
createHotkey('Escape', () => closeModal())
createHotkey('Escape', () => closeModal(), { stopPropagation: false })
```

### `eventType`

Whether to listen on `keydown` (default) or `keyup`.

```tsx
createHotkey('Shift', () => deactivateMode(), { eventType: 'keyup' })
```

### `requireReset`

When `true`, the hotkey fires only once per key press. The key must be released and pressed again to fire again. Defaults to `false`.

```tsx
createHotkey('Escape', () => closePanel(), { requireReset: true })
```

### `ignoreInputs`

When `true`, the hotkey doesn't fire when the user is focused on a text input, textarea, select, or contentEditable element. When unset, a smart default applies based on the hotkey type.

```tsx
createHotkey('K', () => openSearch())  // Smart default: ignored in inputs
createHotkey('Mod+S', () => save())   // Smart default: fires in inputs
createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

### `target`

The DOM element to attach the event listener to. Defaults to `document`. Can be a DOM element, `document`, `window`, or from an accessor for reactive targets.

```tsx
const [panelRef, setPanelRef] = createSignal<HTMLDivElement | null>(null)

createHotkey('Escape', () => closePanel(), () => ({ target: panelRef() }))

return <div ref={setPanelRef} tabIndex={0}>...</div>
```

> [!NOTE]
> When using an accessor for the target, the primitive waits for the element to be available before registering. Ensure the element is focusable (has `tabIndex`) so it can receive keyboard events.

### `conflictBehavior`

Controls what happens when you register a hotkey that's already registered. Options: `'warn'`, `'error'`, `'replace'`, `'allow'`.

```tsx
createHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

### `platform`

Override the auto-detected platform.

```tsx
createHotkey('Mod+S', () => save(), { platform: 'mac' })
```
