# Events and instrumentation

Event client, instrumentation, and bidirectional events.

<a id="source-tanstack-devtools-event-client"></a>

## Devtools Event Client

Source: `tanstack-devtools-event-client`.

## devtools-event-client

Typed event emitter/listener that connects application code to TanStack Devtools panels. Framework-agnostic. Works in React, Vue, Solid, Preact, and vanilla JS.

### Setup

Install the package:

```bash
npm i @tanstack/devtools-event-client
```

The package has two entry points — the root export (the real client in development, a no-op tree-shaken out of production), and the `/production` subpath (always the real client, for libraries that want devtools events in production):

```ts
import { EventClient } from '@tanstack/devtools-event-client'
```

#### Constructor Options

| Option             | Type      | Required | Default | Description                                                                           |
| ------------------ | --------- | -------- | ------- | ------------------------------------------------------------------------------------- |
| `pluginId`         | `string`  | Yes      | --      | Identifies this plugin in the event system. Must be unique across all plugins.        |
| `debug`            | `boolean` | No       | `false` | Enable verbose console logging prefixed with `[tanstack-devtools:{pluginId}-plugin]`. |
| `enabled`          | `boolean` | No       | `true`  | When `false`, `emit()` is a no-op and `on()` returns a no-op cleanup function.        |
| `reconnectEveryMs` | `number`  | No       | `300`   | Interval in ms between connection retry attempts (max 5 retries).                     |

### Core Patterns

#### 1. Define an Event Map and Create a Singleton Client

Define a TypeScript type mapping event suffixes to payload types. Extend `EventClient` and export a single instance at module level.

```ts
import { EventClient } from '@tanstack/devtools-event-client'

type StoreEvents = {
  'state-changed': { storeName: string; state: unknown; timestamp: number }
  'action-dispatched': { storeName: string; action: string; payload: unknown }
  reset: void
}

class StoreInspectorClient extends EventClient<StoreEvents> {
  constructor() {
    super({ pluginId: 'store-inspector' })
  }
}

// Module-level singleton -- one instance per plugin
export const storeInspector = new StoreInspectorClient()
```

Event map keys are suffixes only. The `pluginId` is prepended automatically. With `pluginId: 'store-inspector'` and key `'state-changed'`, the fully qualified event on the bus is `'store-inspector:state-changed'`.

#### 2. Emit Events

Call `emit(suffix, payload)` from library code. Pass only the suffix.

```ts
function dispatch(action: string, payload: unknown) {
  state = reducer(state, action, payload)

  storeInspector.emit('state-changed', {
    storeName: 'main',
    state,
    timestamp: Date.now(),
  })
  storeInspector.emit('action-dispatched', {
    storeName: 'main',
    action,
    payload,
  })
}
```

If the bus is not connected yet, events are queued in memory and flushed once the connection succeeds. If the connection fails after 5 retries (1.5s at default settings), the client gives up and subsequent `emit()` calls are silently dropped.

Connection to the bus is initiated lazily on the first `emit()` call, not on construction or `on()`.

#### 3. Listen to Events

All listener methods return a cleanup function.

**`on(suffix, callback)`** -- listen to a specific event from this plugin:

```ts
const cleanup = storeInspector.on('state-changed', (event) => {
  // event.type    === 'store-inspector:state-changed'
  // event.payload === { storeName: string; state: unknown; timestamp: number }
  // event.pluginId === 'store-inspector'
  console.log(event.payload.state)
})

// Stop listening
cleanup()
```

**`on(suffix, callback, { withEventTarget: true })`** -- also register on an internal EventTarget so events emitted and listened to on the same client instance are delivered immediately without going through the global bus:

```ts
const cleanup = storeInspector.on(
  'state-changed',
  (event) => {
    console.log(event.payload.state)
  },
  { withEventTarget: true },
)
```

**`onAll(callback)`** -- listen to all events from all plugins:

```ts
const cleanup = storeInspector.onAll((event) => {
  console.log(event.type, event.payload)
})
```

**`onAllPluginEvents(callback)`** -- listen to all events from this plugin only (filtered by `pluginId`):

```ts
const cleanup = storeInspector.onAllPluginEvents((event) => {
  // Only fires when event.pluginId === 'store-inspector'
  console.log(event.type, event.payload)
})
```

#### 4. Connection Lifecycle and Disabling

