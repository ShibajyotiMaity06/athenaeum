# Context API - Hard Interview Questions

## Theory Questions & Answers

### Q1: Trace the fiber-level mechanics of a context value change end to end.
* Provider fiber stores context on its `memoizedState`/dependencies registry; consumers attach `dependencies` first-class lists pointing at context items.
* On update, React sets `fiber.flags` (PropagationNeeded-style) and walks from provider downward marking consumer fibers with an update lane — it does NOT scan the whole tree; cost is proportional to subscribers below the provider.
* During render, consumers read `_currentValue` via the pushed stack; nested providers shadow by push/pop ordering.
* Bailouts: memoized children WITHOUT dependency links are skipped entirely — the memo exception applies only to fibers that consume the changed context.
Depth signal: mention `propagateContextChange`-era vs modern dependent-list traversal evolution.

---

### Q2: Why can a bailed-out (memoized) subtree still re-render on context change, at what granularity, and how do you engineer around it?
* Because dependency invalidation bypasses props-equality bailouts: any fiber whose dependencies include the changed context re-renders even inside memo/PureComponent boundaries.
* Granularity: per-fiber consumption — a component calling useContext once subscribes to the WHOLE provided value.
Engineering responses:
1. Narrow value shape (split contexts).
2. Bridge pattern: single tiny consumer passes primitives into memoized subtree.
3. Move hot values out of React state into external store + selective subscriptions (useSyncExternalStore), keeping context only for low-frequency config.
Quantify with Profiler before/after — reviewers want measured blast radii.

---

### Q3: Design a "cascading theme" system (nested overrides) using contexts — semantics and pitfalls.
Semantics: Provider reads parent theme via useContext, shallow-merges prop override, provides merged result:
```tsx
function ThemeProvider({theme: override, children}) {
  const inherited = useContext(ThemeCtx);
  const value = useMemo(() => ({...inherited, ...override}), [inherited, override]);
  ...
}
```
Pitfalls:
* Identity churn cascades when parent object changes — merge must be memoized on stable inputs; token-level splitting (colors vs spacing) limits radius.
* Circular import of defaults — hoist to tokens module.
* SSR streaming order with nested providers resolving different locales.
Reference implementations: Radix Themes / MUI cascade behaviors — cite their merge strategies.

---

### Q4: Implement selector-granular consumption ON TOP of Context (bridge engineering).
Idea: keep one source of truth OUTSIDE react (plain store); context carries only the store handle + version counter; a hook uses useSyncExternalStore against that store for slices:
```tsx
const StoreCtx = createContext<Store>(null!);
export function useSelector<T>(sel:(s:S)=>T):T {
  const store = useContext(StoreCtx);
  return useSyncExternalStore(store.subscribe, () => sel(store.get()), () => sel(store.initial));
}
```
Why this wins: context updates ONLY when identity of store changes (never), so context-driven invalidation disappears; slice precision comes from external subscription machinery with built-in tearing protection.
This hybrid is exactly how Zustand-context adapters work — explaining it proves systems fluency.

---

### Q5: What tearing means for context consumers under concurrent rendering, and which APIs are tear-safe?
* Tearing: within one committed tree, two reads observe different versions of the same logical value because renders interleave with external mutations mid-flight.
* Plain context backed by owner useState is TEAR-SAFE — React serializes updates through its own scheduler/lane model.
* DANGER arises bridging EXTERNAL mutable sources through context: passing `store.getState()` as provider value during transitions can capture mixed epochs.
Tear-safe bridge rules: freeze snapshot per render pass, subscribe via useSyncExternalStore (its consistency check restarts inconsistent renders), never mutate snapshots in place.

---

### Q6: How do you architect request-scoped context in SSR streaming without cross-request leakage?
Requirements: per-request identity (user/locale/flags) available deep in client islands AND server components without module globals.
Pattern:
* Server layout resolves session per request → passes serialized value as PROPS into a `'use client'` RootProviders component.
* That client component constructs fresh instances (useRef-lazy factories) per tree — no module singleton touched during server pass.
* Streaming caveat: suspended segments hydrate later; provider value must be stable across the whole stream (freeze after shell flush) or gate divergent reads until mounted.
Anti-pattern callout: Pages-router era "prime global store in getServerSideProps" — the canonical leak story.

---

