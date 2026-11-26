# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Register a hotkey

Pass a hotkey and callback to `injectHotkey`:

```ts
import { Component } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  template: `<textarea></textarea>`,
})
export class EditorComponent {
  constructor() {
    injectHotkey('Mod+S', () => this.save())
  }

  save() {
    // ...
  }
}
```

Call it in an injection context, such as a constructor or a field initializer.

Callbacks receive the `KeyboardEvent` and a context object:

```ts
injectHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

The callback reads signals when it runs, so it always sees their current values:

```ts
import { Component, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-counter',
  template: `<button (click)="count.set(count() + 1)">Count: {{ count() }}</button>`,
})
export class CounterComponent {
  readonly count = signal(0)

  constructor() {
    // Logs the current count, not the count when the component was created
    injectHotkey('Mod+Shift+C', () => console.log(this.count()))
  }
}
```

The hotkey and its options can change too. Pass them as functions, and `injectHotkey` follows the signals they read. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```ts
import { Component, input } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'
import type { Hotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  template: `<textarea></textarea>`,
})
export class EditorComponent {
  readonly saveHotkey = input.required<Hotkey>()
  readonly readOnly = input(false)

  constructor() {
    injectHotkey(
      () => this.saveHotkey(),
      () => this.save(),
      () => ({ enabled: !this.readOnly() }),
    )
  }

  save() {
    // ...
  }
}
```

A plain options object is read once, so it keeps the values it had when the component was created. An object with getters, such as `{ get enabled() { return !component.readOnly() } }`, follows changes like a function does.

That makes it straightforward to register a hotkey the user chose, such as one from the [hotkey recorder](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md#source-hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./hotkeys-docs-framework-angular-guides-app-hotkeys-md-81139047.md#source-hotkeys-docs-framework-angular-guides-app-hotkeys-md).

### Optional hotkeys

Passing `undefined`, `null`, or `''` registers nothing, which suits optional shortcut props. Switching to one of these values unregisters the hotkey and hides its hints. Passing a valid hotkey again registers it again.

To keep the hotkey registered, visible in devtools and cheat sheets, but paused, leave it defined and pass `enabled: false` instead.

### Write a chord as a string or an object

Most chords are written as strings, which gives you editor autocomplete and compile-time validation:

```ts
injectHotkey('Escape', () => this.close())
injectHotkey('Mod+S', () => this.save()) // Command+S on macOS, Control+S elsewhere
injectHotkey('Mod+Alt+Shift+K', () => this.openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
injectHotkey('[KeyW]', () => this.moveUp()) // The W position, whatever the layout types there

injectHotkey('Shift+Mod+S', () => this.saveAs()) // Type error: Mod comes first
injectHotkey('Mod+Meta+S', () => this.saveAs()) // Type error: Mod is already Meta on macOS
```

String bindings type-check against US QWERTY keys by default. To bind layout-specific keys such as `Ö` or `§`, register those layouts. See [Keyboard Layouts](./hotkeys-docs-framework-angular-guides-keyboard-layouts-md-864b9422.md#source-hotkeys-docs-framework-angular-guides-keyboard-layouts-md).

When building bindings from UI state, such as modifier checkboxes, use a `RawHotkeyChord` object instead:

```ts
injectHotkey({ key: 'S', mod: true, shift: true }, () => this.saveAs()) // Same as 'Mod+Shift+S'
injectHotkey({ code: 'KeyW' }, () => this.moveUp()) // Same as '[KeyW]'

injectHotkey(
  () => {
    const { key, mod, shift } = this.binding()
    return { key, mod, shift }
  },
  () => this.runAction(),
)
```

Sequence steps can be strings, objects, or a mix of both:

```ts
injectHotkey(['G', { key: 'H', shift: true }], () => this.goToHistory())
```

`injectHotkey` registers every chord and sequence step as a string, so `context.hotkey` and devtools show `'Mod+Shift+S'` for the first object above. [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains codes such as `[KeyW]`.
