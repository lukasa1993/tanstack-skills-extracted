# React advanced patterns

Advanced React composition, validation, SSR, and form architecture.

<a id="source-form-docs-framework-react-guides-custom-errors-md"></a>

## Custom Errors

Source: `form:docs/framework/react/guides/custom-errors.md`.

TanStack Form provides complete flexibility in the types of error values you can return from validators. String errors are the most common and easy to work with, but the library allows you to return any type of value from your validators.

As a general rule, any truthy value is considered an error and will mark the form or field as invalid, while falsy values (`false`, `undefined`, `null`, etc.) mean there is no error, and the form or field is valid.

### Return String Values from Forms

```tsx
<form.Field
  name="username"
  validators={{
    onChange: ({ value }) =>
      value.length < 3 ? 'Username must be at least 3 characters' : undefined,
  }}
/>
```

For form-level validation affecting multiple fields:

```tsx
const form = useForm({
  defaultValues: {
    username: '',
    email: '',
  },
  validators: {
    onChange: ({ value }) => {
      return {
        fields: {
          username:
            value.username.length < 3 ? 'Username too short' : undefined,
          email: !value.email.includes('@') ? 'Invalid email' : undefined,
        },
      }
    },
  },
})
```

String errors are the most common type and are easily displayed in your UI:

```tsx
{
  field.state.meta.errors.map((error, i) => (
    <div key={i} className="error">
      {error}
    </div>
  ))
}
```

#### Numbers

Useful for representing quantities, thresholds, or magnitudes:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) => (value < 18 ? 18 - value : undefined),
  }}
/>
```

Display in UI:

```tsx
// TypeScript knows the error is a number based on your validator
<div className="error">
  You need {field.state.meta.errors[0]} more years to be eligible
</div>
```

#### Booleans

Simple flags to indicate error state:

```tsx
<form.Field
  name="accepted"
  validators={{
    onChange: ({ value }) => (!value ? true : undefined),
  }}
/>
```

Display in UI:

```tsx
{
  field.state.meta.errors[0] === true && (
    <div className="error">You must accept the terms</div>
  )
}
```

#### Objects

Rich error objects with multiple properties:

```tsx
<form.Field
  name="email"
  validators={{
    onChange: ({ value }) => {
      if (!value.includes('@')) {
        return {
          message: 'Invalid email format',
          severity: 'error',
          code: 1001,
        }
      }
      return undefined
    },
  }}
/>
```

Display in UI:

```tsx
{
  typeof field.state.meta.errors[0] === 'object' && (
    <div className={`error ${field.state.meta.errors[0].severity}`}>
      {field.state.meta.errors[0].message}
      <small> (Code: {field.state.meta.errors[0].code})</small>
    </div>
  )
}
```

In the example above, the rendered message, code and styling depend on the event error you want to display.

#### Arrays

Multiple error messages for a single field:

```tsx
<form.Field
  name="password"
  validators={{
    onChange: ({ value }) => {
      const errors = []
      if (value.length < 8) errors.push('Password too short')
      if (!/[A-Z]/.test(value)) errors.push('Missing uppercase letter')
      if (!/[0-9]/.test(value)) errors.push('Missing number')

      return errors.length ? errors : undefined
    },
  }}
/>
```

Display in UI:

```tsx
{
  Array.isArray(field.state.meta.errors) && (
    <ul className="error-list">
      {field.state.meta.errors.map((err, i) => (
        <li key={i}>{err}</li>
      ))}
    </ul>
  )
}
```

### The `disableErrorFlat` Prop on Fields

By default, TanStack Form flattens errors from all validation sources (`onChange`, `onBlur`, `onSubmit`) into a single `errors` array. The `disableErrorFlat` prop preserves the error sources:

```tsx
<form.Field
  name="email"
  disableErrorFlat
  validators={{
    onChange: ({ value }) =>
      !value.includes('@') ? 'Invalid email format' : undefined,
    onBlur: ({ value }) =>
      !value.endsWith('.com') ? 'Only .com domains allowed' : undefined,
    onSubmit: ({ value }) => (value.length < 5 ? 'Email too short' : undefined),
  }}
/>
```

Without `disableErrorFlat`, all errors would be combined into `field.state.meta.errors`. With it, you can access errors by their source:

```tsx
{
  field.state.meta.errorMap.onChange && (
    <div className="real-time-error">{field.state.meta.errorMap.onChange}</div>
  )
}

{
  field.state.meta.errorMap.onBlur && (
    <div className="blur-feedback">{field.state.meta.errorMap.onBlur}</div>
  )
}

{
  field.state.meta.errorMap.onSubmit && (
    <div className="submit-error">{field.state.meta.errorMap.onSubmit}</div>
  )
}
```

This is useful for:

- Displaying different types of errors with different UI treatments
- Prioritizing errors (e.g., showing submission errors more prominently)
- Implementing progressive disclosure of errors

### Type Safety of `errors` and `errorMap`

TanStack Form provides strong type safety for error handling. Each key in the `errorMap` has exactly the type returned by its corresponding validator, while the `errors` array contains a union type of all the possible error values from all validators:

```tsx
<form.Field
  name="password"
  validators={{
    onChange: ({ value }) => {
      // This returns a string or undefined
      return value.length < 8 ? 'Too short' : undefined
    },
    onBlur: ({ value }) => {
      // This returns an object or undefined
      if (!/[A-Z]/.test(value)) {
        return { message: 'Missing uppercase', level: 'warning' }
      }
      return undefined
    },
  }}
  children={(field) => {
    // TypeScript knows that errors[0] can be string | { message: string, level: string } | undefined
    const error = field.state.meta.errors[0]

    // Type-safe error handling
    if (typeof error === 'string') {
      return <div className="string-error">{error}</div>
    } else if (error && typeof error === 'object') {
      return <div className={error.level}>{error.message}</div>
    }

    return null
  }}
