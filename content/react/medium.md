# React - Medium Interview Questions

## Theory Questions & Answers

### Q1: Explain the React Context API. When should you use it, and how do you prevent unnecessary re-renders in consumers?
**Answer:**
The **Context API** is React's built-in system for passing data down the component tree without manually threading props through intermediate layers (avoiding "prop drilling").

**How it works:**
1. **`React.createContext(defaultValue)`**: Creates a Context object.
2. **`Provider`**: A component that wraps the component subtree and accepts a `value` prop.
3. **`useContext(Context)`**: A hook that lets components subscribe to context changes.

**When to use it:**
Use Context for global, low-frequency updates, such as user authentication state, UI themes (light/dark mode), active locales/languages, or shared multi-step wizard state.

**The Performance Problem (Unnecessary Re-renders):**
Whenever the `value` of a Context Provider changes, *all* descendant components that consume that Context will re-render, even if they only use a subset of the context value that didn't change. Furthermore, if the Provider passes an object literal (e.g., `value={{ state, dispatch }}`), a new object reference is created on every render, triggering updates for all consumers.

**How to optimize and prevent these re-renders:**
1. **Memoize the Value Object:** Wrap the value passed to the Provider in `useMemo` so its reference remains stable unless the state changes.
   ```jsx
   const contextValue = useMemo(() => ({ state, dispatch }), [state]);
   return <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>;
   ```
