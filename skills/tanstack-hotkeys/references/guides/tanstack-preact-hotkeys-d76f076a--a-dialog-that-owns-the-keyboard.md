# Preact Hotkeys — A dialog that owns the keyboard

[Guide and prerequisites](./tanstack-preact-hotkeys-d76f076a.md) · Published skill · `@tanstack/preact-hotkeys@0.26.0`.

## A dialog that owns the keyboard

```tsx no-check
import { HotkeysProvider, useHotkey } from '@tanstack/preact-hotkeys'
import { useId } from 'preact/hooks'
import type { ComponentChildren } from 'preact'

export function Dialog(props: {
  onClose: () => void
  children: ComponentChildren
}) {
  return (
    <HotkeysProvider scope={`dialog-${useId()}`} exclusive>
      <DialogBody {...props} />
    </HotkeysProvider>
  )
}

function DialogBody({
  onClose,
  children,
}: {
  onClose: () => void
  children: ComponentChildren
}) {
  useHotkey('Escape', onClose)
  return <div role="dialog">{children}</div>
}
```

A hook uses the nearest `HotkeysProvider` above its component. Registering `Escape` in `Dialog` itself would put it in the outer scope, which the exclusive scope suspends, so the dialog couldn't close. `useId` (Preact 10.11 or newer) gives each open dialog its own scope.
