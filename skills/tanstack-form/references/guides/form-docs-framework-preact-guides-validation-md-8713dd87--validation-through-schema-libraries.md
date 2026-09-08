# Validation — Validation through Schema Libraries

[Guide and prerequisites](./form-docs-framework-preact-guides-validation-md-8713dd87.md) · Release-matched documentation · `@tanstack/preact-form@1.30.5`.

## Validation through Schema Libraries

While functions provide more flexibility and customization over your validation, they can be a bit verbose. To help solve this, there are libraries that provide schema-based validation to make shorthand and type-strict validation substantially easier. You can also define a single schema for your entire form and pass it to the form-level validators; errors will automatically propagate to the fields.

### Standard Schema Libraries

TanStack Form natively supports all libraries following the [Standard Schema specification](https://github.com/standard-schema/standard-schema), most notably:

- [Zod](https://zod.dev/)
- [Valibot](https://valibot.dev/)
- [ArkType](https://arktype.io/)
- [Effect/Schema](https://effect.website/docs/schema/standard-schema/)

_Note:_ make sure to use the latest version of the schema libraries as older versions might not support Standard Schema yet.

> Validation will not provide you with transformed values. See [submission handling](./form-docs-framework-preact-guides-submission-handling-md-d9c8da17.md#source-form-docs-framework-preact-guides-submission-handling-md) for more information.

To use schemas from these libraries you can pass them to the `validators` props as you would do with a custom function:

```tsx
const userSchema = z.object({
  age: z.number().gte(13, 'You must be 13 to make an account'),
})

function App() {
  const form = useForm({
    defaultValues: {
      age: 0,
    },
    validators: {
      onChange: userSchema,
    },
  })
  return (
    <div>
      <form.Field
        name="age"
        children={(field) => {
          return <>{/* ... */}</>
        }}
      />
    </div>
  )
}
```

Async validators at the form- and field-level are supported as well:

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
  asyncDebounceMs={500}
  validators={{
    onChangeAsync: async ({ value, fieldApi }) => {
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
