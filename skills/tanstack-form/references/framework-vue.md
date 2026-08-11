# Vue adapter

Vue-specific setup and behavior.

<a id="source-form-docs-framework-vue-guides-arrays-md"></a>

## Arrays

Source: `form:docs/framework/vue/guides/arrays.md`.

TanStack Form supports arrays as values in a form, including sub-object values inside of an array.

### Basic Usage

To use an array, you can use `field.state.value` on an array value in conjunction with `v-for`:

```vue
<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'

const form = useForm({
  defaultValues: {
    people: [] as Array<{ age: number; name: string }>,
  },
  onSubmit: ({ value }) => alert(JSON.stringify(value)),
})
</script>

<template>
  <form.Field name="people" mode="array">
    <template v-slot="{ field, state }">
      <div>
        <form.Field
          v-for="(_, i) of field.state.value"
          :key="i"
          :name="`people[${i}].name`"
        >
          <template v-slot="{ field: subField, state }">
            <!-- ... -->
          </template>
        </form.Field>
      </div>
    </template>
  </form.Field>
</template>
```

This will generate the mapped slot every time you run `pushValue` on `field`:

```vue
<button @click="field.pushValue({ name: '', age: 0 })" type="button">
  Add person
</button>
```

Finally, you can use a subfield like so:

```vue
<form.Field
  v-for="(_, i) of field.state.value"
  :key="i"
  :name="`people[${i}].name`"
>
  <template v-slot="{ field: subField, state }">
    <div>
      <label>
        <div>Name for person {{ i }}</div>
        <input
          :value="subField.state.value"
          @input="
          (e) =>
          subField.handleChange(
            (e.target as HTMLInputElement).value,
          )
          "
        />
      </label>
    </div>
  </template>
</form.Field>
```

### Full Example

```vue
<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'

const form = useForm({
  defaultValues: {
    people: [] as Array<{ age: number; name: string }>,
  },
  onSubmit: ({ value }) => alert(JSON.stringify(value)),
})
</script>

<template>
  <form
    @submit="
      (e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }
    "
  >
    <div>
      <form.Field name="people" mode="array">
        <template v-slot="{ field, state }">
          <div>
            <form.Field
              v-for="(_, i) of field.state.value"
              :key="i"
              :name="`people[${i}].name`"
            >
              <template v-slot="{ field: subField, state }">
                <div>
                  <label>
                    <div>Name for person {{ i }}</div>
                    <input
                      :value="subField.state.value"
                      @input="
                        (e) =>
                          subField.handleChange(
                            (e.target as HTMLInputElement).value,
                          )
                      "
                    />
                  </label>
                </div>
              </template>
            </form.Field>

            <button
              @click="field.pushValue({ name: '', age: 0 })"
              type="button"
            >
              Add person
            </button>
          </div>
        </template>
      </form.Field>
    </div>
    <form.Subscribe>
      <template v-slot="{ canSubmit, isSubmitting }">
        <button type="submit" :disabled="!canSubmit">
          {{ isSubmitting ? '...' : 'Submit' }}
        </button>
      </template>
    </form.Subscribe>
  </form>
</template>
```

<a id="source-form-docs-framework-vue-guides-async-initial-values-md"></a>

## Async Initial Values

Source: `form:docs/framework/vue/guides/async-initial-values.md`.

Let's say that you want to fetch some data from an API and use it as the initial value of a form.

While this problem sounds simple on the surface, there are hidden complexities you might not have thought of thus far.

For example, you might want to show a loading spinner while the data is being fetched, or you might want to handle errors gracefully.

Likewise, you could also find yourself looking for a way to cache the data so that you don't have to fetch it every time the form is rendered.

