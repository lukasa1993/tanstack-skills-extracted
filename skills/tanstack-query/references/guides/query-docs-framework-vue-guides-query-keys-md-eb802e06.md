# Query Keys

<a id="source-query-docs-framework-vue-guides-query-keys-md"></a>

Release-matched documentation · `@tanstack/vue-query@5.102.8`.

[Topic index](../framework-vue.md) · [Source provenance](../SOURCES.md)

[//]: # 'Example5'

```ts
import type { Ref } from 'vue'

function useTodos(todoId: Ref<string>) {
  const queryKey = ['todos', todoId]
  return useQuery({
    queryKey,
    queryFn: () => fetchTodoById(todoId.value),
  })
}
```

[//]: # 'Example5'