The connection lifecycle is:

1. First `emit()` dispatches `tanstack-connect` and starts a retry loop.
2. Retries every `reconnectEveryMs` (default 300ms), up to 5 attempts.
3. On `tanstack-connect-success`, queued events are flushed in order.
4. After 5 failed retries, `failedToConnect` is set permanently. All subsequent `emit()` calls are silently dropped (not queued).

To disable the client entirely (e.g., in production):

```ts
class StoreInspectorClient extends EventClient<StoreEvents> {
  constructor() {
    super({
      pluginId: 'store-inspector',
      enabled: process.env.NODE_ENV !== 'production',
    })
  }
}
```

When `enabled` is `false`, `emit()` is a no-op and `on()`/`onAll()`/`onAllPluginEvents()` return no-op cleanup functions.

### Common Mistakes

#### 1. Including pluginId prefix in event names (CRITICAL)

`EventClient` auto-prepends the `pluginId` to all event names. Including the prefix manually produces a double-prefixed event name that nothing will match.

Wrong:

```ts
storeInspector.emit('store-inspector:state-changed', data)
// Dispatches 'store-inspector:store-inspector:state-changed'
```

Correct:

```ts
storeInspector.emit('state-changed', data)
// Dispatches 'store-inspector:state-changed'
```

This applies to `on()` as well. Pass only the suffix.

#### 2. Creating multiple EventClient instances per plugin (CRITICAL)

Each `EventClient` instance manages its own connection, event queue, and listeners independently. Creating multiple instances for the same plugin causes duplicate handlers, multiple connection attempts, and unpredictable event delivery.

Wrong:

```tsx
function MyComponent() {
  // New instance on every render
  const client = new StoreInspectorClient()
  client.emit('state-changed', data)
}
```

Correct:

```ts
// store-inspector-client.ts
export const storeInspector = new StoreInspectorClient()

// MyComponent.tsx
import { storeInspector } from './store-inspector-client'
function MyComponent() {
  storeInspector.emit('state-changed', data)
}
```

#### 3. Non-unique pluginId causing event collisions (CRITICAL)

Two plugins with the same `pluginId` share an event namespace. Events emitted by one are received by listeners on the other. Choose a unique, descriptive `pluginId` (e.g., `'my-org-store-inspector'` rather than `'store'`).

#### 4. Not realizing events drop after 5 failed retries (HIGH)

After 5 retries (1.5s at default `reconnectEveryMs: 300`), `failedToConnect` is set permanently. Subsequent `emit()` calls are silently dropped -- they are not queued and will never be delivered, even if the bus becomes available later.

If you need events to survive longer startup delays, increase `reconnectEveryMs`:

```ts
super({ pluginId: 'store-inspector', reconnectEveryMs: 1000 })
// 5 retries * 1000ms = 5s window
```

There is no way to increase the retry count (hardcoded to 5).

#### 5. Expecting connection on construction or on() (HIGH)

The connection to the event bus is initiated lazily on the first `emit()` call. Calling `on()` alone does not trigger a connection. If your panel calls `on()` but the library side never calls `emit()`, the client never connects to the bus.

This means if you only listen (no emitting), the `on()` handler still works for events dispatched directly on the global event target, but the connection handshake (`tanstack-connect` / `tanstack-connect-success`) never runs.

#### 6. Using non-serializable payloads (HIGH)

When the server event bus is enabled, events are serialized via JSON for transport over WebSocket/SSE/BroadcastChannel. Payloads containing functions, DOM nodes, class instances, `Map`/`Set`, or circular references will fail silently or lose data.

Wrong:

```ts
storeInspector.emit('state-changed', {
  storeName: 'main',
  state,
  callback: () => {}, // Function -- not serializable
  element: document.body, // DOM node -- not serializable
})
```

Correct:

```ts
storeInspector.emit('state-changed', {
  storeName: 'main',
  state: JSON.parse(JSON.stringify(state)), // Ensure serializable
  timestamp: Date.now(),
})
```

#### 7. Forgetting the root export no-ops in production (HIGH)

The **root import** of `@tanstack/devtools-event-client` resolves to a no-op
when `process.env.NODE_ENV !== 'development'`, and the real client is
tree-shaken out of production bundles. This is the default and what you want for
most libraries — your `emit()` calls cost nothing in production.