While we could implement many of these features from scratch, it would end up looking a lot like another project we maintain: [TanStack Query](https://tanstack.com/query).

As such, this guide shows you how you can mix-n-match TanStack Form with TanStack Query to achieve the desired behavior.

### Basic Usage

```vue
<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { useQuery } from '@tanstack/vue-query'
import { watchEffect, reactive, computed } from 'vue'

const { data, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { firstName: 'FirstName', lastName: 'LastName' }
  },
})

const firstName = computed(() => data.value?.firstName || '')
const lastName = computed(() => data.value?.lastName || '')

const defaultValues = reactive({
  firstName,
  lastName,
})

const form = useForm({
  defaultValues,
  onSubmit: async ({ value }) => {
    // Do something with form data
    console.log(value)
  },
})
</script>

<template>
  <p v-if="isLoading">Loading..</p>
  <form v-else @submit.prevent.stop="form.handleSubmit">
    <!-- ... -->
  </form>
</template>
```

This will show a loading text until the data is fetched, and then it will render the form with the fetched data as the initial values.

<a id="source-form-docs-framework-vue-guides-basic-concepts-md"></a>

## Basic Concepts

Source: `form:docs/framework/vue/guides/basic-concepts.md`.

This page introduces the basic concepts and terminology used in the `@tanstack/vue-form` library. Familiarizing yourself with these concepts will help you better understand and work with the library.

### Form Options

You can create options for your form so that it can be shared between multiple forms by using the `formOptions` function.

Example:

```ts
const formOpts = formOptions({
  defaultValues: {
    firstName: '',
    lastName: '',
    hobbies: [],
  } as Person,
})
```

### Form Instance

A Form Instance is an object that represents an individual form and provides methods and properties for working with the form. You create a form instance using the `useForm` function. The function accepts an object with an `onSubmit` function, which is called when the form is submitted.

```js
const form = useForm({
  ...formOpts,
  onSubmit: async ({ value }) => {
    // Do something with form data
    console.log(value)
  },
})
```

You may also create a form instance without using `formOptions` by using the standalone `useForm` API:

```ts
const form = useForm({
  onSubmit: async ({ value }) => {
    // Do something with form data
    console.log(value)
  },
  defaultValues: {
    firstName: '',
    lastName: '',
    hobbies: [],
  } as Person,
})
```

### Field

A Field represents a single form input element, such as a text input or a checkbox. Fields are created using the form.Field component provided by the form instance. The component accepts a name prop, which should match a key in the form's default values. It also accepts a scoped slot defined by the `v-slot` directive which takes a `field` object as its argument.

Example:

```vue
<template>
  <!-- ... -->
  <form.Field name="fullName">
    <template v-slot="{ field }">
      <input
        :name="field.name"
        :value="field.state.value"
        @blur="field.handleBlur"
        @input="(e) => field.handleChange(e.target.value)"
      />
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

### Field State

Each field has its own state, which includes its current value, validation status, error messages, and other metadata. You can access a field's state using the `field().state` property.

Example:

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

### Field API

The Field API is an object provided by a scoped slot using the `v-slot` directive. This slot receives an argument named `field` that provides methods and properties for working with the field's state.

Example:

```vue
<template v-slot="{ field }">
  <input
    :name="field.name"
    :value="field.state.value"
    @blur="field.handleBlur"
    @input="(e) => field.handleChange(e.target.value)"
  />
</template>
```

### Validation

`@tanstack/vue-form` provides both synchronous and asynchronous validation out of the box. Validation functions can be passed to the `form.Field` component using the `validators` prop.

Example:

```vue
<template>
    <!-- ... -->
    <form.Field
        name="firstName"
        :validators="{
            onChange: ({ value }) =>
                !value
                    ? `A first name is required`
                    : value.length < 3
                        ? `First name must be at least 3 characters`
                        : undefined,
            onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                return value.includes('error') && 'No "error" allowed in first name'
        },
    }"
    >
        <template v-slot="{ field }">
            <input
                :value="field.state.value"
                @input="(e) => field.handleChange(e.target.value)"
                @blur="field.handleBlur"
            />
            <FieldInfo :field="field" />
        </template>
    </form.Field>
    <!-- ... -->
</template>
```

### Validation with Standard Schema Libraries

In addition to hand-rolled validation options, we also support the [Standard Schema](https://github.com/standard-schema/standard-schema) specification.

You can define a schema using any of the libraries implementing the specification and pass it to a form or field validator.

Supported libraries include:

- [Zod](https://zod.dev/) (v3.24.0 or higher)
- [Valibot](https://valibot.dev/) (v1.0.0 or higher)
- [ArkType](https://arktype.io/) (v2.1.20 or higher)
- [Yup](https://github.com/jquense/yup) (v1.7.0 or higher)

```vue
<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'

const form = useForm({
  // ...
})

const onChangeFirstName = z.string().refine(
  async (value) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return !value.includes('error')
  },
  {
    message: "No 'error' allowed in first name",
  },
)
</script>

<template>
  <!-- ... -->
  <form.Field
    name="firstName"
    :validators="{
      onChange: z.string().min(3, 'First name must be at least 3 characters'),
      onChangeAsyncDebounceMs: 500,
      onChangeAsync: onChangeFirstName,
    }"
  >
    <template v-slot="{ field, state }">
      <label :htmlFor="field.name">First Name:</label>
      <input
        :id="field.name"
        :name="field.name"
        :value="field.state.value"
        @input="(e) => field.handleChange((e.target as HTMLInputElement).value)"
        @blur="field.handleBlur"
      />
      <FieldInfo :state="state" />
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

### Reactivity

`@tanstack/vue-form` offers various ways to subscribe to form and field state changes, most notably the `form.useSelector` method and the `form.Subscribe` component. These methods allow you to optimize your form's rendering performance by only updating components when necessary.

Example:

```vue
<script setup lang="ts">
// ...
const firstName = form.useSelector((state) => state.values.firstName)
</script>

<template>
  <!-- ... -->
  <form.Subscribe>
    <template v-slot="{ canSubmit, isSubmitting }">
      <button type="submit" :disabled="!canSubmit">
        {{ isSubmitting ? '...' : 'Submit' }}
      </button>
    </template>
  </form.Subscribe>
  <!-- ... -->
</template>
```

### Listeners

`@tanstack/vue-form` allows you to react to specific triggers and "listen" to them to dispatch side effects.

Example:

```vue
<template>
  <form.Field
    name="country"
    :listeners="{
      onChange: ({ value }) => {
        console.log(`Country changed to: ${value}, resetting province`)
        form.setFieldValue('province', '')
      },
    }"
  >
    <template v-slot="{ field }">
      <input
        :value="field.state.value"
        @input="(e) => field.handleChange(e.target.value)"
      />
    </template>
  </form.Field>
</template>
```

