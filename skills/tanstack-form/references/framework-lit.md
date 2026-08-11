# Lit adapter

Lit-specific setup and behavior.

<a id="source-form-docs-framework-lit-guides-arrays-md"></a>

## Arrays

Source: `form:docs/framework/lit/guides/arrays.md`.

TanStack Form supports arrays as values in a form, including sub-object values inside of an array.

### Basic Usage

To use an array, you can use `field.state.value` on an array value, as in:

```ts
export class TestForm extends LitElement {
  #form = new TanStackFormController(this, {
    defaultValues: {
      people: [] as Array<{ name: string; age: string }>,
    },
  })
  render() {
    return html`
      <form
        id="form"
        @submit=${(e: Event) => {
          e.preventDefault()
        }}
      >
        <h1>Please enter your details</h1>
        ${this.#form.field(
          {
            name: `people`,
          },
          (peopleField) => {
            return html`${repeat(
              peopleField.state.value,
              (_, index) => index,
              (_, index) => {
                return html` // ... `
              },
            )} `
          },
        )}
      </form>
    `
  }
}
```

This will generate the mapped HTML every time you run pushValue on the field:

```html
<div class="container">
  <button type="button" @click="${()" ="">
    { peopleField.pushValue({name: "",age: ""}) }}> Add Person
  </button>
</div>
```

Finally, you can use a subfield like so:

```ts
return html`
  ${this.#form.field(
    {
      name: `people[${index}].name`,
    },
    (field) => {
      return html`
        <input
          type="text"
          placeholder="Name"
          .value="${field.state.value}"
          @input="${(e: Event) => {
            const target = e.target as HTMLInputElement
            field.handleChange(target.value)
          }}"
        />
      `
    },
  )}
`
```

### Full Example

```typescript
export class TestForm extends LitElement {
  #form = new TanStackFormController(this, {
    defaultValues: {
      people: [] as Array<{ name: string }>,
    },
  });
  render() {
    return html`
      <form
        id="form"
        @submit=${(e: Event) => {
          e.preventDefault();
        }}
      >
        <h1>Please enter your details</h1>
        ${this.#form.field(
          {
            name: `people`,
          },
          (peopleField) => {
            return html`${repeat(
                peopleField.state.value,
                (_, index) => index,
                (_, index) => {
                  return html`
                    ${this.#form.field(
                      {
                        name: `people[${index}].name`,
                      },
                      (field) => {
                        return html` <div>
                          <div class="container">
                            <label>Name</label>
                            <input
                              type="text"
                              placeholder="Name"
                              .value="${field.state.value}"
                              @input="${(e: Event) => {
                                const target = e.target as HTMLInputElement;
                                field.handleChange(target.value);
                              }}"
                            />
                          </div>
                        </div>`;
                      }
                    )}
                  `;
                }
              )}

              <div class="container">
                <button
                  type="button"
                  @click=${() => {
                    peopleField.pushValue({
                      name: "",
                    });
                  }}
                >
                  Add Person
                </button>
              </div> `;
          }
        )}

        <div class="container">
          <button type="submit" ?disabled=${this.#form.api.state.isSubmitting}>
            ${this.#form.api.state.isSubmitting ? html` Submitting` : "Submit"}
          </button>
          <button
            type="button"
            id="reset"
            @click=${() => {
              this.#form.api.reset();
            }}
          >
            Reset
          </button>
        </div>
      </form>
    `;
  }

