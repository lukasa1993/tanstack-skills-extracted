# Quick Start

<a id="source-query-docs-framework-angular-quick-start-md"></a>

Release-matched documentation · `@tanstack/angular-query-experimental@5.102.8`.

[Topic index](../framework-angular.md) · [Source provenance](../SOURCES.md)

> IMPORTANT: This library is currently in an experimental stage. This means that breaking changes will happen in minor AND patch releases. Upgrade carefully. If you use this in production while in experimental stage, please lock your version to a patch-level version to avoid unexpected breaking changes.

[//]: # 'Example'

If you're looking for a fully functioning example, please have a look at our [basic codesandbox example](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/examples/angular/basic/README.md)

### Provide the client to your App

```ts
import { provideHttpClient } from '@angular/common/http'
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental'

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), provideTanStackQuery(new QueryClient())],
})
```

or in a NgModule-based app

```ts
import { provideHttpClient } from '@angular/common/http'
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental'

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [provideTanStackQuery(new QueryClient())],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Component with query and mutation

```angular-ts
import { Component, Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { lastValueFrom } from 'rxjs'

import {
  injectMutation,
  injectQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental'

@Component({
  template: `
    <div>
      <button (click)="onAddTodo()">Add Todo</button>

      <ul>
        @for (todo of query.data(); track todo.title) {
          <li>{{ todo.title }}</li>
        }
      </ul>
    </div>
  `,
})
export class TodosComponent {
  todoService = inject(TodoService)
  queryClient = inject(QueryClient)

  query = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => this.todoService.getTodos(),
  }))

  mutation = injectMutation(() => ({
    mutationFn: (todo: Todo) => this.todoService.addTodo(todo),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  }))

  onAddTodo() {
    this.mutation.mutate({
      id: Date.now().toString(),
      title: 'Do Laundry',
    })
  }
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient)

  getTodos(): Promise<Todo[]> {
    return lastValueFrom(
      this.http.get<Todo[]>('https://jsonplaceholder.typicode.com/todos'),
    )
  }

  addTodo(todo: Todo): Promise<Todo> {
    return lastValueFrom(
      this.http.post<Todo>('https://jsonplaceholder.typicode.com/todos', todo),
    )
  }
}

interface Todo {
  id: string
  title: string
}
```

[//]: # 'Example'