More information can be found at [Listeners](./framework-vue.md#source-form-docs-framework-vue-guides-listeners-md)

Note: The usage of the `form.useField` method to achieve reactivity is discouraged since it is designed to be used thoughtfully within the `form.Field` component. You might want to use `form.useSelector` instead.

### Array Fields

Array fields allow you to manage a list of values within a form, such as a list of hobbies. You can create an array field using the `form.Field` component with the `mode="array"` prop.

When working with array fields, you can use the fields `pushValue`, `removeValue`, `swapValues` and `moveValue` methods to add, remove, swap, and move a value from one index to another within the array, respectively. Additional helper methods such as `insertValue`, `replaceValue`, and `clearValues` are also available for inserting, replacing, and clearing array values.

Example:

```vue
<template>
  <form @submit.prevent.stop="form.handleSubmit">
    <form.Field name="hobbies" mode="array">
      <template v-slot="{ field: hobbiesField }">
        <div>
          Hobbies
          <div>
            <div
              v-if="
                Array.isArray(hobbiesField.state.value) &&
                !hobbiesField.state.value.length
              "
            >
              No hobbies found.
            </div>
            <div v-else>
              <div v-for="(_, i) in hobbiesField.state.value" :key="i">
                <form.Field :name="`hobbies[${i}].name`">
                  <template v-slot="{ field }">
                    <div>
                      <label :for="field.name">Name:</label>
                      <input
                        :id="field.name"
                        :name="field.name"
                        :value="field.state.value"
                        @blur="field.handleBlur"
                        @input="(e) => field.handleChange(e.target.value)"
                      />
                      <button
                        type="button"
                        @click="hobbiesField.removeValue(i)"
                      >
                        X
                      </button>
                      <FieldInfo :field="field" />
                    </div>
                  </template>
                </form.Field>
                <form.Field :name="`hobbies[${i}].description`">
                  <template v-slot="{ field }">
                    <div>
                      <label :for="field.name">Description:</label>
                      <input
                        :id="field.name"
                        :name="field.name"
                        :value="field.state.value"
                        @blur="field.handleBlur"
                        @input="(e) => field.handleChange(e.target.value)"
                      />
                      <FieldInfo :field="field" />
                    </div>
                  </template>
                </form.Field>
              </div>
            </div>
            <button
              type="button"
              @click="
                hobbiesField.pushValue({
                  name: '',
                  description: '',
                  yearsOfExperience: 0,
                })
              "
            >
              Add hobby
            </button>
          </div>
        </div>
      </template>
    </form.Field>
  </form>
</template>
```

These are the basic concepts and terminology used in the `@tanstack/vue-form` library. Understanding these concepts will help you work more effectively with the library and create complex forms with ease.

<a id="source-form-docs-framework-vue-guides-dynamic-validation-md"></a>

## Dynamic Validation

Source: `form:docs/framework/vue/guides/dynamic-validation.md`.

In many cases, you want to change the validation rules based depending on the state of the form or other conditions. The most popular
example of this is when you want to validate a field differently based on whether the user has submitted the form for the first time or not.

We support this through our `onDynamic` validation function.

```vue
<script setup lang="ts">
import { revalidateLogic, useForm } from '@tanstack/vue-form'

// ...

const form = useForm({
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
</script>
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

```vue
<script setup lang="ts">
const form = useForm({
  // ...
  validationLogic: revalidateLogic({
    mode: 'submit',
    modeAfterSubmission: 'blur',
  }),
  // ...
})
</script>
```

### Accessing Errors

Just as you might access errors from an `onChange` or `onBlur` validation, you can access the errors from the `onDynamic` validation function using the `form.state.errorMap` object.

```vue
<script setup lang="ts">
const form = useForm({
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
</script>

<template>
  <p>{{ form.state.errorMap.onDynamic?.firstName }}</p>
</template>
```

### Usage with Other Validation Logic

You can use `onDynamic` validation alongside other validation logic, such as `onChange` or `onBlur`.

```vue
<script setup lang="ts">
import { revalidateLogic, useForm } from '@tanstack/vue-form'

const form = useForm({
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
</script>

<template>
  <div>
    <p>{{ form.state.errorMap.onChange?.firstName }}</p>
    <p>{{ form.state.errorMap.onDynamic?.lastName }}</p>
  </div>
</template>
```

#### Usage with Fields

You can also use `onDynamic` validation with fields, just like you would with other validation logic.

```vue
<script setup lang="ts">
const form = useForm({
  defaultValues: {
    name: '',
    age: 0,
  },
  validationLogic: revalidateLogic(),
  onSubmit({ value }) {
    alert(JSON.stringify(value))
  },
})
</script>

<template>
  <form
    @submit="
      (e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }
    "
  >
    <form.Field
      name="age"
      :validators="{
        onDynamic: ({ value }) =>
          value > 18 ? undefined : 'Age must be greater than 18',
      }"
    >
      <template v-slot="{ field }">
        <div>
          <input
            type="number"
            :value="field.state.value"
            @input="
              (e) =>
                field.handleChange((e.target as HTMLInputElement).valueAsNumber)
            "
            @blur="field.handleBlur"
          />
          <p style="color: red">
            {{ field.state.meta.errorMap.onDynamic }}
          </p>
        </div>
      </template>
    </form.Field>
    <button type="submit">Submit</button>
  </form>
</template>
```

#### Async Validation

Async validation can also be used with `onDynamic` just like with other validation logic. You can even debounce the async validation to avoid excessive calls.

```vue
<script setup lang="ts">
const form = useForm({
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
</script>
```

#### Standard Schema Validation

You can also use standard schema validation libraries like Valibot or Zod with `onDynamic` validation. This allows you to define complex validation rules that can change dynamically based on the form state.

```vue
<script setup lang="ts">
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1, 'A first name is required'),
  lastName: z.string().min(1, 'A last name is required'),
})

const form = useForm({
  defaultValues: {
    firstName: '',
    lastName: '',
  },
  validationLogic: revalidateLogic(),
  validators: {
    onDynamic: schema,
  },
})
</script>
```

<a id="source-form-docs-framework-vue-guides-form-groups-md"></a>

## Form Groups

Source: `form:docs/framework/vue/guides/form-groups.md`.

When building a multi-stage form that has many stages, like so:

![Form stepper](./doc-assets/assets/stepper.png)

It's common for each step to have its own form. However, this complicates the form submission and validation process by requiring you to add complex logic.

Luckily, TanStack Form provides a way to build out sub-forms that make this kind of development trivial to implement: `<form.FormGroup>`.

### Usage

To use a form group in TanStack Form, you'll use `useForm` to create a `form` variable, then reference its `FormGroup` component like you would a `Field`:

```vue
<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'

const form = useForm({
  defaultValues: {
    step1: {
      name: '',
    },
    step2: {
      age: 0,
    },
  },
})
</script>

<template>
  <form.FormGroup name="step1" v-slot="{ group: formGroup }">
    <!-- `formGroup` here has all of the form-like methods you'd expect like `deleteField` or `insertFieldValue` -->
    <!-- ... -->
  </form.FormGroup>
</template>
```

This becomes much more useful when paired with external state to conditionally render a `FormGroup`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '@tanstack/vue-form'

const step = ref(0)

const form = useForm({
  defaultValues: {
    step1: {
      name: '',
    },
    step2: {
      age: 0,
    },
  },
})

const onGroupSubmit = () => {
  step.value++
}

const onGroupSubmitInvalid = () => {
  // Or handle invalid submissions, just like a top-level form
}
</script>

<template>
  <form.FormGroup
    v-if="step === 0"
    name="step1"
    :onGroupSubmit="onGroupSubmit"
    :onGroupSubmitInvalid="onGroupSubmitInvalid"
    :onSubmitMeta="{} as SomeType"
    v-slot="{ group: formGroup }"
  >
    <form @submit.prevent.stop="formGroup.handleSubmit()">
      <!-- Use `formGroup.handleSubmit()` to submit the sub-form, but not the parent form -->
      <!-- ... -->
    </form>
  </form.FormGroup>
  <form.FormGroup
    v-if="step === 1"
    name="step2"
    :onGroupSubmit="() => form.handleSubmit()"
    v-slot="{ group: formGroup }"
  >
    <form @submit.prevent.stop="formGroup.handleSubmit()">
      <!-- Then, use `form.handleSubmit()` to submit the entire form -->
      <!-- ... -->
    </form>
  </form.FormGroup>
</template>
```

### Form Group Validation

Form groups have a distinct validation proceedure that we think makes sense for sub-forms:

- Form groups can have their own validation:

```vue
<template>
  <form.FormGroup
    name="step1"
    :validators="{ onChange: () => 'Error' }"
    v-slot="{ group: formGroup }"
  >
    <!-- formGroup.state.meta.errorMap // {onChange: "Error" | undefined} -->
    <!-- formGroup.state.meta.errors // ("Error")[] -->
  </form.FormGroup>
</template>
```

- Can set errors on sub-fields:

```vue
<template>
  <form.FormGroup
    name="step1"
    :validators="{
      onChange: ({ value, groupApi }) => ({
        group: value.name === 'error' ? 'Group error' : undefined,
        fields: {
          // Must use the name of the field relative to the FormGroup as the error key,
          // to stay consistent with how standard schema works with form groups
          name: value.name === 'error' ? 'Field error' : undefined,
        },
      }),
    }"
  />
</template>
```

- And can even accept standard schemas:

```vue
<template>
  <form.FormGroup
    name="step1"
    :validators="{
      onChange: z.object({
        name: z.string().min(2),
      }),
    }"
  />
</template>
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

If you want to use [dynamic validation (`onDynamic`)](./framework-vue.md#source-form-docs-framework-vue-guides-dynamic-validation-md) with a form group, do not rely on the `onDynamic` validator passed to `useForm`:

```ts
useForm({
  validationLogic: revalidateLogic(),
  validators: {
    // This validator will not run `onChange` when a sub-form is submitted;
    // it will only run `onChange` when the form itself is submitted.
    onDynamic: schema,
  },
})
```

Instead, pass your sub-schema for the group to the `onDynamic` validation of the `FormGroup` itself:

```vue
<template>
  <form.FormGroup name="step1" :validators="{ onDynamic: step1Schema }" />
</template>
```

It will treat `formGroup.submissionAttempts` as the way to change what validator is ran before/after submit.

### Form Group State

Just like you're able to access `formGroup.state.meta.errors`, you're also able to access the group's value using `formGroup.state.value`. Likewise, here are some valuable properties you can access in the `formGroup.state.meta`:

- `formGroup.state.meta.isFieldsValid`: `true` when the field-level validators have no errors
- `formGroup.state.meta.isGroupValid`: `true` when the group-level validators have no errors
- `formGroup.state.meta.isValid`: `true` when both the field-level and group-level validators have no errors
- `formGroup.state.meta.isSubmitting`: `true` when the group is in the process of being submitted

<a id="source-form-docs-framework-vue-guides-linked-fields-md"></a>

## Linked Fields

Source: `form:docs/framework/vue/guides/linked-fields.md`.

You may find yourself needing to link two fields together; when one is validated as another field's value has changed.
One such usage is when you have both a `password` and `confirm_password` field,
where you want to `confirm_password` to error out when `password`'s value does not match;
regardless of which field triggered the value change.

Imagine the following userflow:

- User updates confirm password field.
- User updates the non-confirm password field.

In this example, the form will still have errors present,
as the "confirm password" field validation has not been re-ran to mark as accepted.

To solve this, we need to make sure that the "confirm password" validation is re-run when the password field is updated.
To do this, you can add a `onChangeListenTo` property to the `confirm_password` field.

```vue
<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'

const form = useForm({
  defaultValues: {
    password: '',
    confirm_password: '',
  },
  // ...
})
</script>

<template>
  <div>
    <form @submit.prevent.stop="form.handleSubmit">
      <div>
        <form.Field name="password">
          <template v-slot="{ field }">
            <div>Password:</div>
            <input
              :value="field.state.value"
              @input="
                (e) => field.handleChange((e.target as HTMLInputElement).value)
              "
            />
          </template>
        </form.Field>
        <form.Field
          name="confirm_password"
          :validators="{
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) => {
              if (value !== fieldApi.form.getFieldValue('password')) {
                return 'Passwords do not match'
              }
              return undefined
            },
          }"
        >
          <template v-slot="{ field }">
            <div>Confirm Password:</div>
            <input
              :value="field.state.value"
              @input="
                (e) => field.handleChange((e.target as HTMLInputElement).value)
              "
            />
            <div v-for="(err, index) in field.state.meta.errors" :key="index">
              {{ err }}
            </div>
          </template>
        </form.Field>
      </div>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>
```

This similarly works with `onBlurListenTo` property, which will re-run the validation when the field is blurred.

<a id="source-form-docs-framework-vue-guides-listeners-md"></a>

## Listeners

Source: `form:docs/framework/vue/guides/listeners.md`.

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

```vue
<script setup>
import { useForm } from '@tanstack/vue-form'

const form = useForm({
  defaultValues: {
    country: '',
    province: '',
  },
  // ...
})
</script>

<template>
  <div>
    <form.Field
      name="country"
      :listeners="{
        onChange: ({ value }) => {
          console.log(`Country changed to: ${value}, resetting province`)
          form.setFieldValue('province', '')
        },
      }"
    >
      <template v-slot="{ field }">
        <input
          :value="field.state.value"
          @input="(e) => field.handleChange(e.target.value)"
        />
      </template>
    </form.Field>

    <form.Field name="province">
      <template v-slot="{ field }">
        <input
          :value="field.state.value"
          @input="(e) => field.handleChange(e.target.value)"
        />
      </template>
    </form.Field>
  </div>
