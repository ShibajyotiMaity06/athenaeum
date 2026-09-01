# React - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is React, and what are its core features?
* **Definition**: An open-source, component-based front-end JavaScript library developed by Facebook for building dynamic user interfaces.
* **Core Features**:
  * **Component-Based Architecture**: UI is broken into reusable, self-contained building blocks (components).
  * **Declarative UI**: Developer defines *what* the UI should look like based on current state, and React handles DOM updates.
  * **Virtual DOM**: In-memory representation of the real DOM used to optimize updates.
  * **Unidirectional Data Flow**: Data flows one way (parent to child) via props, simplifying debugging.

### Q2: What is JSX, and how does it work under the hood?
* **Definition**: JavaScript XML (JSX) is a syntax extension that allows writing HTML-like code inside JavaScript.
* **Compilation**: Browsers cannot read JSX. It is compiled (via Babel/SWC) into pure JavaScript.
  * Prior to React 17: `React.createElement(type, props, ...children)`.
  * React 17+: Compiles to calls from the `react/jsx-runtime` package (e.g., `_jsx('div', { children: 'Hello' })`).
* **Output**: Returns lightweight JavaScript objects called **React Elements** which describe the virtual DOM node.

### Q3: What is the difference between Functional Components and Class Components?
* **Functional Components**: Written as plain JavaScript functions. They use Hooks for state and side effects. They are simpler, have less boilerplate, and are the modern standard in React.
* **Class Components**: Written as ES6 classes extending `React.Component`. They manage state via `this.state`/`this.setState` and side effects via lifecycle methods (e.g., `componentDidMount`). They require the `this` context and have more boilerplate.

### Q4: What is the Virtual DOM, and how does React use it to optimize performance?
* **Concept**: A lightweight, in-memory copy of the real DOM.
* **Reconciliation Process**:
  1. **Render**: When state or props change, React builds a new Virtual DOM tree.
  2. **Diffing**: React compares the new Virtual DOM tree with the previous one to find differences.
  3. **Batching & Patching**: React calculates the minimum required changes and updates *only* those parts in the real DOM, avoiding expensive full-page reflows.

### Q5: What are props in React, and are they mutable?
* **Definition**: Props (short for "properties") are read-only inputs passed from a parent component to a child component.
* **Immutability**: Props are strictly **immutable**. A component must never modify its own props. This maintains unidirectional data flow and predictable UI states.

### Q6: What is state in React, and how does it differ from props?
* **State**: An internal, mutable data store managed within a component. It holds data that changes over time and triggers component re-renders when updated.
* **Comparison**:
  * **Props**: Received from parent, read-only/immutable, used for configuration.
  * **State**: Owned/managed locally, mutable (via updater functions), used to track dynamic interactive data.

### Q7: What is the purpose of the `key` prop in React lists?
* **Purpose**: Helps React identify which items in a list have changed, been added, or been removed during reconciliation.
* **Performance Impact**: Gives list elements stable identities. Without keys, React defaults to index-based reconciliation, which can cause rendering bugs, state loss, and slow updates.
* **Best Practice**: Use unique, stable IDs (e.g., database primary keys). Avoid using array indices unless the list is strictly static and never reordered or filtered.

### Q8: Why should you never mutate state directly?
* **Reason**: React tracks state changes by comparing object references (shallow comparison). Mutating state directly (e.g., `state.count = 5` or `state.array.push(item)`) does not change the reference.
* **Consequence**: React will not detect the change, the reconciliation process will not trigger, and the UI will fail to re-render. Always use updater functions (like `setState` or the hook returned by `useState`).

### Q9: What is the purpose of the `useState` hook?
* **Purpose**: Allows functional components to declare and manage local state.
* **Syntax**: `const [state, setState] = useState(initialValue);`
* **Mechanics**: Returns the current state value and an updater function. When the updater function is called, React schedules a re-render of the component with the new state value.

### Q10: How does state updates batching work in React?
* **Batching**: React groups multiple state updates inside event handlers, promises, or timeouts into a single re-render for optimal performance.
* **React 18+ (Automatic Batching)**: Automatically batches updates regardless of where they originate (e.g., inside click handlers, `fetch` calls, or `setTimeout`).
* **Bypassing**: If immediate rendering is absolutely required, use `ReactDOM.flushSync()`.

