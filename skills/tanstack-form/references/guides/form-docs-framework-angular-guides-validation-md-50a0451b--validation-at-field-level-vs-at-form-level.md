# Validation — Validation at field level vs at form level

[Guide and prerequisites](./form-docs-framework-angular-guides-validation-md-50a0451b.md) · Release-matched documentation · `@tanstack/angular-form@1.33.5`.

## Validation at field level vs at form level

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

### Setting field-level errors from the form's validators

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
