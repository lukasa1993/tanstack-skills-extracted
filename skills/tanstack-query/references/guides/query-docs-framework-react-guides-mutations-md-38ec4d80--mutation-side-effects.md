# Mutations — Mutation Side Effects

[Guide and prerequisites](./query-docs-framework-react-guides-mutations-md-38ec4d80.md) · Release-matched documentation · `@tanstack/react-query@5.102.8`.

## Mutation Side Effects

`useMutation` comes with some helper options that allow quick and easy side-effects at any stage during the mutation lifecycle. These come in handy for both [invalidating and refetching queries after mutations](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/react/guides/invalidations-from-mutations.md) and even [optimistic updates](./query-docs-framework-react-guides-optimistic-updates-md-f29380ea.md#source-query-docs-framework-react-guides-optimistic-updates-md)

[//]: # 'Example4'

```tsx
useMutation({
  mutationFn: addTodo,
  onMutate: (variables, context) => {
    // A mutation is about to happen!

    // Optionally return a result containing data to use when for example rolling back
    return { id: 1 }
  },
  onError: (error, variables, onMutateResult, context) => {
    // An error happened!
    console.log(`rolling back optimistic update with id ${onMutateResult.id}`)
  },
  onSuccess: (data, variables, onMutateResult, context) => {
    // Boom baby!
  },
  onSettled: (data, error, variables, onMutateResult, context) => {
    // Error or success... doesn't matter!
  },
})
```

[//]: # 'Example4'

When returning a promise in any of the callback functions it will first be awaited before the next callback is called:

[//]: # 'Example5'

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: async () => {
    console.log("I'm first!")
  },
  onSettled: async () => {
    console.log("I'm second!")
  },
})
```

[//]: # 'Example5'

You might find that you want to **trigger additional callbacks** beyond the ones defined on `useMutation` when calling `mutate`. This can be used to trigger component-specific side effects. To do that, you can provide any of the same callback options to the `mutate` function after your mutation variable. Supported options include: `onSuccess`, `onError` and `onSettled`. Please keep in mind that those additional callbacks won't run if your component unmounts _before_ the mutation finishes.

[//]: # 'Example6'

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: (data, variables, onMutateResult, context) => {
    // I will fire first
  },
  onError: (error, variables, onMutateResult, context) => {
    // I will fire first
  },
  onSettled: (data, error, variables, onMutateResult, context) => {
    // I will fire first
  },
})

mutate(todo, {
  onSuccess: (data, variables, onMutateResult, context) => {
    // I will fire second!
  },
  onError: (error, variables, onMutateResult, context) => {
    // I will fire second!
  },
  onSettled: (data, error, variables, onMutateResult, context) => {
    // I will fire second!
  },
})
```

[//]: # 'Example6'

### Consecutive mutations

There is a slight difference in handling `onSuccess`, `onError` and `onSettled` callbacks when it comes to consecutive mutations. When passed to the `mutate` function, they will be fired up only _once_ and only if the component is still mounted. This is due to the fact that mutation observer is removed and resubscribed every time when the `mutate` function is called. On the contrary, `useMutation` handlers execute for each `mutate` call.

> Be aware that most likely, `mutationFn` passed to `useMutation` is asynchronous. In that case, the order in which mutations are fulfilled may differ from the order of `mutate` function calls.

[//]: # 'Example7'

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: (data, variables, onMutateResult, context) => {
    // Will be called 3 times
  },
})

const todos = ['Todo 1', 'Todo 2', 'Todo 3']
todos.forEach((todo) => {
  mutate(todo, {
    onSuccess: (data, variables, onMutateResult, context) => {
      // Will execute only once, for the last mutation (Todo 3),
      // regardless which mutation resolves first
    },
  })
})
```

[//]: # 'Example7'
