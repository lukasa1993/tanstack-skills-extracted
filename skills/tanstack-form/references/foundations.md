# Foundations

Overview, installation, philosophy, TypeScript, and comparison.

<a id="source-form-docs-community-resources-md"></a>

All sections are exact duplicates of canonical content in this reference.

<a id="source-form-docs-comparison-md"></a>

## Comparison

Source: `form:docs/comparison.md`.

> ⚠️ This comparison table is under construction and is still not completely accurate. If you use any of these libraries and feel the information could be improved, feel free to suggest changes (with notes or evidence of claims) using the "Edit this page on Github" link at the bottom of this page.

Feature/Capability Key:

- ✅ 1st-class, built-in, and ready to use with no added configuration or code
- 🟡 Supported, but as an unofficial 3rd party or community library/contribution
- 🔶 Supported and documented, but requires extra user-code to implement
- 🛑 Not officially supported or documented.

| Feature                                           | TanStack Form                                | Formik                         | Redux Form                             | React Hook Form                                  | Final Form                             |
| ------------------------------------------------- | -------------------------------------------- | ------------------------------ | -------------------------------------- | ------------------------------------------------ | -------------------------------------- |
| Github Repo / Stars                               | [![][stars-tanstack-form]][gh-tanstack-form] | [![][stars-formik]][gh-formik] | [![][stars-redux-form]][gh-redux-form] | [![][stars-react-hook-form]][gh-react-hook-form] | [![][stars-final-form]][gh-final-form] |
| Supported Frameworks                              | React, Vue, Angular, Solid, Lit              | React                          | React                                  | React                                            | React, Vue, Angular, Solid, Vanilla JS |
| Bundle Size                                       | [![][bp-tanstack-form]][bpl-tanstack-form]   | [![][bp-formik]][bpl-formik]   | [![][bp-redux-form]][bpl-redux-form]   | [![][bp-react-hook-form]][bpl-react-hook-form]   | [![][bp-final-form]][bpl-final-form]   |
| First-class TypeScript support                    | ✅                                           | ❓                             | ❓                                     | ✅                                               | ✅                                     |
| Fully Inferred TypeScript (Including Deep Fields) | ✅                                           | ❓                             | ❓                                     | ✅                                               | 🛑                                     |
| Headless UI components                            | ✅                                           | ❓                             | ❓                                     | ✅                                               | ❓                                     |
| Framework agnostic                                | ✅                                           | ❓                             | ❓                                     | 🛑                                               | ✅                                     |
| Granular reactivity                               | ✅                                           | ❓                             | ❓                                     | ❓                                               | ✅                                     |
| Nested object/array fields                        | ✅                                           | ✅                             | ❓                                     | ✅\*(1)                                          | ✅                                     |
| Async validation                                  | ✅                                           | ✅                             | ❓                                     | ✅                                               | ✅                                     |
| Built-in async validation debounce                | ✅                                           | ❓                             | ❓                                     | ❓                                               | ❓                                     |
| Schema-based Validation                           | ✅                                           | ✅                             | ❓                                     | ✅                                               | ❓                                     |
| First Party Devtools                              | 🛑\*(2)                                      | 🛑                             | ✅\*(3)                                | ✅                                               | ❓                                     |
| SSR integrations                                  | ✅                                           | 🛑                             | 🛑                                     | 🛑                                               | 🛑                                     |
| React Compiler support                            | ✅                                           | ❓                             | ❓                                     | 🛑                                               | ❓                                     |

