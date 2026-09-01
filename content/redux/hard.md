# Redux - Hard Interview Questions

## Theory Questions & Answers

### Q1: How does the Redux store dispatch pipeline actually execute internally?
* `configureStore` composes middleware via `compose(...middlewares)(store.dispatch)` producing an **enhanced dispatcher**; each layer wraps the next, so calling enhanced dispatch enters middleware[0] first.
* The store keeps `currentReducer`, `currentState`; a boolean `isDispatching` guards re-entrancy - dispatching DURING a reducer throws ("Reducers may not dispatch actions"), preventing cascading corruption.
* After reducer returns, listeners array is snapshotted and iterated - subscribers added/removed during notification are handled safely for the current pass but affect future ones.
* State reference changes even when reducers return identical slices? No - combineReducers preserves identical slice references; root ref changes only if any slice changed (cheap bailout preserved).

---

### Q2: What guarantees does react-redux's useSyncExternalStore-based subscription provide, and what tearing means here?
* Modern react-redux subscribes via `useSyncExternalStore` with a memoized selector wrapper (`useSelectorWithStore` pattern): getSnapshot = latest selector result cached per subscription.
* **Tearing**: in concurrent rendering two components could read different store snapshots within one committed tree. useSyncExternalStore's consistency check forces re-render when snapshot mutates mid-render, closing the tear - provided your selector is pure & stable.
* Store authors must notify AFTER commit-friendly timing? Not required - notifications during render trigger the check path. But mutating state objects in place breaks snapshot identity assumptions entirely (never mutate).
* Interview depth: contrast with pre-18 `store.subscribe + setState` approach which could tear under transitions.

---

### Q3: Explain Immer proxy mechanics and where they break down.
* Produce walks your draft mutations through ES2015 Proxy traps (`set/get/deleteProperty`), recording a patch list; finalize copies ONLY touched paths (copy-on-write at object granularity).
* Breakage cases interviewers probe:
  * Reading then relying on prototype methods of class instances stored in state (draft loses constructor unless tagged).
  * Async gaps: keeping a draft beyond the producer scope → revoked proxy errors.
  * Map/Set require plugins; Symbol-keyed fields ignored; extremely large arrays pay trap overhead.
  * Structural sharing guarantee holds only if you never escape-references drafts into results.
Patches emitted alongside enable inverse-patch undo systems.

---

### Q4: Design an undo/redo system on top of Redux - what do you track?
Two viable architectures:
1. **Snapshot stack**: wrap reducer to push `{past:[...], present, future:[]}` per tracked action whitelist; memory heavy but simple; partialize via key filtering to bound size.
2. **Patch-based**: capture Immer forward+inverse patches per action; apply inverses for undo, forwards for redo - orders of magnitude smaller for big normalized graphs.
Hard parts to articulate: grouping rapid actions into logical steps (debounce windows / transaction markers), cross-slice atomicity (single history entry spanning slices via root wrapper), excluding volatile keys, and coalescing server reconciliations so network truth doesn't create undo steps.

---

### Q5: How would you implement a distributed-safe optimistic mutation engine in Redux?
Components:
* `pendingMutations: { [entityId]: Queue<Op> }` persisted slice; ops carry clientToken, baseRev.
* Reducer applies op optimistically AND bumps local rev; selector layer merges server cache beneath pending overlays.
* On fulfillment: replace overlay with canonical entity (rev from server); conflicts (server rev > baseRev) route to rebase strategy: field-level merge where user-touched fields win, else surface resolution UI.
* Refetch reconciliation must reapply pending overlays post-merge - implement as a single `reconcileEntity` helper ALL cache writes funnel through.
Failure edges: abandoned tokens GC'd by TTL sweeper; double-submit prevented by token uniqueness per logical intent.

---

### Q6: What subtle bugs emerge from combineReducer + shared action handling?
* Every sub-reducer receives every action: an action meant for cart also flows into user reducer - accidental default-case mutations or forgotten returns cause cross-slice corruption.
* Slice identity preservation: returning undefined instead of prior state throws; returning NEW object unconditionally defeats bailouts globally.
* Key renames silently orphan state (persisted JSON under old key ignored).
* Root-shape migrations need explicit versioned upgrade reducers.
Defense: strict lint banning non-default-case fallthroughs, integration tests asserting unrelated slices' references survive representative action storms.

---

