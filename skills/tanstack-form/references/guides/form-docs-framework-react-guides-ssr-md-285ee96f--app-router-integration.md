# Ssr — App Router integration

[Guide and prerequisites](./form-docs-framework-react-guides-ssr-md-285ee96f.md) · Release-matched documentation · `@tanstack/react-form@1.33.5`.

## App Router integration

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
