# React Hotkeys — A dialog that owns the keyboard

[Guide and prerequisites](./tanstack-react-hotkeys-32df5886.md) · Published skill · `@tanstack/react-hotkeys@0.29.0`.

## A dialog that owns the keyboard

```tsx
import { HotkeysProvider, useHotkey } from '@tanstack/react-hotkeys'
import { useId } from 'react'
import type { ReactNode } from 'react'

export function Dialog(props: { onClose: () => void; children: ReactNode }) {
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
  children: ReactNode
}) {
  useHotkey('Escape', onClose)
  return <div role="dialog">{children}</div>
}
```

A hook uses the nearest `HotkeysProvider` above its component. Registering `Escape` in `Dialog` itself would put it in the outer scope, which the exclusive scope suspends, so the dialog couldn't close. `useId` gives each open dialog its own scope.
