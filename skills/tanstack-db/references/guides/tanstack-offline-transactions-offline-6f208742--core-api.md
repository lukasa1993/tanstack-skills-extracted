# Offline — Core API

[Guide and prerequisites](./tanstack-offline-transactions-offline-6f208742.md) · Published skill · `@tanstack/offline-transactions@1.1.3`.

## Core API

### createOfflineTransaction

```ts
const tx = executor.createOfflineTransaction({
  mutationFnName: 'createTodo',
})

// Mutations run inside tx.mutate() — uses ambient transaction context
tx.mutate(() => {
  todoCollection.insert({ id: safeRandomUUID(), text: 'New todo' })
})
tx.commit()
```

If the executor is not the leader tab, falls back to `createTransaction` directly (no offline persistence).

### createOfflineAction

```ts
const addTodo = executor.createOfflineAction({
  mutationFnName: 'createTodo',
  onMutate: (variables) => {
    todoCollection.insert({
      id: safeRandomUUID(),
      text: variables.text,
    })
  },
})

// Call it
addTodo({ text: 'Buy milk' })
```

If the executor is not the leader tab, falls back to `createOptimisticAction` directly.
