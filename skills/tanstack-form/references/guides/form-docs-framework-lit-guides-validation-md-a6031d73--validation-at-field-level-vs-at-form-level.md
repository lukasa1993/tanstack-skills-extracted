# Validation — Validation at field level vs at form level

[Guide and prerequisites](./form-docs-framework-lit-guides-validation-md-a6031d73.md) · Release-matched documentation · `@tanstack/lit-form@1.25.5`.

## Validation at field level vs at form level

As shown above, each field accepts its own validation rules via the `onChange`, `onBlur` etc... callbacks. It is also possible to define validation rules at the form level (as opposed to field by field) by passing similar callbacks to the `TanStackFormController` constructor.

Example:

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement } from 'lit/decorators.js'
import { TanStackFormController } from '@tanstack/lit-form'

@customElement('my-form')
export class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
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
  })

  render() {
    return html`
      <div>
        <!-- ... -->
        ${this.#form.api.state.errorMap.onChange
          ? html`
              <div>
                <em
                  >There was an error on the form:
                  ${this.#form.api.state.errorMap.onChange}</em
                >
              </div>
            `
          : nothing}
        <!-- ... -->
      </div>
    `
  }
}
```

### Setting field-level errors from the form's validators

You can set errors on the fields from the form's validators. One common use case for this is validating all the fields on submit by calling a single API endpoint in the form's `onSubmitAsync` validator.

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement } from 'lit/decorators.js'
import { TanStackFormController } from '@tanstack/lit-form'

@customElement('my-form')
export class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
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
        const hasErrors = await verifyDataOnServer(value)
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
  })

  render() {
    return html`
      <div>
        <form
          @submit="${(e: Event) => {
            e.preventDefault()
            e.stopPropagation()
            this.#form.api.handleSubmit()
          }}"
        >
          ${this.#form.field(
            { name: 'age' },
            (field) => html`
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
                ? html`<em role="alert"
                    >${field.state.meta.errors.join(', ')}</em
                  >`
                : nothing}
            `,
          )}
          ${this.#form.api.state.errorMap.onSubmit
            ? html`
                <div>
                  <em
                    >There was an error on the form:
                    ${this.#form.api.state.errorMap.onSubmit}</em
                  >
                </div>
              `
            : nothing}
          <!--...-->
        </form>
      </div>
    `
  }
}
```

> Something worth mentioning is that if you have a form validation function that returns an error, that error may be overwritten by the field-specific validation.
>
> This means that:
>
> ```ts
> const form = new TanStackFormController(this, {
>   defaultValues: {
>     age: 0,
>   },
>   validators: {
>     onChange: ({ value }) => {
>       return {
>         fields: {
>           age: value.age < 12 ? 'Too young!' : undefined,
>         },
>       }
>     },
>   },
> })
>
> // ...
>
> return html`
>   ${this.#form.field(
>     {
>       name: 'age',
>       validators: {
>         onChange: ({ value }) =>
>           value % 2 === 0 ? 'Must be odd!' : undefined,
>       },
>     },
>     () => html`<!-- ... -->`,
>   )}
> `
> ```
>
> Will only show `'Must be odd!` even if the 'Too young!' error is returned by the form-level validation.
