# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.18.0`.

## Register a hotkey

Call `useHotkey` in a component's `setup` with a hotkey and a callback:

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => saveDocument())
</script>

<template>
  <textarea />
</template>
```

The callback receives the `KeyboardEvent` and a context object:

```ts
useHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

`setup` runs once, and the callback reads refs and props when it runs, so it always sees their current values:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const count = ref(0)

// Logs the current count, not the count when the component was created
useHotkey('Mod+Shift+C', () => console.log(count.value))
</script>

<template>
  <button @click="count++">Count: {{ count }}</button>
</template>
```

The hotkey and its options can change too. Pass them as getters or refs, and the composable follows them. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'
import type { Hotkey } from '@tanstack/vue-hotkeys'

const props = defineProps<{ saveHotkey: Hotkey; readOnly: boolean }>()

useHotkey(
  () => props.saveHotkey,
  () => save(),
  () => ({ enabled: !props.readOnly }),
)
</script>
```

A plain options object is read once, so `{ enabled: !props.readOnly }` keeps the value from when `setup` ran. A ref also works for a single option, such as `{ enabled: isEditing }`.

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./hotkeys-docs-framework-vue-guides-custom-hotkey-recording-md-c0532132.md#source-hotkeys-docs-framework-vue-guides-custom-hotkey-recording-md). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./hotkeys-docs-framework-vue-guides-app-hotkeys-md-a950ea41.md#source-hotkeys-docs-framework-vue-guides-app-hotkeys-md).

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and TypeScript rejects a string that isn't a valid chord:

```ts
useHotkey('Escape', () => close())
useHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
useHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
useHotkey('[KeyW]', () => moveUp()) // The W position, whatever the layout types there

useHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod comes first
useHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod is already Meta on macOS
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier:

```ts
useHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
useHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

useHotkey(
  () => ({ key: binding.value.key, mod: binding.value.mod, shift: binding.value.shift }),
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix:

```ts
useHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

The composable registers every chord and sequence step as a string, so `context.hotkey` and devtools show `'Mod+Shift+S'` for the first object above. [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains codes such as `[KeyW]`.
