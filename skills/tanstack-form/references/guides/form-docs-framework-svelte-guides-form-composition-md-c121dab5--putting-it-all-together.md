# Form Composition — Putting it all together

[Guide and prerequisites](./form-docs-framework-svelte-guides-form-composition-md-c121dab5.md) · Release-matched documentation · `@tanstack/svelte-form@1.33.5`.

## Putting it all together

Now that we've covered the basics of creating custom form methods, let's put it all together in a single example.

```ts
// /src/utils/form-context.ts, to be used across the entire app
import { createFormCreatorContexts } from '@tanstack/svelte-form'

export const { useFieldContext, useFormContext } = createFormCreatorContexts()
```

```svelte
<!-- /src/components/text-field.svelte -->
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

```svelte
<!-- /src/components/subscribe-button.svelte -->
<script lang="ts">
  import { useFormContext } from '../utils/form-context.js'

  const form = useFormContext()

  const { label }: { label: string } = $props()
</script>

<form.Subscribe selector={(state) => state.isSubmitting}>
  {#snippet children(isSubmitting)}
    <button type="submit" disabled={isSubmitting}>
      {label}
    </button>
  {/snippet}
</form.Subscribe>
```

```ts
// /src/utils/form.ts
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

```ts
// /src/features/people/shared-form.ts, to be used across `people` features
import { formOptions } from '@tanstack/svelte-form'

export const peopleFormOpts = formOptions({
  defaultValues: {
    firstName: 'John',
    lastName: 'Doe',
  },
})
```

```svelte
<!-- /src/features/people/child-form.svelte, to be used in the `people` page -->
<script lang="ts">
  import { getFormType } from '../../utils/form.js'
  import { peopleFormOpts } from './shared-form.js'

  const formType = getFormType({ ...peopleFormOpts })

  const { form, title = 'Child Form' }: { form: typeof formType; title?: string } = $props()
</script>

<div>
  <p>{title}</p>
  <form.AppField name="firstName">
    {#snippet children(field)}
      <field.TextField label="First Name" />
    {/snippet}
  </form.AppField>
  <form.AppForm>
    {#snippet children()}
      <form.SubscribeButton label="Submit" />
    {/snippet}
  </form.AppForm>
</div>
```

```svelte
<!-- /src/features/people/page.svelte -->
<script lang="ts">
  import { createAppForm } from '../../utils/form.js'
  import { peopleFormOpts } from './shared-form.js'
  import ChildForm from './child-form.svelte'

  const form = createAppForm(() => ({
    ...peopleFormOpts,
  }))
</script>

<ChildForm {form} title="Testing" />
```
