# Validation — Validation at field level vs at form level

[Guide and prerequisites](./form-docs-framework-solid-guides-validation-md-c9d470ce.md) · Release-matched documentation · `@tanstack/solid-form@1.33.5`.

## Validation at field level vs at form level

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

### Setting field-level errors from the form's validators

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
