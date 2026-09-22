# Hotkeys — The hotkey manager

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## The hotkey manager

Under the hood, both the decorator and controller use the singleton `HotkeyManager`. You can access the manager directly when needed:

```ts
import { getHotkeyManager } from '@tanstack/lit-hotkeys'

const manager = getHotkeyManager()

// Check if a hotkey is registered
manager.isRegistered('Mod+S')

// Get total number of registrations
manager.getRegistrationCount()
```

The manager attaches event listeners per target element, so only elements that have registered hotkeys receive listeners. That beats a single global listener that has to inspect every keystroke.
