# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Hotkey targets

Hotkeys listen on `document` by default. Pass a ref, DOM element, `document`, or `window` as `target` to scope events to a specific area:

```tsx
import { useRef } from 'octane'

function Panel() @{
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Fires only while the panel (or something inside it) has focus
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  <div ref={panelRef} tabIndex={0}>
    Panel content
  </div>
}
```

> [!NOTE]
> An element only receives key events while it or a descendant has focus. Add `tabIndex={0}` if the target isn't natively focusable.

Passing `null`, `undefined`, or an unset ref registers nothing until an element exists. Only omitting `target`, or passing `target: document` explicitly, listens on `document`.

When focus is inside a target element, its hotkeys run before `document` hotkeys. With the default `stopPropagation: true`, `document` hotkeys for the same key won't fire. Sequences with a `target` advance only on key presses inside that target.

### Elements that mount later

The hook reads a ref's `current` after its component renders. Setting a ref doesn't render the component, so a `useRef` misses an element that mounts after the component, such as one a child shows from its own state.

Use a ref for an element the component always renders. For any other element, hold the element in state with a callback ref:

```tsx
import { useState } from 'octane'

function Panel() @{
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)

  useHotkey('Escape', () => closePanel(), { target: panel })

  <div ref={setPanel} tabIndex={0}>
    Panel content
  </div>
}
```

Setting the state renders the component, so the hotkey attaches as soon as the element mounts, moves when the element is replaced, and detaches when it unmounts.

### A target is not a scope

Both limit when a hotkey fires, using different signals:

- **`target`** filters by DOM focus, checking which element received the key event.
- **`scope`** filters by UI state, checking which mounted [provider scopes](./hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md-886d843a.md#source-hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md) are active regardless of focus.

A single hotkey can use both.
