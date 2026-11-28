# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. `createHotkey` and `createHotkeys` also accept `target: window`. To listen on an element, create an attachment and attach it to that element:

```svelte
<script lang="ts">
  import { createHotkeyAttachment } from '@tanstack/svelte-hotkeys'

  // Fires only while the panel, or something inside it, has focus
  const closeOnEscape = createHotkeyAttachment('Escape', () => closePanel())
</script>

<div tabindex="0" {@attach closeOnEscape}>Panel content</div>
```

The attachment registers the hotkey when the element mounts and unregisters it when the element is removed. `createHotkeysAttachment` does the same for an array of hotkeys.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence on an element advances only on key presses inside the element.

### A target is not a scope

Both limit when a hotkey fires, using different signals:

- **`target`** filters by DOM focus, checking which element received the key event.
- **`scope`** filters by UI state, checking which mounted [provider scopes](./hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md-e8237f03.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md) are active regardless of focus.

A single hotkey can use both.
