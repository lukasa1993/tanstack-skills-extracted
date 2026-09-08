# Virtualizer — Virtualizer Instance

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Virtualizer Instance

The following properties and methods are available on the virtualizer instance:

### `options`

```tsx
options: readonly Required<VirtualizerOptions<TScrollElement, TItemElement>>
```

The current options for the virtualizer. This property is updated via your framework adapter and is read-only.

### `scrollElement`

```tsx
scrollElement: readonly TScrollElement | null
```

The current scrollElement for the virtualizer. This property is updated via your framework adapter and is read-only.

### `getVirtualItems`

```tsx
type getVirtualItems = () => VirtualItem[]
```

Returns the virtual items for the current state of the virtualizer.

### `getVirtualIndexes`

```tsx
type getVirtualIndexes = () => number[]
```

Returns the virtual row indexes for the current state of the virtualizer.

### `scrollToOffset`

```tsx
scrollToOffset: (
  toOffset: number,
  options?: {
    align?: 'start' | 'center' | 'end' | 'auto',
    behavior?: 'auto' | 'smooth'
  }
) => void
```

Scrolls the virtualizer to the pixel offset provided. You can optionally pass an alignment mode to anchor the scroll to a specific part of the scrollElement.

### `scrollToIndex`

```tsx
scrollToIndex: (
  index: number,
  options?: {
    align?: 'start' | 'center' | 'end' | 'auto',
    behavior?: 'auto' | 'smooth'
  }
) => void
```

Scrolls the virtualizer to the items of the index provided. You can optionally pass an alignment mode to anchor the scroll to a specific part of the scrollElement.

> 🧠 During smooth scrolling, the virtualizer only measures items within a buffer range around the scroll target. Items far from the target are skipped to prevent their size changes from shifting the target position and breaking the smooth animation.
>
> Because of this, the preferred layout strategy for smooth scrolling is **block translation** — translate the entire rendered block using the first item's `start` offset, rather than positioning each item independently with absolute positioning. This ensures items stay correctly positioned relative to each other even when some measurements are skipped.

### `scrollBy`

```tsx
scrollBy: (
  delta: number,
  options?: {
    behavior?: 'auto' | 'smooth'
  }
) => void
```

Scrolls the virtualizer by the specified number of pixels relative to the current scroll position.

### `scrollToEnd`

```tsx
scrollToEnd: (
  options?: {
    behavior?: 'auto' | 'smooth' | 'instant'
  }
) => void
```

Scrolls the virtualizer to the end of the content. For vertical lists this is the bottom; for horizontal lists this is the right edge.

This is useful for "Jump to latest" controls in chat and log views.

### `getDistanceFromEnd`

```tsx
getDistanceFromEnd: () => number
```

Returns the current pixel distance from the end of the virtualized content.

For a vertical list, this is the distance from the bottom.

### `isAtEnd`

```tsx
isAtEnd: (threshold?: number) => boolean
```

Returns whether the viewport is within `threshold` pixels of the end. If no threshold is provided, `scrollEndThreshold` is used.

Use this to decide whether to show "Jump to latest" UI or whether incoming output should be treated as pinned.

### `getTotalSize`

```tsx
getTotalSize: () => number
```

Returns the total size in pixels for the virtualized items. This measurement will incrementally change if you choose to dynamically measure your elements as they are rendered.

### `measure`

```tsx
measure: () => void
```

Resets any prev item measurements.

### `takeSnapshot`

```tsx
takeSnapshot: () => Array<VirtualItem>
```

Returns a snapshot of currently-measured items as plain `VirtualItem`
objects, suitable for round-tripping through state storage and feeding
back as `initialMeasurementsCache` on remount. Pair with the current
`scrollOffset` to restore exact scroll position after navigation.

Only items the consumer has actually rendered (and thus measured) appear
in the snapshot; unmeasured items will fall back to `estimateSize` on
restore. Returns an empty array if no items have been measured.

```tsx
// Capture state on unmount
const snapshot = virtualizer.takeSnapshot()
const offset = virtualizer.scrollOffset
sessionStorage.setItem('myList', JSON.stringify({ snapshot, offset }))

// Restore on remount
const saved = JSON.parse(sessionStorage.getItem('myList') ?? 'null')
useVirtualizer({
  count: items.length,
  estimateSize: () => 50,
  getScrollElement: () => parentRef.current,
  initialMeasurementsCache: saved?.snapshot,
  initialOffset: saved?.offset,
})
```

### `measureElement`

```tsx
measureElement: (el: TItemElement | null) => void
```

Measures the element using your configured `measureElement` virtualizer option. You are responsible for calling this in your virtualizer markup when the component is rendered (eg. using something like React's ref callback prop) also adding `data-index`

```tsx
 <div
  key={virtualRow.key}
  data-index={virtualRow.index}
  ref={virtualizer.measureElement}
  style={...}
>...</div>
```

By default the `measureElement` virtualizer option is configured to measure elements with `getBoundingClientRect()`.

### `resizeItem`

```tsx
resizeItem: (index: number, size: number) => void
```

Change the virtualized item's size manually. Use this function to manually set the size calculated for this index. Useful in occations when using some custom morphing transition and you know the morphed item's size beforehand.

You can also use this method with a throttled ResizeObserver instead of `Virtualizer.measureElement` to reduce re-rendering.

> ⚠️ Please be aware that manually changing the size of an item when using `Virtualizer.measureElement` to monitor that item, will result in unpredictable behaviour as the `Virtualizer.measureElement` is also changing the size. However you can use one of resizeItem or measureElement in the same virtualizer instance but on different item indexes.

### `scrollRect`

```tsx
scrollRect: Rect
```

Current `Rect` of the scroll element.

### `shouldAdjustScrollPositionOnItemSizeChange`

```tsx
shouldAdjustScrollPositionOnItemSizeChange: undefined | ((item: VirtualItem, delta: number, instance: Virtualizer<TScrollElement, TItemElement>) => boolean)
```

Provides fine-grained control over the scroll-position adjustment that fires when an above-viewport item's measured size differs from its estimated size. By default the virtualizer applies this correction only when the user is **not** scrolling backward, which avoids the well-known "items jump while scrolling up" jank. Supply this callback only if you want to override that default — for example, to apply corrections during backward scroll, or to skip them in additional scenarios.

This is a virtualizer instance property, not a `VirtualizerOptions` option. Assign it directly on the virtualizer instance after creating the virtualizer:

```tsx
virtualizer.shouldAdjustScrollPositionOnItemSizeChange = (
  item,
  delta,
  instance,
) => {
  return item.start < instance.getScrollOffset() + instance.scrollAdjustments
}
```

The callback receives the resized `item`, the size `delta`, and the `instance`; return `true` to apply the scroll adjustment, `false` to skip it.

On iOS WebKit, scroll-position writes are deferred regardless of this callback while a finger is on screen, during momentum-scroll, and during elastic-overscroll bounce. The cumulative delta is flushed in a single write once the scroll settles, preserving iOS's native momentum physics.

### `isScrolling`

```tsx
isScrolling: boolean
```

Boolean flag indicating if list is currently being scrolled.

### `scrollDirection`

```tsx
scrollDirection: 'forward' | 'backward' | null
```

This option indicates the direction of scrolling, with possible values being 'forward' for scrolling downwards and 'backward' for scrolling upwards. The value is set to null when there is no active scrolling.

### `scrollOffset`

```tsx
scrollOffset: number
```

This option represents the current scroll position along the scrolling axis. It is measured in pixels from the starting point of the scrollable area.
