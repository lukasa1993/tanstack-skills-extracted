# Devtools Production — NoOp Plugin Variants for Tree-Shaking

[Guide and prerequisites](./tanstack-devtools-production-258b04dd.md) · Published skill · `@tanstack/devtools@0.14.2`.

## NoOp Plugin Variants for Tree-Shaking

When building reusable plugin packages with `@tanstack/devtools-utils`, the factory functions return a `[Plugin, NoOpPlugin]` tuple. The `NoOpPlugin` renders an empty fragment and carries no real dependencies. This is the primary mechanism for library authors to make their plugins tree-shakable.

```tsx
import { createReactPlugin } from '@tanstack/devtools-utils/react'

const [QueryPlugin, QueryNoOpPlugin] = createReactPlugin({
  name: 'TanStack Query',
  Component: ({ theme }) => <QueryDevtoolsPanel theme={theme} />,
})

// The library exports both, and consumers choose:
export { QueryPlugin, QueryNoOpPlugin }
```

Consumer code uses the NoOp variant in production:

```tsx
import { QueryPlugin, QueryNoOpPlugin } from '@tanstack/query-devtools'

const ActivePlugin =
  process.env.NODE_ENV === 'development' ? QueryPlugin : QueryNoOpPlugin

function App() {
  return <TanStackDevtools plugins={[ActivePlugin()]} />
}
```

The NoOp pattern exists for every framework adapter:

| Framework     | Factory              | Source                                          |
| ------------- | -------------------- | ----------------------------------------------- |
| React         | `createReactPlugin`  | `packages/devtools-utils/src/react/plugin.tsx`  |
| React (panel) | `createReactPanel`   | `packages/devtools-utils/src/react/panel.tsx`   |
| Preact        | `createPreactPlugin` | `packages/devtools-utils/src/preact/plugin.tsx` |
| Solid         | `createSolidPlugin`  | `packages/devtools-utils/src/solid/plugin.tsx`  |
| Vue           | `createVuePlugin`    | `packages/devtools-utils/src/vue/plugin.ts`     |

All return `readonly [Plugin, NoOpPlugin]`. The `NoOpPlugin` always has the same metadata (`name`, `id`, `defaultOpen`) but its render function produces an empty fragment, so the bundler can tree-shake the real panel component and all its dependencies.

See the **devtools-framework-adapters** skill for the full factory API details.
