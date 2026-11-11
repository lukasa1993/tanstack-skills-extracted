# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md-7d47b3ce.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Build a shortcut settings screen

For an app-wide settings screen, declare your hotkeys as [app hotkeys](./hotkeys-docs-framework-lit-guides-app-hotkeys-md-6d116aa2.md#source-hotkeys-docs-framework-lit-guides-app-hotkeys-md), and save each recording with `setCustomHotkey`. That keeps cheat sheets, conflict checks, and saved choices in one place. [Change hotkeys](./hotkeys-docs-framework-lit-guides-app-hotkeys-md-6d116aa2.md#source-hotkeys-docs-framework-lit-guides-app-hotkeys-md) shows a settings row built that way.

For a few hotkeys in one element, reactive state is enough:

```ts
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
  HotkeyController,
  HotkeyRecorderController,
  formatForDisplay,
} from '@tanstack/lit-hotkeys'
import type { Hotkey } from '@tanstack/lit-hotkeys'

type Action = 'save' | 'undo' | 'search'

@customElement('shortcut-settings')
class ShortcutSettings extends LitElement {
  @state() shortcuts: Record<Action, Hotkey> = {
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  }
  @state() editing: Action | null = null

  private recorder = new HotkeyRecorderController(this, {
    maxSteps: Infinity,
    onRecord: (hotkey) => {
      if (this.editing) this.shortcuts = { ...this.shortcuts, [this.editing]: hotkey }
      this.editing = null
    },
    onCancel: () => (this.editing = null),
  })

  constructor() {
    super()
    // Register each action with its current hotkey. Each controller adds itself.
    for (const action of ['save', 'undo', 'search'] as const) {
      new HotkeyController(this, () => this.shortcuts[action], () => this.run(action))
    }
  }

  render() {
    return Object.entries(this.shortcuts).map(
      ([action, hotkey]) => html`
        <button
          @click=${() => {
            this.editing = action as Action
            this.recorder.startRecording()
          }}
        >
          ${action}:
          ${this.editing === action && this.recorder.isRecording
            ? 'Press keys...'
            : formatForDisplay(hotkey)}
        </button>
      `,
    )
  }

  run(action: Action) {
    /* ... */
  }
}
```