### Q7: How does RTK Query manage its cache lifecycle internally?
* Endpoints compile to slice entries keyed by serialized args (`getPosts({"page":1})`); a reference-counted subscription registry tracks mounted hooks per cache key.
* Unsubscribe starts TTL countdown (`keepUnusedDataFor`, default 60s); re-subscribe cancels removal.
* Tag graph: queries register provided tags; mutations declare invalidated tags → affected query entries marked stale and refetched IF actively subscribed, otherwise purged lazily.
* Deduplication: concurrent identical queries share one request promise; `selectFromResult` lets components subscribe to projections without extra fetches.
Interview probe: explain why invalidation of unsubscribed queries doesn't fire network calls immediately.

---

### Q8: Compare Redux-Saga effects vs async/await thunks for complex cancellation flows.
Saga strengths: declarative cancellation trees (`takeLatest/takeEvery`, race, fork/cancel semantics), testable generator step assertions without mocks, channels buffering external events.
Thunk strengths: native TS inference, no DSL, trivial debugging stack traces, smaller bundle.
Complex flow litmus: "pause A until event E, then race B/C with cleanup" - saga expresses in 6 lines; thunk needs AbortController plumbing + manual flags.
Modern stance: sagas earn complexity only for long-lived orchestration (background sync daemons, multi-step wizards with server coordination); otherwise listener middleware + thunks cover it.

---

### Q9: What does structural sharing mean and how do you verify it survives your updates?
* Definition: unchanged subtrees keep IDENTICAL references after update, letting memoized selectors/subtrees skip work.
* Threats: manual spreads that clone too much (`{...state}` at root for a leaf change), library deep-clones, Immer misuse escaping drafts.
* Verification techniques:
  1. Unit assert `result.users === prev.users` for targeted-change tests.
  2. Dev-mode freeze + reference-diff tooling (redux-freeze / custom subscriber logging changed paths count).
  3. Perf CI: render-count probes on representative stores.
Broken sharing converts your memoization strategy into dead weight.

---

### Q10: How would you migrate a legacy constants/reducers codebase to RTK incrementally?
Strangler sequence:
1. Add RTK store alongside legacy via `configureStore({reducer: {...legacyReducers}})` - legacy plain reducers run fine inside.
2. Convert one feature per PR: replace its constants/actions/reducer trio with createSlice; keep exported creator signatures IDENTICAL so consumers untouched (adapter module if needed).
3. Swap applyMiddleware chains: custom middlewares ported via `getDefaultMiddleware().concat`.
4. Migrate async modules to createAsyncThunk preserving action type strings (`actionPrefix/TYPE`) to keep existing extraReducers compatible.
Rollback safety: feature flags per converted domain; contract tests pinning dispatched type strings across boundary.

### Q11: Detail the memory/performance cost model of storing large normalized collections in Redux.
* Costs: entity maps grow resident (heap), every action triggers selector runs across subscribers (CPU O(subscribers × selector)), Immer draft proxies add allocation churn proportional to touched paths.
* Mitigations ladder:
  * Virtualize consumers so selectors only run for mounted windows.
  * Shard slices by domain AND temperature (hot session data vs cold reference tables) so notifications narrow.
  * Move append-only logs to ring-buffer slices with hard caps.
  * Offload truly large read-mostly datasets to worker threads, posting projections into redux.
Quantify in interviews: "10k entities × ~200B ≈ 2MB heap - fine; but 60fps tick actions through 200 subscribers is the real killer."

---

### Q12: How do you make Redux devtools useful at scale rather than noise?
* Action naming discipline: RTK auto-names from slice+reducer; wrap bulk imports with `pause()/resume(label)` collapsing hundreds of entries.
* `actionSanitizer`/`stateSanitizer`: strip payloads (tokens, PII), truncate huge arrays before they hit the extension store.
* Trace option (`trace: true`, `traceLimit`) records stack of dispatch origin - the killer feature for "who fired this?" hunts.
* Multiple stores: distinct connection names; per-environment enablement (dev only, or behind flag with redaction for staging).
Anti-goal: recording production timelines - ship sampled telemetry instead.

---

### Q13: What security concerns apply to Redux state and DevTools in production?
* State mirrors everything the UI knows: tokens/PII stored plainly are readable via extensions on a user's own machine (acceptable risk boundary) BUT also leak through crash reporters capturing state snapshots - sanitize at reporter layer.
* Never trust client state as authorization: reducers/flags are UX hints; server revalidates every request.
* Persisted slices must exclude credentials; if unavoidable, encrypted-at-rest adapters + documented threat boundary (XSS defeats them anyway - keep creds in HttpOnly cookies).
* DevTools disabled in prod builds (`devTools: false`) reduces surface + bundle; action whitelisting if diagnostics demand partial recording.

---

