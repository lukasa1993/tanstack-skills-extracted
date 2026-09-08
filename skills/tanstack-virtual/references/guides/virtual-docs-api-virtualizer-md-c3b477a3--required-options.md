# Virtualizer — Required Options

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Required Options

### `count`

```tsx
count: number
```

The total number of items to virtualize.

### `getScrollElement`

```tsx
getScrollElement: () => TScrollElement
```

A function that returns the scrollable element for the virtualizer. It may return null if the element is not available yet.

### `estimateSize`

```tsx
estimateSize: (index: number) => number
```

> 🧠 If you are dynamically measuring your elements, it's recommended to estimate the largest possible size (width/height, within comfort) of your items. This will help the virtualizer calculate more accurate initial positions.

This function is passed the index of each item and should return the actual size (or estimated size if you will be dynamically measuring items with `virtualItem.measureElement`) for each item. This measurement should return either the width or height depending on the orientation of your virtualizer.
