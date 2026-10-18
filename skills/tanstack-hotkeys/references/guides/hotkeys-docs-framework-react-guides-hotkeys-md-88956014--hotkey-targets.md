# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to a ref, an element, `document`, or `window` to listen somewhere else:

```tsx
import { useRef } from 'react'

function Panel() {
  const panelRef = useRef<HTMLDivElement>(null)

  // Fires only while the panel, or something inside it, has focus
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  return (
    <div ref={panelRef} tabIndex={0}>
      Panel content
    </div>
  )
}
```

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabIndex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

A target and a [scope](./hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md-bdb950e6.md#source-hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md) both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both.
