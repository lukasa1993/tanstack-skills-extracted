# Hotkeys — Reactive options

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Reactive options

Unlike React/Preact hooks, Solid primitives accept accessor functions for reactive options. Pass a function that returns the options object, and the hotkey updates automatically when dependencies change:

```tsx
function Modal(props) {
  createHotkey('Escape', () => props.onClose(), () => ({
    enabled: props.isOpen,
  }))

  return (
    <Show when={props.isOpen}>
      <div class="modal">...</div>
    </Show>
  )
}
```

For scoped targets, use an accessor so the hotkey waits for the element to be attached:

```tsx
function Editor() {
  const [editorRef, setEditorRef] = createSignal<HTMLDivElement | null>(null)

  createHotkey('Mod+S', save, () => ({ target: editorRef() }))

  return <div ref={setEditorRef}>...</div>
}
```

### Changing a binding

Pass a new logical or physical binding through your framework's normal state mechanism. A recorder result such as `Alt+[KeyS]` can be passed directly to the same registration API. Keep an initial binding in application state if you want a reset button; the library does not need a separate preferences store.
