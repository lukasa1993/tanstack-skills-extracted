# Virtualizer — Optional Options: `laneAssignmentMode`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.10`.

## Optional Options: `laneAssignmentMode`


```tsx
laneAssignmentMode?: 'estimate' | 'measured'
```

**Default**: `'estimate'`

Controls when lane assignments are cached in a masonry layout.

- `'estimate'` (default): lane assignments are cached immediately based on `estimateSize`. This keeps items from jumping between lanes, but assignments may be suboptimal when the estimate is inaccurate.
- `'measured'`: lane caching is deferred until items are measured via `measureElement`, so assignments reflect actual measured sizes. After the initial measurement, lanes are cached and remain stable.
