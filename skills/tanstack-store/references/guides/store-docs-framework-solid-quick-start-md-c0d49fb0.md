# Quick Start

<a id="source-store-docs-framework-solid-quick-start-md"></a>

Release-matched documentation · `@tanstack/store@0.11.1`.

[Topic index](../framework-solid.md) · [Source provenance](../SOURCES.md)

The basic Solid app example to get started with the TanStack Solid-store.

```jsx
import { createStore, useSelector } from '@tanstack/solid-store';

// You can instantiate the store outside of Solid components too!
export const store = createStore({
  cats: 0,
  dogs: 0
})

export const Display = (props) => {
  const count = useSelector(store, (state) => state[props.animals]);
  return (
    <span>
      {props.animals}: {count()}
      </span>
    );
}

export const Button = (props) => {
  return (
    <button
      onClick={() => {
        store.setState((state) => {
          return {
            ...state,
            [props.animals]: state[props.animals] + 1
          }
        })
      }}
    >
      Increment
    </button>
  )
}

const App = () => {
  return (
    <div>
    <h1>How many of your friends like cats or dogs?</h1>
    <p>
      Press one of the buttons to add a counter of how many of your friends
      like cats or dogs
      </p>
      <Button animals="dogs" />
      <Display animals="dogs" />
      <Button animals="cats" />
      <Display animals="cats" />
  </div>
  );
};

export default App;
```

`useStore` remains available as a deprecated alias to `useSelector`.
