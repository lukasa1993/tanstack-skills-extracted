# Virtualizer — Optional Options: `getItemKey`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `getItemKey`


```tsx
getItemKey?: (index: number) => Key
```

This function is passed the index of each item and should return a unique key for that item. The default functionality of this function is to return the index of the item, but you should override this when possible to return a unique identifier for each item across the entire set.

**Note:** The virtualizer automatically invalidates its measurement cache when measurement-affecting options change, ensuring `getTotalSize()` and other measurements return fresh values. While the virtualizer intelligently tracks which options actually affect measurements, it's still better to memoize `getItemKey` (e.g., using `useCallback` in React) to avoid unnecessary recalculations.