### Q7: Detail the cost model: when does a context update become O(consumers × workPerConsumer) prohibitive?
Costs compose:
* Propagation walk O(subscribers below provider).
* Per-consumer re-render work (their subtrees!) — the dominant term.
* Selector-less value objects force full child reconciliation.
Thresholds heuristics: >~50 active consumers OR any consumer rendering >1ms → redesign pressure.
Mitigations ranked by ROI: deepen provider placement; split by frequency; bridge+memo heavy subtrees; migrate hot domain to subscription store. Provide measurement recipe: React Profiler commits listing duration×count per provider interaction — bring numbers to design reviews.

---

### Q8: How do you implement context-aware code-splitting without provider pyramids breaking lazy chunks?
Problem: lazy feature imports its own Provider expecting ancestors; nesting across chunks creates waterfalls and duplicate defaults.
Patterns:
1. **Composition injection**: parent route renders `<Feature.Providers><Outlet/></Feature.Providers>` — explicit, chunk-aligned.
2. **Context registry**: app exposes `provide(key, factory)` map; features register requirements declaratively; root composes resolved set once (dependency-sorted).
3. Default-value independence: every consumer tolerates absence (optional contexts) so partial trees render standalone.
Discuss trade-offs: registries centralize but hide wiring; explicit composition verbose yet greppable. Choose per org scale.

---

### Q9: What does "context as service locator" anti-pattern look like and how do you refactor it?
Smell: dozens of unrelated services fetched via `useServices().db/api/logger/analytics` mega-context; consumers reach anything, coupling explodes; tests scaffold the world.
Refactor:
* Split into capability contexts consumed narrowly (`useAnalytics()`) — interface segregation applied to React.
* Replace data-access-through-context with typed clients imported directly where no React lifecycle is needed (pure modules), reserving context for genuinely reactive bindings.
* Enforce via lint: ban property access beyond declared capability.
Frame: contexts should model REACTIVE ENVIRONMENT, not a service container.

---

### Q10: Explain double-invoke/purity interactions: what context-provider bugs only StrictMode surfaces?
StrictMode double-renders provider components and remounts effects, exposing:
* Impure value computation (Date.now/random ids in value construction) causing hydration mismatches downstream.
* Missing cleanup in bootstrap effects (double fetches, leaked sockets).
* Reducer impurity — replayed dispatches diverge.
* Ref-lazy-init patterns writing during render (must be idempotent guard style).
Production-only concurrency then amplifies leftovers. Policy stance: treat StrictMode failures as release blockers; encode purity rules in lint (no forbidden identifiers inside provider bodies).

### Q11: How do you version and migrate context value contracts across a large app without breaking consumers?
Contract evolution plan:
* Value objects carry `schemaVersion`; hook wrapper branches behavior per version during transition windows.
* Additive-first policy: new fields optional; removals gated behind telemetry showing zero readers (instrument via dev-only access proxies in staging).
* Dual-provide window: old+new contexts both supplied; adapter hooks read new-then-fallback-old.
* Codemods paired with deprecation console warnings listing migration path.
Contrast with prop APIs: context changes are INVISIBLE at call sites — this invisibility is exactly why instrumentation + staged dual-provision matter more than for props.

---

### Q12: Design an error/isolation strategy so one provider's failure doesn't blank the app.
Layered defense:
1. Error boundaries per provider segment: theme failing shouldn't kill auth tree — wrap each domain provider subtree in its own boundary rendering degraded fallback (defaults).
2. Bootstrap isolation: parallel bootstraps settle independently; provider exposes partial readiness flags instead of all-or-nothing splash.
3. Fallback defaults baked into hooks (readers never receive undefined post-guard).
4. Telemetry tags distinguishing boundary-caught vs global errors.
Interview framing: providers are dependency-injection roots — DI systems always design partial-failure modes; React should too.

---

### Q13: What are the trade-offs of exposing dispatch vs semantic action functions through context?
Raw dispatch (`dispatch({type:'x'})`):
* Fewer allocations, single stable identity, flexible.
* Costs: action shapes leak to UI layer, string typos runtime-only, harder tree-shaking of unused logic.
Semantic functions (`{signIn, signOut}` memoized):
* Typed call sites, intent-revealing, prune-able.
* Cost: identity maintenance discipline (useMemo/useCallback or module-level factories), more surface in DevTools.
Verdict pattern: internal reducer actions stay raw; PUBLIC contract is semantic verbs built once. Teams that mix both without convention produce drift.

---