### Q11: What is the `useEffect` hook, and what are its standard dependency arrays?
* **Purpose**: Enables performing side effects (data fetching, DOM manipulation, subscriptions) in functional components.
* **Dependency Configurations**:
  * **No dependency array**: Runs after *every* single render.
  * **Empty array `[]`**: Runs *once* after the initial mount.
  * **Array with values `[dep1, dep2]`**: Runs on mount, and subsequently *only* if `dep1` or `dep2` changes between renders.

### Q12: How do you perform cleanup in a `useEffect` hook, and when does it run?
* **Cleanup Mechanism**: Return a cleanup function from the hook's callback.
* **Execution Timing**:
  * Runs right before the component unmounts.
  * Runs right before the effect runs again (if dependencies change), cleaning up the effect from the previous render.
* **Use Cases**: Clearing intervals/timeouts, unsubscribing from WebSockets, or removing event listeners.

### Q13: What is the difference between `useEffect` and `useLayoutEffect`?
* **`useEffect`**: Runs **asynchronously** *after* the browser paints the screen. It is non-blocking and preferred for most side effects (like data fetching).
* **`useLayoutEffect`**: Runs **synchronously** *after* DOM mutations but *before* the browser paints. It blocks the paint. It is used for reading DOM measurements and performing immediate synchronous visual updates to prevent visual flickering.

### Q14: What is the Context API, and what problems does it solve?
* **Definition**: A built-in React feature that provides a way to share data globally across the component tree without passing props down manually through intermediate levels.
* **Problem Solved**: Eliminates **prop drilling** (passing props down deep levels through components that do not need them).
* **Common Uses**: Themes, authenticated user state, language preferences.

### Q15: What is the difference between controlled and uncontrolled components?
* **Controlled Components**: State of the form element is managed completely by React state. The element's value is bound to state, and updates occur via `onChange`. (Single source of truth).
* **Uncontrolled Components**: Form data is handled directly by the browser's DOM. React accesses values when needed using **Refs** (`useRef`), which read from the DOM node directly.

### Q16: What is a React Ref, and how do you create and use it using `useRef`?
* **Definition**: A reference to a mutable value or DOM element that persists across renders.
* **Key Characteristic**: Modifying a ref's `.current` property **does not** trigger a component re-render.
* **Use Cases**: Accessing underlying DOM nodes (focusing inputs, playing media), storing timer IDs, or caching previous state values.

### Q17: What are the standard rules of React Hooks?
* **Only Call Hooks at the Top Level**: Do not call hooks inside loops, conditions, or nested functions to ensure they always execute in the exact same order on every render.
* **Only Call Hooks from React Functions**: Call hooks only from React Functional Components or Custom Hooks, never from plain JavaScript functions.

### Q18: What is lifting state up in React?
* **Concept**: Moving shared state to the closest common ancestor of the components that need to access or modify it.
* **Why**: Ensures a single source of truth and allows multiple child components to remain synchronized with the same data.

### Q19: What is prop drilling, and how can it be avoided?
* **Prop Drilling**: The pattern of passing props through multiple levels of nested components solely to reach a deeply nested child component.
* **How to Avoid**:
  * Component composition (passing the child component directly as `children`).
  * Context API.
  * External state management libraries (e.g., Zustand, Redux).

### Q20: What is conditional rendering in React, and what are standard approaches?
* **Definition**: Rendering different UI elements based on certain runtime conditions.
* **Standard Approaches**:
  * Ternary operator: `{condition ? <ComponentA /> : <ComponentB />}`.
  * Logical AND: `{condition && <Component />}` (be careful with falsy numbers like `0`).
  * `if-else` blocks or `switch` cases inside the main component body before returning.

### Q21: How do you handle events in React, and how does it differ from HTML event handling?
* **React Event Handling**:
  * Event names are camelCase (`onClick` instead of `onclick`).
  * Event handlers are passed as functions rather than strings (`onClick={handleClick}`).
  * Events are wrapped in a cross-browser compatible wrapper called `SyntheticEvent` to ensure consistent behavior across browsers.

### Q22: What is a Higher-Order Component (HOC) in React?
* **Definition**: A design pattern where a function takes a component as an argument and returns a new enhanced component.
* **Formula**: `const EnhancedComponent = withFeature(BaseComponent);`
* **Use Case**: Reusing component logic, inject common props, or apply authentication/authorization gates globally.