"Outside development" includes when `NODE_ENV` is unset — common in plain Node scripts, some SSR dev servers, and test runners — so the root import resolves to the no-op there too. Set `NODE_ENV=development`, or use the `/production` subpath, to get the real client in those contexts.

```ts
// dev: real client — production: no-op, removed from the bundle
import { EventClient } from '@tanstack/devtools-event-client'
```

If you are publishing an open-source library and deliberately want devtools
events to keep working in production, import from the `/production` subpath,
which always ships the real client:

```ts
import { EventClient } from '@tanstack/devtools-event-client/production'
```

The `enabled` constructor option still works for fine-grained runtime control,
but you no longer need to guard `emit()` calls manually for bundle size — the
root export handles that for you.

### See Also

- `devtools-instrumentation` -- after creating a client, instrument library code with strategic emissions
- `devtools-plugin-panel` -- the client emits events, the panel listens using the same event map
- `devtools-bidirectional` -- two-way communication between panel and application using the same EventClient

<a id="source-tanstack-devtools-event-client-devtools-bidirectional"></a>

## Devtools Bidirectional

Source: `tanstack-devtools-event-client-devtools-bidirectional`.

## devtools-bidirectional

> **Prerequisite:** Read and understand the `devtools-event-client` skill first. This skill builds on `EventClient`, its event map types, `emit()`/`on()` API, pluginId namespacing, connection lifecycle, and singleton pattern. Everything here assumes you already have a working `EventClient` instance.

Two-way communication between your application and a TanStack Devtools panel using `EventClient`. The same client instance handles both directions: the app emits observation events that the panel listens to, and the panel emits command events that the app listens to.

### Core Concept

`EventClient` is not unidirectional. Both `emit()` and `on()` work from either side -- application code or panel code -- on the same shared event bus. The direction is a convention you establish through your event map design, not a limitation of the API.

```
App code calls:    client.emit('state-update', ...)     // observation
Panel code calls:  client.on('state-update', ...)       // observation

Panel code calls:  client.emit('set-state', ...)        // command
App code calls:    client.on('set-state', ...)          // command
```

### Core Patterns

#### 1. App-to-Devtools Observation

The app emits state changes. The panel listens and renders.

**Event map and client (shared module):**

```ts
import { EventClient } from '@tanstack/devtools-event-client'

type CounterEvents = {
  // Observation: app -> panel
  'state-update': { count: number; updatedAt: number }
}

class CounterDevtoolsClient extends EventClient<CounterEvents> {
  constructor() {
    super({
      pluginId: 'counter-inspector',
      enabled: process.env.NODE_ENV !== 'production',
    })
  }
}

export const counterClient = new CounterDevtoolsClient()
```

**App side -- emit on state changes:**

```ts
import { counterClient } from './counter-devtools-client'

function increment() {
  count += 1
  counterClient.emit('state-update', {
    count,
    updatedAt: Date.now(),
  })
}
```

**Panel side -- listen and display:**

```ts
import { counterClient } from './counter-devtools-client'

const cleanup = counterClient.on('state-update', (event) => {
  // event.payload.count
  // event.payload.updatedAt
  renderPanel(event.payload)
})
```

#### 2. Devtools-to-App Commands

The panel sends commands. The app listens and mutates state.

**Extend the event map with command events:**

```ts
type CounterEvents = {
  // Observation: app -> panel
  'state-update': { count: number; updatedAt: number }
  // Commands: panel -> app
  reset: void
  'set-count': { count: number }
}
```

**Panel side -- emit commands on user interaction:**

```ts
import { counterClient } from './counter-devtools-client'

function handleResetClick() {
  counterClient.emit('reset', undefined)
}

function handleSetCount(newCount: number) {
  counterClient.emit('set-count', { count: newCount })
}
```

**App side -- listen for commands and react:**

```ts
import { counterClient } from './counter-devtools-client'

counterClient.on('reset', () => {
  count = 0
  // Re-emit observation so panel updates
  counterClient.emit('state-update', {
    count,
    updatedAt: Date.now(),
  })
})

counterClient.on('set-count', (event) => {
  count = event.payload.count
  counterClient.emit('state-update', {
    count,
    updatedAt: Date.now(),
  })
})
```

The command handler re-emits an observation event after mutating state. This closes the loop so the panel sees the result of its own command.

#### 3. Time-Travel Debugging

