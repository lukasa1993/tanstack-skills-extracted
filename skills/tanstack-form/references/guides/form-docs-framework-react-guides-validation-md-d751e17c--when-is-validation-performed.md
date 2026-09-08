# Validation — When is validation performed?

[Guide and prerequisites](./form-docs-framework-react-guides-validation-md-d751e17c.md) · Release-matched documentation · `@tanstack/react-form@1.33.5`.

## When is validation performed?

It's up to you! The `<Field />` component accepts some callbacks as props such as `onChange` or `onBlur`. Those callbacks are passed the current value of the field, as well as the `fieldApi` object, so that you can perform the validation. If you find a validation error, simply return the error message as a string, and it will be available in `field.state.meta.errors`.

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
      <label htmlFor={field.name}>Age:</label>
      <input
        id={field.name}
        name={field.name}
        value={field.state.value}
        type="number"
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      />
      {!field.state.meta.isValid && (
        <em role="alert">{field.state.meta.errors.join(', ')}</em>
      )}
    </>
  )}
</form.Field>
```

In the example above, the validation is done at each keystroke (`onChange`). If, instead, we wanted the validation to be done when the field is blurred, we would change the code above like so:

```tsx
<form.Field
  name="age"
  validators={{
    onBlur: ({ value }) =>
      value < 13 ? 'You must be 13 to make an account' : undefined,
  }}
>
  {(field) => (
    <>
      <label htmlFor={field.name}>Age:</label>
      <input
        id={field.name}
        name={field.name}
        value={field.state.value}
        type="number"
        // Listen to the onBlur event on the field
        onBlur={field.handleBlur}
        // We always need to implement onChange, so that TanStack Form receives the changes
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      />
      {!field.state.meta.isValid && (
        <em role="alert">{field.state.meta.errors.join(', ')}</em>
      )}
    </>
  )}
</form.Field>
```

So, you can control when the validation is done by implementing the desired callback. You can even perform different pieces of validation at different times:

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
      <label htmlFor={field.name}>Age:</label>
      <input
        id={field.name}
        name={field.name}
        value={field.state.value}
        type="number"
        // Listen to the onBlur event on the field
        onBlur={field.handleBlur}
        // We always need to implement onChange, so that TanStack Form receives the changes
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      />
      {!field.state.meta.isValid && (
        <em role="alert">{field.state.meta.errors.join(', ')}</em>
      )}
    </>
  )}
</form.Field>
```

In the example above, we are validating different things on the same field at different times (at each keystroke and when blurring the field). Since `field.state.meta.errors` is an array, all the relevant errors at a given time are displayed. You can also use `field.state.meta.errorMap` to get errors based on _when_ the validation was done (onChange, onBlur, etc.). More information about displaying errors is below.
