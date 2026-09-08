# Form Composition — Putting it all together

[Guide and prerequisites](./form-docs-framework-solid-guides-form-composition-md-27a2e7da.md) · Release-matched documentation · `@tanstack/solid-form@1.33.5`.

## Putting it all together

Now that we've covered the basics of creating custom form hooks, let's put it all together in a single example.

```tsx
// /src/hooks/form.ts, to be used across the entire app
const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

function TextField(props: { label: string }) {
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

function SubscribeButton(props: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button disabled={isSubmitting()}>{props.label}</button>
      )}
    </form.Subscribe>
  )
}

const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})

// /src/features/people/shared-form.ts, to be used across `people` features
const formOpts = formOptions({
  defaultValues: {
    firstName: 'John',
    lastName: 'Doe',
  },
})

// /src/features/people/nested-form.ts, to be used in the `people` page
const ChildForm = withForm({
  ...formOpts,
  // Optional, but adds props to the `render` function outside of `form`
  props: {
    title: 'Child Form',
  },
  render: (props) => {
    return (
      <div>
        <p>{props.title}</p>
        <props.form.AppField
          name="firstName"
          children={(field) => <field.TextField label="First Name" />}
        />
        <props.form.AppForm>
          <props.form.SubscribeButton label="Submit" />
        </props.form.AppForm>
      </div>
    )
  },
})

// /src/features/people/page.ts
const Parent = () => {
  const form = useAppForm(() => ({
    ...formOpts,
  }))

  return <ChildForm form={form} title={'Testing'} />
}
```
