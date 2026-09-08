# Validation — Validation through Schema Libraries

[Guide and prerequisites](./form-docs-framework-lit-guides-validation-md-a6031d73.md) · Release-matched documentation · `@tanstack/lit-form@1.25.5`.

## Validation through Schema Libraries

While functions provide more flexibility and customization over your validation, they can be a bit verbose. To help solve this, there are libraries that provide schema-based validation to make shorthand and type-strict validation substantially easier. You can also define a single schema for your entire form and pass it to the form level, errors will be automatically propagated to the fields.

### Standard Schema Libraries

TanStack Form natively supports all libraries following the [Standard Schema specification](https://github.com/standard-schema/standard-schema), most notably:

- [Zod](https://zod.dev/)
- [Valibot](https://valibot.dev/)
- [ArkType](https://arktype.io/)
- [Effect/Schema](https://effect.website/docs/schema/standard-schema/)

_Note:_ make sure to use the latest version of the schema libraries as older versions might not support Standard Schema yet.

> Validation will not provide you with transformed values. Use submission handling (docs pending).

To use schemas from these libraries you can pass them to the `validators` props as you would do with a custom function:

```ts
import { z } from 'zod'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { TanStackFormController } from '@tanstack/lit-form'

const userSchema = z.object({
  age: z.number().gte(13, 'You must be 13 to make an account'),
})

@customElement('my-form')
export class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
    defaultValues: {
      age: 0,
    },
    validators: {
      onChange: userSchema,
    },
  })

  render() {
    return html`
      <div>
        ${this.#form.field({ name: 'age' }, (field) => {
          return html`<!-- ... -->`
        })}
      </div>
    `
  }
}
```

Async validations on form and field level are supported as well:

```ts
import { html } from 'lit'
import { z } from 'zod'

${this.#form.field(
  {
    name: 'age',
    validators: {
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
    },
  },
  (field) => {
    return html`<!-- ... -->`
  },
)}
```

If you need even more control over your Standard Schema validation, you can combine a Standard Schema with a callback function like so:

```ts
import { html } from 'lit'
import { z } from 'zod'

${this.#form.field(
  {
    name: 'age',
    asyncDebounceMs: 500,
    validators: {
      onChangeAsync: async ({ value, fieldApi }) => {
        const errors = fieldApi.parseValueWithSchema(
          z.number().gte(13, 'You must be 13 to make an account'),
        )
        if (errors) return errors
        // continue with your validation
      },
    },
  },
  (field) => {
    return html`<!-- ... -->`
  },
)}
```
