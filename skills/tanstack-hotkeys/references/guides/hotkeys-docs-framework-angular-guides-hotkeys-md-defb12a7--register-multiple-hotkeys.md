# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Register multiple hotkeys

Use `injectHotkeys` to register an array of `{ hotkey, callback, options? }` entries in one call:

```ts
import { Component } from '@angular/core'
import { injectHotkeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  template: `<textarea></textarea>`,
})
export class EditorComponent {
  constructor() {
    injectHotkeys([
      { hotkey: 'Mod+S', callback: () => this.save() },
      { hotkey: 'Mod+Enter', callback: () => this.publish() },
      { hotkey: 'Mod+D', callback: () => this.duplicate() },
      { hotkey: ['G', 'G'], callback: () => this.scrollToTop(), options: { timeout: 500 } },
    ])
  }
}
```

Chords and sequences can share the same array, and each item's `options` are typed against its own `hotkey`. Inside the array, `context` can belong to either kind, so check `context.kind` before reading `context.parsedChord`:

```ts
injectHotkeys([
  {
    hotkey: 'Mod+S',
    callback: (event, context) => {
      if (context.kind === 'chord') console.log(context.parsedChord.modifiers)
    },
  },
])
```

### Share options

Pass shared options as the second argument. Individual definitions override them:

```ts
import { Component, ElementRef, viewChild } from '@angular/core'
import { injectHotkeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-rich-text-editor',
  template: `<div #editor contenteditable></div>`,
})
export class RichTextEditorComponent {
  private readonly editor = viewChild<ElementRef<HTMLDivElement>>('editor')

  constructor() {
    injectHotkeys(
      () => [
        { hotkey: 'Mod+B', callback: () => this.toggleBold() },
        { hotkey: 'Mod+I', callback: () => this.toggleItalic() },
        { hotkey: 'Mod+Z', callback: () => this.undo(), options: { enabled: this.canUndo() } },
      ],
      { target: this.editor },
    )
  }
}
```

The shared `target` makes every hotkey in the list listen on the editor only. [Hotkey targets](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#hotkey-targets) explains targets. Passing the array as a function lets `enabled` follow the `canUndo` signal.

Options merge in layers: defaults from the provider first, then the shared options, then per-item options.

### Build the list from data

The constructor runs once, so a plain array never changes after it registers. Pass a function that reads your signals for any list whose length can change:

```ts
export class MenuShortcutsComponent {
  readonly items = input.required<Array<MenuItem>>()

  constructor() {
    injectHotkeys(() =>
      this.items().map((item) => ({
        hotkey: item.shortcut,
        callback: item.action,
        options: { enabled: item.enabled },
      })),
    )
  }
}
```

`injectHotkeys` compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.
