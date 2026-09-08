# Validation — Displaying Errors

[Guide and prerequisites](./form-docs-framework-lit-guides-validation-md-a6031d73.md) · Release-matched documentation · `@tanstack/lit-form@1.25.5`.

## Displaying Errors

Once you have your validation in place, you can map the errors from an array to be displayed in your UI:

```ts
import { html, nothing } from 'lit'
;`${this.#form.field(
  {
    name: 'age',
    validators: {
      onChange: ({ value }) =>
        value < 13 ? 'You must be 13 to make an account' : undefined,
    },
  },
  (field) => {
    return html`
      <!-- ... -->
      ${!field.state.meta.isValid
        ? html`<em>${field.state.meta.errors.join(',')}</em>`
        : nothing}
    `
  },
)}`
```

Or use the `errorMap` property to access the specific error you're looking for:

```ts
import { html, nothing } from 'lit'
;`${this.#form.field(
  {
    name: 'age',
    validators: {
      onChange: ({ value }) =>
        value < 13 ? 'You must be 13 to make an account' : undefined,
    },
  },
  (field) => {
    return html`
      <!-- ... -->
      ${field.state.meta.errorMap['onChange']
        ? html`<em>${field.state.meta.errorMap['onChange']}</em>`
        : nothing}
    `
  },
)}`
```

It's worth mentioning that our `errors` array and the `errorMap` matches the types returned by the validators. This means that:

```ts
import { html, nothing } from 'lit'

;`${this.#form.field(
  {
    name: 'age',
    validators: {
      onChange: ({ value }) => (value < 13 ? { isOldEnough: false } : undefined),
    },
  },
  (field) => {
    return html`
      <!-- ... -->
      <!-- errorMap.onChange is type `{isOldEnough: false} | undefined` -->
      <!-- meta.errors is type `Array<{isOldEnough: false} | undefined>` -->
      ${!field.state.meta.errorMap['onChange']?.isOldEnough
        ? html`<em>The user is not old enough</em>`
        : nothing}
    `
  },
)}`
```