</template>
```

#### Built-in Debouncing

If you are making an API request inside a listener, you may want to debounce the calls as it can lead to performance issues.
We enable an easy method for debouncing your listeners by adding a `onChangeDebounceMs` or `onBlurDebounceMs`.

```vue
<template>
  <!-- ... -->
  <form.Field
    name="country"
    :listeners="{
      onChangeDebounceMs: 500,
      onChange: ({ value }) => {
        console.log(
          `Country changed to: ${value} without a change within 500ms, resetting province`,
        )
        form.setFieldValue('province', '')
      },
    }"
  >
    <template v-slot="{ field }">
      <!-- ... -->
    </template>
  </form.Field>
</template>
```

#### Form listeners

At a higher level, listeners are also available at the form level, allowing you access to the `onMount` and `onSubmit` events, and having `onChange` and `onBlur` propagated to all the form's children. Form-level listeners can also be debounced in the same way as previously discussed.

`onMount` and `onSubmit` listeners have the following parameters:

- `formApi`

`onChange` and `onBlur` listeners have access to:

- `fieldApi`
- `formApi`

```vue
<script setup>
import { useForm } from '@tanstack/vue-form'

const form = useForm({
  listeners: {
    onMount: ({ formApi }) => {
      // custom logging service
      loggingService('mount', formApi.state.values)
    },

    onChange: ({ formApi, fieldApi }) => {
      // autosave logic
      if (formApi.state.isValid) {
        formApi.handleSubmit()
      }

      // fieldApi represents the field that triggered the event.
      console.log(fieldApi.name, fieldApi.state.value)
    },
    onChangeDebounceMs: 500,
  },
})
</script>
```

<a id="source-form-docs-framework-vue-guides-submission-handling-md"></a>

## Submission Handling

Source: `form:docs/framework/vue/guides/submission-handling.md`.

### Passing additional data to submission handling

You may have multiple types of submission behaviour, for example, going back to another page or staying on the form.
You can accomplish this by specifying the `onSubmitMeta` property. This meta data will be passed to the `onSubmit` function.

> Note: if `form.handleSubmit()` is called without metadata, it will use the provided default.

```vue
<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'

