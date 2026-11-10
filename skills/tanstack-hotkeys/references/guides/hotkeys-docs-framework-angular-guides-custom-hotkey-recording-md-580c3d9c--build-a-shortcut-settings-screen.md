# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

## Build a shortcut settings screen

For an app-wide settings screen, declare your hotkeys as [app hotkeys](./hotkeys-docs-framework-angular-guides-app-hotkeys-md-81139047.md#source-hotkeys-docs-framework-angular-guides-app-hotkeys-md), and save each recording with `setCustomHotkey`. That keeps cheat sheets, conflict checks, and saved choices in one place. [Change hotkeys](./hotkeys-docs-framework-angular-guides-app-hotkeys-md-81139047.md#source-hotkeys-docs-framework-angular-guides-app-hotkeys-md) shows a settings row built that way.

For a few hotkeys in one component, signals are enough:

```ts
import { Component, signal } from '@angular/core'
import {
  formatForDisplay,
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
        {{ editing() === entry[0] && recorder.isRecording() ? 'Press keys...' : format(entry[1]) }}
      </button>
    }
  `,
})
export class ShortcutSettingsComponent {
  readonly format = formatForDisplay
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
