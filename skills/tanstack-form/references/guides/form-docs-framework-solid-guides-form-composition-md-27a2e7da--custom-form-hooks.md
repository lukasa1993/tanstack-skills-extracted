# Form Composition — Custom Form Hooks

[Guide and prerequisites](./form-docs-framework-solid-guides-form-composition-md-27a2e7da.md) · Release-matched documentation · `@tanstack/solid-form@1.33.5`.

## Custom Form Hooks

The most powerful way to compose forms is to create custom form hooks. This allows you to create a form hook that is tailored to your application's needs, including pre-bound custom UI components and more.

At it's most basic, `createFormHook` is a function that takes a `fieldContext` and `formContext` and returns a `useAppForm` hook.

> This un-customized `useAppForm` hook is identical to `useForm`, but that will quickly change as we add more options to `createFormHook`.

```tsx
import { createFormHookContexts, createFormHook } from '@tanstack/solid-form'

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts()

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {},
  formComponents: {},
})

function App() {
  const form = useAppForm(() => ({
    // Supports all useForm options
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  }))

  return <form.Field /> // ...
}
```

### Pre-bound Field Components

Once this scaffolding is in place, you can start adding custom field and form components to your form hook.

> Note: the `useFieldContext` must be the same one exported from your custom form context

```tsx
import { useFieldContext } from './form-context.tsx'

export function TextField(props: { label: string }) {
  // The `Field` infers that it should have a `value` type of `string`
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
```

You're then able to register this component with your form hook.

```tsx
import { TextField } from './text-field.tsx'

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
  },
  formComponents: {},
})
```

And use it in your form:

```tsx
function App() {
  const form = useAppForm(() => ({
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  }))

  return (
    // Notice the `AppField` instead of `Field`; `AppField` provides the required context
    <form.AppField
      name="firstName"
      children={(field) => <field.TextField label="First Name" />}
    />
  )
}
```

This not only allows you to reuse the UI of your shared component, but retains the type-safety you'd expect from TanStack Form: Typo `name` and get a TypeScript error.

### Pre-bound Form Components

While `form.AppField` solves many of the problems with Field boilerplate and reusability, it doesn't solve the problem of _form_ boilerplate and reusability.

In particular, being able to share instances of `form.Subscribe` for, say, a reactive form submission button is a common usecase.

```tsx
function SubscribeButton(props: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button type="submit" disabled={isSubmitting()}>
          {props.label}
        </button>
      )}
    </form.Subscribe>
  )
}

const { useAppForm, withForm } = createFormHook({
  fieldComponents: {},
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})

function App() {
  const form = useAppForm(() => ({
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  }))

  return (
    <form.AppForm>
      // Notice the `AppForm` component wrapper; `AppForm` provides the required
      context
      <form.SubscribeButton label="Submit" />
    </form.AppForm>
  )
}
```