declare global {
  interface HTMLElementTagNameMap {
    "test-form": TestForm;
  }
}
```

<a id="source-form-docs-framework-lit-guides-basic-concepts-md"></a>

## Basic Concepts

Source: `form:docs/framework/lit/guides/basic-concepts.md`.

This page introduces the basic concepts and terminology used in the `@tanstack/lit-form` library. Familiarizing yourself with these concepts will help you better understand and work with the library and its usage with Lit.

### Form Options

You can create options for your form so that it can be shared between multiple forms by using the `formOptions` function.

For Example:

```tsx
const formOpts = formOptions({
  defaultValues: {
    firstName: '',
    lastName: '',
    employed: false,
    jobTitle: '',
  } as Employee,
})
```

### Form Instance

A Form Instance is an object that represents an individual form and provides methods and properties for working with the form. You create a form instance using the `TanStackFormController` interface provided by `@tanstack/lit-form`. The `TanStackFormController` is instantiated with the current form's (`this`) class and some default form options. It initializes the form state, handles form submission, and provides methods to manage form fields and their validation.

```tsx
#form = new TanStackFormController(this, {
  defaultValues: {
    firstName: '',
    lastName: '',
    employed: false,
    jobTitle: '',
  } as Employee,
})
```

You may also create a form instance without using `formOptions` by using the standalone `TanStackFormController` API:

```tsx
#form = new TanStackFormController(this, {
  ...formOpts,
})
```

### Field

A Field represents a single form input element, such as a text input or a checkbox. Fields are created using the `field(FieldOptions, callback)` provided by the form instance. The component accepts a `FieldOptions` object and a callback function that receives a `FieldApi` object. This object provides methods to get the current value of the field, handle input changes, and handle blur events.

For Example:

```ts
 ${this.#form.field(
    {
      name: `firstName`,
      validators: {
        onChange: ({ value }) =>
          value.length < 3 ? "Not long enough" : undefined,
        },
      },
      (field: FieldApi<Employee, "firstName">) => {
        return html` <div>
          <label class="first-name-label">First Name</label>
          <input
           id="firstName"
           type="text"
           class="first-name-input"
           placeholder="First Name"
           @blur="${() => field.handleBlur()}"
           .value="${field.state.value}"
           @input="${(event: InputEvent) => {
           if (event.currentTarget) {
            const newValue = (event.currentTarget as HTMLInputElement).value;
            field.handleChange(newValue);
           }
          }}"
        />
      </div>`;
    },
)}
```

### Field State

Each field has its own state, which includes its current value, validation status, error messages, and other metadata. You can access a field's state using its `field.state` property.

```ts
const {
  value,
  meta: { errors, isValidating },
} = field.state
```

There are four states in the metadata that can be useful to see how the user interacts with a field:

- _"isTouched"_, after the user changes the field or blurs the field
- _"isDirty"_, after the field's value has been changed, even if it's been reverted to the default. Opposite of `isPristine`
- _"isPristine"_, until the user changes the field value. Opposite of `isDirty`
- _"isBlurred"_, after the field has been blurred

```ts
const { isTouched, isDirty, isPristine, isBlurred } = field.state.meta
```

![Field states](./doc-assets/assets/field-states.png)

### Understanding 'isDirty' in Different Libraries

Non-Persistent `dirty` state

- **Libraries**: React Hook Form (RHF), Formik, Final Form.
- **Behavior**: A field is 'dirty' if its value differs from the default. Reverting to the default value makes it 'clean' again.

Persistent `dirty` state

- **Libraries**: Angular Form, Vue FormKit.
- **Behavior**: A field remains 'dirty' once changed, even if reverted to the default value.

We have chosen the persistent 'dirty' state model. To also support a non-persistent 'dirty' state, we introduce an additional flag:

- _"isDefaultValue"_, whether the field's current value is the default value

```ts
const { isDefaultValue, isTouched } = field.state.meta

// The following line will re-create the non-Persistent `dirty` functionality.
const nonPersistentIsDirty = !isDefaultValue
```

![Field states extended](./doc-assets/assets/field-states-extended.png)

<a id="source-form-docs-framework-lit-guides-dynamic-validation-md"></a>

## Dynamic Validation

Source: `form:docs/framework/lit/guides/dynamic-validation.md`.

In many cases, you want to change the validation rules based depending on the state of the form or other conditions. The most popular
example of this is when you want to validate a field differently based on whether the user has submitted the form for the first time or not.

We support this through our `onDynamic` validation function.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { TanStackFormController, revalidateLogic } from '@tanstack/lit-form'

@customElement('my-form')
export class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    // If this is omitted, onDynamic will not be called
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: ({ value }) => {
        if (!value.firstName) {
          return { firstName: 'A first name is required' }
        }
        return undefined
      },
    },
  })

  render() {
    return html`<!-- form content -->`
  }
}
```

> By default `onDynamic` is not called, so you need to pass `revalidateLogic()` to the `validationLogic` option of `useForm`.

### Revalidation Options

`revalidateLogic` allows you to specify when validation should be run and change the validation rules dynamically based on the current submission state of the form.

It takes two arguments:

- `mode`: The mode of validation prior to the first form submission. This can be one of the following:
  - `change`: Validate on every change.
  - `blur`: Validate on blur.
  - `submit`: Validate on submit. (**default**)

