# Svelte adapter

Svelte-specific setup and behavior.

<a id="source-form-docs-framework-svelte-guides-arrays-md"></a>

## Arrays

Source: `form:docs/framework/svelte/guides/arrays.md`.

TanStack Form supports arrays as values in a form, including sub-object values inside of an array.

### Basic Usage

To use an array, you can use `field.state.value` on an array value in conjunction
with [`each blocks`](https://svelte.dev/docs/svelte/each):

```svelte
<script>
  import { createForm } from '@tanstack/svelte-form'

  const form = createForm(() => ({
    defaultValues: {
      people: [],
    },
  }))
</script>

<form.Field name="people" mode="array">
  {#snippet children(field)}
    {#each field.state.value as person, i}
      <!-- ... -->
    {/each}
  {/snippet}
</form.Field>
```

This will regenerate the list every time you run `pushValue` on `field`:

```svelte
<button onclick={() => field.pushValue({ name: '', age: 0 })} type="button">
  Add person
</button>
```

Finally, you can use a subfield like so:

```svelte
<form.Field name={`people[${i}].name`}>
  {#snippet children(subField)}
    <input
      value={subField.state.value}
      oninput={(e) => {
        subField.handleChange(e.currentTarget.value)
      }}
    />
  {/snippet}
</form.Field>
```

### Full Example

```svelte
<script lang="ts">
  import { createForm } from '@tanstack/svelte-form'

  const form = createForm(() => ({
    defaultValues: {
      people: [] as Array<{ age: number; name: string }>,
    },
    onSubmit: ({ value }) => alert(JSON.stringify(value)),
  }))
</script>

<form
  id="form"
  onsubmit={(e) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }}
>
  <form.Field name="people" mode="array">
    {#snippet children(field)}
      <div>
        {#each field.state.value as person, i}
          <form.Field name={`people[${i}].name`}>
            {#snippet children(subField)}
              <div>
                <label>
                  <div>Name for person {i}</div>
                  <input
                    value={person.name}
                    oninput={(e: Event) => {
                      const target = e.target as HTMLInputElement
                      subField.handleChange(target.value)
                    }}
                  />
                </label>
              </div>
            {/snippet}
          </form.Field>
        {/each}

        <button
          onclick={() => field.pushValue({ name: '', age: 0 })}
          type="button"
        >
          Add person
        </button>
      </div>
    {/snippet}
  </form.Field>

  <button type="submit"> Submit </button>
</form>
```

<a id="source-form-docs-framework-svelte-guides-async-initial-values-md"></a>

## Async Initial Values

Source: `form:docs/framework/svelte/guides/async-initial-values.md`.

Let's say that you want to fetch some data from an API and use it as the initial value of a form.

While this problem sounds simple on the surface, there are hidden complexities you might not have thought of thus far.

For example, you might want to show a loading spinner while the data is being fetched, or you might want to handle errors gracefully.
Likewise, you could also find yourself looking for a way to cache the data so that you don't have to fetch it every time the form is rendered.

While we could implement many of these features from scratch, it would end up looking a lot like another project we maintain: [TanStack Query](https://tanstack.com/query).

As such, this guide shows you how you can mix-n-match TanStack Form with TanStack Query to achieve the desired behavior.

### Basic Usage

```svelte
<script>
  import { createForm } from '@tanstack/svelte-form'
  import { createQuery } from '@tanstack/svelte-query'

    const { data, isLoading } = createQuery(() => ({
      queryKey: ['data'],
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { firstName: 'FirstName', lastName: 'LastName' }
      },
    }))

    const form = createForm(() => ({
      defaultValues: {
        firstName: $data?.firstName ?? '',
        lastName: $data?.lastName ?? '',
      },
      onSubmit: async ({ value }) => {
        // Do something with form data
        console.log(value)
      },
    }))
</script>

{#if $isLoading}
  <p>Loading...</p>
{:else}
  <!-- form... -->
{/if}
```

This will show a loading spinner until the data is fetched, and then it will render the form with the fetched data as the initial values.

<a id="source-form-docs-framework-svelte-guides-basic-concepts-md"></a>

## Basic Concepts

Source: `form:docs/framework/svelte/guides/basic-concepts.md`.

This page introduces the basic concepts and terminology used in the `@tanstack/svelte-form` library. Familiarizing yourself with these concepts will help you better understand and work with the library.

### Form Options

You can create options for your form so that it can be shared between multiple forms by using the `formOptions` function.

Example:

```ts
const formOpts = formOptions({
  defaultValues: {
    firstName: '',
    lastName: '',
    hobbies: [],
  } as Person,
})
```

### Form Instance

A Form Instance is an object that represents an individual form and provides methods and properties for working with the form. You create a form instance using the `createForm` function. The function accepts an object with an `onSubmit` function, which is called when the form is submitted.

```ts
const form = createForm(() => ({
  ...formOpts,
  onSubmit: async ({ value }) => {
    // Do something with form data
    console.log(value)
  },
}))
```

You may also create a form instance without using `formOptions`:

```ts
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

```svelte
<form.Field name="firstName">
  {#snippet children(field)}
    <input
      name={field.name}
      value={field.state.value}
      onblur={field.handleBlur}
      oninput={(e) => field.handleChange(e.target.value)}
    />
  {/snippet}
</form.Field>
```

### Field State

Each field has its own state, which includes its current value, validation status, error messages, and other metadata. You can access a field's state using the `field.state` property.

Example:

```ts
const {
  value,
  meta: { errors, isValidating },
} = field.state
```

There are four states in the metadata that can be useful to see how the user interacts with a field:

- _"isTouched"_, after the user changes the field or blurs the field
- _"isDirty"_, after the field's value has been changed, even if it's been reverted to the default. Opposite of `isPristine`
- _"isPristine"_, until the user changes the field value. Opposite of `isDirty`
- _"isBlurred"_, after the field has been blurred

```ts
const { isTouched, isDirty, isPristine, isBlurred } = field.state.meta
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
const { isDefaultValue, isTouched } = field.state.meta

// The following line will re-create the non-Persistent `dirty` functionality.
const nonPersistentIsDirty = !isDefaultValue
```

![Field states extended](./doc-assets/assets/field-states-extended.png)

### Field API

The Field API is an object passed to the render prop function when creating a field. It provides methods for working with the field's state.

Example:

```svelte
<input
  name={field.name}
  value={field.state.value}
  onblur={field.handleBlur}
  oninput={(e) => field.handleChange(e.target.value)}
/>
```

### Validation

`@tanstack/svelte-form` provides both synchronous and asynchronous validation out of the box. Validation functions can be passed to the `form.Field` component using the `validators` prop.

Example:

```svelte
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
>
  {#snippet children(field)}
    <input
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onInput={(e) => field.handleChange(e.target.value)}
    />
    <p>{field.state.meta.errors[0]}</p>
  {/snippet}
</form.Field>
```

### Validation with Standard Schema Libraries

In addition to hand-rolled validation options, we also support the [Standard Schema](https://github.com/standard-schema/standard-schema) specification.

You can define a schema using any of the libraries implementing the specification and pass it to a form or field validator.

Supported libraries include:

- [Zod](https://zod.dev/) (v3.24.0 or higher)
- [Valibot](https://valibot.dev/) (v1.0.0 or higher)
- [ArkType](https://arktype.io/) (v2.1.20 or higher)
- [Yup](https://github.com/jquense/yup) (v1.7.0 or higher)

```svelte
<script>
  import { z } from 'zod'

  // ...
</script>

<form.Field
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
>
  {#snippet children(field)}
    <input
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onInput={(e) => field.handleChange(e.target.value)}
    />
    <p>{field.state.meta.errors[0]}</p>
  {/snippet}
</form.Field>
```

### Reactivity

`@tanstack/svelte-form` offers various ways to subscribe to form and field state changes, most notably the `form.useSelector` hook and the `form.Subscribe` component. These methods allow you to optimize your form's rendering performance by only updating components when necessary.

Example:

```svelte
<script>
  //...
  const firstName = form.useSelector((state) => state.values.firstName)
</script>

<form.Subscribe
  selector={(state) => ({
    canSubmit: state.canSubmit,
    isSubmitting: state.isSubmitting,
  })}
>
  {#snippet children(state)}
    <button type="submit" disabled={!state.canSubmit}>
      {state.isSubmitting ? '...' : 'Submit'}
    </button>
  {/snippet}
</form.Subscribe>
```

### Array Fields

Array fields allow you to manage a list of values within a form, such as a list of hobbies. You can create an array field using the `form.Field` component with the `mode="array"` prop.

When working with array fields, you can use the fields `pushValue`, `removeValue`, `swapValues` and `moveValue` methods to add, remove, swap, and move a value from one index to another within the array, respectively. Additional helper methods such as `insertValue`, `replaceValue`, and `clearValues` are also available for inserting, replacing, and clearing array values.

Example:

```svelte
<form.Field name="hobbies" mode="array">
  {#snippet children(hobbiesField)}
    <div>
      Hobbies
      <div>
        {#each hobbiesField.state.value as _, i}
            <div>
              <form.Field name={`hobbies[${i}].name`}>
                {#snippet children(field)}
                  <div>
                    <label for={field.name}>Name:</label>
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onblur={field.handleBlur}
                      onchange={(e) => field.handleChange(e.target.value)}
                    />
                    <button
                      type="button"
                      onclick={() => hobbiesField.removeValue(i)}
                    >
                      X
                    </button>
                  </div>
                {/snippet}
              </form.Field>
              <form.Field name={`hobbies[${i}].description`}>
                {#snippet children(field)}
                    <div>
                      <label for={field.name}>Description:</label>
                      <input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onblur={field.handleBlur}
                        onchange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                {/snippet}
              </form.Field>
            </div>
          {:else}
            No hobbies found.
          {/each}
      </div>
      <button
        type="button"
        onclick={() =>
          hobbiesField.pushValue({
            name: '',
            description: '',
            yearsOfExperience: 0,
          })
        }
      >
        Add hobby
      </button>
    </div>
  {/snippet}
</form.Field>
```

These are the basic concepts and terminology used in the `@tanstack/svelte-form` library. Understanding these concepts will help you work more effectively with the library and create complex forms with ease.

<a id="source-form-docs-framework-svelte-guides-dynamic-validation-md"></a>

## Dynamic Validation

Source: `form:docs/framework/svelte/guides/dynamic-validation.md`.

In many cases, you want to change the validation rules based depending on the state of the form or other conditions. The most popular
example of this is when you want to validate a field differently based on whether the user has submitted the form for the first time or not.

We support this through our `onDynamic` validation function.

```ts
import { revalidateLogic, createForm } from '@tanstack/svelte-form'

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

```ts
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

```svelte
<script lang="ts">
  import { createForm } from '@tanstack/svelte-form'

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
</script>

<p>{form.state.errorMap.onDynamic?.firstName}</p>
```

### Usage with Other Validation Logic

You can use `onDynamic` validation alongside other validation logic, such as `onChange` or `onBlur`.

```svelte
<script lang="ts">
  import { revalidateLogic, createForm } from '@tanstack/svelte-form'

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
</script>

<div>
  <p>{form.state.errorMap.onChange?.firstName}</p>
  <p>{form.state.errorMap.onDynamic?.lastName}</p>
</div>
```

#### Usage with Fields

You can also use `onDynamic` validation with fields, just like you would with other validation logic.

```svelte
<script lang="ts">
  import { createForm } from '@tanstack/svelte-form'

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
</script>

<form
  onsubmit={(e) => {
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
  >
    {#snippet children(field)}
      <div>
        <input
          type="number"
          onchange={(e) => field.handleChange(e.target.valueAsNumber)}
          onblur={field.handleBlur}
          value={field.state.value}
        />
        <p style="color: red">
          {field.state.meta.errorMap.onDynamic}
        </p>
      </div>
    {/snippet}
  </form.Field>
  <button type="submit">Submit</button>
</form>
```

#### Async Validation

Async validation can also be used with `onDynamic` just like with other validation logic. You can even debounce the async validation to avoid excessive calls.

```ts
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

```ts
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

<a id="source-form-docs-framework-svelte-guides-form-composition-md"></a>

## Form Composition

Source: `form:docs/framework/svelte/guides/form-composition.md`.

A common criticism of TanStack Form is its verbosity out-of-the-box. While this _can_ be useful for educational purposes - helping enforce understanding our APIs - it's not ideal in production use cases.

As a result, while `form.Field` enables the most powerful and flexible usage of TanStack Form, we provide APIs that wrap it and make your application code less verbose.

### Custom Form Methods

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

#### Pre-bound Field Components

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

#### Pre-bound Form Components

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

### Breaking big forms into smaller pieces

Sometimes forms get very large; it's just how it goes sometimes. While TanStack Form supports large forms well, it's never fun to work with hundreds or thousands of lines of code long files.

To solve this, you can break forms into smaller Svelte components that accept the form as a prop.

```ts
// shared-form.ts
import { formOptions } from '@tanstack/svelte-form'

export const peopleFormOpts = formOptions({
  defaultValues: {
    firstName: 'John',
    lastName: 'Doe',
  },
})
```

```svelte
<!-- child-form.svelte -->
<script lang="ts">
  import { getFormType } from './form.js'
  import { peopleFormOpts } from './shared-form.js'

  const formType = getFormType({ ...peopleFormOpts })

  const { form, title = 'Child Form' }: { form: typeof formType; title?: string } = $props()
</script>

<div>
  <p>{title}</p>
  <form.AppField name="firstName">
    {#snippet children(field)}
      <field.TextField label="First Name" />
    {/snippet}
  </form.AppField>
  <form.AppForm>
    {#snippet children()}
      <form.SubscribeButton label="Submit" />
    {/snippet}
  </form.AppForm>
</div>
```

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { createAppForm } from './form.js'
  import { peopleFormOpts } from './shared-form.js'
  import ChildForm from './child-form.svelte'

  const form = createAppForm(() => ({
    ...peopleFormOpts,
  }))
</script>

<ChildForm {form} title="Testing" />
```

### Getting the Form Type

When you split a form into smaller child components, those child components need a typed `form` prop so that `form.AppField`, `form.AppForm`, and the registered field/form components remain fully type-safe. Writing out the full `createAppForm` generics by hand is verbose and error-prone.

`createFormCreator` returns a `getFormType` helper alongside `createAppForm` for exactly this purpose. It accepts the same options object as `createAppForm` and returns a value whose type matches the form instance that `createAppForm` would produce — without actually running any logic at runtime.

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

Use it together with your shared `formOptions` to derive the expected `form` prop type:

```svelte
<!-- child-form.svelte -->
<script lang="ts">
  import { getFormType } from './form.js'
  import { peopleFormOpts } from './shared-form.js'

  const formType = getFormType({ ...peopleFormOpts })

  const { form }: { form: typeof formType } = $props()
</script>

<form.AppField name="firstName">
  {#snippet children(field)}
    <field.TextField label="First Name" />
  {/snippet}
</form.AppField>
```

This gives the child component a fully typed `form` prop — including the registered `fieldComponents` and `formComponents` — without having to repeat the form generics by hand or maintain a `ReturnType<typeof createAppForm<...>>` alias.

> `useFormContext` is still the best fit for registered form components rendered inside `form.AppForm`. Use `getFormType` when you pass the form instance down as a prop to a child component.

### Reusing groups of fields in multiple forms

Sometimes, a pair of fields are so closely related that it makes sense to group and reuse them — like the password example listed in the [linked fields guide](./framework-svelte.md#source-form-docs-framework-svelte-guides-linked-fields-md). Instead of repeating this logic across multiple forms, you can create reusable field group components.

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

### Tree-shaking form and field components

While the above examples are great for getting started, they're not ideal for certain use-cases where you might have hundreds of form and field components.
In particular, you may not want to include all of your form and field components in the bundle of every file that uses your form method.

To solve this, you can use dynamic imports with Svelte's component loading:

```ts
// src/utils/form-context.ts
import { createFormCreatorContexts } from '@tanstack/svelte-form'

export const { useFieldContext, useFormContext } = createFormCreatorContexts()
```

```svelte
<!-- src/components/text-field.svelte -->
<script lang="ts">
  import { useFieldContext } from '../utils/form-context.js'

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

```ts
// src/utils/form.ts
import { createFormCreator } from '@tanstack/svelte-form'
import TextField from '../components/text-field.svelte'
import SubscribeButton from '../components/subscribe-button.svelte'

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
<!-- src/App.svelte -->
<script lang="ts">
  import PeoplePage from './features/people/page.svelte'
</script>

<PeoplePage />
```

### Putting it all together

Now that we've covered the basics of creating custom form methods, let's put it all together in a single example.

```ts
// /src/utils/form-context.ts, to be used across the entire app
import { createFormCreatorContexts } from '@tanstack/svelte-form'

export const { useFieldContext, useFormContext } = createFormCreatorContexts()
```

```svelte
<!-- /src/components/text-field.svelte -->
<script lang="ts">
  import { useFieldContext } from '../utils/form-context.js'

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

```svelte
<!-- /src/components/subscribe-button.svelte -->
<script lang="ts">
  import { useFormContext } from '../utils/form-context.js'

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
// /src/utils/form.ts
import { createFormCreator } from '@tanstack/svelte-form'
import TextField from '../components/text-field.svelte'
import SubscribeButton from '../components/subscribe-button.svelte'

export const { createAppForm, getFormType } = createFormCreator({
  fieldComponents: {
    TextField,
  },
  formComponents: {
    SubscribeButton,
  },
})
```

```ts
// /src/features/people/shared-form.ts, to be used across `people` features
import { formOptions } from '@tanstack/svelte-form'

export const peopleFormOpts = formOptions({
  defaultValues: {
    firstName: 'John',
    lastName: 'Doe',
  },
})
```

```svelte
<!-- /src/features/people/child-form.svelte, to be used in the `people` page -->
<script lang="ts">
  import { getFormType } from '../../utils/form.js'
  import { peopleFormOpts } from './shared-form.js'

  const formType = getFormType({ ...peopleFormOpts })

  const { form, title = 'Child Form' }: { form: typeof formType; title?: string } = $props()
</script>

<div>
  <p>{title}</p>
  <form.AppField name="firstName">
    {#snippet children(field)}
      <field.TextField label="First Name" />
    {/snippet}
  </form.AppField>
  <form.AppForm>
    {#snippet children()}
      <form.SubscribeButton label="Submit" />
    {/snippet}
  </form.AppForm>
</div>
```

```svelte
<!-- /src/features/people/page.svelte -->
<script lang="ts">
  import { createAppForm } from '../../utils/form.js'
  import { peopleFormOpts } from './shared-form.js'
  import ChildForm from './child-form.svelte'

  const form = createAppForm(() => ({
    ...peopleFormOpts,
  }))
</script>

<ChildForm {form} title="Testing" />
```

### API Usage Guidance

Here's a chart to help you decide what APIs you should be using:

[Upstream image unavailable in pinned release: svelte_form_composability.svg]

<a id="source-form-docs-framework-svelte-guides-form-groups-md"></a>

## Form Groups

Source: `form:docs/framework/svelte/guides/form-groups.md`.

When building a multi-stage form that has many stages, like so:

![Form stepper](./doc-assets/assets/stepper.png)

It's common for each step to have its own form. However, this complicates the form submission and validation process by requiring you to add complex logic.

Luckily, TanStack Form provides a way to build out sub-forms that make this kind of development trivial to implement: `<form.FormGroup>`.

### Usage

To use a form group in TanStack Form, you'll use `createForm` or [`createAppForm`](./framework-svelte.md#source-form-docs-framework-svelte-guides-form-composition-md) to create a `form` variable, then reference its `FormGroup` component like you would a `Field`:

```svelte
<script lang="ts">
  import { createForm } from '@tanstack/svelte-form'

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
</script>

<form.FormGroup name="step1">
  {#snippet children(group)}
    <!-- `group` here has all of the form-like methods you'd expect like `deleteField` or `insertFieldValue` -->
    <!-- ... -->
  {/snippet}
</form.FormGroup>
```

This becomes much more useful when paired with external state to conditionally render a `FormGroup`:

```svelte
<script lang="ts">
  import { createForm } from '@tanstack/svelte-form'

  let step = $state(0)

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
</script>

{#if step === 0}
  <form.FormGroup
    name="step1"
    onGroupSubmit={() => {
      // We can move the step forward when validation passes
      step++
    }}
    onGroupSubmitInvalid={() => {
      // Or handle invalid submissions, just like a top-level form
    }}
    onSubmitMeta={{} as SomeType}
  >
    {#snippet children(group)}
      <form
        onsubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // Use `group.handleSubmit()` to submit the sub-form, but not the parent form
          group.handleSubmit()
        }}
      >
        <!-- ... -->
      </form>
    {/snippet}
  </form.FormGroup>
{:else if step === 1}
  <form.FormGroup name="step2" onGroupSubmit={() => form.handleSubmit()}>
    {#snippet children(group)}
      <form
        onsubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          group.handleSubmit()
        }}
      >
        <!-- Then, use `form.handleSubmit()` from `onGroupSubmit` to submit the entire form -->
        <!-- ... -->
      </form>
    {/snippet}
  </form.FormGroup>
{/if}
```

### Form Group Validation

Form groups have a distinct validation procedure that we think makes sense for sub-forms:

- Form groups can have their own validation:

```svelte
<form.FormGroup name="step1" validators={{ onChange: () => 'Error' }}>
  {#snippet children(group)}
    <!-- group.state.meta.errorMap // {onChange: "Error" | undefined} -->
    <!-- group.state.meta.errors // ("Error")[] -->
  {/snippet}
</form.FormGroup>
```

- Can set errors on sub-fields:

```svelte
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

```svelte
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
> ```ts
> const step1Schema = z.object({
>   name: z.string().min(2),
> })
>
> const schema = z.object({
>   step1: step1Schema,
>   step2: step2Schema,
> })
> ```
>
> And pass the `step1Schema` to a form group and `schema` to the parent form. That way, partially validated data will still flag errors if the group is bypassed.

#### Dynamic Group Validation

If you want to use [dynamic validation (`onDynamic`)](./framework-svelte.md#source-form-docs-framework-svelte-guides-dynamic-validation-md) with a form group, do not rely on the `onDynamic` validator passed to `createForm`:

```ts
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

```svelte
<form.FormGroup name="step1" validators={{ onDynamic: step1Schema }} />
```

It will treat `group.submissionAttempts` as the way to change what validator is ran before/after submit.

### Form Group State

Just like you're able to access `group.state.meta.errors`, you're also able to access the group's value using `group.state.value`. Likewise, here are some valuable properties you can access in the `group.state.meta`:

- `group.state.meta.isFieldsValid`: `true` when the field-level validators have no errors
- `group.state.meta.isGroupValid`: `true` when the group-level validators have no errors
- `group.state.meta.isValid`: `true` when both the field-level and group-level validators have no errors
- `group.state.meta.isSubmitting`: `true` when the group is in the process of being submitted

<a id="source-form-docs-framework-svelte-guides-linked-fields-md"></a>

## Linked Fields

Source: `form:docs/framework/svelte/guides/linked-fields.md`.

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

```svelte
<script>
  import { createForm } from '@tanstack/svelte-form'

  const form = createForm(() => ({
    defaultValues: {
      password: '',
      confirm_password: '',
    },
    // ...
  }))
</script>

<div>
  <form.Field name="password">
    {#snippet children(field)}
      <label>
        <div>Password</div>
        <input
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </label>
    {/snippet}
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
    {#snippet children(field)}
      <div>
        <label>
          <div>Confirm Password</div>
          <input
            value={field.state.value}
            onchange={(e) => field.handleChange(e.target.value)}
          />
        </label>
        {#each field.state.meta.errors as err}
          <div>{err}</div>
        {/each}
      </div>
    {/snippet}
  </form.Field>
</div>
```

This similarly works with `onBlurListenTo` property, which will re-run the validation when the field is blurred.

<a id="source-form-docs-framework-svelte-guides-validation-md"></a>

## Validation

Source: `form:docs/framework/svelte/guides/validation.md`.

At the core of TanStack Form's functionalities is the concept of validation. TanStack Form makes validation highly customizable:

- You can control when to perform the validation (on change, on input, on blur, on submit...)
- Validation rules can be defined at the field level or at the form level
- Validation can be synchronous or asynchronous (for example, as a result of an API call)

### When is validation performed?

It's up to you! The `<form.Field />` component accepts some callbacks as props such as `onChange` or `onBlur`. Those callbacks are passed the current value of the field, as well as the fieldAPI object, so that you can perform the validation. If you find a validation error, simply return the error message as string and it will be available in `field.state.meta.errors`.

Here is an example:

```svelte
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? 'You must be 13 to make an account' : undefined,
  }}
>
  {#snippet children(field)}
    <label for={field.name}>Age:</label>
    <input
      id={field.name}
      name={field.name}
      value={field.state.value}
      type="number"
      onchange={(e) => field.handleChange(e.target.valueAsNumber)}
    />
    {#if field.state.meta.errors}
      <em role="alert">{field.state.meta.errors.join(', ')}</em>
    {/if}
  {/snippet}
</form.Field>
```

In the example above, the validation is done at each keystroke (`onchange`). If, instead, we wanted the validation to be done when the field is blurred, we would change the code above like so:

```svelte
<form.Field
  name="age"
  validators={{
    onBlur: ({ value }) =>
      value < 13 ? 'You must be 13 to make an account' : undefined,
  }}
>
  {#snippet children(field)}
    <label for={field.name}>Age:</label>
    <input
      id={field.name}
      name={field.name}
      value={field.state.value}
      type="number"
      onblur={field.handleBlur}
      onchange={(e) => field.handleChange(e.target.valueAsNumber)}
    />
    {#if field.state.meta.errors}
      <em role="alert">{field.state.meta.errors.join(', ')}</em>
    {/if}
  {/snippet}
</form.Field>
```

So you can control when the validation is done by implementing the desired callback. You can even perform different pieces of validation at different times:

```svelte
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? 'You must be 13 to make an account' : undefined,
    onBlur: ({ value }) => (value < 0 ? 'Invalid value' : undefined),
  }}
>
  {#snippet children(field)}
    <label for={field.name}>Age:</label>
    <input
      id={field.name}
      name={field.name}
      value={field.state.value}
      type="number"
      onblur={field.handleBlur}
      onchange={(e) => field.handleChange(e.target.valueAsNumber)}
    />
    {#if field.state.meta.errors}
      <em role="alert">{field.state.meta.errors.join(', ')}</em>
    {/if}
  {/snippet}
</form.Field>
```

In the example above, we are validating different things on the same field at different times (at each keystroke and when blurring the field). Since `field.state.meta.errors` is an array, all the relevant errors at a given time are displayed. You can also use `field.state.meta.errorMap` to get errors based on _when_ the validation was done (onChange, onBlur etc...). More info about displaying errors below.

### Displaying Errors

Once you have your validation in place, you can map the errors from an array to be displayed in your UI:

```svelte
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? 'You must be 13 to make an account' : undefined,
  }}
>
  {#snippet children(field)}
    <!-- ... -->
    {#if field.state.meta.errors}
      <em role="alert">{field.state.meta.errors.join(', ')}</em>
    {/if}
  {/snippet}
</form.Field>
```

Or use the `errorMap` property to access the specific error you're looking for:

```svelte
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? 'You must be 13 to make an account' : undefined,
  }}
>
  {#snippet children(field)}
    <!-- ... -->
    {#if field.state.meta.errorMap['onChange']}
      <em role="alert">{field.state.meta.errorMap['onChange']}</em>
    {/if}
  {/snippet}
</form.Field>
```

It's worth mentioning that our `errors` array and the `errorMap` matches the types returned by the validators. This means that:

```svelte
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) => (value < 13 ? { isOldEnough: false } : undefined),
  }}
>
  {#snippet children(field)}
    <!-- ... -->
    <!-- errorMap.onChange is type `{isOldEnough: false} | undefined` -->
    <!-- meta.errors is type `Array<{isOldEnough: false} | undefined>` -->
    {#if field.state.meta.errorMap['onChange']?.isOldEnough}
        <em>The user is not old enough</em>
    {/if}
  {/snippet}
</form.Field>
```

### Validation at field level vs at form level

As shown above, each `<form.Field>` accepts its own validation rules via the `onChange`, `onBlur` etc... callbacks. It is also possible to define validation rules at the form level (as opposed to field by field) by passing similar callbacks to the `createForm()` hook.

Example:

```svelte
<script>
  import { createForm } from '@tanstack/svelte-form'

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
</script>

<div>
  <!-- ... -->
  {#if formErrorMap.current.onChange}
    <div>
      <em>There was an error on the form: {formErrorMap.current.onChange}</em>
    </div>
  {/if}
  <!-- ... -->
</div>
```

### Asynchronous Functional Validation

While we suspect most validations will be synchronous, there are many instances where a network call or some other async operation would be useful to validate against.

To do this, we have dedicated `onChangeAsync`, `onBlurAsync`, and other methods that can be used to validate against:

```svelte
<form.Field
  name="age"
  validators={{
    onChangeAsync: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return value < 13 ? 'You must be 13 to make an account' : undefined
    },
  }}
>
  {#snippet children(field)}
    <label for={field.name}>Age:</label>
    <input
      id={field.name}
      name={field.name}
      value={field.state.value}
      type="number"
      onchange={(e) => field.handleChange(e.target.valueAsNumber)}
    />
    {#if field.state.meta.errors}
      <em role="alert">{field.state.meta.errors.join(', ')}</em>
    {/if}
  {/snippet}
</form.Field>
```

Synchronous and Asynchronous validations can coexist. For example, it is possible to define both `onBlur` and `onBlurAsync` on the same field:

```svelte
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
  {#snippet children(field)}
    <label for={field.name}>Age:</label>
    <input
      id={field.name}
      name={field.name}
      value={field.state.value}
      type="number"
      onblur={field.handleBlur}
      onchange={(e) => field.handleChange(e.target.valueAsNumber)}
    />
    {#if field.state.meta.errors}
      <em role="alert">{field.state.meta.errors.join(', ')}</em>
    {/if}
  {/snippet}
</form.Field>
```

The synchronous validation method (`onBlur`) is run first and the asynchronous method (`onBlurAsync`) is only run if the synchronous one (`onBlur`) succeeds. To change this behaviour, set the `asyncAlways` option to `true`, and the async method will be run regardless of the result of the sync method.

#### Built-in Debouncing

While async calls are the way to go when validating against the database, running a network request on every keystroke is a good way to DDOS your database.

Instead, we enable an easy method for debouncing your `async` calls by adding a single property:

```svelte
<form.Field
  name="age"
  asyncDebounceMs={500}
  validators={{
    onChangeAsync: async ({ value }) => {
      // ...
    },
  }}
>
  <!-- ... -->
</form.Field>
```

This will debounce every async call with a 500ms delay. You can even override this property on a per-validation property:

```svelte
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
>
  <!-- ... -->
</form.Field>
```

> This will run `onChangeAsync` every 1500ms while `onBlurAsync` will run every 500ms.

### Validation through Schema Libraries

While functions provide more flexibility and customization over your validation, they can be a bit verbose. To help solve this, there are libraries that provide schema-based validation to make shorthand and type-strict validation substantially easier. You can also define a single schema for your entire form and pass it to the form level, errors will be automatically propagated to the fields.

#### Standard Schema Libraries

TanStack Form natively supports all libraries following the [Standard Schema specification](https://github.com/standard-schema/standard-schema), most notably:

- [Zod](https://zod.dev/)
- [Valibot](https://valibot.dev/)
- [ArkType](https://arktype.io/)

_Note:_ make sure to use the latest version of the schema libraries as older versions might not support Standard Schema yet.

To use schemas from these libraries you can pass them to the `validators` props as you would do with a custom function:

```svelte
<script>
  import { z } from 'zod'

  // ...

  const form = createForm(() => ({
    // ...
  }))
</script>

<form.Field
  name="age"
  validators={{
    onChange: z.number().gte(13, 'You must be 13 to make an account'),
  }}
>
  <!-- ... -->
</form.Field>
```

Async validations on form and field level are supported as well:

```svelte
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
>
  <!-- ... -->
</form.Field>
```

### Preventing invalid forms from being submitted

The `onChange`, `onBlur` etc... callbacks are also run when the form is submitted and the submission is blocked if the form is invalid.

The form state object has a `canSubmit` flag that is false when any field is invalid and the form has been touched (`canSubmit` is true until the form has been touched, even if some fields are "technically" invalid based on their `onChange`/`onBlur` props).

You can subscribe to it via `form.Subscribe` and use the value in order to, for example, disable the submit button when the form is invalid (in practice, disabled buttons are not accessible, use `aria-disabled` instead).

```svelte
<script>
  import { createForm } from '@tanstack/svelte-form'

  const form = createForm(() => ({
    /* ... */
  }))
</script>

<!-- ... -->

<!-- Dynamic submit button -->
<form.Subscribe
  selector={(state) => ({
    canSubmit: state.canSubmit,
    isSubmitting: state.isSubmitting,
  })}
>
  {#snippet children(state)}
    <button type="submit" disabled={!state.canSubmit}>
      {state.isSubmitting ? '...' : 'Submit'}
    </button>
  {/snippet}
</form.Subscribe>
```

To prevent the form from being submitted before any interaction, combine `canSubmit` with `isPristine` flags. A simple condition like `!canSubmit || isPristine` effectively disables submissions until the user has made changes.

<a id="source-form-docs-framework-svelte-quick-start-md"></a>

## Quick Start

Source: `form:docs/framework/svelte/quick-start.md`.

The bare minimum to get started with TanStack Form is to create a form and add a field. Keep in mind that this example does not include any validation or error handling... yet.

```svelte
<script>
  import { createForm } from '@tanstack/svelte-form'

  const form = createForm(() => ({
    defaultValues: {
      fullName: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  }))
</script>

<div>
  <h1>Simple Form Example</h1>
  <form
    onsubmit={(e) => {
      e.preventDefault()
      e.stopPropagation()
      form.handleSubmit()
    }}
  >
    <div>
      <form.Field name="fullName">
        {#snippet children(field)}
          <input
            name={field.name}
            value={field.state.value}
            onblur={field.handleBlur}
            oninput={(e) => field.handleChange(e.target.value)}
          />
        {/snippet}
      </form.Field>
    </div>
    <button type="submit">Submit</button>
  </form>
</div>
```

From here, you'll be ready to explore all of the other features of TanStack Form!