\*(1) For nested arrays, react-hook-form requires you [to cast the field array by its name](https://react-hook-form.com/docs/usefieldarray) if you're using TypeScript

\*(2) Planned

\*(3) Via Redux Devtools

[bpl-tanstack-form]: https://bundlephobia.com/result?p=@tanstack/react-form
[bp-tanstack-form]: https://badgen.net/bundlephobia/minzip/@tanstack/react-form?label=💾
[gh-tanstack-form]: https://github.com/TanStack/form
[stars-tanstack-form]: https://img.shields.io/github/stars/TanStack/form?label=%F0%9F%8C%9F
[bpl-formik]: https://bundlephobia.com/result?p=formik
[bp-formik]: https://badgen.net/bundlephobia/minzip/formik?label=💾
[gh-formik]: https://github.com/jaredpalmer/formik
[stars-formik]: https://img.shields.io/github/stars/jaredpalmer/formik?label=%F0%9F%8C%9F
[bpl-redux-form]: https://bundlephobia.com/result?p=redux-form
[bp-redux-form]: https://badgen.net/bundlephobia/minzip/redux-form?label=💾
[gh-redux-form]: https://github.com/redux-form/redux-form
[stars-redux-form]: https://img.shields.io/github/stars/redux-form/redux-form?label=%F0%9F%8C%9F
[bpl-react-hook-form]: https://bundlephobia.com/result?p=react-hook-form
[bp-react-hook-form]: https://badgen.net/bundlephobia/minzip/react-hook-form?label=💾
[gh-react-hook-form]: https://github.com/react-hook-form/react-hook-form
[stars-react-hook-form]: https://img.shields.io/github/stars/react-hook-form/react-hook-form?label=%F0%9F%8C%9F
[bpl-final-form]: https://bundlephobia.com/result?p=final-form
[bp-final-form]: https://badgen.net/bundlephobia/minzip/final-form?label=💾
[gh-final-form]: https://github.com/final-form/final-form
[stars-final-form]: https://img.shields.io/github/stars/final-form/final-form?label=%F0%9F%8C%9F

<a id="source-form-docs-installation-md"></a>

## Installation

Source: `form:docs/installation.md`.

TanStack Form is compatible with various front-end frameworks, including React, Vue, Angular, Solid, Lit, and Svelte. Install the corresponding adapter for your framework using your preferred package manager:

<!-- ::start:tabs variant="package-managers" -->

react: @tanstack/react-form
vue: @tanstack/vue-form
angular: @tanstack/angular-form
solid: @tanstack/solid-form
lit: @tanstack/lit-form
svelte: @tanstack/svelte-form

<!-- ::end:tabs -->

<!-- ::start:framework -->

## React

### Meta-frameworks

If you're using a meta-framework, TanStack Form provides additional adapters to streamline integration:

- TanStack Start
- Next.js
- Remix

<!-- ::end:framework -->

<!-- ::start:tabs variant="package-manager" -->

react: @tanstack/react-form-start
react: @tanstack/react-form-nextjs
react: @tanstack/react-form-remix

<!-- ::end:tabs -->

<!-- ::start:framework -->

## React

### Devtools

Developer tools are available using [TanStack Devtools](https://tanstack.com/devtools/latest). Install the devtools adapter for your framework as a dev dependency to debug forms and inspect their state.

## Solid

### Devtools

Developer tools are available using [TanStack Devtools](https://tanstack.com/devtools/latest). Install the devtools adapter for your framework as a dev dependency to debug forms and inspect their state.

<!-- ::end:framework -->

<!-- ::start:tabs variant="package-manager" -->

react: @tanstack/react-devtools
react: @tanstack/react-form-devtools
solid: @tanstack/solid-devtools
solid: @tanstack/solid-form-devtools

<!-- ::end:tabs -->

> [!NOTE]- Polyfill requirements
> Depending on your environment, you might need to add polyfills. If you want to support older browsers, you need to transpile the library from `node_modules` yourself.

<a id="source-form-docs-overview-md"></a>

## Overview

Source: `form:docs/overview.md`.

TanStack Form is the ultimate solution for handling forms in web applications, providing a powerful and flexible approach to form management. Designed with first-class TypeScript support, headless UI components, and a framework-agnostic design, it streamlines form handling and ensures a seamless experience across various front-end frameworks.

### Motivation

Most web frameworks do not offer a comprehensive solution for form handling, leaving developers to create their own custom implementations or rely on less-capable libraries. This often results in a lack of consistency, poor performance, and increased development time. TanStack Form aims to address these challenges by providing an all-in-one solution for managing forms that is both powerful and easy to use.

With TanStack Form, developers can tackle common form-related challenges such as:

- Reactive data binding and state management
- Complex validation and error handling
- Accessibility and responsive design
- Internationalization and localization
- Cross-platform compatibility and custom styling

By providing a complete solution for these challenges, TanStack Form empowers developers to build robust and user-friendly forms with ease.

### Enough talk, show me some code already!

<!-- ::start:framework -->

## React

In the example below, you can see TanStack Form in action with the React framework adapter:

[Open in CodeSandbox](https://codesandbox.io/s/github/tanstack/form/tree/b865ef335a69aa08a2f160895258f13e03773467/examples/react/simple)

<!-- ::start:tabs variant="files" -->

```tsx title="App.tsx"
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'
import { useForm } from '@tanstack/react-form'

import { FieldInfo } from './FieldInfo.tsx'

export default function App() {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })

  return (
    <div>
      <h1>Simple Form Example</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div>
          {/* A type-safe field component*/}
          <form.Field
            name="firstName"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'A first name is required'
                  : value.length < 3
                    ? 'First name must be at least 3 characters'
                    : undefined,
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                return (
                  value.includes('error') && 'No "error" allowed in first name'
                )
              },
            }}
            children={(field) => {
              // Avoid hasty abstractions. Render props are great!
              return (
                <>
                  <label htmlFor={field.name}>First Name:</label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              )
            }}
          />
        </div>
        <div>
          <form.Field
            name="lastName"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Last Name:</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <>
              <button type="submit" disabled={!canSubmit}>
                {isSubmitting ? '...' : 'Submit'}
              </button>
              <button
                type="reset"
                onClick={(e) => {
                  // Avoid unexpected resets of form elements (especially <select> elements)
                  e.preventDefault()
                  form.reset()
                }}
              >
                Reset
              </button>
            </>
          )}
        />
      </form>
    </div>
  )
}

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <React.StrictMode>
    <App />

    <TanStackDevtools
      config={{ hideUntilHover: true }}
      plugins={[formDevtoolsPlugin()]}
    />
  </React.StrictMode>,
)
```

```tsx title="FieldInfo.tsx"
import type { AnyFieldApi } from '@tanstack/react-form'

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em>{field.state.meta.errors.join(',')}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}
```

<!-- ::end:tabs -->

## Vue

In the example below, you can see TanStack Form in action with the Vue framework adapter:

[Open in CodeSandbox](https://codesandbox.io/s/github/tanstack/form/tree/b865ef335a69aa08a2f160895258f13e03773467/examples/vue/simple)

<!-- ::start:tabs variant="files" -->

```vue title="App.vue"
<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import FieldInfo from './FieldInfo.vue'

const form = useForm({
  defaultValues: {
    firstName: '',
    lastName: '',
  },
  onSubmit: async ({ value }) => {
    // Do something with form data
    alert(JSON.stringify(value))
  },
})

async function onChangeFirstName({ value }: { value: string }) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return value.includes(`error`) && `No 'error' allowed in first name`
}
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
      <form.Field
        name="firstName"
        :validators="{
          onChange: ({ value }) =>
            !value
              ? `A first name is required`
              : value.length < 3
                ? `First name must be at least 3 characters`
                : undefined,
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
            @input="
              (e) => field.handleChange((e.target as HTMLInputElement).value)
            "
            @blur="field.handleBlur"
          />
          <FieldInfo :state="state" />
        </template>
      </form.Field>
    </div>
    <div>
      <form.Field name="lastName">
        <template v-slot="{ field, state }">
          <label :htmlFor="field.name">Last Name:</label>
          <input
            :id="field.name"
            :name="field.name"
            :value="field.state.value"
            @input="
              (e) => field.handleChange((e.target as HTMLInputElement).value)
            "
            @blur="field.handleBlur"
          />
          <FieldInfo :state="state" />
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

```vue title="FieldInfo.vue"
<script setup lang="ts">
import { AnyFieldApi } from '@tanstack/vue-form'

const props = defineProps<{
  state: AnyFieldApi['state']
}>()
</script>

<template>
  <template v-if="props.state.meta.isTouched">
    <em v-for="error of props.state.meta.errors">{{ error }}</em>
    {{ props.state.meta.isValidating ? 'Validating...' : null }}
  </template>
</template>
```

<!-- ::end:tabs  -->

## Angular

In the example below, you can see TanStack Form in action with the Angular framework adapter:

[Open in CodeSandbox](https://codesandbox.io/s/github/tanstack/form/tree/b865ef335a69aa08a2f160895258f13e03773467/examples/angular/simple)

<!-- ::start:tabs variant="files" -->

```angular-ts title="app.component.ts"
import { Component } from '@angular/core'
import { TanStackField, injectForm, injectStore } from '@tanstack/angular-form'
import type {
  FieldValidateAsyncFn,
  FieldValidateFn,
} from '@tanstack/angular-form'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TanStackField],
  template: `
    <form (submit)="handleSubmit($event)">
      <div>
        <ng-container
          [tanstackField]="form"
          name="firstName"
          [validators]="{
            onChange: firstNameValidator,
            onChangeAsyncDebounceMs: 500,
            onChangeAsync: firstNameAsyncValidator,
          }"
          #firstName="field"
        >
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
        </ng-container>
      </div>
      <button type="submit" [disabled]="!canSubmit()">
        {{ isSubmitting() ? '...' : 'Submit' }}
      </button>
      <button type="reset" (click)="form.reset()">Reset</button>
    </form>
  `,
})
export class AppComponent {
  firstNameValidator: FieldValidateFn<any, string, any> = ({ value }) =>
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
      lastName: '',
    },
    onSubmit({ value }) {
      // Do something with form data
      console.log(value)
    },
  })

  canSubmit = injectStore(this.form, (state) => state.canSubmit)
  isSubmitting = injectStore(this.form, (state) => state.isSubmitting)

  handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.form.handleSubmit()
  }
}
```

<!-- ::end:tabs -->

## Solid

In the example below, you can see TanStack Form in action with the Solid framework adapter:

[Open in CodeSandbox](https://codesandbox.io/s/github/tanstack/form/tree/b865ef335a69aa08a2f160895258f13e03773467/examples/solid/simple)

<!-- ::start:tabs variant="files" -->

```ts title="App.tsx"
/* @refresh reload */
import { render } from 'solid-js/web'
import { createForm } from '@tanstack/solid-form'
import { FieldInfo } from './FieldInfo.tsx';

