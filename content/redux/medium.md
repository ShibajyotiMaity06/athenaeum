# Redux - Medium Interview Questions

## Theory Questions & Answers

### Q1: What is a middleware in Redux and how does the chain work?
* Middleware sits between `dispatch` and the reducer - it can log, transform, delay, or swallow actions.
* Signature: `store => next => action => result`. Calling `next(action)` forwards to the next middleware; calling `dispatch(...)` instead restarts from the chain's head.
* Composition order matters: middleware applied earlier sees actions first on the way IN and last on the way OUT.
* Classic uses: thunks (async), logging/crash reporting, routing sync, analytics. RTK pre-installs thunk + devtools; add custom ones via `configureStore({ middleware: g => g().concat(logger) })`.

---

### Q2: Explain Redux Thunk - what problem does it solve and its limits?
```js
const fetchUser = id => async (dispatch, getState) => {
  dispatch(loadingStarted());
  try { dispatch(loadSucceeded(await api.getUser(id))); }
  catch (e) { dispatch(loadFailed(e.message)); }
};
```
* A thunk is any function dispatched instead of a plain object; the middleware invokes it lazily with `(dispatch, getState)` - enabling side effects and multi-step dispatches.
* Limits: no cancellation built-in, race conditions need manual guards, complex flows become nested callback soup, hard to test interleavings.
* For heavy async choreography teams graduate to RTK Query (data) or sagas/orchestration libs (flows).

---

### Q3: What is createAsyncThunk and what lifecycle does it generate?
```js
const fetchUser = createAsyncThunk('user/fetch', async (id, { signal }) =>
  api.getUser(id, { signal }));
```
Emits three actions automatically: `pending`, `fulfilled` (payload = return value), `rejected` (payload = serialized error unless `rejectWithValue`).
* Handle them via `extraReducers` builders - keeps slice reducers declarative.
* Built-ins you get for free: **AbortSignal** (`thunk.dispatch(fetchUser.abort())` or condition option), single-flight dedupe per arg (`condition` callback), and typed payload preparation via `payloadCreator`'s second arg `{ dispatch, getState, rejectWithValue }`.

---

### Q4: How do you handle race conditions in async Redux code?
* Scenario: search input fires request per keystroke; slow stale response overwrites fresh results.
* Guards ladder:
  1. **AbortController** passed into fetch via thunkAPI.signal; abort prior request before starting new one.
  2. **Request-id check**: capture id before await; ignore fulfillment if `getState()` shows newer id.
  3. **RTK Query / TanStack Query**: subscription-based caches handle this natively (last-arg wins).
Interview gold: describe both the symptom (flicker of wrong data) and two independent defenses (cancel + discard).

---

### Q5: What is Reselect and why do memoized selectors matter?
```js
const selectVisible = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => todos.filter(t => matches(t, filter)) // reruns only on input change
);
```
* `useSelector` runs after EVERY action; unmemoized derived selectors recompute (and produce new array references → re-renders) even when inputs didn't change.
* Reselect caches the last computation keyed by reference equality of inputs: cheap skip when unrelated slices changed.
* Pitfalls: default cache size 1 - alternating inputs thrash it (create per-component factories); input selectors returning new objects defeat memoization entirely.

---

### Q6: How does react-redux's useSelector enforce equality and how do you customize it?
* Default compare is strict `Object.is` on selector output.
* Custom equality: `useSelector(sel, shallowEqual)` from react-redux, or store-wide via `createSelectorHook` legacy APIs.
* Rules to articulate:
  * Return primitives/stable references whenever possible - cheapest correctness.
  * shallowEqual fixes object-literal selectors without Reselect overhead.
  * Never rely on deep equality as a habit - it taxes every notification; restructure state instead.

---

### Q7: What are normalized vs denormalized state shapes in Redux?
* **Normalized**: `{ entities: { tasks: {1:{...},2:{...}}, users: {...} }, ids: [...] }` - each entity stored once; relationships by id; updates surgical; selectors join on demand.
* **Denormalized**: server-shaped nested trees - trivial hydration, but updating one user means touching every embedded copy.
* Normalize when entities update independently at meaningful frequency (collaborative boards, feeds). Libraries: normalizr schemas or hand-rolled reducers. Pair with memoized join-selectors so components still receive convenient shapes.

