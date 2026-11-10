# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md-bd36b6cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

## Build a shortcut settings screen

For an app-wide settings screen, declare your hotkeys as [app hotkeys](./hotkeys-docs-framework-ember-guides-app-hotkeys-md-c66d9482.md#source-hotkeys-docs-framework-ember-guides-app-hotkeys-md), and save each recording with `setCustomHotkey`. That keeps cheat sheets, conflict checks, and saved choices in one place. [Change hotkeys](./hotkeys-docs-framework-ember-guides-app-hotkeys-md-c66d9482.md#source-hotkeys-docs-framework-ember-guides-app-hotkeys-md) shows a settings row built that way.

For a few hotkeys in one component, tracked state is enough:

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { fn } from '@ember/helper'
import { on } from '@ember/modifier'
import {
  formatForDisplay,
  useHotkeyRecorder,
  useHotkeys,
} from '@tanstack/ember-hotkeys'
import type { EmberHotkeyDefinition, Hotkey } from '@tanstack/ember-hotkeys'

type Action = 'save' | 'undo' | 'search'

export default class ShortcutSettings extends Component {
  @tracked shortcuts: Record<Action, Hotkey> = {
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  }
  @tracked editing: Action | null = null

  recorder = useHotkeyRecorder(this, {
    maxSteps: Infinity,
    onRecord: (hotkey) => {
      if (this.editing) this.shortcuts = { ...this.shortcuts, [this.editing]: hotkey }
      this.editing = null
    },
    onCancel: () => (this.editing = null),
  })

  // Register each action with its current hotkey
  get definitions(): Array<EmberHotkeyDefinition> {
    return Object.entries(this.shortcuts).map(([action, hotkey]) => ({
      hotkey,
      callback: () => this.run(action as Action),
    }))
  }

  get entries() {
    return Object.entries(this.shortcuts).map(([action, hotkey]) => ({
      action: action as Action,
      label:
        this.editing === action && this.recorder.isRecording
          ? 'Press keys...'
          : formatForDisplay(hotkey),
    }))
  }

  edit = (action: Action) => {
    this.editing = action
    this.recorder.startRecording()
  }

  run(action: Action) {
    /* ... */
  }

  <template>
    {{useHotkeys this.definitions}}
    {{#each this.entries as |entry|}}
      <button type='button' {{on 'click' (fn this.edit entry.action)}}>
        {{entry.action}}: {{entry.label}}
      </button>
    {{/each}}
  </template>
}
```
