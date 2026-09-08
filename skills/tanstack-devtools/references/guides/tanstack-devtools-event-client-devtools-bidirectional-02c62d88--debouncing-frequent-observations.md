# Devtools Bidirectional — Debouncing Frequent Observations

[Guide and prerequisites](./tanstack-devtools-event-client-devtools-bidirectional-02c62d88.md) · Published skill · `@tanstack/devtools-event-client@0.5.0`.

## Debouncing Frequent Observations

High-frequency state changes (e.g., mouse tracking, animation frames) can flood the event bus. Debounce on the emit side:

```ts
import { storeInspector } from './store-inspector-client'

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function emitStateUpdate(storeName: string, state: unknown) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    storeInspector.emit('state-update', {
      storeName,
      state: structuredClone(state),
      timestamp: Date.now(),
    })
  }, 16) // ~60fps cap
}
```

Do not debounce command events. Commands are user-initiated and infrequent.
