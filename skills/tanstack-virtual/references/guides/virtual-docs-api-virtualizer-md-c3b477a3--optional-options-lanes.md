# Virtualizer — Optional Options: `lanes`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `lanes`


```tsx
lanes: number
```

The number of lanes the list is divided into (aka columns for vertical lists and rows for horizontal lists). Items are assigned to the lane with the shortest total size. By default, lane assignments are cached immediately based on `estimateSize` to prevent items from jumping between lanes (see `laneAssignmentMode` below to change this behavior).