Combine observation (snapshots) with commands (revert) to build a time-travel slider.

**Event map:**

```ts
type TimeTravelEvents = {
  // Observation: app -> panel
  snapshot: { state: unknown; timestamp: number; label: string }
  // Command: panel -> app
  revert: { state: unknown }
}

class TimeTravelClient extends EventClient<TimeTravelEvents> {
  constructor() {
    super({
      pluginId: 'time-travel',
      enabled: process.env.NODE_ENV !== 'production',
    })
  }
}

export const timeTravelClient = new TimeTravelClient()
```

**App side -- emit snapshots with structuredClone:**

```ts
import { timeTravelClient } from './time-travel-client'

function applyAction(action: { type: string; payload: unknown }) {
  state = reducer(state, action)

  timeTravelClient.emit('snapshot', {
    state: structuredClone(state),
    timestamp: Date.now(),
    label: action.type,
  })
}

// Listen for revert commands from devtools
timeTravelClient.on('revert', (event) => {
  state = event.payload.state
  rerender()
})
```

`structuredClone(state)` is required here. Without it, the snapshot payload holds a reference to the live state object. When the app mutates state later, all previously stored snapshots in the panel are corrupted because they point to the same object.

**Panel side -- collect snapshots and revert:**

```tsx
import { timeTravelClient } from './time-travel-client'

function TimeTravelPanel() {
  const [snapshots, setSnapshots] = useState<
    Array<{ state: unknown; timestamp: number; label: string }>
  >([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    return timeTravelClient.on('snapshot', (event) => {
      setSnapshots((prev) => [...prev, event.payload])
      setIndex((prev) => prev + 1)
    })
  }, [])

  const handleSliderChange = (newIndex: number) => {
    setIndex(newIndex)
    timeTravelClient.emit('revert', {
      state: snapshots[newIndex].state,
    })
  }

  return (
    <div>
      <input
        type="range"
        min={0}
        max={snapshots.length - 1}
        value={index}
        onChange={(e) => handleSliderChange(Number(e.target.value))}
      />
      <p>
        {snapshots[index]?.label} (
        {new Date(snapshots[index]?.timestamp).toLocaleTimeString()})
      </p>
      <pre>{JSON.stringify(snapshots[index]?.state, null, 2)}</pre>
    </div>
  )
}
```

After the app handles `revert`, it should re-emit a `snapshot` so the panel timeline stays current. The revert handler in the app side example above does not re-emit -- add it if your UI needs the timeline to update after a revert:

```ts
timeTravelClient.on('revert', (event) => {
  state = event.payload.state
  rerender()
  // Optional: re-emit so the timeline reflects the revert
  timeTravelClient.emit('snapshot', {
    state: structuredClone(state),
    timestamp: Date.now(),
    label: 'revert',
  })
})
```

#### 4. Bidirectional Event Map Design

When a single plugin needs both observation and command events, define them all in one event map. Use naming conventions to distinguish direction:

```ts
type StoreInspectorEvents = {
  // Observation: app -> panel (describe what happened)
  'state-update': { storeName: string; state: unknown; timestamp: number }
  'action-dispatched': { storeName: string; action: string; payload: unknown }
  'error-caught': { storeName: string; error: string; stack?: string }

  // Commands: panel -> app (describe what to do)
  'set-state': { storeName: string; state: unknown }
  'dispatch-action': { storeName: string; action: string; payload: unknown }
  reset: void
  revert: { state: unknown }
}
```

Naming convention:

- **Observation events** describe what happened: `state-update`, `action-dispatched`, `error-caught`, `snapshot`
- **Command events** describe what to do: `set-state`, `dispatch-action`, `reset`, `revert`

This distinction is purely a convention in your event map keys. The `EventClient` API is the same for both. But maintaining it makes your event map self-documenting and prevents confusion about which side emits vs listens.

**Full bidirectional wiring with one client:**

```ts
import { EventClient } from '@tanstack/devtools-event-client'

type StoreInspectorEvents = {
  'state-update': { storeName: string; state: unknown; timestamp: number }
  'set-state': { storeName: string; state: unknown }
  reset: void
}

class StoreInspectorClient extends EventClient<StoreInspectorEvents> {
  constructor() {
    super({
      pluginId: 'store-inspector',
      enabled: process.env.NODE_ENV !== 'production',
    })
  }
}

export const storeInspector = new StoreInspectorClient()
```

