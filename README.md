# react-context-reverse

```
npm i --save-dev react-context-reverse
```

Similar to React.createContext() but instead of the ancestor passing data to it's descendant, the descendant passes data to a single ancestor.

#### Usage:

Use the `createReverseContext` function just like you would use the `React.createContext` function.

The difference is it returns a Context object with a:

- `<Context.ReverseProvider>`: Component used in a child/descendant component to provide a value to the context.
- `<Context.ReverseConsumer>`: Component used in the parent/ancestor component to consume the provided value from the context.

**Note:** I made the names `ReverseProvider` and `ReverseConsumer` to avoid confusion with a regular `Provider` and `Consumer`.

#### Example:

In this example, we are going to add a disabled class to a `<label>` if it's nested `<input>` is disabled.

```jsx
////////////////
/* Example.js */
////////////////

import { Label } from "./Label";
import { Checkbox } from "./Checkbox";

export const Example = () => (
  <Label>
    <Checkbox disabled /> // Note: the child has some disabled state to share
    Check Me
  </Label>
);

//////////////
/* Label.js */
//////////////

import { createReverseContext } from 'react-context-reverse'

// We start by creating a reverse context to consume
// the disabled context of the child checkbox
export const DisabledContext = createReverseContext(false);

// In the parent we use the ReverseConsumer, it provides
// the value of the context via a child function
export const Label = props => (
  <DisabledContext.ReverseConsumer>
    {disabled => (
      <label {...props} className={cx("Label", disabled && "is-disabled")} />
    )}
  </DisabledContext.ReverseConsumer>
);

//////////////
/* Input.js */
//////////////

import { DisabledContext } from "./Label";

// In the child we use the ReverseProvider, we provide
// the value to the context
export const Checkbox = props => (
  <DisabledContext.ReverseProvider value={props.disabled}>
    <input {...props} type="checkbox" className="Checkbox" />
  </DisabledContext.ReverseProvider>
);
```
