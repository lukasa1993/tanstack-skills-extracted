# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Hotkey targets

Hotkeys listen on `document` by default. Pass an element, `document`, or `window` as `target` to scope events to a specific area. Keep the element in a signal, and pass the options as an accessor:

```tsx
import { createSignal } from 'solid-js'

function Panel() {
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)

  // Fires only while the panel (or something inside it) has focus
  createHotkey('Escape', () => closePanel(), () => ({ target: panel() }))

  return (
    <div ref={setPanel} tabindex={0}>
      Panel content
    </div>
  )
}
```

> [!NOTE]
> An element only receives key events while it or a descendant has focus. Add `tabindex={0}` if the target isn't natively focusable.

Passing `null` or `undefined` registers nothing until the element is attached. Only omitting `target`, or passing `target: document` explicitly, listens on `document`, so a wrapper that forwards an unset `target` waits too.

When focus is inside a target element, its hotkeys run before `document` hotkeys. With the default `stopPropagation: true`, `document` hotkeys for the same key won't fire. Sequences with a `target` advance only on key presses inside that target.

### Elements that are removed

For an element inside `<Show>`, `<For>`, or another control flow that removes it, put the element and its `createHotkey` call in their own component. A `ref` callback runs outside the component's owner, so don't call `createHotkey` there:

```tsx
import { Show, createSignal } from 'solid-js'

function PanelBody() {
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)
  createHotkey('Escape', () => closePanel(), () => ({ target: panel() }))
  return (
    <div ref={setPanel} tabindex={0}>
      Panel content
    </div>
  )
}

function Panel(props: { open: boolean }) {
  return (
    <Show when={props.open}>
      <PanelBody />
    </Show>
  )
}
```

The hotkey registers each time `<Show>` creates `PanelBody`, and unregisters when Solid removes it.

### A target is not a scope

Both limit when a hotkey fires, using different signals:

- **`target`** filters by DOM focus, checking which element received the key event.
- **`scope`** filters by UI state, checking which mounted [provider scopes](./hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md-aa492c2f.md#source-hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md) are active regardless of focus.

A single hotkey can use both.
