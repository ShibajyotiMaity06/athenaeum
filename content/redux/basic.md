# Redux - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is Redux and what problem does it solve?
* **Definition**: A predictable state container for JavaScript apps. State lives in one store; the only way to change it is dispatching actions into pure reducers.
* **Problems solved**:
  * **Prop drilling** - any component can subscribe to exactly the slices it needs.
  * **Unpredictable mutations** - immutability makes every change traceable.
  * **Scattered state logic** - transitions are centralized and testable.
* Best suited to complex, shared client state; overkill for purely local UI state.

---

### Q2: Explain the three core principles of Redux.
* **Single source of truth** - the entire app state is one object tree stored in one store.
* **State is read-only** - components never mutate; they dispatch plain action objects describing *what happened*.
* **Changes via pure functions** - reducers take `(previousState, action)` and return the next state, with no side effects.
These three rules give you time-travel debugging, deterministic tests and trivial undo/redo foundations.

---

### Q3: What are the core building blocks of Redux?
* **Store** - holds state, exposes `getState()`, `dispatch()`, `subscribe()`.
* **Action** - a plain object `{ type, payload? }` describing an event.
* **Action creator** - a function returning an action (keeps dispatch sites clean and typed).
* **Reducer** - pure function producing next state per action.
* **Dispatch** - the only mutation entry point.
* **Selector** - function reading derived data from state (`state => state.cart.items`).

---

### Q4: What is the difference between an action and an action creator?
* An **action** is the payload object itself: `{ type: 'cart/add', payload: { id } }`.
* An **action creator** is the function that builds it: `const addToCart = id => ({ type: 'cart/add', payload: { id } })`.
* Why bother with creators: centralizes action shapes, gives TypeScript a single typed factory, keeps components free of string literals, and (with thunks/sagas) becomes the place where async logic starts.
* With Redux Toolkit you rarely hand-write them - `createSlice` generates creators automatically from reducer names.

---

### Q5: What does a reducer look like and what rules must it follow?
```js
function cartReducer(state = initialState, action) {
  switch (action.type) {
    case 'cart/add':
      return { ...state, items: [...state.items, action.payload] };
    default:
      return state;
  }
}
```
Rules:
1. **Pure** - same inputs ⇒ same output; no API calls, no Date.now/Math.random.
2. **No mutation** - spread/copy every touched level.
3. **Default case returns state unchanged** (enables cheap bailouts).
4. **Never return undefined** - React state reads will explode.

---

### Q6: How do you create and configure a Redux store?
* Modern (RTK):
```js
import { configureStore } from '@reduxjs/toolkit';
export const store = configureStore({
  reducer: { cart: cartReducer, user: userReducer },
});
```
* Legacy: `createStore(rootReducer, applyMiddleware(...))` (deprecated).
* `configureStore` bundles thunk middleware, devtools wiring, and development-mode immutability/serializability checks that catch common bugs early.
* Provide it once: `<Provider store={store}>` wraps your component tree.

---

### Q7: What is the Provider and why is it needed?
* `<Provider store={store}>` is react-redux's bridge - it puts the store instance into React context so nested `useSelector`/`useDispatch` hooks can find it without prop drilling.
* Without it, hooks throw "could not find react-redux context".
* You typically render it once at the app root. For testing or micro-frontends you may create isolated providers with separate stores per tree.
* Server-side rendering nuance: create a fresh store per request rather than reusing a module singleton.

---

### Q8: What are selectors and why use them?
* A selector is a pure function `(state) => derivedData` - e.g., `selectCartTotal`.
* Benefits:
  * Components don't know the state *shape*, only the query - refactor internals freely.
  * Central place for derived/computed logic (totals, filtered lists).
  * Memoized selectors (Reselect) skip recomputation when inputs don't change.
* Keep trivial inline reads (`s => s.user.name`) local; export named selectors for anything reused or computed.

---

### Q9: What is useDispatch and how do you use it?
```jsx
const dispatch = useDispatch();
<button onClick={() => dispatch(addToCart(id))}>Add</button>
```
* Returns the store's `dispatch`, stable across renders - safe in dependency arrays.
* Dispatching triggers reducers synchronously; connected components re-render only if their selected slices changed.
* Convention: dispatch *action creators*, not raw objects, so typing/intent stays centralized.
* In RTK slices you dispatch the auto-generated actions (`dispatch(userLoggedOut())`).

---

### Q10: What is useSelector and what are its gotchas?
```js
const items = useSelector(s => s.cart.items);
```
* Subscribes the component to the store; runs after every dispatched action and re-renders when the selected result changes (strict `===` compare).
* Gotchas:
  * Returning freshly built objects/arrays (`s => ({a:s.a,b:s.b})` or `.filter(...)`) creates new references each run → infinite re-render loops. Fix with shallow-equal (`useShallowEqualSelector`) or Reselect memoization.
  * Multiple `useSelector` calls are fine - each subscribes independently.

