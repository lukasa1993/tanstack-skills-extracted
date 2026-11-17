# Quick Start

<a id="source-query-docs-framework-vue-quick-start-md"></a>

Release-matched documentation · `@tanstack/vue-query@5.107.2`.

[Topic index](../framework-vue.md) · [Source provenance](../SOURCES.md)

[//]: # 'Example'

If you're looking for a fully functioning example, please have a look at our [basic codesandbox example](https://github.com/TanStack/query/blob/3f5f87af342b2843e641e1805e9da4d56850240e/examples/vue/basic/README.md)

```vue
<script setup>
import { useQueryClient, useQuery, useMutation } from '@tanstack/vue-query'

// Access QueryClient instance
const queryClient = useQueryClient()

// Query
const { isPending, isError, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
})

// Mutation
const mutation = useMutation({
  mutationFn: postTodo,
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})

function onButtonClick() {
  mutation.mutate({
    id: Date.now(),
    title: 'Do Laundry',
  })
}
</script>

<template>
  <span v-if="isPending">Loading...</span>
  <span v-else-if="isError">Error: {{ error.message }}</span>
  <!-- We can assume by this point that `isSuccess === true` -->
  <ul v-else>
    <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
  </ul>
  <button @click="onButtonClick">Add Todo</button>
</template>
```

[//]: # 'Example'
