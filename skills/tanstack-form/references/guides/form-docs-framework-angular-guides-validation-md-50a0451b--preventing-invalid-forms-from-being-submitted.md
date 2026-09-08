# Validation — Preventing invalid forms from being submitted

[Guide and prerequisites](./form-docs-framework-angular-guides-validation-md-50a0451b.md) · Release-matched documentation · `@tanstack/angular-form@1.33.5`.

## Preventing invalid forms from being submitted

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
