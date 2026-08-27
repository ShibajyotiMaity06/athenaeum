# Context API - Medium Interview Questions

## Theory Questions & Answers

### Q1: How does useContext subscription actually work internally?
* Each context object holds a registry of consumers; Providers register themselves on a global stack during render (`_currentValue` push/pop).
* On change, React marks fibers with `dependencies` pointing at changed contexts and walks consumers from that provider down — propagation cost scales with consumer count below the provider, not tree size.
* Consumers read via stack discipline: nearest provider wins.
Implication: placing providers HIGH multiplies traversal; colocate providers as deep as their audience allows.

---

### Q2: Why doesn't memo() protect children from context updates — and what patterns isolate them?
* memo compares PROPS only; useContext reads bypass props entirely, forcing re-render on value identity change.
Isolation patterns:
1. Narrow consumption: move `useContext` into small bridge components that pass plain props into memoized heavy children.
2. Split read/write contexts so action-only components never subscribe to state changes.
3. Multiple domain contexts sized by change frequency.
Rule to state plainly: render isolation from context comes ONLY from subscription narrowing.

---

### Q3: Design the split-context Provider for an auth domain end-to-end.
```tsx
const AuthStateCtx = createContext<AuthState|null>(null);
const AuthDispatchCtx = createContext<AuthDispatch|null>(null);

function AuthProvider({children}) {
  const [state, dispatch] = useReducer(authReducer, null, initFromStorage);
  const dispatchStable = useMemo(() => ({
    signIn: u => dispatch({type:'signIn', user:u}),
    signOut: () => dispatch({type:'signOut'}),
  }), []);
  return (
    <AuthStateCtx.Provider value={state}>
      <AuthDispatchCtx.Provider value={dispatchStable}>{children}</AuthDispatchCtx.Provider>
    </AuthStateCtx.Provider>
  );
}
```
Points to narrate: stable actions object avoids new identities; state changes re-render only State consumers; persistence handled in effects keyed off state transitions.

---

### Q4: What is the "render-prop alternative" and when does it beat useContext?
Render props expose values as ARGUMENTS: `<Auth>{({user}) => ...}</Auth>` — explicit dataflow per usage site.
Beats hooks when:
* You need MULTIPLE instances of the same logic simultaneously (two independent draft editors) — hooks bind one instance per position in tree.
* TypeScript generics flow naturally per-usage.
Costs: nesting pyramids, no mid-component access without restructuring.
Modern verdict: default to hooks+context; reach for render props where instance multiplicity matters (virtualizers, drag contexts exposing slots).

---

### Q5: How do you implement context that lazily initializes expensive values?
```jsx
const [value] = useState(() => buildExpensiveTheme());
```
Lazy initializer runs once per provider mount — not every render.
For async bootstrap:
1. Synchronous placeholder + effect upgrade (flash risk).
2. Suspense-integrated resource throwing promise (needs boundary).
3. Gate rendering: provider computes readiness flag; renders splash until ready — simplest robust SSR-friendly choice.
Never compute heavy objects inline in `value={}` — recreates per render even if discarded.

---

### Q6: Explain context + useReducer persistence/rehydration patterns.
* Persist via effect subscriber inside Provider: `useEffect(() => localStorage.set(key,state), [state])` throttled.
* Rehydrate BEFORE first paint to avoid flash: synchronous seed in lazy initializer (`useReducer(reducer, load())`) guarded by try/catch + schema version check.
* SSR caution: guard storage behind `typeof window`; server renders defaults while client seeds — hydration parity requires deterministic defaults or serialized injection.
* Versioned envelopes: `{v:2,data}` with migrate chain — stale-shape crashes otherwise appear weeks later on forgotten devices.

---

