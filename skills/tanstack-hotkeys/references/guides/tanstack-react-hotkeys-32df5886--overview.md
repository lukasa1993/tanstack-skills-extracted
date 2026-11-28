# React Hotkeys — Overview

[Guide and prerequisites](./tanstack-react-hotkeys-32df5886.md) · Published skill · `@tanstack/react-hotkeys@0.29.0`.

# TanStack Hotkeys in React

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```tsx
import { useFormatForDisplay, useHotkey } from '@tanstack/react-hotkeys'

export function SaveButton({ onSave }: { onSave: () => void }) {
  useHotkey('Mod+S', () => onSave(), { meta: { name: 'Save' } })
  const formatForDisplay = useFormatForDisplay()

  return (
    <button onClick={onSave}>
      Save <kbd>{formatForDisplay('Mod+S')}</kbd>
    </button>
  )
}
```
