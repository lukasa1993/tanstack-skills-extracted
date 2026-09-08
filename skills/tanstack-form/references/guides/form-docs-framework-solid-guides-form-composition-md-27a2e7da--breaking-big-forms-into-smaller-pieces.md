# Form Composition — Breaking big forms into smaller pieces

[Guide and prerequisites](./form-docs-framework-solid-guides-form-composition-md-27a2e7da.md) · Release-matched documentation · `@tanstack/solid-form@1.33.5`.

## Breaking big forms into smaller pieces

Sometimes forms get very large; it's just how it goes sometimes. While TanStack Form supports large forms well, it's never fun to work with hundreds or thousands of lines of code long files.

To solve this, we support breaking forms into smaller pieces using the `withForm` higher-order component.

```tsx
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

const ChildForm = withForm({
  // These values are only used for type-checking, and are not used at runtime
  // This allows you to `...formOpts` from `formOptions` without needing to redeclare the options
  defaultValues: {
    firstName: 'John',
    lastName: 'Doe',
  },
  // Optional, but adds props to the `render` function in addition to `form`
  props: {
    // These props are also set as default values for the `render` function
    title: 'Child Form',
  },
  render: function Render(props) {
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

function App() {
  const form = useAppForm(() => ({
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  }))

  return <ChildForm form={form} title={'Testing'} />
}
```

### `withForm` FAQ

> Why a higher-order component instead of a hook?
>
> While hooks are the future of Solid, higher-order components are still a powerful tool for composition. In particular, the API of `withForm` enables us to have strong type-safety without requiring users to pass generics.
