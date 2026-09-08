# Form Composition — Tree-shaking form and field components

[Guide and prerequisites](./form-docs-framework-svelte-guides-form-composition-md-c121dab5.md) · Release-matched documentation · `@tanstack/svelte-form@1.33.5`.

## Tree-shaking form and field components

While the above examples are great for getting started, they're not ideal for certain use-cases where you might have hundreds of form and field components.
In particular, you may not want to include all of your form and field components in the bundle of every file that uses your form method.

To solve this, you can use dynamic imports with Svelte's component loading:

```ts
// src/utils/form-context.ts
import { createFormCreatorContexts } from '@tanstack/svelte-form'

export const { useFieldContext, useFormContext } = createFormCreatorContexts()
```

```svelte
<!-- src/components/text-field.svelte -->
<script lang="ts">
  import { useFieldContext } from '../utils/form-context.js'

  const field = useFieldContext<string>()

  const { label }: { label: string } = $props()
</script>

<label>
  <div>{label}</div>
  <input
    value={field.state.value}
    oninput={(e) => field.handleChange((e.target as HTMLInputElement).value)}
  />
</label>
```

```ts
// src/utils/form.ts
import { createFormCreator } from '@tanstack/svelte-form'
import TextField from '../components/text-field.svelte'
import SubscribeButton from '../components/subscribe-button.svelte'

export const { createAppForm, getFormType } = createFormCreator({
  fieldComponents: {
    TextField,
  },
  formComponents: {
    SubscribeButton,
  },
})
```

```svelte
<!-- src/App.svelte -->
<script lang="ts">
  import PeoplePage from './features/people/page.svelte'
</script>

<PeoplePage />
```
