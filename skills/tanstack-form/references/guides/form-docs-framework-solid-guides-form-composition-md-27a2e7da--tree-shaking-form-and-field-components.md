# Form Composition — Tree-shaking form and field components

[Guide and prerequisites](./form-docs-framework-solid-guides-form-composition-md-27a2e7da.md) · Release-matched documentation · `@tanstack/solid-form@1.33.5`.

## Tree-shaking form and field components

While the above examples are great for getting started, they're not ideal for certain use-cases where you might have hundreds of form and field components.
In particular, you may not want to include all of your form and field components in the bundle of every file that uses your form hook.

To solve this, you can mix the `createFormHook` TanStack API with the Solid `lazy` and `Suspense` components:

```typescript
// src/hooks/form-context.ts
import { createFormHookContexts } from '@tanstack/solid-form'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()
```

```tsx
// src/components/text-field.tsx
import { useFieldContext } from '../hooks/form-context.tsx'

export default function TextField(props: { label: string }) {
  const field = useFieldContext<string>()

  return (
    <label>
      <div>{props.label}</div>
      <input
        value={field().state.value}
        onChange={(e) => field().handleChange(e.target.value)}
      />
    </label>
  )
}
```

```tsx
// src/hooks/form.ts
import { lazy } from 'solid-js'
import { createFormHook } from '@tanstack/solid-form'

const TextField = lazy(() => import('../components/text-fields.tsx'))

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
  },
  formComponents: {},
})
```

```tsx
// src/App.tsx
import { Suspense } from 'solid-js'
import { PeoplePage } from './features/people/form.tsx'

export default function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PeoplePage />
    </Suspense>
  )
}
```

This will show the Suspense fallback while the `TextField` component is being loaded, and then render the form once it's loaded.
