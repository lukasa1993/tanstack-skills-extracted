# Angular adapter

Angular-specific setup and behavior.

<a id="source-form-docs-framework-angular-guides-arrays-md"></a>

## Arrays

Source: `form:docs/framework/angular/guides/arrays.md`.

TanStack Form supports arrays as values in a form, including sub-object values inside of an array.

### Basic Usage

To use an array, you can use `field.api.state.value` on an array value:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="people"
      mode="array"
      #people="field"
    >
      <div>
        @for (_ of people.api.state.value; track $index) {
          <!-- ... -->
        }
      </div>
    </ng-container>
  `,
})
export class AppComponent {
  form = injectForm({
    defaultValues: {
      people: [] as Array<{ name: string; age: number }>,
    },
    onSubmit({ value }) {
      alert(JSON.stringify(value))
    },
  })
}
```

This will generate the mapped JSX every time you run `pushValue` on `field`:

```angular-html
<button (click)="people.api.pushValue(defaultPerson)" type="button">
  Add person
</button>
```

Finally, you can use a subfield like so:

```angular-html
<ng-container
  [tanstackField]="form"
  [name]="getPeopleName($index)"
  #person="field"
>
  <div>
    <label>
      <div>Name for person {{ $index }}</div>
      <input
        [value]="person.api.state.value"
        (input)="person.api.handleChange($any($event).target.value)"
      />
    </label>
  </div>
</ng-container>
```

Where `getPeopleName` is a method on the class like so:

```typescript
export class AppComponent {
  getPeopleName = (idx: number) => `people[${idx}].name` as const

  // ...
}
```

> While it's unfortunate that you need to use a function to get the field name, it's a requirement for how our strict TypeScript types work.
>
> See, if we did the following:
>
> ```angular-html
> <ng-container
>   [tanstackField]="form"
>   [name]="'people[' + $index + '].name'"
> ></ng-container>
> ```
>
> We'd be running into a TypeScript issue where `"one" + "two"` is `string` rather than the required `"onetwo"` type
>
> Moreover, while Angular supports template literals in the template, they may not contain dynamic interpolation within them, such as our `$index` argument.

