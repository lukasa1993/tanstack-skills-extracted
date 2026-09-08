# Virtualizer — Optional Options: `observeElementOffset`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `observeElementOffset`


```tsx
observeElementOffset: (
    instance: Virtualizer<TScrollElement, TItemElement>,
    cb: (offset: number) => void,
  ) => void | (() => void)
```

An optional function that if provided is called when the scrollElement changes and should implement the initial measurement and continuous monitoring of the scrollElement's scroll offset (a number). It's called with the instance (which also gives you access to the scrollElement via `instance.scrollElement`. Built-in implementations are exported as `observeElementOffset` and `observeWindowOffset` which are automatically configured for you by your framework adapter's exported functions like `useVirtualizer` or `useWindowVirtualizer`.
