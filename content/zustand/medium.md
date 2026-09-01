# Zustand - Medium Interview Questions

## Theory Questions & Answers

### Q1: Explain how Zustand's built-in middleware system operates. How do you use `persist` and `devtools`?
**Answer:**
Zustand features a highly extensible middleware pattern. Under the hood, a middleware in Zustand is simply a **higher-order function** that wraps the store creator function, intercepts calls to `set` and `get`, and adds custom behaviors before passing execution along.

#### 1. `devtools` Middleware
* **Purpose:** Connects your Zustand store to the Redux DevTools browser extension. This allows you to inspect state history, perform time-travel debugging, and audit action dispatches visually.
* **Usage:** Wrap your store initializer inside `devtools()`.

#### 2. `persist` Middleware
* **Purpose:** Automatically serializes and synchronizes your store state to a persistent browser storage medium (e.g., `localStorage`, `sessionStorage`, or IndexedDB).
* **Usage:** Takes your store creator and an configuration options object (specifying unique storage keys, custom storage backends, or state filters).

**Syntactic Integration:**
```javascript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export const useUserStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,
        login: (userData) => set({ user: userData }),
      }),
      { name: 'user-session' } // Unique storage key
    )
  )
);
```

---

### Q2: How does Zustand handle asynchronous operations (e.g., API requests)?
**Answer:**
Unlike Redux, which requires you to install separate middleware (like `redux-thunk` or `redux-sagas`) to handle asynchronous dispatches, **Zustand handles async actions natively**.

Because actions in Zustand are plain JavaScript functions, they can be declared as `async` and perform operations like database queries or `fetch` requests directly. When the async operation returns, you simply call the synchronous `set` function to apply the updates to the store.

```javascript
export const useUserStore = create((set) => ({
  userData: null,
  loading: false,
  error: null,

  fetchUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      set({ userData: data, loading: false }); // Synchronously apply state update
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  }
}));
```

There is no concept of complex action creators, dispatch payloads, or reducers; you write standard asynchronous JavaScript.

---

### Q3: Explain selector optimizations and the role of the `useShallow` hook.
**Answer:**
By default, when a component consumes a store using a selector, Zustand compares the return value of that selector to its previous value on every state change using strict reference equality (`===`).

```javascript
// This triggers a re-render ONLY if 'username' string changes
const username = useUserStore((state) => state.username);
```

**The Object Reference Problem:**
If your selector returns an **object literal** or a newly filtered array, a new reference is created on every single render:
```javascript
// DANGER: Returns a new object reference every time any state property changes!
const { name, email } = useUserStore((state) => ({ name: state.name, email: state.email }));
```
Because `{ name, email } !== { name, email }` (reference inequality), this component will re-render on *every* store update, even if both `name` and `email` didn't change!

**The Solution: `useShallow`**
To prevent this, wrap your selector function in the **`useShallow`** hook. This tells Zustand to compare the selected value using **shallow comparison** (comparing individual object key values) instead of raw reference matching.

```javascript
import { useShallow } from 'zustand/react/shallow';

// OPTIMIZED: Will only re-render if state.name or state.email actually change values
const { name, email } = useUserStore(
  useShallow((state) => ({ name: state.name, email: state.email }))
);
```

---

### Q4: What is the "Slice Pattern" in Zustand, and how do you structure large multi-module stores?
**Answer:**
As an application scales, housing all properties inside a single flat store becomes unmanageable. Zustand solves this using the **Slice Pattern**, allowing you to split your state and actions into domain-specific modules (slices) and combine them into a single global store.

**Rules for Slices:**
1. A slice is a function that returns an object representing that slice's state.
2. It receives `set`, `get`, `api`, and optional middlewares as parameters.
3. Slices are merged together by passing them into a single parent `create` function.

**Slice Pattern Code Sample:**
```javascript
// 1. Define the User Slice
const createUserSlice = (set, get) => ({
  userName: 'Guest',
  setUserName: (name) => set({ userName: name }),
});

// 2. Define the Settings Slice
const createSettingsSlice = (set, get) => ({
  darkMode: false,
  toggleMode: () => set((state) => ({ darkMode: !state.darkMode })),
});

// 3. Combine Slices into a Single Unified Store
export const useBoundStore = create((...args) => ({
  ...createUserSlice(...args),
  ...createSettingsSlice(...args),
}));
```

Inside components, you import `useBoundStore` and call selectors on the specific slice fields you need.

---

### Q5: How can a Zustand store access state from another store?
**Answer:**
If you have split your application into multiple separate stores (e.g., a `useAuthStore` and a `useTaskStore`), you can easily read or write state from one store to another.

Because Zustand stores are exposed as standard objects, you can call `.getState()` or `.setState()` on any store instance directly inside another store's action definitions:

```javascript
import { useAuthStore } from './authStore';

export const useTaskStore = create((set) => ({
  tasks: [],
  
  createTask: (title) => {
    // Read user token directly from another store instance synchronously
    const token = useAuthStore.getState().token;

    if (!token) {
      throw new Error("Unauthorized task creation attempt.");
    }

    // Proceed to create task...
  }
}));
```

This makes store-to-store communication clean and direct, without requiring React Context providers or parent component mediators.

---

### Q6: Explain the referential-stability trap in selectors returning fresh objects.
**Answer:**
Zustand compares selected results with `Object.is`. This selector constructs a NEW array every check:

```js
// ❌ infinite-ish re-render loop risk
const items = useStore(s => s.items.filter(i => i.active));
```

Every store change (any key!) reruns the selector → filter returns a fresh array reference → `Object.is` false → re-render → repeat pressure even when CONTENTS are identical.

**Fixes ladder:**
1. Subscribe to primitives/stable refs only: split into `s.items` then derive in render via useMemo keyed by `s.items`.
2. `useShallow` wrapper: `useStore(useShallow(s => s.items.filter(...)))` - shallow-compares array/object contents.
3. Store-side memoization: keep the derived collection IN state, recomputed only when source changes.

The trap generalizes to `.map`, object literals `{ a: s.x, b: s.y }`, and sort/filter chains - the #1 Zustand performance question in interviews.

---

### Q7: What does `createWithEqualityFn` change versus per-hook `useShallow`?
**Answer:**
`createWithEqualityFn(initializer, defaultEqualityFn)` bakes a comparison strategy into EVERY hook call from that store:

```js
import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

const useStore = createWithEqualityFn(config, shallow);
// every selector now shallow-compares automatically
```

Trade-off analysis:
* **Per-call useShallow**: explicit, greppable intent; noise at scale; easy to forget on the one hot path.
* **Store-wide equality**: consistent behavior, less boilerplate; hides comparison semantics from call sites - reviewers can't see whether a selector is cheap-shallow or expensive-deep without checking creation.
* Custom fns possible (e.g., `Object.is` default restored per-call via options where needed).