2. **Split Contexts:** Separate state and dispatch into two different Contexts. This ensures that components that only dispatch actions (which never change) don't re-render when the state updates.
3. **Use Component Splitting / Memoization:** Wrap the direct consumer component in `React.memo`, or use child components passed as `children` (which React won't re-render unless their parent changes props).

---

### Q2: What are `useMemo` and `useCallback`? How do they work, and what is their performance overhead?
**Answer:**
`useMemo` and `useCallback` are optimization hooks designed to prevent expensive recalculations and unnecessary child component re-renders by caching values and function references.

1. **`useMemo(fn, deps)`**:
   * **Purpose:** Memoizes the *result* of an expensive calculation.
   * **How it works:** Executes the function and caches the result. On subsequent renders, it returns the cached value unless the dependencies in the array change.
2. **`useCallback(fn, deps)`**:
   * **Purpose:** Memoizes the *function reference* itself.
   * **How it works:** Returns the exact same function reference between renders unless its dependencies change. This is crucial when passing callback functions as props to memoized child components (`React.memo`) to avoid breaking prop-equality checks.
   * Note: `useCallback(fn, deps)` is syntactically equivalent to `useMemo(() => fn, deps)`.

**Performance Overhead & Overuse:**
Developers often fall into the trap of wrapping every function in `useCallback` and every computation in `useMemo`. This can actually *hurt* performance due to:
* **Memory Overhead:** Storing dependency arrays and closures in memory.
* **CPU Overhead:** Running a dependency comparison check (`Object.is`) on every single render.

**When to use them:**
* Use `useMemo` when performing complex computations (e.g., filtering or sorting arrays with thousands of items).
* Use `useCallback` when passing a callback to a child component optimized with `React.memo`, or when the function itself is a dependency in another hook (e.g., inside a `useEffect`).

---

### Q3: Explain the heuristics of React's Virtual DOM reconciliation (diffing) algorithm.
**Answer:**
The Virtual DOM diffing process determines how to update the real DOM when state changes. A generic tree comparison algorithm has a time complexity of $O(n^3)$. To achieve real-time performance, React uses a **heuristic O(n) algorithm** based on two main assumptions:

1. **Two elements of different types will produce different trees.**
   If React detects that a parent node has changed type (e.g., changing from `<div>` to `<span>`, or from a `<Counter>` component to a `<Profile>` component), it doesn't try to diff them. Instead, it tears down the entire subtree, destroys its state, and mounts a brand new tree from scratch.
2. **The developer can hint at which child elements are stable across renders with a `key` prop.**
   When comparing children of the same parent, React matches keys to map nodes from the old tree to the new tree. This allows it to efficiently detect when items are inserted, deleted, or reordered without rebuilding the entire list.

**Reconciliation details for same-type elements:**
If two React elements are of the same type, React keeps the DOM node, updates only the changed attributes or CSS classes, and then recursively diffs their children.

---

### Q4: What are Custom Hooks, what rules do they follow, and how do they share logic?
**Answer:**
A **Custom Hook** is a JavaScript function whose name starts with `use` and can call other React hooks. They are the primary mechanism in React for reusing stateful logic across multiple components.

**Key characteristics:**
* **No Shared State:** Custom hooks do not share state. Every time a component calls a custom hook, all state variables and effects inside that hook are initialized completely independently. They share *behavior* and *logic*, not data.
* **Abstracting Complexity:** They allow clean encapsulation of operations like fetching data, subscribing to window resizing, handling form inputs, or listening to keyboard events.

**The Rules of Hooks (which custom hooks must also follow):**
1. **Only Call Hooks at the Top Level:** Do not call hooks inside loops, conditions, or nested functions. This ensures React can maintain the correct hook call order across renders (internally, React relies on the exact array index of hook execution to match state variables to their hook calls).
2. **Only Call Hooks from React Functions:** Call them from React functional components or other custom hooks. Do not call them from plain JavaScript helper functions.

---

### Q5: What is React Portals, and what are their common use cases?
**Answer:**
**React Portals** provide a way to render a component's virtual DOM tree into a physical DOM node that exists outside the parent component's DOM hierarchy.

```jsx
ReactDOM.createPortal(child, containerNode)
```

**Common Use Cases:**
* Modals, tooltips, dialogs, and toast notifications. These elements often need to visual break out of their parent containers that might have styling like `overflow: hidden`, `position: relative`, or custom `z-index` stacking contexts.

**Portals & Event Bubbling:**
Crucially, even though a portal component renders somewhere else in the physical DOM, it still behaves like a normal React child component in terms of React's event system.
This means that:
* Events (like mouse clicks) fired inside a portal will still **bubble up** to the virtual React parent components, regardless of where they are in the physical HTML DOM. This allows parent components to capture events from portals seamlessly.

---

### Q6: What are Error Boundaries? How do they work, and what are their limitations?
**Answer:**
An **Error Boundary** is a React component that catches JavaScript errors anywhere in its child component tree, logs those errors, and displays a fallback UI instead of crashing the entire application.

**How they work:**
At present, Error Boundaries **must be implemented as Class Components**. A class component becomes an error boundary if it implements one or both of these lifecycle methods:
1. `static getDerivedStateFromError(error)`: A static lifecycle method that returns the state to display a fallback UI (e.g., `hasError: true`).
2. `componentDidCatch(error, info)`: Used to log error details to an external crash reporting service (e.g., Sentry).

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

**Limitations (What Error Boundaries do NOT catch):**
Error boundaries do *not* catch errors inside:
* Event handlers (e.g., standard `onClick` callback errors; you must use standard `try/catch` there).
* Asynchronous code (e.g., `setTimeout`, `requestAnimationFrame` or `Promise` rejections).
* Server-side rendering (SSR).
* Errors thrown in the error boundary component itself (rather than its children).

---

### Q7: What is lazy initialization in `useState`, and why do functional updates matter?
* **Lazy init**: `useState(() => expensiveComputation())` passes an initializer function executed only on the first render — avoids recomputing heavy defaults (reading localStorage, building maps) on every render.
* **Functional updates**: `setCount(c => c + 1)` receives pending state instead of closure-captured state — mandatory whenever multiple updates fire in one tick or inside callbacks that may outlive their render:
```js
// BUG: both see count = 0 → result 1
setCount(count + 1); setCount(count + 1);
// OK: queued sequentially → result 2
setCount(c => c + 1); setCount(c => c + 1);
```
* Functional form also plays safe under concurrent rendering, where renders may be replayed — updater functions should be pure.

### Q8: When does `useReducer` beat `useState`? What makes dispatch special?
* Choose reducer when: next state depends on previous + action semantics (counters, wizards, undo stacks), multiple fields change together transactionally, or update logic needs unit-testing without React.
* Reducers centralize transitions — components dispatch intents (`{type:'ADD_ITEM'}`) instead of orchestrating spread logic inline; business rules live in one testable pure function.
* **Dispatch identity is stable** across renders (guaranteed like setState) — safe to include in child memo comparisons or pass to context without useCallback wrappers.
* Pattern pairing: `useReducer` + Context replaces Redux for mid-sized local/global state; keep reducers pure and side-effect-free, delegating async work to effects/thunks above them.

### Q9: What are the distinct uses of `useRef` beyond DOM access?
* Mutable box persisting across renders **without triggering re-renders**: interval/timeout IDs, latest-value mirrors (`latest.current = value` each render for stable callbacks), "mounted" flags guarding async completions, previous-prop trackers.
* Storing render-independent instances: chart libraries, observers (IntersectionObserver), AbortControllers keyed to requests.
* Rules: mutating `.current` during render is forbidden (render must stay pure) — mutate in handlers/effects; reading `.current` in JSX won't reflect changes since no re-render is scheduled.
* Versus state: state = data the UI derives from; ref = bookkeeping React shouldn't re-render for. Choosing wrongly either leaks re-renders or misses them.

### Q10: Map class lifecycle methods onto hooks equivalents.
| Class | Hooks equivalent |
| :--- | :--- |
| `componentDidMount` | `useEffect(fn, [])` |
| `componentDidUpdate` | `useEffect(fn, [deps])` (no mount run unless included) |
| `componentWillUnmount` | effect cleanup return |
| `shouldComponentUpdate` | `React.memo` comparator |
| `getDerivedStateFromProps` | derive during render (or key-reset pattern) |
| `componentDidCatch` | Error Boundaries (still class-only) |

* Key conceptual shift: classes split one concern across lifecycle methods; hooks colocate setup/cleanup pairs per-concern (subscribe/unsubscribe together).
* `getSnapshotBeforeUpdate` has no direct hook — rare DOM-measure cases use layout effects with refs.
* Beware literal translation: "didUpdate with prevProps comparison" becomes dep arrays, not manual diffs.

### Q11: In what order do effect cleanups run, and how do stale closures bite?
* Cleanup ordering: before every re-run of that effect, and on unmount; among sibling effects cleanups execute in tree order (parent after children on unmount — actually child-first within a subtree, mirroring commit order) — rely on explicit coordination, not incidental order.
* **Stale closures**: effects capture render-time variables; without listing a dep, the effect keeps seeing old values (classic timer reading outdated `count`). Fixes: add the dep, functional setState, refs-as-mirrors, or reset-and-recreate the resource when inputs change.
* Async races: rapid prop changes spawn overlapping fetches; last-to-resolve wins incorrectly. Standard cure: cleanup calls `AbortController.abort()` / sets a cancelled flag checked before applying results.
* StrictMode amplifies all three bug families in dev (double invoke) — treat it as free race-condition detection.

### Q12: Describe the Context + useReducer global-state pattern and its scaling limits.
```jsx
const StateCtx = createContext(null);
const DispatchCtx = createContext(null);
function Provider({children}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DispatchCtx.Provider value={dispatch}>
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}
```
* Splitting state and dispatch contexts lets action-only consumers subscribe to a stable value — avoiding re-renders caused purely by state changes elsewhere.
* Scaling ceiling: any consumed slice's change re-renders every `useContext(StateCtx)` caller (no selector granularity); mitigation = multiple domain contexts, memoized subtrees, or migrating hot regions to external stores (Zustand) with selector subscriptions.
* Sweet spot: low-frequency global concerns (theme, auth user, feature flags) — not high-frequency server caches.

### Q13: When does `React.memo` actually help — and when does it hurt?
* Helps when: component renders expensively (large lists, complex SVG), AND incoming props are referentially stable (primitives, memoized objects/callbacks, store selectors). Then skipped renders save real work.
* Hurts/neutral when: props include freshly created objects/arrays/functions each render — the shallow compare fails every time, adding comparison overhead atop the render you didn't avoid ("memo tax").
* Shallow compare limitation: memo doesn't deep-compare; nested mutations or new references defeat it silently — pair with useMemo/useCallback or move creation lower/downward (colocate derived data inside the memoized child).
* Process discipline: profile first (React DevTools Profiler highlight-updates); wrap proven offenders, not everything — premature memoization also obscures data-flow smells.

### Q14: What are referential equality pitfalls that cause unnecessary child renders?
* Inline non-primitive props create new identities each parent render: `style={{...}}`, `items={list.filter(...)}`, `onClick={() => ...}` — defeating memo/PureComponent downstream even when values are logically identical.
* Fixes ladder: hoist constants outside the component; `useMemo` for computed collections; `useCallback` for handlers passed to memoized children; move object construction INTO the child (pass primitives).
* Data-layer corollary: normalized stores returning filtered arrays per call have the same problem — selector memoization (or useShallow-style compares) addresses it at subscription level.
* Diagnostic: Profiler's "why did this render?" (props changed: style/onClick) pinpoints unstable identities instantly.

### Q15: How do `React.lazy` + Suspense enable route-level code splitting?
```jsx
const Dashboard = React.lazy(() => import('./Dashboard'));
<Suspense fallback={<Spinner/>}><Dashboard/></Suspense>
```
* Dynamic `import()` splits the bundle at that boundary; webpack/Vite emit separate chunks fetched on first navigation — shrinking initial JS, improving TTI/LCP.
* Route-level granularity gives best payoff (users visit few routes per session); combine with prefetch-on-hover (preload the chunk on link intent) to mask latency.
* Named exports need intermediate module (`export default` or wrapper) since lazy expects a default-resolving promise; SSR requires framework-aware Suspense support.
* Failure UX matters: pair with ErrorBoundary for chunk-load failures after deploys (stale HTML referencing hashed chunks that no longer exist → prompt reload).

---

### Q16: useTransition vs useDeferredValue vs debounce — when is each right?
* **Debounce** delays *the work itself* (network calls, expensive computation) — nothing happens until input settles; still the tool for API-call suppression.
* **`startTransition`/useTransition**: marks React state updates as non-urgent — typing stays instant while the expensive re-render runs at lower priority, interruptible mid-flight. Use for heavy client-side filtering/sorting of large lists.
* **`useDeferredValue(value)`**: derived-lag variant for when the *value* comes from props/state you don't control — renders twice per change (urgent with old value, deferred with new); pairs naturally with memoized children.
* Combos: debounce + transition (skip network storms AND keep list updates non-blocking); never debounce to fix render jank alone — that adds latency instead of removing it.

### Q17: What changed with automatic batching in React 18?
* Pre-18: only updates inside React event handlers batched; setTimeout/promise/native-handler updates each triggered separate renders.
* 18+ (`createRoot`): ALL updates batch automatically regardless of source — multiple setStates in promises/timeouts coalesce into one render pass, cutting wasted intermediate renders.
* Escape hatch: `flushSync(fn)` forces synchronous commit when DOM-read-after-write correctness matters (measuring layout immediately).
* Subtlety: batching groups renders but updater functions still run in dispatch order; effects observe only final committed state — code assuming one-render-per-setState breaks under both old non-handler paths and new unified behavior.

### Q18: How do `forwardRef` + `useImperativeHandle` expose controlled imperative APIs?
```jsx
const Input = forwardRef((props, ref) => {
  const inner = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => inner.current.focus(),
    clear: () => { inner.current.value = ''; }
  }), []);
  return <input ref={inner} {...props} />;
});
```
* Instead of leaking the raw DOM node (implementation coupling), components publish a curated method surface — internals can change freely.
* Deps array controls handle recreation; omitting deps recreates each render (usually harmless but wasteful).
* Legit domains: focus management, media players (play/pause/seek), scroll-to APIs, animation triggers. Anti-pattern: imperative state mutation that should be declarative props — reach for refs last.

### Q19: Controlled vs uncontrolled deep dive: defaultValue, file inputs, FormData.
* Uncontrolled truth lives in DOM: read on demand via refs or `new FormData(form)` — zero per-keystroke renders, ideal for huge forms, file inputs (**always uncontrolled** — `value` on files is read-only), and integrating vanilla plugins.
* `defaultValue`/`defaultChecked` seed initial values without ownership transfer; changing them later does nothing (React warns if value+onChange missing → "read-only" trap).
* Controlled wins for validation-on-type, conditional disabling, cross-field logic, and SSR-consistent values.
* Hybrid reality: libraries like React Hook Form embrace uncontrolled cores with controlled adapters (`Controller`) — knowing WHY (perf + native semantics) impresses more than picking sides.

### Q20: What patterns make lists performant beyond basic keys?
* **Virtualization**: render only visible window (+overscan) via absolute positioning math — react-window/virtuoso handle variable heights with measurement caches; know the tradeoffs (jump-to-index difficulty, dynamic content measurement passes, a11y implications of virtual scroll containers).
* Stable keys + memoized row components prevent whole-list reconciliation; avoid index-based keys with filtering/sorting.
* Chunked/incremental rendering: time-sliced manual chunking or transitions for initial mega-lists before virtualization complexity is justified.
* Selection/edit state placement: row-local state dies on virtualized unmount — lift selection maps upward (state-outside-window problem).

### Q21: Beyond prop drilling: what's the escalation ladder for cross-tree data?
1. **Composition** — pass JSX as children/slots so data-heavy siblings render where data lives (solves most "drilling" without state tools).
2. **Component colocation** — move state down to actual consumers instead of lifting prematurely.
3. **Context** — low-frequency globals (theme/auth/locale) with split contexts.
4. **External store with selectors** — high-frequency shared state (Zustand/Jotai) granting subscription granularity Context lacks.
5. **Server cache library** (TanStack Query) — realize most "global state" is server-data duplication needing cache semantics, not a store.
6. URL as state — filters/tabs belong in search params first (shareable, back-button-correct).

### Q22: Explain state colocation and premature lifting costs.
* Colocate state at the deepest component consuming it — sibling isolation means unrelated subtrees skip re-renders entirely.
* Premature lifting (everything into a page-level reducer/context) turns any keystroke into tree-wide reconciliation; profiling routinely shows giant context providers as render amplifiers.
* Inverse failure too: state buried too low forces awkward callback threading when two distant nodes genuinely need it — the craft is *moving* state until consumers align, guided by render traces.
* Derived-state corollary: prefer computing during render from colocated sources over syncing duplicates via effects (duplicate state drifts).

### Q23: Contrast compound components with config-prop APIs.
* Config style: `<Tabs items={[...]} active={i}/>` — single component owns everything; rigid for custom cell rendering, grows prop-union sprawl.
* Compound style: parent provides implicit context; children (`<Tab>`, `<TabPanel>`) register/consume via context + cloneElement/index coordination:
```jsx
<Tabs defaultIndex={0}>
  <TabList><Tab>One</Tab><Tab>Two</Tab></TabList>
  <TabPanels><TabPanel>...</TabPanel></TabPanels>
</Tabs>
```
* Wins: arbitrary composition/ordering, consumer-controlled markup/styling per part, a11y wiring centralized in parent (roving tabindex, aria-controls).
* Implementation care: context carrying registration order must survive strict-mode double renders; index-based identity vs key-driven — Headless UI/Radix exemplars worth citing.

### Q24: HOC vs Render Props vs Hooks — trace the evolution and remaining niches.
* HOC era (2015-2018): wrapper factories injecting props (`connect()(Comp)`) — problems: wrapper hell in DevTools, prop namespace collisions, ref forwarding friction, static-method hoisting boilerplate.
* Render props: explicit `<Mouse>{({x,y}) => ...}</Mouse>` — solved collision via parameter scoping but nested callbacks ("render-prop pyramid") hurt readability; still ideal for render-delegation semantics (virtualizers, drag contexts exposing layout slots).
* Hooks won for logic reuse (no wrapper elements, colocation, lint support), but render props persist where the VALUE IS THE RENDER LOCATION; HOCs persist at framework boundaries (Redux connect legacy, Next.js page HOCs) and for cross-cutting wrappers (error/loading decoration).
* Interview framing: choose by composition axis — data-in-logic → hooks; data-in-JSX-position → render props.

---

### Q25: How do you structure data fetching in effects without races and waterfalls?
* Status machine per request: `idle | loading | success | error` stored explicitly — never infer from null-juggling; abort in cleanup:
```js
useEffect(() => {
  const ctrl = new AbortController();
  fetch(url, { signal: ctrl.signal })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(setData)                       // cancelled fetches reject before this
    .catch(e => e.name !== 'AbortError' && setError(e));
  return () => ctrl.abort();
}, [url]);
```
* Waterfalls: sequential awaits for independent data serialize latency — `Promise.all`, or split subtrees so each streams/fetches independently.
* Keyed cache: store results by url/id map to avoid refetch-on-remount churn; recognize when this hand-rolling crosses into TanStack Query territory (deduping, retries, background refresh).

### Q26: Server-state vs client-state — why does TanStack Query replace most "global state"?
* Server state properties: persisted remotely, concurrently mutated by others, stale the moment fetched, needs cache/dedup/retry/invalidation — none of which fit UI-store semantics.
* Query gives: keyed caching (`['todos', filter]`), automatic dedupe across components, background refetch windows (staleTime vs gcTime), mutation invalidation hooks, pagination/infinite helpers, devtools visibility.
* Client store's remaining jurisdiction: UI/session concerns (theme, modals, wizard steps, selections) — Zustand-sized problems.
* Architecture answer interviewers love: "We stopped putting todos in Redux; they're a query cache. Redux kept only view prefs." Misusing stores as server caches causes staleness bugs libraries already solved.

### Q27: What does an optimistic update lifecycle look like end-to-end?
* On mutate: immediately patch cache/store (temp id, flag `optimistic: true`), fire request, track pending entry.
* Success: reconcile server truth (replace temp entity / merge canonical fields), clear pending marker.
* Failure: rollback snapshot (cache library utilities like onMutate snapshots in TanStack) + surface toast/error + optionally retry queue.
* Concurrency hazards: two overlapping optimistic mutations — order reconciliation via sequence numbers; refetch-during-pending must not clobber unconfirmed writes (invalidate AFTER pending drains).
* UX guardrails: visual pending affordances, disable conflicting actions (double-submit), cap optimistic window with fallback-to-spinner for slow networks.

### Q28: Describe a production-grade debounced search implementation.
* Input state updates instantly (controlled); a deferred value drives fetching: debounce 250–400ms OR useDeferredValue for render-cost-only scenarios.
* Request side: AbortController per effect keyed by debounced term; ignore aborted results; minimum-term-length gate; optional in-flight dedupe via cache key.
* Race safety test: type "rea" then "react" fast → only "react" result may render; stale responses discarded by signal, not by timestamp guessing.
* Extras that impress: keyboard navigation preserving current query, loading shimmer distinct from empty-state, URL-synced query (?q=) making results shareable/back-button correct.

### Q29: Infinite scroll vs pagination — implementation tradeoffs?
* Infinite: IntersectionObserver sentinel near list end triggers next-page append; keep page tokens (cursor > offset for stability under inserts); maintain scroll anchoring (CSS `overflow-anchor`) preventing jump when content prepends.
* Costs: DOM growth → virtualization mandatory at scale; deep-linking/restoring position requires serialized cursor state; analytics/monetization prefer discrete pages.
* Pagination: cheap random access, SEO-friendly URLs, predictable memory; friction of clicking.
* Hybrid patterns: "Load more" buttons (explicit consent, simpler a11y), paginated API behind infinite UX via prefetch-next-page-on-70%-scroll.

### Q30: What belongs in React accessibility basics every reviewer checks?
* Semantics first: real `<button>` not clickable divs; heading hierarchy; landmark regions (`nav/main/footer`); lists as `<ul>/<li>`.
* Keyboard paths: visible focus (`:focus-visible` styles), logical tab order (DOM order = visual order), Enter/Space activating controls, focus trap + restore for modal dialogs (portals + focus management).
* ARIA sparingly: interactive widgets needing roles/state (`aria-expanded`, `aria-current`, live regions `aria-live="polite"` for async toasts); no aria-label spam where visible text exists.
* Async courtesy: loading states announced (role="status"), errors tied to inputs via `aria-describedby`; never outline:none without replacement.

### Q31: How do you test React components the way RTL intends?
* Philosophy: query by *what users perceive* (roles, labels, text) not implementation (class names, state shapes) — getByRole primary, getByLabelText for forms; avoid data-testid unless semantics impossible.
* Behavior over internals: fireEvent/userEvent simulating real interaction sequences (userEvent.type includes keydown/input/keyup cadence); assert observable outcomes (rendered text, called mock endpoints) rather than useState contents.
* Async discipline: findBy*/waitFor for async UI; act() warnings mean missing wrapping of state updates; fake timers for debounce tests.
* Scope pyramid: many small unit tests (hooks via renderHook), fewer integration flows (MSW-mocked network), sparse E2E — mocking the network boundary keeps component tests deterministic.

### Q32: How do you hunt and fix memory leaks from subscriptions/intervals?
* Leak signatures: detached nodes retained via closures, growing listener arrays (EventEmitter warnings), heap snapshot diff showing duplicated component instances after route toggles.
* Usual suspects: setInterval/setTimeout without cleanup; addEventListener on window/document; third-party widget instances stored in refs but never destroyed; subscriptions to stores outside useSyncExternalStore without unsubscribe-in-cleanup; promises holding large payloads past relevance.
* Discipline: every setup returns teardown in same effect; refs cleared on unmount when holding heavy objects; AbortControllers aborted; WeakMap/WeakRef for caches keyed by instances.
* Verification loop: React DevTools highlight re-mounts + Chrome heap snapshots (3-snapshot technique) proving stabilization after fix — bring numbers to the interview.

### Q33: Why are HOC pitfalls still asked — enumerate them concretely.
* Wrapper hell: DevTools trees bury real components under N layers (Connect(withRouter(withTheme(...)))) breaking debugging/profiling readability.
* Static method & ref loss: wrapped components hide forwarded refs (need forwardRef plumbing) and statics (must hoist manually) — silent breakages.
* Prop collisions: injected prop names clobber user props unintentionally (`withUser` overwriting passed `user`) — namespace conventions emerged but undisciplined HOCs bite.
* Generic-type erosion in TS historically painful (inference through compose chains). Mitigations if stuck with HOCs: single-purpose wrappers, explicit displayName, typed hoisting utils; otherwise migrate logic into hooks and keep HOCs only at framework seams.

---

### Q34: What problems does `useId` solve and how is it used?
* Generates SSR/client-stable unique ids safe under hydration and concurrent renders — deterministic per component instance position, NOT random.
* Primary uses: pairing form control/label (`htmlFor`), aria attributes (`aria-controls`, `aria-describedby`), SVG defs references — anywhere duplicated component trees previously produced colliding hardcoded ids.
* Format includes `«r0»`-style separators intentionally invalid for CSS selectors (prevents misuse as styling hooks); derive DOM-safe variants via replace if needed.
* Anti-patterns: using ids as keys, expecting sequential stability across list reorders (identity tied to tree position) — keys/data ids remain the identity mechanism.

### Q35: How do you integrate third-party DOM libraries (charts/maps/editors) idiomatically?
* Lifecycle bridge: instantiate in mount effect with ref target; destroy in cleanup (memory leak otherwise); update via library API inside effect keyed by relevant props rather than re-instantiating.
* Props-to-library sync: split "create-time config" from "runtime setters" — recreating heavy widgets on every prop change is the classic perf crime; diff manually or use library's data-update methods.
* React 18 strictness: double-invoke means effects must be symmetric (init/destroy pairs survive remount loops); concurrent-safety: don't let library callbacks call setState after unmount (guard with mounted ref or AbortSignal).
* Wrapping pattern: expose curated props + useImperativeHandle for imperative escape hatch; keep library internals out of consumer types.

### Q36: What's your checklist for diagnosing "the whole page re-renders on every keystroke"?
1. Profiler record while typing → identify commit roots and flamegraph spread.
2. Trace state owner: input state lifted too high? Colocate into leaf or URL/local component.
3. Context scan: is keystroke state flowing through a Provider wrapping everything? Split contexts / move provider down.
4. External store check: whole-store subscriptions (useStore() without selector) — add selectors/useShallow.
5. Identity audit: unstable handler/value props cascading through memo walls — useCallback/move-down.
6. Derived-data effects writing state back (setState in render-adjacent effects causing loops).
Fix order matters: structural (ownership/placement) before memoization cosmetics.

### Q37: How do you handle long-running calculations without freezing UI?
* Prefer moving compute off main thread: Web Worker for >16ms CPU tasks (structured-clone inputs, Transferable buffers); pool workers for bursts; Comlink-style RPC to tame messaging boilerplate.
* In-thread alternatives: chunked processing with scheduler yielding (`startTransition` for React-state-derived work; manual time-sliced loops with `await yieldToBrowser()` between batches); incremental/streaming algorithms updating progressively.
* Memoize aggressively when results repeat (input-keyed caches, WeakMap-by-entity).
* Decision heuristics interviewers like: latency tolerance (interactive-blocking vs background), data transfer cost vs compute cost, determinism requirements — Workers aren't free (serialization tax can exceed compute for small jobs).

### Q38: What are controlled-across-libraries patterns (DnD, virtualization, forms coexisting)?
* Single source-of-truth principle: one store owns entity positions/state; DnD library mutates via adapter callbacks dispatching to that store; virtualizer reads derived order — no shadow copies drifting.
* Adapter layering: thin hook wrappers translating library events → domain actions (onDragEnd → moveTask({id, toIndex})) keeping vendor types out of business logic; swap-ability test.
* Ref coordination: virtualized rows hosting drag handles need stable refs + measurement invalidation on reorder (notify both systems post-mutation).
* SSR caveat: drag libs are client-only — gate behind mounted checks/dynamic imports to avoid hydration mismatch; document fallback interactions (keyboard reorder) preserving a11y parity.

### Q39: How do you implement theming without re-render storms?
* CSS custom properties strategy: theme = object of tokens set once on root (`style.setProperty`) or data-theme attribute + CSS vars — component re-renders ZERO because styling resolves at paint; switching = attribute flip.
* Context strategy viable for token objects referenced rarely; memoize provider value; split static/active theme consumers.
* Styled-components/Emotion path: ThemeProvider context triggers full-tree style regeneration — mitigate with transient props, stylesheet variable bridging, or migration to zero-runtime CSS-in-JS/Tailwind dark: variants.
* Persistence/system-preference: prefers-color-scheme listener + localStorage init before hydration (inline script) avoiding flash — mention FOUC prevention since interviews probe end-to-end.

### Q40: What does "derive during render, don't synchronize with effects" mean concretely?
* Anti-pattern: `useEffect(() => setFullName(first+' '+last))` — extra render pass, stale windows, effect churn. Derive inline: `const fullName = first + ' ' + last`.
* Adjustment pattern (props→state reset): compare during render against cached prev and setState-if-changed (React docs' approved pattern) OR force via key — never effect+setState chains racing each other.
* Benefits: fewer commits, no flicker of intermediate states, simpler reasoning (UI = pure function of current inputs).
* Boundary: genuinely asynchronous derivations (server-computed) still belong in queries/effects — the rule targets synchronous computable values.

### Q41: What belongs in a senior answer about React security?
* XSS: default escaping protects text/attributes; dangers live at `dangerouslySetInnerHTML` (sanitize server-side with allowlists), `href={userInput}` javascript: URIs (validate schemes), iframe sandboxes, and markdown renderers — cite OWASP + DOMPurify patterns.
* Dependency/supply chain: lockfiles, audit gates, CDN integrity (SRI) for UMD-era leftovers.
* Auth surface: tokens in localStorage vs httpOnly cookies tradeoffs; never client-side authorize-only (server enforces).
* Prototype pollution via query-param merging into state; postMessage origin validation for embedded apps; CSP nonce integration with frameworks' streaming scripts.
* Framing: React reduces ONE class of XSS; architecture-level hygiene remains developer responsibility.

### Q42: How do you approach migrating a class-component codebase incrementally?
* Order by leverage: leaves first (pure presentational classes → functions trivially), containers with complex lifecycle later; wrap-not-rewrite where risk concentrates.
* Mechanical bridges: HOC wrappers letting new hooks-based children live under legacy parents; adapters exposing legacy singletons (event buses) via custom hooks so new code stays idiomatic.
* Testing net: snapshot behavioral tests around components pre-refactor; error-boundary instrumentation catching regressions during swaps.
* Codemods (react-codemod suite) for mechanical transforms; track progress via lint rule banning new classes; celebrate quick wins (this-binding bug elimination) to sustain momentum.

### Q43: What design considerations govern a component library's public API?
* Controlled+uncontrolled duality (value/defaultValue contract) for flexibility; forwardRef everywhere; composition-first primitives over monolithic props.
* Style extensibility: className merge conventions, CSS variables/design-token seams, no style hard-coding beyond resets; slot/render-prop overrides for markup freedom.
* A11y non-negotiables baked in (roles/focus management/keyboard maps documented); SSR compatibility (no window-at-module-top); tree-shaking friendly ESM exports (sideEffects:false verified).
* Versioning discipline: codemods for breaking changes, deprecation warnings ahead, changelog hygiene — DX artifacts (docs playgrounds, TS types as documentation) differentiate senior-authored libraries.

### Q44: Explain Suspense-list coordination (legacy) and modern ordering alternatives.
* `<SuspenseList revealOrder="forwards|backwards|together">`: controlled disclosure of nested boundaries — forwards preserves top-down reveal (layout stability), together waits all (avoid pop-in cascade); tail="collapsed|hidden" controls placeholder count.
* Status: experimental/removed-ish in newer lines — production ordering achieved via layout composition (min-height placeholders), skeleton choreography, and route-level transitions instead.
* Concept retention value: demonstrates React's streaming ordering problem space — why out-of-order flushes need UI mitigation strategies regardless of API availability.
* Interview handling: acknowledge experimental status explicitly; discuss what you'd do with stable tools — signals judgment over memorization.

### Q45: How do you make lists with editable rows correct (state identity pitfalls)?
* Row-local useState dies when rows unmount (virtualization/filtering) — lift edit drafts to parent map keyed by row id, or persist drafts to draft-store (separate from source entities).
* Draft isolation: edits apply to copies; explicit save/cancel semantics; dirty-tracking via shallow diff for unsaved indicators.
* Keyed reconciliation: stable ids keep focused input mounted across sorts; index-keys here cause focus jumps/lost caret — classic bug interviewers describe expecting diagnosis.
* Concurrency: autosave debounces per-row with abort-on-unmount flush; conflict handling (stale overwrite) needs version fields or last-writer-wins policy decision documented.

---

### Q46: How do you sync component state with the URL (filters, tabs, modals)?
* Treat URL as first-class state: `useSearchParams`/history APIs own canonical values; components derive UI from them — back/forward, refresh, and link-sharing work free.
* Modal-in-URL pattern: `?edit=42` opens editor — deep-linkable, escape/back closes naturally; replace vs push semantics chosen deliberately (filters replace, wizard steps push).
* Serialization discipline: arrays/objects encoded compactly (qs conventions), defaults omitted to keep URLs clean, invalid params validated with fallbacks.
* Anti-patterns: duplicating URL state into useState (drift), effects pushing history on every render (loops), non-idempotent param handling breaking forward/back.

### Q47: What belongs in a form architecture answer at medium-senior level?
* Library choice rationale: React Hook Form (uncontrolled perf + zod resolver), Formik legacy maintenance mode, controlled hand-rolled only for tiny forms.
* Schema-first validation: single zod schema shared client+server, field-level errors mapped via resolver; async validation debounced (username availability) with request cancellation.
* UX mechanics: validate onBlur→onError-then-onChange progression (don't yell while typing first pass), submit-time full schema check, disabled-until-valid vs always-clickable-with-summary tradeoffs.
* State hygiene: dirty/touched tracking from library not manual mirrors; multi-step forms persisting drafts per step; file fields uncontrolled; reset semantics after successful submit.

### Q48: What i18n concerns are React-specific?
* Provider hierarchy: locale/intl context near root; message catalogs code-split per locale (dynamic import) keeping bundles lean.
* Rendering correctness: format dates/numbers via Intl APIs bound to active locale — hydration-safe by fixing locale server+client; avoid toLocaleString without explicit locale (env-dependent).
* Pluralization/gender: ICU MessageFormat via libraries (react-intl/next-intl/lingui) rather than ternary forests; RTL support flips layouts via logical CSS properties, direction attribute at html level.
* Operational: translation keys as typed contracts (generated types catching missing keys), pseudo-localization testing catching hard-coded strings, lazy locale switching without full reload.

### Q49: How do you structure feature folders at scale (and why not type-first folders)?
* Feature-first: `features/cart/{components,hooks,api,store,tests}` colocating change units — a feature ships/dies as one folder; type-first (all hooks/, all components/) scatters related edits across trees.
* Public API per feature: index barrel exporting ONLY the contract (components/hooks/types); deep-import lint rules prevent cross-feature internals coupling — dependency graph stays acyclic via import boundaries tools (eslint-plugin-boundaries/dependency-cruiser).
* Shared kernel minimal: ui primitives, lib utils, api client — features may use kernel, never each other's internals (compose via exported components/props instead).
* Migration pragmatics: strangler approach moving one feature at a time; measure via review-latency/build-times improving — architecture justified by change-pattern data.

### Q50: Which React performance misconceptions should you actively correct in interviews?
* "Virtual DOM is fast" — diffing costs; correctness framing: VDOM enables declarative programming with acceptable cost; real speed comes from doing less work (bailouts, selectors, virtualization).
* "Always memo/useCallback" — comparison overhead + cognitive tax often exceed savings; profile-driven application wins.
* "Immutable updates are for Redux only" — React bailouts rely on reference identity everywhere; mutating state objects silently breaks memo/comparisons even with useState.
* "Keys are just for warnings" — identity semantics drive state preservation/reuse bugs.
* "Effects replicate lifecycles" — effects synchronize with external systems; thinking in mount/update vocabulary produces fragile dependency arrays. Correcting these fluently signals depth beyond API recall.

---

## Coding & Implementation Challenges

### Challenge 1: Custom `useFetch` Hook with Race-Condition Resolution
**Requirement:** Create a custom hook `useFetch` that accepts a URL and an options object. It must return `{ data, loading, error, refetch }`. Crucially, it must handle:
1. Cleanups with `AbortController` to abort ongoing fetches on unmount or URL change (preventing memory leaks).
2. **Race condition prevention** (ignoring slower, stale responses when the URL changes rapidly).

```jsx
import { useState, useEffect, useCallback, useRef } from 'react';

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use a ref to store stable options reference to prevent infinite loops if options object is recreated
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const fetchData = useCallback(async (abortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, { ...optionsRef.current, signal: abortSignal });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      // In a real implementation, we only set loading to false if not aborted
      if (!abortSignal.aborted) {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    const controller = new AbortController();
    
    fetchData(controller.signal);

    // Cleanup: cancels current fetch request on component unmount or URL/fetchData dependency change
    return () => {
      controller.abort();
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
  }, [fetchData]);

  return { data, loading, error, refetch };
}
```

---

### Challenge 2: Fully Accessible Modal Component using React Portals
**Requirement:** Implement a modal dialog that renders inside a portal attached to a separate DOM container (`div#modal-root`). It must incorporate accessibility features: clicking outside to dismiss, pressing the "Escape" key to close, and managing body-scroll lock when open.

```jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export function AccessibleModal({ isOpen, onClose, title, children }) {
  // Listen for the Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent parent body scrolling when modal is active
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Render to a portal to escape CSS constraints (z-index, overflow, relative positioning)
  return ReactDOM.createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose} // Close on backdrop click
    >
      <div 
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent event bubbling to backdrop
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h2>
          <button 
            onClick={onClose} 
            style={{ 
              border: 'none', 
              background: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              lineHeight: 1 
            }}
            aria-label="Close Modal"
          >
            &times;
          </button>
        </header>
        <main style={{ fontSize: '1rem', color: '#333' }}>
          {children}
        </main>
      </div>
    </div>,
    document.body // Appends directly under body for clean CSS stacking context
  );
}
```

---

### Challenge 3: Advanced Form Context Management (Multi-Step Form wizard)
**Requirement:** Build a context-powered multi-step wizard form. Intermediate steps must contribute data to a shared state context. Include full navigation (next, previous), input values collection, field validations, and a mock API submit function.

```jsx
import React, { createContext, useContext, useState, useMemo } from 'react';

// Create Form Context
const FormContext = createContext(null);

export function FormProvider({ children }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: 'Basic',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = () => {
    const nextErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) nextErrors.name = 'Name is required.';
      if (!formData.email.trim() || !formData.email.includes('@')) {
        nextErrors.email = 'Enter a valid email address.';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Memoize context value to optimize child re-renders
  const value = useMemo(() => ({
    step,
    formData,
    errors,
    updateField,
    nextStep,
    prevStep,
    setStep
  }), [step, formData, errors]);

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

// Custom Hook to consume Context safely
function useFormWizard() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormWizard must be used inside a FormProvider');
  }
  return context;
}

// Inner components mapping the multi-step pages
function Step1() {
  const { formData, errors, updateField, nextStep } = useFormWizard();
  return (
    <div>
      <h3>Step 1: Contact Details</h3>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Name:</label>
        <input 
          type="text" 
          value={formData.name} 
          onChange={(e) => updateField('name', e.target.value)} 
          style={{ width: '100%', padding: '8px' }}
        />
        {errors.name && <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.name}</p>}
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Email:</label>
        <input 
          type="email" 
          value={formData.email} 
          onChange={(e) => updateField('email', e.target.value)} 
          style={{ width: '100%', padding: '8px' }}
        />
        {errors.email && <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.email}</p>}
      </div>
      <button onClick={nextStep} style={{ padding: '8px 16px', cursor: 'pointer' }}>Next</button>
    </div>
  );
}

function Step2() {
  const { formData, updateField, nextStep, prevStep } = useFormWizard();
  return (
    <div>
      <h3>Step 2: Subscription Plan</h3>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Plan:</label>
        <select 
          value={formData.plan} 
          onChange={(e) => updateField('plan', e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="Basic">Basic ($9/mo)</option>
          <option value="Pro">Pro ($29/mo)</option>
          <option value="Enterprise">Enterprise ($99/mo)</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={prevStep} style={{ padding: '8px 16px', cursor: 'pointer' }}>Back</button>
        <button onClick={nextStep} style={{ padding: '8px 16px', cursor: 'pointer' }}>Next</button>
      </div>
    </div>
  );
}

function Step3() {
  const { formData, prevStep, setStep } = useFormWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Mock API Submit call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert('Subscription successfully created: ' + JSON.stringify(formData));
    setIsSubmitting(false);
    setStep(1); // Reset
  };

  return (
    <div>
      <h3>Step 3: Confirm Choices</h3>
      <p><strong>Name:</strong> {formData.name}</p>
      <p><strong>Email:</strong> {formData.email}</p>
      <p><strong>Plan:</strong> {formData.plan}</p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button onClick={prevStep} disabled={isSubmitting} style={{ padding: '8px 16px', cursor: 'pointer' }}>Back</button>
        <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {isSubmitting ? 'Submitting...' : 'Confirm & Buy'}
        </button>
      </div>
    </div>
  );
}

export function MultiStepFormWizard() {
  return (
    <FormProvider>
      <div style={{ maxWidth: '400px', margin: '20px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <FormWizardRenderer />
      </div>
    </FormProvider>
  );
}

function FormWizardRenderer() {
  const { step } = useFormWizard();
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.85rem', color: '#666' }}>
        <span style={{ fontWeight: step === 1 ? 'bold' : 'normal', color: step === 1 ? '#007bff' : '#666' }}>1. Contact</span>
        <span style={{ fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? '#007bff' : '#666' }}>2. Plan</span>
        <span style={{ fontWeight: step === 3 ? 'bold' : 'normal', color: step === 3 ? '#007bff' : '#666' }}>3. Confirm</span>
      </div>
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
    </>
  );
}
