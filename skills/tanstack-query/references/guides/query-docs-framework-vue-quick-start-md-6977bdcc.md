# Quick Start

<a id="source-query-docs-framework-vue-quick-start-md"></a>

Release-matched documentation · `@tanstack/vue-query@5.104.3`.

[Topic index](../framework-vue.md) · [Source provenance](../SOURCES.md)

[//]: # 'Example'

If you're looking for a fully functioning example, please have a look at our [basic codesandbox example](https://github.com/TanStack/query/blob/ee47993724e5b71e65d9f38ae416367d2dd18395/examples/vue/basic/README.md)

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
