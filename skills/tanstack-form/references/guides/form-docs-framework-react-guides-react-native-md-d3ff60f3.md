# React Native

<a id="source-form-docs-framework-react-guides-react-native-md"></a>

Release-matched documentation · `@tanstack/react-form@1.33.5`.

[Topic index](../framework-react-advanced.md) · [Source provenance](../SOURCES.md)

TanStack Form is headless and it should support React Native out-of-the-box without needing any additional configuration.

Here is an example:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: (val) =>
      val < 13 ? 'You must be 13 to make an account' : undefined,
  }}
>
  {(field) => (
    <>
      <Text>Age:</Text>
      <TextInput value={field.state.value} onChangeText={field.handleChange} />
      {!field.state.meta.isValid && (
        <Text>{field.state.meta.errors.join(', ')}</Text>
      )}
    </>
  )}
</form.Field>
```