type FormMeta = {
  submitAction: 'continue' | 'backToMenu' | null
}

// Metadata is not required to call form.handleSubmit().
// Specify what values to use as default if no meta is passed
const defaultMeta: FormMeta = {
  submitAction: null,
}

const form = useForm({
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
</script>

<template>
  <form @submit.prevent.stop="">
    <button
      type="submit"
      @click="
        () => {
          // Overwrites the default specified in onSubmitMeta
          form.handleSubmit({ submitAction: 'continue' })
        }
      "
    >
      Submit and continue
    </button>
    <button
      type="submit"
      @click="() => form.handleSubmit({ submitAction: 'backToMenu' })"
    >
      Submit and back to menu
    </button>
  </form>
</template>
```

### Transforming data with Standard Schemas

While Tanstack Form provides [Standard Schema support](./framework-vue.md#source-form-docs-framework-vue-guides-validation-md) for validation, it does not preserve the Schema's output data.

The value passed to the `onSubmit` function will always be the input data. To receive the output data of a Standard Schema, parse it in the `onSubmit` function:

```vue
<script setup lang="ts">
import { z } from 'zod'
import { useForm } from '@tanstack/vue-form'

const schema = z.object({
  age: z.string().transform((age) => Number(age)),
})

// Tanstack form uses the input type of Standard Schemas
const defaultValues: z.input<typeof schema> = {
  age: '13',
}

const form = useForm({
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
</script>
<template>
  <!-- ... -->
</template>
```

<a id="source-form-docs-framework-vue-guides-validation-md"></a>

## Validation

Source: `form:docs/framework/vue/guides/validation.md`.

At the core of TanStack Form's functionalities is the concept of validation. TanStack Form makes validation highly customizable:

- You can control when to perform the validation (on change, on input, on blur, on submit...)
- Validation rules can be defined at the field level or at the form level
- Validation can be synchronous or asynchronous (for example, as a result of an API call)

### When is validation performed?

It's up to you! The `<Field />` component accepts some callbacks as props such as `onChange` or `onBlur`. Those callbacks are passed the current value of the field, as well as the `fieldAPI` object, so that you can perform the validation. If you find a validation error, simply return the error message as string and it will be available in `field.state.meta.errors`.

Here is an example:

```vue
<template>
  <!-- ... -->
  <form.Field
    name="age"
    :validators="{
      onChange: ({ value }) =>
        value < 13 ? 'You must be 13 to make an account' : undefined,
    }"
  >
    <template v-slot="{ field }">
      <label :for="field.name">Age:</label>
      <input
        :id="field.name"
        :name="field.name"
        :value="field.state.value"
        type="number"
        @input="(e) => field.handleChange((e.target as HTMLInputElement).valueAsNumber)
                "
      />
      <em role="alert" v-if="!field.state.meta.isValid">{{
        field.state.meta.errors.join(', ')
      }}</em>
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

In the example above, the validation is done at each keystroke (`onChange`). If, instead, we wanted the validation to be done when the field is blurred, we would change the code above like so:

```vue
<template>
  <!-- ... -->
  <form.Field
    name="age"
    :validators="{
      onBlur: ({ value }) =>
        value < 13 ? 'You must be 13 to make an account' : undefined,
    }"
  >
    <template v-slot="{ field }">
      <label :for="field.name">Age:</label>
      <!-- We always need to implement onChange, so that TanStack Form receives the changes -->
      <!-- Listen to the onBlur event on the field -->
      <input
        :id="field.name"
        :name="field.name"
        :value="field.state.value"
        type="number"
        @blur="field.handleBlur"
        @input="(e) => field.handleChange((e.target as HTMLInputElement).valueAsNumber)
                "
      />
      <em role="alert" v-if="!field.state.meta.isValid">{{
        field.state.meta.errors.join(', ')
      }}</em>
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

So you can control when the validation is done by implementing the desired callback. You can even perform different pieces of validation at different times:

```vue
<template>
  <!-- ... -->
  <form.Field
    name="age"
    :validators="{
      onChange: ({ value }) =>
        value < 13 ? 'You must be 13 to make an account' : undefined,
      onBlur: ({ value }) => (value < 0 ? 'Invalid value' : undefined),
    }"
  >
    <template v-slot="{ field }">
      <label :for="field.name">Age:</label>
      <!-- We always need to implement onChange, so that TanStack Form receives the changes -->
      <!-- Listen to the onBlur event on the field -->
      <input
        :id="field.name"
        :name="field.name"
        :value="field.state.value"
        type="number"
        @blur="field.handleBlur"
        @input="(e) => field.handleChange((e.target as HTMLInputElement).valueAsNumber)
                "
      />
      <em role="alert" v-if="!field.state.meta.isValid">{{
        field.state.meta.errors.join(', ')
      }}</em>
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

In the example above, we are validating different things on the same field at different times (at each keystroke and when blurring the field). Since `field.state.meta.errors` is an array, all the relevant errors at a given time are displayed. You can also use `field.state.meta.errorMap` to get errors based on _when_ the validation was done (onChange, onBlur etc...). More info about displaying errors below.

### Displaying Errors

Once you have your validation in place, you can map the errors from an array to be displayed in your UI:

```vue
<template>
  <!-- ... -->
  <form.Field
    name="age"
    :validators="{
      onChange: ({ value }) =>
        value < 13 ? 'You must be 13 to make an account' : undefined,
    }"
  >
    <template v-slot="{ field }">
      <!-- ... -->
      <em role="alert" v-if="!field.state.meta.isValid">{{
        field.state.meta.errors.join(', ')
      }}</em>
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

Or use the `errorMap` property to access the specific error you're looking for:

```vue
<template>
  <!-- ... -->
  <form.Field
    name="age"
    :validators="{
      onChange: ({ value }) =>
        value < 13 ? 'You must be 13 to make an account' : undefined,
    }"
  >
    <template v-slot="{ field }">
      <!-- ... -->
      <em role="alert" v-if="field.state.meta.errorMap['onChange']">{{
        field.state.meta.errorMap['onChange']
      }}</em>
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

It's worth mentioning that our `errors` array and the `errorMap` matches the types returned by the validators. This means that:

```vue
<form.Field
  name="age"
  :validators="{
    onChange: ({ value }) => (value < 13 ? { isOldEnough: false } : undefined),
  }"
>
  <template v-slot="{ field }">
      <!-- ... -->
      <!-- errorMap.onChange is type `{isOldEnough: false} | undefined` -->
	  <!-- meta.errors is type `Array<{isOldEnough: false} | undefined>` -->
      <em v-if="!field.state.meta.errorMap['onChange']?.isOldEnough">The user is not old enough</em>
  </template>
</form.Field>
```

### Validation at field level vs at form level

As shown above, each `<Field>` accepts its own validation rules via the `onChange`, `onBlur` etc... callbacks. It is also possible to define validation rules at the form level (as opposed to field by field) by passing similar callbacks to the `useForm()` function.

Example:

```vue
<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'

const form = useForm({
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

// Subscribe to the form's error map so that updates to it will render
// alternately, you can use `form.Subscribe`
const formErrorMap = form.useSelector((state) => state.errorMap)
</script>

<template>
  <!-- ... -->
  <div v-if="formErrorMap.onChange">
    <em role="alert">
      There was an error on the form: {{ formErrorMap.onChange }}
    </em>
  </div>
  <!-- ... -->
</template>
```

#### Setting field-level errors from the form's validators

You can set errors on the fields from the form's validators. One common use case for this is validating all the fields on submit by calling a single API endpoint in the form's `onSubmitAsync` validator.

```vue
<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'

const form = useForm({
  defaultValues: {
    age: 0,
    socials: [],
    details: {
      email: '',
    },
  },
  validators: {
    // Add validators to the form the same way you would add them to a field
    onSubmitAsync({ value }) {
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
</script>

<template>
  <!-- ... -->
</template>
```

> Something worth mentioning is that if you have a form validation function that returns an error, that error may be overwritten by the field-specific validation.
>
> This means that:
>
> ```vue
> <script setup lang="ts">
> import { useForm } from '@tanstack/vue-form'
>
> const form = useForm({
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
> </script>
>
> <template>
>   <!-- ... -->
>   <form.Field
>     name="age"
>     :validators="{
>       onChange: ({ value }) => (value % 2 === 0 ? 'Must be odd!' : undefined),
>     }"
>   >
>     <template v-slot="{ field }">
>       <!-- ... -->
>     </template>
>   </form.Field>
> </template>
> ```
>
> Will only show `'Must be odd!` even if the 'Too young!' error is returned by the form-level validation.

### Asynchronous Functional Validation

While we suspect most validations will be synchronous, there are many instances where a network call or some other async operation would be useful to validate against.

To do this, we have dedicated `onChangeAsync`, `onBlurAsync`, and other methods that can be used to validate against:

```vue
<script setup lang="ts">
// ...

const onChangeAge = async ({ value }) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return value < 13 ? 'You must be 13 to make an account' : undefined
}
</script>

<template>
  <!-- ... -->
  <form.Field
    name="age"
    :validators="{
      onChangeAsync: onChangeAge,
    }"
  >
    <template v-slot="{ field }">
      <label :for="field.name">Age:</label>
      <input
        :id="field.name"
        :name="field.name"
        :value="field.state.value"
        type="number"
        @input="
          (e) =>
            field.handleChange((e.target as HTMLInputElement).valueAsNumber)
        "
      />
      <em role="alert" v-if="!field.state.meta.isValid">{{
        field.state.meta.errors.join(', ')
      }}</em>
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

Synchronous and Asynchronous validations can coexist. For example, it is possible to define both `onBlur` and `onBlurAsync` on the same field:

```vue
<script setup lang="ts">
// ...

const onBlurAge = ({ value }) => (value < 0 ? 'Invalid value' : undefined)

const onBlurAgeAsync = async ({ value }) => {
  const currentAge = await fetchCurrentAgeOnProfile()
  return value < currentAge ? 'You can only increase the age' : undefined
}
</script>

<template>
  <!-- ... -->
  <form.Field
    name="age"
    :validators="{
      onBlur: onBlurAge,
      onBlurAsync: onBlurAgeAsync,
    }"
  >
    <template v-slot="{ field }">
      <label :for="field.name">Age:</label>
      <input
        :id="field.name"
        :name="field.name"
        :value="field.state.value"
        type="number"
        @blur="field.handleBlur"
        @input="
          (e) =>
            field.handleChange((e.target as HTMLInputElement).valueAsNumber)
        "
      />
      <em role="alert" v-if="!field.state.meta.isValid">{{
        field.state.meta.errors.join(', ')
      }}</em>
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

