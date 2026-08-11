# Solid adapter

Solid-specific setup and behavior.

<a id="source-virtual-docs-framework-solid-solid-virtual-md"></a>

## Solid Virtual

Source: `virtual:docs/framework/solid/solid-virtual.md`.

The `@tanstack/solid-virtual` adapter is a wrapper around the core virtual logic.

### `createVirtualizer`

```tsx
function createVirtualizer<TScrollElement, TItemElement = unknown>(
  options: PartialKeys<
    VirtualizerOptions<TScrollElement, TItemElement>,
    'observeElementRect' | 'observeElementOffset' | 'scrollToFn'
  >,
): Virtualizer<TScrollElement, TItemElement>
```

This function returns a standard `Virtualizer` instance configured to work with an HTML element as the scrollElement.

### `createWindowVirtualizer`

```tsx
function createWindowVirtualizer<TItemElement = unknown>(
  options: PartialKeys<
    VirtualizerOptions<Window, TItemElement>,
    | 'getScrollElement'
    | 'observeElementRect'
    | 'observeElementOffset'
    | 'scrollToFn'
  >,
): Virtualizer<Window, TItemElement>
```

This function returns a window-based `Virtualizer` instance configured to work with the window as the scrollElement.
