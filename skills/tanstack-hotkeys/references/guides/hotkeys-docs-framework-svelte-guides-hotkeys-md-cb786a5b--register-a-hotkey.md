# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Register a hotkey

Call `createHotkey` in a component's script with a hotkey and a callback:

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => saveDocument())
</script>

<textarea></textarea>
```

The callback receives the `KeyboardEvent` and a context object:

```ts
createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

The script runs once, and the callback reads state and props when it runs, so it always sees their current values:

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let count = $state(0)

  // Logs the current count, not the count when the component was created
  createHotkey('Mod+Shift+C', () => console.log(count))
</script>

<button onclick={() => count++}>Count: {count}</button>
```

The hotkey and its options can change too. Pass them as getters, and the function follows the state they read. When only the options change, it updates the existing registration. When the hotkey changes, it replaces the registration:

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'

  let { saveHotkey, readOnly }: { saveHotkey: Hotkey; readOnly: boolean } =
    $props()

  createHotkey(
    () => saveHotkey,
    () => save(),
    () => ({ enabled: !readOnly }),
  )
</script>
```

A plain options object is read once, so `{ enabled: !readOnly }` keeps the value from when the script ran. An object with getters, such as `{ get enabled() { return !readOnly } }`, follows changes like a getter function does.

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md-3971f427.md#source-hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./hotkeys-docs-framework-svelte-guides-app-hotkeys-md-bdf9b10d.md#source-hotkeys-docs-framework-svelte-guides-app-hotkeys-md).

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and TypeScript rejects a string that isn't a valid chord:

```ts
createHotkey('Escape', () => close())
createHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
createHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
createHotkey('[KeyW]', () => moveUp()) // The W position, whatever the layout types there

createHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod comes first
createHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod is already Meta on macOS
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier:

```ts
createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
createHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

createHotkey(
  () => ({ key: binding.key, mod: binding.mod, shift: binding.shift }),
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix:

```ts
createHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

The function registers every chord and sequence step as a string, so `context.hotkey` and devtools show `'Mod+Shift+S'` for the first object above. [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains codes such as `[KeyW]`.