function App() {
  const form = createForm(() => ({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  }))

  return (
    <div>
      <h1>Simple Form Example</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div>
          {/* A type-safe field component*/}
          <form.Field
            name="firstName"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'A first name is required'
                  : value.length < 3
                    ? 'First name must be at least 3 characters'
                    : undefined,
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                return (
                  value.includes('error') && 'No "error" allowed in first name'
                )
              },
            }}
            children={(field) => {
              // Avoid hasty abstractions. Render props are great!
              return (
                <>
                  <label for={field().name}>First Name:</label>
                  <input
                    id={field().name}
                    name={field().name}
                    value={field().state.value}
                    onBlur={field().handleBlur}
                    onInput={(e) => field().handleChange(e.target.value)}
                  />
                  <FieldInfo field={field()} />
                </>
              )
            }}
          />
        </div>
        <div>
          <form.Field
            name="lastName"
            children={(field) => (
              <>
                <label for={field().name}>Last Name:</label>
                <input
                  id={field().name}
                  name={field().name}
                  value={field().state.value}
                  onBlur={field().handleBlur}
                  onInput={(e) => field().handleChange(e.target.value)}
                />
                <FieldInfo field={field()} />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
          children={(state) => {
            return (
              <button type="submit" disabled={!state().canSubmit}>
                {state().isSubmitting ? '...' : 'Submit'}
              </button>
            )
          }}
        />
      </form>
    </div>
  )
}

