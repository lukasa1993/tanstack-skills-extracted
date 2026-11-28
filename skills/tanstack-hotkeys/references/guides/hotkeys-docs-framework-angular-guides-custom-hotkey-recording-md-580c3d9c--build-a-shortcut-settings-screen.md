# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Build a shortcut settings screen

For app-wide settings, pair [App Hotkeys](./hotkeys-docs-framework-angular-guides-app-hotkeys-md-81139047.md#source-hotkeys-docs-framework-angular-guides-app-hotkeys-md) with `setCustomHotkey` so cheat sheets, persistence, and conflict checks for unmounted routes stay in one place.

For a few hotkeys in one component, signals are enough:

```ts
import { Component, signal } from '@angular/core'
import {
  injectFormatForDisplay,
  injectHotkeyRecorder,
  injectHotkeys,
} from '@tanstack/angular-hotkeys'
import type { Hotkey } from '@tanstack/angular-hotkeys'

type Action = 'save' | 'undo' | 'search'

@Component({
  selector: 'app-shortcut-settings',
  template: `
    @for (entry of entries(); track entry[0]) {
      <button (click)="edit(entry[0])">
        {{ entry[0] }}:
        {{ editing() === entry[0] && recorder.isRecording() ? 'Press keys...' : formatForDisplay(entry[1]) }}
      </button>
    }
  `,
})
export class ShortcutSettingsComponent {
  readonly formatForDisplay = injectFormatForDisplay()
  readonly shortcuts = signal<Record<Action, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  })
  readonly editing = signal<Action | null>(null)
  readonly entries = () => Object.entries(this.shortcuts()) as Array<[Action, Hotkey]>

  readonly recorder = injectHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => {
      const action = this.editing()
      if (action) this.shortcuts.update((prev) => ({ ...prev, [action]: hotkey }))
      this.editing.set(null)
    },
    onCancel: () => this.editing.set(null),
  })

  constructor() {
    // Register each action with its current hotkey
    injectHotkeys(() =>
      this.entries().map(([action, hotkey]) => ({
        hotkey,
        callback: () => this.run(action),
      })),
    )
  }

  edit(action: Action) {
    this.editing.set(action)
    this.recorder.startRecording()
  }

  run(action: Action) {
    /* ... */
  }
}
```
