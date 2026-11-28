# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Hotkey targets

Hotkeys listen on `document` by default. Pass a ref, DOM element, `document`, or `window` as `target` to scope events to a specific area:

```tsx
import { useRef } from 'react'

function Panel() {
  const panelRef = useRef<HTMLDivElement>(null)

  // Fires only while the panel (or something inside it) has focus
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  return (
    <div ref={panelRef} tabIndex={0}>
      Panel content
    </div>
  )
}
```

> [!NOTE]
> An element only receives key events while it or a descendant has focus. Add `tabIndex={0}` if the target isn't natively focusable.

Passing `null`, `undefined`, or an unset ref registers nothing until an element exists. Only omitting `target`, or passing `target: document` explicitly, listens on `document`.

When focus is inside a target element, its hotkeys run before `document` hotkeys. With the default `stopPropagation: true`, `document` hotkeys for the same key won't fire. Sequences with a `target` advance only on key presses inside that target.

### Elements that mount later

`useHotkey` reads `ref.current` after render. Assigning a ref does not trigger a re-render, so a `useRef` misses elements mounted later by a child component until the parent happens to re-render.

Use `useRef` when the element renders in the same component. For elements mounted later by a child, hold the element in `useState` via a callback ref:

```tsx
import { useState } from 'react'

function Sidebar() {
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)

  useHotkey('Escape', () => closePanel(), { target: panel })

  return <CollapsiblePanel panelRef={setPanel} />
}

function CollapsiblePanel({
  panelRef,
}: {
  panelRef: (element: HTMLDivElement | null) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && (
        <div ref={panelRef} tabIndex={0}>
          Panel content
        </div>
      )}
    </>
  )
}
```

Updating state re-renders `Sidebar`, so the hotkey attaches as soon as the panel mounts and detaches when it unmounts.

### A target is not a scope

Both limit when a hotkey fires, using different signals:

- **`target`** filters by DOM focus, checking which element received the key event.
- **`scope`** filters by UI state, checking which mounted [provider scopes](./hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md-bdb950e6.md#source-hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md) are active regardless of focus.

A single hotkey can use both.
