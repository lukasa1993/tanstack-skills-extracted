# Lit Virtual

<a id="source-virtual-docs-framework-lit-lit-virtual-md"></a>

Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

[Topic index](../framework-lit.md) · [Source provenance](../SOURCES.md)

The `@tanstack/lit-virtual` adapter is a wrapper around the core virtual logic.

## `createVirtualizer`

```tsx

private virtualizerController = new VirtualizerController<TScrollElement, TItemElement = unknown>(
    options: PartialKeys< VirtualizerOptions<TScrollElement, TItemElement>,
    'observeElementRect' | 'observeElementOffset' | 'scrollToFn'
)
```

This class stands for a standard `Virtualizer` instance configured to work with an HTML element as the scrollElement.
This will create a Lit Controller which can be accessed in the element render method.

```tsx
render() {
    const virtualizer = this.virtualizerController.getVirtualizer();
    const virtualItems = virtualizer.getVirtualItems();
}
)
```

## `createWindowVirtualizer`

```tsx
private windowVirtualizerController = new WindowVirtualizerController<TItemElement = unknown>(
    options: PartialKeys< VirtualizerOptions<TItemElement>,
    'getScrollElement' | 'observeElementRect' | 'observeElementOffset' | 'scrollToFn'
```

This class stands of window-based `Virtualizer` instance configured to work with an HTML element as the scrollElement.
