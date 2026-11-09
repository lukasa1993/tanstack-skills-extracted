# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.26.0`.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to an element, `document`, or `window` to listen somewhere else. Keep the element in a signal, and pass the options as an accessor:

```tsx
import { createSignal } from 'solid-js'

function Panel() {
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)

  // Fires only while the panel, or something inside it, has focus
  createHotkey('Escape', () => closePanel(), () => ({ target: panel() }))

  return (
    <div ref={setPanel} tabIndex={0}>
      Panel content
    </div>
  )
}
```

A `null` or `undefined` target waits until the element is attached. Only an omitted `target` listens on `document`, so a wrapper that forwards an unset `target` waits too. Set `target: document` to choose the document explicitly.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabIndex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### Elements that are removed

Solid doesn't call a `ref` with `null` when it removes an element, so a signal set by `ref` keeps the removed element, and the hotkey stays registered on it until the component unmounts. Keep the signal for an element the component always renders.

For an element inside `<Show>`, `<For>`, or another control flow that removes it, call `createHotkey` in the element's `ref` callback:

```tsx
import { Show } from 'solid-js'

function Panel(props: { open: boolean }) {
  return (
    <Show when={props.open}>
      <div
        ref={(el) => createHotkey('Escape', () => closePanel(), { target: el })}
        tabIndex={0}
      >
        Panel content
      </div>
    </Show>
  )
}
```

The `ref` callback runs inside the branch that renders the element. So the hotkey registers each time the element is created, and unregisters when Solid removes it.

### A target is not a scope

A target and a [scope](./hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md-aa492c2f.md#source-hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md) both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both.
