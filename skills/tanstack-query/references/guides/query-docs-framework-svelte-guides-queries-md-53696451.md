# Queries

<a id="source-query-docs-framework-svelte-guides-queries-md"></a>

Release-matched documentation · `@tanstack/svelte-query@6.3.9`.

[Topic index](../framework-svelte.md) · [Source provenance](../SOURCES.md)

[//]: # 'Example'

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  const todosQuery = createQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  }))
</script>
```

[//]: # 'Example'
[//]: # 'Example2'

```ts
const todosQuery = createQuery(() => ({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
}))
```

[//]: # 'Example2'
[//]: # 'Example3'

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  const todosQuery = createQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => fetchTodos(),
  }))
</script>

<div>
  {#if todosQuery.isPending}
    <p>Loading...</p>
  {:else if todosQuery.isError}
    <p>Error: {todosQuery.error.message}</p>
  {:else if todosQuery.isSuccess}
    {#each todosQuery.data as todo}
      <p>{todo.title}</p>
    {/each}
  {/if}
</div>
```

[//]: # 'Example3'

If booleans aren't your thing, you can always use the `status` state as well:

[//]: # 'Example4'

```svelte
<script lang="ts">
  const todosQuery = createQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => fetchTodos(),
  }))
</script>

<div>
  {#if todosQuery.status === 'pending'}
    <p>Loading...</p>
  {:else if todosQuery.status === 'error'}
    <p>Error: {todosQuery.error.message}</p>
  {:else if todosQuery.status === 'success'}
    {#each todosQuery.data as todo}
      <p>{todo.title}</p>
    {/each}
  {/if}
</div>
```

[//]: # 'Example4'
[//]: # 'Materials'
[//]: # 'Materials'