/>
```

The `errorMap` property is also fully typed, matching the return types of your validation functions:

```tsx
// With disableErrorFlat
<form.Field
  name="email"
  disableErrorFlat
  validators={{
    onChange: ({ value }): string | undefined =>
      !value.includes("@") ? "Invalid email" : undefined,
    onBlur: ({ value }): { code: number, message: string } | undefined =>
      !value.endsWith(".com") ? { code: 100, message: "Wrong domain" } : undefined
  }}
  children={(field) => {
    // TypeScript knows the exact type of each error source
    const onChangeError: string | undefined = field.state.meta.errorMap.onChange;
    const onBlurError: { code: number, message: string } | undefined = field.state.meta.errorMap.onBlur;

    return (/* ... */);
  }}
/>
```

This type safety helps catch errors at compile time instead of runtime, making your code more reliable and maintainable.

<a id="source-form-docs-framework-react-guides-debugging-md"></a>

## Debugging

Source: `form:docs/framework/react/guides/debugging.md`.

Here's a list of common errors you might see in the console and how to fix them.

### Changing an uncontrolled input to be controlled

If you see this error in the console:

```
Warning: A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components
```

It's likely you forgot the `defaultValues` in your `useForm` Hook or `form.Field` component usage. This is occurring
because the input is being rendered before the form value is initialized and is therefore changing from `undefined` to `""` when a text input is made.

### Field value is of type `unknown`

If you're using `form.Field` and, upon inspecting the value of `field.state.value`, you see that the value of a field is of type `unknown`, it's likely that your form's type was too large for us to safely evaluate.

This typically is a sign that you should break down your form into smaller forms or use a more specific type for your form.

A workaround to this problem is to cast `field.state.value` using TypeScript's `as` keyword:

```tsx
const value = field.state.value as string
```

### `Type instantiation is excessively deep and possibly infinite`

If you see this error in the console when running `tsc`:

```
Type instantiation is excessively deep and possibly infinite
```

You've run into a bug that we didn't catch in our type definitions. While we've done our best to make sure our types are as accurate as possible, there are some edge cases where TypeScript struggled with the complexity of our types.

Please [report this issue to us on GitHub](https://github.com/TanStack/form/issues) so we can fix it. Just make sure to include a minimal reproduction so that we're able to help you debug.

> Keep in mind that this error is a TypeScript error and not a runtime error. This means that your code will still run on the user's machine as expected.

<a id="source-form-docs-framework-react-guides-devtools-md"></a>

## Devtools

Source: `form:docs/framework/react/guides/devtools.md`.

TanStack Form comes with a ready-to-go suite of devtools.

### Setup

Install the [TanStack Devtools](https://tanstack.com/devtools/latest/docs/quick-start) library and the [TanStack Form plugin](http://npmjs.com/package/@tanstack/react-form-devtools), from the framework adapter that you're working in (in this case `@tanstack/react-devtools` and `@tanstack/react-form-devtools`).

```bash
npm i @tanstack/react-devtools
npm i @tanstack/react-form-devtools
```

Next, in the root of your application, import the `TanStackDevtools`.

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />

    <TanStackDevtools />
  </StrictMode>,
)
```

Import the `formDevtoolsPlugin` from **TanStack Form** and provide it to the `TanStackDevtools` component.

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />

    <TanStackDevtools plugins={[formDevtoolsPlugin()]} />
  </StrictMode>,
)
```

Finally, add any additional configuration you desire to the `TanStackDevtools` component. More information can be found under the [TanStack Devtools Configuration](https://tanstack.com/devtools/) section.

A complete working example can be found in our [examples section](https://tanstack.com/form/latest/docs/framework/react/examples/devtools).

<a id="source-form-docs-framework-react-guides-dynamic-validation-md"></a>

## Dynamic Validation

Source: `form:docs/framework/react/guides/dynamic-validation.md`.

In many cases, you want to change the validation rules depending on the state of the form or other conditions. The most popular
example of this is when you want to validate a field differently based on whether the user has submitted the form for the first time or not.

We support this through our `onDynamic` validation function.

```tsx
import { revalidateLogic, useForm } from '@tanstack/react-form'

// ...

const form = useForm({
  defaultValues: {
    firstName: '',
    lastName: '',
  },
  // If this is omitted, `onDynamic` will not be called
  validationLogic: revalidateLogic(),
  validators: {
    onDynamic: ({ value }) => {
      if (!value.firstName) {
        return { firstName: 'A first name is required' }
      }
      return undefined
    },
  },
})
```

> [!IMPORTANT]
> By default, `onDynamic` is not called; therefore you must pass `revalidateLogic()` to the `validationLogic` option of `useForm`.

### Revalidation Options

`revalidateLogic` allows you to specify when validation should be run and to change the validation rules dynamically based on the current submission state of the form.

It takes two arguments:

- `mode`: The mode of validation prior to the first form submission. This can be one of the following:
  - `change`: Validate on every change.
  - `blur`: Validate on blur.
  - `submit`: Validate on submit. (**default**)

- `modeAfterSubmission`: The mode of validation after the form has been submitted. This can be one of the following:
  - `change`: Validate on every change. (**default**)
  - `blur`: Validate on blur.
  - `submit`: Validate on submit.

You can, for example, use the following to revalidate on blur after the first submission:

```tsx
const form = useForm({
  // ...
  validationLogic: revalidateLogic({
    mode: 'submit',
    modeAfterSubmission: 'blur',
  }),
  // ...
})
```

### Accessing Errors

Just as you might access errors from an `onChange` or `onBlur` validation, you can access errors from the `onDynamic` validation function using the `form.state.errorMap` object.

```tsx
function App() {
  const form = useForm({
    // ...
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: ({ value }) => {
        if (!value.firstName) {
          return { firstName: 'A first name is required' }
        }
        return undefined
      },
    },
  })

  return <p>{form.state.errorMap.onDynamic?.firstName}</p>
}
```

### Usage with Other Validation Logic

You can use `onDynamic` validation alongside other validation logic, such as `onChange` or `onBlur`.

```tsx
import { revalidateLogic, useForm } from '@tanstack/react-form'

