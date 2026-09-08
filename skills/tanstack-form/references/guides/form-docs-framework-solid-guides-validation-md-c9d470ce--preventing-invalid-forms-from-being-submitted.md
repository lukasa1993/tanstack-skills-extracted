# Validation — Preventing invalid forms from being submitted

[Guide and prerequisites](./form-docs-framework-solid-guides-validation-md-c9d470ce.md) · Release-matched documentation · `@tanstack/solid-form@1.33.5`.

## Preventing invalid forms from being submitted

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
