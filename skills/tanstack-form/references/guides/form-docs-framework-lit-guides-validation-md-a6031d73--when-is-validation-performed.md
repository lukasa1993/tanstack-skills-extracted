# Validation — When is validation performed?

[Guide and prerequisites](./form-docs-framework-lit-guides-validation-md-a6031d73.md) · Release-matched documentation · `@tanstack/lit-form@1.25.5`.

## When is validation performed?

It's up to you! The `field()` method accepts some callbacks as validators such as `onChange` or `onBlur`. Those callbacks are passed the current value of the field, as well as the fieldAPI object, so that you can perform the validation. If you find a validation error, simply return the error message as string and it will be available in `field.state.meta.errors`.

Here is an example:

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
      <label for="${field.name}">Age:</label>
      <input
        id="${field.name}"
        name="${field.name}"
        .value="${field.state.value}"
        type="number"
        @input="${(e: Event) => {
          const target = e.target as HTMLInputElement
          field.handleChange(target.valueAsNumber)
        }}"
      />
      ${!field.state.meta.isValid
        ? html`<em role="alert">${field.state.meta.errors.join(', ')}</em>`
        : nothing}
    `
  },
)}`
```

In the example above, the validation is done at each keystroke (`onChange`). If, instead, we wanted the validation to be done when the field is blurred, we would change the code above like so:

```ts
import { html, nothing } from 'lit'
;`${this.#form.field(
  {
    name: 'age',
    validators: {
      onBlur: ({ value }) =>
        value < 13 ? 'You must be 13 to make an account' : undefined,
    },
  },
  (field) => {
    return html`
      <label for="${field.name}">Age:</label>
      <input
        id="${field.name}"
        name="${field.name}"
        .value="${field.state.value}"
        type="number"
        @blur="${() => field.handleBlur()}"
        @input="${(e: Event) => {
          const target = e.target as HTMLInputElement
          field.handleChange(target.valueAsNumber)
        }}"
      />
      ${!field.state.meta.isValid
        ? html`<em role="alert">${field.state.meta.errors.join(', ')}</em>`
        : nothing}
    `
  },
)}`
```

So you can control when the validation is done by implementing the desired callback. You can even perform different pieces of validation at different times:

```ts
import { html, nothing } from 'lit'
;`${this.#form.field(
  {
    name: 'age',
    validators: {
      onChange: ({ value }) =>
        value < 13 ? 'You must be 13 to make an account' : undefined,
      onBlur: ({ value }) => (value < 0 ? 'Invalid value' : undefined),
    },
  },
  (field) => {
    return html`
      <label for="${field.name}">Age:</label>
      <input
        id="${field.name}"
        name="${field.name}"
        .value="${field.state.value}"
        type="number"
        @blur="${() => field.handleBlur()}"
        @input="${(e: Event) => {
          const target = e.target as HTMLInputElement
          field.handleChange(target.valueAsNumber)
        }}"
      />
      ${!field.state.meta.isValid
        ? html`<em role="alert">${field.state.meta.errors.join(', ')}</em>`
        : nothing}
    `
  },
)}`
```

In the example above, we are validating different things on the same field at different times (at each keystroke and when blurring the field). Since `field.state.meta.errors` is an array, all the relevant errors at a given time are displayed. You can also use `field.state.meta.errorMap` to get errors based on _when_ the validation was done (onChange, onBlur etc...). More info about displaying errors below.
