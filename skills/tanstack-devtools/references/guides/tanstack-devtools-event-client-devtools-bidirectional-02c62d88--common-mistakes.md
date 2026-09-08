# Devtools Bidirectional — Common Mistakes

[Guide and prerequisites](./tanstack-devtools-event-client-devtools-bidirectional-02c62d88.md) · Published skill · `@tanstack/devtools-event-client@0.5.0`.

## Common Mistakes

### 1. Not using structuredClone for snapshots (HIGH)

Without `structuredClone`, snapshot payloads hold references to the live state object. When the app mutates state later, every stored snapshot in the panel is silently corrupted.

Wrong:

```ts
timeTravelClient.emit('snapshot', {
  state,
  timestamp: Date.now(),
  label: action.type,
})
```

The panel stores `event.payload.state`, which is a reference to the app's `state` variable. On the next mutation, the panel's stored snapshot now reflects the new state, not the historical state.

Correct:

```ts
timeTravelClient.emit('snapshot', {
  state: structuredClone(state),
  timestamp: Date.now(),
  label: action.type,
})
```

`structuredClone` creates a deep copy. The snapshot is frozen in time regardless of future mutations. This applies to any observation event where the panel accumulates historical data -- not just time-travel.

### 2. Non-serializable payloads in cross-tab scenarios (HIGH)

When using the server event bus (WebSocket/SSE/BroadcastChannel), payloads are serialized for transport. Functions, DOM nodes, class instances with methods, `Map`, `Set`, `WeakRef`, and circular references all fail silently or lose data.

This is especially dangerous in bidirectional patterns because command payloads flow panel-to-app and may cross transport boundaries.

Wrong:

```ts
storeInspector.emit('set-state', {
  storeName: 'main',
  state: {
    items: new Map([['a', 1]]), // Map -- lost on serialization
    onClick: () => alert('hi'), // Function -- lost on serialization
    ref: document.getElementById('x'), // DOM node -- lost on serialization
  },
})
```

Correct:

```ts
storeInspector.emit('set-state', {
  storeName: 'main',
  state: {
    items: Object.fromEntries(new Map([['a', 1]])),
    timestamp: Date.now(),
  },
})
```

Rule of thumb: if `JSON.parse(JSON.stringify(payload))` does not round-trip cleanly, the payload is not safe for the event bus.

### 3. Not distinguishing observation from command events (MEDIUM)

Mixing naming conventions makes the event map confusing and error-prone. Developers end up emitting observation events from the panel or command events from the app, breaking the communication contract.

Wrong:

```ts
type MyEvents = {
  state: unknown // Is this observation or command?
  update: unknown // Who emits this?
  count: number // Unclear direction
}
```

Correct:

```ts
type MyEvents = {
  'state-update': unknown // Observation: describes what happened
  'set-state': unknown // Command: describes what to do
  'count-changed': number // Observation: past tense / descriptive
  reset: void // Command: imperative
}
```

Use observation suffixes that describe what happened (`-update`, `-changed`, `-dispatched`, `-caught`). Use command suffixes that describe what to do (`set-`, `dispatch-`, `reset`, `revert`). The naming convention is not enforced by the API, but consistent naming prevents wiring mistakes.
