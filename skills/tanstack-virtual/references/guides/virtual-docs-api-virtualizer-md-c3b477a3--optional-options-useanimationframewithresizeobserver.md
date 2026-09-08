# Virtualizer — Optional Options: `useAnimationFrameWithResizeObserver`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `useAnimationFrameWithResizeObserver`


```tsx
useAnimationFrameWithResizeObserver: boolean
```

**Default:** `false`

When enabled, defers ResizeObserver measurement processing to the next animation frame using `requestAnimationFrame`.

**Important:** This option typically **should not be enabled** in most cases. ResizeObserver callbacks already execute at an optimal time in the browser's rendering pipeline (after layout, before paint), and the measurements provided in the callback are pre-computed by the browser without causing additional reflows.

**Potential use cases:**
- If you're performing heavy DOM mutations in response to size changes and want to batch them with the next render cycle
- As a workaround for the "ResizeObserver loop completed with undelivered notifications" error (though this usually indicates a deeper issue that should be fixed)

**Tradeoffs:**
- **Adds ~16ms delay:** Measurements are deferred to the next frame, which can cause visual artifacts, stale measurements, or slower time-to-interactive
- **No batching benefit:** ResizeObserver already batches multiple element resizes into a single callback
- **Defeats optimization:** The browser has already computed the measurements synchronously; deferring them provides no performance benefit for reading values

Only enable this option if you have a specific reason and have measured that it improves your use case.