function App() {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    validationLogic: revalidateLogic(),
    validators: {
      onChange: ({ value }) => {
        if (!value.firstName) {
          return { firstName: 'A first name is required' }
        }
        return undefined
      },
      onDynamic: ({ value }) => {
        if (!value.lastName) {
          return { lastName: 'A last name is required' }
        }
        return undefined
      },
    },
  })

  return (
    <div>
      <p>{form.state.errorMap.onChange?.firstName}</p>
      <p>{form.state.errorMap.onDynamic?.lastName}</p>
    </div>
  )
}
```

#### Usage with Fields

You can also use `onDynamic` validation with fields, just like you would with other validation logic.

```tsx
function App() {
  const form = useForm({
    defaultValues: {
      name: '',
      age: 0,
    },
    validationLogic: revalidateLogic(),
    onSubmit({ value }) {
      alert(JSON.stringify(value))
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name={'age'}
        validators={{
          onDynamic: ({ value }) =>
            value > 18 ? undefined : 'Age must be greater than 18',
        }}
        children={(field) => (
          <div>
            <input
              type="number"
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              value={field.state.value}
            />
            <p style={{ color: 'red' }}>
              {field.state.meta.errorMap.onDynamic}
            </p>
          </div>
        )}
      />
      <button type="submit">Submit</button>
    </form>
  )
}
```

#### Async Validation

Async validation can also be used with `onDynamicAsync` just like with other validation logic. You can even debounce the async validation to avoid excessive calls.

```tsx
const form = useForm({
  defaultValues: {
    username: '',
  },
  validationLogic: revalidateLogic(),
  validators: {
    onDynamicAsyncDebounceMs: 500, // Debounce the async validation by 500ms
    onDynamicAsync: async ({ value }) => {
      if (!value.username) {
        return { username: 'Username is required' }
      }
      // Simulate an async validation
      const isValid = await validateUsername(value.username)
      return isValid ? undefined : { username: 'Username is already taken' }
    },
  },
})
```

#### Standard Schema Validation

You can also use standard schema validation libraries like Valibot or Zod with `onDynamic` validation. This allows you to define complex validation rules that can change dynamically based on the form state.

```tsx
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1, 'A first name is required'),
  lastName: z.string().min(1, 'A last name is required'),
})

const form = useForm({
  defaultValues: {
    firstName: '',
    lastName: '',
  },
  validationLogic: revalidateLogic(),
  validators: {
    onDynamic: schema,
  },
})
```

<a id="source-form-docs-framework-react-guides-focus-management-md"></a>

## Focus Management

Source: `form:docs/framework/react/guides/focus-management.md`.

In some instances, you may want to focus the first input with an error.

[Because TanStack Form intentionally does not have insights into your markup](./foundations.md#source-form-docs-philosophy-md), we cannot add a built-in focus management feature.

However, you can easily add this feature into your application without this hypothetical built-in feature.

### React DOM

```tsx
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