### Q7: How would you debug "everything re-renders" caused by a context?
Workflow:
1. React Profiler record interaction → identify commit waves originating at provider.
2. Confirm culprit: temporarily log provider parent's render reasons (unrelated state ticking? inline object?).
3. Inspect provided value creation site — inline literal vs memoized.
4. Map consumers: DevTools "highlight updates" shows blast radius.
5. Apply fixes ladder: memoize value → split contexts → deepen provider placement → migrate hot slice to store.
Close loop with before/after commit counts — interviewers want methodology plus numbers habit.

---

### Q8: Compare Context+useReducer vs Zustand for a growing app — migration seam design.
Context strengths: zero deps, colocated reducer purity, fine for low-frequency globals.
Zustand wins as: slices multiply, selector granularity needed, persistence/devtools desired, non-React modules need access.
Seam design making swap cheap:
* Export ONE custom hook per domain (`useCart()`, `useCartActions()`).
* Internals free to switch from Context pair to zustand store without touching any consumer import.
Migration becomes mechanical per-domain PRs — this reversibility argument is the senior differentiator.

---

### Q9: What are forwardRef + context interplay considerations in reusable component libraries?
Library components consuming YOUR theme/context internally still need refs forwarded to DOM: wrap with `forwardRef`, merge external ref onto root node while internal logic uses its own refs.
Also: library providers must be composable — accept `theme` prop merging with inherited context (read parent via useContext inside provider, shallow-merge) enabling cascade semantics like CSS.
Pitfall: defaulting to module-level constants breaks nested overrides — always seed from current context first. Mention Radix/Headless UI as reference implementations of these disciplines.

---

### Q10: How do you handle context in SSR frameworks safely?
Dangers: module-level singletons shared across requests leak user data; provider trees are per-request but module caches aren't.
Safe patterns:
1. Create value/state INSIDE the request's tree (per-request factory called in layout) rather than module scope.
2. Seed from server payload via props — never let server render READ client stores/globals.
3. Hydration parity: deterministic defaults until post-mount effects mutate.
Next.js specifics: 'use client' providers wrapping server-passed children; document why getServerSide-era "prime store" hacks were removed.

### Q11: How do you implement a strongly-typed generic context factory?
```tsx
function createContextHook<T>() {
  const Ctx = createContext<T | undefined>(undefined);
  function useCtx(): T {
    const v = useContext(Ctx);
    if (v === undefined) throw new Error('Provider missing');
    return v;
  }
  return { Provider: Ctx.Provider, useCtx };
}
// usage
const Auth = createContextHook<AuthValue>();
<Auth.Provider value={...}> ... const auth = Auth.useCtx();
```
Wins: eliminates per-domain boilerplate, enforces null-guard uniformly, keeps provider/consumer pairs discoverable via single symbol.
Caveat: naming in DevTools suffers unless you set `Ctx.displayName` — set it inside the factory.

---

### Q12: What are the semantics of context updates during transitions/startTransition?
* Updates wrapped in startTransition mark consumer re-renders non-urgent — typing stays responsive while a heavy theme/filter propagation renders at low priority, interruptible.
* Caveats to articulate:
  * The PROVIDER parent's own state update still commits urgently; only downstream consumer work is deferred.
  * Mixed urgent+transition updates to same context resolve by lane priority; consumers may render twice.
* Practical guidance: pair transition-wrapping with narrowed contexts so deferred work is actually bounded.

---

