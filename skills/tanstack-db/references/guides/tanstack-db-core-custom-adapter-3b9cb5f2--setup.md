# Custom Adapter — Setup

[Guide and prerequisites](./tanstack-db-core-custom-adapter-3b9cb5f2.md) · Published skill · `@tanstack/db@0.9.0`.

## Setup

```ts
import { createCollection } from '@tanstack/db'
import type { CollectionConfig } from '@tanstack/db'

interface MyItem {
  id: string
  name: string
}

interface BackendEvent<T> {
  type: 'insert' | 'update' | 'delete'
  id: string
  data: T
}

function myBackendCollectionOptions<T extends object>(config: {
  endpoint: string
  getKey: (item: T) => string
}): CollectionConfig<T, string> {
  return {
    getKey: config.getKey,
    sync: {
      sync: ({ begin, write, commit, markReady, markError, collection }) => {
        let isInitialSyncComplete = false
        const bufferedEvents: Array<BackendEvent<T>> = []
        const initialSyncAbort = new AbortController()

        // 1. Subscribe to real-time events FIRST
        const unsubscribe = myWebSocket.subscribe(config.endpoint, (event) => {
          if (!isInitialSyncComplete) {
            bufferedEvents.push(event)
            return
          }
          begin()
          write({ type: event.type, key: event.id, value: event.data })
          commit()
        })

        // 2. Fetch initial data
        void fetch(config.endpoint, { signal: initialSyncAbort.signal })
          .then(async (res) => {
            const items = await res.json()
            begin()
            for (const item of items) {
              write({ type: 'insert', value: item })
            }
            commit()

            // 3. Process buffered events
            isInitialSyncComplete = true
            for (const event of bufferedEvents) {
              begin()
              write({ type: event.type, key: event.id, value: event.data })
              commit()
            }

            // 4. Signal that a usable snapshot exists
            markReady()
          })
          .catch((error) => {
            if (initialSyncAbort.signal.aborted) return
            console.error('Initial sync failed:', error)
            // Only initial startup owns collection readiness. A later refetch
            // failure must keep the last ready snapshot usable.
            if (collection.status === 'loading') markError(error)
          })

        // 5. Return cleanup function
        return () => {
          initialSyncAbort.abort()
          unsubscribe()
        }
      },
      rowUpdateMode: 'partial',
    },
    onInsert: async ({ transaction }) => {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        body: JSON.stringify(transaction.mutations[0].modified),
      })
      await waitForServerObservation(response)
    },
    onUpdate: async ({ transaction }) => {
      const mut = transaction.mutations[0]
      const response = await fetch(`${config.endpoint}/${mut.key}`, {
        method: 'PATCH',
        body: JSON.stringify(mut.changes),
      })
      await waitForServerObservation(response)
    },
    onDelete: async ({ transaction }) => {
      const response = await fetch(
        `${config.endpoint}/${transaction.mutations[0].key}`,
        {
          method: 'DELETE',
        },
      )
      await waitForServerObservation(response)
    },
  }
}
```
