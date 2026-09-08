# Form Composition — Breaking big forms into smaller pieces

[Guide and prerequisites](./form-docs-framework-svelte-guides-form-composition-md-c121dab5.md) · Release-matched documentation · `@tanstack/svelte-form@1.33.5`.

## Breaking big forms into smaller pieces

Sometimes forms get very large; it's just how it goes sometimes. While TanStack Form supports large forms well, it's never fun to work with hundreds or thousands of lines of code long files.

To solve this, you can break forms into smaller Svelte components that accept the form as a prop.

```ts
// shared-form.ts
import { formOptions } from '@tanstack/svelte-form'

export const peopleFormOpts = formOptions({
  defaultValues: {
    firstName: 'John',
    lastName: 'Doe',
  },
})
```

```svelte
<!-- child-form.svelte -->
<script lang="ts">
  import { getFormType } from './form.js'
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
<!-- App.svelte -->
<script lang="ts">
  import { createAppForm } from './form.js'
  import { peopleFormOpts } from './shared-form.js'
  import ChildForm from './child-form.svelte'

  const form = createAppForm(() => ({
    ...peopleFormOpts,
  }))
</script>

<ChildForm {form} title="Testing" />
```
