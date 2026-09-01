# Context API - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is the Context API and what problem does it solve?
* React's built-in mechanism for passing data through the component tree without threading props through every intermediate layer ("prop drilling").
* A Provider supplies a value; any descendant consumer reads it regardless of depth.
* Solves: theming, locale, authenticated-user identity, feature flags - low-frequency globals needed by distant leaves.
* Not a state manager by itself: it distributes values; change logic still lives in useState/useReducer above it.

---

### Q2: How do you create and consume a context?
```jsx
const ThemeContext = createContext('light');          // default value
<ThemeContext.Provider value="dark">
  <Toolbar />                                          // reads 'dark'
</ThemeContext.Provider>
```
Consumer (modern):
```jsx
const theme = useContext(ThemeContext);
```
Legacy `<ThemeContext.Consumer>{v => ...}</ThemeContext.Consumer>` still exists but hooks replaced it.
The **default value** only applies when NO provider exists above - useful for testing and optional contexts.

---

### Q3: When should you reach for Context versus props?
* Props: data consumed by few, nearby components; explicitness aids tracing.
* Context: same value needed by MANY distant components; identity-style data (theme/user/locale) changing rarely.
Litmus tests:
1. Would drilling pass through ≥3 unrelated layers? → consider context.
2. Does the value change on every keystroke? → probably belongs local or in an external store instead.
Overusing context for everything recreates hidden global coupling - the problem libraries like Redux were born from.

---

### Q4: What causes unnecessary re-renders with Context and how do you mitigate?
* Every consumer re-renders whenever the Provider's `value` changes - reference changes matter, not deep content.
* Typical footgun: `value={{user, setUser}}` inline object → new identity every render of provider parent → ALL consumers re-render constantly.
Mitigations:
1. `useMemo` the provided object.
2. Split contexts by change frequency (stable auth vs hot filters).
3. Push state down to the smallest common subtree.
4. For high-frequency shared state, graduate to external stores with selector subscriptions.

---

### Q5: What is the recommended pattern of splitting contexts?
* Separate READ context from UPDATE (dispatch) context:
```jsx
<UserCtx.Provider value={state}>
 <UserDispatchCtx.Provider value={dispatch}>...
```
Components needing only actions subscribe to a stable dispatch and skip re-renders caused by state changes.
* Also split by domain (ThemeCtx/AuthCtx) rather than one mega-context - narrower blast radius per change.
Interview phrasing: "context granularity is render-performance engineering."

---

### Q6: How do you combine Context with useReducer effectively?
```jsx
function Provider({children}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DispatchCtx.Provider value={dispatch}>
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}
```
* Reducer centralizes transition logic (pure, testable), context distributes it.
* Dispatch identity is stable across renders - safe to memo children against.
* This duo is the classic "mini-Redux"; scaling limits appear when many consumers read frequently-changing slices.

---

### Q7: Why does providing an inline object cause problems and how exactly do you fix it?
```jsx
// ❌ new object identity each render of App
<AuthCtx.Provider value={{ user, logout }}>
```
Every App re-render (even from unrelated state!) produces a fresh `{}` → all consumers re-render.
Fixes:
```jsx
const value = useMemo(() => ({ user, logout }), [user, logout]);
```
or split: user via one provider, logout (stable fn) via another. Also hoist constant objects outside components when static. The rule: **Provider value identity discipline** - interviewers probe this first.

---

### Q8: Can consumers update context values directly?
No. Context carries whatever the Provider passes - consumers read; only the owner component holding the state mutates it.
Update paths:
* Pass setter/dispatch THROUGH the context (downward), children call it - events flow up, data flows down.
* Or expose custom hook `useAuth()` bundling both reading and mutating APIs so consumers never touch raw context objects.
Direct mutation attempts (mutating provided object) break purity and skip re-renders - always route through owner-controlled functions.

---

### Q9: What are default values good for and what traps exist?
`createContext(defaultValue)` serves when a component renders without ANY ancestor provider:
* Testing components in isolation without scaffolding providers.
* Optional contexts where absence means "feature off".
Traps:
* Defaults are STATIC - using them as real app state hides bugs (component silently reads default because provider was misplaced higher than expected).
* Object/array defaults recreated at module level are fine (stable), but never inline defaults expecting freshness.
Consider throwing-in-hook pattern (`useContext` wrapper that errors when null) to catch missing providers loudly.

---

### Q10: How does useContext differ from prop drilling in terms of traceability?
* Prop drilling: every intermediate component visibly lists the prop - grep-able data path, but noisy signatures.
* Context: invisible transport - consumers bind to a named context anywhere below the provider.
Traceability tooling: React DevTools shows provider value; naming convention (`XyzContext`) plus custom hooks (`useXyz`) restores discoverability lost vs explicit props.
Team guidance: drill up to 2 levels freely; beyond that introduce context OR restructure composition (pass children/slots) before adding global plumbing.

### Q11: What is the "custom hook wrapping context" pattern and why adopt it?
```jsx
const AuthCtx = createContext(null);
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
```
Benefits:
* Consumers import `useAuth()` not raw context - implementation swappable (swap to external store later without touching call sites).
* Missing-provider mistakes fail loudly with a helpful message instead of silently returning null/default.
* Return shape can bundle derived values + actions, hiding reducer details.
This wrapper is the single highest-value convention for context-heavy codebases.