- `modeAfterSubmission`: The mode of validation after the form has been submitted. This can be one of the following:
  - `change`: Validate on every change. (**default**)
  - `blur`: Validate on blur.
  - `submit`: Validate on submit.

You can, for example, use the following to revalidate on blur after the first submission:

```ts
@customElement('my-form')
export class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
    // ...
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    // ...
  })
}
```

### Accessing Errors

Just as you might access errors from an `onChange` or `onBlur` validation, you can access the errors from the `onDynamic` validation function using the `form.api.state.errorMap` object.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { TanStackFormController, revalidateLogic } from '@tanstack/lit-form'

@customElement('my-form')
export class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
    // ...
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: ({ value }) => {
        if (!value.firstName) {
          return { firstName: 'A first name is required' }
        }
        return undefined
      },
    },
  })

  render() {
    return html`<p>${this.#form.api.state.errorMap.onDynamic?.firstName}</p>`
  }
}
```

### Usage with Other Validation Logic

You can use `onDynamic` validation alongside other validation logic, such as `onChange` or `onBlur`.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { TanStackFormController, revalidateLogic } from '@tanstack/lit-form'

@customElement('my-form')
export class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    validationLogic: revalidateLogic(),
    validators: {
      onChange: ({ value }) => {
        if (!value.firstName) {
          return { firstName: 'A first name is required' }
        }
        return undefined
      },
      onDynamic: ({ value }) => {
        if (!value.lastName) {
          return { lastName: 'A last name is required' }
        }
        return undefined
      },
    },
  })

  render() {
    return html`
      <div>
        <p>${this.#form.api.state.errorMap.onChange?.firstName}</p>
        <p>${this.#form.api.state.errorMap.onDynamic?.lastName}</p>
      </div>
    `
  }
}
```

#### Usage with Fields

You can also use `onDynamic` validation with fields, just like you would with other validation logic.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { TanStackFormController, revalidateLogic } from '@tanstack/lit-form'

@customElement('my-form')
export class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
    defaultValues: {
      name: '',
      age: 0,
    },
    validationLogic: revalidateLogic(),
    onSubmit({ value }) {
      alert(JSON.stringify(value))
    },
  })

  render() {
    return html`
      <form
        @submit=${(e: Event) => {
          e.preventDefault()
          e.stopPropagation()
          this.#form.api.handleSubmit()
        }}
      >
        ${this.#form.field(
          {
            name: 'age',
            validators: {
              onDynamic: ({ value }) =>
                value > 18 ? undefined : 'Age must be greater than 18',
            },
          },
          (field) => html`
            <div>
              <input
                type="number"
                .value=${field.state.value}
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement
                  field.handleChange(target.valueAsNumber)
                }}
                @blur=${() => field.handleBlur()}
              />
              <p style="color: red;">${field.state.meta.errorMap.onDynamic}</p>
            </div>
          `,
        )}
        <button type="submit">Submit</button>
      </form>
    `
  }
}
```

#### Async Validation

Async validation can also be used with `onDynamic` just like with other validation logic. You can even debounce the async validation to avoid excessive calls.

```ts
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { TanStackFormController, revalidateLogic } from '@tanstack/lit-form'

@customElement('my-form')
export class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
    defaultValues: {
      username: '',
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamicAsyncDebounceMs: 500, // Debounce the async validation by 500ms
      onDynamicAsync: async ({ value }) => {
        if (!value.username) {
          return { username: 'Username is required' }
        }
        // Simulate an async validation
        const isValid = await validateUsername(value.username)
        return isValid ? undefined : { username: 'Username is already taken' }
      },
    },
  })
}
```

#### Standard Schema Validation

You can also use standard schema validation libraries like Valibot or Zod with `onDynamic` validation. This allows you to define complex validation rules that can change dynamically based on the form state.

```ts
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { TanStackFormController, revalidateLogic } from '@tanstack/lit-form'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1, 'A first name is required'),
  lastName: z.string().min(1, 'A last name is required'),
})

