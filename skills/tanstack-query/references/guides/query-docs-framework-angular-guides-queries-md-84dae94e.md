# Queries

<a id="source-query-docs-framework-angular-guides-queries-md"></a>

Release-matched documentation · `@tanstack/angular-query-experimental@5.103.2`.

[Topic index](../framework-angular.md) · [Source provenance](../SOURCES.md)

[//]: # 'Example'

```ts
import { injectQuery } from '@tanstack/angular-query-experimental'

export class TodosComponent {
  readonly todosQuery = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  }))
}
```

[//]: # 'Example'
[//]: # 'Example2'

```ts
todosQuery = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
}))
```

[//]: # 'Example2'
[//]: # 'Example3'

```angular-ts
@Component({
  selector: 'todos',
  template: `
    @if (todosQuery.isPending()) {
      <span>Loading...</span>
    } @else if (todosQuery.isError()) {
      <span>Error: {{ todosQuery.error()?.message }}</span>
    } @else {
      <!-- We can assume by this point that status === 'success' -->
      @for (todo of todosQuery.data(); track todo.id) {
        <li>{{ todo.title }}</li>
      } @empty {
        <li>No todos found</li>
      }
    }
  `,
})
export class PostsComponent {
  readonly todosQuery = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  }))
}
```

[//]: # 'Example3'

If booleans aren't your thing, you can always use the `status` state as well:

[//]: # 'Example4'

```angular-ts
@Component({
  selector: 'todos',
  template: `
    @switch (todosQuery.status()) {
      @case ('pending') {
        <span>Loading...</span>
      }
      @case ('error') {
        <span>Error: {{ todosQuery.error()?.message }}</span>
      }
      <!-- also status === 'success', but "else" logic works, too -->
      @default {
        <ul>
          @for (todo of todosQuery.data(); track todo.id) {
            <li>{{ todo.title }}</li>
          } @empty {
            <li>No todos found</li>
          }
        </ul>
      }
    }
  `,
})
class TodosComponent {}
```

[//]: # 'Example4'
[//]: # 'Materials'
[//]: # 'Materials'