> It's possible that we've missed something! If you can think of a better fix for this problem, [drop us a line on our GitHub discussions](https://github.com/TanStack/form/discussions).

### Full Example

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <form (submit)="handleSubmit($event)">
      <div>
        <ng-container
          [tanstackField]="form"
          name="people"
          mode="array"
          #people="field"
        >
          <div>
            @for (_ of people.api.state.value; track $index) {
              <ng-container
                [tanstackField]="form"
                [name]="getPeopleName($index)"
                #person="field"
              >
                <div>
                  <label>
                    <div>Name for person {{ $index }}</div>
                    <input
                      [value]="person.api.state.value"
                      (input)="
                        person.api.handleChange($any($event).target.value)
                      "
                    />
                  </label>
                </div>
              </ng-container>
            }
          </div>
          <button (click)="people.api.pushValue(defaultPerson)" type="button">
            Add person
          </button>
        </ng-container>
      </div>
      <button type="submit" [disabled]="!canSubmit()">
        {{ isSubmitting() ? '...' : 'Submit' }}
      </button>
    </form>
  `,
})
export class AppComponent {
  defaultPerson = { name: '', age: 0 }

  form = injectForm({
    defaultValues: {
      people: [] as Array<{ name: string; age: number }>,
    },
    onSubmit({ value }) {
      alert(JSON.stringify(value))
    },
  })

  getPeopleName = (idx: number) => `people[${idx}].name` as const

  canSubmit = injectStore(this.form, (state) => state.canSubmit)
  isSubmitting = injectStore(this.form, (state) => state.isSubmitting)

  handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.form.handleSubmit()
  }
}
```

<a id="source-form-docs-framework-angular-guides-basic-concepts-md"></a>

## Basic Concepts

Source: `form:docs/framework/angular/guides/basic-concepts.md`.

This page introduces the basic concepts and terminology used in the `@tanstack/angular-form` library. Familiarizing yourself with these concepts will help you better understand and work with the library.

### Form Instance

A Form Instance is an object that represents an individual form and provides methods and properties for working with the form. You create a form instance using the `injectForm` function. The hook accepts an object with an `onSubmit` function, which is called when the form is submitted.

```typescript
const form = injectForm({
  onSubmit: async ({ value }) => {
    // Do something with form data
    console.log(value)
  },
})
```

### Field

A Field represents a single form input element, such as a text input or a checkbox. Fields are created using the `tanstackField` directive. The directive accepts a name prop, which should match a key in the form's default values. It also exposes a `field` named instance of the directive's internals that should be used via a template variable to access the field's internals.

Example:

```html
<ng-container [tanstackField]="form" name="firstName" #firstName="field">
  <input
    [value]="firstName.api.state.value"
    (blur)="firstName.api.handleBlur()"
    (input)="firstName.api.handleChange($any($event).target.value)"
  />
</ng-container>
```

### Field State

Each field has its own state, which includes its current value, validation status, error messages, and other metadata. You can access a field's state using the `fieldApi.state` property.

Example:

```ts
const {
  value,
  meta: { errors, isValidating },
} = field.state
```

There are four states in the metadata that can be useful to see how the user interacts with a field:

- _"isTouched"_, after the user changes the field or blurs the field
- _"isDirty"_, after the field's value has been changed, even if it's been reverted to the default. Opposite of _"isPristine"_
- _"isPristine"_, until the user changes the field value. Opposite of _"isDirty"_
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

### Field API

The Field API is an object accessed in the `tanstackField.api` property when creating a field. It provides methods for working with the field's state.

Example:

```angular-html
<input
  [value]="fieldName.api.state.value"
  (blur)="fieldName.api.handleBlur()"
  (input)="fieldName.api.handleChange($any($event).target.value)"
/>
```

### Validation

`@tanstack/angular-form` provides both synchronous and asynchronous validation out of the box. Validation functions can be passed to the `tanstackField` directive using the `validators` prop.

Example:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container [tanstackField]="form" name="firstName" #firstName="field">
      <input
        [value]="firstName.api.state.value"
        (blur)="firstName.api.handleBlur()"
        (input)="firstName.api.handleChange($any($event).target.value)"
      />
    </ng-container>
  `,
})
export class AppComponent {
  firstNameValidator: FieldValidateFn<any, any, string, any> = ({ value }) =>
    !value
      ? 'A first name is required'
      : value.length < 3
        ? 'First name must be at least 3 characters'
        : undefined

  firstNameAsyncValidator: FieldValidateAsyncFn<any, string, any> = async ({
    value,
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return value.includes('error') && 'No "error" allowed in first name'
  }

  form = injectForm({
    defaultValues: {
      firstName: '',
    },
    onSubmit({ value }) {
      console.log(value)
    },
  })
}
```

### Validation with Standard Schema Libraries

In addition to hand-rolled validation options, we also support the [Standard Schema](https://github.com/standard-schema/standard-schema) specification.

You can define a schema using any of the libraries implementing the specification and pass it to a form or field validator.

Supported libraries include:

- [Zod](https://zod.dev/) (v3.24.0 or higher)
- [Valibot](https://valibot.dev/) (v1.0.0 or higher)
- [ArkType](https://arktype.io/) (v2.1.20 or higher)
- [Yup](https://github.com/jquense/yup) (v1.7.0 or higher)

Example:

```angular-ts
import { z } from 'zod'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="firstName"
      [validators]="{
        onChange: z.string().min(3, 'First name must be at least 3 characters'),
        onChangeAsyncDebounceMs: 500,
        onChangeAsync: firstNameAsyncValidator,
      }"
      #firstName="field"
    >
      <!-- ... -->
    </ng-container>
  `,
})
export class AppComponent {
  firstNameAsyncValidator = z.string().refine(
    async (value) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return !value.includes('error')
    },
    {
      message: "No 'error' allowed in first name",
    },
  )

  form = injectForm({
    defaultValues: {
      firstName: '',
    },
    onSubmit({ value }) {
      // Do something with form data
      console.log(value)
    },
  })

  z = z
}
```

### Reactivity

`@tanstack/angular-form` offers a way to subscribe to form and field state changes via `injectStore(this.form, selector)`.

Example:

```typescript
import { injectForm, injectStore } from '@tanstack/angular-form'

@Component(/*...*/)
class AppComponent {
  form = injectForm(/*...*/)
  canSubmit = injectStore(this.form, (state) => state.canSubmit)
  isSubmitting = injectStore(this.form, (state) => state.isSubmitting)
}
```

### Listeners

`@tanstack/angular-form` allows you to react to specific triggers and "listen" to them to dispatch side effects.

Example:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="country"
      [listeners]="{
        onChange: onCountryChange
      }"
      #country="field"
    ></ng-container>
  `,
})

...

onCountryChange: FieldListenerFn<any, any, any, any, string> = ({
    value,
  }) => {
    console.log(`Country changed to: ${value}, resetting province`)
    this.form.setFieldValue('province', '')
  }
```

More information can be found at [Listeners](./framework-angular.md#source-form-docs-framework-angular-guides-listeners-md)

### Array Fields

Array fields allow you to manage a list of values within a form, such as a list of hobbies. You can create an array field using the `tanstackField` directive.

When working with array fields, you can use the fields `pushValue`, `removeValue`, `swapValues` and `moveValue` methods to add, remove, swap, and move a value from one index to another within the array, respectively. Additional helper methods such as `insertValue`, `replaceValue`, and `clearValues` are also available for inserting, replacing, and clearing array values.

Example:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container [tanstackField]="form" name="hobbies" #hobbies="field">
      <div>
        Hobbies
        <div>
          @if (!hobbies.api.state.value.length) {
            No hobbies found
          }
          @for (_ of hobbies.api.state.value; track $index) {
            <div>
              <ng-container
                [tanstackField]="form"
                [name]="getHobbyName($index)"
                #hobbyName="field"
              >
                <div>
                  <label [for]="hobbyName.api.name">Name:</label>
                  <input
                    [id]="hobbyName.api.name"
                    [name]="hobbyName.api.name"
                    [value]="hobbyName.api.state.value"
                    (blur)="hobbyName.api.handleBlur()"
                    (input)="
                      hobbyName.api.handleChange($any($event).target.value)
                    "
                  />
                  <button
                    type="button"
                    (click)="hobbies.api.removeValue($index)"
                  >
                    X
                  </button>
                </div>
              </ng-container>
              <ng-container
                [tanstackField]="form"
                [name]="getHobbyDesc($index)"
                #hobbyDesc="field"
              >
                <div>
                  <label [for]="hobbyDesc.api.name">Description:</label>
                  <input
                    [id]="hobbyDesc.api.name"
                    [name]="hobbyDesc.api.name"
                    [value]="hobbyDesc.api.state.value"
                    (blur)="hobbyDesc.api.handleBlur()"
                    (input)="
                      hobbyDesc.api.handleChange($any($event).target.value)
                    "
                  />
                </div>
              </ng-container>
            </div>
          }
        </div>
        <button type="button" (click)="hobbies.api.pushValue(defaultHobby)">
          Add hobby
        </button>
      </div>
    </ng-container>
  `,
})
export class AppComponent {
  defaultHobby = {
    name: '',
    description: '',
    yearsOfExperience: 0,
  }

  getHobbyName = (idx: number) => `hobbies[${idx}].name` as const
  getHobbyDesc = (idx: number) => `hobbies[${idx}].description` as const