@customElement('my-form')
export class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema,
    },
  })
}
```

<a id="source-form-docs-framework-lit-guides-form-composition-md"></a>

## Form Composition

Source: `form:docs/framework/lit/guides/form-composition.md`.

A common criticism of TanStack Form is its verbosity out-of-the-box. While this _can_ be useful for educational purposes — helping enforce understanding our APIs — it's not ideal in production use cases.

This guide covers the patterns that work well in Lit:

- Building reusable field UI as custom elements that accept the `FieldApi` as a property.
- Splitting big forms across multiple custom elements while keeping the `form` property fully typed via `getFormType`.

### Reusable field components with `AnyFieldApi`

The most direct way to share field UI across multiple forms in Lit is to write a custom element that accepts the `FieldApi` instance as a property. The `AnyFieldApi` type from `@tanstack/lit-form` gives you a "this is some field, I don't care about the exact generics" type that's perfect for that property.

Because the field is a property of the custom element rather than something the element owns, the host needs to subscribe to the field's store so it re-renders when the field's value or metadata change. The `TanStackStoreSelector` reactive controller from [`@tanstack/lit-store`](https://tanstack.com/store/latest/docs/framework/lit/quick-start) does exactly that.

```ts
// text-field.ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { TanStackStoreSelector } from '@tanstack/lit-store'
import type { AnyFieldApi } from '@tanstack/lit-form'

@customElement('text-field')
export class TextField extends LitElement {
  @property({ attribute: false })
  field!: AnyFieldApi

  @property({ type: String })
  label = ''

  // Re-render whenever this field's store updates.
  _selector = new TanStackStoreSelector(this, () => this.field?.store)

  render() {
    return html`
      <label>
        <div>${this.label}</div>
        <input
          .value=${String(this.field.state.value ?? '')}
          @blur=${() => this.field.handleBlur()}
          @input=${(e: Event) =>
            this.field.handleChange((e.target as HTMLInputElement).value)}
        />
      </label>
      ${this.field.state.meta.isTouched && this.field.state.meta.errors.length
        ? html`<div style="color: red">
            ${this.field.state.meta.errors.join(', ')}
          </div>`
        : ''}
    `
  }
}
```

Use it inside the `field` directive's render callback by passing the `field` instance as a property:

```ts
import { LitElement, html } from 'lit'
import { TanStackFormController } from '@tanstack/lit-form'
import './text-field.js'

export class AppForm extends LitElement {
  form = new TanStackFormController(this, {
    defaultValues: { firstName: '', lastName: '' },
  })

  render() {
    return html`
      ${this.form.field(
        { name: 'firstName' },
        (field) => html`
          <text-field label="First Name" .field=${field}></text-field>
        `,
      )}
      ${this.form.field(
        { name: 'lastName' },
        (field) => html`
          <text-field label="Last Name" .field=${field}></text-field>
        `,
      )}
    `
  }
}
```

The `field` parameter inside the render callback remains fully typed against the `name` you passed, so `field.state.value` and `field.handleChange` are still type-checked at the call site. `<text-field>` itself uses `AnyFieldApi` internally because it has to accept any field shape.

> If your reusable component only ever wraps fields of a specific value type (for example, only `string` fields), you can narrow the property type with the generic `FieldApi<...>` instead of `AnyFieldApi` — but `AnyFieldApi` is the easiest option to start with and matches how the directive is exposed in render callbacks elsewhere.

> `TanStackStoreSelector` accepts an optional second argument to scope what triggers a re-render — for example, `(snapshot) => snapshot.meta.errors`. Passing nothing re-renders on any change to the field's store, which is the simplest default.

### Breaking big forms into smaller pieces

Sometimes forms get very large. To keep things manageable, you can break a form across multiple custom elements that each receive the `TanStackFormController` as a property.

The challenge is typing that property correctly. Writing the full `TanStackFormController<…>` generics by hand is verbose and error-prone, so `@tanstack/lit-form` provides a `getFormType` helper.

`getFormType` is a type-only utility — it does no work at runtime — that takes the same `FormOptions` you'd pass to `new TanStackFormController(...)` and returns a value whose **type** matches the controller that those options would produce.

```ts
// shared-form.ts
import { formOptions } from '@tanstack/lit-form'

export const peopleFormOpts = formOptions({
  defaultValues: {
    firstName: 'John',
    lastName: 'Doe',
  },
})
```

Then derive the property type for a child custom element from those shared options. As with reusable field elements, the child element receives the controller as a property and won't re-render automatically when the form's state changes — wire it up with `TanStackStoreSelector` against `form.api.store`:

```ts
// child-form.ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { TanStackStoreSelector } from '@tanstack/lit-store'
import { getFormType } from '@tanstack/lit-form'
import { peopleFormOpts } from './shared-form.js'
import './text-field.js'