### Q11: What is Redux Toolkit (RTK) and why is it recommended?
* The official, opinionated toolset that makes Redux "the right way" the default way.
* Includes:
  * `configureStore` - sane defaults + devtools + safety checks.
  * `createSlice` - reducers + action creators from one object, with Immer built in.
  * `createAsyncThunk` - standard async lifecycle actions.
  * `RTK Query` - full data-fetching/caching layer.
* Kills most classic Redux pain: no hand-written action type strings, no constant/action-creator boilerplate files, no manual immutable spreads.

---

### Q12: What is createSlice and how does Immer help inside it?
```js
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem(state, action) { state.items.push(action.payload); }, // "mutation"!
    clearCart() { return { items: [] }; },
  },
});
export const { addItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
```
* `name` prefixes types (`cart/addItem`), reducer keys become action creators automatically.
* Inside reducers you write *mutating-looking* code - Immer proxies drafts and emits structurally-shared immutable copies, eliminating spread ceremony while keeping purity guarantees.

---

### Q13: How do you combine multiple reducers?
* Classic: `combineReducers({ cart: cartReducer, user: userReducer })` - namespaces each slice under its key.
* RTK: pass the same object map to `configureStore({ reducer: {...} })`.
* Resulting state shape: `{ cart: {...}, user: {...} }`; each reducer receives only its own slice plus every action.
* For cross-slice responses use `createSlice.extraReducers` listening to other slices' action types instead of nesting stores.

---

### Q14: What is the typical folder structure for a Redux app?
* **Feature-first (recommended)**: `features/cart/{slice.ts,selectors.ts,components/}` - everything about a domain lives together; scales with team size.
* **Type-first (legacy)**: global `actions/`, `reducers/`, `constants/` folders - fine for tiny apps, scatters related code as features grow.
* Rules of thumb: co-locate selectors with their slice, keep store config (`store.ts`) at root, never import across feature internals - go through exported APIs.

---

### Q15: When should you NOT use Redux?
* State used by a single component → `useState`/`useReducer`.
* Server-cache-shaped data (todos, users fetched from API) → TanStack Query/SWR/RTK Query handle caching, dedupe, invalidation better than hand-rolled slices.
* URL-representable state (filters, tabs) → the router.
* Simple theme/locale toggles shared by two components → Context suffices.
Redux earns its cost when many distant components read/write *the same client-authored state* with non-trivial transitions.

---

### Q16: What are pure functions and why do reducers need to be pure?
* A pure function returns the same output for the same inputs and touches nothing outside itself - no mutations, no I/O, no randomness or clock reads.
* Reducers must be pure because:
  1. DevTools time-travel replays action history - impurity corrupts replayed states.
  2. React StrictMode/concurrent rendering may invoke them more than once.
  3. Unit tests become trivial table-driven checks.
Side-effectful work belongs in middleware/thunks *before* dispatching plain results.

---

### Q17: How does data flow through a Redux application?
1. UI event → `dispatch(action)`.
2. Store passes action through middleware chain to the root reducer.
3. Root reducer delegates to slice reducers; each computes next slice state.
4. Store saves new root state and notifies subscribers.
5. Connected components re-run selectors; changed values trigger re-render.
Strictly **unidirectional** - state never flows upward except via dispatched events. This loop is the interview's favorite whiteboard diagram; draw it.

---

### Q18: What is an action "type" and what conventions exist?
* The `type` is the string identifier reducers switch on: `'counter/increment'`.
* Conventions: `domain/eventName` (RTK default), SCREAMING_SNAKE_CASE historically; uniqueness is mandatory - collisions silently route actions into wrong reducers.
* Never hardcode raw strings across files; always reference generated creators or exported constants so renames stay safe.
* With RTK you almost never touch types manually - `cartSlice.actions.addItem` carries the exact literal type for free.

---

### Q19: Can you dispatch multiple actions? How do updates batch?
```js
dispatch(setName('A')); dispatch(setAge(30));
```
Yes. Every dispatch runs reducers synchronously; react-redux batches resulting re-renders within one event-loop tick (React 18 automatic batching covers timeouts/promises too).
Guidance: prefer ONE action describing a composite event (`user/profileUpdated`) over several micro-actions when fields belong together - fewer intermediate states, clearer history, simpler tests.

---

### Q20: What is the difference between getState() and useSelector()?
* `store.getState()` / `useStore().getState()` - imperative snapshot read; no subscription, no reactivity. Use inside thunks/effects/handlers needing current values.
* `useSelector(fn)` - live subscription; component re-renders on relevant changes. Use inside render.
Anti-pattern: calling `getState()` during render to dodge subscriptions - renders won't update. Conversely subscribing just to read once inside handlers wastes renders. Pick per context: reactive view = selector; point-in-time logic = getState.