  form = injectForm({
    defaultValues: {
      hobbies: [] as Array<{
        name: string
        description: string
        yearsOfExperience: number
      }>,
    },
    onSubmit({ value }) {
      alert(JSON.stringify(value))
    },
  })
}
```

These are the basic concepts and terminology used in the `@tanstack/angular-form` library. Understanding these concepts will help you work more effectively with the library and create complex forms with ease.

<a id="source-form-docs-framework-angular-guides-dynamic-validation-md"></a>

## Dynamic Validation

Source: `form:docs/framework/angular/guides/dynamic-validation.md`.

In many cases, you want to change the validation rules based depending on the state of the form or other conditions. The most popular
example of this is when you want to validate a field differently based on whether the user has submitted the form for the first time or not.

We support this through our `onDynamic` validation function.

```angular-ts
import { Component } from '@angular/core'
import {
  TanStackField,
  injectForm,
  revalidateLogic,
} from '@tanstack/angular-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: ` <!-- Your form template here --> `,
})
export class AppComponent {
  form = injectForm({
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
}
```

> By default `onDynamic` is not called, so you need to pass `revalidateLogic()` to the `validationLogic` option of `injectForm`.

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

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: ` <!-- Your form template here --> `,
})
export class AppComponent {
  form = injectForm({
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

Just as you might access errors from an `onChange` or `onBlur` validation, you can access the errors from the `onDynamic` validation function using the form's error map through `injectStore`.

```angular-ts
import { Component } from '@angular/core'
import {
  TanStackField,
  injectForm,
  injectStore,
  revalidateLogic,
} from '@tanstack/angular-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: ` <p>{{ formErrorMap().onDynamic?.firstName }}</p> `,
})
export class AppComponent {
  form = injectForm({
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

  formErrorMap = injectStore(this.form, (state) => state.errorMap)
}
```

### Usage with Other Validation Logic

You can use `onDynamic` validation alongside other validation logic, such as `onChange` or `onBlur`.

```angular-ts
import { Component } from '@angular/core'
import {
  TanStackField,
  injectForm,
  injectStore,
  revalidateLogic,
} from '@tanstack/angular-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <div>
      <p>{{ formErrorMap().onChange?.firstName }}</p>
      <p>{{ formErrorMap().onDynamic?.lastName }}</p>
    </div>
  `,
})
export class AppComponent {
  form = injectForm({
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

  formErrorMap = injectStore(this.form, (state) => state.errorMap)
}
```

#### Usage with Fields

You can also use `onDynamic` validation with fields, just like you would with other validation logic.

```angular-ts
import { Component } from '@angular/core'
import {
  TanStackField,
  injectForm,
  revalidateLogic,
} from '@tanstack/angular-form'
import type { FieldValidateFn } from '@tanstack/angular-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <form (submit)="handleSubmit($event)">
      <ng-container
        [tanstackField]="form"
        name="age"
        [validators]="{
          onDynamic: ageValidator,
        }"
        #age="field"
      >
        <input
          type="number"
          [value]="age.api.state.value"
          (blur)="age.api.handleBlur()"
          (input)="age.api.handleChange($any($event).target.valueAsNumber)"
        />
        @if (age.api.state.meta.errorMap.onDynamic) {
          <p style="color: red">
            {{ age.api.state.meta.errorMap.onDynamic }}
          </p>
        }
      </ng-container>
      <button type="submit">Submit</button>
    </form>
  `,
})
export class AppComponent {
  ageValidator: FieldValidateFn<any, any, any, any, number> = ({ value }) =>
    value > 18 ? undefined : 'Age must be greater than 18'

  form = injectForm({
    defaultValues: {
      name: '',
      age: 0,
    },
    validationLogic: revalidateLogic(),
    onSubmit({ value }) {
      alert(JSON.stringify(value))
    },
  })

  handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.form.handleSubmit()
  }
}
```

#### Async Validation

Async validation can also be used with `onDynamic` just like with other validation logic. You can even debounce the async validation to avoid excessive calls.

```angular-ts
import { Component } from '@angular/core'
import {
  TanStackField,
  injectForm,
  revalidateLogic,
} from '@tanstack/angular-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: ` <!-- Your form template here --> `,
})
export class AppComponent {
  form = injectForm({
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

```angular-ts
import { Component } from '@angular/core'
import {
  TanStackField,
  injectForm,
  revalidateLogic,
} from '@tanstack/angular-form'
import { z } from 'zod'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: ` <!-- Your form template here --> `,
})
export class AppComponent {
  schema = z.object({
    firstName: z.string().min(1, 'A first name is required'),
    lastName: z.string().min(1, 'A last name is required'),
  })

  form = injectForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: this.schema,
    },
  })
}
```

<a id="source-form-docs-framework-angular-guides-form-composition-md"></a>

## Form Composition

Source: `form:docs/framework/angular/guides/form-composition.md`.

A common criticism of TanStack Form is its verbosity out-of-the-box. While this _can_ be useful for educational purposes - helping enforce understanding our APIs - it's not ideal in production use cases.

As a result, while basic usage of `[tanstackField]` enables the most powerful and flexible usage of TanStack Form, we provide APIs that wrap it and make your application code less verbose.

### Pre-bound Field Components

If you've ever used TanStack Form in Angular to bind more than one input, you'll have quickly realized how much goes into each input:

```angular-ts
import { Component } from '@angular/core'
import { TanStackField, injectForm, injectStore } from '@tanstack/angular-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <div>
      <ng-container [tanstackField]="form" name="firstName" #firstName="field">
        <label [for]="firstName.api.name">First Name:</label>
        <input
          [id]="firstName.api.name"
          [name]="firstName.api.name"
          [value]="firstName.api.state.value"
          (blur)="firstName.api.handleBlur()"
          (input)="firstName.api.handleChange($any($event).target.value)"
        />
        @if (firstName.api.state.meta.isTouched) {
          @for (error of firstName.api.state.meta.errors; track $index) {
            <div style="color: red">
              {{ error }}
            </div>
          }
        }
        @if (firstName.api.state.meta.isValidating) {
          <p>Validating...</p>
        }
      </ng-container>
    </div>
    <div>
      <ng-container [tanstackField]="form" name="lastName" #lastName="field">
        <label [for]="lastName.api.name">Last Name:</label>
        <input
          [id]="lastName.api.name"
          [name]="lastName.api.name"
          [value]="lastName.api.state.value"
          (blur)="lastName.api.handleBlur()"
          (input)="lastName.api.handleChange($any($event).target.value)"
        />
        @if (lastName.api.state.meta.isTouched) {
          @for (error of lastName.api.state.meta.errors; track $index) {
            <div style="color: red">
              {{ error }}
            </div>
          }
        }
        @if (lastName.api.state.meta.isValidating) {
          <p>Validating...</p>
        }
      </ng-container>
    </div>
  `,
})
export class AppComponent {
  form = injectForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit({ value }) {
      // Do something with form data
      console.log(value)
    },
  })
}
```

This is functionally correct, but introduces a _lot_ of repeated templating behavior over and over. Instead, let's move the error handling, label to input binding, and other repeated logic into a component:

```angular-ts
import { injectField } from '@tanstack/angular-form'