Guidance: small apps per-call; large teams often standardize store-wide shallow PLUS lint rules flagging heavy selectors.

---

### Q8: How do you customize persist storage beyond localStorage?
**Answer:**
```js
persist(config, {
  name: 'cart',
  storage: createJSONStorage(() => sessionStorage),      // swap engine
})
```
* `createJSONStorage` wraps ANY synchronous Storage-like API (localStorage, sessionStorage, react-native AsyncStorage wrapped, MMKV sync mode).
* **Async engines** (IndexedDB): supply custom storage object implementing `getItem/setItem/removeItem` returning promises - Zustand handles async hydration; expose hydration status via `onRehydrateStorage` / `useStore.persist.hasHydrated()` before gating UI.
* SSR guard: lazily resolve storage inside the factory so server imports don't touch `window`.

Interview depth: explain WHY the JSON layer exists (serialize Maps/Dates deliberately, versioning metadata envelope) and what breaks with raw JSON.stringify round-trips.

---

### Q9: How does persist versioning + migration prevent stale-shape crashes?
**Answer:**
```js
persist(config, {
  name: 'settings',
  version: 2,
  migrate: (persisted, version) => {
    if (version === 0) {
      persisted.newField = defaultValue;        // v0 → v1
      persisted.oldRenamed = undefined;
    }
    if (version < 2) {
      persisted.theme = mapLegacyTheme(persisted.theme);
    }
    return persisted;
  },
})
```
* Stored payloads carry `state.version`; mismatch triggers `migrate(persistedState, storedVersion)` BEFORE merge into live state.
* Without migration, shape drift manifests as undefined-field bugs weeks later on machines with ancient localStorage - the classic production incident story.
* Strategies: sequential migrations (walk-forward chain) vs latest-only transforms; keep migrations pure + unit-tested with real captured payloads.
* Version bump discipline: bump ONLY when persisted shape changes - not on unrelated refactors.

---

### Q10: Why does `partialize` matter, and how do merge strategies interact with rehydration?
**Answer:**
`partialize` selects WHAT persists:
```js
partialize: s => ({ theme: s.theme, sidebar: s.sidebarWidth })
// loading/error/token-transient fields intentionally excluded
```
Persisting volatile fields replays yesterday's spinner states - the canonical bug interviewers cite.

**Merge strategies** control HOW persisted data enters current state on rehydrate:
* Default: shallow merge persisted over initial - new code-added fields survive (good), removed fields linger (bad - handle in migrate).
* Custom `merge(current, persisted)`: full control - e.g., deep-merging nested settings, dropping unknown keys, validating shapes before acceptance.
* Interaction gotcha: partialize excludes a field, but OLD storage still contains it - custom merge should whitelist expected keys defensively against tampered/stale blobs.

---

### Q11: What does `subscribeWithSelector` unlock beyond plain subscribe?
**Answer:**
Plain `subscribe(listener)` fires on EVERY state change with whole state - coarse filtering lands inside listener bodies.

```js
const unsub = useStore.subscribe(
  s => s.items.length,
  (len, prevLen) => console.log(len, prevLen),
  { equalityFn: (a,b)=>a===b, fireImmediately: true }
);
```
* First argument = SELECTOR; listener fires only when selected slice changes (custom equality supported).
* Second arg receives `(newSlice, previousSlice)` enabling delta logic.
* Options: `equalityFn` custom compare; `fireImmediately` invokes listener once at subscription with current value - handy for initializing side systems.
* Returns unsubscribe - ALWAYS pair with useEffect cleanup or leak listeners across mounts/HMR.

Primary use cases: analytics watchers, cross-store bridges, imperative widget syncing (chart redraws) - reactive glue outside render paths.

---

### Q12: What does the `StateCreator<T, Mutators, Objects>` triple generic encode in slice typing?
**Answer:**
```ts
type CartSlice = StateCreator<
  Cart & User,          // T: full combined store state this slice lives in
  [['zustand/immer', never], ['zustand/persist', unknown]],  // mutators tuple
  []                    // objects tuple (rarely used)
>;
export const createCartSlice: StateCreator<...> = (set, get) => ({ ... });
```
* **T** = the WHOLE store type after combination - slices may read sibling slices through `get()` with correct typing.
* **Mutators tuple** declares middlewares wrapping the store ABOVE this creator: entries like `['zustand/immer', never]` transform `set` into draft-based setter; ordering in the tuple mirrors runtime composition order - wrong order = mysterious typing/runtime mismatches.
* When slices are created standalone-then-combined, type them as partial-store creators and let the combiner assemble the full T.

Interviewers use this to probe whether someone has maintained REAL multi-slice TS codebases versus toy examples.

---

### Q13: How do you avoid circular dependencies between slices/stores?
**Answer:**
Failure mode: cartSlice imports userSlice for `get().coupon()` while userSlice imports cartSlice to invalidate carts on logout - bundlers resolve cycles arbitrarily → undefined-at-init errors that "only happen sometimes."

Patterns:
1. **Event direction flip**: lower-level slice exposes an event/hook (`onLogout(cb)` registry); higher-level slice subscribes - dependency becomes one-directional.
2. **Orchestrator action**: a third coordinating module imports BOTH slices' stores and sequences calls - neither slice knows the other.
3. **Lazy indirection**: dynamic accessor functions (`getUserStore()` imported lazily inside the action body) breaking static cycles - pragmatic escape hatch, last resort.
4. Restructure data: if two slices truly need mutual reads constantly, they're one domain - merge them.

Detection: circular-dependency-plugin in bundler CI + eslint import/no-cycle gates.

---

### Q14: How do you eliminate async race conditions in store actions?
**Answer:**
Classic bug: user types fast → two searches in flight → SLOW first response resolves LAST and overwrites fresh results.

```js
search: async (term) => {
  const reqId = ++get()._lastReqId;              // monotonic ticket
  set({ searching: true, searchError: null });
  try {
    const res = await api.search(term, { signal: get()._ctrl?.signal });
    if (reqId !== get()._lastReqId) return;       // stale - discard
    set({ results: res, searching: false });
  } catch (e) {
    if (e.name === 'AbortError') return;
    if (reqId !== get()._lastReqId) return;
    set({ searchError: e, searching: false });
  }
}
```
* **Monotonic request-id guard** discards late responses.
* **AbortController** cancels obsolete network work (store the controller in state/ref; abort previous on new call).
* Both together: cancel for efficiency, id-guard for correctness (some APIs ignore aborts).

Same pattern applies to pagination jumps and optimistic flows - expect to whiteboard it.

---

