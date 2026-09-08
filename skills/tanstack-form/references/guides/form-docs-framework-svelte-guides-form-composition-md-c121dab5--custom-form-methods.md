# Form Composition — Custom Form Methods

[Guide and prerequisites](./form-docs-framework-svelte-guides-form-composition-md-c121dab5.md) · Release-matched documentation · `@tanstack/svelte-form@1.33.5`.

## Custom Form Methods

The most powerful way to compose forms is to create custom form methods. This allows you to create a form method that is tailored to your application's needs, including pre-bound custom UI components and more.

At its most basic, `createFormCreator` is a function that returns a `createAppForm` method.

> This un-customized `createAppForm` method is identical to `createForm`, but that will quickly change as we add more options to `createFormCreator`.

```ts
// form-context.ts
import { createFormCreatorContexts } from '@tanstack/svelte-form'

// export useFieldContext and useFormContext for use in your custom components
export const { useFieldContext, useFormContext } = createFormCreatorContexts()
```

```ts
// form.ts
import { createFormCreator } from '@tanstack/svelte-form'

export const { createAppForm } = createFormCreator({
  // We'll learn more about these options later
  fieldComponents: {},
  formComponents: {},
})
```

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { createAppForm } from './form.js'

  const form = createAppForm(() => ({
    // Supports all createForm options
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  }))
</script>

<form.Field name="firstName">
  <!-- ... -->
</form.Field>
```

### Pre-bound Field Components

Once this scaffolding is in place, you can start adding custom field and form components to your form method.

> Note: the `useFieldContext` must be the same one exported from your custom form context

```svelte
<!-- text-field.svelte -->
<script lang="ts">
  import { useFieldContext } from './form-context.js'

  // The `Field` infers that it should have a `value` type of `string`
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

You're then able to register this component with your form method.

```ts
import { createFormCreator } from '@tanstack/svelte-form'
import TextField from './text-field.svelte'

export const { createAppForm } = createFormCreator({
  fieldComponents: {
    TextField,
  },
  formComponents: {},
})
```

And use it in your form:

```svelte
<script lang="ts">
  import { createAppForm } from './form.js'

  const form = createAppForm(() => ({
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  }))
</script>

<!-- Notice the `AppField` instead of `Field`; `AppField` provides the required context -->
<form.AppField name="firstName">
  {#snippet children(field)}
    <field.TextField label="First Name" />
  {/snippet}
</form.AppField>
```

This not only allows you to reuse the UI of your shared component, but retains the type-safety you'd expect from TanStack Form: Typo `name` and get a TypeScript error.

### Pre-bound Form Components

While `form.AppField` solves many of the problems with Field boilerplate and reusability, it doesn't solve the problem of _form_ boilerplate and reusability.

In particular, being able to share instances of `form.Subscribe` for, say, a reactive form submission button is a common usecase.

```svelte
<!-- subscribe-button.svelte -->
<script lang="ts">
  import { useFormContext } from './form-context.js'

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

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { createAppForm } from './form.js'

  const form = createAppForm(() => ({
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  }))
</script>

<form.AppForm>
  <!-- Notice the `AppForm` component wrapper; `AppForm` provides the required context -->
  {#snippet children()}
    <form.SubscribeButton label="Submit" />
  {/snippet}
</form.AppForm>
```
