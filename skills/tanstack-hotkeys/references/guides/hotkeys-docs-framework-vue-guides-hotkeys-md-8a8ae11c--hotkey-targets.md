# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to a template ref, an element, `document`, or `window` to listen somewhere else:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const panel = ref<HTMLDivElement | null>(null)

// Fires only while the panel, or something inside it, has focus
useHotkey('Escape', () => closePanel(), { target: panel })
</script>

<template>
  <div ref="panel" tabindex="0">Panel content</div>
</template>
```

A target that is `null` or `undefined` waits until the element is mounted. Only an omitted `target` listens on `document`, so a wrapper that forwards an unset `target` waits too. Set `target: document` to choose the document explicitly.

A template ref on a component listens on the component's root element:

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'
import PanelCard from './PanelCard.vue'

const card = useTemplateRef<InstanceType<typeof PanelCard>>('card')

useHotkey('Escape', () => closePanel(), { target: card })
</script>

<template>
  <PanelCard ref="card" tabindex="0" />
</template>
```

The hotkey reads the root element when the ref is set and doesn't follow later changes inside the component. A component whose template has more than one root node, or only text, has no root element, so its hotkey registers nothing. A root element that the component adds or replaces later, such as one behind `v-if`, isn't picked up. Put the ref on an element instead.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

A target and a [scope](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both.
