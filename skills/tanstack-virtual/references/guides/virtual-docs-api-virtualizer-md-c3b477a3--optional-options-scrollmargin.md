# Virtualizer — Optional Options: `scrollMargin`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `scrollMargin`


```tsx
scrollMargin?: number
```

With this option, you can specify where the scroll offset should originate. Typically, this value represents the space between the beginning of the scrolling element and the start of the list. This is especially useful in common scenarios such as when you have a header preceding a window virtualizer or when multiple virtualizers are utilized within a single scrolling element. If you are using absolute positioning of elements, you should take into account the `scrollMargin` in your CSS transform:
```tsx
transform: `translateY(${
   virtualRow.start - rowVirtualizer.options.scrollMargin
}px)`
```
To dynamically measure value for `scrollMargin` you can use `getBoundingClientRect()` or ResizeObserver. This is helpful in scenarios when items above your virtual list might change their height.
