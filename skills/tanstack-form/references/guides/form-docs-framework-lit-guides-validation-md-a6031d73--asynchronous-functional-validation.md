# Validation — Asynchronous Functional Validation

[Guide and prerequisites](./form-docs-framework-lit-guides-validation-md-a6031d73.md) · Release-matched documentation · `@tanstack/lit-form@1.25.5`.

## Asynchronous Functional Validation

While we suspect most validations will be synchronous, there are many instances where a network call or some other async operation would be useful to validate against.

To do this, we have dedicated `onChangeAsync`, `onBlurAsync`, and other methods that can be used to validate against:

```ts
import { html, nothing } from 'lit'
;`${this.#form.field(
  {
    name: 'age',
    validators: {
      onChangeAsync: async ({ value }) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return value < 13 ? 'You must be 13 to make an account' : undefined
      },
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

Synchronous and Asynchronous validations can coexist. For example, it is possible to define both `onBlur` and `onBlurAsync` on the same field:

```ts
import { html, nothing } from 'lit'
;`${this.#form.field(
  {
    name: 'age',
    validators: {
      onBlur: ({ value }) =>
        value < 13 ? 'You must be at least 13' : undefined,
      onBlurAsync: async ({ value }) => {
        const currentAge = await fetchCurrentAgeOnProfile()
        return value < currentAge ? 'You can only increase the age' : undefined
      },
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

The synchronous validation method (`onBlur`) is run first and the asynchronous method (`onBlurAsync`) is only run if the synchronous one (`onBlur`) succeeds. To change this behaviour, set the `asyncAlways` option to `true`, and the async method will be run regardless of the result of the sync method.

### Built-in Debouncing

While async calls are the way to go when validating against the database, running a network request on every keystroke is a good way to DDOS your database.

Instead, we enable an easy method for debouncing your `async` calls by adding a single property:

```ts
;`${this.#form.field(
  {
    name: 'age',
    asyncDebounceMs: 500,
    validators: {
      onChangeAsync: async ({ value }) => {
        // ...
      },
    },
  },
  (field) => {
    return html`<!-- ... -->`
  },
)}`
```

This will debounce every async call with a 500ms delay. You can even override this property on a per-validation property:

```ts
;`${this.#form.field(
  {
    name: 'age',
    asyncDebounceMs: 500,
    validators: {
      onChangeAsyncDebounceMs: 1500,
      onChangeAsync: async ({ value }) => {
        // ...
      },
      onBlurAsync: async ({ value }) => {
        // ...
      },
    },
  },
  (field) => {
    return html`<!-- ... -->`
  },
)}`
```

This will run `onChangeAsync` every 1500ms while `onBlurAsync` will run every 500ms.
