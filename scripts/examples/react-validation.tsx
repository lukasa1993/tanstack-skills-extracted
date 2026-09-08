// Repository example (MIT). Render <Signup onSubmit={...} /> in a React app.
import { useForm } from '@tanstack/react-form'

export function Signup({ onSubmit }: { onSubmit: (email: string) => Promise<void> }) {
  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => { await onSubmit(value.email) },
  })
  const validateEmail = ({ value }: { value: string }) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'Enter a valid email'

  return (
    <form noValidate onSubmit={(event) => { event.preventDefault(); void form.handleSubmit() }}>
      <form.Field name="email" validators={{ onChange: validateEmail, onSubmit: validateEmail }}>
        {(field) => (
          <>
            <label htmlFor="email">Email</label>
            <input id="email" name={field.name} value={field.state.value}
              onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)}
              aria-invalid={field.state.meta.errors.length > 0} aria-describedby="email-error" />
            <span id="email-error" role="alert">{field.state.meta.errors.join(', ')}</span>
          </>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => <button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Sign up'}
        </button>}
      </form.Subscribe>
    </form>
  )
}