@Component({
  selector: 'app-text-field',
  standalone: true,
  template: `
    <label [for]="field.api.name">{{ label() }}</label>
    <input
      [id]="field.api.name"
      [name]="field.api.name"
      [value]="field.api.state.value"
      (blur)="field.api.handleBlur()"
      (input)="field.api.handleChange($any($event).target.value)"
    />
    @if (field.api.state.meta.isTouched) {
      @for (error of field.api.state.meta.errors; track $index) {
        <div style="color: red">
          {{ error }}
        </div>
      }
    }
    @if (field.api.state.meta.isValidating) {
      <p>Validating...</p>
    }
  `,
})
export class AppTextField {
  label = input.required<string>()
  // This API requires another part to it from the parent component
  field = injectField<string>()
}
```

> `injectField` accepts a single generic to define the `field.state.value` type.
>
> As a result, a numerical text field would be represented as `injectField<number>`, for example.

Now, we can use the `TanStackAppField` directive (`tanstack-app-field`) to `provide` the expected field associated with this input:

```angular-ts
import { Component } from '@angular/core'
import {
  TanStackAppField,
  TanStackField,
  injectForm,
} from '@tanstack/angular-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField, TanStackAppField, AppTextField],
  template: `
    <div>
      <app-text-field
        label="First name:"
        tanstack-app-field
        [tanstackField]="form"
        name="firstName"
      />
    </div>
    <div>
      <app-text-field
        label="Last name:"
        tanstack-app-field
        [tanstackField]="form"
        name="lastName"
      />
    </div>
  `,
})
export class AppComponent {
  form = injectForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit({ value }) {
      // Do something with form data
      console.log(value)
    },
  })
}
```

> Here, the `tanstack-app-field` directive is taking the properties from `[tanstackField]` and `provide`ing them down to the `app-text-field` so that they can be more easily consumed as a component.

### Breaking big forms into smaller pieces

Sometimes forms get very large; it's just how it goes sometimes. While TanStack Form supports large forms well, it's never fun to work with hundreds or thousands of lines of code in a single component.

To solve this, we support breaking forms into smaller pieces using the `[tanstack-with-form]` directive together with the `injectWithForm` function.

The parent component owns the `form` (created via `injectForm`) and passes it down to a child component using the `tanstack-with-form` directive. The child component reads it back via `injectWithForm`, which returns a fully-typed reference to that same `FormApi` — meaning the child can render `[tanstackField]` bindings, `tanstack-app-field` components, etc. against the parent's form without needing to redeclare any generics.

First, lift your shared form options out using `formOptions` so both the parent and the child can reference the same shape:

```angular-ts
// shared-form.ts
import { formOptions } from '@tanstack/angular-form'

export const peopleFormOpts = formOptions({
  defaultValues: {
    firstName: '',
    lastName: '',
  },
})
```

Then, build a child component that consumes the form via `injectWithForm`:

```angular-ts
// child-form.component.ts
import { Component } from '@angular/core'
import {
  TanStackAppField,
  TanStackField,
  injectWithForm,
} from '@tanstack/angular-form'
import { AppTextField } from './app-text-field.component'
import { peopleFormOpts } from './shared-form'

@Component({
  selector: 'app-child-form',
  standalone: true,
  imports: [TanStackField, TanStackAppField, AppTextField],
  template: `
    <app-text-field
      label="First name:"
      tanstack-app-field
      [tanstackField]="withForm.form"
      name="firstName"
    />
    <app-text-field
      label="Last name:"
      tanstack-app-field
      [tanstackField]="withForm.form"
      name="lastName"
    />
  `,
})
export class ChildForm {
  // Spreading the form options into `injectWithForm` is what gives `withForm.form`
  // its full type inference — no generics needed.
  withForm = injectWithForm({ ...peopleFormOpts })
}
```

> The options passed to `injectWithForm({ ...peopleFormOpts })` are only used for type inference. They are not read at runtime; the actual `FormApi` instance comes from the ancestor `tanstack-with-form` directive.

Finally, in the parent component, create the form with `injectForm` and pass it to the child via the `tanstack-with-form` directive:

```angular-ts
// app.component.ts
import { Component } from '@angular/core'
import { TanStackWithForm, injectForm } from '@tanstack/angular-form'
import { ChildForm } from './child-form.component'
import { peopleFormOpts } from './shared-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackWithForm, ChildForm],
  template: `
    <form (submit)="handleSubmit($event)">
      <app-child-form tanstack-with-form [form]="form" />
      <button type="submit">Submit</button>
    </form>
  `,
})
export class AppComponent {
  form = injectForm({
    ...peopleFormOpts,
    onSubmit({ value }) {
      console.log(value)
    },
  })

  handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.form.handleSubmit()
  }
}
```

This pattern lets you split a large form across many components while keeping a single source of truth for the form's state and types. Any descendant of the `tanstack-with-form` directive can call `injectWithForm({ ...peopleFormOpts })` to gain typed access to the same form instance.

<a id="source-form-docs-framework-angular-guides-form-groups-md"></a>

## Form Groups

Source: `form:docs/framework/angular/guides/form-groups.md`.

When building a multi-stage form that has many stages, like so:

![Form stepper](./doc-assets/assets/stepper.png)

It's common for each step to have its own form. However, this complicates the form submission and validation process by requiring you to add complex logic.

Luckily, TanStack Form provides a way to build out sub-forms that make this kind of development trivial to implement: `[tanstackFormGroup]`.

### Usage

To use a form group in TanStack Form, you'll use `injectForm` to create a `form` variable, then reference it with the `tanstackFormGroup` directive like you would with `tanstackField`:

```angular-ts
import { Component } from '@angular/core'
import { TanStackFormGroup, injectForm } from '@tanstack/angular-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackFormGroup],
  template: `
    <ng-container [tanstackFormGroup]="form" name="step1" #group="formGroup">
      <!-- `group.api` here has all of the form-like methods you'd expect like `deleteField` or `insertFieldValue` -->
      <!-- ... -->
    </ng-container>
  `,
})
export class AppComponent {
  form = injectForm({
    defaultValues: {
      step1: {
        name: '',
      },
      step2: {
        age: 0,
      },
    },
  })
}
```

This becomes much more useful when paired with external state to conditionally render a form group:

```angular-ts
import { Component, signal } from '@angular/core'
import {
  TanStackField,
  TanStackFormGroup,
  injectForm,
} from '@tanstack/angular-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField, TanStackFormGroup],
  template: `
    @if (step() === 0) {
      <ng-container
        [tanstackFormGroup]="form"
        name="step1"
        [onGroupSubmit]="onStep1Submit"
        [onGroupSubmitInvalid]="onStep1SubmitInvalid"
        [onSubmitMeta]="submitMeta"
        #group="formGroup"
      >
        <form
          (submit)="
            $event.preventDefault();
            $event.stopPropagation();
            group.api.handleSubmit()
          "
        >
          <ng-container [tanstackField]="form" name="step1.name" #name="field">
            <!-- ... -->
          </ng-container>
        </form>
      </ng-container>
    }

    @if (step() === 1) {
      <ng-container
        [tanstackFormGroup]="form"
        name="step2"
        [onGroupSubmit]="onStep2Submit"
        #group="formGroup"
      >
        <form
          (submit)="
            $event.preventDefault();
            $event.stopPropagation();
            group.api.handleSubmit()
          "
        >
          <ng-container [tanstackField]="form" name="step2.age" #age="field">
            <!-- ... -->
          </ng-container>
        </form>
      </ng-container>
    }
  `,
})
export class AppComponent {
  step = signal(0)
  submitMeta = {} as SomeType