const formType = getFormType(peopleFormOpts)

@customElement('child-form')
export class ChildForm extends LitElement {
  @property({ attribute: false })
  form!: typeof formType

  @property({ type: String })
  title = 'Child Form'

  // Re-render when the form's state changes.
  _selector = new TanStackStoreSelector(this, () => this.form?.api.store)

  render() {
    return html`
      <p>${this.title}</p>
      ${this.form.field(
        { name: 'firstName' },
        (field) => html`
          <text-field label="First Name" .field=${field}></text-field>
        `,
      )}
    `
  }
}
```

And use it from the parent element by passing the controller as a property:

```ts
// app.ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { TanStackFormController } from '@tanstack/lit-form'
import { peopleFormOpts } from './shared-form.js'
import './child-form.js'

@customElement('app-root')
export class AppRoot extends LitElement {
  form = new TanStackFormController(this, peopleFormOpts)

  render() {
    return html`<child-form .form=${this.form} title="Testing"></child-form>`
  }
}
```

The child element gets a fully typed `form` property — including all of the `field` and `group` directives — without having to spell out the controller's generics by hand or maintain a hand-written type alias.

> `getFormType` only carries types; **never** call its return value at runtime. Use it as `typeof getFormType(opts)` (or assign to a `const` and use `typeof`) and pass the actual controller instance from the parent element via the `.form` property.

### Reusing groups of fields across multiple forms

The same pattern works for sharing a group of related fields (for example, a password + confirm-password pair) across forms. Define a small custom element that takes the `form` as a property typed with `getFormType` — keyed against just the slice of form data the group needs — and renders the relevant `form.field(...)` calls.

```ts
// password-fields.ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { TanStackStoreSelector } from '@tanstack/lit-store'
import { formOptions, getFormType } from '@tanstack/lit-form'
import './text-field.js'

const passwordFormOpts = formOptions({
  defaultValues: {
    password: '',
    confirm_password: '',
  },
})

const passwordFormType = getFormType(passwordFormOpts)

@customElement('password-fields')
export class PasswordFields extends LitElement {
  @property({ attribute: false })
  form!: typeof passwordFormType

  _selector = new TanStackStoreSelector(this, () => this.form?.api.store)

  render() {
    return html`
      ${this.form.field(
        { name: 'password' },
        (field) => html`
          <text-field label="Password" .field=${field}></text-field>
        `,
      )}
      ${this.form.field(
        {
          name: 'confirm_password',
          validators: {
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) =>
              value !== fieldApi.form.getFieldValue('password')
                ? 'Passwords do not match'
                : undefined,
          },
        },
        (field) => html`
          <text-field label="Confirm Password" .field=${field}></text-field>
        `,
      )}
    `
  }
}
```

The host form just needs to include the same fields in its own `defaultValues` (TypeScript will check that the `form` property assigned via `.form=${this.form}` is structurally compatible with `passwordFormType`).

<a id="source-form-docs-framework-lit-guides-form-groups-md"></a>

## Form Groups

Source: `form:docs/framework/lit/guides/form-groups.md`.

When building a multi-stage form that has many stages, like so:

![Form stepper](./doc-assets/assets/stepper.png)

It's common for each step to have its own form. However, this complicates the form submission and validation process by requiring you to add complex logic.

Luckily, TanStack Form provides a way to build out sub-forms that make this kind of development trivial to implement: `form.group(...)`.

### Usage

To use a form group in TanStack Form, you'll create a `TanStackFormController`, then use its `group` directive like you would use its `field` directive:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { TanStackFormController } from '@tanstack/lit-form'

@customElement('my-form')
export class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
    defaultValues: {
      step1: {
        name: '',
      },
      step2: {
        age: 0,
      },
    },
  })

  render() {
    return html`
      ${this.#form.group({ name: 'step1' }, (group) => {
        // `group` here has all of the form-like methods you'd expect like `deleteField` or `insertFieldValue`
        // ...
        return html``
      })}
    `
  }
}
```

This becomes much more useful when paired with external state to conditionally render a form group:

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { TanStackFormController } from '@tanstack/lit-form'

@customElement('my-form')
export class MyForm extends LitElement {
  @state()
  private step = 0

