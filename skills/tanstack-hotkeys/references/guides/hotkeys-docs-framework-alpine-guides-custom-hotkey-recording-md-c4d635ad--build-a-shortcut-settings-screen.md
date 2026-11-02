# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md) · Release-matched documentation · `@tanstack/hotkeys@0.24.0`.

## Build a shortcut settings screen

For an app-wide settings screen, declare your hotkeys as [app hotkeys](./hotkeys-docs-framework-alpine-guides-app-hotkeys-md-06d36fd9.md#source-hotkeys-docs-framework-alpine-guides-app-hotkeys-md), and save each recording with `setCustomHotkey`. That keeps cheat sheets, conflict checks, and saved choices in one place. [Change hotkeys](./hotkeys-docs-framework-alpine-guides-app-hotkeys-md-06d36fd9.md#source-hotkeys-docs-framework-alpine-guides-app-hotkeys-md) shows a settings row built that way.

For a few hotkeys in one component, Alpine state is enough:

```ts
import Alpine from 'alpinejs'
import {
  createHotkeyRecorder,
  createHotkeysScope,
  formatForDisplay,
} from '@tanstack/alpine-hotkeys'
import type { AlpineHotkeyRecorder, Hotkey } from '@tanstack/alpine-hotkeys'

type Action = 'save' | 'undo' | 'search'

Alpine.data('shortcutSettings', () => ({
  hotkeys: createHotkeysScope(),
  formatForDisplay,
  shortcuts: { save: 'Mod+S', undo: 'Mod+Z', search: ['G', 'S'] } as Record<Action, Hotkey>,
  editing: null as Action | null,
  recorder: null as AlpineHotkeyRecorder | null,
  init() {
    this.recorder = createHotkeyRecorder(this.hotkeys, {
      maxSteps: Infinity,
      onRecord: (hotkey) => {
        if (this.editing) this.shortcuts = { ...this.shortcuts, [this.editing]: hotkey }
        this.editing = null
      },
      onCancel: () => (this.editing = null),
    })

    // Register each action with its current hotkey
    this.hotkeys.createHotkeys(() =>
      Object.entries(this.shortcuts).map(([action, hotkey]) => ({
        hotkey,
        callback: () => this.run(action as Action),
      })),
    )
  },
  edit(action: Action) {
    this.editing = action
    this.recorder?.startRecording()
  },
  run(action: Action) {
    /* ... */
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

```html
<div x-data="shortcutSettings">
  <template x-for="(hotkey, action) in shortcuts" :key="action">
    <button
      @click="edit(action)"
      x-text="`${action}: ${editing === action && recorder?.isRecording ? 'Press keys...' : formatForDisplay(hotkey)}`"
    ></button>
  </template>
</div>
```
