# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Register multiple hotkeys

When a component has more than one hotkey, use `useHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

```gts
import Component from '@glimmer/component'
import { useHotkeys } from '@tanstack/ember-hotkeys'
import type { EmberHotkeyDefinition } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  shortcuts: Array<EmberHotkeyDefinition> = [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ]

  <template>
    {{useHotkeys this.shortcuts}}
    <textarea></textarea>
  </template>
}
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`.

### Share options

Pass options for every definition as named arguments. A definition's own options override them. This editor's formatting hotkeys toggle, so they share `requireReset=true` to fire once per press, while undo keeps repeating:

```gts
import Component from '@glimmer/component'
import { onHotkeys } from '@tanstack/ember-hotkeys'
import type { EmberHotkeyDefinition } from '@tanstack/ember-hotkeys'

export default class RichTextEditor extends Component {
  shortcuts: Array<EmberHotkeyDefinition> = [
    { hotkey: 'Mod+B', callback: () => toggleBold() },
    { hotkey: 'Mod+I', callback: () => toggleItalic() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { requireReset: false } },
  ]

  <template>
    <div contenteditable {{onHotkeys this.shortcuts requireReset=true}}></div>
  </template>
}
```

The `onHotkeys` modifier also makes all three hotkeys listen on the editor only. [Hotkey targets](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md#hotkey-targets) explains the modifiers.

Options merge in this order: `createHotkeysScope` defaults, then the shared options, then each definition's options.

### Build the list from data

For a list whose length can change, pass a tracked array or a getter that reads tracked state. Replace the array to add or remove entries:

```ts
get shortcuts(): Array<EmberHotkeyDefinition> {
  return this.args.items.map((item) => ({
    hotkey: item.shortcut,
    callback: item.action,
    options: { enabled: item.enabled },
  }))
}
```

The helper compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.
