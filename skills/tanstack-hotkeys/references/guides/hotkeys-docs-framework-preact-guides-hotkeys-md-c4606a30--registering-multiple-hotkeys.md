# Hotkeys — Registering multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## Registering multiple hotkeys

To register several hotkeys at once, or a dynamic list whose length isn't known at compile time, use the `useHotkeys` (plural) hook instead of calling `useHotkey` multiple times. You can't call hooks conditionally or in loops, so a single hook that takes an array is the way to handle a variable number of shortcuts.

```tsx
import { useHotkeys } from '@tanstack/preact-hotkeys'

function Editor() {
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
    { hotkey: 'Escape', callback: () => close() },
  ])
}
```

Each definition's `options` are typed by its `hotkey`, just like `useHotkey`.

### Common options with per-hotkey overrides

Pass shared options as the second argument. Per-definition options override the common ones. Options merge in this order: `HotkeysProvider` defaults, then the common options, then each definition's options. A common `timeout` or `requireReset` applies only to the definitions of the matching kind.

```tsx
useHotkeys(
  [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: false } },
  ],
  { preventDefault: true },
)
```

### Dynamic hotkey lists

Because `useHotkeys` accepts a plain array, you can derive it from data:

```tsx
function MenuShortcuts({ items }) {
  useHotkeys(
    items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )
}
```

The hook diffs the array between renders by array index plus the normalized hotkey, registering new hotkeys and unregistering removed ones automatically. Reordering the array changes that identity, so reordered entries are unregistered and re-registered even if their callback references stay the same.
