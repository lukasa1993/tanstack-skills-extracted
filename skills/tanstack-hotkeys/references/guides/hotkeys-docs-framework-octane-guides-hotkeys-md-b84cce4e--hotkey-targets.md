# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to a ref, an element, `document`, or `window` to listen somewhere else:

```tsx
import { useRef } from 'octane'

function Panel() @{
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Fires only while the panel, or something inside it, has focus
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  <div ref={panelRef} tabIndex={0}>
    Panel content
  </div>
}
```

A `null` or `undefined` target, or a ref whose `current` is still unset, registers nothing until the element exists. Only an omitted `target` listens on `document`, so a wrapper that forwards an unset `target` waits too. Set `target: document` to choose the document explicitly.

The hook reads a ref's `current` after its component renders. Setting a ref doesn't render the component, so a ref misses an element that mounts after the component, such as one a child shows from its own state. Use a ref for an element the component always renders. For any other element, keep it in state with a callback ref:

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

Setting the state renders the component, so the hotkey registers when the element mounts, moves when the element is replaced, and unregisters when it unmounts.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabIndex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

A target and a [scope](./hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md-886d843a.md#source-hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md) both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both.
