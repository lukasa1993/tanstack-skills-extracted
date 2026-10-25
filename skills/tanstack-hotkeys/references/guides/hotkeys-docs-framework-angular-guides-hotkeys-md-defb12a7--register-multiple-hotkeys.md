# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md) · Release-matched documentation · `@tanstack/hotkeys@0.18.0`.

## Register multiple hotkeys

When a component has more than one hotkey, use `injectHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

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
      { hotkey: 'Mod+Z', callback: () => this.undo() },
      { hotkey: 'Mod+Shift+Z', callback: () => this.redo() },
      { hotkey: ['G', 'G'], callback: () => this.scrollToTop(), options: { timeout: 500 } },
    ])
  }
}
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`, as they are for `injectHotkey`.

A callback in the array receives a `context` that can belong to either kind of hotkey. Check `context.kind` before reading `context.parsedChord`:

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

Pass options for every definition as the second argument. A definition's own options override them:

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
      () => ({ target: this.editor()?.nativeElement ?? null }),
    )
  }
}
```

The shared `target` makes all three hotkeys listen on the editor only. [Hotkey targets](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#hotkey-targets) explains targets. Passing the array as a function lets `enabled` follow the `canUndo` signal.

Options merge in this order: provided defaults, then the shared options, then each definition's options.

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
