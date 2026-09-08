# Ssr — Using TanStack Form in TanStack Start

[Guide and prerequisites](./form-docs-framework-react-guides-ssr-md-285ee96f.md) · Release-matched documentation · `@tanstack/react-form@1.33.5`.

## Using TanStack Form in TanStack Start

This section focuses on integrating TanStack Form with TanStack Start.

### TanStack Start Prerequisites

- Start a new `TanStack Start` project, following the steps in the [TanStack Start Quickstart Guide](https://tanstack.com/router/latest/docs/framework/react/guide/tanstack-start)
- Install `@tanstack/react-form`

### Start integration

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
