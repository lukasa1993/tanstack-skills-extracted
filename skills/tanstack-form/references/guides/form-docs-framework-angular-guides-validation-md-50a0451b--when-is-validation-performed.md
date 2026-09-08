# Validation — When is validation performed?

[Guide and prerequisites](./form-docs-framework-angular-guides-validation-md-50a0451b.md) · Release-matched documentation · `@tanstack/angular-form@1.33.5`.

## When is validation performed?

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
