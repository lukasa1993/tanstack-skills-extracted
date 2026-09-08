# Overview

<a id="source-query-docs-framework-lit-overview-md"></a>

Release-matched documentation · `@tanstack/lit-query@0.2.20`.

[Topic index](../framework-lit.md) · [Source provenance](../SOURCES.md)

> IMPORTANT: The `@tanstack/lit-query` package is currently experimental and v0.1. Expect the Lit adapter API and docs to keep evolving. If you use it in production while it is early, pin the package to a patch version and upgrade deliberately.

The `@tanstack/lit-query` package is the Lit adapter for TanStack Query. It gives Lit applications reactive controller APIs for fetching, caching, synchronizing, and updating server state.

TanStack Query manages server state: data that is owned by a remote system, fetched asynchronously, shared across screens, and potentially changed by someone else at any time. It handles caching, request deduplication, stale data, background refetching, mutations, invalidation, pagination, and garbage collection.

Lit Query exposes those features through [Lit reactive controllers](https://lit.dev/docs/composition/controllers/). A Lit reactive controller is attached to a `ReactiveControllerHost`, usually a `LitElement`. Lit Query controllers subscribe to the `QueryClient`, request host updates when results change, and are cleaned up with the host lifecycle.

## Core APIs

Most Lit applications use these APIs:

- [`QueryClientProvider`](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/lit/reference/classes/QueryClientProvider.md) to provide a `QueryClient` through Lit context
- [`createQueryController`](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/lit/reference/functions/createQueryController.md) for queries
- [`createQueriesController`](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/lit/reference/functions/createQueriesController.md) for dynamic parallel queries
- [`createMutationController`](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/lit/reference/functions/createMutationController.md) for mutations
- [`createInfiniteQueryController`](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/lit/reference/functions/createInfiniteQueryController.md) for infinite queries
- [`useIsFetching`](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/lit/reference/functions/useIsFetching.md), [`useIsMutating`](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/lit/reference/functions/useIsMutating.md), and [`useMutationState`](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/lit/reference/functions/useMutationState.md) for cache state indicators

The adapter also re-exports TanStack Query Core APIs from `@tanstack/lit-query`, so examples in the Lit docs use `@tanstack/lit-query` as the user-facing import path.

## A First Query

```ts
import { LitElement, html } from 'lit'
import {
  QueryClient,
  QueryClientProvider,
  createQueryController,
} from '@tanstack/lit-query'

const queryClient = new QueryClient()

class AppQueryProvider extends QueryClientProvider {
  constructor() {
    super()
    this.client = queryClient
  }
}

customElements.define('app-query-provider', AppQueryProvider)

class RepoStats extends LitElement {
  private readonly repo = createQueryController(this, {
    queryKey: ['repoData'],
    queryFn: async () => {
      const response = await fetch(
        'https://api.github.com/repos/TanStack/query',
      )
      if (!response.ok) throw new Error('Failed to fetch repo data')
      return response.json() as Promise<{
        name: string
        description: string
        stargazers_count: number
      }>
    },
  })

  render() {
    const query = this.repo()

    if (query.isPending) return html`Loading...`
    if (query.isError) return html`Error: ${query.error.message}`

    return html`
      <h1>${query.data.name}</h1>
      <p>${query.data.description}</p>
      <strong>${query.data.stargazers_count} stars</strong>
    `
  }
}

customElements.define('repo-stats', RepoStats)
```

Render the provider above your query consumers:

```html
<app-query-provider>
  <repo-stats></repo-stats>
</app-query-provider>
```

## Status Notes

Lit Devtools are not available yet. Use the cache APIs and the generated API reference while the adapter matures.

Start with [Installation](./query-docs-framework-lit-installation-md-e6a1af16.md#source-query-docs-framework-lit-installation-md), then [Quick Start](./query-docs-framework-lit-quick-start-md-2745312c.md#source-query-docs-framework-lit-quick-start-md), and use the [Reactive Controllers vs Hooks](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/lit/guides/reactive-controllers-vs-hooks.md) guide if you are coming from React Query.