export default function App() {
  const form = useForm({
    defaultValues: { age: 0 },
    validators: {
      onChange: z.object({
        age: z.number().min(12),
      }),
    },
    onSubmit() {
      alert('Submitted!')
    },
    onSubmitInvalid() {
      const InvalidInput = document.querySelector(
        '[aria-invalid="true"]',
      ) as HTMLInputElement

      InvalidInput?.focus()
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="age"
        children={(field) => (
          <label>
            Age
            <input
              name={field.name}
              value={field.state.value}
              aria-invalid={
                !field.state.meta.isValid && field.state.meta.isTouched
              }
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              type="number"
            />
          </label>
        )}
      />
      <div>
        <button type="submit">Submit</button>
      </div>
    </form>
  )
}
```

### React Native

Because React Native doesn't have access to the DOM's `querySelectorAll` API, we need to manually manage the element list
of the inputs. This allows us to focus the first input with an error:

```tsx
import { useRef } from 'react'
import { Text, View, TextInput, Button, Alert } from 'react-native'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

export default function App() {
  // This can be extracted to a hook that returns the `fields` ref, a `focusFirstField` function, and a `addField` function
  const fields = useRef([] as Array<{ input: TextInput; name: string }>)

  const form = useForm({
    defaultValues: { age: 0 },
    validators: {
      onChange: z.object({
        age: z.number().min(12),
      }),
    },
    onSubmit() {
      Alert.alert('Submitted!')
    },
    onSubmitInvalid({ formApi }) {
      const errorMap = formApi.state.errorMap.onChange
      const inputs = fields.current

      let firstInput
      for (const input of inputs) {
        if (!input || !input.input) continue
        if (!!errorMap[input.name]) {
          firstInput = input.input
          break
        }
      }
      firstInput?.focus()
    },
  })

  return (
    <View style={{ padding: 16 }}>
      <form.Field
        name="age"
        children={(field) => (
          <View style={{ marginVertical: 16 }}>
            <Text>Age</Text>
            <TextInput
              keyboardType="numeric"
              ref={(input) => {
                // fields.current needs to be manually incremented so that we know what fields are rendered or not and in what order
                fields.current[0] = { input, name: field.name }
              }}
              style={{
                borderWidth: 1,
                borderColor: '#999999',
                borderRadius: 4,
                marginTop: 8,
                padding: 8,
              }}
              onChangeText={(val) => field.handleChange(Number(val))}
              value={field.state.value}
            />
          </View>
        )}
      />
      <Button title="Submit" onPress={form.handleSubmit} />
    </View>
  )
}
```

<a id="source-form-docs-framework-react-guides-form-composition-md"></a>

## Form Composition

Source: `form:docs/framework/react/guides/form-composition.md`.

A common criticism of TanStack Form is that it is verbose out-of-the-box. While this verbosity _can_ be useful for educational purposes - helping to enforce understanding of our APIs - it's not ideal in production use cases.

As a result, while `form.Field` enables the most powerful and flexible usage of TanStack Form, we provide APIs that wrap it and make your application code less verbose.

### Custom Form Hooks

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

#### Pre-bound Field Components

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

##### A note on performance

While context is a valuable tool in the React ecosystem, there's appropriate concern from many users that providing a reactive value through a context will cause unnecessary re-renders.

> Unfamiliar with this performance concern? [Mark Erikson's blog post explaining why Redux solves many of these problems](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/) is a great place to start.

While this is a good concern to call out, it's not a problem for TanStack Form; the values provided through context are not reactive themselves, but instead are static class instances with reactive properties ([using TanStack Store as our signals implementation to power the show](https://tanstack.com/store)).

#### Pre-bound Form Components

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

#### Extending custom appForm

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

### Breaking big forms into smaller pieces

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

#### `withForm` FAQ

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

#### Context as a last resort

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

### Reusing groups of fields in multiple forms

Sometimes, a pair of fields are so closely related that it makes sense to group and reuse them — like the password example listed in the [linked fields guide](./framework-react.md#source-form-docs-framework-react-guides-linked-fields-md). Instead of repeating this logic across multiple forms, you can utilize the `withFieldGroup` higher-order component.

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
  render: function Render({ group, title }) {
    // access reactive values using the group store
    const password = useSelector(group.store, (state) => state.values.password)
    // or the form itself
    const isSubmitting = useSelector(
      group.form.store,
      (state) => state.isSubmitting,
    )

    return (
      <div>
        <h2>{title}</h2>
        {/* Groups also have access to Field, Subscribe, Field, AppField and AppForm */}
        <group.AppField name="password">
          {(field) => <field.TextField label="Password" />}
        </group.AppField>
        <group.AppField
          name="confirm_password"
          validators={{
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) => {
              // The form could be any values, so it is typed as 'unknown'
              const values: unknown = fieldApi.form.state.values
              // use the group methods instead
              if (value !== group.getFieldValue('password')) {
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
        </group.AppField>
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
  const form = useAppForm({
    defaultValues,
    // If the group didn't specify an `onSubmitMeta` property,
    // the form may implement any meta it wants.
    // Otherwise, the meta must be defined and match.
    onSubmitMeta: { action: '' },
  })

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
          field.state.value.map((account, i) => (
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

#### Mapping field group values to a different field

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
  const form = useAppForm({
    defaultValues,
  })

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

### Tree-shaking form and field components

While the above examples are great for getting started, they're not ideal for certain use-cases where you might have hundreds of form and field components.
In particular, you may not want to include all of your form and field components in the bundle of every file that uses your form hook.

To solve this, you can mix the `createFormHook` TanStack API with the React `lazy` and `Suspense` components:

```typescript
// src/hooks/form-context.ts
import { createFormHookContexts } from '@tanstack/react-form'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()
```

```tsx
// src/components/text-field.tsx
import { useFieldContext } from '../hooks/form-context.tsx'

export default function TextField({ label }: { label: string }) {
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

```tsx
// src/hooks/form.ts
import { lazy } from 'react'
import { createFormHook } from '@tanstack/react-form'

const TextField = lazy(() => import('../components/text-fields.tsx'))

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
  },
  formComponents: {},
})
```

```tsx
// src/App.tsx
import { Suspense } from 'react'
import { PeoplePage } from './features/people/form.tsx'

export default function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PeoplePage />
    </Suspense>
  )
}
```

This will show the Suspense fallback while the `TextField` component is being loaded, and then render the form once it's loaded.

### Putting it all together

Now that we've covered the basics of creating custom form hooks, let's put it all together in a single example.

```tsx
// /src/hooks/form.ts, to be used across the entire app
const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

function TextField({ label }: { label: string }) {
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

function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => <button disabled={isSubmitting}>{label}</button>}
    </form.Subscribe>
  )
}

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
  render: ({ form, title }) => {
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

// /src/features/people/page.ts
const Parent = () => {
  const form = useAppForm({
    ...formOpts,
  })

  return <ChildForm form={form} title={'Testing'} />
}
```

### API Usage Guidance

Here's a chart to help you decide what APIs you should be using:

![](./doc-assets/assets/react_form_composability.svg)

<a id="source-form-docs-framework-react-guides-form-groups-md"></a>

## Form Groups

Source: `form:docs/framework/react/guides/form-groups.md`.

When building a multi-stage form that has many stages, like so:

![Form stepper](./doc-assets/assets/stepper.png)

It's common for each step to have its own form. However, this complicates the form submission and validation process by requiring you to add complex logic.

Luckily, TanStack Form provides a way to build out sub-forms that make this kind of development trivial to implement: `<form.FormGroup>`.

### Usage

To use a form group in TanStack Form, you'll use `useForm` or [`useAppForm`](./framework-react-advanced.md#source-form-docs-framework-react-guides-form-composition-md) to create a `form` variable, then reference its `FormGroup` component like you would a `Field`:

```tsx
const form = useForm({
    defaultValues: {
        step1: {
            name: ""
        },
        step2: {
            age: 0
        }
    }
})

return (
    <form.FormGroup
        name="step1"
        children={group => (
            // `group` here has all of the form-like methods you'd expect like `deleteField` or `insertFieldValue`
            // ...
        )}
    />
)
```

This becomes much more useful when paired with external state to conditionally render a `FormGroup`:

```tsx
const [step, setStep] = useState(0)
const form = useForm({
    defaultValues: {
        step1: {
            name: ""
        },
        step2: {
            age: 0
        }
    }
})

return (
    <>
        {step === 0 ? <form.FormGroup
            name="step1"
            onGroupSubmit={() => {
                // We can move the step forward when validation passes
                setStep(step + 1)
            }}
            onGroupSubmitInvalid={() => {
                // Or handle invalid submissions, just like a top-level form
            }}
            onSubmitMeta={{} as SomeType}
            children={group => (
                // Use `group.handleSubmit()` to submit the sub-form, but not the parent form
                // ...
            )}
        /> : null }
        {step === 1 ? <form.FormGroup
            name="step2"
            children={group => (
                // Then, use `form.handleSubmit()` to submit the entire form
                // ...
            )}
        /> : null }
    </>
)
```

### Form Group Validation

Form groups have a distinct validation proceedure that we think makes sense for sub-forms:

- Form groups can have their own validation:

```tsx
<form.FormGroup
  name="step1"
  validators={{ onChange: () => 'Error' }}
  children={(group) => {
    group.state.meta.errorMap // {onChange: "Error" | undefined}
    group.state.meta.errors // ("Error")[]
  }}
/>
```

- Can set errors on sub-fields:

```tsx
<form.FormGroup
  name="step1"
  validators={{
    onChange: ({ value, groupApi }) => ({
      group: value.name === 'error' ? 'Group error' : undefined,
      fields: {
        // Must use the name of the field relative to the FormGroup as the error key,
        // to stay consistent with how standard schema works with form groups
        name: value.name === 'error' ? 'Field error' : undefined,
      },
    }),
  }}
/>
```

- And can even accept standard schemas:

```tsx
<form.FormGroup
  name="step1"
  validators={{
    onChange: z.object({
      name: z.string().min(2),
    }),
  }}
/>
```

> The reason we don't use the full path names for fields is so that you can compose your schemas like so:
>
> ```
> const step1Schema = z.object({
>     name: z.string().min(2)
> })
>
> const schema = z.object({
>     step1: step1Schema,
>     step2: step2Schema
> })
> ```
>
> And pass the `step1Schema` to a form group and `schema` to the parent form. That way, partially validated data will still flag errors if the group is bypassed.

#### Dynamic Group Validation

If you want to use [dynamic validation (`onDynamic`)](./framework-react-advanced.md#source-form-docs-framework-react-guides-dynamic-validation-md) with a form group, do not rely on the `onDynamic` validator passed to `useForm`:

```tsx
useForm({
  validationLogic: revalidateLogic(),
  validators: {
    // This validator will not run `onChange` when a sub-form is submitted;
    // it will only run `onChange` when the form itself is submitted.
    onDynamic: schema,
  },
})
```

Instead, pass your sub-schema for the group to the `onDynamic` validation of the `FormGroup` itself:

```tsx
<form.FormGroup validators={{ onDynamic: step1Schema }} />
```

It will treat `group.submissionAttempts` as the way to change what validator is ran before/after submit.

### Form Group State

Just like you're able to access `group.state.meta.errors`, you're also able to access the group's value using `group.state.value`. Likewise, here are some valuable properties you can access in the `group.state.meta`:

- `group.state.meta.isFieldsValid`: `true` when the field-level validators have no errors
- `group.state.meta.isGroupValid`: `true` when the group-level validators have no errors
- `group.state.meta.isValid`: `true` when both the field-level and group-level validators have no errors
- `group.state.meta.isSubmitting`: `true` when the group is in the process of being submitted

<a id="source-form-docs-framework-react-guides-react-native-md"></a>

## React Native

Source: `form:docs/framework/react/guides/react-native.md`.

TanStack Form is headless and it should support React Native out-of-the-box without needing any additional configuration.

Here is an example:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: (val) =>
      val < 13 ? 'You must be 13 to make an account' : undefined,
  }}
>
  {(field) => (
    <>
      <Text>Age:</Text>
      <TextInput value={field.state.value} onChangeText={field.handleChange} />
      {!field.state.meta.isValid && (
        <Text>{field.state.meta.errors.join(', ')}</Text>
      )}
    </>
  )}
</form.Field>
```

<a id="source-form-docs-framework-react-guides-ssr-md"></a>

## Ssr

Source: `form:docs/framework/react/guides/ssr.md`.

TanStack Form is compatible with React out of the box, supporting `SSR` and being framework-agnostic. However, specific configurations are necessary, according to your chosen framework.

Today we support the following meta-frameworks:

- [TanStack Start](https://tanstack.com/start/)
- [Next.js](https://nextjs.org/)
- [Remix](https://remix.run)

### Using TanStack Form in TanStack Start

This section focuses on integrating TanStack Form with TanStack Start.

#### TanStack Start Prerequisites

- Start a new `TanStack Start` project, following the steps in the [TanStack Start Quickstart Guide](https://tanstack.com/router/latest/docs/framework/react/guide/tanstack-start)
- Install `@tanstack/react-form`

#### Start integration

Let's start by creating a `formOption` that we'll use to share the form's shape across the client and server.

```typescript
// app/routes/index.tsx, but can be extracted to any other path
import { formOptions } from '@tanstack/react-form-start'

// You can pass other form options here
export const formOpts = formOptions({
  defaultValues: {
    firstName: '',
    age: 0,
  },
})
```

Next, we can create [a Start Server Function](https://tanstack.com/start/latest/docs/framework/react/server-functions) that will handle the form submission on the server.

```typescript
// app/routes/index.tsx, but can be extracted to any other path
import {
  createServerValidate,
  ServerValidateError,
} from '@tanstack/react-form-start'

const serverValidate = createServerValidate({
  ...formOpts,
  onServerValidate: ({ value }) => {
    if (value.age < 12) {
      return 'Server validation: You must be at least 12 to sign up'
    }
  },
})

export const handleForm = createServerFn({
  method: 'POST',
})
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }
    return data
  })
  .handler(async (ctx) => {
    try {
      const validatedData = await serverValidate(ctx.data)
      console.log('validatedData', validatedData)
      // Persist the form data to the database
      // await sql`
      //   INSERT INTO users (name, email, password)
      //   VALUES (${validatedData.name}, ${validatedData.email}, ${validatedData.password})
      // `
    } catch (e) {
      if (e instanceof ServerValidateError) {
        // Log form errors or do any other logic here
        return e.response
      }

      // Some other error occurred when parsing the form
      console.error(e)
      setResponseStatus(500)
      return 'There was an internal error'
    }

    return 'Form has validated successfully'
  })
