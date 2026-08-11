# Lit adapter

Lit-specific setup and behavior.

<a id="source-virtual-docs-framework-lit-lit-virtual-md"></a>

## Lit Virtual

Source: `virtual:docs/framework/lit/lit-virtual.md`.

The `@tanstack/lit-virtual` adapter is a wrapper around the core virtual logic.

### `createVirtualizer`

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

### `createWindowVirtualizer`

```tsx
private windowVirtualizerController = new WindowVirtualizerController<TItemElement = unknown>(
    options: PartialKeys< VirtualizerOptions<TItemElement>,
    'getScrollElement' | 'observeElementRect' | 'observeElementOffset' | 'scrollToFn'
```

This class stands of window-based `Virtualizer` instance configured to work with an HTML element as the scrollElement.
