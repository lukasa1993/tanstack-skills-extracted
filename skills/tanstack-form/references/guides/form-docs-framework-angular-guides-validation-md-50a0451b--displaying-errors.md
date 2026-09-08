# Validation — Displaying Errors

[Guide and prerequisites](./form-docs-framework-angular-guides-validation-md-50a0451b.md) · Release-matched documentation · `@tanstack/angular-form@1.33.5`.

## Displaying Errors

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
