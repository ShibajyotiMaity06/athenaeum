# React - Hard Interview Questions

## Theory Questions & Answers

### Q1: Deep-dive into React Fiber Architecture. What is it, why was it created, and how does cooperative scheduling work?
**Answer:**
**React Fiber** is the complete rewriting of React's core reconciliation algorithm, released in React 16.

**Why it was created:**
Before Fiber (the "Stack Reconciler"), React navigated the virtual DOM tree recursively. Once a render cycle started, it executed synchronously on the browser's main thread and could not be paused, aborted, or split. If the component tree was very large, a render cycle could take more than 16ms (the budget for 60fps), causing dropped frames, laggy input fields, and stuttering animations (commonly called "jank").

**The Fiber Concept:**
A "Fiber" is a plain JavaScript object that represents a unit of work. It maps to a React element and a DOM node, but unlike elements, fibers are long-lived and mutable. They contain metadata about state, props, output, and references to other fibers (`child`, `sibling`, and `return`).

**Cooperative Scheduling & Work Splitting:**
Fiber transforms the execution model from a call stack to a **linked list traversal**. This allows React to divide the rendering work into small chunks and yield execution back to the browser's main thread when necessary (cooperative scheduling), utilizing browser APIs like `requestIdleCallback` or React's custom scheduler.

**The Two-Phase Lifecycle:**
1. **Render Phase (Asynchronous, Interruptible):**
   * React traverses the fiber tree (linked list) to compute changes (diffing).
   * It builds a "work-in-progress" tree.
   * This phase is non-blocking and can be paused, discarded, or restarted if higher-priority work (like user keyboard inputs) enters the scheduler.
   * No physical side effects (DOM mutations) occur in this phase.
2. **Commit Phase (Synchronous, Uninterruptible):**
   * React takes the completed work-in-progress tree (the "effects list") and applies changes to the actual DOM.
   * This phase must execute synchronously in a single pass to prevent user-facing UI inconsistencies (flickering).
   * Lifecycle methods like `componentDidMount`, `componentDidUpdate`, and effects like `useLayoutEffect` and `useEffect` are scheduled or fired here.

---

### Q2: Explain React 18 Concurrent Features, Priority Lanes, and "Tearing".
**Answer:**
**Concurrent Rendering** is not a feature in itself but an underlying capability of React 18 that enables the UI to be interruptible.

**1. Priority Lanes:**
React internally uses a 32-bit bitmask system called **Lanes** to assign priorities to different types of updates:
* `SyncLane`: For immediate interactive inputs (e.g., text inputs, clicking buttons).
* `TransitionLane`: For transitions that can afford to wait (e.g., filtering a large list, switching tabs).
* `DefaultLane`: For standard state updates.
* `OffscreenLane`: For background rendering.

**2. Transitions (`useTransition` and `useDeferredValue`):**
* `useTransition`: Returns an `isPending` boolean and a `startTransition` function. Wrapping a state-setting callback in `startTransition` tells React to treat that update as low priority (`TransitionLane`). If a user starts typing while a transition-driven render is in progress, React halts the transition render, processes the keystroke, and then restarts the transition render in the background.
* `useDeferredValue`: Takes a state value and returns a deferred copy of it. It delays rendering the deferred value until the main thread is idle, which is useful when customizing performance with third-party libraries where you cannot directly wrap state updates in `useTransition`.

**3. "Tearing" & `useSyncExternalStore`:**
* **Tearing** occurs when a visual discrepancy is displayed on-screen because different parts of the UI render with different versions of the same state during a single repaint.
* Tearing became a serious risk with Concurrent Rendering when reading from **external stores** (like Redux, Zustand, or global browser APIs like `window.innerWidth`). Because concurrent renders can pause and yield back to the main thread, an external event could modify the external store mid-render, causing components rendered later in the tree to read the new value while early-rendered components read the old value.
* To solve this, React 18 introduced **`useSyncExternalStore`**, which guarantees synchronous consistency by forcing updates to fall back to a synchronous, non-interruptible render if an external store update occurs during a concurrent render cycle.

---

### Q3: Explain how the React 18 Hydration process works, what "Selective Hydration" is, and what causes "Hydration Mismatch" errors.
**Answer:**
**Hydration** is the process where client-side React takes over static HTML elements rendered on the server, attaches event listeners, and sets up state/effects, transforming it into a fully interactive single-page application.

**Selective Hydration (React 18):**
In older React versions, hydration was "all-or-nothing". The entire page's JS code had to load, and then the entire page had to hydrate before any element became interactive.
In React 18, wrapping slow-loading components in `<Suspense>` allows React to stream HTML from the server and perform **Selective Hydration**:
1. It hydrates components that have loaded code without waiting for the rest of the page.
2. If a user clicks a button in a non-hydrated component, React recognizes the click as high priority, pauses ongoing hydration elsewhere, and prioritizes hydrating that exact clicked component first (event-driven hydration).

**Hydration Mismatches:**
A hydration mismatch occurs when the server-rendered HTML tree is structure-wise or content-wise different from what the client's React engine produces on its initial render.
* **Common Causes:**
  * Using browser-only variables (e.g., `window`, `localStorage`, or `document`) during the initial render phase.
  * Outputting non-deterministic data like dates (`new Date()`) or random numbers (`Math.random()`) on initial render without synchronization.
  * Invalid HTML markup structure (e.g., nesting a `<div>` inside a `<p>`), which causes the browser to automatically correct the DOM structure, creating a mismatch with React's expectation.
* **How to fix:**
  * Use `useEffect` to trigger client-only rendering changes *after* mounting.
  * For intentional differences, use the `suppressHydrationWarning` prop on the matching HTML element (use sparingly!).

---

### Q4: Deep-dive into State Scheduling under the hood. How does React manage the state update queue?
**Answer:**
When a state update is triggered (e.g., calling `setCount`), React does not calculate the next state immediately. Instead, it creates an **Update Object** containing:
* The next value or update function (e.g., `prev => prev + 1`).
* The update's priority Lane.
* A reference link to the next update object (forming a circular linked list queue).

**Under the hood steps:**
1. **Queueing:** React appends the update object to the Fiber's `updateQueue`.
2. **Scheduling:** React schedules a work cycle for the root of the fiber tree with the priority matching the lanes of the update queue.
3. **Execution (Render Phase):**
   * When the scheduler executes this fiber, React traverses the `updateQueue`.
   * It skips updates whose lanes are lower-priority than the current render's active Lane.
   * It computes the cumulative state by sequentially applying all high-priority updates.
   * *Critical Optimization (Interleaved Updates):* If a skipped update was in the middle of the queue, React remembers the state *before* that update, so that in the next low-priority render cycle, it can re-apply all updates in the correct chronological order, ensuring state remains accurate.