### Q23: What are Render Props in React?
* **Definition**: A pattern where a component receives a function as a prop and calls this function to render its UI.
* **Mechanism**: Sharing stateful logic between components by delegation.
  ```jsx
  <DataProvider render={(data) => <Display data={data} />} />
  ```

### Q24: What is React.Fragment, and why should you use it?
* **Purpose**: Group multiple elements together without adding an extra DOM node (like a wrapper `<div>`).
* **Why**: Keeps the DOM tree clean and avoids breaking layout elements like flexbox, grid, or tables that expect specific child structures.
* **Syntax**: `<React.Fragment>...</React.Fragment>` or the shorthand `<>...</>`.

### Q25: What is the purpose of `React.memo`?
* **Purpose**: A performance optimization tool that memoizes functional components.
* **Behavior**: React skips re-rendering the wrapped component if its props have not changed (performs shallow equality check on props).
* **Best Use Case**: Pure presentational components that render frequently with identical props.

### Q26: What is the difference between `useMemo` and `useCallback`?
* **`useMemo`**: Memoizes the **result of a function calculation** and returns the computed value. It only recomputes when its dependencies change.
* **`useCallback`**: Memoizes the **function definition itself** and returns the memoized function reference. Useful to prevent child components from re-rendering when passing callback props.

### Q27: What is `useReducer`, and when should you use it over `useState`?
* **`useReducer`**: An alternative hook to manage state, operating with a reducer function, actions, and dispatch.
* **When to use**:
  * Complex state logic with multiple nested values.
  * Next state depends on the previous state.
  * Standard operations require updating multiple state fields in response to a single action.

### Q28: What are React Portals, and what is their typical use-case?
* **Definition**: A way to render children into a DOM node that exists outside the DOM hierarchy of the parent component.
* **Typical Use Case**: Modals, tooltips, dropdowns, and toast notifications that require overcoming overflow-hidden container clips or complex z-index issues.
* **API**: `ReactDOM.createPortal(child, container)`.

### Q29: What is the purpose of StrictMode in React?
* **Purpose**: A development-only wrapper that helps identify potential problems in an application.
* **Actions**:
  * Double-invokes lifecycle methods, effect hooks, and state initializers to catch accidental side effects.
  * Warns about legacy lifecycle methods, deprecated APIs, and string refs.

### Q30: How can you handle errors in React components? What are Error Boundaries?
* **Error Boundaries**: Class components that implement `static getDerivedStateFromError` (to render fallback UI) and/or `componentDidCatch` (to log errors).
* **Behavior**: Catch JavaScript runtime errors anywhere in their child component tree, preventing the entire application from crashing.
* **Limitation**: Do not catch errors in event handlers, asynchronous code, or SSR.

### Q31: What is the purpose of the `children` prop?
* **Purpose**: A default prop passed to every component that contains whatever content is written between the opening and closing tags of that component.
* **Use Case**: Creating reusable layout containers (card components, layouts, page wrappers).

### Q32: What are custom hooks, and why do we write them?
* **Definition**: JavaScript functions whose names start with `use` and can call other React hooks.
* **Why**: Extracts stateful logic from UI components into reusable, testable functions, keeping UI components thin and focused.

### Q33: What is the difference between a controlled form and an uncontrolled form in React?
* **Controlled Form**:
  * State is maintained by React.
  * Updates are processed in real-time via handlers.
  * Perfect for instant field validation, dynamic disabled buttons, and complex form fields.
* **Uncontrolled Form**:
  * State is maintained in the native DOM.
  * Faster to implement, with less boilerplate.
  * Ideal for simple, large forms where real-time validation is not required.

### Q34: How do you handle inline styling in React?
* **Handling**: Passed as an object instead of a string.
* **Style Properties**: Camel-cased instead of hyphenated (e.g., `backgroundColor` instead of `background-color`).
* **Example**: `<div style={{ color: 'red', fontSize: '14px' }}></div>`.

### Q35: What is the purpose of CSS Modules in React?
* **Purpose**: Avoids CSS global namespace pollution by scoping CSS locally to the component.
* **Mechanism**: Generates unique class names dynamically (e.g., `button__submit--Xj8a2`).
* **Usage**: `import styles from './Button.module.css';` used as `<button className={styles.submit} />`.

### Q36: Why can't we use React hooks inside `if` statements or loops?
* **Reason**: React relies on the execution **order** of hooks on every render to correctly associate state variables with their values.
* **Consequence**: Placing hooks in conditionals or loops changes the hook invocation order if conditions change, causing subsequent state values to align with the wrong hooks and breaking the component.

