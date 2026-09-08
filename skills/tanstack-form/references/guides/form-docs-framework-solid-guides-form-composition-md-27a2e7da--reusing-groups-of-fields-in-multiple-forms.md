# Form Composition — Reusing groups of fields in multiple forms

[Guide and prerequisites](./form-docs-framework-solid-guides-form-composition-md-27a2e7da.md) · Release-matched documentation · `@tanstack/solid-form@1.33.5`.

## Reusing groups of fields in multiple forms

Sometimes, a pair of fields are so closely related that it makes sense to group and reuse them — like the password example listed in the [linked fields guide](./form-docs-framework-solid-guides-linked-fields-md-1e40c9c5.md#source-form-docs-framework-solid-guides-linked-fields-md). Instead of repeating this logic across multiple forms, you can utilize the `withFieldGroup` higher-order component.

> Unlike `withForm`, validators cannot be specified and could be any value.
> Ensure that your fields can accept unknown error types.

Rewriting the passwords example using `withFieldGroup` would look like this:

```tsx
const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
    ErrorInfo,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})

type PasswordFields = {
  password: string
  confirm_password: string
}

// These default values are not used at runtime, but the keys are needed for mapping purposes.
// This allows you to spread `formOptions` without needing to redeclare it.
const defaultValues: PasswordFields = {
  password: '',
  confirm_password: '',
}

const FieldGroupPasswordFields = withFieldGroup({
  defaultValues,
  // You may also restrict the group to only use forms that implement this submit meta.
  // If none is provided, any form with the right defaultValues may use it.
  // onSubmitMeta: { action: '' }

  // Optional, but adds props to the `render` function in addition to `form`
  props: {
    // These props are set as default values for the `render` function
    title: 'Password',
  },
  // Internally, you will have access to a `group` instead of a `form`
  render: function Render(props) {
    // access reactive values using the group store
    const password = useSelector(
      props.group.store,
      (state) => state.values.password,
    )
    // or the form itself
    const isSubmitting = useSelector(
      props.group.form.store,
      (state) => state.isSubmitting,
    )

    return (
      <div>
        <h2>{props.title}</h2>
        {/* Groups also have access to Field, Subscribe, Field, AppField and AppForm */}
        <props.group.AppField name="password">
          {(field) => <field.TextField label="Password" />}
        </props.group.AppField>
        <props.group.AppField
          name="confirm_password"
          validators={{
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) => {
              // The form could be any values, so it is typed as 'unknown'
              const values: unknown = fieldApi.form.state.values
              // use the group methods instead
              if (value !== props.group.getFieldValue('password')) {
                return 'Passwords do not match'
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <div>
              <field.TextField label="Confirm Password" />
              <field.ErrorInfo />
            </div>
          )}
        </props.group.AppField>
      </div>
    )
  },
})
```

We can now use these grouped fields in any form that implements the default values:

```tsx
// You are allowed to extend the group fields as long as the
// existing properties remain unchanged
type Account = PasswordFields & {
  provider: string
  username: string
}

// You may nest the group fields wherever you want
type FormValues = {
  name: string
  age: number
  account_data: PasswordFields
  linked_accounts: Account[]
}

const defaultValues: FormValues = {
  name: '',
  age: 0,
  account_data: {
    password: '',
    confirm_password: '',
  },
  linked_accounts: [
    {
      provider: 'TanStack',
      username: '',
      password: '',
      confirm_password: '',
    },
  ],
}

function App() {
  const form = useAppForm(() => ({
    defaultValues,
    // If the group didn't specify an `onSubmitMeta` property,
    // the form may implement any meta it wants.
    // Otherwise, the meta must be defined and match.
    onSubmitMeta: { action: '' },
  }))

  return (
    <form.AppForm>
      <FieldGroupPasswordFields
        form={form}
        // You must specify where the fields can be found
        fields="account_data"
        title="Passwords"
      />
      <form.Field name="linked_accounts" mode="array">
        {(field) =>
          field().state.value.map((account, i) => (
            <FieldGroupPasswordFields
              key={account.provider}
              form={form}
              // The fields may be in nested fields
              fields={`linked_accounts[${i}]`}
              title={account.provider}
            />
          ))
        }
      </form.Field>
    </form.AppForm>
  )
}
```

### Mapping field group values to a different field

You may want to keep the password fields on the top level of your form, or rename the properties for clarity. You can map field group values
to their true location by changing the `field` property:

> [!IMPORTANT]
> Due to TypeScript limitations, field mapping is only allowed for objects. You can use records or arrays at the top level of a field group, but you will not be able to map the fields.

```tsx
// To have an easier form, you can keep the fields on the top level
type FormValues = {
  name: string
  age: number
  password: string
  confirm_password: string
}

const defaultValues: FormValues = {
  name: '',
  age: 0,
  password: '',
  confirm_password: '',
}

function App() {
  const form = useAppForm(() => ({
    defaultValues,
  }))

  return (
    <form.AppForm>
      <FieldGroupPasswordFields
        form={form}
        // You can map the fields to their equivalent deep key
        fields={{
          password: 'password',
          confirm_password: 'confirm_password',
          // or map them to differently named keys entirely
          // 'password': 'name'
        }}
        title="Passwords"
      />
    </form.AppForm>
  )
}
```

If you expect your fields to always be at the top level of your form, you can create a quick map
of your field groups using a helper function:

```tsx
const defaultValues: PasswordFields = {
  password: '',
  confirm_password: '',
}

const passwordFields = createFieldMap(defaultValues)
/* This generates the following map:
 {
    'password': 'password',
    'confirm_password': 'confirm_password'
 }
*/

// Usage:
<FieldGroupPasswordFields
  form={form}
  fields={passwordFields}
  title="Passwords"
/>
```