---

### Q8: What is RTK Query and when would you choose it over thunks?
* A full data-fetching/cache layer built into RTK: define `createApi` endpoints; get auto-generated hooks with loading states, caching by tags/args, deduping, polling, optimistic updates, invalidation graph.
* Choose it when most state IS server data (typical CRUD apps) - deletes hundreds of hand-written thunk+slice pairs.
* Keep plain slices for genuinely client-authored state (UI prefs, wizards) alongside the api slice.
* Contrast: thunks remain fine for occasional bespoke calls or orchestrating non-cacheable workflows.

---

### Q9: Explain tag-based invalidation in RTK Query.
```js
getPosts: builder.query({ query: () => 'posts', providesTags: ['Post'] }),
addPost: builder.mutation({
  query: body => ({ url: 'posts', method: 'POST', body }),
  invalidatesTags: ['Post'],
})
```
* Queries declare which tags they PROVIDE; mutations declare which they INVALIDATE - the cache refetches affected queries automatically.
* Granular ids: `providesTags: result => [...result.map(p=>({type:'Post',id:p.id})),{type:'Post',id:'LIST'}]` lets mutations invalidate one item or the list precisely.
* Alternative pattern: `onQueryStarted` PATCH-style optimistic updates with `updateQueryData` - invalidation-free but requires careful rollback.

---

### Q10: How do you implement optimistic updates in Redux safely?
Pattern (mutation with rollback):
1. Snapshot affected slice (`const prev = getState().cart.items`).
2. Dispatch success-typed action immediately with temp id/flag.
3. Fire request; on fulfill replace temp with server truth; on reject dispatch rollback action restoring snapshot + error toast.
Concurrency rules: queue per-entity so overlapping optimists stack coherently; refetch reconciliation must merge around pending entries (never blanket-overwrite unconfirmed rows). RTK Query's `onQueryStarted` + `dispatch(api.util.updateQueryData(...)).undo` formalizes exactly this dance.

### Q11: How does Immer work under the hood in createSlice?
* Reducers receive a Proxy **draft** of the state; your mutations record operations; on return Immer replays them onto a copy producing a new immutable tree with structural sharing (untouched branches keep references).
* Consequences worth stating:
  * Cheap bailouts: if nothing changed, the SAME reference returns - selectors skip renders.
  * Freezing: produced states are frozen in dev, catching stray mutations loudly.
  * Limits: Map/Set need `enableMapSet()`; exotic class instances lose their prototype unless handled; extremely hot paths may pay measurable proxy cost - benchmark before blanket adoption.

---

### Q12: What are extraReducers and when do you use them?
* `extraReducers` lets one slice respond to actions DEFINED ELSEWHERE (other slices or thunks) without claiming ownership:
```js
extraReducers: b => b
  .addCase(fetchUser.fulfilled, (s,a) => { s.profile = a.payload; })
  .addMatcher(isRejected, s => { s.error = true; })
  .addDefaultCase(() => {});
```
* Canonical uses: auth slice reacting to `logout` from any domain; UI slice tracking global pending counts via matchers.
* Rule: reducers own their state; extraReducers never mutate another slice's state - they only react.

---

### Q13: How do you structure cross-slice communication cleanly?
Anti-pattern: importing slice A's action creators inside slice B's reducer files (circular import hell).
Patterns ranked:
1. **Event direction**: low-level slice dispatches generic event action (`session/loggedOut`); higher slices handle via extraReducers.
2. **Listener middleware** (`createListenerMiddleware`): central reactive hub - subscribe to actions, dispatch follow-ups with full typing; replaces hand-rolled watcher sagas for 90% of cases.
3. **Orchestrating thunk**: composes multiple slice actions for transactional flows.
Keep reducers dumb and pure; put choreography in exactly ONE of these layers per flow.

