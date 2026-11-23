# Virtualizer — Optional Options: `indexAttribute`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.19.13`.

## Optional Options: `indexAttribute`


```tsx
indexAttribute?: string
```

**Default:** `'data-index'`

The name of the DOM attribute the virtualizer reads to find out which item a measured element belongs to. It is read by `measureElement` and by the `ResizeObserver` that keeps measurements up to date, so every element you measure must carry it, set to the item's index.

The default is enough for a single virtualizer. Change it when **two virtualizers measure the same element**, as in a grid with both a row and a column virtualizer: a cell can't carry two different indexes in one `data-index` attribute, so give each virtualizer its own attribute:

```tsx
const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 35,
  indexAttribute: 'data-row-index',
})

const columnVirtualizer = useVirtualizer({
  horizontal: true,
  count: columns.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
  indexAttribute: 'data-column-index',
})

// ...

<div
  data-row-index={virtualRow.index}
  data-column-index={virtualColumn.index}
  ref={(node) => {
    rowVirtualizer.measureElement(node)
    columnVirtualizer.measureElement(node)
  }}
/>
```

If the attribute is missing on a measured element, the virtualizer logs a warning (`Missing attribute name '<indexAttribute>={index}' on measured element.`) and skips the measurement.
