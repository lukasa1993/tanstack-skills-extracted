# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Register a hotkey

Invoke `useHotkey` in a component's template with a hotkey and a callback:

```gts
import Component from '@glimmer/component'
import { useHotkey } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  save = () => saveDocument()

  <template>
    {{useHotkey 'Mod+S' this.save}}
    <textarea></textarea>
  </template>
}
```

`useHotkey` is a template helper, not a JavaScript function you call. It registers the hotkey while the helper is rendered.

The callback receives the `KeyboardEvent` and a context object. A helper can't tell its callback which kind of hotkey it has, so check `context.kind` before reading `context.parsedChord`:

```ts
import type { HotkeyCallback } from '@tanstack/ember-hotkeys'

save: HotkeyCallback = (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  if (context.kind === 'chord') {
    console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
  }
}
```

The callback reads the component's tracked properties through `this`, so it always sees their current values:

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { useHotkey } from '@tanstack/ember-hotkeys'

export default class Counter extends Component {
  @tracked count = 0
  increment = () => this.count++

  // Logs the current count, not the count when the component was created
  logCount = () => console.log(this.count)

  <template>
    {{useHotkey 'Mod+Shift+C' this.logCount}}
    <button type="button" {{on 'click' this.increment}}>Count: {{this.count}}</button>
  </template>
}
```

The hotkey and its options can change too. Pass tracked values, and the helper updates after rendering. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```gts
import Component from '@glimmer/component'
import { useHotkey } from '@tanstack/ember-hotkeys'
import type { Hotkey } from '@tanstack/ember-hotkeys'

interface EditorSignature {
  Args: { saveHotkey: Hotkey; readOnly: boolean }
}

export default class Editor extends Component<EditorSignature> {
  save = () => saveDocument()

  get canSave() {
    return !this.args.readOnly
  }

  <template>
    {{useHotkey @saveHotkey this.save enabled=this.canSave}}
    <textarea></textarea>
  </template>
}
```

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md-bd36b6cd.md#source-hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./hotkeys-docs-framework-ember-guides-app-hotkeys-md-c66d9482.md#source-hotkeys-docs-framework-ember-guides-app-hotkeys-md).

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and Glint rejects a string that isn't a valid chord:

```hbs
{{useHotkey 'Escape' this.close}}

{{! Command+S on macOS, Control+S elsewhere }}
{{useHotkey 'Mod+S' this.save}}

{{! Modifiers in order: Mod or Control, Alt, Shift, Meta }}
{{useHotkey 'Mod+Alt+Shift+K' this.openCommandLog}}

{{! The W position, whatever the layout types there }}
{{useHotkey '[KeyW]' this.moveUp}}

{{! Type error: Mod comes first }}
{{useHotkey 'Shift+Mod+S' this.saveAs}}
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier. Build it in the template with the `hash` helper from `@ember/helper`, or in a component property:

```gts
import Component from '@glimmer/component'
import { hash } from '@ember/helper'
import { useHotkey } from '@tanstack/ember-hotkeys'
import type { RawHotkeyChord } from '@tanstack/ember-hotkeys'

export default class Shortcuts extends Component {
  saveAs = () => saveDocumentAs()
  runAction = () => run()

  get binding(): RawHotkeyChord {
    return { key: settings.key, mod: settings.mod, shift: settings.shift }
  }

  <template>
    {{! Same as 'Mod+Shift+S' }}
    {{useHotkey (hash key='S' mod=true shift=true) this.saveAs}}
    {{useHotkey this.binding this.runAction}}
  </template>
}
```

Sequence steps can be strings, objects, or a mix:

```hbs
{{useHotkey (array 'G' (hash key='H' shift=true)) this.goToHistory}}
```

Every chord and sequence step registers as a string, so `context.hotkey` shows `'Mod+Shift+S'` for the first object above. [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains codes such as `[KeyW]`.
