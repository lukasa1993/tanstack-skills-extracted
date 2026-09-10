# Dom Host — Basic use

[Guide and prerequisites](./charts-docs-reference-dom-host-md-10380040.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Basic use

```ts
const options = {
  definition: defineChart(definition, { tooltip }),
  height: 320,
  ariaLabel: 'Weekly revenue',
}

const host = mountChart(container, options)

host.update({
  ...options,
  height: 400,
})

host.destroy()
```

Application changes use a new definition:

```ts
const host = mountChart(container, {
  definition: createDefinition(rows, 'revenue'),
  ariaLabel: 'Revenue by month',
})
```

The definition identity is the application update boundary. Responsive
definitions still rebuild when their resolved surface size changes.