  #form = new TanStackFormController(this, {
    defaultValues: {
      step1: {
        name: '',
      },
      step2: {
        age: 0,
      },
    },
  })

  render() {
    return html`
      ${this.step === 0
        ? this.#form.group(
            {
              name: 'step1',
              onGroupSubmit: () => {
                // We can move the step forward when validation passes
                this.step++
              },
              onGroupSubmitInvalid: () => {
                // Or handle invalid submissions, just like a top-level form
              },
              onSubmitMeta: {} as SomeType,
            },
            (group) => html`
              <form
                @submit=${(e: Event) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Use `group.handleSubmit()` to submit the sub-form, but not the parent form
                  group.handleSubmit()
                }}
              >
                ${this.#form.field(
                  { name: 'step1.name' },
                  (field) => html`<!-- ... -->`,
                )}
              </form>
            `,
          )
        : nothing}
      ${this.step === 1
        ? this.#form.group(
            {
              name: 'step2',
              onGroupSubmit: () => {
                // Then, use `this.#form.api.handleSubmit()` to submit the entire form
                this.#form.api.handleSubmit()
              },
            },
            (group) => html`
              <form
                @submit=${(e: Event) => {
                  e.preventDefault()
                  e.stopPropagation()
                  group.handleSubmit()
                }}
              >
                ${this.#form.field(
                  { name: 'step2.age' },
                  (field) => html`<!-- ... -->`,
                )}
              </form>
            `,
          )
        : nothing}
    `
  }
}
```

