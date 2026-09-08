# Quick Start

<a id="source-query-docs-framework-lit-quick-start-md"></a>

Release-matched documentation · `@tanstack/lit-query@0.2.20`.

[Topic index](../framework-lit.md) · [Source provenance](../SOURCES.md)

This snippet shows the three core Lit Query concepts:

- [Queries](./query-docs-framework-lit-guides-queries-md-7bbefb64.md#source-query-docs-framework-lit-guides-queries-md)
- [Mutations](./query-docs-framework-lit-guides-mutations-md-38f7fec7.md#source-query-docs-framework-lit-guides-mutations-md)
- [Query Invalidation](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/lit/guides/query-invalidation.md)

For complete runnable examples, see [Basic](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/examples/lit/basic/README.md), [Pagination](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/examples/lit/pagination/README.md), and [SSR](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/examples/lit/ssr/README.md).

```ts
import { LitElement, html } from 'lit'
import {
  QueryClient,
  QueryClientProvider,
  createMutationController,
  createQueryController,
} from '@tanstack/lit-query'
import { addTodo, getTodos } from './api'

const queryClient = new QueryClient()

class AppQueryProvider extends QueryClientProvider {
  constructor() {
    super()
    this.client = queryClient
  }
}

customElements.define('app-query-provider', AppQueryProvider)

class TodosView extends LitElement {
  private readonly todos = createQueryController(this, {
    queryKey: ['todos'],
    queryFn: getTodos,
  })

  private readonly createTodo = createMutationController(this, {
    mutationFn: addTodo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  render() {
    const query = this.todos()
    const mutation = this.createTodo()

    if (query.isPending) return html`Loading...`
    if (query.isError) return html`Error: ${query.error.message}`

    return html`
      <ul>
        ${query.data.map((todo) => html`<li>${todo.title}</li>`)}
      </ul>

      <button
        ?disabled=${mutation.isPending}
        @click=${() => this.createTodo.mutate({ title: 'Write Lit docs' })}
      >
        Add Todo
      </button>
    `
  }
}

customElements.define('todos-view', TodosView)
```

Mount the provider around your component:

```html
<app-query-provider>
  <todos-view></todos-view>
</app-query-provider>
```

The controllers are created with `this` because a `LitElement` is a `ReactiveControllerHost`. Lit Query uses the host lifecycle to subscribe, request updates, and clean up when the element disconnects.

Continue with [Reactive Controllers vs Hooks](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/lit/guides/reactive-controllers-vs-hooks.md) if you know React Query, or go straight to [Queries](./query-docs-framework-lit-guides-queries-md-7bbefb64.md#source-query-docs-framework-lit-guides-queries-md).