```

Then we need to establish a way to grab the form data from `serverValidate`'s `response` using another server action:

```typescript
// app/routes/index.tsx, but can be extracted to any other path
import { getFormData } from '@tanstack/react-form-start'

export const getFormDataFromServer = createServerFn({ method: 'GET' }).handler(
  async () => {
    return getFormData()
  },
)
```

Finally, we'll use `getFormDataFromServer` in our loader to get the state from our server into our client and `handleForm` in our client-side form component.

```tsx
// app/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import {
  mergeForm,
  useForm,
  useSelector,
  useTransform,
} from '@tanstack/react-form-start'

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => ({
    state: await getFormDataFromServer(),
  }),
})

function Home() {
  const { state } = Route.useLoaderData()
  const form = useForm({
    ...formOpts,
    transform: useTransform((baseForm) => mergeForm(baseForm, state), [state]),
  })

  const formErrors = useSelector(form.store, (formState) => formState.errors)

  return (
    <form action={handleForm.url} method="post" encType={'multipart/form-data'}>
      {formErrors.map((error) => (
        <p key={error as string}>{error}</p>
      ))}

      <form.Field
        name="age"
        validators={{
          onChange: ({ value }) =>
            value < 8 ? 'Client validation: You must be at least 8' : undefined,
        }}
      >
        {(field) => {
          return (
            <div>
              <input
                name={field.name}
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error as string}>{error}</p>
              ))}
            </div>
          )
        }}
      </form.Field>
      <form.Subscribe
        selector={(formState) => [formState.canSubmit, formState.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? '...' : 'Submit'}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
```

### Using TanStack Form in a Next.js App Router

> Before reading this section, it's suggested you understand how React Server Components and React Server Actions work. [Check out this blog series for more information](https://playfulprogramming.com/collections/react-beyond-the-render)

This section focuses on integrating TanStack Form with `Next.js`, particularly using the `App Router` and `Server Actions`.

#### Next.js Prerequisites

- Start a new `Next.js` project, following the steps in the [Next.js Documentation](https://nextjs.org/docs/getting-started/installation). Ensure you select `yes` for `Would you like to use App Router?` during the setup to access all new features provided by Next.js.
- Install `@tanstack/react-form`
- Install any [form validator](./framework-react.md#source-form-docs-framework-react-guides-validation-md) of your choice. [Optional]

### App Router integration

Let's start by creating a `formOption` that we'll use to share the form's shape across the client and server.

```typescript
// shared-code.ts
// Notice the import path is different from the client
import { formOptions } from '@tanstack/react-form-nextjs'

// You can pass other form options here
export const formOpts = formOptions({
  defaultValues: {
    firstName: '',
    age: 0,
  },
})
```

Next, we can create [a React Server Action](https://playfulprogramming.com/posts/what-are-react-server-components) that will handle the form submission on the server.

```typescript
// action.ts
'use server'

// Notice the import path is different from the client
import {
  ServerValidateError,
  createServerValidate,
} from '@tanstack/react-form-nextjs'
import { formOpts } from './shared-code'

// Create the server action that will infer the types of the form from `formOpts`
const serverValidate = createServerValidate({
  ...formOpts,
  onServerValidate: ({ value }) => {
    if (value.age < 12) {
      return 'Server validation: You must be at least 12 to sign up'
    }
  },
})

export default async function someAction(prev: unknown, formData: FormData) {
  try {
    const validatedData = await serverValidate(formData)
    console.log('validatedData', validatedData)
    // Persist the form data to the database
    // await sql`
    //   INSERT INTO users (name, email, password)
    //   VALUES (${validatedData.name}, ${validatedData.email}, ${validatedData.password})
    // `
  } catch (e) {
    if (e instanceof ServerValidateError) {
      return e.formState
    }

    // Some other error occurred while validating your form
    throw e
  }

  // Your form has successfully validated!
}
```

Finally, we'll use `someAction` in our client-side form component.

```tsx
// client-component.tsx
'use client'

import { useActionState } from 'react'
import {
  initialFormState,
  mergeForm,
  useForm,
  useSelector,
  useTransform,
} from '@tanstack/react-form-nextjs'
import someAction from './action'
import { formOpts } from './shared-code'

export const ClientComp = () => {
  const [state, action] = useActionState(someAction, initialFormState)

  const form = useForm({
    ...formOpts,
    transform: useTransform((baseForm) => mergeForm(baseForm, state!), [state]),
  })

  const formErrors = useSelector(form.store, (formState) => formState.errors)

  return (
    <form action={action as never} onSubmit={() => form.handleSubmit()}>
      {formErrors.map((error) => (
        <p key={error as string}>{error}</p>
      ))}

      <form.Field
        name="age"
        validators={{
          onChange: ({ value }) =>
            value < 8 ? 'Client validation: You must be at least 8' : undefined,
        }}
      >
        {(field) => {
          return (
            <div>
              <input
                name={field.name} // must explicitly set the name attribute for the POST request
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error as string}>{error}</p>
              ))}
            </div>
          )
        }}
      </form.Field>
      <form.Subscribe
        selector={(formState) => [formState.canSubmit, formState.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? '...' : 'Submit'}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
```

Here, we're using [React's `useActionState` hook](https://playfulprogramming.com/posts/what-is-use-action-state-and-form-status) and TanStack Form's `useTransform` hook to merge state returned from the server action with the form state.

> If you get the following error in your Next.js application:
>
> ```typescript
> x You're importing a component that needs `useState`. This React hook only works in a client component. To fix, mark the file (or its parent) with the `"use client"` directive.
> ```
>
> This is because you're not importing server-side code from `@tanstack/react-form-nextjs`. Ensure you're importing the correct module based on the environment.
>
> [This is a limitation of Next.js](https://github.com/phryneas/rehackt). Other meta-frameworks will likely not have this same problem.

### Using TanStack Form in Remix

> Before reading this section, it's suggested you understand how Remix actions work. [Check out Remix's docs for more information](https://remix.run/docs/en/main/discussion/data-flow#route-action)

#### Remix Prerequisites

- Start a new `Remix` project, following the steps in the [Remix Documentation](https://remix.run/docs/en/main/start/quickstart).
- Install `@tanstack/react-form`
- Install any [form validator](./framework-react.md#source-form-docs-framework-react-guides-validation-md) of your choice. [Optional]

### Remix integration

Let's start by creating a `formOption` that we'll use to share the form's shape across the client and server.

```typescript
// routes/_index/route.tsx
import { formOptions } from '@tanstack/react-form-remix'

// You can pass other form options here
export const formOpts = formOptions({
  defaultValues: {
    firstName: '',
    age: 0,
  },
})
```

Next, we can create [an action](https://remix.run/docs/en/main/discussion/data-flow#route-action) that will handle the form submission on the server.

```tsx
// routes/_index/route.tsx

import {
  ServerValidateError,
  createServerValidate,
  formOptions,
} from '@tanstack/react-form-remix'

import type { ActionFunctionArgs } from '@remix-run/node'

// export const formOpts = formOptions({

// Create the server action that will infer the types of the form from `formOpts`
const serverValidate = createServerValidate({
  ...formOpts,
  onServerValidate: ({ value }) => {
    if (value.age < 12) {
      return 'Server validation: You must be at least 12 to sign up'
    }
  },
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  try {
    const validatedData = await serverValidate(formData)
    console.log('validatedData', validatedData)
    // Persist the form data to the database
    // await sql`
    //   INSERT INTO users (name, email, password)
    //   VALUES (${validatedData.name}, ${validatedData.email}, ${validatedData.password})
    // `
  } catch (e) {
    if (e instanceof ServerValidateError) {
      return e.formState
    }

    // Some other error occurred while validating your form
    throw e
  }

  // Your form has successfully validated!
}
```

Finally, the `action` will be called when the form submits.

```tsx
// routes/_index/route.tsx
import {
  Form,
  mergeForm,
  useActionData,
  useForm,
  useSelector,
  useTransform,
} from '@tanstack/react-form'
import {
  ServerValidateError,
  createServerValidate,
  formOptions,
  initialFormState,
} from '@tanstack/react-form-remix'

import type { ActionFunctionArgs } from '@remix-run/node'

// export const formOpts = formOptions({

// const serverValidate = createServerValidate({

// export async function action({request}: ActionFunctionArgs) {

export default function Index() {
  const actionData = useActionData<typeof action>()

  const form = useForm({
    ...formOpts,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, actionData ?? initialFormState),
      [actionData],
    ),
  })

  const formErrors = useSelector(form.store, (formState) => formState.errors)

  return (
    <Form method="post" onSubmit={() => form.handleSubmit()}>
      {formErrors.map((error) => (
        <p key={error as string}>{error}</p>
      ))}

      <form.Field
        name="age"
        validators={{
          onChange: ({ value }) =>
            value < 8 ? 'Client validation: You must be at least 8' : undefined,
        }}
      >
        {(field) => {
          return (
            <div>
              <input
                name="age"
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error as string}>{error}</p>
              ))}
            </div>
          )
        }}
      </form.Field>
      <form.Subscribe
        selector={(formState) => [formState.canSubmit, formState.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? '...' : 'Submit'}
          </button>
        )}
      </form.Subscribe>
    </Form>
  )
}
```

Here, we're using [Remix's `useActionData` hook](https://remix.run/docs/en/main/hooks/use-action-data) and TanStack Form's `useTransform` hook to merge state returned from the server action with the form state.

<a id="source-form-docs-framework-react-guides-ui-libraries-md"></a>

## Ui Libraries

Source: `form:docs/framework/react/guides/ui-libraries.md`.

### Usage of TanStack Form with UI Libraries

TanStack Form is a headless library, offering you complete flexibility to style it as you see fit. It's compatible with a wide range of UI libraries, including `Chakra UI`, `Tailwind`, `Material UI`, `Mantine`, `shadcn/ui`, or even plain CSS.

This guide focuses on `Chakra UI`, `Material UI`, `Mantine`, and `shadcn/ui`, but the concepts are applicable to any UI library of your choice.

#### Prerequisites

Before integrating TanStack Form with a UI library, ensure the necessary dependencies are installed in your project:

- For `Chakra UI`, follow the installation instructions on their [official site](https://chakra-ui.com/docs/get-started/installation)
- For `Material UI`, follow the installation instructions on their [official site](https://mui.com/material-ui/getting-started/).
- For `Mantine`, refer to their [documentation](https://mantine.dev/).
- For `shadcn/ui`, refer to their [official site](https://ui.shadcn.com/).

Note: While you can mix and match libraries, it's generally advisable to stick with one to maintain consistency and minimize bloat.

#### Example with Mantine

Here's an example demonstrating the integration of TanStack Form with Mantine components:

```tsx
import { TextInput, Checkbox } from '@mantine/core'
import { useForm } from '@tanstack/react-form'