  form = injectForm({
    defaultValues: {
      step1: {
        name: '',
      },
      step2: {
        age: 0,
      },
    },
  })

  onStep1Submit = () => {
    // We can move the step forward when validation passes
    this.step.update((step) => step + 1)
  }

  onStep1SubmitInvalid = () => {
    // Or handle invalid submissions, just like a top-level form
  }

  onStep2Submit = () => {
    // Then, use `form.handleSubmit()` to submit the entire form
    this.form.handleSubmit()
  }
}
```

When you split each step into its own component, pass the parent form down with [`tanstack-with-form`](./framework-angular.md#source-form-docs-framework-angular-guides-form-composition-md) and read it in the child with `injectWithForm`. The child can then use `[tanstackFormGroup]="withForm.form"` and `[tanstackField]="withForm.form"` against the same parent form instance.

### Form Group Validation

Form groups have a distinct validation procedure that we think makes sense for sub-forms:

- Form groups can have their own validation:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackFormGroup],
  template: `
    <ng-container
      [tanstackFormGroup]="form"
      name="step1"
      [validators]="{ onChange: groupValidator }"
      #group="formGroup"
    >
      <!-- group.api.state.meta.errorMap // {onChange: "Error" | undefined} -->
      <!-- group.api.state.meta.errors // ("Error")[] -->
    </ng-container>
  `,
})
export class AppComponent {
  form = injectForm({
    defaultValues: {
      step1: { name: '' },
    },
  })

  groupValidator = () => 'Error'
}
```

- Can set errors on sub-fields:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackFormGroup],
  template: `
    <ng-container
      [tanstackFormGroup]="form"
      name="step1"
      [validators]="{ onChange: groupValidator }"
    ></ng-container>
  `,
})
export class AppComponent {
  form = injectForm({
    defaultValues: {
      step1: { name: '' },
    },
  })

  groupValidator = ({ value }: { value: { name: string } }) => ({
    group: value.name === 'error' ? 'Group error' : undefined,
    fields: {
      // Must use the name of the field relative to the FormGroup as the error key,
      // to stay consistent with how standard schema works with form groups
      name: value.name === 'error' ? 'Field error' : undefined,
    },
  })
}
```

- And can even accept standard schemas:

```angular-ts
import { z } from 'zod'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackFormGroup],
  template: `
    <ng-container
      [tanstackFormGroup]="form"
      name="step1"
      [validators]="{ onChange: step1Schema }"
    ></ng-container>
  `,
})
export class AppComponent {
  step1Schema = z.object({
    name: z.string().min(2),
  })

  form = injectForm({
    defaultValues: {
      step1: { name: '' },
    },
  })
}
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

If you want to use [dynamic validation (`onDynamic`)](./framework-angular.md#source-form-docs-framework-angular-guides-dynamic-validation-md) with a form group, do not rely on the `onDynamic` validator passed to `injectForm`:

```ts
form = injectForm({
  validationLogic: revalidateLogic(),
  validators: {
    // This validator will not run `onChange` when a sub-form is submitted;
    // it will only run `onChange` when the form itself is submitted.
    onDynamic: schema,
  },
})
```

Instead, pass your sub-schema for the group to the `onDynamic` validation of the group itself:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackFormGroup],
  template: `
    <ng-container
      [tanstackFormGroup]="form"
      name="step1"
      [validators]="{ onDynamic: step1Schema }"
    ></ng-container>
  `,
})
export class AppComponent {
  step1Schema = step1Schema

  form = injectForm({
    defaultValues: {
      step1: { name: '' },
    },
  })
}
```

It will treat `group.api.submissionAttempts` as the way to change what validator is run before/after submit.

### Form Group State

Just like you're able to access `group.api.state.meta.errors`, you're also able to access the group's value using `group.api.state.value`. Likewise, here are some valuable properties you can access in the `group.api.state.meta`:

- `group.api.state.meta.isFieldsValid`: `true` when the field-level validators have no errors
- `group.api.state.meta.isGroupValid`: `true` when the group-level validators have no errors
- `group.api.state.meta.isValid`: `true` when both the field-level and group-level validators have no errors
- `group.api.state.meta.isSubmitting`: `true` when the group is in the process of being submitted

<a id="source-form-docs-framework-angular-guides-listeners-md"></a>

## Listeners

Source: `form:docs/framework/angular/guides/listeners.md`.

For situations where you want to "affect" or "react" to triggers, there's the listener API. For example, if you, as the developer, want to reset a form field as a result of another field changing, you would use the listener API.

Imagine the following user flow:

- User selects a country from a drop-down.
- User then selects a province from another drop-down.
- User changes the selected country to a different one.

In this example, when the user changes the country, the selected province needs to be reset as it's no longer valid. With the listener API, we can subscribe to the onChange event and dispatch a reset to the field "province" when the listener is fired.

Events that can be "listened" to are:

- `onChange`
- `onBlur`
- `onMount`
- `onSubmit`
- `onUnmount`

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="country"
      [listeners]="{
        onChange: onCountryChange,
      }"
      #country="field"
    ></ng-container>

    <ng-container
      [tanstackField]="form"
      name="province"
      #province="field"
    ></ng-container>
  `,
})
export class AppComponent {
  form = injectForm({
    defaultValues: {
      country: '',
      province: '',
    },
  })

  onCountryChange: FieldListenerFn<any, any, any, any, string> = ({
    value,
  }) => {
    console.log(`Country changed to: ${value}, resetting province`)
    this.form.setFieldValue('province', '')
  }
}
```

<a id="source-form-docs-framework-angular-guides-submission-handling-md"></a>

## Submission Handling

Source: `form:docs/framework/angular/guides/submission-handling.md`.

### Passing additional data to submission handling

You may have multiple types of submission behaviour, for example, going back to another page or staying on the form.
You can accomplish this by specifying the `onSubmitMeta` property. This meta data will be passed to the `onSubmit` function.

> Note: if `form.handleSubmit()` is called without metadata, it will use the provided default.

```angular-ts
import { Component } from '@angular/core'
import { injectForm } from '@tanstack/angular-form'