When you split each step into its own custom element, pass the `TanStackFormController` as a property and type it with [`getFormType`](./framework-lit.md#source-form-docs-framework-lit-guides-form-composition-md). Because Lit child elements that receive a controller by property do not automatically re-render when the controller state changes, subscribe to `form.api.store` with `TanStackStoreSelector` in the child element.

### Form Group Validation

Form groups have a distinct validation procedure that we think makes sense for sub-forms:

- Form groups can have their own validation:

```ts
${this.#form.group(
  { name: 'step1', validators: { onChange: () => 'Error' } },
  (group) => html`
    <!-- group.state.meta.errorMap // {onChange: "Error" | undefined} -->
    <!-- group.state.meta.errors // ("Error")[] -->
  `,
)}
```

- Can set errors on sub-fields:

```ts
${this.#form.group(
  {
    name: 'step1',
    validators: {
      onChange: ({ value, groupApi }) => ({
        group: value.name === 'error' ? 'Group error' : undefined,
        fields: {
          // Must use the name of the field relative to the form group as the error key,
          // to stay consistent with how standard schema works with form groups
          name: value.name === 'error' ? 'Field error' : undefined,
        },
      }),
    },
  },
  (group) => html`<!-- ... -->`,
)}
```

- And can even accept standard schemas:

```ts
${this.#form.group(
  {
    name: 'step1',
    validators: {
      onChange: z.object({
        name: z.string().min(2),
      }),
    },
  },
  (group) => html`<!-- ... -->`,
)}
```

> The reason we don't use the full path names for fields is so that you can compose your schemas like so:
>
> ```ts
> const step1Schema = z.object({
>   name: z.string().min(2),
> })
>
> const schema = z.object({
>   step1: step1Schema,
>   step2: step2Schema,
> })
> ```
>
> And pass the `step1Schema` to a form group and `schema` to the parent form. That way, partially validated data will still flag errors if the group is bypassed.

#### Dynamic Group Validation

If you want to use [dynamic validation (`onDynamic`)](./framework-lit.md#source-form-docs-framework-lit-guides-dynamic-validation-md) with a form group, do not rely on the `onDynamic` validator passed to `TanStackFormController`:

```ts
#form = new TanStackFormController(this, {
  validationLogic: revalidateLogic(),
  validators: {
    // This validator will not run `onChange` when a sub-form is submitted;
    // it will only run `onChange` when the form itself is submitted.
    onDynamic: schema,
  },
})
```

Instead, pass your sub-schema for the group to the `onDynamic` validation of the group itself:

```ts
${this.#form.group(
  { name: 'step1', validators: { onDynamic: step1Schema } },
  (group) => html`<!-- ... -->`,
)}
```

It will treat `group.submissionAttempts` as the way to change what validator is run before/after submit.

### Form Group State

Just like you're able to access `group.state.meta.errors`, you're also able to access the group's value using `group.state.value`. Likewise, here are some valuable properties you can access in the `group.state.meta`:

- `group.state.meta.isFieldsValid`: `true` when the field-level validators have no errors
- `group.state.meta.isGroupValid`: `true` when the group-level validators have no errors
- `group.state.meta.isValid`: `true` when both the field-level and group-level validators have no errors
- `group.state.meta.isSubmitting`: `true` when the group is in the process of being submitted

<a id="source-form-docs-framework-lit-guides-validation-md"></a>

## Validation

Source: `form:docs/framework/lit/guides/validation.md`.

At the core of TanStack Form's functionalities is the concept of validation. TanStack Form makes validation highly customizable:

- You can control when to perform the validation (on change, on input, on blur, on submit...)
- Validation rules can be defined at the field level or at the form level
- Validation can be synchronous or asynchronous (for example, as a result of an API call)

### When is validation performed?

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

### Displaying Errors

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

### Validation at field level vs at form level

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

#### Setting field-level errors from the form's validators

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

### Asynchronous Functional Validation

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

#### Built-in Debouncing

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

### Validation through Schema Libraries

While functions provide more flexibility and customization over your validation, they can be a bit verbose. To help solve this, there are libraries that provide schema-based validation to make shorthand and type-strict validation substantially easier. You can also define a single schema for your entire form and pass it to the form level, errors will be automatically propagated to the fields.

#### Standard Schema Libraries

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

### Preventing invalid forms from being submitted

The `onChange`, `onBlur` etc... callbacks are also run when the form is submitted and the submission is blocked if the form is invalid.

The form state object has a `canSubmit` flag that is false when any field is invalid and the form has been touched (`canSubmit` is true until the form has been touched, even if some fields are "technically" invalid based on their `onChange`/`onBlur` props).

You can access this flag via `this.#form.api.state` and use the value in order to, for example, disable the submit button when the form is invalid (in practice, disabled buttons are not accessible, use `aria-disabled` instead).

```ts
class MyForm extends LitElement {
  #form = new TanStackFormController(this, {
    /* ... */
  })

  render() {
    return html`
      <!-- ... -->

      <!-- Dynamic submit button -->
      <button type="submit" ?disabled="${!this.#form.api.state.canSubmit}">
        ${this.#form.api.state.isSubmitting ? '...' : 'Submit'}
      </button>
    `
  }
}
```

To prevent the form from being submitted before any interaction, combine `canSubmit` with `isPristine` flags. A simple condition like `!canSubmit || isPristine` effectively disables submissions until the user has made changes.

<a id="source-form-docs-framework-lit-quick-start-md"></a>

## Quick Start

Source: `form:docs/framework/lit/quick-start.md`.

The bare minimum to get started with TanStack Form is to create a `TanstackFormController` as seen below with the `Employee` interface for our test form:

```ts
interface Employee {
  firstName: string
  lastName: string
  employed: boolean
  jobTitle: string
}

#form = new TanStackFormController()<Employee>(this, {
  defaultValues: {
    firstName: '',
    lastName: '',
    employed: false,
    jobTitle: '',
  },
})
```

In this example `this` references the instance of your `LitElement` in which you want to use TanStack Form.

To wire a form element in your template up with TanStack Form, use the `field` method of `TanstackFormController`.

The first parameter of `field` is `FieldOptions` and the second is callback to render your element.

```ts
field(FieldOptions, callback)
```

Our completed test form should look something like below. The form collects first name from a user input field:

```ts
export class TestForm extends LitElement {
  #form = new TanStackFormController<Employee>(this, {
    defaultValues: {
      firstName: '',
      lastName: '',
      employed: false,
      jobTitle: '',
    },
  })
  render() {
    return html` <p>Please enter your first name</p>
      ${this.#form.field(
        {
          name: `firstName`,
          validators: {
            onChange: ({ value }) =>
              value.length < 3 ? 'Not long enough' : undefined,
          },
        },
        (field: FieldApi<Employee, 'firstName'>) => {
          return html` <div>
            <label class="first-name-label">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              @blur="${() => field.handleBlur()}"
              .value="${field.state.value}"
              @input="${(event: InputEvent) => {
                if (event.currentTarget) {
                  const newValue = (event.currentTarget as HTMLInputElement)
                    .value
                  field.handleChange(newValue)
                }
              }}"
            />
          </div>`
        },
      )}`
  }
}
```

Be aware that you need
to handle updating the element and form yourself as seen in the example above.