### Q37: What is the difference between React Elements and React Components?
* **React Element**: A plain JavaScript object describing a DOM node (or component) and its properties. It is lightweight, immutable, and created via JSX or `createElement`.
* **React Component**: A template, blueprint, or constructor (class/function) that accepts props and returns a React element tree.

### Q38: What are Synthetic Events in React?
* **Definition**: Cross-browser wrappers around the browser's native event object.
* **Purpose**: Standardize event APIs across different browsers (Chrome, Safari, Firefox) so developers don't have to write platform-specific code.
* **Behavior**: Synced to the same standard API as native events, but recycled for performance (event pooling, deprecated in v17).

### Q39: How do you prevent a component from rendering in React?
* **Mechanism**: Return `null` from the component's render function.
* **Impact**: The component will still mount and run its lifecycle hooks/effects, but its visual representation will not be added to the DOM.

### Q40: What is the default port for React local development, and how can you change it?
* **Default**: Port `3000` (Create React App) or `5173` (Vite).
* **How to Change**:
  * CRA: In `.env` set `PORT=3001` or run `PORT=3001 npm start`.
  * Vite: Set `server: { port: 3001 }` in `vite.config.js`.

### Q41: What is the purpose of `useId` hook in React?
* **Purpose**: Generates unique, stable IDs that are consistent across client and server renders (important for SSR frameworks).
* **Use Case**: Linking HTML form labels with input elements via `htmlFor` and `id` tags.

### Q42: What is dynamic importing in React, and how is it used with `React.lazy`?
* **Purpose**: Enhances performance through code splitting, dividing the application bundle into smaller files loaded on demand.
* **Implementation**:
  ```jsx
  const LazyComponent = React.lazy(() => import('./LazyComponent'));
  ```
* **Required context**: Must be rendered inside a `<Suspense fallback={<Loading />} >` wrapper.

### Q43: What is the difference between Shadow DOM and Virtual DOM?
* **Shadow DOM**: A browser-native technology used to scope CSS styles and DOM sub-trees in Web Components (isolated sandbox).
* **Virtual DOM**: A pure JavaScript, lightweight concept created by React to track state changes and optimize rendering speeds across any framework environment.

---

### Q44: Why is using the array index as a `key` problematic?
* Keys must identify an item *across renders*; index keys tie identity to position instead of data.
* Breaks when items are **reordered, inserted, or removed**: React reuses the wrong component instances, so internal state (inputs, checkboxes, animations) attaches to the wrong rows; uncontrolled input values visibly jump between items.
* Performance claim ("index is faster") is misleading - correct keys let React skip unchanged subtrees entirely; index keys often force deeper re-renders.
* Acceptable only when the list is static (never reordered/filtered) and items hold no local state or refs. Default rule: use a stable unique ID from the data.

### Q45: How do you provide default values for props?
* Destructuring defaults (preferred): `function Btn({ size = 'md', disabled = false })` - colocated, lint-friendly, works with any hook-based component.
* Legacy `Component.defaultProps` - deprecated for function components (works only in class components going forward).
* Falsy gotcha: `size = 'md'` applies when prop is `undefined` but **not** when explicitly passed `null` - handle null deliberately (`??` operator where appropriate).
* For object/function defaults, prefer stable module-level constants over inline literals to preserve referential stability across renders.

### Q46: How do you handle multiple form inputs with a single state object?
```jsx
const [form, setForm] = useState({ email: '', name: '' });
const onChange = (e) => {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));  // computed key update
};
<input name="email" value={form.email} onChange={onChange} />
```
* The `name` attribute doubles as the state key, letting one handler serve many inputs - fewer closures, less duplication.
* Always spread the previous state (never replace the whole object); nested structures need nested spreads or immer.
* Alternative: keep inputs uncontrolled and read via FormData on submit when per-keystroke re-renders are unnecessary.

### Q47: What is the difference between `useEffect(fn)` with no deps vs `useEffect(fn, [])`?
* **No dependency array**: runs after *every* render - useful for syncing with constantly changing external values, but easy source of infinite loops if it sets state unconditionally.
* **Empty array `[]`**: conceptually "run once after mount" (and again after remount under StrictMode dev double-invoke). Closures capture the *first* render's props/state - stale-closure bugs appear when it reads fresh-looking values.
* Correct mental model: the array declares *"re-run when these values change"*; empty means "depends on nothing," not "run once" - that framing explains why linters demand exhaustive deps.

