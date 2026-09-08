# Mutations — Overview

[Guide and prerequisites](./query-docs-framework-react-guides-mutations-md-38ec4d80.md) · Release-matched documentation · `@tanstack/react-query@5.102.8`.

Unlike queries, mutations are typically used to create/update/delete data or perform server side-effects. For this purpose, TanStack Query exports a `useMutation` hook.

Here's an example of a mutation that adds a new todo to the server:

[//]: # 'Example'

```tsx
function App() {
  const mutation = useMutation({
    mutationFn: (newTodo) => {
      return axios.post('/todos', newTodo)
    },
  })

  return (
    <div>
      {mutation.isPending ? (
        'Adding todo...'
      ) : (
        <>
          {mutation.isError ? (
            <div>An error occurred: {mutation.error.message}</div>
          ) : null}

          {mutation.isSuccess ? <div>Todo added!</div> : null}

          <button
            onClick={() => {
              mutation.mutate({ id: new Date(), title: 'Do Laundry' })
            }}
          >
            Create Todo
          </button>
        </>
      )}
    </div>
  )
}
```

[//]: # 'Example'

A mutation can only be in one of the following states at any given moment:

- `isIdle` or `status === 'idle'` - The mutation is currently idle or in a fresh/reset state
- `isPending` or `status === 'pending'` - The mutation is currently running
- `isError` or `status === 'error'` - The mutation encountered an error
- `isSuccess` or `status === 'success'` - The mutation was successful and mutation data is available

Beyond those primary states, more information is available depending on the state of the mutation:

- `error` - If the mutation is in an `error` state, the error is available via the `error` property.
- `data` - If the mutation is in a `success` state, the data is available via the `data` property.

In the example above, you also saw that you can pass variables to your mutations function by calling the `mutate` function with a **single variable or object**.

Even with just variables, mutations aren't all that special, but when used with the `onSuccess` option, the [Query Client's `invalidateQueries` method](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/reference/QueryClient.md#queryclientinvalidatequeries) and the [Query Client's `setQueryData` method](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/reference/QueryClient.md#queryclientsetquerydata), mutations become a very powerful tool.

[//]: # 'Info1'

> IMPORTANT: The `mutate` function is an asynchronous function, which means you cannot use it directly in an event callback in **React 16 and earlier**. If you need to access the event in `onSubmit` you need to wrap `mutate` in another function. This is due to [React event pooling](https://reactjs.org/docs/legacy-event-pooling.html).

[//]: # 'Info1'
[//]: # 'Example2'

```tsx
// This will not work in React 16 and earlier
const CreateTodo = () => {
  const mutation = useMutation({
    mutationFn: (event) => {
      event.preventDefault()
      return fetch('/api', new FormData(event.target))
    },
  })

  return <form onSubmit={mutation.mutate}>...</form>
}

// This will work
const CreateTodo = () => {
  const mutation = useMutation({
    mutationFn: (formData) => {
      return fetch('/api', formData)
    },
  })
  const onSubmit = (event) => {
    event.preventDefault()
    mutation.mutate(new FormData(event.target))
  }

  return <form onSubmit={onSubmit}>...</form>
}
```

[//]: # 'Example2'