### Q13: How do you prevent context value staleness inside callbacks (timers, sockets)?
Problem: handlers capture the render-time value; long-lived listeners see fossils.
Options ladder:
1. Ref mirror: keep `valueRef.current = value` each render; handlers read ref.
2. Include value in effect deps and RE-SUBSCRIBE on change (correct but reconnect cost).
3. Move subscription into provider with dispatch-only exposure — internal logic always reads fresh state via reducer closure.
4. For external stores behind context bridges: getState() at invocation time.
Interview litmus: websocket handler needing latest token — which option and why? (#1 or #3.)

---

### Q14: Describe implementing i18n through context with performance discipline.
Architecture:
* Locale state + message catalog loaded per locale (dynamic import) held in I18nProvider; value = `{t, locale}` memoized on [locale, messages].
* t() stable per locale; components consume via useT() hook.
Performance notes: catalogs code-split so switching locales streams chunks; formatting via Intl bound to locale computed once; avoid inline object provision; pluralization through ICU rather than ternaries.
SSR/hydration: server picks locale from cookie/header and passes as prop ensuring parity; document flash-avoidance strategy (inline script pre-hydration if needed).

---

### Q15: What testing strategies verify provider wiring across an app?
Beyond unit tests:
* **Composition test**: mount full AppProviders with stubbed bootstraps asserting no missing-provider errors and expected defaults.
* **Contract tests per hook**: renderHook verifying guard throws outside provider, values memoized identities stable across unrelated renders.
* **Storybook decorators** double as living documentation of required providers per component family.
* Lint rule banning raw `createContext` outside designated folder pushes all contexts through the factory (uniform guards/displayName).
Goal: provider miswiring becomes CI failure, not staging mystery.

---

### Q16: When do multiple small contexts become WORSE than one larger one?
Over-splitting costs:
* Provider pyramid depth grows (nesting hell) hurting readability and DevTools trees.
* Consumers subscribing to several related slices lose atomic consistency — reading user AND permissions from two contexts can observe mid-update skew within one commit.
* Boilerplate multiplies for marginal gains.
Balance rule: split by CHANGE FREQUENCY and OWNERSHIP boundaries, not by every noun. Related fields updated together belong together; measure blast radii before carving further.

---

### Q17: How would you implement scoped instance state (e.g., multiple independent modals' draft state) using context patterns?
Instance-scoping techniques:
1. Render-prop/children-function provider taking initial props: `<DraftProvider initial={x}>{children}</DraftProvider>` — each usage instantiates isolated reducer.
2. Keyed registry context: single provider holding Map<id,state>; consumers select their key — beware broad invalidation (pair with memoized selectors or external store).
3. Component-level useReducer colocated + passed down via local context defined INSIDE that composite (private context).
Discuss trade-offs: #1 simplest & isolated; #2 centralizes persistence but needs granularity engineering.

---

### Q18: Explain hydration mismatch pitfalls specific to context-provided UI (theme/locale).
Mismatch arises when provider value differs between server render and first client render: locale-dependent dates, theme-derived classes, feature flags resolved differently.
Mitigations:
* Serialize resolved provider values into page payload; hydrate FROM payload before rendering (parity guaranteed).
* Gate divergent bits until mounted (`const [mounted]=useMounted()`) rendering placeholders initially.
* Deterministic formatting: explicit locale args everywhere, never ambient.
Debug method: diff server HTML vs client tree attribute-by-attribute; bisect by neutralizing providers one at a time.

---

### Q19: What deprecation-era APIs (legacy context, childContextTypes) teach us about the modern design?
Legacy context (getChildContext) failed because:
* Values bypassed shouldComponentUpdate — breaking memoization silently.
* No explicit declaration on consumer side (string keys), causing collisions and untraceable coupling.
Modern redesign fixes: explicit Provider/Consumer pairing, fiber-tracked dependencies enabling bailouts EXCEPT deliberate consumer invalidation, devtools visibility.
Lesson worth stating: API ergonomics follow architectural constraints — today's identity-discipline requirements exist precisely because implicit propagation proved unmanageable at scale.

---

### Q20: Outline a review checklist for any new Context introduced in a PR.
Checklist:
* [ ] Custom hook wrapper with undefined-guard + displayName.
* [ ] Value memoized; actions/dispatch separated into second context where beneficial.
* [ ] Change-frequency documented; consumers audited for breadth (Profiler screenshot attached when hot).
* [ ] SSR-safe: no module singleton reads; deterministic defaults; storage guarded.
* [ ] Tests: hook guard test + provider composition story/decorator.
* [ ] Exit-seam note: how this domain migrates to external store if it outgrows context.
Turning conventions into checklist items is what makes architecture survive team growth.