type FormMeta = {
  submitAction: 'continue' | 'backToMenu' | null
}

// Metadata is not required to call form.handleSubmit().
// Specify what values to use as default if no meta is passed
const defaultMeta: FormMeta = {
  submitAction: null,
}

@Component({
  selector: 'app-root',
  template: `
    <form (submit)="handleSubmit($event)">
      <button type="submit" (click)="handleClick({ submitAction: 'continue' })">
        Submit and continue
      </button>
      <button
        type="submit"
        (click)="handleClick({ submitAction: 'backToMenu' })"
      >
        Submit and back to menu
      </button>
    </form>
  `,
})
export class AppComponent {
  form = injectForm({
    defaultValues: {
      data: '',
    },
    // Define what meta values to expect on submission
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      // Do something with the values passed via handleSubmit
      console.log(`Selected action - ${meta.submitAction}`, value)
    },
  })

  handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
  }

  handleClick(meta: FormMeta) {
    // Overwrites the default specified in onSubmitMeta
    this.form.handleSubmit(meta)
  }
}
```

### Transforming data with Standard Schemas

While Tanstack Form provides [Standard Schema support](./framework-angular.md#source-form-docs-framework-angular-guides-validation-md) for validation, it does not preserve the Schema's output data.

The value passed to the `onSubmit` function will always be the input data. To receive the output data of a Standard Schema, parse it in the `onSubmit` function:

```tsx
import { z } from 'zod'
// ...

const schema = z.object({
  age: z.string().transform((age) => Number(age)),
})

// Tanstack Form uses the input type of Standard Schemas
const defaultValues: z.input<typeof schema> = {
  age: '13',
}

// ...

@Component({
  // ...
})
export class AppComponent {
  form = injectForm({
    defaultValues,
    validators: {
      onChange: schema,
    },
    onSubmit: ({ value }) => {
      const inputAge: string = value.age
      // Pass it through the schema to get the transformed value
      const result = schema.parse(value)
      const outputAge: number = result.age
    },
  })
}
```

<a id="source-form-docs-framework-angular-guides-validation-md"></a>

## Validation

Source: `form:docs/framework/angular/guides/validation.md`.

At the core of TanStack Form's functionalities is the concept of validation. TanStack Form makes validation highly customizable:

- You can control when to perform the validation (on change, on input, on blur, on submit...)
- Validation rules can be defined at the field level or at the form level
- Validation can be synchronous or asynchronous (for example, as a result of an API call)

### When is validation performed?

It's up to you! The `[tanstackField]` directive accepts some callbacks as props such as `onChange` or `onBlur`. Those callbacks are passed the current value of the field, as well as the fieldAPI object, so that you can perform the validation. If you find a validation error, simply return the error message as string and it will be available in `field.api.state.meta.errors`.

Here is an example:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="age"
      [validators]="{
        onChange: ageValidator,
      }"
      #age="field"
    >
      <label [for]="age.api.name">Age:</label>
      <input
        [id]="age.api.name"
        [name]="age.api.name"
        [value]="age.api.state.value"
        type="number"
        (input)="age.api.handleChange($any($event).target.valueAsNumber)"
      />
      @if (age.api.state.meta.errors) {
        <em role="alert">{{ age.api.state.meta.errors.join(', ') }}</em>
      }
    </ng-container>
  `,
})
export class AppComponent {
  ageValidator: FieldValidateFn<any, any, any, any, number> = ({ value }) =>
    value < 13 ? 'You must be 13 to make an account' : undefined

  // ...
}
```

In the example above, the validation is done at each keystroke (`onChange`). If, instead, we wanted the validation to be done when the field is blurred, we would change the code above like so:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="age"
      [validators]="{
        onBlur: ageValidator,
      }"
      #age="field"
    >
      <label [for]="age.api.name">Age:</label>
      <!-- We always need to implement onChange, so that TanStack Form receives the changes -->
      <!-- Listen to the onBlur event on the field -->
      <input
        [id]="age.api.name"
        [name]="age.api.name"
        [value]="age.api.state.value"
        type="number"
        (blur)="age.api.handleBlur()"
        (input)="age.api.handleChange($any($event).target.valueAsNumber)"
      />
      @if (age.api.state.meta.errors) {
        <em role="alert">{{ age.api.state.meta.errors.join(', ') }}</em>
      }
    </ng-container>
  `,
})
export class AppComponent {
  ageValidator: FieldValidateFn<any, any, any, any, number> = ({ value }) =>
    value < 13 ? 'You must be 13 to make an account' : undefined

  // ...
}
```

So you can control when the validation is done by implementing the desired callback. You can even perform different pieces of validation at different times:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="age"
      [validators]="{
        onChange: ageValidator,
        onBlur: minimumAgeValidator,
      }"
      #age="field"
    >
      <label [for]="age.api.name">Age:</label>
      <!-- We always need to implement onChange, so that TanStack Form receives the changes -->
      <!-- Listen to the onBlur event on the field -->
      <input
        [id]="age.api.name"
        [name]="age.api.name"
        [value]="age.api.state.value"
        type="number"
        (blur)="age.api.handleBlur()"
        (input)="age.api.handleChange($any($event).target.valueAsNumber)"
      />
      @if (!age.api.state.meta.isValid) {
        <em role="alert">{{ age.api.state.meta.errors.join(', ') }}</em>
      }
    </ng-container>
  `,
})
export class AppComponent {
  ageValidator: FieldValidateFn<any, any, any, any, number> = ({ value }) =>
    value < 13 ? 'You must be 13 to make an account' : undefined

  minimumAgeValidator: FieldValidateFn<any, any, any, any, number> = ({
    value,
  }) => (value < 0 ? 'Invalid value' : undefined)

  // ...
}
```

In the example above, we are validating different things on the same field at different times (at each keystroke and when blurring the field). Since `field.state.meta.errors` is an array, all the relevant errors at a given time are displayed. You can also use `field.state.meta.errorMap` to get errors based on _when_ the validation was done (onChange, onBlur etc...). More info about displaying errors below.

### Displaying Errors

Once you have your validation in place, you can map the errors from an array to be displayed in your UI:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="age"
      [validators]="{
        onChange: ageValidator,
      }"
      #age="field"
    >
      <!-- ... -->
      @if (age.api.state.meta.errors) {
        <em role="alert">{{ age.api.state.meta.errors.join(', ') }}</em>
      }
    </ng-container>
  `,
})
export class AppComponent {
  ageValidator: FieldValidateFn<any, any, any, any, number> = ({ value }) =>
    value < 13 ? 'You must be 13 to make an account' : undefined

