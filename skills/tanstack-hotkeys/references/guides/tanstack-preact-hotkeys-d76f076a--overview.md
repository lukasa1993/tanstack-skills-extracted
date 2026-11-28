# Preact Hotkeys — Overview

[Guide and prerequisites](./tanstack-preact-hotkeys-d76f076a.md) · Published skill · `@tanstack/preact-hotkeys@0.26.0`.

# TanStack Hotkeys in Preact

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```tsx
import { useFormatForDisplay, useHotkey } from '@tanstack/preact-hotkeys'

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
