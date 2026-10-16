# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

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

When `ignoreInputs` is enabled, hotkeys also skip keys that a focused control inside their `target` uses itself: `Enter` and `Space` on buttons and `<summary>`, `Enter` on links, and navigation keys in ARIA widgets such as menus, listboxes, tabs, and grids. A hotkey targeted at the control itself still receives them, and `ignoreInputs: false` handles every key. See [Focused controls keep their own keys](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for the full list.

When `true`, the hotkey doesn't fire when the user is focused on a text input, textarea, select, or contentEditable element. The default, `'auto'`, chooses from the hotkey.

```tsx
createHotkey('K', () => openSearch())  // 'auto': ignored in inputs
createHotkey('Mod+S', () => save())   // 'auto': fires in inputs
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
