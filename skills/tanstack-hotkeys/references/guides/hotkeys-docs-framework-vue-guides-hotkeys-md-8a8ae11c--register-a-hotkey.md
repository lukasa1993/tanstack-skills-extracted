# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Register a hotkey

Pass a hotkey and callback to `useHotkey` in a component's `setup`:

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => saveDocument())
</script>

<template>
  <textarea />
</template>
```

Callbacks receive the `KeyboardEvent` and a context object:

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

Give a ref that holds a hotkey the `Hotkey` type: `const saveHotkey = ref<Hotkey>('Mod+S')`. Without it, the ref is a `Ref<string>`, and `useHotkey` accepts only valid hotkeys.

That makes it straightforward to register a hotkey the user chose, such as one from the [hotkey recorder](./hotkeys-docs-framework-vue-guides-custom-hotkey-recording-md-c0532132.md#source-hotkeys-docs-framework-vue-guides-custom-hotkey-recording-md). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./hotkeys-docs-framework-vue-guides-app-hotkeys-md-a950ea41.md#source-hotkeys-docs-framework-vue-guides-app-hotkeys-md).

### Optional hotkeys

Passing `undefined`, `null`, or `''` registers nothing, which suits optional shortcut props. Switching to one of these values unregisters the hotkey and hides its hints. Passing a valid hotkey again registers it again.

To keep the hotkey registered, visible in devtools and cheat sheets, but paused, leave it defined and pass `enabled: false` instead.

### Write a chord as a string or an object

Most chords are written as strings, which gives you editor autocomplete and compile-time validation:

```ts
useHotkey('Escape', () => close())
useHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
useHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
useHotkey('[KeyW]', () => moveUp()) // The W position, whatever the layout types there

useHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod comes first
useHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod is already Meta on macOS
```

String bindings type-check against US QWERTY keys by default. To bind layout-specific keys such as `Ö` or `§`, register those layouts. See [Keyboard Layouts](./hotkeys-docs-framework-vue-guides-keyboard-layouts-md-d2fcb108.md#source-hotkeys-docs-framework-vue-guides-keyboard-layouts-md).

When building bindings from UI state, such as modifier checkboxes, use a `RawHotkeyChord` object instead:

```ts
useHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
useHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

useHotkey(
  () => ({ key: binding.value.key, mod: binding.value.mod, shift: binding.value.shift }),
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix of both:

```ts
useHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

The composable registers every chord and sequence step as a string, so `context.hotkey` and devtools show `'Mod+Shift+S'` for the first object above. [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains codes such as `[KeyW]`.