### Q48: What exactly does StrictMode double-invoke in development?
* Dev-only behaviors (stripped in production builds): double-rendering component function bodies, double-invoking state updater functions passed to setState, and mounting→unmounting→remounting effects (setup → cleanup → setup).
* Purpose: surface impure render logic (mutations, side effects in render) and missing effect cleanup - code that survives StrictMode is safer under Concurrent features where renders may be discarded/replayed.
* Common false alarms: duplicate API calls from effects without cleanup flags/AbortController; Math.random()/Date.now() in render causing hydration mismatches.
* Never "fix" by removing StrictMode - fix the impurity.

### Q49: Explain one-way (unidirectional) data flow in React.
* Data travels **down** via props; children never modify what they receive - they request changes upward via callbacks (`onChange`, event handlers), and the owner updates state, which flows back down.
* Benefits: predictable traceability (any UI state has one owning component), easier debugging (follow the callback chain), enables time-travel debugging patterns and SSR consistency.
* Contrast with two-way binding frameworks (Angular ngModel): React's controlled inputs simulate two-way binding by pairing `value` (down) with `onChange` (up) explicitly.
* When siblings need shared data, lift it to the closest common parent - or adopt external stores when lifting causes excessive drilling.

### Q50: CRA vs Vite - how does tooling differ for React apps?
* **Create React App (CRA)**: webpack-based, now deprecated/unmaintained - slow cold starts (full-bundle rebuilds), dev server degrades as apps grow.
* **Vite**: native ESM dev server - browser requests modules on demand, transform-per-file caching via esbuild prebundling of node_modules; HMR near-instant regardless of app size; production build switches to Rollup.
* Migration notes: env vars change prefix (`REACT_APP_*` → `VITE_*`), JSX handled automatically, jest configs swap for vitest commonly.
* Interview angle: understand *why* unbundled dev servers win (serve raw ESM, cache transforms) rather than naming tools - Next.js similarly replaced its stack with Turbopack/SWC.

---

## Coding & Implementation Challenges

### Q51: Implement a Counter Component with increment, decrement, and reset capabilities.
```jsx
import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(prev => prev + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev - 1)} style={{ margin: '0 10px' }}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### Q52: Create a Controlled Form Input with simple email validation.
```jsx
import React, { useState } from 'react';

export default function EmailForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (!val.includes('@')) {
      setError('Invalid email address');
    } else {
      setError('');
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} style={{ padding: '20px' }}>
      <label>
        Email:
        <input type="email" value={email} onChange={handleChange} />
      </label>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

### Q53: Create a Toggle Visibility Component (e.g., an Accordion-style item).
```jsx
import React, { useState } from 'react';

export default function Accordion({ title, content }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ border: '1px solid #ccc', margin: '10px', borderRadius: '4px' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ width: '100%', padding: '10px', textAlign: 'left', background: '#f0f0f0', cursor: 'pointer' }}
      >
        {title} {isOpen ? '▲' : '▼'}
      </button>
      {isOpen && <div style={{ padding: '10px', background: '#fff' }}>{content}</div>}
    </div>
  );
}
```

### Q54: Fetch and render a list of users from an API on component mount.
```jsx
import React, { useState, useEffect } from 'react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading users...</p>;

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name} ({user.email})</li>)}
    </ul>
  );
}
```

### Q55: Implement a Search Filter that dynamically filters a static list of strings as the user types.
```jsx
import React, { useState } from 'react';

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];

export default function SearchFilter() {
  const [query, setQuery] = useState('');

  const filteredFruits = FRUITS.filter(fruit => 
    fruit.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <input 
        type="text" 
        placeholder="Search fruits..." 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
      <ul>
        {filteredFruits.map((fruit, idx) => <li key={idx}>{fruit}</li>)}
      </ul>
    </div>
  );
}
```

### Q56: Write a Custom Hook `useToggle` that manages a boolean toggle state.
```jsx
import { useState, useCallback } from 'react';

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  return [value, toggle];
}

// Example usage:
// const [isDark, toggleDark] = useToggle(false);
```

### Q57: Build a Todo List Component allowing items to be added and deleted.
```jsx
import React, { useState } from 'react';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input }]);
    setInput('');
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div style={{ padding: '20px' }}>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text} <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```
