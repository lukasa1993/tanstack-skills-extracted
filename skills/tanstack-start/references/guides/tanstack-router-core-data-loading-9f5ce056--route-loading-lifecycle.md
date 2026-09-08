# Data Loading — Route Loading Lifecycle

[Guide and prerequisites](./tanstack-router-core-data-loading-9f5ce056.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Route Loading Lifecycle

The router executes this sequence on every URL/history update:

1. **Route Matching** (top-down)
   - `route.params.parse`
   - `route.validateSearch`
2. **Route Pre-Loading** (serial)
   - `route.beforeLoad`
   - `route.onError` → `route.errorComponent`
3. **Route Loading** (parallel)
   - `route.component.preload?`
   - `route.loader`
     - `route.pendingComponent` (optional)
     - `route.component`
   - `route.onError` → `route.errorComponent`

Key: `beforeLoad` runs before `loader`. `beforeLoad` for a parent runs before its children's `beforeLoad`. Throwing in `beforeLoad` prevents all children from loading.
