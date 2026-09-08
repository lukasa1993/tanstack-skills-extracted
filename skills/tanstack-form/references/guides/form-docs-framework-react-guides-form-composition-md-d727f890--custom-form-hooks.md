# Form Composition — Custom Form Hooks

[Guide and prerequisites](./form-docs-framework-react-guides-form-composition-md-d727f890.md) · Release-matched documentation · `@tanstack/react-form@1.33.5`.

## Custom Form Hooks

The most powerful way to compose forms is to create custom form hooks. This allows you to create a form hook that is tailored to your application's needs, including pre-bound custom UI components and more.

At it's most basic, `createFormHook` is a function that takes a `fieldContext` and `formContext` and returns a `useAppForm` hook.

> This un-customized `useAppForm` hook is identical to `useForm`, but that will quickly change as we add more options to `createFormHook`.

```tsx AppFormContext.tsx
import { createFormHookContexts } from '@tanstack/react-form'

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts()
```

```tsx AppForm.tsx
import { createFormHook } from '@tanstack/react-form'
import { createFormHookContexts } from './AppFormContext'

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {},
  formComponents: {},
})

function App() {
  const form = useAppForm({
    // Supports all useForm options
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  })

  return <form.Field /> // ...
}
```

### Pre-bound Field Components

Once this scaffolding is in place, you can start adding custom field and form components to your form hook.

> Note: the `useFieldContext` must be the same one exported from your custom form context

```tsx
import { useFieldContext } from './form-context.tsx'

export function TextField({ label }: { label: string }) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>()
  return (
    <label>
      <span>{label}</span>
      <input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
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
  const form = useAppForm({
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  })

  return (
    // Notice the `AppField` instead of `Field`; `AppField` provides the required context
    <form.AppField
      name="firstName"
      children={(field) => <field.TextField label="First Name" />}
    />
  )
}
```

This not only allows you to reuse the UI of your shared component, but retains the type-safety you'd expect from TanStack Form: Mistyping `firstName` will result in a TypeScript error.

#### A note on performance

While context is a valuable tool in the React ecosystem, there's appropriate concern from many users that providing a reactive value through a context will cause unnecessary re-renders.

> Unfamiliar with this performance concern? [Mark Erikson's blog post explaining why Redux solves many of these problems](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/) is a great place to start.

While this is a good concern to call out, it's not a problem for TanStack Form; the values provided through context are not reactive themselves, but instead are static class instances with reactive properties ([using TanStack Store as our signals implementation to power the show](https://tanstack.com/store)).

### Pre-bound Form Components

While `form.AppField` solves many of the problems with Field boilerplate and reusability, it doesn't solve the problem of _form_ boilerplate and reusability.

In particular, being able to share instances of `form.Subscribe` for, say, a reactive form submission button is a common usecase.

```tsx
function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button type="submit" disabled={isSubmitting}>
          {label}
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
  const form = useAppForm({
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  })

  return (
    <form.AppForm>
      // Notice the `AppForm` component wrapper; `AppForm` provides the required
      context
      <form.SubscribeButton label="Submit" />
    </form.AppForm>
  )
}
```

### Extending custom appForm

It is quite common for platform teams to ship pre built appForms. It can be exported from a library in a monorepo or as a standalone package on npm.

```tsx weyland-yutan-corp/forms-context.tsx
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
```

```tsx weyland-yutan-corp/forms.tsx
import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from 'weyland-yutan-corp/forms-context'

// fields
import { UserIdField } from './FieldComponents/UserIdField'

// components
import { SubmitButton } from './FormComponents/SubmitButton'

const ProfileForm = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { UserIdField },
  formComponents: { SubmitButton },
})

export default ProfileForm
```

There is a situation that you might have a field exclusive to a downstream dev team, in such a case you can extend the AppForm like so.

1 - Create new AppForm fields

```tsx AppForm.tsx
// imported from the same AppForm you want to extend
import { useFieldContext } from 'weyland-yutan-corp/forms-context'

export function CustomTextField({ label }: { label: string }) {
  const field = useFieldContext<string>()
  return (
    <div>
      <label>{/* rest of component */}</label>
    </div>
  )
}
```

2 - Extend the AppForm

```tsx AppForm.tsx
// notice the same import as above
import ProfileForm from 'weyland-yutan-corp/forms'

import { CustomTextField } from './FieldComponents/CustomTextField'
import { SubmitButton } from './FormComponents/SubmitButton'

export const { useAppForm } = ProfileForm.extendForm({
  fieldComponents: { CustomTextField },
  // Ts will error since the parent appForm already has a component called SubmitButton
  formComponents: { SubmitButton },
})
```

This way you can add extra fields that are unique to your team without bloating the upstream AppForm.