**App side:**

```ts
import { storeInspector } from './store-inspector-client'

// Observation: emit state changes
function updateStore(storeName: string, newState: unknown) {
  stores[storeName] = newState
  storeInspector.emit('state-update', {
    storeName,
    state: structuredClone(newState),
    timestamp: Date.now(),
  })
}

// Command handlers: listen for panel commands
storeInspector.on('set-state', (event) => {
  const { storeName, state } = event.payload
  stores[storeName] = state
  storeInspector.emit('state-update', {
    storeName,
    state: structuredClone(state),
    timestamp: Date.now(),
  })
})

storeInspector.on('reset', () => {
  for (const storeName of Object.keys(stores)) {
    stores[storeName] = initialStates[storeName]
    storeInspector.emit('state-update', {
      storeName,
      state: structuredClone(initialStates[storeName]),
      timestamp: Date.now(),
    })
  }
})
```

**Panel side:**

```ts
import { storeInspector } from './store-inspector-client'

// Observation: listen for state changes
storeInspector.on('state-update', (event) => {
  renderStore(event.payload.storeName, event.payload.state)
})

// Commands: emit on user action
function handleEditState(storeName: string, newState: unknown) {
  storeInspector.emit('set-state', { storeName, state: newState })
}

function handleReset() {
  storeInspector.emit('reset', undefined)
}
```

### Debouncing Frequent Observations

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

### Common Mistakes

#### 1. Not using structuredClone for snapshots (HIGH)

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

#### 2. Non-serializable payloads in cross-tab scenarios (HIGH)

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

#### 3. Not distinguishing observation from command events (MEDIUM)

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

### See Also

- `devtools-event-client` -- base event system: event maps, `emit()`/`on()`, connection lifecycle, singleton pattern
- `devtools-instrumentation` -- strategic placement of `emit()` calls in library code benefits from bidirectional awareness (knowing that commands will flow back)

<a id="source-tanstack-devtools-event-client-devtools-instrumentation"></a>

## Devtools Instrumentation

Source: `tanstack-devtools-event-client-devtools-instrumentation`.

## devtools-instrumentation

> **Prerequisite:** Read the `devtools-event-client` skill first for EventClient creation, event maps, and `emit()`/`on()` API.

Strategic placement of `emit()` calls inside a library to send high-value diagnostic data to TanStack Devtools panels. Maximum insight with minimum noise.

### Key Insight

The event bus transparently bridges server/client and cross-tab boundaries. `emit()` on the server arrives on the client via WebSocket/SSE. `emit()` in one tab reaches other tabs via `BroadcastChannel`. No transport code needed -- just emit at the right place.

For prototyping, throw in many events. For production, consolidate down to the fewest events that carry the most information.

### Where to Instrument

Emit at **architecture boundaries**, not inside implementation details:

1. **Middleware/interceptor entry and exit** -- wrap the chain, not each middleware
2. **State transitions** -- when state moves between logical phases (idle -> loading -> success/error)
3. **Lifecycle hooks** -- mount, unmount, connect, disconnect, ready
4. **Error boundaries** -- caught exceptions, retries, fallbacks
5. **User-initiated actions processed** -- after fully applied, not before

Do NOT emit from: internal utility functions, loop iterations, getter/setter accesses, intermediate computation steps.

### Core Patterns

#### 1. Middleware/Interceptor Instrumentation

Wrap the pipeline at the boundary, not each middleware individually.

```ts
import { EventClient } from '@tanstack/devtools-event-client'

type RouterEvents = {
  'request-processed': {
    id: string
    method: string
    path: string
    duration: number
    middlewareChain: Array<{ name: string; durationMs: number }>
    status: number
    error?: string
  }
}

class RouterDevtoolsClient extends EventClient<RouterEvents> {
  constructor() {
    super({
      pluginId: 'my-router',
      enabled: process.env.NODE_ENV !== 'production',
    })
  }
}

export const routerDevtools = new RouterDevtoolsClient()
```