4. **Re-conciliation & DOM Commit:** The final state is compared to the current DOM, and necessary changes are applied in the Commit Phase.

---

### Q5: Walk through Fiber's beginWork/completeWork phases and effect-list construction.
* **beginWork** (downward pass): for each fiber React checks bailout conditions (props unchanged + no forced update/context dirt) - bailing returns the cached alternate subtree instantly. Otherwise it invokes the component function, reconciles returned elements against current children (`reconcileChildFibers`), tagging work: Placement/Update/Deletion, and clones fibers into the workInProgress tree preserving `alternate` links.
* **completeWork** (upward pass): finalizes host fibers - diffs old/new props into an update payload queue, computes `childLanes`/`subtreeFlags` bitmask rollups so ancestors know whether subtrees contain pending work (enables early exits), and stitches **firstEffect/nextEffect linked lists** collecting mutation/layout effects instead of traversing again later.
* Deletions attach to `deletions` array processed in commit; text/host updates bundle into minimal DOM ops.
* Interview depth signal: explain how subtreeFlags lets the commit phase skip entire clean subtrees, and how alternates get reused (double buffering) across renders.

### Q6: Detail the commit phase's three sub-phases and what may run in each.
* **Mutation phase** (synchronous, uninterruptible): applies host mutations - insertions before/after anchors, updates, deletions (deleting a node also detaches its listeners and runs ref detach). Root/container pointer flips happen here (`finishedWork` becomes `current`).
* **Layout phase**: runs `useLayoutEffect` create/destroy + class componentDidMount/Update synchronously **before paint**, plus ref attachments. Components may read layout (`getBoundingClientRect`) and set styles without flicker - blocking paint is the tradeoff; long layout effects directly delay LCP.
* **Passive phase**: `useEffect`s scheduled asynchronously (post-paint) via scheduler callbacks - flushed in effect-list order, interruptible-ish batching; flushed early if a passive-dependent render arrives.
* Ordering guarantees interviewers probe: all destroys before creates within a commit; layout always precedes passive; cleanup-before-setup per fiber.

### Q7: Explain the Scheduler's task loop and priority levels.
* React ships its own scheduler (not OS timers) built on **MessageChannel** postMessage macrotasks: work loops process fiber units checking `shouldYield()` (frame deadline ~5ms slices) yielding to browser input/paint between slices.
* Priority ladder: Immediate (sync flush), UserBlocking (input interactions ~250ms timeout), Normal (~5s), Low (~10s, deferred), Idle (never-expiring cleanup) - each entry carries expiration; starvation prevented via timeout escalation to higher priority.
* Scheduling entries go through a min-heap keyed by due time/priority; synchronous lane work bypasses scheduling entirely (flushSync semantics).
* Yield mechanics: after each work loop iteration it posts another message allowing paint/input interleaving - the mechanism underlying startTransition keeping typing responsive during big list re-renders.

### Q8: Deep dive on the Lane model: how do bitmasks represent priorities?
* Post-17 React replaced monolithic expirationTime numbers with **31-bit lanes**: each bit = an independent parallel priority track (SyncLane, InputContinuousLane, DefaultLane, TransitionLanes range, RetryLanes, IdleLane...).
* Updates carry lanes; roots accumulate `pendingLanes`; the scheduler picks highest-priority (lowest-bit-position = most urgent) non-empty lane group for the next render - enabling **concurrent processing of mixed priorities**: urgent input lane renders while transition lane work pauses/resumes.
* Lane merging lets related updates batch (all TransitionLanes share ranges); `includesSomeLane` checks gate bailouts - a subtree re-renders only if its dependencies' lanes intersect root's pending set.
* Tearing protection ties in: render snapshots which lanes are active; external-store reads coordinate via useSyncExternalStore's subscription versioning rather than lane hacks.

### Q9: What exact contract does `useSyncExternalStore` enforce, and how does it prevent tearing?
* Signature `(subscribe, getSnapshot, getServerSnapshot)` - React polls `getSnapshot()` during render and after subscription events; **the snapshot must be referentially stable between actual changes** (returning fresh objects triggers infinite loops).
* Subscribe registers a listener invoked on store changes → React schedules re-read; between concurrent render start and commit, React re-checks snapshot consistency, discarding/restarting renders whose snapshot mutated mid-flight - eliminating tearing (mixed old/new reads across components in one commit).
* Server snapshot enables hydration parity (server-rendered value shown until client store confirms), dodging hydration mismatches for time-varying externals.
* This hook is THE sanctioned bridge for Zustand/Redux/Jotai on React 18 - hand-rolled useEffect+setState stores can't guarantee tear-free reads.

### Q10: What is the Offscreen/Activity API and which problems does it solve?
* `<Activity mode="hidden">` (successor of Offscreen proposal) keeps subtrees mounted-but-hidden: state, DOM (display:none-ish), scroll positions preserved while hidden - instant restore on show versus unmount/remount data-loss.
* Use cases: tab switching preserving form/drafts, pre-rendering likely-next routes offscreen, virtualization-friendly kept-alive panels, hiding video players without teardown cost.
* Effects semantics differ while hidden (passive effects unmount, layout preserved) - components must tolerate suspended-effect lifecycles; visibilitychange-like awareness required for analytics/timers.
* Pairs conceptually with selective hydration and transitions: combined, navigation feels instant because both data (cache) and UI state (hidden trees) survive. Status: experimental - expect API-shape questions, not production war stories.

### Q11: Explain Suspense internals: thrown promises, boundary coordination, retries.
* A suspending component throws (via renderer integration, e.g., resource.read()) a **thenable**; the nearest Suspense boundary catches it, shows fallback, and attaches resolution callbacks - on resolve, React schedules a re-render of that boundary's subtree only.
* Nested boundaries: inner suspends don't unmount outer content; sibling boundaries stream independently - the composability primitive behind streaming SSR and route-level loading states.
* Already-in-cache promises resolve synchronously on retry (no flash); transitions coordinate differently - `startTransition` keeps showing OLD UI until the new tree fully resolves (fallback suppression), unlike immediate fallback display.
* Gotchas probed: throwing during render violates purity expectations yet is sanctioned ONLY through suspense resources; promise identity matters (new promise per read breaks caching); error boundaries still catch genuine rejections.

