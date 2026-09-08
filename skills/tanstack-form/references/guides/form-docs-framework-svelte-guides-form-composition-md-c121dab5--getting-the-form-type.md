# Form Composition — Getting the Form Type

[Guide and prerequisites](./form-docs-framework-svelte-guides-form-composition-md-c121dab5.md) · Release-matched documentation · `@tanstack/svelte-form@1.33.5`.

## Getting the Form Type

When you split a form into smaller child components, those child components need a typed `form` prop so that `form.AppField`, `form.AppForm`, and the registered field/form components remain fully type-safe. Writing out the full `createAppForm` generics by hand is verbose and error-prone.

`createFormCreator` returns a `getFormType` helper alongside `createAppForm` for exactly this purpose. It accepts the same options object as `createAppForm` and returns a value whose type matches the form instance that `createAppForm` would produce — without actually running any logic at runtime.

```ts
// form.ts
import { createFormCreator } from '@tanstack/svelte-form'
import TextField from './text-field.svelte'
import SubscribeButton from './subscribe-button.svelte'

export const { createAppForm, getFormType } = createFormCreator({
  fieldComponents: {
    TextField,
  },
  formComponents: {
    SubscribeButton,
  },
})
```

Use it together with your shared `formOptions` to derive the expected `form` prop type:

```svelte
<!-- child-form.svelte -->
<script lang="ts">
  import { getFormType } from './form.js'
  import { peopleFormOpts } from './shared-form.js'

  const formType = getFormType({ ...peopleFormOpts })

  const { form }: { form: typeof formType } = $props()
</script>

<form.AppField name="firstName">
  {#snippet children(field)}
    <field.TextField label="First Name" />
  {/snippet}
</form.AppField>
```

This gives the child component a fully typed `form` prop — including the registered `fieldComponents` and `formComponents` — without having to repeat the form generics by hand or maintain a `ReturnType<typeof createAppForm<...>>` alias.

> `useFormContext` is still the best fit for registered form components rendered inside `form.AppForm`. Use `getFormType` when you pass the form instance down as a prop to a child component.