```ts
async function runMiddlewarePipeline(
  req: Request,
  middlewares: Middleware[],
): Promise<Response> {
  const requestId = crypto.randomUUID()
  const pipelineStart = performance.now()
  const chain: Array<{ name: string; durationMs: number }> = []
  let status = 200
  let error: string | undefined

  for (const mw of middlewares) {
    const mwStart = performance.now()
    try {
      await mw.handle(req)
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      status = 500
      break
    }
    chain.push({ name: mw.name, durationMs: performance.now() - mwStart })
  }

  // Single consolidated event at the boundary
  routerDevtools.emit('request-processed', {
    id: requestId,
    method: req.method,
    path: req.url,
    duration: performance.now() - pipelineStart,
    middlewareChain: chain,
    status,
    error,
  })

  return new Response(null, { status })
}
```

ONE event per request, not 2N events (start + end for each middleware).

#### 2. State Transition Emission

Emit when the state machine moves between phases, not on every internal mutation.

```ts
type QueryEvents = {
  'query-lifecycle': {
    queryKey: string
    from: 'idle' | 'loading' | 'success' | 'error' | 'stale'
    to: 'idle' | 'loading' | 'success' | 'error' | 'stale'
    data?: unknown
    error?: string
    fetchDuration?: number
    timestamp: number
  }
}

class QueryDevtoolsClient extends EventClient<QueryEvents> {
  constructor() {
    super({
      pluginId: 'my-query-lib',
      enabled: process.env.NODE_ENV !== 'production',
    })
  }
}

export const queryDevtools = new QueryDevtoolsClient()
```

```ts
class Query {
  #state: QueryState = 'idle'

  private transition(
    to: QueryState,
    extra?: Partial<QueryEvents['query-lifecycle']>,
  ) {
    const from = this.#state
    if (from === to) return // No transition, no event
    this.#state = to
    queryDevtools.emit('query-lifecycle', {
      queryKey: this.key,
      from,
      to,
      timestamp: Date.now(),
      ...extra,
    })
  }

  async fetch() {
    this.transition('loading')
    const start = performance.now()
    try {
      const data = await this.fetcher()
      this.transition('success', {
        data: structuredClone(data),
        fetchDuration: performance.now() - start,
      })
    } catch (e) {
      this.transition('error', {
        error: e instanceof Error ? e.message : String(e),
        fetchDuration: performance.now() - start,
      })
    }
  }
}
```

#### 3. Consolidated Events with DRY Payloads

When multiple events share fields, build a shared base and spread it.

```ts
class Store {
  private basePayload() {
    return {
      storeName: this.#name,
      version: this.#version,
      sessionId: this.#sessionId,
      timestamp: Date.now(),
    }
  }

  dispatch(
    action: string,
    updater: (s: Record<string, unknown>) => Record<string, unknown>,
  ) {
    const prevState = structuredClone(this.#state)
    this.#state = updater(this.#state)
    this.#version++
    storeDevtools.emit('store-updated', {
      ...this.basePayload(),
      action,
      prevState,
      nextState: structuredClone(this.#state),
    })
  }

  reset(initial: Record<string, unknown>) {
    this.#state = initial
    this.#version++
    storeDevtools.emit('store-reset', this.basePayload())
  }
}
```

#### 4. Debouncing High-Frequency Emissions

Reactive systems, scroll handlers, and streaming data can trigger hundreds of emissions per second. Debounce or throttle these.

```ts
function createDebouncedEmitter<TEvents extends Record<string, any>>(
  client: EventClient<TEvents>,
  delayMs: number,
) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  return function debouncedEmit<K extends keyof TEvents & string>(
    event: K,
    payload: TEvents[K],
  ) {
    const existing = timers.get(event)
    if (existing) clearTimeout(existing)
    timers.set(
      event,
      setTimeout(() => {
        client.emit(event, payload)
        timers.delete(event)
      }, delayMs),
    )
  }
}

const debouncedEmit = createDebouncedEmitter(storeDevtools, 100)
signal.subscribe((value) => {
  debouncedEmit('signal-updated', { value, timestamp: Date.now() })
})
```

For leading+trailing (throttle), use the same pattern with a `lastEmit` timestamp check to emit immediately on the leading edge.

#### 5. Production Guarding

`enabled: false` is the primary guard -- `emit()` returns immediately with no allocation, no queuing, no connection.

```ts
class MyLibDevtools extends EventClient<MyEvents> {
  constructor() {
    super({
      pluginId: 'my-lib',
      enabled: process.env.NODE_ENV !== 'production',
    })
  }
}
```

For expensive payload construction (e.g., `structuredClone` of large state), guard at the call site:

```ts
if (process.env.NODE_ENV !== 'production') {
  myDevtools.emit('state-snapshot', {
    state: structuredClone(largeState),
    timestamp: Date.now(),
  })
}
```

**Important:** The Vite plugin strips `@tanstack/react-devtools` from production. The root import of `@tanstack/devtools-event-client` also no-ops and is tree-shaken out when `process.env.NODE_ENV !== 'development'`, so `emit()` calls cost nothing in production by default. Import from `@tanstack/devtools-event-client/production` if you deliberately want events in production. The `enabled` option remains available for runtime control.

#### 6. Server/Client Transparent Bridging

The same `emit()` works on server and client:

- **Client**: dispatches `CustomEvent` on `window` -> `ClientEventBus` -> other tabs via `BroadcastChannel` + server via WebSocket
- **Server**: dispatches on `globalThis.__TANSTACK_EVENT_TARGET__` -> `ServerEventBus` -> all WebSocket/SSE clients

```ts
// Server-side (e.g., SSR handler) -- arrives in browser devtools panel automatically
routerDevtools.emit('request-processed', {
  id: crypto.randomUUID(),
  method: req.method,
  path: new URL(req.url).pathname,
  duration: performance.now() - start,
  middlewareChain: chain,
  status: 200,
})
```

### Instrumentation Checklist

1. Map architecture boundaries (middleware chain, state machine, lifecycle hooks, error paths)
2. Design ONE consolidated event per boundary with full context payload
3. Keep event map small (3-7 types typical, not 15-30)
4. Create EventClient with `enabled: process.env.NODE_ENV !== 'production'`
5. Use shared base payloads (DRY) for fields common across events
6. Debounce any emission point that fires >10 times/second
7. Guard expensive payload construction with `process.env.NODE_ENV` check
8. Test with `debug: true` to see `[tanstack-devtools:{pluginId}-plugin]` prefixed logs

### Common Mistakes

#### HIGH: Emitting too many granular events

Wrong -- 15 events per request:

```ts
routerDevtools.emit('request-start', { id, method, path })
routerDevtools.emit('middleware-1-start', { id, name: 'auth' })
routerDevtools.emit('middleware-1-end', { id, name: 'auth', duration: 5 })
// ... 10 more ...
routerDevtools.emit('response-end', { id, duration: 50 })
```

Correct -- 1 event with all data:

```ts
routerDevtools.emit('request-processed', {
  id,
  method,
  path,
  duration: 50,
  middlewareChain: [
    { name: 'auth', durationMs: 5 },
    { name: 'cors', durationMs: 1 },
  ],
  status: 200,
})
```

Source: maintainer interview

#### HIGH: Emitting in hot loops without debouncing

Wrong:

```ts
signal.subscribe((value) => {
  devtools.emit('signal-updated', { value, timestamp: Date.now() }) // 60+ times/sec
})
```

Correct:

```ts
const debouncedEmit = createDebouncedEmitter(devtools, 100)
signal.subscribe((value) => {
  debouncedEmit('signal-updated', { value, timestamp: Date.now() })
})
```

Source: docs/bidirectional-communication.md

#### MEDIUM: Not emitting at architecture boundaries

Wrong -- instrumented inside a helper:

```ts
function parseQueryString(url: string) {
  const params = new URLSearchParams(url)
  devtools.emit('query-parsed', { params: Object.fromEntries(params) })
  return params
}
```

Correct -- instrumented at the handler boundary:

```ts
function handleRequest(req: Request) {
  const params = parseQueryString(req.url)
  const result = processRequest(params)
  devtools.emit('request-processed', {
    path: req.url,
    params: Object.fromEntries(params),
    result: result.summary,
    duration: performance.now() - start,
  })
}
```

Source: maintainer interview

#### MEDIUM: Hardcoding repeated payload fields

Wrong:

```ts
devtools.emit('action-a', {
  storeName: this.name,
  version: this.version,
  sessionId: this.sessionId,
  timestamp: Date.now(),
  data,
})
devtools.emit('action-b', {
  storeName: this.name,
  version: this.version,
  sessionId: this.sessionId,
  timestamp: Date.now(),
  other,
})
```

Correct:

```ts
const base = this.basePayload()
devtools.emit('action-a', { ...base, data })
devtools.emit('action-b', { ...base, other })
```

Source: maintainer interview
