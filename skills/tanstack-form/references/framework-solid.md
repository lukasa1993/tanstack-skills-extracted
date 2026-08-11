# Solid adapter

Solid-specific setup and behavior.

<a id="source-form-docs-framework-solid-guides-arrays-md"></a>

## Arrays

Source: `form:docs/framework/solid/guides/arrays.md`.

TanStack Form supports arrays as values in a form, including sub-object values inside of an array.

### Basic Usage

To use an array, you can use `field.state.value` on an array value in conjunction
with [`Index` from `solid-js`](https://www.solidjs.com/tutorial/flow_index):

```jsx
function App() {
  const form = createForm(() => ({
    defaultValues: {
      people: [],
    },
  }))

  return (
    <form.Field name="people" mode="array">
      {(field) => (
        <Show when={field().state.value.length > 0}>
          {/* Do not change this to `For` or things will not work as-expected */}
          <Index each={field().state.value}>
            {
              (_, i) => null // ...
            }
          </Index>
        </Show>
      )}
    </form.Field>
  )
}
```

> You must use `Index` from `solid-js` and not `For` because `For` will cause the inner components to be re-rendered
> every time the array changes.
>
> This causes the field to lose its value and therefore delete the subfield's value.

This will generate the mapped JSX every time you run `pushValue` on `field`:

```jsx
<button onClick={() => field().pushValue({ name: '', age: 0 })} type="button">
  Add person
</button>
```

Finally, you can use a subfield like so:

```jsx
<form.Field name={`people[${i}].name`}>
  {(subField) => (
    <input
      value={subField().state.value}
      onInput={(e) => {
        subField().handleChange(e.currentTarget.value)
      }}
    />
  )}
</form.Field>
```

### Full Example

```jsx
function App() {
  const form = createForm(() => ({
    defaultValues: {
      people: [],
    },
    onSubmit: ({ value }) => alert(JSON.stringify(value)),
  }))

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field name="people" mode="array">
          {(field) => (
            <div>
              <Show when={field().state.value.length > 0}>
                {/* Do not change this to For or the test will fail */}
                <Index each={field().state.value}>
                  {(_, i) => (
                    <form.Field name={`people[${i}].name`}>
                      {(subField) => (
                        <div>
                          <label>
                            <div>Name for person {i}</div>
                            <input
                              value={subField().state.value}
                              onInput={(e) => {
                                subField().handleChange(e.currentTarget.value)
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </form.Field>
                  )}
                </Index>
              </Show>

              <button
                onClick={() => field().pushValue({ name: '', age: 0 })}
                type="button"
              >
                Add person
              </button>
            </div>
          )}
        </form.Field>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
```

<a id="source-form-docs-framework-solid-guides-async-initial-values-md"></a>

## Async Initial Values

Source: `form:docs/framework/solid/guides/async-initial-values.md`.

Let's say that you want to fetch some data from an API and use it as the initial value of a form.

While this problem sounds simple on the surface, there are hidden complexities you might not have thought of thus far.

For example, you might want to show a loading spinner while the data is being fetched, or you might want to handle errors gracefully.
Likewise, you could also find yourself looking for a way to cache the data so that you don't have to fetch it every time the form is rendered.

While we could implement many of these features from scratch, it would end up looking a lot like another project we maintain: [TanStack Query](https://tanstack.com/query).

As such, this guide shows you how you can mix-n-match TanStack Form with TanStack Query to achieve the desired behavior.

### Basic Usage

```tsx
import { createForm } from '@tanstack/solid-form'
import { createQuery } from '@tanstack/solid-query'
import { Show } from 'solid-js'

export default function App() {
  const query = createQuery(() => ({
    queryKey: ['data'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { firstName: 'FirstName', lastName: 'LastName' }
    },
  }))

  const form = createForm(() => ({
    defaultValues: {
      firstName: query.data?.firstName ?? '',
      lastName: query.data?.lastName ?? '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  }))

  return (
    <Show when={!query.isLoading} fallback={<p>Loading..</p>}>
      <></>
    </Show>
  )
}
```

This will show a loading spinner until the data is fetched, and then it will render the form with the fetched data as the initial values.

<a id="source-form-docs-framework-solid-guides-basic-concepts-md"></a>

## Basic Concepts

Source: `form:docs/framework/solid/guides/basic-concepts.md`.

This page introduces the basic concepts and terminology used in the `@tanstack/solid-form` library. Familiarizing yourself with these concepts will help you better understand and work with the library.

### Form Options

You can create options for your form so that it can be shared between multiple forms by using the `formOptions` function.

Example:

```tsx
const formOpts = formOptions({
  defaultValues: {
    firstName: '',
    lastName: '',
    hobbies: [],
  } as Person,
})
```

### Form Instance

A Form Instance is an object that represents an individual form and provides methods and properties for working with the form. You create a form instance using the `createForm` hook provided by the form options. The hook accepts an object with an `onSubmit` function, which is called when the form is submitted.

```tsx
const form = createForm(() => ({
  ...formOpts,
  onSubmit: async ({ value }) => {
    // Do something with form data
    console.log(value)
  },
}))
```

You may also create a form instance without using `formOptions` by using the standalone `createForm` API:

```tsx
const form = createForm<Person>(() => ({
  onSubmit: async ({ value }) => {
    // Do something with form data
    console.log(value)
  },
  defaultValues: {
    firstName: '',
    lastName: '',
    hobbies: [],
  },
}))
```

### Field

A Field represents a single form input element, such as a text input or a checkbox. Fields are created using the `form.Field` component provided by the form instance. The component accepts a name prop, which should match a key in the form's default values. It also accepts a children prop, which is a render prop function that takes a field object as its argument.

Example:

```tsx
<form.Field
  name="firstName"
  children={(field) => (
    <input
      name={field().name}
      value={field().state.value}
      onBlur={field().handleBlur}
      onInput={(e) => field().handleChange(e.target.value)}
    />
  )}
/>
```

### Field State

Each field has its own state, which includes its current value, validation status, error messages, and other metadata. You can access a field's state using the `field().state` property.

Example:

```ts
const {
  value,
  meta: { errors, isValidating },
} = field().state
```

There are four states in the metadata that can be useful to see how the user interacts with a field:

- _"isTouched"_, after the user changes the field or blurs the field
- _"isDirty"_, after the field's value has been changed, even if it's been reverted to the default. Opposite of `isPristine`
- _"isPristine"_, until the user changes the field value. Opposite of `isDirty`
- _"isBlurred"_, after the field has been blurred

```ts
const { isTouched, isDirty, isPristine, isBlurred } = field().state.meta
```

![Field states](./doc-assets/assets/field-states.png)

### Understanding 'isDirty' in Different Libraries

Non-Persistent `dirty` state

- **Libraries**: React Hook Form (RHF), Formik, Final Form.
- **Behavior**: A field is 'dirty' if its value differs from the default. Reverting to the default value makes it 'clean' again.

Persistent `dirty` state

- **Libraries**: Angular Form, Vue FormKit.
- **Behavior**: A field remains 'dirty' once changed, even if reverted to the default value.

We have chosen the persistent 'dirty' state model. To also support a non-persistent 'dirty' state, we introduce an additional flag:

- _"isDefaultValue"_, whether the field's current value is the default value

```ts
const { isDefaultValue, isTouched } = field().state.meta

// The following line will re-create the non-Persistent `dirty` functionality.
const nonPersistentIsDirty = !isDefaultValue
```

![Field states extended](./doc-assets/assets/field-states-extended.png)

### Field API

The Field API is an object passed to the render prop function when creating a field. It provides methods for working with the field's state.

Example:

```tsx
<input
  name={field().name}
  value={field().state.value}
  onBlur={field().handleBlur}
  onInput={(e) => field().handleChange(e.target.value)}
/>
```

### Validation

`@tanstack/solid-form` provides both synchronous and asynchronous validation out of the box. Validation functions can be passed to the `form.Field` component using the `validators` prop.

Example:

```tsx
<form.Field
  name="firstName"
  validators={{
    onChange: ({ value }) =>
      !value
        ? 'A first name is required'
        : value.length < 3
          ? 'First name must be at least 3 characters'
          : undefined,
    onChangeAsync: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return value.includes('error') && 'No "error" allowed in first name'
    },
  }}
  children={(field) => (
    <>
      <input
        name={field().name}
        value={field().state.value}
        onBlur={field().handleBlur}
        onInput={(e) => field().handleChange(e.target.value)}
      />
      <p>{field().state.meta.errors[0]}</p>
    </>
  )}
/>
```

### Validation with Standard Schema Libraries

In addition to hand-rolled validation options, we also support the [Standard Schema](https://github.com/standard-schema/standard-schema) specification.

You can define a schema using any of the libraries implementing the specification and pass it to a form or field validator.

Supported libraries include:

- [Zod](https://zod.dev/) (v3.24.0 or higher)
- [Valibot](https://valibot.dev/) (v1.0.0 or higher)
- [ArkType](https://arktype.io/) (v2.1.20 or higher)
- [Yup](https://github.com/jquense/yup) (v1.7.0 or higher)

```tsx
import { z } from 'zod'

// ...
;<form.Field
  name="firstName"
  validators={{
    onChange: z.string().min(3, 'First name must be at least 3 characters'),
    onChangeAsyncDebounceMs: 500,
    onChangeAsync: z.string().refine(
      async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return !value.includes('error')
      },
      {
        message: 'No "error" allowed in first name',
      },
    ),
  }}
  children={(field) => (
    <>
      <input
        name={field().name}
        value={field().state.value}
        onBlur={field().handleBlur}
        onInput={(e) => field().handleChange(e.target.value)}
      />
      <p>{field().state.meta.errors[0]}</p>
    </>
  )}
/>
```

### Reactivity

`@tanstack/solid-form` offers various ways to subscribe to form and field state changes, most notably the `form.useSelector` hook and the `form.Subscribe` component. These methods allow you to optimize your form's rendering performance by only updating components when necessary.

Example:

```tsx
const firstName = form.useSelector((state) => state.values.firstName)
//...
<form.Subscribe
  selector={(state) => ({
    canSubmit: state.canSubmit,
    isSubmitting: state.isSubmitting,
  })}
  children={(state) => (
    <button type="submit" disabled={!state().canSubmit}>
      {state().isSubmitting ? '...' : 'Submit'}
    </button>
  )}
/>
```

### Array Fields

Array fields allow you to manage a list of values within a form, such as a list of hobbies. You can create an array field using the `form.Field` component with the `mode="array"` prop.

When working with array fields, you can use the fields `pushValue`, `removeValue`, `swapValues` and `moveValue` methods to add, remove, swap, and move a value from one index to another within the array, respectively. Additional helper methods such as `insertValue`, `replaceValue`, and `clearValues` are also available for inserting, replacing, and clearing array values.

Example:

```tsx
<form.Field
  name="hobbies"
  mode="array"
  children={(hobbiesField) => (
    <div>
      Hobbies
      <div>
        <Show
          when={hobbiesField().state.value.length > 0}
          fallback={'No hobbies found.'}
        >
          <Index each={hobbiesField().state.value}>
            {(_, i) => (
              <div>
                <form.Field
                  name={`hobbies[${i}].name`}
                  children={(field) => (
                    <div>
                      <label for={field().name}>Name:</label>
                      <input
                        id={field().name}
                        name={field().name}
                        value={field().state.value}
                        onBlur={field().handleBlur}
                        onInput={(e) => field().handleChange(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => hobbiesField().removeValue(i)}
                      >
                        X
                      </button>
                    </div>
                  )}
                />
                <form.Field
                  name={`hobbies[${i}].description`}
                  children={(field) => {
                    return (
                      <div>
                        <label for={field().name}>Description:</label>
                        <input
                          id={field().name}
                          name={field().name}
                          value={field().state.value}
                          onBlur={field().handleBlur}
                          onInput={(e) => field().handleChange(e.target.value)}
                        />
                      </div>
                    )
                  }}
                />
              </div>
            )}
          </Index>
        </Show>
      </div>
      <button
        type="button"
        onClick={() =>
          hobbiesField().pushValue({
            name: '',
            description: '',
            yearsOfExperience: 0,
          })
        }
      >
        Add hobby
      </button>
    </div>
  )}
/>
```

These are the basic concepts and terminology used in the `@tanstack/solid-form` library. Understanding these concepts will help you work more effectively with the library and create complex forms with ease.

<a id="source-form-docs-framework-solid-guides-devtools-md"></a>

## Devtools

Source: `form:docs/framework/solid/guides/devtools.md`.

TanStack Form comes with a ready to go suit of devtools.

### Setup

Install the [TanStack Devtools](https://tanstack.com/devtools/latest/docs/quick-start) library and the [TanStack Form plugin](http://npmjs.com/package/@tanstack/solid-form-devtools), from the framework adapter that your working in (in this case `@tanstack/solid-devtools`, and `@tanstack/solid-form-devtools`).

```bash
npm i @tanstack/solid-devtools
npm i @tanstack/solid-form-devtools
```

Next in the root of your application import the `TanStackDevtools`.

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'

import App from './App'

render(
  () => (
    <>
      <App />

      <TanStackDevtools />
    </>
  ),
  root!,
)
```

Import the `formDevtoolsPlugin` from **TanStack Form** and provide it to the `TanStackDevtools` component.

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { formDevtoolsPlugin } from '@tanstack/solid-form-devtools'

import App from './app'

const root = document.getElementById('root')

render(
  () => (
    <>
      <App />

      <TanStackDevtools plugins={[formDevtoolsPlugin()]} />
    </>
  ),
  root!,
)
```

Finally add any additional configuration you desire to the `TanStackDevtools` component, more information can be found under the [TanStack Devtools Configuration](https://tanstack.com/devtools/) section.

A complete working example can be found in our [examples section](https://tanstack.com/form/latest/docs/framework/solid/examples/devtools).

<a id="source-form-docs-framework-solid-guides-dynamic-validation-md"></a>

## Dynamic Validation

Source: `form:docs/framework/solid/guides/dynamic-validation.md`.

In many cases, you want to change the validation rules based depending on the state of the form or other conditions. The most popular
example of this is when you want to validate a field differently based on whether the user has submitted the form for the first time or not.

We support this through our `onDynamic` validation function.

```tsx
import { revalidateLogic, createForm } from '@tanstack/solid-form'

// ...

const form = createForm(() => ({
  defaultValues: {
    firstName: '',
    lastName: '',
  },
  // If this is omitted, onDynamic will not be called
  validationLogic: revalidateLogic(),
  validators: {
    onDynamic: ({ value }) => {
      if (!value.firstName) {
        return { firstName: 'A first name is required' }
      }
      return undefined
    },
  },
}))
```

> By default `onDynamic` is not called, so you need to pass `revalidateLogic()` to the `validationLogic` option of `createForm`.

### Revalidation Options

`revalidateLogic` allows you to specify when validation should be run and change the validation rules dynamically based on the current submission state of the form.

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
const form = createForm(() => ({
  // ...
  validationLogic: revalidateLogic({
    mode: 'submit',
    modeAfterSubmission: 'blur',
  }),
  // ...
}))
```

### Accessing Errors

Just as you might access errors from an `onChange` or `onBlur` validation, you can access the errors from the `onDynamic` validation function using the `form.state.errorMap` object.

```tsx
function App() {
  const form = createForm(() => ({
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
  }))

  return <p>{form.state.errorMap.onDynamic?.firstName}</p>
}
```

### Usage with Other Validation Logic

You can use `onDynamic` validation alongside other validation logic, such as `onChange` or `onBlur`.

```tsx
import { revalidateLogic, createForm } from '@tanstack/solid-form'

function App() {
  const form = createForm(() => ({
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
  }))

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
  const form = createForm(() => ({
    defaultValues: {
      name: '',
      age: 0,
    },
    validationLogic: revalidateLogic(),
    onSubmit({ value }) {
      alert(JSON.stringify(value))
    },
  }))

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
              onInput={(e) => field().handleChange(e.target.valueAsNumber)}
              onBlur={field().handleBlur}
              value={field().state.value}
            />
            <p style={{ color: 'red' }}>
              {field().state.meta.errorMap.onDynamic}
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

Async validation can also be used with `onDynamic` just like with other validation logic. You can even debounce the async validation to avoid excessive calls.

```tsx
const form = createForm(() => ({
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
}))
```

#### Standard Schema Validation

You can also use standard schema validation libraries like Valibot or Zod with `onDynamic` validation. This allows you to define complex validation rules that can change dynamically based on the form state.

```tsx
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1, 'A first name is required'),
  lastName: z.string().min(1, 'A last name is required'),
})

const form = createForm(() => ({
  defaultValues: {
    firstName: '',
    lastName: '',
  },
  validationLogic: revalidateLogic(),
  validators: {
    onDynamic: schema,
  },
}))
```

<a id="source-form-docs-framework-solid-guides-form-composition-md"></a>

## Form Composition

Source: `form:docs/framework/solid/guides/form-composition.md`.

A common criticism of TanStack Form is its verbosity out-of-the-box. While this _can_ be useful for educational purposes - helping enforce understanding our APIs - it's not ideal in production use cases.

As a result, while `form.Field` enables the most powerful and flexible usage of TanStack Form, we provide APIs that wrap it and make your application code less verbose.

### Custom Form Hooks

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

#### Pre-bound Field Components

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

#### Pre-bound Form Components

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

### Breaking big forms into smaller pieces

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

#### `withForm` FAQ

> Why a higher-order component instead of a hook?
>
> While hooks are the future of Solid, higher-order components are still a powerful tool for composition. In particular, the API of `withForm` enables us to have strong type-safety without requiring users to pass generics.

### Reusing groups of fields in multiple forms

Sometimes, a pair of fields are so closely related that it makes sense to group and reuse them — like the password example listed in the [linked fields guide](./framework-solid.md#source-form-docs-framework-solid-guides-linked-fields-md). Instead of repeating this logic across multiple forms, you can utilize the `withFieldGroup` higher-order component.

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

### Tree-shaking form and field components

While the above examples are great for getting started, they're not ideal for certain use-cases where you might have hundreds of form and field components.
In particular, you may not want to include all of your form and field components in the bundle of every file that uses your form hook.

To solve this, you can mix the `createFormHook` TanStack API with the Solid `lazy` and `Suspense` components:

```typescript
// src/hooks/form-context.ts
import { createFormHookContexts } from '@tanstack/solid-form'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()
```

```tsx
// src/components/text-field.tsx
import { useFieldContext } from '../hooks/form-context.tsx'

export default function TextField(props: { label: string }) {
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

```tsx
// src/hooks/form.ts
import { lazy } from 'solid-js'
import { createFormHook } from '@tanstack/solid-form'

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
import { Suspense } from 'solid-js'
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

### API Usage Guidance

Here's a chart to help you decide what APIs you should be using:

![](./doc-assets/assets/react_form_composability.svg)

<a id="source-form-docs-framework-solid-guides-form-groups-md"></a>

## Form Groups

Source: `form:docs/framework/solid/guides/form-groups.md`.

When building a multi-stage form that has many stages, like so:

![Form stepper](./doc-assets/assets/stepper.png)

It's common for each step to have its own form. However, this complicates the form submission and validation process by requiring you to add complex logic.

Luckily, TanStack Form provides a way to build out sub-forms that make this kind of development trivial to implement: `<form.FormGroup>`.

### Usage

To use a form group in TanStack Form, you'll use `createForm` or [`useAppForm`](./framework-solid.md#source-form-docs-framework-solid-guides-form-composition-md) to create a `form` variable, then reference its `FormGroup` component like you would a `Field`:

```tsx
const form = createForm(() => ({
  defaultValues: {
    step1: {
      name: '',
    },
    step2: {
      age: 0,
    },
  },
}))

return (
  <form.FormGroup name="step1">
    {(group) => (
      // `group()` here has all of the form-like methods you'd expect like `deleteField` or `insertFieldValue`
      // ...
    )}
  </form.FormGroup>
)
```

This becomes much more useful when paired with external state to conditionally render a `FormGroup`:

```tsx
const [step, setStep] = createSignal(0)
const form = createForm(() => ({
  defaultValues: {
    step1: {
      name: '',
    },
    step2: {
      age: 0,
    },
  },
}))

return (
  <>
    <Show when={step() === 0}>
      <form.FormGroup
        name="step1"
        onGroupSubmit={() => {
          // We can move the step forward when validation passes
          setStep(step() + 1)
        }}
        onGroupSubmitInvalid={() => {
          // Or handle invalid submissions, just like a top-level form
        }}
        onSubmitMeta={{} as SomeType}
      >
        {(group) => (
          // Use `group().handleSubmit()` to submit the sub-form, but not the parent form
          // ...
        )}
      </form.FormGroup>
    </Show>
    <Show when={step() === 1}>
      <form.FormGroup name="step2">
        {(group) => (
          // Then, use `form.handleSubmit()` to submit the entire form
          // ...
        )}
      </form.FormGroup>
    </Show>
  </>
)
```

### Form Group Validation

Form groups have a distinct validation proceedure that we think makes sense for sub-forms:

- Form groups can have their own validation:

```tsx
<form.FormGroup name="step1" validators={{ onChange: () => 'Error' }}>
  {(group) => {
    group().state.meta.errorMap // {onChange: "Error" | undefined}
    group().state.meta.errors // ("Error")[]
  }}
</form.FormGroup>
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

If you want to use [dynamic validation (`onDynamic`)](./framework-solid.md#source-form-docs-framework-solid-guides-dynamic-validation-md) with a form group, do not rely on the `onDynamic` validator passed to `createForm`:

```tsx
createForm(() => ({
  validationLogic: revalidateLogic(),
  validators: {
    // This validator will not run `onChange` when a sub-form is submitted;
    // it will only run `onChange` when the form itself is submitted.
    onDynamic: schema,
  },
}))
```

Instead, pass your sub-schema for the group to the `onDynamic` validation of the `FormGroup` itself:

```tsx
<form.FormGroup validators={{ onDynamic: step1Schema }} />
```

It will treat `group().submissionAttempts` as the way to change what validator is ran before/after submit.

### Form Group State

Just like you're able to access `group().state.meta.errors`, you're also able to access the group's value using `group().state.value`. Likewise, here are some valuable properties you can access in the `group().state.meta`:

- `group().state.meta.isFieldsValid`: `true` when the field-level validators have no errors
- `group().state.meta.isGroupValid`: `true` when the group-level validators have no errors
- `group().state.meta.isValid`: `true` when both the field-level and group-level validators have no errors
- `group().state.meta.isSubmitting`: `true` when the group is in the process of being submitted

<a id="source-form-docs-framework-solid-guides-linked-fields-md"></a>

## Linked Fields

Source: `form:docs/framework/solid/guides/linked-fields.md`.

You may find yourself needing to link two fields together; when one is validated as another field's value has changed.
One such usage is when you have both a `password` and `confirm_password` field,
where you want to `confirm_password` to error out when `password`'s value does not match;
regardless of which field triggered the value change.

Imagine the following userflow:

- User updates confirm password field.
- User updates the non-confirm password field.

In this example, the form will still have errors present,
as the "confirm password" field validation has not been re-ran to mark as accepted.

To solve this, we need to make sure that the "confirm password" validation is re-run when the password field is updated.
To do this, you can add a `onChangeListenTo` property to the `confirm_password` field.

```tsx
export default function App() {
  const form = createForm(() => ({
    defaultValues: {
      password: '',
      confirm_password: '',
    },
    // ...
  }))

  return (
    <div>
      <form.Field name="password">
        {(field) => (
          <label>
            <div>Password</div>
            <input
              value={field().state.value}
              onChange={(e) => field().handleChange(e.target.value)}
            />
          </label>
        )}
      </form.Field>
      <form.Field
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
        {(field) => (
          <div>
            <label>
              <div>Confirm Password</div>
              <input
                value={field().state.value}
                onChange={(e) => field().handleChange(e.target.value)}
              />
            </label>
            <Index each={field().state.meta.errors}>
              {(err) => <div>{err()}</div>}
            </Index>
          </div>
        )}
      </form.Field>
    </div>
  )
}
```

This similarly works with `onBlurListenTo` property, which will re-run the validation when the field is blurred.

<a id="source-form-docs-framework-solid-guides-submission-handling-md"></a>

## Submission Handling

Source: `form:docs/framework/solid/guides/submission-handling.md`.

### Passing additional data to submission handling

You may have multiple types of submission behaviour, for example, going back to another page or staying on the form.
You can accomplish this by specifying the `onSubmitMeta` property. This meta data will be passed to the `onSubmit` function.

> Note: if `form.handleSubmit()` is called without metadata, it will use the provided default.

```tsx
import { createForm } from '@tanstack/solid-form'

type FormMeta = {
  submitAction: 'continue' | 'backToMenu' | null
}

// Metadata is not required to call form.handleSubmit().
// Specify what values to use as default if no meta is passed
const defaultMeta: FormMeta = {
  submitAction: null,
}

export default function App() {
  const form = createForm(() => ({
    defaultValues: {
      data: '',
    },
    // Define what meta values to expect on submission
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      // Do something with the values passed via handleSubmit
      console.log(`Selected action - ${meta.submitAction}`, value)
    },
  }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {/* ... */}
      <button
        type="submit"
        // Overwrites the default specified in onSubmitMeta
        onClick={() => form.handleSubmit({ submitAction: 'continue' })}
      >
        Submit and continue
      </button>
      <button
        type="submit"
        onClick={() => form.handleSubmit({ submitAction: 'backToMenu' })}
      >
        Submit and back to menu
      </button>
    </form>
  )
}
```

### Transforming data with Standard Schemas

While Tanstack Form provides [Standard Schema support](./framework-solid.md#source-form-docs-framework-solid-guides-validation-md) for validation, it does not preserve the Schema's output data.

The value passed to the `onSubmit` function will always be the input data. To receive the output data of a Standard Schema, parse it in the `onSubmit` function:

```tsx
import { createForm } from '@tanstack/solid-form'
import { z } from 'zod'

// ...

const schema = z.object({
  age: z.string().transform((age) => Number(age)),
})

// Tanstack Form uses the input type of Standard Schemas
const defaultValues: z.input<typeof schema> = {
  age: '13',
}

const form = createForm(() => ({
  defaultValues,
  validators: {
    onChange: schema,
  },
  onSubmit: ({ value }) => {
    const inputAge: string = value.age
    // Pass it through the schema to get the transformed value
    const result = schema.parse(value)
    const outputAge: number = result.age
  },
}))
```

<a id="source-form-docs-framework-solid-guides-validation-md"></a>

## Validation

Source: `form:docs/framework/solid/guides/validation.md`.

At the core of TanStack Form's functionalities is the concept of validation. TanStack Form makes validation highly customizable:

- You can control when to perform the validation (on change, on input, on blur, on submit...)
- Validation rules can be defined at the field level or at the form level
- Validation can be synchronous or asynchronous (for example, as a result of an API call)

### When is validation performed?

It's up to you! The `<Field />` component accepts some callbacks as props such as `onChange` or `onBlur`. Those callbacks are passed the current value of the field, as well as the fieldAPI object, so that you can perform the validation. If you find a validation error, simply return the error message as string and it will be available in `field().state.meta.errors`.

Here is an example:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? 'You must be 13 to make an account' : undefined,
  }}
>
  {(field) => (
    <>
      <label for={field().name}>Age:</label>
      <input
        id={field().name}
        name={field().name}
        value={field().state.value}
        type="number"
        onInput={(e) => field().handleChange(e.target.valueAsNumber)}
      />
      {!field().state.meta.isValid ? (
        <em role="alert">{field().state.meta.errors.join(', ')}</em>
      ) : null}
    </>
  )}
</form.Field>
```

In the example above, the validation is done at each keystroke (`onChange`). If, instead, we wanted the validation to be done when the field is blurred, we would change the code above like so:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? 'You must be 13 to make an account' : undefined,
  }}
>
  {(field) => (
    <>
      <label for={field().name}>Age:</label>
      <input
        id={field().name}
        name={field().name}
        value={field().state.value}
        type="number"
        // Listen to the onBlur event on the field
        onBlur={field().handleBlur}
        // We always need to implement onInput, so that TanStack Form receives the changes
        onInput={(e) => field().handleChange(e.target.valueAsNumber)}
      />
      {!field().state.meta.isValid ? (
        <em role="alert">{field().state.meta.errors.join(', ')}</em>
      ) : null}
    </>
  )}
</form.Field>
```

So you can control when the validation is done by implementing the desired callback. You can even perform different pieces of validation at different times:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? 'You must be 13 to make an account' : undefined,
    onBlur: ({ value }) => (value < 0 ? 'Invalid value' : undefined),
  }}
>
  {(field) => (
    <>
      <label for={field().name}>Age:</label>
      <input
        id={field().name}
        name={field().name}
        value={field().state.value}
        type="number"
        // Listen to the onBlur event on the field
        onBlur={field().handleBlur}
        // We always need to implement onInput, so that TanStack Form receives the changes
        onInput={(e) => field().handleChange(e.target.valueAsNumber)}
      />
      {!field().state.meta.isValid ? (
        <em role="alert">{field().state.meta.errors.join(', ')}</em>
      ) : null}
    </>
  )}
</form.Field>
```

In the example above, we are validating different things on the same field at different times (at each keystroke and when blurring the field). Since `field().state.meta.errors` is an array, all the relevant errors at a given time are displayed. You can also use `field().state.meta.errorMap` to get errors based on _when_ the validation was done (onChange, onBlur etc...). More info about displaying errors below.

### Displaying Errors

Once you have your validation in place, you can map the errors from an array to be displayed in your UI:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? 'You must be 13 to make an account' : undefined,
  }}
>
  {(field) => {
    return (
      <>
        {/* ... */}
        {!field().state.meta.isValid ? (
          <em>{field().state.meta.errors.join(',')}</em>
        ) : null}
      </>
    )
  }}
</form.Field>
```

Or use the `errorMap` property to access the specific error you're looking for:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? 'You must be 13 to make an account' : undefined,
  }}
>
  {(field) => (
    <>
      {/* ... */}
      {field().state.meta.errorMap['onChange'] ? (
        <em>{field().state.meta.errorMap['onChange']}</em>
      ) : null}
    </>
  )}
</form.Field>
```

It's worth mentioning that our `errors` array and the `errorMap` matches the types returned by the validators. This means that:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) => (value < 13 ? { isOldEnough: false } : undefined),
  }}
>
  {(field) => (
    <>
      {/* ... */}
      {/* errorMap.onChange is type `{isOldEnough: false} | undefined` */}
      {/* meta.errors is type `Array<{isOldEnough: false} | undefined>` */}
      {!field().state.meta.errorMap['onChange']?.isOldEnough ? (
        <em>The user is not old enough</em>
      ) : null}
    </>
  )}
</form.Field>
```

### Validation at field level vs at form level

As shown above, each `<Field>` accepts its own validation rules via the `onChange`, `onBlur` etc... callbacks. It is also possible to define validation rules at the form level (as opposed to field by field) by passing similar callbacks to the `createForm()` hook.

Example:

```tsx
export default function App() {
  const form = createForm(() => ({
    defaultValues: {
      age: 0,
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
    validators: {
      // Add validators to the form the same way you would add them to a field
      onChange({ value }) {
        if (value.age < 13) {
          return 'Must be 13 or older to sign'
        }
        return undefined
      },
    },
  }))

  // Subscribe to the form's error map so that updates to it will render
  // alternately, you can use `form.Subscribe`
  const formErrorMap = form.useSelector((state) => state.errorMap)

  return (
    <div>
      {/* ... */}
      {formErrorMap().onChange ? (
        <div>
          <em>There was an error on the form: {formErrorMap().onChange}</em>
        </div>
      ) : null}
      {/* ... */}
    </div>
  )
}
```

#### Setting field-level errors from the form's validators

You can set errors on the fields from the form's validators. One common use case for this is validating all the fields on submit by calling a single API endpoint in the form's `onSubmitAsync` validator.

```tsx
import { Show } from 'solid-js'
import { createForm } from '@tanstack/solid-form'

export default function App() {
  const form = createForm(() => ({
    defaultValues: {
      age: 0,
      socials: [],
      details: {
        email: '',
      },
    },
    validators: {
      onSubmitAsync: async ({ value }) => {
        // Validate the value on the server
        const hasErrors = await validateDataOnServer(value)
        if (hasErrors) {
          return {
            form: 'Invalid data', // The `form` key is optional
            fields: {
              age: 'Must be 13 or older to sign',
              // Set errors on nested fields with the field's name
              'socials[0].url': 'The provided URL does not exist',
              'details.email': 'An email is required',
            },
          }
        }

        return null
      },
    },
  }))

  return (
    <div>
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
            <>
              <label for={field().name}>Age:</label>
              <input
                id={field().name}
                name={field().name}
                value={field().state.value}
                type="number"
                onChange={(e) => field().handleChange(e.target.valueAsNumber)}
              />
              <Show when={field().state.meta.errors.length > 0}>
                <em role="alert">{field().state.meta.errors.join(', ')}</em>
              </Show>
            </>
          )}
        />
        <form.Subscribe
          selector={(state) => ({ errors: state.errors })}
          children={(state) => (
            <Show when={state().errors.length > 0}>
              <div>
                <em>
                  There was an error on the form: {state().errors.join(', ')}
                </em>
              </div>
            </Show>
          )}
        />

        <button type="submit">Submit</button>
        {/*...*/}
      </form>
    </div>
  )
}
```

> Something worth mentioning is that if you have a form validation function that returns an error, that error may be overwritten by the field-specific validation.
>
> This means that:
>
> ```tsx
>  const form = createForm(() => ({
>    defaultValues: {
>      age: 0,
>    },
>    validators: {
>      onChange: ({ value }) => {
>        return {
>          fields: {
>            age: value.age < 12 ? 'Too young!' : undefined,
>          },
>        };
>      },
>    },
>  }));
>
>  return (
>    <form.Field
>      name="age"
>      validators={{
>        onChange: ({ value }) => (value % 2 === 0 ? 'Must be odd!' : undefined),
>      }}
>      children={() => <>{/* ... */}</>}
>    />
>  );
> }
> ```
>
> Will only show `'Must be odd!` even if the 'Too young!' error is returned by the form-level validation.

### Asynchronous Functional Validation

While we suspect most validations will be synchronous, there are many instances where a network call or some other async operation would be useful to validate against.

To do this, we have dedicated `onChangeAsync`, `onBlurAsync`, and other methods that can be used to validate against:

```tsx
<form.Field
  name="age"
  validators={{
    onChangeAsync: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return value < 13 ? 'You must be 13 to make an account' : undefined
    },
  }}
>
  {(field) => (
    <>
      <label for={field().name}>Age:</label>
      <input
        id={field().name}
        name={field().name}
        value={field().state.value}
        type="number"
        onInput={(e) => field().handleChange(e.target.valueAsNumber)}
      />
      {!field().state.meta.isValid ? (
        <em role="alert">{field().state.meta.errors.join(', ')}</em>
      ) : null}
    </>
  )}
</form.Field>
```

Synchronous and Asynchronous validations can coexist. For example, it is possible to define both `onBlur` and `onBlurAsync` on the same field:

```tsx
<form.Field
  name="age"
  validators={{
    onBlur: ({ value }) => (value < 13 ? 'You must be at least 13' : undefined),
    onBlurAsync: async ({ value }) => {
      const currentAge = await fetchCurrentAgeOnProfile()
      return value < currentAge ? 'You can only increase the age' : undefined
    },
  }}
>
  {(field) => (
    <>
      <label for={field().name}>Age:</label>
      <input
        id={field().name}
        name={field().name}
        value={field().state.value}
        type="number"
        onBlur={field().handleBlur}
        onInput={(e) => field().handleChange(e.target.valueAsNumber)}
      />
      {field().state.meta.errors ? (
        <em role="alert">{field().state.meta.errors.join(', ')}</em>
      ) : null}
    </>
  )}
</form.Field>
```

The synchronous validation method (`onBlur`) is run first and the asynchronous method (`onBlurAsync`) is only run if the synchronous one (`onBlur`) succeeds. To change this behaviour, set the `asyncAlways` option to `true`, and the async method will be run regardless of the result of the sync method.

#### Built-in Debouncing

While async calls are the way to go when validating against the database, running a network request on every keystroke is a good way to DDOS your database.

Instead, we enable an easy method for debouncing your `async` calls by adding a single property:

```tsx
<form.Field
  name="age"
  asyncDebounceMs={500}
  validators={{
    onChangeAsync: async ({ value }) => {
      // ...
    },
  }}
  children={(field) => {
    return <>{/* ... */}</>
  }}
/>
```

This will debounce every async call with a 500ms delay. You can even override this property on a per-validation property:

```tsx
<form.Field
  name="age"
  asyncDebounceMs={500}
  validators={{
    onChangeAsyncDebounceMs: 1500,
    onChangeAsync: async ({ value }) => {
      // ...
    },
    onBlurAsync: async ({ value }) => {
      // ...
    },
  }}
  children={(field) => {
    return <>{/* ... */}</>
  }}
/>
```

This will run `onChangeAsync` every 1500ms while `onBlurAsync` will run every 500ms.

### Validation through Schema Libraries

While functions provide more flexibility and customization over your validation, they can be a bit verbose. To help solve this, there are libraries that provide schema-based validation to make shorthand and type-strict validation substantially easier. You can also define a single schema for your entire form and pass it to the form level, errors will be automatically propagated to the fields.

#### Standard Schema Libraries

TanStack Form natively supports all libraries following the [Standard Schema specification](https://github.com/standard-schema/standard-schema), most notably:

- [Zod](https://zod.dev/)
- [Valibot](https://valibot.dev/)
- [ArkType](https://arktype.io/)

_Note:_ make sure to use the latest version of the schema libraries as older versions might not support Standard Schema yet.

> Validation will not provide you with transformed values. See [submission handling](./framework-solid.md#source-form-docs-framework-solid-guides-submission-handling-md) for more information.

To use schemas from these libraries you can pass them to the `validators` props as you would do with a custom function:

```tsx
import { z } from 'zod'

// ...

const form = createForm(() => ({
  // ...
}))

;<form.Field
  name="age"
  validators={{
    onChange: z.number().gte(13, 'You must be 13 to make an account'),
  }}
  children={(field) => {
    return <>{/* ... */}</>
  }}
/>
```

Async validations on form and field level are supported as well:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: z.number().gte(13, 'You must be 13 to make an account'),
    onChangeAsyncDebounceMs: 500,
    onChangeAsync: z.number().refine(
      async (value) => {
        const currentAge = await fetchCurrentAgeOnProfile()
        return value >= currentAge
      },
      {
        message: 'You can only increase the age',
      },
    ),
  }}
  children={(field) => {
    return <>{/* ... */}</>
  }}
/>
```

If you need even more control over your Standard Schema validation, you can combine a Standard Schema with a callback function like so:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: ({ value, fieldApi }) => {
      const errors = fieldApi.parseValueWithSchema(
        z.number().gte(13, 'You must be 13 to make an account'),
      )

      if (errors) return errors

      // continue with your validation
    },
  }}
  children={(field) => {
    return <>{/* ... */}</>
  }}
/>
```

### Preventing invalid forms from being submitted

The `onChange`, `onBlur` etc... callbacks are also run when the form is submitted and the submission is blocked if the form is invalid.

The form state object has a `canSubmit` flag that is false when any field is invalid and the form has been touched (`canSubmit` is true until the form has been touched, even if some fields are "technically" invalid based on their `onChange`/`onBlur` props).

You can subscribe to it via `form.Subscribe` and use the value in order to, for example, disable the submit button when the form is invalid (in practice, disabled buttons are not accessible, use `aria-disabled` instead).

```tsx
const form = createForm(() => ({
  /* ... */
}))

return (
  /* ... */

  // Dynamic submit button
  <form.Subscribe
    selector={(state) => ({
      canSubmit: state.canSubmit,
      isSubmitting: state.isSubmitting,
    })}
    children={(state) => (
      <button type="submit" disabled={!state().canSubmit}>
        {state().isSubmitting ? '...' : 'Submit'}
      </button>
    )}
  />
)
```

To prevent the form from being submitted before any interaction, combine `canSubmit` with `isPristine` flags. A simple condition like `!canSubmit || isPristine` effectively disables submissions until the user has made changes.

<a id="source-form-docs-framework-solid-quick-start-md"></a>

## Quick Start

Source: `form:docs/framework/solid/quick-start.md`.

The bare minimum to get started with TanStack Form is to create a form and add a field. Keep in mind that this example does not include any validation or error handling... yet.

```tsx
import { createForm } from '@tanstack/solid-form'

function App() {
  const form = createForm(() => ({
    defaultValues: {
      fullName: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  }))

  return (
    <div>
      <h1>Simple Form Example</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div>
          <form.Field
            name="fullName"
            children={(field) => (
              <input
                name={field().name}
                value={field().state.value}
                onBlur={field().handleBlur}
                onInput={(e) => field().handleChange(e.target.value)}
              />
            )}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
```

From here, you'll be ready to explore all of the other features of TanStack Form!