### Q15: How do optimistic updates with rollback work in store actions?
**Answer:**
```js
toggleTodo: async (id) => {
  const prev = get().todos;
  set({ todos: prev.map(t => t.id === id ? { ...t, done: !t.done } : t) }); // 1. optimistic
  try {
    await api.toggle(id);                                                    // 2. confirm
  } catch (e) {
    set({ todos: prev, error: 'Reverted due to failure' });                  // 3. rollback
    toast.error('Could not update');
  }
}
```
Hardening beyond toy version:
* Snapshot ONLY the affected slice, not whole state.
* Concurrent toggles: snapshot-per-mutation stack or patch-based undo entries keyed by request-id - naive whole-array restore clobbers sibling optimistic edits landing meanwhile.
* Server reconciliation: replace local guess with canonical response fields (timestamps/server ids) post-success - temp ids swapped via stable client-token mapping.
* UI affordances: pending styling while unconfirmed; disable conflicting actions on same entity until settled.

Expect follow-ups on batching many optimistics and ordering guarantees.

---

### Q16: What do memoized selector factories add, Reselect-style?
**Answer:**
Problem: derived computation reruns on EVERY selector invocation even when inputs unchanged - expensive sorts/aggregations punish render paths.

```js
import { createSelector } from 'reselect';

const selectVisibleTodos = createSelector(
  [s => s.todos, s => s.filter],
  (todos, filter) => heavyCompute(todos, filter)   // runs only when inputs change
);
const visible = useStore(selectVisibleTodos);
```
* Memoization caches LAST result keyed by input identity (default equality) - repeated polls with unchanged inputs return cached ref (also fixing the getSnapshot stability trap).
* Parameterized variants need factories: `makeSelectById = () => createSelector(...)` creating per-component memo instances (shared instance across ids thrashes its single-slot cache).
* Cache-size caveat: default size 1 - alternating access patterns evict constantly; configure larger or split selectors.
* Alternative school: compute-on-write (materialize in actions) - compare trade-offs fluently.

---

### Q17: Computed-on-read vs write-time materialization - full decision framework?
**Answer:**
| Axis | Derive-on-read | Materialize-on-write |
|---|---|---|
| Correctness | Impossible to drift | Every mutator must maintain |
| Read cost | Paid per poll/render | O(1) |
| Write cost | Unchanged | Amplified per mutation |
| Devtools clarity | Minimal state | Derived noise mixed in |

Rules distilled:
1. Cheap derivations (< ~microseconds, small collections) → derive inline; simplicity wins.
2. Hot paths / large N / used by MANY components → materialize via SINGLE internal updater all mutations route through (single-writer principle prevents drift).
3. Cross-slice derivations → orchestrator action or selector-composition with memoization.
4. When materialized derivations grow complex, question whether it's SERVER data wearing a disguise - move to query-layer computed fields.

Interview gold: narrate a real drift bug caused by scattered write-side maintenance.

---

### Q18: What's the correct pattern for hydrating stores from Next.js server props WITHOUT cross-request leaks?
**Answer:**
Naive hazard: module-singleton store mutated during Server Component render persists across requests on the server - User B's page could render User A's primed state.

Safe ladder:
1. **Props→client-boundary seeding** (basic): pass server data as props into a `'use client'` wrapper that seeds the store in effects - server render stays store-free.
2. **Hydration-safe merge**: initialize client store defaults matching SSR markup expectations, then merge real payload post-mount (skipHydration pattern for persisted stores).
3. **Per-request factories** (full solution): `createUserStore(initialData)` invoked in a Provider holding the instance in useRef/context - every request/tree gets isolation; components consume via `useStore(context, selector)` form of useStore.
Know when each tier suffices - interviewers escalate scenarios (concurrent requests, streaming RSC, auth-sensitive slices) probing whether the singleton danger is truly understood.

---

### Q19: Detail the per-request store factory + Context provider implementation.
**Answer:**
```tsx
// store factory (NOT a hook)
const createUserStore = (initial: UserState) =>
  createStore<UserState>()((set) => ({ ...initial, setName: (n) => set({ name: n }) }));

type StoreApi = ReturnType<typeof createUserStore>;
const UserCtx = createContext<StoreApi | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<StoreApi>();
  if (!storeRef.current) storeRef.current = createUserStore({ name: '' });
  return <UserCtx.Provider value={storeRef.current}>{children}</UserCtx.Provider>;
}

export function useUserStore<T>(selector: (s: UserState) => T): T {
  const store = useContext(UserCtx)!;
  return useStore(store, selector);        // zustand's context-aware useStore
}
```
Points to articulate:
* useRef-lazy-init guarantees ONE instance per Provider lifetime (StrictMode double-render safe).
* Consumers NEVER import the singleton - swapping to provider-less testing/storybook works by rendering custom providers.
* SSR: provider lives per-request tree → isolation achieved without globals.
Trade-off: loses import-anywhere ergonomics; adopt only where isolation requirements demand.

---

### Q20: How do you synchronize Zustand state across browser tabs?
**Answer:**
Options ladder:
1. **storage event** (persist freebie): other-tab localStorage writes fire `window.addEventListener('storage', ...)` - rehydrate or patch store manually. Limitation: fires only in OTHER tabs, string payloads, latency variable.
2. **BroadcastChannel**: purpose-built same-origin messaging - structured clone payloads, instant:
```js
const bc = new BroadcastChannel('cart-sync');
bc.onmessage = (e) => useCart.setState(e.data);
useCart.subscribe((s) => bc.postMessage({ items: s.items }));
```
Guard against echo loops (ignore self-originated via tab-id stamps) and message storms (throttle high-frequency slices).
3. **Server-mediated**: realtime channel (websocket/SSE) as truth - tabs converge through backend events; required when multi-device consistency matters anyway.
Conflict policy decision: last-write-wins acceptable for prefs; CRDT-ish counters/version vectors for counters/inventory (hard level expands).

---

### Q21: How do you test Zustand stores in isolation?
**Answer:**
Vanilla-first unit testing - no React needed:
```js
beforeEach(() => {
  useCart.setState({ items: [], coupon: null }, false); // reset to clean slate
});

it('adds item', () => {
  act(() => useCart.getState().addItem(sku));           // or direct call outside render
  expect(useCart.getState().items).toHaveLength(1);
});
```
Essentials interviewers probe:
* **Reset between tests** - setState full-replace (replace flag true with fresh initialState factory) prevents inter-test coupling; export `createInitialState()` factory for exact resets.
* **Persist mocking**: inject memory storage adapter (or skipHydration + manual rehydrate with fixture JSON).
* **Async actions**: await promises + flush microtasks; fake timers for debounced/throttled actions.
* **Mocking API layers**: dependency-inject fetch clients into store factory OR msw intercepting network - prefer msw keeping store code honest.
Hook-level tests (renderHook from @testing-library/react) reserved for selector/integration verification.

