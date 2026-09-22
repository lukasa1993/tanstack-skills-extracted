# Hotkeys — The hotkey manager

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## The hotkey manager

Under the hood, `useHotkey` uses the singleton `HotkeyManager`. You can access the manager directly if needed:

```tsx
import { getHotkeyManager } from '@tanstack/react-hotkeys'

const manager = getHotkeyManager()

// Check if a hotkey is registered
manager.isRegistered('Mod+S')

// Get total number of registrations
manager.getRegistrationCount()
```

The manager attaches event listeners per target element, so only elements with registered hotkeys get listeners. That beats a single global listener that has to inspect every keystroke.