### Q14: How would you implement cross-tab synchronization for a context-backed preference store?
Design:
* Source remains provider state; writes broadcast via BroadcastChannel('prefs') with tabId stamps.
* Receiver effect merges remote ops (LWW per field timestamp) into local reducer via dedicated 'remotePatch' action flagged non-broadcast to stop echo loops.
* Storage-event fallback for browsers/channels blocked by policy; initial hydration prefers newest persisted envelope across tabs (compare savedAt).
Edge craft: throttling high-frequency sliders before broadcast; visibilitychange resync on focus; conflict UX only where LWW insufficient (rare for prefs).
This question tests event-system hygiene more than context knowledge — answer accordingly.

---

### Q15: Walk through profiling methodology isolating context costs from other re-render sources.
Protocol:
1. Baseline commit census: React Profiler scripted interactions; record commits/sec + durations per component family.
2. Attribute source: enable "record why each component rendered" (Profiler) — classify entries: props / parent / hooks(useContext) / store subscription.
3. Isolate: stub the suspect provider value to a constant (dev toggle) — rerun; delta isolates context contribution exactly.
4. Attribute granularity: within context, binary-search by splitting provided object halves into two providers temporarily.
5. Verify fixes with same scripts; lock budgets into CI perf job.
The stub-and-delta trick is what separates practitioners from theory reciters here.

---

### Q16: When should a "context" actually be implemented as URL state or server cache instead?
Misplacement symptoms:
* Filters/sort/tab values living in context while users expect deep-links/back-button → move to searchParams; context holds only derived parsed views.
* Data mirroring API responses duplicated into context alongside query caches → delete; subscribe query selectors instead; context retains ONLY client-authored deltas (selections/drafts).
Decision test articulated: "Would refresh losing it harm? Does server own truth?" If answers are no/yes respectively → not context's job. Staff-level reviews routinely delete half of proposed contexts using these two questions alone.

---

### Q17: How do you handle context-dependent lazy feature loading where the feature needs provider data BEFORE its chunk resolves?
Waterfall problem: chunk loads → discovers it needs locale/user → fetches/awaits → renders (double hop).
Solutions:
* Pre-resolve dependencies at route level; pass as PROPS into lazy component wrapper (data ready before import()).
* Expose synchronous snapshot from already-bootstrapped providers (bootstrap-before-render architecture) so chunk's first render has everything — preferred when bootstrap exists anyway.
* Suspense-integrated resource the chunk throws during render — acceptable if boundaries scoped per feature.
Rule: never let a lazily imported leaf be the FIRST place a required global is awaited.

---

### Q18: Explain how you'd build a composable "providers" DSL for an app shell (ordering, dependencies, overrides).
Requirements: declarative list `[Auth, Theme(i18n), Flags]` auto-nested; dependency ordering (Flags needs User); override injection for tests/storybook.
Implementation sketch:
```tsx
function ComposeProviders({layers, children}) {
  return layers.reduceRight((acc, L) => <L ctx={acc}>{acc}</L>, children);
}
```
Enhancements: layers declare `deps: symbol[]`; topological sort validates cycles at startup; each layer may expose `extend(prevValue)` merge like cascade themes.
Trade-offs: magic vs explicitness — mitigate by generating a visible tree dump in devtools/storybook page. Reference: Expo/Next ecosystem provider-composer utilities.

---

### Q19: What subtle bugs come from context + React 18 automatic batching, and how do you debug them?
Scenarios:
* Multiple setState calls feeding ONE provider value inside async handler batch to single commit — intermediate-state assumptions (progressive wizard steps rendered sequentially) break silently.
* Promise-chained updates spanning macrotasks unbatch pre-18-style, producing flickers absent in event handlers — inconsistent symptom reports.
* flushSync escapes used to force ordering interact badly with transition-marked consumer updates (priority inversion warnings).
Debug approach: instrument reducer/action log with timestamps + commit ids from Profiler; reproduce under both batching regimes by toggling createRoot vs legacy render in a sandbox. Understanding lane semantics turns heisenbugs into deterministic cases.

---

### Q20: Close out: define the long-term GOVERNANCE of contexts in a scaling org.
Governance artifacts:
* Registry document per context: owner team, change-frequency class, consumer count SLA, exit-strategy note (when to graduate to store).
* Creation gate: PR template section justifying why props/store/URL were rejected (decision-tree reference).
* Deprecation protocol: dual-provision + telemetry + codemod timeline (mirrors API deprecation practice).
* Quarterly audit: Profiler-driven blast-radius report per provider; hot ones get split/migration tickets automatically.
Closing thesis for interviews: contexts are public infrastructure — treating them with API-design rigor (versioning, telemetry, sunsets) is what distinguishes staff-level ownership from ad-hoc plumbing.


