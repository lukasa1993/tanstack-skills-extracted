# Form Composition — Reusing groups of fields in multiple forms

[Guide and prerequisites](./form-docs-framework-svelte-guides-form-composition-md-c121dab5.md) · Release-matched documentation · `@tanstack/svelte-form@1.33.5`.

## Reusing groups of fields in multiple forms

Sometimes, a pair of fields are so closely related that it makes sense to group and reuse them — like the password example listed in the [linked fields guide](./form-docs-framework-svelte-guides-linked-fields-md-e6b1933c.md#source-form-docs-framework-svelte-guides-linked-fields-md). Instead of repeating this logic across multiple forms, you can create reusable field group components.

> Unlike form-level components, validators in field groups cannot be strictly typed and could be any value.
> Ensure that your fields can accept unknown error types.

Rewriting the passwords example as a reusable component would look like this:

```svelte
<!-- password-fields.svelte -->
<script lang="ts">
  import type { createAppForm } from './form.js'

  type PasswordFields = {
    password: string
    confirm_password: string
  }

  type AppForm = ReturnType<typeof createAppForm<PasswordFields>>

  const { form, title = 'Password' }: { form: AppForm; title?: string } = $props()
</script>

<div>
  <h2>{title}</h2>
  <form.AppField name="password">
    {#snippet children(field)}
      <field.TextField label="Password" />
    {/snippet}
  </form.AppField>
  <form.AppField
    name="confirm_password"
    validators={{
      onChangeListenTo: ['password'],
      onChange: ({ value, fieldApi }) => {
        if (value !== fieldApi.form.getFieldValue('password')) {
          return 'Passwords do not match'
        }
        return undefined
      },
    }}
  >
    {#snippet children(field)}
      <div>
        <field.TextField label="Confirm Password" />
        {#each field.state.meta.errors as error}
          <div style="color: red;">{error}</div>
        {/each}
      </div>
    {/snippet}
  </form.AppField>
</div>
```

We can now use these grouped fields in any form that implements the required fields:

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { createAppForm } from './form.js'
  import PasswordFields from './password-fields.svelte'

  const form = createAppForm(() => ({
    defaultValues: {
      name: '',
      age: 0,
      password: '',
      confirm_password: '',
    },
  }))
</script>

<form.AppForm>
  {#snippet children()}
    <form.AppField name="name">
      {#snippet children(field)}
        <field.TextField label="Name" />
      {/snippet}
    </form.AppField>
    <PasswordFields {form} title="Account Password" />
    <form.SubscribeButton label="Submit" />
  {/snippet}
</form.AppForm>
```
