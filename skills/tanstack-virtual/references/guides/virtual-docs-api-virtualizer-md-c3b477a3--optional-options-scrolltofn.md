# Virtualizer — Optional Options: `scrollToFn`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `scrollToFn`


```tsx
scrollToFn?: (
  offset: number,
  options: { adjustments?: number; behavior?: 'auto' | 'smooth' },
  instance: Virtualizer<TScrollElement, TItemElement>,
) => void
```

An optional function that (if provided) should implement the scrolling behavior for your scrollElement. It will be called with the following arguments:

- An `offset` (in pixels) to scroll towards.
- An object indicating whether there was a difference between the estimated size and actual size (`adjustments`) and/or whether scrolling was called with a smooth animation (`behaviour`).
- The virtualizer instance itself.

Note that built-in scroll implementations are exported as `elementScroll` and `windowScroll`, which are automatically configured by the framework adapter functions like `useVirtualizer` or `useWindowVirtualizer`.