  // ...
}
```

Or use the `errorMap` property to access the specific error you're looking for:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="age"
      [validators]="{
        onChange: ageValidator,
      }"
      #age="field"
    >
      <!-- ... -->
      @if (age.api.state.meta.errorMap['onChange']) {
        <em role="alert">{{ age.api.state.meta.errorMap['onChange'] }}</em>
      }
    </ng-container>
  `,
})
export class AppComponent {
  ageValidator: FieldValidateFn<any, any, any, any, number> = ({ value }) =>
    value < 13 ? 'You must be 13 to make an account' : undefined

  // ...
}
```

It's worth mentioning that our `errors` array and the `errorMap` matches the types returned by the validators. This means that:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="age"
      [validators]="{
        onChange: ageValidator
      }"
      #age="field"
    >
      <!-- ... -->
      <!-- errorMap.onChange is type `{isOldEnough: false} | undefined` -->
	  <!-- meta.errors is type `Array<{isOldEnough: false} | undefined>` -->
      @if (!age.api.state.meta.errorMap['onChange']?.isOldEnough) {
        <em role="alert">The user is not old enough</em>
      }
    </ng-container>
  `,
})
export class AppComponent {
  ageValidator: FieldValidateFn<any, any, any, any, number> = ({ value }) =>
    value < 13 ? 'You must be 13 to make an account' : undefined