The synchronous validation method (`onBlur`) is run first and the asynchronous method (`onBlurAsync`) is only run if the synchronous one (`onBlur`) succeeds. To change this behaviour, set the `asyncAlways` option to `true`, and the async method will be run regardless of the result of the sync method.

#### Built-in Debouncing

While async calls are the way to go when validating against the database, running a network request on every keystroke is a good way to DDOS your database.

Instead, we enable an easy method for debouncing your `async` calls by adding a single property:

```vue
<template>
  <!-- ... -->
  <form.Field
    name="age"
    :async-debounce-ms="500"
    :validators="{
      onChangeAsync: async ({ value }) => {
        // ...
      },
    }"
  >
    <template v-slot="{ field }">
      <!-- ... -->
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

This will debounce every async call with a 500ms delay. You can even override this property on a per-validation property:

```vue
<template>
  <!-- ... -->
  <form.Field
    name="age"
    :async-debounce-ms="500"
    :validators="{
      onChangeAsyncDebounceMs: 1500,
      onChangeAsync: async ({ value }) => {
        // ...
      },
      onBlurAsync: async ({ value }) => {
        // ...
      },
    }"
  >
    <template v-slot="{ field }">
      <!-- ... -->
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

This will run `onChangeAsync` every 1500ms while `onBlurAsync` will run every 500ms.

