# Hotkeys — Registering multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Registering multiple hotkeys

When you need to register several hotkeys at once, or a dynamic, variable-length list, use the `useHotkeys` (plural) hook instead of calling `useHotkey` multiple times. This matters when the number of shortcuts is not known at compile time, since calling hooks conditionally or in loops violates the rules of hooks.

```tsx
import { useHotkeys } from '@tanstack/preact-hotkeys'

function Editor() {
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Escape', callback: () => close() },
  ])
}
```

### Common options with per-hotkey overrides

Pass shared options as the second argument. Per-definition options override the common ones:

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

The hook diffs the array between renders by array index plus the normalized hotkey string, registering new hotkeys and unregistering removed ones automatically. Reordering the array changes that identity, so reordered entries are unregistered and re-registered even if their callback references stay the same.