---

### Q14: What is the listener middleware and how does it differ from a custom middleware?
* `createListenerMiddleware()` gives you `startListening({ actionCreator/predicate, effect })` subscriptions installed like normal middleware.
* Difference from classic middleware: you declare REACTIVE subscriptions (action → effect) after store creation, dynamically start/stop them at runtime, and get typed access to `getState/dispatch/originalState`.
* Use cases: debounced autosave on `form/changed`, toast side-effects on error actions, websocket fan-in dispatching plain actions.
* Sagas comparison: no generators/declarative take-patterns; simpler mental model, weaker for complex cancellation choreography.

---

### Q15: How do you test Redux logic effectively?
Layers:
1. **Reducers/actions**: pure unit tests - `(reducer(prev, action)).toEqual(expected)` table-driven.
2. **Thunks**: mock API module (msw preferred over jest.mock), dispatch against a real `configureStore`, assert dispatched sequence + final state.
3. **Selectors**: feed fixture states; assert values AND memoization identity where perf-critical.
4. **Components**: render with the real store provider; interact; assert DOM + dispatched effects - avoid asserting internals.
Utilities: RTK's `configureStore` in tests, `vi.fn` spies on dispatch via injected middleware, msw for network determinism.

---

### Q16: What performance pitfalls plague large Redux apps and how do you fix them?
* **Whole-state subscribers**: `useSelector(s => s)` re-renders on everything - enforce narrow selectors via lint.
* **Unmemoized derived data**: new array each run → render storms - Reselect/useShallowEqual.
* **Giant single slice**: unrelated keys invalidate shared consumers - split by domain/change-frequency.
* **Action floods**: pointer-move style events through redux - throttle upstream or move to refs/transient stores.
* **Deep equality habits**: expensive comparators on every notification - prefer shape restructuring.
Measure first with React Profiler + why-did-you-render; optimize proven offenders only.

---

### Q17: How does SSR/hydration interact with a Redux store?
* Never reuse a module-singleton store across server requests - user A's state leaks to user B. Create per-request stores (`makeStore()`) and pass through Provider within that request's tree.
* Hydration parity: client initial state must match what server rendered; either serialize store snapshot into page payload and seed client store, or ensure defaults are deterministic until effects run.
* RTK Query SSR: use its server-side helpers to prefill cache and serialize `api.util.selectInvalidatedBy`-style state for seamless hydration.
Mention StrictMode double-render purity requirements for reducers/selectors.

---

### Q18: What are the trade-offs between normalize+thunks vs RTK Query vs external caches?
Decision axes: mutation patterns, invalidation complexity, offline needs, team familiarity.
* Hand-rolled normalized slices + thunks: max control, max boilerplate; justified for bespoke sync engines/offline queues.
* RTK Query: 90% CRUD apps - declarative tags beat hand-maintained entity stores; integrates as just another slice.
* TanStack Query alongside redux: pragmatic split (server cache outside, UI state inside) when teams already standardized on it.
Interview framing: name the workload, then pick - never dogma.

---

### Q19: How do you type a Redux app end-to-end with TypeScript?
```ts
export const store = configureStore({ reducer });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// pre-typed hooks
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
```
* Thunks: define `AppThunk = ThunkAction<void, RootState, unknown, Action>` or configure with thunk types for `createAsyncThunk` inference.
* Slices: payload types inferred; use `PayloadBuilder` for complex prepare callbacks.
Discipline: forbid raw `useDispatch` via lint; every file imports the typed hooks - typos become compile errors instead of silent string mismatches.

---

### Q20: When would you still choose raw Redux core (without RTK)?
Rare but real cases:
* Embedding minimal redux into non-React packages where bundle size dominates and RTK's batteries add weight.
* Legacy codebases mid-migration where introducing RTK semantics would fork conventions mid-flight.
* Educational contexts demonstrating mechanics.
Even then: adopt Immer manually, keep devtools middleware, and isolate so future migration is mechanical. The honest interview answer: "almost never today - and I'd push back with specifics before accepting the constraint."