---

### Q22: What are the gotchas testing components that USE Zustand?
**Answer:**
1. **Module-singleton leakage across tests**: imported store carries prior test mutations - reset in beforeEach OR provide per-test store via mock (jest.mock returning factory) when isolation is paramount.
2. **act() warnings**: direct setState outside React events triggers updates - wrap in act() or drive through rendered interactions (userEvent.click invoking actions) letting RTL handle batching.
3. **Selector assertions vs DOM assertions**: prefer asserting RENDERED OUTPUT (screen.getByText) - white-box getState assertions couple tests to internals.
4. **Persist interference**: storage writes hit jsdom localStorage across tests - clear storage or swap memory adapter globally.
5. **Subscription timing**: useSyncExternalStore requires effects flushed - findBy/waitFor async queries instead of synchronous getBy after async actions.
Pattern worth naming: a `renderWithStore(store, ui)` helper centralizing provider/reset conventions for team consistency.

---

### Q23: Why does curried typing `create<T>()(...)` exist - what breaks without it?
**Answer:**
Middleware-heavy stores hit TypeScript inference walls with direct instantiation:

```ts
// ❌ T inferred wrong / middleware types lost
const useStore = create<PersistedState>(persist((set) => ({...}), {name:'x'}));

// ✅ curried: type param explicit, middlewares infer cleanly
const useStore = create<PersistedState>()(persist((set) => ({...}), {name:'x'}));
```
Mechanics: TS cannot simultaneously infer T from the initializer AND thread middleware mutator tuples through overloaded generics in one call - splitting into two calls lets the FIRST bind T precisely, the SECOND resolve middleware composition types (Mutators tuple accumulating [immer,persist...] signatures).

Consequences when skipped: `set` typed as vanilla (no immer draft), persist's partialize typing degrades to unknown, mysterious errors pointing INSIDE zustand types rather than your code.

Rule to state plainly: any store using ≥1 middleware → curried form. Zero-middlewaer stores can go either way (consistency argues always-curried).

---

