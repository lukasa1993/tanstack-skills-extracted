# Solid Hotkeys — Overview

[Guide and prerequisites](./tanstack-solid-hotkeys-a9ad9600.md) · Published skill · `@tanstack/solid-hotkeys@0.28.0`.

# TanStack Hotkeys in Solid

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

This adapter needs Solid 2 (`solid-js` 2 with `@solidjs/web`), so write Solid 2 code: two-function `createEffect`, `onSettled` instead of `onMount`, `<Context value>`, and lowercase attributes such as `tabindex`. Solid 1 apps use `@tanstack/solid-hotkeys@0.25`, the last release for Solid 1.

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'
import { createSignal } from 'solid-js'

export function Editor() {
  const [isDirty, setIsDirty] = createSignal(false)
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)

  createHotkey(
    'Mod+S',
    () => save(),
    () => ({ enabled: isDirty() }),
  )
  createHotkey(
    'Escape',
    () => closePanel(),
    () => ({ target: panel() }),
  )

  return <div ref={setPanel} tabindex={0} onInput={() => setIsDirty(true)} />
}
```
