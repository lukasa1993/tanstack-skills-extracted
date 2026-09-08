# Virtualizer — Optional Options: `measureElement`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `measureElement`


```tsx
measureElement?: (
  element: TItemElement,
  entry: ResizeObserverEntry | undefined,
  instance: Virtualizer<TScrollElement, TItemElement>,
) => number
```

This optional function is called when the virtualizer needs to dynamically measure the size (width or height) of an item.

> 🧠 You can use `instance.options.horizontal` to determine if the width or height of the item should be measured.