### Q24: How does React 18 automatic batching interact with chained store updates?
**Answer:**
```js
actionA();   // set({a}) → notifies → schedules render
actionB();   // set({b}) → notifies → coalesced into SAME render
```
* Notifications remain synchronous per set; RENDER work batches - subscribers reading state between sets (via getState in other stores' listeners!) see intermediates even though DOM doesn't.
* Pre-React-18 contexts (setTimeout/promise chains) rendered per-set - migration-era bugs where components flicker through intermediates disappear under createRoot.
* Escape hatch awareness: flushSync exists for React, but NO equivalent forces synchronous render between two sets - design invariants assuming atomic multi-set transitions must instead consolidate into ONE set call.
Cross-store orchestration inherits this: sequencing matters at NOTIFICATION granularity, not render granularity - a distinction interviewers love extracting.

---

### Q25: Why is reading state via getState() in callbacks preferred over captured values - edge cases included?
**Answer:**
Core staleness scenario covered elsewhere; advanced edges:
1. **Throttled/debounced handlers**: created once, invoked many times later - captured values fossilize; getState reads now.
2. **Event-emitter subscriptions registered in effects with [] deps**: listener lives forever; closure state ages.
3. **Optimistic flows comparing CURRENT vs SNAPSHOT-at-start**: capture startSnapshot deliberately AND read fresh state for conflict checks - mixing both intentionally.
4. **SSR/hydration caution**: callbacks executing BEFORE rehydration complete read defaults - gate critical reads behind hasHydrated checks.
5. **Transients contrast**: pointer-move handlers shouldn't even call getState per event at 120Hz - refs/transient patterns (hard level) supersede.

Formulate the principle: closures freeze DATA; getState freezes nothing - choose per-read-freshness requirement.

---

### Q26: Design conventions for structuring async action error handling across a large app.
**Answer:**
Layered proposal:
* **Store slice**: machine status ('idle'|'loading'|'success'|'error') + `errorCode` (stable machine string) + optional `errorDetail`. NEVER raw Error objects in state (unserializable under persist/devtools).
* **Action contract**: catch → classify (network/validation/auth-expiry via error.code) → set status+code → RETHROW only when callers need custom branching; default swallow-after-record keeps call sites clean.
* **Global side-channel**: dedicated `useErrors` store receiving (domain, code, correlationId) events - single toast/notification renderer subscribes there, decoupling presentation from domain slices.
* **Recovery affordances**: every error state pairs an actionable retry/clear action; auth-expiry errors trigger global redirect interceptor.
Testing matrix: each classification path asserted via mocked api failures - taxonomy tests prevent regression to console.error-and-pray patterns.

---

### Q27: How do you implement a global toast/modal system driven by stores (production version)?
**Answer:**
Architecture:
```js
useOverlays = create((set) => ({
  stack: [],                                    // modals support stacking
  toasts: [],
  push(modal) { ... }, pop() { ... },
  notify(toast) { dedupe+cap+set },
}))
```
Production details separating senior answers:
* **Typed registries**: `ModalMap = { confirm: FC<ConfirmProps>, ... }` - push('confirm', props) fully type-checked; payload serialization safety (no functions in props for persist/debug friendliness).
* **Stacking rules**: z-order management, escape-key pops top-only, focus trap restoration per layer.
* **Toast policies**: max-N visible (queue overflow drops oldest INFO, preserves ERROR), per-kind TTL, dedupe window suppressing identical bursts, aria-live region announcements.
* **Cleanup guarantees**: route-change sweep closing transient overlays (flag per overlay), timers cleared on dismiss to avoid ghost updates post-unmount.
Rendered ONCE at root via portals - imperative `notify()` callable from anywhere including non-React modules.

---

### Q28: When does undo/redo deserve temporal middleware versus bespoke implementation?
**Answer:**
Choose **temporal middleware (zundo)** when:
* State is serializable snapshots of modest size (documents, canvas configs, form wizards).
* Uniform granularity acceptable; partialize can scope tracked slices; limit-based trimming suffices.
* No side-effect reversal semantics required (pure UI/document state).

Go **bespoke** when:
* Patch-based efficiency needed (huge normalized graphs - inverse-patch history via immer patches shrinking memory 10-100x).
* Coalescing/grouping logic is domain-specific (drag sessions = single step; typing bursts = word-boundary steps) beyond middleware's handleSet options.
* Selective undo of SPECIFIC operations (undo last comment without touching concurrent edits) - requires operation-log architecture, not snapshot stacks.
* Server-collaborative context: local undo must integrate with remote op streams (OT/CRDT adjacency) - middleware abstractions collapse here.
Decision artifact worth citing: prototype with zundo, instrument memory/granularity pain, escalate deliberately.

---

### Q29: Compare normalized entity stores against denormalized API-shape stores concretely.
**Answer:**
Scenario: collaborative board with tasks referencing users, updated by websockets.

Normalized:
```js
{ tasks: {t1:{...}}, users: {u1:{...}}, taskOrder:[...] }
updateUser: set(s => ({ users: {...s.users, u1: {...s.users.u1, name}} }))  // one spot
```
* WS patch events apply surgically; selectors join on demand (memoized); memory proportional to unique entities.

Denormalized:
```js
{ boards: [{ tasks: [{ assignee: {...user fields} }] }] }
```
* Response-shaped hydration trivial; BUT updating u1 means walking every embedded copy OR accepting staleness; memory duplicates shared entities.

Decision drivers: mutation frequency × sharing degree × update-source shape. High-frequency shared-entity mutations → normalize. Read-mostly report views mirroring endpoints → stay denormalized. Hybrid layering (normalized core, view-model selectors producing display shapes) is the mature answer pattern.

---

### Q30: How do you prevent derived-state duplication bugs systematically?
**Answer:**
Taxonomy of drift bugs:
1. Write-path omission: new mutator forgets to update materialized `totalCount`.
2. Async race: derivation recomputed from mid-transition state.
3. Cross-store sync lag: mirror updated by subscription that unsubscribed during HMR.

Systematic defenses:
* **Single-writer helper**: ALL mutations of source collection flow through `mutateItems(fn)` which alone recomputes derivatives - grep-enforceable convention.
* **Derivation ownership comment/lint tag** marking materialized fields; PR template checklist row.
* **Invariant assertions in dev**: subscribe-with-selector watcher asserting total === recompute(items), throwing loudly on drift (cheap canary).
* Prefer derive-on-read by DEFAULT; materialize only measured hot paths - fewer materializations, fewer drift opportunities.
War-story framing: recount catching drift via the dev invariant before customers did - proves operational maturity.

---

### Q31: Draw the boundary between Zustand state and React Query/SWR caches precisely.
**Answer:**
Ownership rule: Query libs OWN server-derived data (fetch lifecycle, dedupe, retries, invalidations, optimistic mutation helpers). Zustand owns CLIENT-authored truth: UI preferences, wizard progress, selections spanning routes, unsynced drafts, realtime-maintained session state.

Interaction seams:
* Mutations write THROUGH query lib (`useMutation` onSuccess → cache updates) so invalidation machinery stays coherent - copying results INTO zustand forks truth (the classic anti-pattern).
* Zustand feeds PARAMETERS to queries (filters/selectIds) - query keyed by them; zustand never mirrors query OUTPUT.
* Occasional legit bridging: realtime websocket stream owning live-updated entities in zustand while query serves historical lists - document the partition explicitly.
Interview litmus: "If I refresh the page, what SHOULD disappear?" - server data vanishes (cache refetches); client intent persists appropriately (persist middleware). Anything violating that intuition is misplaced.

---

### Q32: How should stores react to route changes (reset/keep decisions)?
**Answer:**
Decision matrix per slice:
* **Reset-on-navigate**: wizard steps, ephemeral search drafts (unless URL-backed), one-off form states - implement via route-subscription middleware or layout-level effect keyed by pathname segment.
* **Keep-across-navigation**: theme, auth/session, cart, recently-viewed caps - these ARE app-session state.
* **URL-promoted state**: filters/sort/tabs belong IN search params; store holds only derived conveniences (parsed enums) - never duplicate canonical values.

Implementation patterns:
* Central `useRouteSync` hook mapping route-pattern → reset actions table (declarative, greppable).
* Store-side guard: actions accept `scopeKey`; stale-scope responses discarded (route changed mid-flight) - combines race-condition and reset concerns.
Anti-pattern: sprinkling resets in every component's useEffect - leaks whenever someone adds a new entry point.

---

### Q33: How do you prefetch data INTO a store eliminating navigation waterfalls?
**Answer:**
Pattern: intent-time prefetching
```js
onLinkHover / onRouteMatch:
  if (!useProductStore.getState().cache[id]) {
    useProductStore.getState().load(id);   // fire-and-forget with cache dedupe
  }
```
Store-side support requirements:
* **In-flight dedupe**: load(id) checks pending map - hover+click double-fires collapse to one request.
* **Cache-with-TTL**: entries carry fetchedAt; stale-on-read triggers background refresh while serving cached instantly (SWR semantics hand-rolled).
* **Error caching nuance**: failed fetches retryable sooner than successes; negative-cache windows prevent hammering dead endpoints.
Contrast with query-library prefetch APIs - when teams already run TanStack Query, duplicating prefetch plumbing in Zustand signals misplaced ownership (boundary question again). Standalone justification: realtime-maintained entities where websocket freshness matters more than HTTP cache semantics.

---

### Q34: How do you architect a store-driven wizard/multi-step flow cleanly?
**Answer:**
State shape:
```ts
{
  steps: ['profile','plan','payment'],
  current: 'plan',
  completed: Set<string> (serialized as array),
  drafts: { profile?: ProfileDraft, plan?: PlanDraft },
}
```
Design decisions to articulate:
* **Commit-per-step**: step forms validate locally (RHF), COMMIT validated snapshots into store on advance - store never sees half-valid intermediates; revisiting steps edits committed drafts.
* **Navigation guards**: canLeave(step) predicates centralizing dirty-checks; browser beforeunload integration for unsaved warnings.
* **Resume capability**: persist drafts (+version) letting users continue days later - expiry policy on stale drafts.
* **Branching flows**: declarative transitions table (step→conditions→next) rather than hardcoded order - product rule changes stay data-edits.
Testing payoff: pure reducer-style tests drive (action sequence → assertions) without rendering - fast exhaustive coverage of flow logic.

---

### Q35: What's your playbook for migrating Context+useReducer domains INTO Zustand incrementally?
**Answer:**
Strangler sequencing:
1. **Map the domain**: enumerate context value consumers + reducer cases - inventory defines parity checklist.
2. **Bridge phase**: build zustand store mirroring state; Provider continues working by SUBSCRIBING to store and re-rendering context value from snapshot - BOTH systems live off single truth during migration.
3. **Consumer-by-consumer flip**: convert components to direct `useStore(selector)` - each PR small/revertible; context still functional for stragglers.
4. **Retire shell**: last consumer gone → delete provider/context/reducer; remove bridge subscription.
Migration-specific gotchas to name: dispatch identity assumptions (context consumers relying on stable dispatch → zustand actions equally stable ✓), selective-subscription improvements often SURFACE latent over-rendering (fix opportunistically), testing swaps from reducer-unit tests to action-flow tests.
Rollout guardrail: feature-flag store adoption per route enabling instant revert paths.

---

### Q36: What conventions make async actions reviewable and consistent across teams?
**Answer:**
Template contract:
```js
const op = createAsyncAction('checkout', async (payload, { get, set }) => {
  set.status('loading');
  try {
    const res = await api.checkout(payload);
    set.data(transform(res)); set.status('success');
    return res;
  } catch (e) {
    set.error(classify(e)); set.status('error');
    throw e;   // caller decides toast-vs-inline
  }
});
```
Convention list to propose:
* Status machine names standardized ('idle/loading/success/error') - UI switch statements uniform.
* Classification mandatory (network/validation/authz) mapping to error codes - raw messages never stored.
* Request-id/abort wiring REQUIRED for user-initiated searches; optional for fire-and-forget mutations documented as such.
* Optimistic mutations declare rollback strategy in review checklist.
* No side-channel navigation/toasts INSIDE store actions - events emitted, presentation layer reacts (testability + reuse).
Codify via eslint rules + PR template checkboxes; conventions decay without enforcement teeth.

---

### Q37: How do you implement store-backed optimistic inventory/reservation UX correctly?
**Answer:**
Domain: limited-stock items where oversell risks real harm.
Flow design:
```js
reserve(itemId): 
  if stock <=0 reject early
  localStock-- ; pendingReservations.add(reservationToken)
  POST /reserve {token} → server confirms/denies
     confirm → attach reservationId; deny → rollback localStock++, notify reason
```
Correctness properties:
* **Server authority on truth**: client counts are PROJECTIONS for UX speed - checkout revalidates server-side regardless of optimistic state.
* **Expiry handling**: reservations carry TTLs; sweeper releases abandoned holds (tab closed mid-flow) - both client display AND server hold lifecycle mirrored.
* **Concurrent-user visibility**: other users' reservations arrive via websocket deltas reconciling local projections (last-write-wins per entity version stamps).
* **Failure UX taxonomy**: denial reasons mapped (sold-out vs payment-hold vs quota) driving distinct messaging.
Interview framing: optimistic patterns meet business invariants - walk the reconciliation tree confidently.

---

### Q38: How do stores participate in feature-flagged dual-write migrations?
**Answer:**
Scenario: replacing legacy cart implementation behind flag - both implementations alive during transition.
Store-layer responsibilities:
* **Source-of-truth routing**: flag decides which engine mutates on user actions; reads blend per flag (shadow-mode writes to NEW store while UI reads OLD - validating new engine invisibly).
* **Schema negotiation**: persisted envelopes versioned per engine; migration job transforms legacy storage payloads into new shapes lazily on first load post-flag-flip.
* **Telemetry parity**: identical event names emitted from both paths tagged engine-version - SLO comparison gates rollout percentages.
* **Rollback hygiene**: flag-off restores legacy path; new-store artifacts quarantined (not deleted) until stability window passes; dual-write window kept SHORT (dual-write bugs compound over time).
Generalize the pattern: any stateful system replacement (stores, caches, SDKs) inherits this shadow-compare methodology - interviewers reward recognizing the generality.

---

### Q39: Where do computed SELECTORS belong - colocated, centralized, or generated?
**Answer:**
Three schools compared:
* **Colocated with slice files** (recommended default): selectors near the state shape they interpret - change detection trivially local; imports explicit.
* **Centralized selectors.ts barrels**: convenient discovery initially, becomes dependency-magnet (everything imports everything) hurting code-splitting and cycle risk.
* **Generated/auto-selectors** (auto-zustand-selectors-hooks): boilerplate reduction for trivial passthroughs - fine for primitives; hides complexity for composed ones (reviewers can't see cost).
Rules worth proposing:
* Trivial passthroughs inline at consumption (`s => s.name`) - zero ceremony.
* Reused/composed selectors exported named (selectCartTotal) WITH memoization notes documenting input sensitivity.
* Selector unit tests alongside slice tests covering memoization behavior (identity stability assertions).
Anti-pattern call-out: selectors importing OTHER SLICES' internals - route cross-domain derivation through full-state selectors or orchestrator actions.

---

### Q40: How do you handle TIME-dependent state (countdowns, session expiries, cooldowns)?
**Answer:**
Core principle: store DEADLINES, not ticking values.
```js
{ saleEndsAt: ts }                    // stored once
const secondsLeft = useSale(s => Math.max(0, Math.ceil((s.saleEndsAt - Date.now())/1000)))
```
Ticking driver: ONE rAF/interval ticker component (or shared ticker store emitting tick events via transient subscription) - never N intervals per consumer.
Edge craft:
* Clock skew: trust SERVER timestamps delivered with payloads; compute offsets once.
* Background-tab throttling: interval clamping stalls countdowns - rAF-alignment or timestamp-delta math self-corrects on visibility restore.
* Expiry side effects (auto-close modal, release reservation): deadline watcher subscribing with selector on derived expired boolean firing ONCE (guard flag) - idempotent transitions.
Persist caution: absolute timestamps persist safely (unlike countdown remainders which freeze offline) - another interview-favorite nuance.

---

### Q41: What does a Zustand-specific CODE REVIEW checklist contain?
**Answer:**
Selection discipline:
* [ ] No constructed objects/arrays returned without useShallow/memoization justification.
* [ ] Whole-store destructuring absent; selectors narrow.
Mutation hygiene:
* [ ] Immutable updates correct at depth (spreads complete) or Immer used consistently.
* [ ] Async actions: status machine handled, race-guard present where concurrent-capable, abort wired for cancellable ops.
Persistence:
* [ ] partialize excludes volatile/sensitive fields; version bumped iff shape changed; migrations tested.
Architecture:
* [ ] No server-cache duplication (query lib boundary respected).
* [ ] Cross-store access goes through orchestrators, not deep imports.
* [ ] New subscriptions paired with cleanup; transient patterns documented.
Perf/artifacts:
* [ ] Materialized derivations justified with measurement; single-writer maintained.
* [ ] Devtools naming present for complex actions.
Turn the checklist into lint/CI where possible - human checklists complement automation, not replace it.

---

### Q42: How do you implement cross-store ORCHESTRATION without spaghetti?
**Answer:**
Escalation ladder:
1. **Read-only joins**: selectors composing multiple stores:
```js
const canCheckout = () => {
  const { items } = useCart.getState();
  const { token } = useAuth.getState();
  return items.length > 0 && !!token;
};
```
2. **Event publication**: source store emits domain events (via tiny emitter or subscribeWithSelector watchers); interested stores self-update - publishers stay ignorant.
3. **Orchestrator module**: feature-level coordinator importing both stores, owning transaction-like sequences with compensation paths (the checkout example - cart+auth+history).
Governance rules:
* Stores NEVER import each other directly (cycle + coupling) - only orchestrators/event-buses connect them.
* Orchestrators live at FEATURE boundaries, unit-tested with real stores.
* Document invariant windows: multi-step sequences expose intermediate states to subscribers - order operations preserving validity.
Symptom triggering refactor: an action body reading ≥2 foreign stores = extract orchestrator.

---

### Q43: What does the Immer middleware actually buy - and what does it cost?
**Answer:**
```js
import { immer } from 'zustand/middleware/immer';
const useStore = create(immer((set) => ({
  user: { address: { city: 'X' } },
  setCity: (city) => set(s => { s.user.address.city = city }),  // mutate draft!
})));
```
Buys:
* Nested updates written mutably - library materializes structural-sharing immutable next-states (Proxy drafts + copy-on-write).
* Drift-bug class (forgotten spreads) eliminated structurally.
Costs/limits interviewers probe:
* Proxy overhead on every update path - measured hot loops may prefer raw spreads (benchmark!).
* Map/Set require enableMapSet; class instances/complex objects need produce-friendly semantics.
* Devtools payloads show finalized states (drafts invisible) - usually fine, occasionally confusing during step-debugging.
* Freezing behavior: produced states frozen by default - accidental downstream mutation throws loudly (feature!) but interop with mutation-happy legacy utils breaks.
Rule: adopt for DEEP domains; skip for flat primitive-heavy stores where spreads are trivial.

---

### Q44: When is the `combine` helper useful and what does it type-infer?
**Answer:**
```js
import { combine } from 'zustand/middleware';

const useStore = create(
  combine(
    { count: 0, items: [] },                    // initialState object
    (set, get) => ({                            // actions creator
      inc: () => set(s => ({ count: s.count + 1 })),
    })
  )
);
// useStore(s => s.count) - fully inferred WITHOUT manual interface!
```
Value proposition:
* Type inference derives State ∪ Actions intersection automatically from the two arguments - eliminates hand-maintained interface duplication for simple stores.
* Enforces conceptual separation: pure defaults vs behaviors.
Limits:
* Middlewares composition typing still pushes toward curried create<T>() patterns - combine plays best standalone or with light middleware.
* Refactors renaming inferred shapes ripple silently (no explicit contract) - larger teams often prefer EXPLICIT interfaces for greppability despite boilerplate.
Positioning sentence: combine is DX sugar for small stores; explicit generics remain the enterprise-grade contract.

---

### Q45: Compare passing `equalityFn` at creation vs `useShallow` at call sites vs selector refactoring.
**Answer:**
Three tools, one goal (avoid redundant renders from constructed selections):
1. **Creation-time default** (`createWithEqualityFn(config, shallow)`): consistent store-wide semantics; invisible to readers; risk = reviewers can't see comparison costs at call sites.
2. **Call-site useShallow**: maximal visibility/greppability; noise grows; forgetting one hot selector keeps the bug.
3. **Selector refactoring** (return primitives/stable refs, split selections): eliminates the COMPARISON question entirely - often fastest AND clearest.

Decision flow to present:
* Can the selector return narrower/stabler values? → refactor FIRST (zero comparator overhead).
* Multi-field coherence genuinely needed? → choose visibility model per team norms (call-site explicit wins reviews; creation-time wins consistency).
* Deep structures with semantic equality? → custom equalityFn documented + benchmarked (deep compares tax every poll).
Metric backing: render-count probes (basic-level harness) validating choice empirically per store.

---

### Q46: How do you prefetch-on-intent into stores (hover/viewport) correctly?
**Answer:**
Trigger points ranked by intent strength: link hover/focus-start > viewport-approach (IntersectionObserver rootMargin) > idle prefetch (requestIdleCallback queue).
Store-side requirements (expanding basic-level answer):
* Dedupe map: `pending:Set<key>`, `cache:Map<key,{data,fetchedAt}>`.
* TTL classes: entity-type-specific staleness windows; soft-expiry serves-stale-while-refreshing.
* Cancellation on abandonment: hover-out aborts via AbortController - otherwise prefetch storms waste bandwidth.
* Priority lanes: viewport-triggered > hover-triggered when contending (simple queue weights).
Guardrails: budget caps per session (max N speculative fetches), never prefetch auth-gated expensive reports blindly (cost attacks), respect Save-Data hints.
Measurement loop: prefetch-hit-rate telemetry (fetched-but-unused ratio) tuning trigger aggressiveness - prefetch programs decay without usage feedback.

---

### Q47: What's the disciplined stance on storing form DRAFTS across sessions in Zustand?
**Answer:**
Scope discipline:
* Persist ONLY committed checkpoints (step completions), not keystroke streams - storage write amplification + privacy exposure (PII in localStorage) argue hard against live-draft persistence.
* Draft envelope: `{ formId, schemaVersion, savedAt, values }` - schemaVersion gates restore (old drafts dropped or migrated); savedAt drives expiry policy (7-day purge typical).
* Sensitive-field handling: field-level exclusion list (CVV/passwords NEVER persisted even in drafts); encryption adapters change threat surface marginally (hard-level caveats apply).
UX restoration contract:
* Restore prompt rather than silent overwrite ("Continue draft from Tuesday?") - surprising auto-fill erodes trust.
* Server-side draft sync for high-value flows (job applications) - localStorage is convenience tier, not durability tier.
Testing matrix: version-mismatch, expiry boundary, sensitive-field scrubbing - the unglamorous tests that prevent support tickets.

---

### Q48: What HMR pitfalls specifically bite Zustand stores in Vite vs Next?
**Answer:**
Vite specifics:
* Module re-eval recreates stores unless cached on `import.meta.hot.data` - provided pattern earlier; ADDITIONAL gotcha: files exporting BOTH components and stores invalidate together (component edit resets store) - enforce store-only modules via lint.
* Dependency-optimized re-runs (rare dep discovery) can double-execute init in same session - idempotent initializers defensive habit.
Next.js Fast Refresh specifics:
* Preserves state ONLY when files export components exclusively - mixing store exports forces full reload (state lost) silently confusing devs.
* App-router client-boundary rules: store files imported by BOTH server tree accidentally break refresh + leak to server bundles - `'use client'` directive atop store modules mandatory.
Universal diagnostics: "state vanished on save" → module re-eval; "actions fire twice" → duplicated listeners from pre-HMR subscriptions never cleaned (subscribe cleanup discipline again); "stale closure hell after edits" → components holding old store references post-swap (remount or accept-refresh pattern).

---

### Q49: Show the bridge pattern embedding Zustand state into NON-React frameworks safely.
**Answer:**
Angular service facade:
```ts
@Injectable({providedIn:'root'})
export class CartBridge implements OnDestroy {
  private unsub = useCart.subscribe(s => s.count, c => this.count$.next(c));
  readonly count$ = new BehaviorSubject(useCart.getState().count);
  ngOnDestroy(){ this.unsub(); }
}
```
Web Component attribute reflection:
```js
class MiniCart extends HTMLElement {
  connectedCallback(){ this.unsub = useCart.subscribe(s=>s.items, i=>this.render(i)); }
  disconnectedCallback(){ this.unsub?.(); }
}
```
Safety properties to emphasize:
* Selector-scoped subscriptions (subscribeWithSelector) preventing foreign-framework churn from unrelated updates.
* Explicit teardown mapped to HOST lifecycle (ngOnDestroy/disconnectedCallback) - leaks hide easier outside React's devtools.
* One-directional command flow: foreign frameworks call exported ACTIONS; they never setState directly (validation/aborts bypassed otherwise).
Strategic framing: vanilla core lets Zustand serve as org-wide state bus during incremental framework migrations - a genuine differentiator versus hook-locked alternatives.

---

### Q50: Which wasted-render INVESTIGATION workflow do you run when a Zustand screen feels sluggish?
**Answer:**
Stepwise protocol:
1. **Quantify**: React Profiler record interacting - flamegraph + commit table identify components rendering per interaction (counts vs expectation).
2. **Attribute**: Profiler's why-did-render (props changed listing) - store-driven rerenders trace to specific selectors.
3. **Selector audit on suspects**: constructed references? whole-store destructure? wide slices including hot keys? Fix ladder: narrow → useShallow → materialize-on-write.
4. **Subscription fanout check**: temporary instrumentation counting listener invocations per action - N listeners × irrelevant-change notifications = subscribeWithSelector/split-store candidates.
5. **Verify**: probe harness re-run asserting render budgets; lock with CI perf test.
Communications craft: bring BEFORE/AFTER render counts + interaction latency deltas to review - performance work earns credibility through numbers, and this exact workflow demonstrates repeatable methodology rather than guess-and-memoize.

---

## Coding & Implementation Challenges

### Challenge 1: Persistent Store with sessionStorage and Migration Logic
**Requirement:** Implement a persistent Todo store utilizing Zustand's `persist` middleware.
1. The store must store state inside `sessionStorage` (instead of the default `localStorage`).
2. Implement **migration logic**: if the user has state stored under an older schema version (e.g., version 0), automatically migrate their state data to the new schema format (version 1) without wiping their data.

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const usePersistentTodoStore = create(
  persist(
    (set) => ({
      todos: [],
      // Action to add todo
      addTodo: (text) => set((state) => ({
        todos: [...state.todos, { id: crypto.randomUUID(), text, done: false }]
      })),
      clearTodos: () => set({ todos: [] }),
    }),
    {
      name: 'todo-app-storage', // Key name in storage
      storage: createJSONStorage(() => sessionStorage), // Target sessionStorage instead
      
      version: 1, // Current schema version
      
      // Migration function to handle older versions safely
      migrate: (persistedState, version) => {
        if (version === 0) {
          console.log('Migrating older todo schema (version 0) to version 1...');
          
          // Suppose version 0 had todos as a flat string array: ["task1", "task2"]
          // Version 1 expects object structure: [{ id, text, done }]
          const oldTodos = persistedState.todos || [];
          const migratedTodos = oldTodos.map((todo) => {
            if (typeof todo === 'string') {
              return { id: crypto.randomUUID(), text: todo, done: false };
            }
            return todo;
          });

          return {
            ...persistedState,
            todos: migratedTodos,
          };
        }

        return persistedState;
      }
    }
  )
);
```

---

### Challenge 2: Async User Profile Store with Error & Caching Controls
**Requirement:** Create an async Zustand user store that manages a dynamic remote resource. The store must:
1. Track explicit states: `data`, `loading`, `error`, and `lastFetched` timestamps.
2. Only hit the network if the requested profile does not exist in-cache, or if the `lastFetched` cache timestamp is older than 5 minutes (300,000ms), demonstrating an in-memory caching mechanism.

```javascript
import { create } from 'zustand';

export const useUserProfileStore = create((set, get) => ({
  profileCache: {}, // In-memory map: { [userId]: { profileData, lastFetched } }
  loading: false,
  error: null,
  activeProfile: null,

  fetchProfile: async (userId) => {
    const { profileCache } = get();
    const cachedEntry = profileCache[userId];
    const now = Date.now();

    // Check if valid cache entry exists and is less than 5 minutes old (300000ms)
    if (cachedEntry && now - cachedEntry.lastFetched < 300000) {
      console.log(`[Zustand Cache] Serving cached profile for user: ${userId}`);
      set({ activeProfile: cachedEntry.data, error: null });
      return;
    }

    // Cache miss or expired - hit the network
    console.log(`[Zustand Fetch] Fetching profile from server for user: ${userId}`);
    set({ loading: true, error: null });

    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
      if (!response.ok) {
        throw new Error(`Profile fetch failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();

      set((state) => ({
        activeProfile: data,
        loading: false,
        profileCache: {
          ...state.profileCache,
          [userId]: {
            data: data,
            lastFetched: now,
          }
        }
      }));
    } catch (err) {
      set({ error: err.message || 'Failed to fetch user', loading: false });
    }
  },

  clearCache: () => set({ profileCache: {}, activeProfile: null })
}));
```

---

### Challenge 3: Scalable Multi-Slice Store Implementation
**Requirement:** Implement a production-grade multi-slice architecture. Create a single `useAppStore` combining:
1. `UserSlice` (manages username, authorization, and logout).
2. `PreferencesSlice` (manages theme, language, and font sizes).
3. The slice state mutators must be isolated, but also show how one slice can access properties from the other slice during action execution.

```javascript
import { create } from 'zustand';

// 1. Implement User Slice
const createUserSlice = (set, get) => ({
  user: null,
  isLoggedIn: false,
  
  login: (name) => set({ user: name, isLoggedIn: true }),
  
  logout: () => {
    // Actions can access local state or reset
    set({ user: null, isLoggedIn: false });
  }
});

// 2. Implement Preferences Slice
const createPreferencesSlice = (set, get) => ({
  theme: 'light',
  lang: 'en',
  
  setTheme: (theme) => set({ theme }),
  
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),

  // Action that reads from the sibling user slice to perform business logic
  applyUserCustomDefaults: () => {
    // 'get()' retrieves the FULL integrated store state containing all combined slices
    const activeUser = get().user;

    if (activeUser === 'Shibajyoti') {
      // Force dark mode default for this specific VIP user
      set({ theme: 'dark', lang: 'en' });
    } else {
      set({ theme: 'light', lang: 'en' });
    }
  }
});

// 3. Merge Slices into the Global Bound App Store
export const useAppStore = create((set, get, store) => ({
  ...createUserSlice(set, get, store),
  ...createPreferencesSlice(set, get, store)
}));
```