### Validation through Schema Libraries

While functions provide more flexibility and customization over your validation, they can be a bit verbose. To help solve this, there are libraries that provide schema-based validation to make shorthand and type-strict validation substantially easier. You can also define a single schema for your entire form and pass it to the form level, errors will be automatically propagated to the fields.

#### Standard Schema Libraries

TanStack Form natively supports all libraries following the [Standard Schema specification](https://github.com/standard-schema/standard-schema), most notably:

- [Zod](https://zod.dev/)
- [Valibot](https://valibot.dev/)
- [ArkType](https://arktype.io/)

_Note:_ make sure to use the latest version of the schema libraries as older versions might not support Standard Schema yet.

> Validation will not provide you with transformed values. See [submission handling](./framework-vue.md#source-form-docs-framework-vue-guides-submission-handling-md) for more information.

To use schemas from these libraries you can pass them to the `validators` props as you would do with a custom function:

```vue
<script setup lang="ts">
import { z } from 'zod'
// ...

const form = useForm({
  // ...
})
</script>

<template>
  <!-- ... -->
  <form.Field
    name="age"
    :validators="{
      onChange: z.number().gte(13, 'You must be 13 to make an account'),
    }"
  >
    <template v-slot="{ field }">
      <!-- ... -->
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

Async validations on form and field level are supported as well:

```vue
<template>
  <!-- ... -->
  <form.Field
    name="age"
    :validators="{
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
    }"
  >
    <template v-slot="{ field }">
      <!-- ... -->
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

If you need even more control over your Standard Schema validation, you can combine a Standard Schema with a callback function like so:

```vue
<template>
  <!-- ... -->
  <form.Field
    name="age"
    :validators="{
      onChange: ({ value, fieldApi }) => {
        const errors = fieldApi.parseValueWithSchema(
          z.number().gte(13, 'You must be 13 to make an account'),
        )

        if (errors) return errors

        // continue with your validation
      },
    }"
  >
    <template v-slot="{ field }">
      <!-- ... -->
    </template>
  </form.Field>
  <!-- ... -->
</template>
```

### Preventing invalid forms from being submitted

The `onChange`, `onBlur` etc... callbacks are also run when the form is submitted and the submission is blocked if the form is invalid.

The form state object has a `canSubmit` flag that is false when any field is invalid and the form has been touched (`canSubmit` is true until the form has been touched, even if some fields are "technically" invalid based on their `onChange`/`onBlur` props).

You can subscribe to it via `form.Subscribe` and use the value in order to, for example, disable the submit button when the form is invalid (in practice, disabled buttons are not accessible, use `aria-disabled` instead).

```vue
<script setup lang="ts">
const form = useForm(/* ... */)
</script>

<template>
  <!-- ... -->

  <!-- Dynamic submit button -->
  <form.Subscribe>
    <template v-slot="{ canSubmit, isSubmitting }">
      <button type="submit" :disabled="!canSubmit">
        {{ isSubmitting ? '...' : 'Submit' }}
      </button>
    </template>
  </form.Subscribe>
  <!-- ... -->
</template>
```

To prevent the form from being submitted before any interaction, combine `canSubmit` with `isPristine` flags. A simple condition like `!canSubmit || isPristine` effectively disables submissions until the user has made changes.

<a id="source-form-docs-framework-vue-quick-start-md"></a>

## Quick Start

Source: `form:docs/framework/vue/quick-start.md`.

The bare minimum to get started with TanStack Form is to create a form and add a field. Keep in mind that this example does not include any validation or error handling... yet.

```vue
<!-- App.vue -->
<script setup>
import { useForm } from '@tanstack/vue-form'

const form = useForm({
  defaultValues: {
    fullName: '',
  },
  onSubmit: async ({ value }) => {
    // Do something with form data
    console.log(value)
  },
})
</script>

<template>
  <div>
    <form @submit.prevent.stop="form.handleSubmit">
      <div>
        <form.Field name="fullName">
          <template v-slot="{ field }">
            <input
              :name="field.name"
              :value="field.state.value"
              @blur="field.handleBlur"
              @input="(e) => field.handleChange((e.target as HTMLInputElement).value)"
            />
          </template>
        </form.Field>
      </div>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>
```

From here, you'll be ready to explore all of the other features of TanStack Form!