const root = document.getElementById('root')

render(() => <App />, root!)
```

```ts title="FieldInfo.tsx"
import type { AnyFieldApi } from '@tanstack/solid-form'

export interface FieldInfoProps {
  field: AnyFieldApi
}

export function FieldInfo(props: FieldInfoProps) {
  return (
    <>
      {props.field.state.meta.isTouched && !props.field.state.meta.isValid ? (
        <em>{props.field.state.meta.errors.join(',')}</em>
      ) : null}
      {props.field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}
```

<!-- ::end:tabs -->

## Svelte

In the example below, you can see TanStack Form in action with the Svelte framework adapter:

[Open in CodeSandbox](https://codesandbox.io/s/github/tanstack/form/tree/b865ef335a69aa08a2f160895258f13e03773467/examples/svelte/simple)

<!-- ::start:tabs variant="files" -->

```svelte title="App.svelte"
<script lang="ts">
  import { createForm } from '@tanstack/svelte-form'
  import FieldInfo from './FieldInfo.svelte'

  const form = createForm(() => ({
    defaultValues: {
      firstName: '',
      lastName: '',
      employed: false,
      jobTitle: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      alert(JSON.stringify(value))
    },
  }))
</script>

<form
  id="form"
  onsubmit={(e) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }}
>
  <h1>TanStack Form - Svelte Demo</h1>

  <form.Field
    name="firstName"
    validators={{
      onChange: ({ value }) =>
        value.length < 3 ? 'Not long enough' : undefined,
      onChangeAsyncDebounceMs: 500,
      onChangeAsync: async ({ value }) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return value.includes('error') && 'No "error" allowed in first name'
      },
    }}
  >
    {#snippet children(field)}
      <div>
        <label for={field.name}>First Name</label>
        <input
          id={field.name}
          type="text"
          placeholder="First Name"
          value={field.state.value}
          onblur={() => field.handleBlur()}
          oninput={(e: Event) => {
            const target = e.target as HTMLInputElement
            field.handleChange(target.value)
          }}
        />
        <FieldInfo {field} />
      </div>
    {/snippet}
  </form.Field>
  <form.Field
    name="lastName"
    validators={{
      onChange: ({ value }) =>
        value.length < 3 ? 'Not long enough' : undefined,
    }}
  >
    {#snippet children(field)}
      <div>
        <label for={field.name}>Last Name</label>
        <input
          id={field.name}
          type="text"
          placeholder="Last Name"
          value={field.state.value}
          onblur={() => field.handleBlur()}
          oninput={(e: Event) => {
            const target = e.target as HTMLInputElement
            field.handleChange(target.value)
          }}
        />
        <FieldInfo {field} />
      </div>
    {/snippet}
  </form.Field>
  <form.Field name="employed">
    {#snippet children(field)}
      <div>
        <label for={field.name}>Employed?</label>
        <input
          oninput={() => field.handleChange(!field.state.value)}
          checked={field.state.value}
          onblur={() => field.handleBlur()}
          id={field.name}
          type="checkbox"
        />
      </div>
      {#if field.state.value}
        <form.Field
          name="jobTitle"
          validators={{
            onChange: ({ value }) =>
              value.length === 0 ? 'If you have a job, you need a title' : null,
          }}
        >
          {#snippet children(field)}
            <div>
              <label for={field.name}>Job Title</label>
              <input
                type="text"
                id={field.name}
                placeholder="Job Title"
                value={field.state.value}
                onblur={field.handleBlur}
                oninput={(e: Event) => {
                  const target = e.target as HTMLInputElement
                  field.handleChange(target.value)
                }}
              />
              <FieldInfo {field} />
            </div>
          {/snippet}
        </form.Field>
      {/if}
    {/snippet}
  </form.Field>
  <div>
    <form.Subscribe
      selector={(state) => ({
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting,
      })}
    >
      {#snippet children({ canSubmit, isSubmitting })}
        <button type="submit" disabled={!canSubmit}>
          {isSubmitting ? 'Submitting' : 'Submit'}
        </button>
      {/snippet}
    </form.Subscribe>
    <button
      type="button"
      id="reset"
      onclick={() => {
        form.reset()
      }}
    >
      Reset
    </button>
  </div>
</form>
```

```svelte title="FieldInfo.svelte"
<script lang="ts">
  import type { AnyFieldApi } from '@tanstack/svelte-form'

  let { field }: { field: AnyFieldApi } = $props()
</script>

{#if field.state.meta.isTouched}
  {#each field.state.meta.errors as error}
    <em>{error}</em>
  {/each}
  {field.state.meta.isValidating ? 'Validating...' : ''}
{/if}
```

<!-- ::end:tabs -->

## Lit

In the example below, you can see TanStack Form in action with the Lit framework adapter:

[Open in CodeSandbox](https://codesandbox.io/s/github/tanstack/form/tree/b865ef335a69aa08a2f160895258f13e03773467/examples/lit/simple)

```ts title="index.ts"
import { LitElement, html, nothing } from 'lit'
import { customElement } from 'lit/decorators.js'

import { TanStackFormController } from '@tanstack/lit-form'
import { repeat } from 'lit/directives/repeat.js'

@customElement('tanstack-form-demo')
export class TanStackFormDemo extends LitElement {
  #form = new TanStackFormController(this, {
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit({ value }) {
      // Do something with form data
      console.log(value)
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
              name: `firstName`,
              validators: {
                onChange: ({ value }) =>
                  !value
                    ? 'A first name is required'
                    : value.length < 3
                      ? 'First name must be at least 3 characters'
                      : undefined,
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: async ({ value }) => {
                  await new Promise((resolve) => setTimeout(resolve, 1000))
                  return (
                    value.includes('error') &&
                    'No "error" allowed in first name'
                  )
                },
              },
            },
            (field) => {
              return html` <div>
                <label for="${field.name}">First Name:</label>
                <input
                  id="${field.name}"
                  name="${field.name}"
                  .value="${field.state.value}"
                  @blur="${() => field.handleBlur()}"
                  @input="${(e: Event) => {
                    const target = e.target as HTMLInputElement
                    field.handleChange(target.value)
                  }}"
                />
                ${field.state.meta.isTouched && !field.state.meta.isValid
                  ? html`${repeat(
                      field.state.meta.errors,
                      (__, idx) => idx,
                      (error) => {
                        return html`<div style="color: red;">${error}</div>`
                      },
                    )}`
                  : nothing}
                ${field.state.meta.isValidating
                  ? html`<p>Validating...</p>`
                  : nothing}
              </div>`
            },
          )}
        </div>
        <div>
          ${this.#form.field(
            {
              name: `lastName`,
            },
            (field) => {
              return html` <div>
                <label for="${field.name}">Last Name:</label>
                <input
                  id="${field.name}"
                  name="${field.name}"
                  .value="${field.state.value}"
                  @blur="${() => field.handleBlur()}"
                  @input="${(e: Event) => {
                    const target = e.target as HTMLInputElement
                    field.handleChange(target.value)
                  }}"
                />
              </div>`
            },
          )}
        </div>

        <button type="submit" ?disabled=${this.#form.api.state.isSubmitting}>
          ${this.#form.api.state.isSubmitting ? '...' : 'Submit'}
        </button>
        <button
          type="button"
          @click=${() => {
            this.#form.api.reset()
          }}
        >
          Reset
        </button>
      </form>
    `
  }
}
```

<!-- ::end:framework -->

### You talked me into it, so what now?

- Learn TanStack Form at your own pace with our thorough [Walkthrough Guide](./foundations.md#source-form-docs-installation-md) and [API Reference](https://github.com/TanStack/form/blob/b865ef335a69aa08a2f160895258f13e03773467/docs/reference/classes/FormApi.md).

<a id="source-form-docs-philosophy-md"></a>

## Philosophy

Source: `form:docs/philosophy.md`.

Every well-established project should have a philosophy that guides its development. Without a core philosophy, development can languish in endless decision-making and have weaker APIs as a result.

This document outlines the core principles that drive the development and feature-set of TanStack Form.

### Upgrading unified APIs

APIs come with tradeoffs. As a result, it can be tempting to make each set of tradeoffs available to the user through different APIs. However, this can lead to a fragmented API that is harder to learn and use.

While this may mean a higher learning curve, it means that you don't have to question which API to use internally or have higher cognitive overhead when switching between APIs.

### Forms need flexibility

TanStack Form is designed to be flexible and customizable. While many forms may conform to similar patterns, there are always exceptions; especially when forms are a core component of your application.

As a result, TanStack Form supports multiple methods for validation:

- **Timing customizations**: You can validate on blur, change, submit, or even on mount.
- **Validation strategies**: You can validate on individual fields, the entire form, or a subset of fields.
- **Custom validation logic**: You can write your own validation logic or use a library like [Zod](https://zod.dev/) or [Valibot](https://valibot.dev/).
- **Custom error messages**: You can customize the error messages for each field by returning any object from a validator.
- **Async validation**: You can validate fields asynchronously and have common utils like debouncing and cancellation handled for you.

### Controlled is Cool

In a world where controlled vs. uncontrolled inputs are a hot topic, TanStack Form is firmly in the controlled camp.

This comes with a number of advantages:

- **Predictable**: You can predict the state of your form at any point in time.
- **Easier testing**: You can easily test your forms by passing in values and asserting on the output.
- **Non-DOM support**: You can use TanStack Form with React Native, Three.js framework adapters, or any other framework renderer.
- **Enhanced conditional logic**: You can easily conditionally show/hide fields based on the form state.
- **Debugging**: You can easily log the form state to the console to debug issues.

### Generics are grim

You should never need to pass a generic or use an internal type when leveraging TanStack Form. This is because we've designed the library to infer everything from runtime defaults.

When writing sufficiently correct TanStack Form code, you should not be able to distinguish between JavaScript usage and TypeScript usage, with the exception of any type casts you might do of runtime values.

Instead of:

```ts
useForm<MyForm>()
```

You should do:

```ts
interface Person {
  name: string
  age: number
}

const defaultPerson: Person = { name: 'Bill Luo', age: 24 }

useForm({
  defaultValues: defaultPerson,
})
```

### Libraries are liberating

One of the main objectives of TanStack Form is that you should be wrapping it into your own component system or design system.

To support this, we have a number of utilities that make it easier to build your own components and customized hooks:

```ts
// Exported from your own library with pre-bound components for your forms.
export const { useAppForm, withForm } = createFormHook(/* options */)
```

Without doing so, you're adding substantially more boilerplate to your apps and making your forms less consistent and user-friendly.

<a id="source-form-docs-typescript-md"></a>

## Typescript

Source: `form:docs/typescript.md`.

TanStack Form is written 100% in **TypeScript** with the highest quality generics, constraints, and interfaces to make sure the library and your projects are as type-safe as possible!

Things to keep in mind:

- `strict: true` is required in your `tsconfig.json` to get the most out of TanStack Form's types
- Types currently require using TypeScript v5.4 or greater
- Changes to types in this repository are considered **non-breaking** and are usually released as **patch** semver changes (otherwise every type enhancement would be a major version!).
- It is **highly recommended that you lock your react-form package version to a specific patch release and upgrade with the expectation that types may be fixed or upgraded between any release**
- The non-type-related public API of TanStack Form still follows semver very strictly.