### Q14: Explain how you'd implement fine-grained change subscriptions without leaving Redux idioms.
Ladder:
1. Narrow selectors + memoization (default answer).
2. `createSelector` with input hashing for value-based keys (sorted id joins) enabling semantic equality cheaply.
3. Split stores per high-frequency domain (pointer/ticker) while keeping main app store - cross-store bridges via listener middleware.
4. Transient subscription escape hatch: direct `store.subscribe` inside effects for canvas/media sync where React renders are unwanted entirely.
Frame as observation-economics: reduce WHO recomputes per event, not just what changed.

---

### Q15: How do you handle long-running background sync (websocket → redux) robustly?
Architecture:
* Connection manager OUTSIDE react lifecycle owns socket/reconnect/backoff; emits plain events.
* Bridge layer translates events → typed actions with sequence numbers; reducer discards stale/duplicate seqs (idempotency guard).
* Backpressure: coalesce burst events (ticker prices) via rAF-aligned flush middleware rather than per-message dispatch storms.
* Resync protocol: seq-gap detection triggers snapshot refetch action replacing affected slice atomically (single transition, no intermediate tear states).
* Shutdown hygiene: flush pending queue, cancel in-flight thunks via abort signals on teardown.
Failure story ready: duplicate reconnect double-dispatch caught by seq guard - why naive bridges corrupt ledgers.

---

### Q16: What invariants let you safely persist and rehydrate Redux state across versions?
* Version envelope per persisted slice: `{v:3,data}`; migrations walk-forward pure functions unit-tested against captured payloads.
* Whitelist persistence via partialize - volatile fields (loading, sockets, timestamps-as-state) never stored.
* Rehydrate merge policy: persisted merges OVER defaults shallowly; unknown keys dropped defensively against tampered blobs.
* Cross-device semantics: last-write-wins acceptable for prefs; version-vector or server-authoritative for shared entities.
* Never persist function-bearing or class-instance state (serialization silently strips prototypes - runtime TypeErrors later).

---

### Q17: How do you profile and prove the source of excessive redux-driven renders?
Workflow:
1. React Profiler commit flamegraph → identify over-rendering components.
2. "Why rendered" props diff - trace unstable prop to its selector.
3. Selector instrumentation wrapper (dev): count invocations + result-identity changes per action type; hot list exposes unmemoized derivations.
4. Action storm histogram: middleware sampling dispatch frequency by type - pointer-move style floods surfaced instantly.
5. Fix ladder applied per offender (narrow → memoize → split slice → transient escape).
Close with regression gate: CI perf probe asserting render budgets on scripted interaction scripts - numbers, not vibes.

---

### Q18: When would you argue AGAINST Redux in a staff-level design review?
Concrete disqualifiers:
* State inventory shows >70% server-cache shapes → query library alone suffices; redux adds ceremony without ownership wins.
* Team <5 engineers, single-repo CRUD scope → Context + hooks + query lib ships faster with fewer concepts.
* Realtime/fine-grained update meshes dominating → signal-graph libraries out-execute notification-broadcast models; benchmark before committing.
Reversibility framing: propose facade seam (hooks exporting store access) so swap cost stays bounded regardless. Staff signal = arguing from measured workload characteristics, not framework loyalty either direction.

---

### Q19: How does server-component/RSC architecture reshape Redux's role going forward?
* Server components absorb data-fetching state entirely - much former redux content (fetched entities) never touches client JS.
* Client islands still need coordination: selections, optimistic overlays, wizards - exactly redux's remaining jurisdiction, now smaller and more clearly bounded.
* Server Actions replace many mutation thunks; redux keeps receiving their results as plain success actions for UI projection updates.
Strategic framing for interviews: redux shrinks from "app backbone" to "client-interactivity kernel" - teams should audit slices annually and delete server-shaped ones; the library's future is deliberate smallness, not expansion.

---

### Q20: Walk through designing a NEW large-scale app's state architecture end-to-end.
Answer spine (adapt specifics):
1. **Inventory**: classify candidate state → server-cache / URL / client-session / component-local / realtime-stream.
2. **Assign owners**: TanStack Query or RTK Query for server cache; router for URL; slim redux (RTK) for client-session + orchestration events; useState locally; dedicated store for realtime mesh if volumes demand.
3. **Contracts**: typed hooks exported per feature folder; lint bans raw useDispatch; selector colocation rules; persistence whitelist registry.
4. **Ops**: devtools sanitizers, perf CI render budgets, annual slice audits deleting server-shaped leftovers.
5. **Exit seams**: facade modules so any owner can migrate without touching consumers.
Deliverable framing beats tool choice - reviewers grade the decision tree and reversal costs.