### Q12: How does `renderToPipeableStream` structure streaming SSR output?
* Emits the shell (everything outside Suspense) immediately as HTML + inline bootstrap script chunks; suspended subtrees flush later as `<template>`-hidden chunks with `$RC(...)` scripts that client-side-swap content into place and trigger selective hydration of that boundary.
* Order guarantees: parents before children within a boundary; boundaries flush in completion order (fast data → early HTML) - out-of-order streaming solves head-of-line blocking that plagued renderToString waterfalls.
* Backpressure aware: pipe() honors TCP pressure pausing generation; abort(signal) unwinds hung subtrees emitting error placeholders/fallbacks instead of hanging sockets.
* Hardening knobs: `nonce` propagation for CSP-compliant bootstrap scripts, onError distinguishing expected suspensions from crashes, onShellReady vs onAllReady choosing progressive send versus all-at-once crawlers/emails.

---

### Q13: How do passive effect flush timings interact with paint, and when do they run early?
* Passive effects normally flush **after paint** (scheduler Normal-priority task post-rAF), keeping commits responsive; React schedules the flush via its scheduler and may process several roots' pending effects together.
* Early flush triggers: another render begins whose work depends on clean passive state (React flushes pending uncommitted passive destroys/creates first), `flushSync` boundaries, and unmount sequences requiring cleanup-before-detach.
* Consequences interviewers probe: effects reading DOM measurements race with browser paint (layout effects exist precisely for pre-paint reads); long passive chains delay *next frame's* work even though paint already showed - perceived jank lives here, not always in render phase.
* Debug technique: Performance panel correlating rAF → paint → React passive-flush tasks; misordered assumptions about "effects run after user sees" break with sync flushing.

