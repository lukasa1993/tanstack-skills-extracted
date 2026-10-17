# Hotkeys — The hotkey manager

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## The hotkey manager

Under the hood, `useHotkey` uses the singleton `HotkeyManager`, which handles chords and sequences alike. You can access the manager directly if needed:

```tsx
import { getHotkeyManager } from '@tanstack/react-hotkeys'

const manager = getHotkeyManager()

// Register outside React; returns a handle with setOptions and unregister
const handle = manager.register(['G', 'G'], () => scrollToTop(), { timeout: 500 })

// Check if a hotkey is registered
manager.isRegistered('Mod+S')

// Get total number of registrations
manager.getRegistrationCount()

// Reset in-progress sequences
manager.resetSequenceProgress()
```

The manager attaches event listeners per target element, so only elements with registered hotkeys get listeners. That beats a single global listener that has to inspect every keystroke.