  // ...
}
```

### Validation at field level vs at form level

As shown above, each `[tanstackField]` accepts its own validation rules via the `onChange`, `onBlur` etc... callbacks. It is also possible to define validation rules at the form level (as opposed to field by field) by passing similar callbacks to the `injectForm()` function.

Example:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <div>
      <ng-container [tanstackField]="form" name="age" #age="field">
        <!-- ... -->
        @if (formErrorMap().onChange) {
          <div>
            <em
              >There was an error on the form: {{ formErrorMap().onChange }}</em
            >
          </div>
        }
        <!-- ... -->
      </ng-container>
    </div>
  `,
})
export class AppComponent {
  form = injectForm({
    defaultValues: {
      age: 0,
    },
    onSubmit({ value }) {
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

  // Subscribe to the form's error map so that updates to it will render
  formErrorMap = injectStore(this.form, (state) => state.errorMap)
}
```

#### Setting field-level errors from the form's validators

You can set errors on the fields from the form's validators. One common use case for this is validating all the fields on submit by calling a single API endpoint in the form's `onSubmitAsync` validator.

```angular-ts
@Component({
  selector: 'app-root',
  imports: [TanStackField],
  template: `
    <form (submit)="handleSubmit($event)">
      <div>
        <ng-container [tanstackField]="form" name="age" #ageField="field">
          <label [for]="ageField.api.name">Age:</label>
          <input
            type="number"
            [name]="ageField.api.name"
            [value]="ageField.api.state.value"
            (blur)="ageField.api.handleBlur()"
            (input)="
              ageField.api.handleChange($any($event).target.valueAsNumber)
            "
          />
          @if (ageField.api.state.meta.errors.length > 0) {
            <em role="alert">{{
              ageField.api.state.meta.errors.join(', ')
            }}</em>
          }
        </ng-container>
      </div>
      <button type="submit">Submit</button>
    </form>
  `,
})
export class AppComponent {
  form = injectForm({
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

  handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.form.handleSubmit()
  }
}
```

> Something worth mentioning is that if you have a form validation function that returns an error, that error may be overwritten by the field-specific validation.
>
> This means that:
>
> ```angular-ts
> @Component({
>   selector: 'app-root',
>   standalone: true,
>   imports: [TanStackField],
>   template: `
>     <div>
>       <ng-container
>         [tanstackField]="form"
>         name="age"
>         #ageField="field"
>         [validators]="{
>           onChange: fieldValidator,
>         }"
>       >
>         <input
>           type="number"
>           [value]="ageField.api.state.value"
>           (input)="
>             ageField.api.handleChange($any($event).target.valueAsNumber)
>           "
>         />
>         @if (ageField.api.state.meta.errors.length > 0) {
>           <em role="alert">{{
>             ageField.api.state.meta.errors.join(', ')
>           }}</em>
>         }
>       </ng-container>
>     </div>
>   `,
> })
> export class AppComponent {
>   form = injectForm({
>     defaultValues: {
>       age: 0,
>     },
>     validators: {
>       onChange: ({ value }) => {
>         return {
>           fields: {
>             age: value.age < 12 ? 'Too young!' : undefined,
>           },
>         }
>       },
>     },
>   })
>
>   fieldValidator: FieldValidateFn<any, any, number> = ({ value }) =>
>     value % 2 === 0 ? 'Must be odd!' : undefined
> }
> ```
>
> Will only show `'Must be odd!` even if the 'Too young!' error is returned by the form-level validation.

### Asynchronous Functional Validation

While we suspect most validations will be synchronous, there are many instances where a network call or some other async operation would be useful to validate against.

To do this, we have dedicated `onChangeAsync`, `onBlurAsync`, and other methods that can be used to validate against:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="age"
      [validators]="{ onChangeAsync: ageValidator }"
      #age="field"
    >
      <label [for]="age.api.name">Last Name:</label>
      <input
        [id]="age.api.name"
        [name]="age.api.name"
        [value]="age.api.state.value"
        type="number"
        (input)="age.api.handleChange($any($event).target.valueAsNumber)"
      />
      @if (age.api.state.meta.errors) {
        <em role="alert">{{ age.api.state.meta.errors.join(', ') }}</em>
      }
    </ng-container>
  `,
})
export class AppComponent {
  ageValidator: FieldValidateAsyncFn<any, string, number> = async ({
    value,
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return value < 13 ? 'You must be 13 to make an account' : undefined
  }

  // ...
}
```

Synchronous and Asynchronous validations can coexist. For example, it is possible to define both `onBlur` and `onBlurAsync` on the same field:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="age"
      [validators]="{ onBlur: ensureAge13, onBlurAsync: ensureOlderAge }"
      #age="field"
    >
      <label [for]="age.api.name">Last Name:</label>
      <input
        [id]="age.api.name"
        [name]="age.api.name"
        [value]="age.api.state.value"
        type="number"
        (blur)="age.api.handleBlur()"
        (input)="age.api.handleChange($any($event).target.value)"
      />
      @if (age.api.state.meta.errors) {
        <em role="alert">{{ age.api.state.meta.errors.join(', ') }}</em>
      }
    </ng-container>
  `,
})
export class AppComponent {
  ensureAge13: FieldValidateFn<any, any, any, any, number> = ({ value }) =>
    value < 13 ? 'You must be at least 13' : undefined

  ensureOlderAge: FieldValidateAsyncFn<any, string, number> = async ({
    value,
  }) => {
    const currentAge = await fetchCurrentAgeOnProfile()
    return value < currentAge ? 'You can only increase the age' : undefined
  }

  // ...
}
```

The synchronous validation method (`onBlur`) is run first and the asynchronous method (`onBlurAsync`) is only run if the synchronous one (`onBlur`) succeeds. To change this behaviour, set the `asyncAlways` option to `true`, and the async method will be run regardless of the result of the sync method.

#### Built-in Debouncing

While async calls are the way to go when validating against the database, running a network request on every keystroke is a good way to DDOS your database.

Instead, we enable an easy method for debouncing your `async` calls by adding a single property:

```angular-html
<ng-container
  [tanstackField]="form"
  name="age"
  asyncDebounceMs="{500}"
  [validators]="{ onChangeAsync: someValidator }"
  #age="field"
>
  <!-- ... -->
</ng-container>
```

This will debounce every async call with a 500ms delay. You can even override this property on a per-validation property:

```angular-html
<ng-container
  [tanstackField]="form"
  name="age"
  [validators]="{
    onChangeAsyncDebounceMs: 1500,
    onChangeAsync: someValidator,
    onBlurAsync: otherValidator,
  }"
  #age="field"
>
  <!-- ... -->
</ng-container>
```

> This will run `onChangeAsync` every 1500ms while `onBlurAsync` will run every 500ms.

### Validation through Schema Libraries

While functions provide more flexibility and customization over your validation, they can be a bit verbose. To help solve this, there are libraries that provide schema-based validation to make shorthand and type-strict validation substantially easier. You can also define a single schema for your entire form and pass it to the form level, errors will be automatically propagated to the fields.

#### Standard Schema Libraries

TanStack Form natively supports all libraries following the [Standard Schema specification](https://github.com/standard-schema/standard-schema), most notably:

- [Zod](https://zod.dev/)
- [Valibot](https://valibot.dev/)
- [ArkType](https://arktype.io/)

_Note:_ make sure to use the latest version of the schema libraries as older versions might not support Standard Schema yet.

> Validation will not provide you with transformed values. See [submission handling](./framework-angular.md#source-form-docs-framework-angular-guides-submission-handling-md) for more information.

To use schemas from these libraries you can pass them to the `validators` props as you would do with a custom function:

```angular-ts
import { z } from 'zod'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="age"
      [validators]="{
        onChange: z.number().gte(13, 'You must be 13 to make an account'),
      }"
      #age="field"
    >
      <!-- ... -->
    </ng-container>
  `,
})
export class AppComponent {
  form = injectForm({
    // ...
  })

  z = z

  // ...
}
```

Async validations on form and field level are supported as well:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="age"
      [validators]="{
        onChange: z.number().gte(13, 'You must be 13 to make an account'),
        onChangeAsyncDebounceMs: 500,
        onChangeAsync: increaseAge,
      }"
      #age="field"
    >
      <!-- ... -->
    </ng-container>
  `,
})
export class AppComponent {
  increaseAge = z.number().refine(
    async (value) => {
      const currentAge = await fetchCurrentAgeOnProfile()
      return value >= currentAge
    },
    {
      message: 'You can only increase the age',
    },
  )

  // ...
}
```

If you need even more control over your Standard Schema validation, you can combine a Standard Schema with a callback function like so:

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <ng-container
      [tanstackField]="form"
      name="age"
      [validators]="{ onChangeAsync: ageValidator }"
      #age="field"
    >
      <!-- ... -->
    </ng-container>
  `,
})
export class AppComponent {
  ageValidator: FieldValidateAsyncFn<any, string, number> = async ({
    value,
    fieldApi,
  }) => {
    const errors = fieldApi.parseValueWithSchema(
      z.number().gte(13, 'You must be 13 to make an account'),
    )
    if (errors) return errors

    // continue with your validation
  }

  // ...
}
```

### Preventing invalid forms from being submitted

The `onChange`, `onBlur` etc... callbacks are also run when the form is submitted and the submission is blocked if the form is invalid.

The form state object has a `canSubmit` flag that is false when any field is invalid and the form has been touched (`canSubmit` is true until the form has been touched, even if some fields are "technically" invalid based on their `onChange`/`onBlur` props).

You can subscribe to it via `injectStore` and use the value in order to, for example, disable the submit button when the form is invalid (in practice, disabled buttons are not accessible, use `aria-disabled` instead).

```angular-ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <!-- ... -->
    <button type="submit" [disabled]="!canSubmit()">
      {{ isSubmitting() ? '...' : 'Submit' }}
    </button>
  `,
})
export class AppComponent {
  canSubmit = injectStore(this.form, (state) => state.canSubmit)
  isSubmitting = injectStore(this.form, (state) => state.isSubmitting)

  // ...
}
```

To prevent the form from being submitted before any interaction, combine `canSubmit` with `isPristine` flags. A simple condition like `!canSubmit || isPristine` effectively disables submissions until the user has made changes.

<a id="source-form-docs-framework-angular-quick-start-md"></a>

## Quick Start

Source: `form:docs/framework/angular/quick-start.md`.

The bare minimum to get started with TanStack Form is to create a form and add a field. Keep in mind that this example does not include any validation or error handling... yet.

```angular-ts
import { Component } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { TanStackField, injectForm } from '@tanstack/angular-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <form (submit)="handleSubmit($event)">
      <div>
        <ng-container [tanstackField]="form" name="fullName" #fullName="field">
          <label [for]="fullName.api.name">First Name:</label>
          <input
            [name]="fullName.api.name"
            [value]="fullName.api.state.value"
            (blur)="fullName.api.handleBlur()"
            (input)="fullName.api.handleChange($any($event).target.value)"
          />
        </ng-container>
      </div>
      <button type="submit">Submit</button>
    </form>
  `,
})
export class AppComponent {
  form = injectForm({
    defaultValues: {
      fullName: '',
    },
    onSubmit({ value }) {
      // Do something with form data
      console.log(value)
    },
  })

  handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.form.handleSubmit()
  }
}

bootstrapApplication(AppComponent).catch((err) => console.error(err))
```

From here, you'll be ready to explore all of the other features of TanStack Form!