### Q14: How does the exhaustive-deps lint rule actually derive dependencies?
* Static analysis walks function scope capturing every reactive binding referenced inside the effect body (props/state/other hooks' returns), plus transitive closures through locally-defined functions used within - then diffs against the literal dep array.
* Known blind spots requiring discipline: refs intentionally excluded (current mutations are fine), objects used partially (lint suggests the object; narrowing to fields needs extraction), dynamically-computed keys, and functions recreated each render pulling whole-object dependencies (fix via useCallback or moving definitions into effects).
* Suppression (`// eslint-disable-line`) is a design smell signaling either impure effects or missing abstractions (extract a custom hook owning the concern with correct internal deps).
* Senior framing: the rule encodes React's consistency contract - an effect reruns iff anything it *reads* changed; hand-maintained arrays drift into stale-closure bugs silently.

### Q15: What is useEffectEvent (stabilize-in-progress) and which stale-closure class does it kill?
* Problem pattern: effects needing *latest* values without re-subscribing - websocket handler wanting fresh token/count but effect deps [] for connection longevity. Workarounds (refs mirroring, useCallback with sprawling deps) leak implementation noise.
* `useEffectEvent(fn)`: returns a stable function identity reading latest render's closure at call time; callable ONLY from effects (documented constraint preserving purity rules - not for JSX/event handlers).
* Semantics: the event function executes with current props/state while the enclosing effect keeps its original dependency footprint - separating "when to run" (deps) from "what data to use" (always-fresh).
* Status nuance: experimental/RFC-stage naming history (useEvent proposal); expect concept questions over exact API spelling - the ref-mirror workaround equivalence is the real test.

### Q16: Detail the synthetic event system: root delegation and priority tagging.
* Since 17, listeners attach once at the **root container** (not document) - events captured natively bubble/capture to root where React reconstructs SyntheticEvent instances walking the fiber path (capture/target/bubble simulation using fiber tree, not DOM traversal).
* Priority inference: discrete events (click/keydown) → SyncLane scheduling for their setState; continuous events (pointermove/scroll/drag) → lower lanes enabling interruption - same handler code, different concurrency treatment by event type.
* Implications: stopPropagation affects React-path only after native reaches root (native handlers attached outside React see everything first); mixing jQuery/document listeners requires awareness of root boundary; portals participate correctly because propagation follows the React tree.
* Pooling removal (17): SyntheticEvent no longer recycled - e.persist obsolete; async access safe now (older interviews expect the pooling story historically).

### Q17: Which bailouts exist during reconciliation and what defeats them?
* Fiber-level bailouts: memoized element equality (same reference + no forced update) short-circuits beginWork returning cached subtree; `memo()` wraps this compare with custom comparator option; PureComponent/classCompare analogues.
* Context exception: even fully-bailed-out subtrees re-render when a consumed context above changes UNLESS the component also memos against context via useContext placement tricks - classic surprise ("memo didn't save me").
* Forced updates (store subscriptions calling setState) bypass equality; key changes force remount (identity reset, not bailout).
* State bailout: reducer/updater returning identical reference (`return state`) skips re-render entirely - free optimization lever in reducers/selectors (immutability discipline pays directly here).

### Q18: Walk through a concrete tearing example and the modern mitigations stack.
* Scenario: concurrent transition render starts; component A reads store v1; user-typed update lands mid-render bumping store to v2; component B (same tree) reads v2 → committed UI mixes v1/v2 (e.g., total ≠ sum of displayed rows) - impossible under sync legacy rendering.
* Mitigations: external stores route reads through `useSyncExternalStore`, whose snapshot-consistency check forces render restart on mid-flight mutation; stores batch notifications post-commit; transitions defer applying external updates until render completes.
* Legacy escape hatches and why they're insufficient: mutable singleton reads in render (tearing-prone), getDerivedStateFromProps hacks, forcing sync lanes everywhere (kills responsiveness benefits).
* Store-author checklist: versioned snapshots, subscribe-during-render safety, deferred notify (microtask/post-message), and never mutating snapshot objects in place.

### Q19: What mechanics power useOptimistic and its rollback guarantees?
* Signature `useOptimistic(state, reducerFn)` - optimistic reducer computes projected state applied IMMEDIATELY on action dispatch while the real transition (server call wrapped in startTransition) remains pending.
* Pending tracking: React knows the optimistic update's associated async action; on resolution, real state replaces projection; on rejection/error boundary catch, projection auto-reverts to authoritative previous state - rollback isn't manual diffing, it's pending-layer discard.
* Rules: reducer must be pure (no side effects like toasts - those go in the action flow); optimistic value shape usually mirrors final shape (e.g., message appended optimistically with temp id swapped on confirm).
* Composition: pairs with useFormStatus/useActionState for form pipelines - send button disabled via pending flag while list already shows the sent item.

### Q20: Explain Actions/useActionState end-to-end including progressive enhancement.
* `<form action={actionFn}>`: actionFn receives FormData; on server (RSC frameworks) it's an endpoint reference serialized safely; on client it's just an async fn - same authoring model both sides.
* `useActionState(fn, initialState)` wraps: returns `[state, formAction, isPending]` where fn(prevState, formData) => newState - error messages/validation results flow back as state, replacing onSubmit+setState ceremony.
* Progressive enhancement: forms work BEFORE hydration/JS load when actions are server functions (browser posts natively; framework replays result) - the killer differentiator vs onClick-submit SPAs.
* Internals worth naming: hidden field `$ACTION_ID_*` encoding, replay-on-navigation semantics, and how pending integrates with transitions for non-blocking submissions.

---

### Q21: How does Context propagation actually traverse fibers, and why is it fast-ish?
* Provider marks itself with context dependency; consumers register on the context object (`_currentValue` read during beginWork). Traversal: during render React walks the tree; consumers read the nearest provider's value via depth-first stack discipline (push/pop on enter/exit providers).
* Propagation on change: React finds all fibers depending on that context via `dependencies` linked lists (first-class dependencies tracking since 18) - marking them dirty from provider downward WITHOUT full-tree invalidation; bailed-out memoized children still re-render if they consume the changed context (the known memo exception).
* Cost profile: reads are O(depth-to-nearest-provider); writes trigger consumer-set walks proportional to subscriber count, not tree size.
* Optimization corollaries: split contexts by change frequency; keep providers low in tree; value identity stability (memoize provider value!) prevents spurious consumer dirtiness.

### Q22: When is deliberate remounting via `key` the right tool?
* Changing `key` discards instance state entirely - sanctioned resets: form reset on record switch (`<Form key={userId}>`), wizard step re-initialization, clearing internal caches when external identity changes.
* Superior to effect-based "reset everything" choreography (dozens of setState-on-propChange rules); declarative, atomic, race-free.
* Costs: full subtree reconciliation + lost scroll/focus/DOM state; child lifecycles rerun (fetch effects refire - often exactly desired).
* Anti-patterns: keys to paper over derived-state sync bugs (fix derivation instead); randomized keys causing remount storms each render. Interview framing: "state lives at identity boundaries - move identity deliberately."

### Q23: How should INP-driven optimization shape component design?
* INP penalizes slow interaction handlers INCLUDING resulting renders - long synchronous handler work blocks next paint; heavy transition renders delay visual response.
* Tactics ladder: shrink handler work (defer non-critical via startTransition so input lane wins); virtualize giant lists feeding interactions; memoize hot subtrees so interaction renders touch few fibers; avoid layout thrash in handlers (batch reads then writes).
* Measurement: web-vitals attribution builds pinpoint interaction target+phase (input delay / processing / presentation) mapping to handler vs render cost - React 18 concurrent features specifically engineered to compress presentation phase.
* Framework interplay: automatic batching reduces redundant presentation passes; transitions convert "typing lag while filtering 10k rows" into interruptible background work - cite the mechanism, not just the API.

### Q24: Contrast legacy roots vs concurrent roots at the API/render level.
* Legacy `ReactDOM.render`: synchronous, recursive, uninterruptible renders; updates processed FIFO; features like transitions/useSyncExternalStore contract degrade or warn - concurrent safety assumptions (replayable renders) unsupported.
* Concurrent `createRoot`: interruptible render phase, lanes/scheduler active, StrictMode double-invokes, automatic batching everywhere, selective hydration possible.
* Migration mechanics: mostly drop-in, BUT code violating purity (render-phase mutations, singleton date/random usage) surfaces as double-render anomalies - remediation precedes feature adoption.
* Interview angle: explain WHY replayable renders demand purity (discarded renders must be side-effect-free) - connecting concurrency math to everyday rules-of-hooks discipline.

### Q25: What does double-buffered fiber tree mean operationally (current/workInProgress)?
* Two persistent root structures alternate: `current` (committed, what DOM reflects) and `workInProgress` (being built). Each fiber holds `alternate` pointing at its twin; render mutates only WIP copies enabling safe abandonment (discard WIP, current untouched).
* Completion flips: commit makes WIP the new current via pointer swap (`root.current = finishedWork`), old current becomes next render's WIP base - allocations amortized, diffing always has both sides.
* Deletion handling: removed children get effect-tagged on the CURRENT side (they exist only there) ensuring commit can detach them.
* Reconciliation reads current.child vs newly created elements writing into WIP - explaining how interrupted renders resume mid-tree without corrupting the displayed UI.

### Q26: How do you debug hydration mismatch errors systematically?
* Reproduce deterministically: pin locale/timezone (Date/locale formatting top culprit), disable extensions injecting DOM, compare server HTML vs client first-render in isolation.
* Diff strategy: modern React error diffs show client expectation vs server markup region; binary-search by wrapping suspect segments in suppressHydrationWarning (text-level only) or gating browser-only values behind mounted-state pattern (render placeholder until useEffect sets flag).
* Root causes catalog: Date.now/Math.random/uuid in render, localStorage reads during render, user-agent branching, invalid nesting (div inside p auto-corrected by parser shifting structure), attribute mismatches (className casing).
* Prevention: derive-from-props purity, seeded stable ids (useId), serialization-stable formatting (fixed locales), CI test asserting hydration completes without console errors.

### Q27: What leaks do closures-over-fibers cause and how are they fixed?
* Mechanism: handlers/subscriptions capturing component closures retain entire fiber subtrees after unmount when the owning object outlives them (global emitter holding listener referencing setState).
* Typical vectors: window/document listeners without cleanup; store subscriptions added imperatively instead of useSyncExternalStore; timers capturing big arrays; third-party SDK callbacks registered once at module scope referencing first-mount props.
* Fixes: cleanup symmetry (every add has remove with SAME function reference), AbortController propagation, storing minimal data (ids) rather than whole closures in long-lived registries, WeakRef for caches.
* Detection: allocation timelines + DetachedHTMLElement counts in heap snapshots; production light-weight sampling via PerformanceObserver longtask correlation post-navigation.

### Q28: Enumerate what Error Boundaries cannot catch and the mitigation for each.
* Event handlers → try/catch locally or global handlers (window.onerror/unhandledrejection telemetry); async callbacks/promises → catch at source, surface via state; SSR/server rendering → framework-level error pages; errors thrown IN the boundary itself → nested boundary; errors during suspense-lazy load handled by boundary? partially (lazy failures yes, network-level handled by Suspense/error hybrid patterns).
* Rationale: boundaries are RENDER-phase recovery for declarative tree faults - imperative flows own their failure handling.
* Production architecture: top-level boundary logs + shows recoverable UI; domain boundaries isolate risky widgets (charts/maps) so one failure doesn't blank the app; retry affordance via boundary key bump forcing remount.
* Integration: error monitoring SDKs hook componentDidCatch/logError boundaries correlating component stack traces (React stacks in devtools protocol).

### Q29: What programmatic profiling does the Profiler API provide?
* `<Profiler id="Dashboard" onRender={cb}>` fires cb(id, phase('mount'|'update'|'nested-update'), actualDuration, baseDuration, startTime, commitTime, interactions) - feed to analytics for field-level render cost sampling (throttle! onRender fires per commit per subtree).
* actualDuration vs baseDuration diagnosis: actual≫base means wasted renders from upstream instability (memo/prop-identity fixes); base high alone means genuinely expensive subtree (structural fixes/virtualization).
* Combined with React DevTools Profiler flamegraphs for local deep dives (commit selector, why-did-render), and web-vitals for outcome metrics - closing loop between subjective jank and fiber-level numbers.
* Caveats: Profiler adds overhead (dev/staging-first), interactions API deprecated-ish, nested profilers attribute durations hierarchically - understand double counting before alerting off raw numbers.

---

### Q30: How do RSCs differ from SSR at the wire level, and what can't Server Components do?
* SSR: server renders CURRENT tree to HTML; client downloads/hydrates ALL involved component JS - interactivity model unchanged, just first-paint acceleration.
* RSC: server executes components producing a serialized element stream (Flight protocol - JSON-ish rows referencing module chunks and client slots); those components NEVER ship JS; boundaries marked 'use client' become hydration islands receiving serialized props.
* Server-only powers: direct DB/file access, secrets, huge deps staying server-side (markdown parsers, syntax highlighters). Forbidden: hooks state/effects, browser APIs, event handlers (must delegate into client children), passing non-serializable props (functions/classes except action references).
* Mental model line for interviews: "SSR ships your app earlier; RSC shrinks what 'your app' even is."

### Q31: Detail Flight protocol serialization mechanics worth knowing.
* Stream of rows: `id:payload` lines - payload types include module references ($L/$F lazy chunks), client references ($$typeof: Symbol.for('react.client.reference') mapping to import paths), holes filled by later rows enabling out-of-order arrival, Promises serialized as pending references resolving via subsequent chunks.
* Client runtime reconstructs elements lazily - JSX-like structures without executing server code; shared object graphs deduped by row ids (large payloads reference rather than repeat).
* Security property: server closures/functions cannot serialize - only registered Actions cross as encrypted-capable IDs, which is why handlers must live in client components or action files.
* Debug literacy: network tab showing .rsc/.txt flight streams; malformed serialization errors ("Functions cannot be passed directly to Client Components") map directly to boundary violations.

### Q32: What does the React Compiler change about memoization economics?
* Compile-time analysis inserts automatic memo equivalents (component-level caching + fine-grained value deps) targeting correctness-preserving skips WITHOUT manual useMemo/useCallback noise - output approximates perfectly-disciplined hand-memoization.
* Preconditions: Rules of React adherence (purity, stable hook order) - compiler assumes and ESLint plugin verifies; violating code bails out per-function safely rather than misoptimizing.
* Economics shift: premature-memo reviews lose relevance; remaining manual work = structural (virtualization, splitting, moving to server), dependency hygiene (stable external store snapshots), and profiling-verified hotspots the compiler can't fix (bad data shapes).
* Adoption realities: incremental opt-in per directory, build-time only (no runtime dep), interop with existing memo annotations harmless - expect strategy questions over syntax trivia.

### Q33: Which scheduler-visible behaviors distinguish discrete vs continuous input handling?
* Discrete events (click, keydown, submit): highest urgency - their updates run sync-ish lanes, flushing before next event; guarantees immediate feedback contracts (checkbox toggles feel atomic).
* Continuous (pointermove, scroll, wheel): throttled to lower lanes, interruptible - handlers may fire faster than frames but renders coalesce; enables smooth 120Hz pointer tracking without render storms.
* Within handlers, startTransition downgrades contained updates regardless of event class; conversely flushSync upgrades - priority is per-update not per-event ultimately.
* Practical consequence: expensive scroll-driven UI should read scroll via rAF-aligned passive listeners feeding deferred values rather than setState-per-event legacy patterns.

### Q34: How do you architect retry/recovery UX with boundaries and query layers?
* Layered recovery: query-layer retries (exponential backoff w/ jitter) absorb transient failures invisibly; boundary-level retry buttons handle exhausted retries; global boundary catches catastrophic render faults with reload affordance.
* Error taxonomy drives UX: 4xx validation errors surface inline near causes; 5xx/upstream get section-level fallbacks with retry; auth expiry redirects to re-auth flow preserving return URL.
* State preservation on retry: boundary key-bump remount loses local state - prefer query-refetch-triggering boundaries (error state as data) for recoverable cases; reserve remount for corrupt-render scenarios.
* Observability loop: boundary logs tagged with component stacks + release versions feeding triage dashboards; SLO on recoverable-error rate gating deploys.

### Q35: What makes virtualized lists hard at senior depth?
* Variable heights: measure-after-mount passes cause jump corrections; solutions - estimated sizes + measured cache (virtuoso), uniform-height grids, or size-aware data models (chat apps storing message heights post-render then anchoring).
* Scroll anchoring math: maintaining visual position when prepending above viewport (chat history) requires offset compensation against scrollTop deltas within same frame - race-prone; browsers' overflow-anchor helps simple flows only.
* Sticky headers/groups intersecting window edges; bidirectional infinite streams; horizontal/virtual-grid variants multiply anchor math.
* A11y/UX: screen-reader access to offscreen content (aria-live announcements of loaded ranges, or hybrid render-all-for-AT modes), keyboard navigation across virtual gaps, find-in-page limitations - acknowledging tradeoffs honestly scores above tool-name-dropping.

### Q36: How do you eliminate layout thrash in animation-heavy React UIs?
* Thrash = interleaved read/write of layout properties forcing sync layouts per frame: batch phase separation (read all getBoundingClientRect in rAF, then write transforms), FLIP technique (record First, apply Last structurally, Invert via transform, Play transition) for list reorders/modals.
* Compositor-only properties: animate transform/opacity exclusively; animating width/top triggers layout/paint per frame - translate3d/will-change hints (sparingly) promote layers.
* React integration: measure in useLayoutEffect pre-paint; drive frame updates via rAF loop writing to refs/DOM directly bypassing setState-per-frame (React state for endpoints, not tween ticks); springs libraries (framer-motion/react-spring) already batch this internally - know they exist and why.
* Diagnostics: Performance panel Layout Shift/Paint flashing; long-frame attribution pointing at forced reflow stacks.

### Q37: What are the failure modes of hand-rolled stores vs useSyncExternalStore adoption?
* Hand-rolled useEffect-subscribe-setState: tear-prone (reads outside React's consistency machinery), subscription timing races (missing updates between render and subscribe), memory leaks on missed unsubscribes, and broken server snapshot semantics breaking hydration.
* useSyncExternalStore fixes the contract but demands store-side invariants: immutable snapshots, stable getSnapshot references, notify-after-commit batching - stores violating these manifest as infinite render loops (new snapshot identity every getSnapshot call).
* Redux/Zustand/Jotai internalize compliance; custom micro-stores must replicate: version counters, selector memoization, subscriber Set iteration-copy safety (mutation during notification).
* Interview gold: describing the infinite-loop autopsy (getSnapshot returning fresh arrays → React detects change every check → re-render storm) proves operational scar tissue.

### Q38: How does StrictMode interact with concurrent features in production debugging?
* StrictMode is dev-only: double rendering/effect-invocations simulate future concurrency hazards (replayable renders) - production runs single-pass, so dev-reproduced bugs (impure renders, missing cleanup) are prophylactic signals, not prod behavior.
* Conversely some prod-only behaviors lack dev analogues: scheduler interruptions mid-commit-adjacent work, real user timing races, deployed bundle differences - hence staging with production builds matters.
* Debug workflow: reproduce in StrictMode dev (cleanup/purity fix), then validate performance characteristics in prod-build staging (concurrency timing differs under double-invoke overhead absence).
* Team policy angle: enforce StrictMode globally; treat "it breaks under StrictMode" as bug report category, not configuration debate - codifies purity culture mechanically.

### Q39: What upgrade strategies de-risk major React version migrations?
* Inventory first: codemod dry-runs (eslint-plugin-react-hooks exhaustive pass, deprecated-lifecycle scans), third-party compat matrix (router/forms/state libs often lag majors), e2e smoke suites covering interactive cores.
* Incremental adoption surfaces: concurrent root behind flag per route (framework-level), feature-flagged islands using new APIs (transitions) while legacy code untouched; canary/beta channels in staging with production traffic mirrors.
* Behavioral diffs to test explicitly: batching scope changes (timing-dependent tests!), effect double-invoke surfacing latent impurities, event delegation root moves (document-level plugins), removed APIs (string refs/legacy context) hard-failing.
* Rollout mechanics: staged percentage rollout with INP/error-rate SLO watch, instant rollback plan (previous bundle pinned), post-migration cleanup PR isolating codemod noise from logical changes.

### Q40: Where do signals/fin-grained-reactivity proposals intersect React's model?
* Fine-grained systems (Solid/Svelte/Vue/Qwik signals, TC39 proposal) subscribe reads directly to DOM writes - updates skip VDOM diff entirely, O(1) per-value propagation vs React's re-run-component-and-diff model.
* React's stance: compiler auto-memoization narrows the practical gap for common cases while preserving unidirectional mental model; libraries (Preact Signals, Legend-State) bridge signals INTO React via useSyncExternalStore-compatible bindings demonstrating hybrid architectures.
* Tradeoff discourse worth articulating: signal graphs optimize update precision but reintroduce implicit-dependency graphs React deliberately traded away for predictability/concurrent-interruption compatibility.
* Interview framing: know WHY React bets on compile-time instead of runtime reactivity graphs - architectural philosophy question, not framework war.

---

### Q41: How do you design state machines alignment between XState-style models and React rendering?
* Division: machine owns transition legality/guards/context; React subscribes snapshots via useMachine actor hook rendering pure projections of state.value/context.
* Anti-pattern: reimplementing transition tables in reducers with boolean flags ("isSubmitting && !isCancelled...") - state explosion; machines enumerate finite states making impossible-states unrepresentable (loading-error-success triads collapse to single .value).
* Integration seams: services/invoke actors for async (fetch promises as spawned actors with done/error events); optimistic UI maps to optimistic context updates with rollback transitions on error events.
* Testing superpower: model-based test generation walking transition paths - interviewers respect articulating why exhaustive-state coverage becomes tractable versus hand-written reducer cases.

### Q42: How would you instrument telemetry into a store layer without polluting domain logic?
* Wrapper seam: decorate set/get at store creation (middleware position) emitting events {action, durationMs, diffSize} to OTel/analytics adapters - domain slices stay pure; instrumentation swappable/removable per environment.
* Sampling strategy: full capture dev, head-sampled prod keyed by route/user-cohorts; cardinality control (action names whitelisted) preventing metric explosion.
* Diff payloads: shallow-changed-keys lists rather than full states (PII risk! scrubbing pipeline mandatory before export).
* Correlation value: store-action spans nested inside interaction traces connect "click → dispatch → render commit" timelines - the observability story distinguishing mature front-end platforms.

### Q43: What's your framework for deciding "does this belong in a client store at all?"
* Decision tree: Is it derived from server data? → query cache. Encoded in URL? → router. True session/UI ephemera (modals, selections)? → local component or small store slice. Shared across distant trees + high-frequency? → external store with selectors. Cross-tab/device persistent? → storage-backed store or backend entity.
* Litmus questions: who mutates it concurrently? does refresh losing it matter? does it need undo/history? does more than one unrelated feature read it?
* Failure pattern to name: "everything store" anti-pattern where teams funnel API responses into global state producing bespoke, buggier cache implementations than established libraries.
* Senior signal: advocating deletion/migration paths off misplaced state, not just placement rules for new state.

### Q44: How do you handle long-lived WebSocket/realtime feeds feeding React UI correctly?
* Connection ownership above React lifecycle (module/singleton manager) vs per-component connections (simple, leak-prone) - choose by scope; expose via event-target/store bridge consumed through useSyncExternalStore selectors.
* Backpressure/throttling UI updates: coalesce bursts via rAF-aligned flushes or transition-batched store writes preventing render storms during ticker floods; drop-stale semantics (latest-price wins) vs append logs differ architecturally.
* Resilience: heartbeat/ping timeouts, exponential reconnect with jitter, offline queueing for outbound messages, sequence-gap detection triggering snapshot resync instead of replay storms.
* Consistency: versioned events enabling optimistic reconciliation; presence systems needing TTL garbage collection server-side lest ghost users linger - depth signals here separate demo-ware from production realtime.

### Q45: Describe memory-conscious patterns for data-heavy dashboards.
* Window everything scrollable (tables/charts feed virtualized data slices, chart downsampling algorithms LTTB preserving shape at pixel resolution).
* Cache ceilings: query caches with gcTime limits, ring buffers for streaming series (fixed-capacity deques), WeakMap caches keyed by entities so row eviction frees derivatives.
* Release heavy resources: chart instances destroyed on tab hide (Activity/offscreen awareness), WebGL contexts capped (context-limit exhaustion!), workers terminated on route exit.
* Measure: heap snapshots before/after 30-minute soak, detached-node counters, performance.memory trends (Chrome) alerting regressions - bring numbers; dashboards are leak amplifiers by nature (long sessions).

### Q46: What does SSR streaming mean for SEO/crawlers and meta management?
* Crawlers executing JS handle streamed HTML increasingly well, but ordering matters: critical content/meta in shell flushes first ensuring discovery even if crawlers cut streams early; title/meta must serialize within initial shell (framework metadata APIs resolve before flush).
* Suspense-wrapped below-fold content: fallbacks visible to naive crawlers - mitigation: prioritize data fetching for SEO-critical regions outside suspense (blocking shell data), structured-data JSON-LD emitted statically in shell.
* Status codes: streaming commits 200 before errors surface in later chunks - soft-404 problem; mitigate via pre-resolved route-level data for status-determining fetches or header-flush gating strategies.
* Social scrapers (no-JS): require complete meta in raw HTML - verify with scraper emulators, not just browser tests.

### Q47: How do you reason about render purity violations that only appear under concurrency?
* Symptom classes: duplicated side effects (analytics double-fire), inconsistent derived values mid-stream, "works locally breaks under load" heisenbugs - concurrent renders replay/discard work, exposing hidden writes.
* Audit checklist for impurity: mutations of module/props/state during render, Date.now/Math.random()/uuid in render bodies, cache-writes during render (memoize-by-mutation), external-system reads without snapshot stability (non-versioned stores).
* Refactors: move effects to handlers/effects; precompute outside render keyed immutably; snapshot-stable reads via useSyncExternalStore; idempotent analytics with event dedupe ids surviving replays.
* Detection tooling: StrictMode double-invoke as impurity canary, compiler's ESLint rules flagging suspicious patterns, custom lint banning forbidden identifiers in component scopes.

### Q48: What belongs in an answer about coordinating animations with React state transitions?
* Declarative endpoints, imperative tweens: React state defines start/end poses; animation engines (framer-motion, spring libs) interpolate imperatively outside render loop - setState-per-frame anti-pattern avoided.
* Exit animations require delayed unmount: AnimatePresence-style bookkeeping keeping exiting children mounted until onComplete then removing - implement manually via exiting-set state when library absent.
* Interrupted-transition correctness: springs retarget mid-flight (physical models shine vs fixed-duration easing which snaps); layout animations (shared element morphs) need stable keys + measurement coordination.
* Performance contract: animate compositor properties only; respect reduced-motion preferences via media-query gates; test under CPU throttling - dropped-frame budgets define perceived quality.

### Q49: How do you build a resilient error/telemetry story combining boundaries, queries, and globals?
* Capture layers: window.onerror/unhandledrejection (stray async), boundary componentDidCatch with component stacks, query onError hooks (network domain), global interceptor tagging releases/build SHAs.
* Enrichment: user/session context, breadcrumb trails (route changes, store actions, network spans), feature flags active - enough to reproduce without asking users.
* Deduplication/grouping: fingerprint by component-stack+message normalized (strip ids), release-gated regression alerts; sample noisy low-severity groups.
* Recovery loops: auto-reload prompts on repeated chunk-load failures (deploy skew detection), circuit-breaker hiding chronically failing widgets, feedback widgets on boundary screens converting crashes into actionable reports.

### Q50: What final mental model ties React's system together for senior interviews?
* One sentence spine: **UI = f(state), executed on an interruptible scheduler that guarantees consistency via immutable commits.**
* Derivations worth narrating: purity requirement exists because renders replay (concurrency); keys exist because identity drives reuse; refs exist because some state shouldn't trigger f; Suspense exists because async belongs in the tree; RSC exists because f can run anywhere serialization allows.
* Tradeoff literacy: React chose runtime flexibility + compile-time optimization (compiler era) over fine-grained reactivity graphs; every API debate (signals, forget, server components) resolves against the same consistency-and-composability principles.
* Closing posture: opinions grounded in mechanisms (lanes, fibers, flight) rather than tool loyalty - the differentiator interviewers probe across all preceding questions.

---

## Coding & Implementation Challenges

### Challenge 1: Performant Virtualized List (Windowing) from Scratch
**Requirement:** Implement a performant Virtualized List (Windowing) component that takes an array of 50,000 items and renders *only* the subset of items that are currently visible within the scrolling viewport. This solves performance degradation caused by having thousands of DOM nodes in memory. It must accept a fixed item height and viewport height.

```jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';

export function VirtualizedList({ items, itemHeight = 35, viewportHeight = 400 }) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Track the scroll position in real-time
  const handleScroll = (event) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  // Pre-calculate dimensional layout values
  const totalItems = items.length;
  const totalHeight = totalItems * itemHeight;

  // Calculate rendering window indices with "buffer" items to prevent visual popping during scroll
  const { startIndex, endIndex } = useMemo(() => {
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    
    // Calculate raw indices
    const rawStartIndex = Math.floor(scrollTop / itemHeight);
    const rawEndIndex = rawStartIndex + visibleCount;

    // Apply buffer of 3 items before and after
    const startIndex = Math.max(0, rawStartIndex - 3);
    const endIndex = Math.min(totalItems - 1, rawEndIndex + 3);

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, viewportHeight, totalItems]);

  // Extract only the visible items to render
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      originalIndex: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: `${viewportHeight}px`,
        overflowY: 'auto',
        position: 'relative',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#fff'
      }}
    >
      {/* Tall empty element to force browser to generate standard native scrollbars */}
      <div style={{ height: `${totalHeight}px`, width: '100%', position: 'absolute', top: 0, left: 0 }} />
      
      {/* Scrolling window viewport holder */}
      <div
        style={{
          transform: `translateY(${startIndex * itemHeight}px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }}
      >
        {visibleItems.map((item) => (
          <div
            key={item.id}
            style={{
              height: `${itemHeight}px`,
              lineHeight: `${itemHeight}px`,
              padding: '0 16px',
              borderBottom: '1px solid #f0f0f0',
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: item.originalIndex % 2 === 0 ? '#fafafa' : '#fff'
            }}
          >
            <span>Item #{item.originalIndex + 1}</span>
            <span style={{ color: '#666' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Challenge 2: Autocomplete Search with Debouncing, Request Cancellation, and Concurrent Updates
**Requirement:** Build a performance-optimized search auto-complete component. It must:
1. Debounce user keystrokes to prevent flooding the backend API.
2. Utilize `AbortController` to cancel trailing requests.
3. Cache API results in-memory.
4. Wrap results loading or rendering in `useTransition` to prevent blocking high-priority user typing interactions.

```jsx
import React, { useState, useEffect, useTransition, useMemo } from 'react';

// Custom Hook to Debounce a dynamic value
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// In-Memory Search Cache to avoid redundant network calls
const searchCache = new Map();

export function ConcurrentSearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    // Check Cache first
    if (searchCache.has(debouncedQuery)) {
      setResults(searchCache.get(debouncedQuery));
      return;
    }

    const abortController = new AbortController();
    
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Simulated network request
        const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(debouncedQuery)}`;
        const response = await fetch(url, { signal: abortController.signal });
        const data = await response.json();
        
        const extracted = data.products.map(p => ({ id: p.id, title: p.title, price: p.price }));
        
        // Cache result
        searchCache.set(debouncedQuery, extracted);

        // Transition: Keep typing responsive by scheduling list rendering as low-priority
        startTransition(() => {
          setResults(extracted);
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Search fetch failed:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    // Abort controller cancels previous fetch requests if user types fast
    return () => {
      abortController.abort();
    };
  }, [debouncedQuery]);

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>Concurrent Autocomplete</h2>
      
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search products (e.g., iPhone)..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            boxSizing: 'border-box'
          }}
        />
        {(loading || isPending) && (
          <span style={{ position: 'absolute', right: '12px', top: '14px', fontSize: '0.85rem', color: '#888' }}>
            {loading ? 'Fetching...' : 'Rendering...'}
          </span>
        )}
      </div>

      {results.length > 0 && (
        <ul
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            listStyleType: 'none',
            padding: 0,
            marginTop: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            maxHeight: '250px',
            overflowY: 'auto',
            // Dim list slightly when new concurrent state is rendering in transition
            opacity: isPending ? 0.6 : 1,
            transition: 'opacity 0.2s ease'
          }}
        >
          {results.map((product) => (
            <li
              key={product.id}
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem'
              }}
              onClick={() => alert(`Selected Product: ${product.title}`)}
            >
              <span>{product.title}</span>
              <span style={{ fontWeight: 'bold', color: '#28a745' }}>${product.price}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### Challenge 3: Custom Micro-Store with Selector-Based `useSyncExternalStore` Subscription
**Requirement:** Create a lightweight, high-performance global store mechanism from scratch *without* using external state management libraries. The custom store must support:
1. State mutations using actions (dispatching state updates).
2. Selector-based subscriptions to prevent components from re-rendering if fields they don't select remain unchanged.
3. Synchronous correctness with React 18 concurrent rendering using the `useSyncExternalStore` hook.

```jsx
import { useSyncExternalStore } from 'react';

// Core Custom Store Class
export class CustomStateStore {
  constructor(initialState) {
    this.state = initialState;
    this.subscribers = new Set();
  }

  // Retrieve current snapshot (must return same reference unless modified)
  getState = () => {
    return this.state;
  };

  // Modify state and notify subscribers of the reference change
  setState = (nextStateOrFn) => {
    const nextState = typeof nextStateOrFn === 'function' 
      ? nextStateOrFn(this.state) 
      : nextStateOrFn;
    
    if (nextState !== this.state) {
      this.state = { ...this.state, ...nextState };
      this.notify();
    }
  };

  // Add subscribers and return cleanup unsubscribe function
  subscribe = (callback) => {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  };

  notify() {
    this.subscribers.forEach((cb) => cb());
  }
}

// Global instance of our custom store
export const appStoreInstance = new CustomStateStore({
  user: 'Shibajyoti',
  theme: 'light',
  notifications: 5,
});

// Custom React Hook to consume the store with Selector-based rendering
export function useAppStoreSelector(selector) {
  // useSyncExternalStore takes: subscribe callback, getSnapshot function, and (optional) getServerSnapshot
  const selectedState = useSyncExternalStore(
    appStoreInstance.subscribe,
    () => selector(appStoreInstance.getState())
  );

  return selectedState;
}

// --- CONSUMER COMPONENTS ---

// This component ONLY re-renders when user change occurs (ignores changes in notifications or theme)
export function UserProfileHeader() {
  const userName = useAppStoreSelector((state) => state.user);

  return (
    <div style={{ padding: '8px', border: '1px dashed blue', margin: '8px 0' }}>
      <h4>User Profile Dashboard</h4>
      <p>Logged in user: <strong>{userName}</strong></p>
      <button onClick={() => appStoreInstance.setState({ user: 'Guest User' })}>
        Log out User
      </button>
    </div>
  );
}

// This component ONLY re-renders when notifications change
export function NotificationBadge() {
  const notificationsCount = useAppStoreSelector((state) => state.notifications);

  return (
    <div style={{ padding: '8px', border: '1px dashed green', margin: '8px 0' }}>
      <h4>Notification Drawer</h4>
      <p>Inbox Count: <span style={{ color: 'red', fontWeight: 'bold' }}>{notificationsCount}</span></p>
      <button onClick={() => appStoreInstance.setState((prev) => ({ notifications: prev.notifications + 1 }))}>
        Simulate Incoming Notification
      </button>
    </div>
  );
}
```
