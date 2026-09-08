# Validation — Displaying Errors

[Guide and prerequisites](./form-docs-framework-solid-guides-validation-md-c9d470ce.md) · Release-matched documentation · `@tanstack/solid-form@1.33.5`.

## Displaying Errors

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