---

### Q12: How do you type contexts in TypeScript well?
```tsx
interface AuthValue { user: User | null; signIn(u: User): void; signOut(): void; }
const AuthCtx = createContext<AuthValue | undefined>(undefined);
```
* Prefer `| undefined` default + runtime guard in the consumer hook (forces explicit provider wiring) over fabricating dummy defaults.
* For split dispatch pattern: two typed contexts (`StateCtx`, `DispatchCtx`) with `React.Dispatch<Action>`.
* Generic helper factories (`createContextHook<T>(name)`) reduce boilerplate across many domains.
Interviewers listen for the null-guard rationale - it signals production experience.

---

### Q13: What are common real-world uses of Context beyond theming?
* **Auth/session**: current user + role helpers consumed by guards and headers.
* **i18n/locale**: message catalogs + format functions; provider keyed by locale param.
* **Feature flags**: resolved flags from server injected once at root.
* **Design tokens**: CSS-in-JS theme objects.
* **Toast/modal orchestration**: stable `notify()`/`openModal()` functions via dispatch-only context.
Common thread: low-frequency or action-style values shared broadly. High-frequency data through context is where teams get burned.

---

### Q14: How do you test components that consume context?
Three tiers:
1. **Render with real Provider**: wrap in the actual AuthProvider seeded via props/overrides - best fidelity for integration tests.
2. **Test-double provider**: `<AuthCtx.Provider value={mock}>` minimal fixture - isolates component contract.
3. **Custom render helper** (`renderWithProviders(ui, {user})`) standardizing scaffolding across suites.
Also unit-test the custom hook directly via `renderHook` to verify guard errors and derived logic. Avoid asserting internal context objects - assert rendered output.

---

### Q15: How does Context interact with memoization (memo/useMemo)?
* `memo(Child)` does NOT shield against context changes - useContext bypasses props comparison entirely; any provider value change re-renders consumers regardless of memo.
* useMemo helps on the PROVIDER side (stable value identity), not consumer side.
* To isolate hot children: move consumption deeper (only tiny leaf consumes), or restructure so expensive subtrees receive data via props from a single consuming bridge component.
Key sentence for interviews: "memo stops prop-driven renders; only subscription granularity stops context-driven ones."

---

### Q16: What is the difference between Context and a global variable module?
A module-level singleton (`export let currentUser`) shares state but:
* No reactivity - components won't re-render on change.
* Breaks SSR (shared across requests) and testing isolation.
Context adds React-integrated subscription + per-tree scoping (multiple providers possible) while staying pure-render friendly.
Conversely context isn't magic global state either - value still originates from owner state. The pair (module store + tiny context bridge) is actually a legitimate SSR-safe pattern when scoped per request.

---

### Q17: When should you graduate from Context+useReducer to an external store?
Signals:
* Multiple unrelated slices changing at different frequencies inside one value.
* Consumers needing SELECTOR granularity ("only re-render if my todo changed").
* Performance profiling shows broad re-render waves from one provider.
* Need for persistence/middleware/devtools around state logic.
Migration path is incremental: keep the same `useX()` hook API, swap internals to Zustand/redux behind it - consumers unchanged. This reversibility argument is exactly what interviewers want articulated.

---

### Q18: How do you avoid Context-based waterfalls during initial data loading?
Pattern: provider fetches core session/theme BEFORE rendering children:
```jsx
function AppProviders({children}) {
  const [boot] = useState(() => bootstrap());
  if (boot.pending) return <Splash/>;
  return <AuthCtx.Provider value={boot.auth}>{children}</AuthCtx.Provider>;
}
```
Alternatives: expose loading state via context so children render skeletons; or suspense-integrate the fetch.
Anti-patterns: each consumer independently fetching the same session (duplicate requests); effects-chains seeding context after mount causing flash-of-empty-state. Decide ONCE who owns bootstrapping.

---

### Q19: Can multiple providers of the same context coexist? What are use cases?
Yes - nearest ancestor wins for consumers below it.
Uses:
* **Theming overrides**: dark section inside light app (`<ThemeCtx.Provider value="dark">`).
* **Per-route locale** or per-widget instance state (each modal gets its own DraftCtx).
* Testing/storybook scoping.
Gotchas: accidental nested providers shadowing intended global values produce "works sometimes" bugs - lint against implicit nesting, document override semantics explicitly in the hook's JSDoc.

---

### Q20: Summarize the decision tree: props vs Context vs external store.
Ask in order:
1. Who consumes it? One/two nearby → **props**.
2. Change frequency high OR selector-granular updates needed by many? → **external store** (Zustand/redux).
3. Low-frequency identity/config needed broadly? → **Context** (+useReducer if transitions non-trivial).
4. Representable in URL? → router owns it regardless of above.
Then engineering guardrails: custom-hook wrappers everywhere, provider value identity discipline, split-by-frequency rule. Articulating this tree cleanly IS the senior answer.


