# Ssr — Remix integration

[Guide and prerequisites](./form-docs-framework-react-guides-ssr-md-285ee96f.md) · Release-matched documentation · `@tanstack/react-form@1.33.5`.

## Remix integration

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
