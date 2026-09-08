# Form Composition — Breaking big forms into smaller pieces

[Guide and prerequisites](./form-docs-framework-react-guides-form-composition-md-d727f890.md) · Release-matched documentation · `@tanstack/react-form@1.33.5`.

## Breaking big forms into smaller pieces

Sometimes forms get very large; it's just how it goes sometimes. While TanStack Form supports large forms well, it's never fun to work with hundreds or thousands of lines of code in single files.

To solve this, we support breaking forms into smaller pieces using the `withForm` higher-order component.

```tsx
const { useAppForm, withForm } = createFormHook({
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
  render: function Render({ form, title }) {
    return (
      <div>
        <p>{title}</p>
        <form.AppField
          name="firstName"
          children={(field) => <field.TextField label="First Name" />}
        />
        <form.AppForm>
          <form.SubscribeButton label="Submit" />
        </form.AppForm>
      </div>
    )
  },
})

function App() {
  const form = useAppForm({
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  })

  return <ChildForm form={form} title={'Testing'} />
}
```

> Something worth mentioning, is that while multiple chaining of `AppForm` extensions is possible it is can lead to decreases in TypeScript performance.
> For most users that may only extend an appForm once this isn't a problem, however we recommend limiting it to 3-5 extensions.

### `withForm` FAQ

> Why a higher-order component instead of a hook?

While hooks are the future of React, higher-order components are still a powerful tool for composition. In particular, the API of `withForm` enables us to have strong type-safety without requiring users to pass generics.

> Why am I getting ESLint errors about hooks in `render`?

ESLint looks for hooks in the top-level of a function, and `render` may not be recogized as a top-level component, depending on how you defined it.

```tsx
// This will cause ESLint errors with hooks usage
const ChildForm = withForm({
  // ...
  render: ({ form, title }) => {
    // ...
  },
})
```

```tsx
// This works fine
const ChildForm = withForm({
  // ...
  render: function Render({ form, title }) {
    // ...
  },
})
```

### Context as a last resort

There are cases where passing `form` with `withForm` is not feasible. You may encounter it with components that don't
allow you to change their props.

For example, consider the following TanStack Router usage:

```ts
function RouteComponent() {
  const form = useAppForm({...formOptions, /* ... */ })
  // <Outlet /> cannot be customized or receive additional props
  return <Outlet />
}
```

In edge cases like this, a context-based fallback is available to access the form instance.

```ts
const { useAppForm, useTypedAppFormContext } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
})
```

> [!IMPORTANT] Type safety
> This mechanism exists solely to bridge integration constraints and should be avoided whenever `withForm` is possible.
> Context will not warn you when the types do not align. You risk runtime errors with this implementation.

Usage:

```tsx
// sharedOpts.ts
const formOpts = formOptions({
  /* ... */
})

function ParentComponent() {
  const form = useAppForm({ ...formOptions /* ... */ })

  return (
    <form.AppForm>
      <ChildComponent />
    </form.AppForm>
  )
}

function ChildComponent() {
  const form = useTypedAppFormContext({ ...formOptions })

  // You now have access to form components, field components and fields
}
```