export default function App() {
  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      name: '',
      isChecked: false,
    },
    onSubmit: async ({ value }) => {
      // Handle form submission
      console.log(value)
    },
  })

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <Field
          name="name"
          children={({ state, handleChange, handleBlur }) => (
            <TextInput
              defaultValue={state.value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="Enter your name"
            />
          )}
        />
        <Field
          name="isChecked"
          children={({ state, handleChange, handleBlur }) => (
            <Checkbox
              onChange={(e) => handleChange(e.target.checked)}
              onBlur={handleBlur}
              checked={state.value}
            />
          )}
        />
      </form>
      <div>
        <pre>{JSON.stringify(state.values, null, 2)}</pre>
      </div>
    </>
  )
}
```

- Initially, we utilize the `useForm` hook from TanStack and destructure the necessary properties. This step is optional; alternatively, you could use `const form = useForm()` if preferred. TypeScript's type inference ensures a smooth experience regardless of the approach.
- The `Field` component, derived from `useForm`, accepts several properties, such as `validators`. For this demonstration, we focus on two primary properties: `name` and `children`.
  - The `name` property identifies each `Field`, for instance, `name` in our example.
  - The `children` property leverages the concept of render props, allowing us to integrate components without unnecessary abstractions.
- TanStack's design relies heavily on render props, providing access to `children` within the `Field` component. This approach is entirely type-safe. When integrating with Mantine components, such as `TextInput`, we selectively destructure properties like `state.value`, `handleChange`, and `handleBlur`. This selective approach is due to the slight differences in types between `TextInput` and the `field` we get in the children.
- By following these steps, you can seamlessly integrate Mantine components with TanStack Form.
- This methodology is equally applicable to other components, such as `Checkbox`, ensuring consistent integration across different UI elements.

#### Usage with Material UI

The process for integrating Material UI components is similar. Here's an example using TextField and Checkbox from Material UI:

```tsx
<Field
  name="name"
  children={({ state, handleChange, handleBlur }) => {
    return (
      <TextField
        id="filled-basic"
        label="Filled"
        variant="filled"
        defaultValue={state.value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="Enter your name"
      />
    );
  }}
/>

<Field
  name="isMuiCheckBox"
  children={({ state, handleChange, handleBlur }) => {
    return (
      <MuiCheckbox
        onChange={(e) => handleChange(e.target.checked)}
        onBlur={handleBlur}
        checked={state.value}
      />
    );
  }}
/>

```

- The integration approach is the same as with Mantine.
- The primary difference lies in the specific Material UI component properties and styling options.

#### Usage with shadcn/ui

The process for integrating shadcn/ui components is similar. Here's an example using Input and Checkbox from shadcn/ui:

```tsx
<Field
  name="name"
  children={({ state, handleChange, handleBlur }) => (
    <Input
      value={state.value}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      placeholder="Enter your name"
    />
  )}
/>
<Field
  name="isChecked"
  children={({ state, handleChange, handleBlur }) => (
    <Checkbox
      onCheckedChange={(checked) => handleChange(checked === true)}
      onBlur={handleBlur}
      checked={state.value}
    />
  )}
/>
```

- The integration approach is the same as with Mantine, Material UI.
- The primary difference lies in the specific shadcn/ui component properties and styling options.
- Note the onCheckedChange property of Checkbox instead of onChange.

The ShadCN library includes a dedicated guide covering common scenarios for integrating TanStack Form with its components: [https://ui.shadcn.com/docs/forms/tanstack-form](https://ui.shadcn.com/docs/forms/tanstack-form)

#### Usage with Chakra UI

The process for integrating Chakra UI components is similar. Here's an example using Input and Checkbox from Chakra UI:

```tsx
<Field
  name="name"
  children={({ state, handleChange, handleBlur }) => (
    <Input
      value={state.value}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      placeholder="Enter your name"
    />
  )}
/>
<Field
  name="isChecked"
  children={({ state, handleChange, handleBlur }) => (
    <Checkbox.Root
      checked={state.value}
      onCheckedChange={(details) => handleChange(!!details.checked)}
      onBlur={handleBlur}
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>Accept terms</Checkbox.Label>
    </Checkbox.Root>
  )}
/>
```

- The integration approach is the same as with Mantine, Material UI, and shadcn/ui.
- Chakra UI exposes its Checkbox as a composable component with separate `Checkbox.Root`, `Checkbox.Control`, `Checkbox.Label`, and `Checkbox.HiddenInput` parts that you wire together.
- The double negation `!!` is used on `onCheckedChange` to coerce Chakra's `"indeterminate"` state to a boolean, ensuring it matches the form state. See the [Chakra UI Checkbox documentation](https://chakra-ui.com/docs/components/checkbox#indeterminate) for more details.
- Alternatively, Chakra UI offers a pre-composed Checkbox component that works the same way as their standard examples, without requiring manual composition. You can learn more about this closed component approach in the [Chakra UI Checkbox documentation](https://chakra-ui.com/docs/components/checkbox#closed-component).
- The TanStack Form integration works identically with either approach—simply attach the `checked`, `onCheckedChange`, and `onBlur` handlers to your chosen component.

Example using the closed Checkbox component:

```tsx
<Field
  name="isChecked"
  children={({ state, handleChange, handleBlur }) => (
    <Checkbox
      checked={state.value}
      onCheckedChange={(details) => handleChange(!!details.checked)}
      onBlur={handleBlur}
    >
      Accept terms
    </Checkbox>
  )}
/>
```
