# JavaScript - Hard Interview Questions

## Theory Questions & Answers

### Q1: Explain Memory Management and Garbage Collection in the V8 engine. How are young and old spaces handled?
*   **Generational Hypothesis:** Most objects die young. V8 divides its heap accordingly:
*   **New Space (Young Generation):** Holds short-lived objects (1MB - 64MB). Uses Cheney's copying algorithm (Scavenger). Splits memory into active "From" and inactive "To" semispaces. Fast, frequent collections copy surviving objects to the "To" space, swap the spaces, and promote long-surviving objects to the Old Space.
*   **Old Space (Old Generation):** Holds long-lived objects. Uses the **Mark-Sweep-Compact** algorithm:
    *   *Marking:* Traverses GC roots (stack, globals, DOM) to recursively mark reachable objects.
    *   *Sweeping:* Iterates unreferenced memory to free unreachable space.
    *   *Compacting:* Shifts remaining active blocks together to eliminate memory fragmentation.
*   **Incremental & Concurrent Marking:** V8 runs marking in small slices in parallel with main-thread execution to prevent long UI freeze pauses.

### Q2: How do `WeakMap` and `WeakSet` prevent memory leaks compared to standard collections?
*   **Strong References:** Standard `Map` and `Set` hold strong references to their entries. If an object is used as a key/member, it cannot be garbage-collected, even if all other external references to it are deleted.
*   **Weak References:** `WeakMap` and `WeakSet` hold weak references to their object keys.
*   **GC Interaction:** If no strong references to a key object remain outside the weak collection, the garbage collector will reclaim the object's memory and automatically destroy the corresponding map entry during the next GC cycle.
*   **Use Cases:** Storing private DOM element metadata, or memoizing expensive computational results without blocking memory cleanup.

### Q3: Explain the V8 compilation pipeline: JIT, Ignition, TurboFan, Hidden Classes, and Inline Caches.
*   **V8 Pipeline:** Source -> AST -> Ignition Interpreter -> Bytecode -> TurboFan Optimizer -> Machine Code.
*   **Ignition:** Quickly generates lightweight bytecode for rapid initial app startup.
*   **TurboFan:** Monitors execution profiles. Hot functions with stable parameter types are compiled into native machine code. If parameter types mutate later, TurboFan performs a **Deoptimization** and falls back to bytecode.
*   **Hidden Classes (Shapes):** V8 assigns hidden classes to objects. If objects add identical properties in the same order, they share a shape, allowing JIT to locate properties via memory offsets rather than slow hash lookups.
*   **Inline Caches (ICs):** ICs speed up property lookups by caching physical memory offsets of properties mapped to specific object shapes directly at the property access call site.

### Q4: Detail the Binary Data Pipeline and Stream architecture in modern JS.
*   **ArrayBuffer:** Represents a fixed-length, contiguous block of raw binary data. Cannot be read or modified directly.
*   **TypedArrays:** Views (e.g., `Uint8Array`, `Float64Array`) providing typed numeric read/write capabilities on an `ArrayBuffer`.
*   **DataView:** A flexible view capable of reading/writing heterogeneous numeric types at arbitrary byte offsets inside an `ArrayBuffer`, with explicit Big-Endian/Little-Endian control.
*   **Blob:** Immutable container for raw, file-like binary data.
*   **Streams API:** Processes data incrementally (in chunks) to reduce memory footprints:
    *   *ReadableStream:* Emits chunks of incoming data (e.g., active fetch payloads).
    *   *WritableStream:* Directs sequential data chunks to a target destination.
    *   *TransformStream:* Connects readable and writable streams, modifying chunks mid-transit.

### Q5: Explain the Proxy and Reflect APIs. How do they build reactivity?
*   **Proxy:** Wraps a target object and intercepts low-level meta-operations (e.g., `get`, `set`, `deleteProperty`, `apply`).
*   **Reflect:** A global object providing static methods that match every Proxy trap. Replaces older object manipulations, handles receiver context binding, and returns boolean statuses rather than throwing exceptions on failures.
*   **Reactivity Pattern (e.g., Vue 3):**
    *   *Get trap:* Track dependencies. Records the active execution context (the "effect") as a dependent of that property.
    *   *Set trap:* Trigger updates. Runs all recorded dependent effects when the property value changes.

### Q6: What is Tail Call Optimization (TCO)? What is its status in JS?
*   **TCO:** A compiler optimization where a function call that is the final action (tail call) of a function reuses the caller's stack frame instead of creating a new one. This prevents stack overflow errors in deep recursions.
*   **Status:** Only supported in the Safari WebKit engine. V8 and SpiderMonkey dropped support due to complex stack trace debugging and technical performance tradeoffs.

### Q7: Explain the execution context lifecycle in detail. Compare LexicalEnvironment and VariableEnvironment.
*   **Creation Phase:**
    1. Creates the outer Lexical Environment reference.
    2. Instantiates the environment record (maps variables/parameters).
    3. Allocates hoisting spaces.
*   **Execution Phase:** Evaluates and assigns variable values, executing the code statements.
*   **LexicalEnvironment:** Stores block-scoped variables (`let`, `const`) and function bindings. Dynamically changes during block execution.
*   **VariableEnvironment:** Stores function-scoped variables (`var`) initialized with `undefined`. Remains static throughout function execution.

### Q8: How can infinite microtasks cause browser UI starvation?
*   **Reason:** The Event Loop cannot move to the browser rendering phase or process the next macrotask until the Microtask Queue is completely empty.
*   **Starvation:** If executing a microtask recursively schedules *another* microtask (e.g., an infinite promise chain), the microtask queue will never be empty. This permanently blocks the main thread, freezing the UI and preventing user interactions or browser repaints.

### Q9: Explain `WeakRef` and `FinalizationRegistry` (ES2021).
*   **WeakRef:** Creates a weak reference to an object, permitting GC to reclaim the object while allowing programmatic access via `.deref()` if it is still in memory.
*   **FinalizationRegistry:** Registers a callback that runs automatically after a target object is garbage-collected, allowing custom cleanup of associated resources.
*   *Warning:* GC execution is highly non-deterministic; do not rely on these APIs for core application logic.

### Q10: How do you identify memory leaks using Chrome DevTools?
*   **Heap Snapshot:** Captures current memory allocations. Compare snapshots over time to find objects that remain allocated (constructor counts rising).
*   **Allocation Instrumentation on Timeline:** Records memory allocations in real-time. Look for blue spikes (allocations) that never turn grey (deallocations) after actions.
*   **Three Snapshot Technique:**
    1. Take Snapshot 1 (baseline).
    2. Perform an action that should create and destroy elements, then trigger GC.
    3. Take Snapshot 2. Perform action again. Take Snapshot 3. Compare Snapshot 2 and 3 to isolate permanently retained allocations.

### Q11: Explain V8 monomorphic, polymorphic, and megamorphic call sites.
*   **Monomorphic:** A call site receives objects of exactly **one** hidden class. Highly optimized; property offsets are accessed directly via JIT inline caching.
*   **Polymorphic:** Receives objects of **2 to 4** different hidden classes. V8 uses a small decision table to check shapes. Still fast, but slightly slower than monomorphic.
*   **Megamorphic:** Receives objects of **5 or more** hidden classes. JIT inline caching is disabled. Falls back to a slow global hashtable lookup for property offsets.

### Q12: Compare the Event Loop in Node.js (libuv) vs. the browser.
*   **Browser Event Loop:** Focuses on user interaction, rendering loops, and task queues. Simple micro/macrotask priority.
*   **Node.js Event Loop (libuv):** Focuses on I/O and server operations. It runs in structured phases:
    1. *Timers:* Executes `setTimeout`/`setInterval` callbacks.
    2. *Pending Callbacks:* Executes deferred system/socket I/O callbacks.
    3. *Idle/Prepare:* Used internally by Node.
    4. *Poll:* Retrieves new I/O events; executes I/O-related callbacks.
    5. *Check:* Executes `setImmediate` callbacks.
    6. *Close Callbacks:* Executes socket close events (e.g., `socket.on('close')`).
*   *Microtasks:* `process.nextTick` executes before promises at every transition between these phases.

### Q13: What are `SharedArrayBuffer` and `Atomics`?
*   **SharedArrayBuffer:** A raw binary buffer shared directly between the main thread and multi-threaded Web Workers. Enables high-performance, zero-copy data sharing.
*   **Atomics:** A static global providing thread-safe operations (e.g., `Atomics.add`, `Atomics.wait`, `Atomics.notify`). Prevents race conditions and guarantees that operations on shared memory complete atomically without thread interference.

### Q14: Explain WebAssembly (Wasm) integration with JavaScript.
*   **Definition:** A low-level binary format designed to run compiled code (C/C++/Rust) near native speed inside browsers.
*   **Integration:** JS downloads the `.wasm` file, compiles and instantiates it asynchronously using `WebAssembly.instantiateStreaming(fetch('module.wasm'), importObject)`. The compiled Wasm functions are then called directly from standard JS.

### Q15: How do browser Module scripts load differently from Classic scripts?
*   **Classic Scripts:** Loaded synchronously by default (blocks HTML parsing). Do not require CORS headers. Evaluated in the global scope.
*   **Module Scripts (`type="module"`):** Deferred by default (asynchronous loading, executes only after HTML parsing). Enforce strict mode. Executed in private scope. Require CORS headers on cross-origin fetches.

### Q16: Explain the performance cost of Object prototype chain traversal.
*   **Cost:** Looking up a non-existent property on a deeply nested prototype chain requires the engine to traverse each prototype level sequentially. This can degrade performance in hot code paths.
*   *Mitigation:* Use inline caching, or shield hot loops by caching frequently accessed properties locally.

### Q17: What are the exact differences between `Reflect` methods and equivalent `Object` methods?
*   **Object.defineProperty:** Throws a `TypeError` if property configuration fails. Returns the passed object.
*   **Reflect.defineProperty:** Returns a boolean (`true` on success, `false` on failure).
*   **Object.keys:** Coerces primitive arguments to objects.
*   **Reflect.ownKeys:** Throws a `TypeError` if the argument is a primitive. It also returns both string and Symbol keys, unlike `Object.keys` which excludes symbols.

### Q18: What are Web Workers? Compare Dedicated, Shared, and Service Workers.
*   **Web Workers:** Offload heavy computations to background threads, keeping the main thread free.
*   **Dedicated Worker:** Linked to a single script instance/tab. Communicates via `postMessage`.
*   **Shared Worker:** Shared across multiple tabs/windows from the same origin.
*   **Service Worker:** A background proxy that intercepts network requests, manages asset caching, and handles push notifications and offline sync.

### Q19: Explain requestAnimationFrame vs. requestIdleCallback.
*   **requestAnimationFrame(fn):** Executes callbacks before the next browser repaint (synchronized with screen refresh rate, usually 60fps). Ideal for smooth animations and style changes.
*   **requestIdleCallback(fn):** Executes non-critical callbacks during the browser's idle periods when the main thread has spare time, preventing lag on user-critical actions.

### Q20: Explain Cross-Origin Isolation: COOP and COEP.
*   **COOP (Cross-Origin-Opener-Policy):** Restricts cross-origin documents from opening in the same window context.
*   **COEP (Cross-Origin-Embedder-Policy):** Forces the document to only load cross-origin resources that explicitly permit it via CORS.
*   **SharedArrayBuffer requirement:** Due to CPU Spectre side-channel attacks, modern browsers require both COOP and COEP headers to be enabled to access `SharedArrayBuffer` safely.

### Q21: Compare MutationObserver, IntersectionObserver, and ResizeObserver.
*   **MutationObserver:** Monitors micro-level changes in the DOM tree (attributes, text nodes, additions/deletions).
*   **IntersectionObserver:** Monitors when an element intersects a parent container or the viewport (ideal for lazy-loading or infinite scrolls).
*   **ResizeObserver:** Monitors changes to the physical boundaries/dimensions of specific DOM elements.

### Q22: Explain the Structured Clone Algorithm. What can and cannot be cloned?
*   **Definition:** The browser's native algorithm to copy complex objects (used by `structuredClone()`, Web Workers, and IndexedDB).
*   **Supported:** `RegExp`, `Date`, `Map`, `Set`, typed arrays, and circular references.
*   **Unsupported:** Functions, DOM elements, Error objects, and Proxy wrappers. Attempts to clone these throw a `DataCloneError`.

### Q23: Explain Automatic Semicolon Insertion (ASI) hazards.
*   **ASI:** The parser inserts semicolons to terminate statements when parsing breaks.
*   **Hazard:** Placing a newline after a `return`, `throw`, or `yield` statement.
    ```javascript
    return 
    { name: "Alice" };
    // Parsed as: return; { name: "Alice" }; (returns undefined!)
    ```

### Q24: Explain V8 Lazy Parsing vs. Eager Parsing.
*   **Eager Parsing:** Fully compiles the code and constructs the AST immediately. Used for code executed during initialization.
*   **Lazy Parsing:** Checks syntax briefly but skips compiling function bodies until they are actually invoked, reducing startup compilation overhead.

### Q25: What is Prototype Pollution? How do you prevent it?
*   **Pollution:** An attacker injects properties into the global `Object.prototype` (often via unsafe merge or query string parses using keys like `__proto__`). This injects properties into all plain JavaScript objects.
*   **Prevention:** Use `Object.create(null)` for plain maps, sanitize keys, or freeze the prototype using `Object.freeze(Object.prototype)`.

### Q26: Explain the Temporal Proposal (TC39).
*   **Temporal:** A modern replacement for the legacy `Date` object, fixing issues with time zones, daylight saving transitions, mutable states, and complex date math.

### Q27: How does `Error.captureStackTrace` work?
*   **Definition:** A V8-specific API that captures the current execution stack trace and attaches it to a target object as a string, allowing custom error classes to hide internal frame details.

### Q28: What are algebraic data types, Functors, and Monads in JS context?
*   **Functor:** An object implementing a `map` method (like `Array`) that applies a function to its contents while keeping its wrapper structure.
*   **Monad:** A Functor that additionally implements a flat-mapping/binding method (`flatMap`) to flatten nested wrapped layers.

### Q29: Explain CSS-in-JS performance under-the-hood.
*   **Performance Cost:** Generating CSS strings at runtime inside JS requires parsing and injecting `<style>` tags dynamically. This triggers expensive style recalculations and layout reflows.
*   *Optimization:* Use pre-compiled CSS-in-JS compilers (like vanilla-extract) or leverage CSS variables.

### Q30: What are V8 Inline Cache (IC) states?
*   **Monomorphic:** Only 1 hidden class observed. Peak performance.
*   **Polymorphic:** 2 to 4 hidden classes observed. Good performance.
*   **Megamorphic:** 5 or more hidden classes observed. Slow hash search lookup.
*   **Generic:** Highly unoptimized state, bypassing IC entirely.

### Q31: How does JavaScript handle Cryptographically Secure Pseudo-Random Numbers (CSPRNG)?
*   **Limit:** `Math.random()` uses a non-secure algorithm (PRNG), which is predictable and unsafe for cryptographic tasks.
*   **Solution:** Use `crypto.getRandomValues(array)` from the Web Cryptography API. It utilizes system entropy to generate cryptographically secure random values.

### Q32: Explain the performance bottlenecks of the Canvas rendering context.
*   **Bottlenecks:** Direct CPU-to-GPU state changes and context switches. Drawing individual pixels or elements in a loop incurs high JS-to-Canvas bridge costs.
*   *Optimization:* Group draw operations, use offscreen canvas layers, or utilize WebGL for hardware-accelerated rendering.

### Q33: Why is the `with` statement banned in strict mode?
*   **Reason:** The `with` statement extends the scope chain with a target object, making it impossible for the compiler to statically determine where variables reside. This disables JIT compilation optimizations.

### Q34: Explain the differences between the microtask scheduling APIs.
*   **Promise.resolve().then(fn):** Standard ES6 microtask scheduling.
*   **queueMicrotask(fn):** A standard, lightweight global API to queue a microtask directly without promise instantiation overhead.

### Q35: How does the browser's Rendering Pipeline execute?
*   **Pipeline:** HTML Parse -> DOM -> CSSOM -> Attachment (Render Tree) -> Layout (reflow) -> Paint -> Composite.
*   **Reflow:** Recalculates element dimensions and viewport positions. Extremely expensive.
*   **Repaint:** Re-draws pixels (color, borders) without changing layouts.
*   **Composite:** Groups layers onto the GPU for rendering. Fastest phase; uses `transform` and `opacity`.

### Q36: Explain Service Worker asset caching strategies.
*   **Cache-First:** Checks cache first; falls back to network. Best for static assets.
*   **Network-First:** Attempts network first; falls back to cache on failures. Best for dynamic, volatile data.
*   **Stale-While-Revalidate:** Serves cached assets instantly, while fetching updates in the background to refresh the cache for the next request.

### Q37: What are MessageChannel and BroadcastChannel?
*   **MessageChannel:** Sets up a private, direct, two-way communication channel (`port1`, `port2`) between two threads or windows.
*   **BroadcastChannel:** Sets up a many-to-many communication channel, allowing scripts from the same origin to broadcast messages to all active windows, tabs, or iframe instances.

### Q38: Explain the performance tradeoffs of using BigInt.
*   **Tradeoff:** `BigInt` supports arbitrary-precision integers but operates significantly slower than standard 64-bit floating-point numbers. It cannot be mixed with standard numbers in operations without explicit coercion.

### Q39: What are Decorators in JS? Explain their compiled mechanics.
*   **Decorators:** Functions that modify classes, methods, or properties. Under the hood, they compile to wrapper functions that modify property descriptors during class definition.

### Q40: What is the Web Cryptography API?
*   **Definition:** A low-level, high-performance cryptographic API that supports secure key generation, hashing, encryption, and digital signatures.

### Q41: Explain V8 parser bytecode execution.
*   **Mechanics:** Ignition processes AST into custom, platform-independent bytecodes. The bytecode execution loop is extremely compact and optimizes registers to minimize CPU cache misses.

### Q42: What is the TC39 Stage process?
*   **Stage 0 (Strawman):** Initial discussion and ideas.
*   **Stage 1 (Proposal):** Outlines problem, solution, and high-level API shapes.
*   **Stage 2 (Draft):** Drafts formal specification language and initial implementation.
*   **Stage 3 (Candidate):** Complete spec draft. Demands initial compiler/browser implementations. No further changes.
*   **Stage 4 (Finished):** Feature is fully stable and ready to be integrated into the official ECMAScript standard.

### Q43: How do you capture unhandled promise rejections globally?
*   **Browsers:** Listen to the global window event: `window.addEventListener('unhandledrejection', event)`.
*   **Node.js:** Listen to the process event: `process.on('unhandledRejection', callback)`.

---

### Q44: Explain TypedArrays, ArrayBuffer views, and endianness handling.
*   An `ArrayBuffer` is raw fixed-length binary memory; **views** interpret it: typed arrays (`Int8Array`, `Uint32Array`, `Float64Array`) give indexed access, `DataView` gives explicit-offset reads/writes.
*   Typed arrays use the *platform's* byte order (virtually always little-endian) for their accessors; multi-byte values written via one view may misread through another without conversion.
*   `DataView` methods take an explicit littleEndian flag (`dv.getUint32(0, true)`) — the only safe way to parse network/file formats that mandate big-endian (e.g., PNG, TCP headers).
*   Advanced notes: `SharedArrayBuffer` enables cross-worker shared memory (requires COOP/COEP headers); buffers can be **detached** (transfer via `postMessage`/`structuredClone`) leaving zero-length husks — check `byteLength`; alignment matters for performance (misaligned Float64 reads deopt fast paths).

### Q45: How does backpressure work in Web Streams? Explain queuing strategies.
*   Producers can outpace consumers; **backpressure** communicates downstream slowness upstream so memory stays bounded.
*   Each `ReadableStream` carries a `queuing strategy` (`highWaterMark`): chunks count against `desiredSize`. When internal queue length exceeds HWM, `desiredSize` goes negative and the source's `pull()` stops being called — pull-style sources simply pause.
*   `pipeThrough`/`pipeTo` propagate desire through transforms: a slow `WritableStream` (its own HWM via `write()` promise resolution) stalls the transform, which stalls the reader, which pauses the producer — end-to-end pressure without buffering explosions.
*   Push-style sources (sockets, events) must observe cancellation/backpressure manually (pause socket on `pull` absence). `CountQueuingStrategy` vs `ByteLengthQueuingStrategy` choose counting units: chunks vs accumulated bytes (correct for variable-size binary streams).

### Q46: What are Proxy invariant violations? Why do certain traps throw?
*   Proxy traps must uphold the invariants of JS object semantics; breaking them throws `TypeError` even if your trap code never throws — the engine audits results against the target's truth.
*   Examples:
    1.  `get` returning a different value for a non-configurable, non-writable target property (value is frozen by spec).
    2.  `has`/`isExtensible`/`getOwnPropertyDescriptor` reporting existence/configurability inconsistently with the target.
    3.  `ownKeys` including keys not present on a non-extensible target, or omitting required ones.
    4.  `defineProperty` succeeding where the target would reject (non-extensible target).
    5.  `setPrototypeOf` violating non-extensible prototype locking.
*   Consequence for library authors (reactive frameworks): proxies over frozen/sealed objects lose power — traps throw instead of silently diverging; hence Vue 3 requires non-frozen reactive targets, and `Object.freeze(state)` becomes an escape hatch from reactivity.

---

### Q47: Explain Atomics.wait and Atomics.notify for cross-thread coordination.
*   `Atomics.wait(i32Array, index, expectedValue, timeout)` puts the current worker thread to **sleep** until another thread stores a different value at that index and calls `Atomics.notify`, or until timeout — a futex-like primitive ported from OS kernels.
*   Pattern: shared int acts as a state flag; consumers spin-wait via wait() (zero CPU vs polling loops), producers write with `Atomics.store` then wake N sleepers with notify(index, count).
*   Constraints: only allowed on `SharedArrayBuffer` views; **cannot run on the main thread** (browsers forbid blocking UI — throws), so main-thread coordination uses `Atomics.pause`-style spinning or async polling with `postMessage` fallbacks.
*   Combined with `Atomics.compareExchange` you build mutexes, condition variables, semaphores, and lock-free queues entirely over shared memory — the foundation of threaded Wasm and SharedArrayBuffer worker pools.

### Q48: What are scheduler.yield(), scheduler.postTask(), and isInputPending()?
*   The Prioritized Task Scheduling API replaces setTimeout(0)-style yielding with real priorities: `scheduler.postTask(callback, { priority: 'user-blocking' | 'user-visible' | 'background' })` plus AbortSignal support for cancellation.
*   `await scheduler.yield()` lets the event loop process higher-priority work mid-task, then resumes the continuation — crucial for long list rendering without starving input; unlike setTimeout it preserves priority ordering and doesn't dump work into the macrotask free-for-all.
*   `navigator.isInputPending()` lets eager loop processors check whether user input is queued, breaking work early to keep INP low.
*   Interview framing: these APIs operationalize Core Web Vitals work — chunking tasks while keeping input latency sub-100ms, something developers previously approximated with requestIdleCallback hacks and manual time-boxing.

### Q49: Explain import maps and module federation.
*   **Import maps** (native browser feature): JSON `<script type="importmap">` mapping bare specifiers ('lodash-es') or paths to URLs, letting browsers resolve npm-style imports without bundlers; supports scopes for per-dependency version resolution and multiple versions coexisting.
*   Use cases: CDN-driven no-build apps, gradual micro-frontends, polyfill pinning; limitations: map must load before any module fetch (blocking), no integrity-per-entry granularity beyond standard attributes.
*   **Module Federation** (Webpack 5/Rspack): runtime sharing of independently deployed bundles — a host consumes remote containers' exposed modules at execution time, sharing singletons (React!) via negotiated shared dependency versions.
*   Federation solves team-scale deployment independence (each micro-frontend ships on its own cadence) at the cost of version-skew risk, runtime failure modes across network boundaries, and harder testing matrices.

### Q50: Why are timers clamped in browsers? Explain side-channel mitigation timing.
*   Browsers clamp `setTimeout/setInterval` delays: minimum ~4ms after 5 nested levels, throttled to 1Hz+ in background tabs, and heavily clamped under battery saver or intensive throttling — protecting CPU/battery and making cross-site timing attacks noisy.
*   **Side channels**: high-resolution timers (`performance.now()` nominally microsecond-precise) enabled cache-timing attacks (Spectre-class probes measuring memory-access latencies to leak cross-origin data).
*   Mitigations shipped: precision reduction (coarsening to ~100µs or 1ms without cross-origin isolation), Site Isolation processes, and requiring COOP/COEP headers before granting `SharedArrayBuffer`/full-resolution timers — the reason those features now demand isolation.
*   Practical consequences: animation/game loops must not rely on precise short timeouts (use rAF); benchmarks need statistical repetition; security reviews treat timing as a real exfiltration channel even in "pure" JS.

---

## Coding & Implementation Challenges

### Q51: Implement a Concurrency-Limited Promise Pool.
```javascript
function limitConcurrency(tasks, limit) {
  return new Promise((resolve, reject) => {
    const results = [];
    let nextIndex = 0;
    let activeRunners = 0;
    let hasError = false;

    if (tasks.length === 0) return resolve([]);

    const maxThreads = Math.min(limit, tasks.length);

    function runNext() {
      if (nextIndex >= tasks.length) {
        if (activeRunners === 0 && !hasError) {
          resolve(results);
        }
        return;
      }
      if (hasError) return;

      const currentIndex = nextIndex;
      const task = tasks[nextIndex];
      nextIndex++;

      activeRunners++;

      task()
        .then((result) => {
          results[currentIndex] = result;
        })
        .catch((error) => {
          hasError = true;
          reject(error);
        })
        .finally(() => {
          activeRunners--;
          runNext();
        });
    }

    for (let i = 0; i < maxThreads; i++) {
      runNext();
    }
  });
}

// Verification
const mockTask = (id, ms) => () => new Promise(res => setTimeout(() => res(id), ms));
limitConcurrency([mockTask(1, 100), mockTask(2, 50), mockTask(3, 150)], 2).then(console.log); // [1, 2, 3]
```

### Q52: Implement a complete custom reactive engine mimicking Vue 3.
```javascript
let activeEffect = null;
const targetMap = new WeakMap();

function effect(fn) {
  const effectFn = () => {
    try {
      activeEffect = effectFn;
      return fn();
    } finally {
      activeEffect = null;
    }
  };
  effectFn();
}

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach((effectFn) => effectFn());
  }
}

function reactive(target) {
  if (target === null || typeof target !== "object") return target;

  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);
      const res = Reflect.get(target, key, receiver);
      return res !== null && typeof res === "object" ? reactive(res) : res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
  });
}

// Verification
const state = reactive({ count: 0 });
effect(() => console.log("State Count is:", state.count)); // Logs 0
state.count = 5; // Logs 5
```

### Q53: Implement an advanced `deepClone` function that handles circular references, Dates, RegExps, Maps, and Sets.
```javascript
function deepClone(value, hash = new WeakMap()) {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (hash.has(value)) {
    return hash.get(value);
  }

  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  if (value instanceof Set) {
    const setCopy = new Set();
    hash.set(value, setCopy);
    value.forEach((item) => setCopy.add(deepClone(item, hash)));
    return setCopy;
  }

  if (value instanceof Map) {
    const mapCopy = new Map();
    hash.set(value, mapCopy);
    value.forEach((val, key) => mapCopy.set(deepClone(key, hash), deepClone(val, hash)));
    return mapCopy;
  }

  const clone = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  hash.set(value, clone);

  Reflect.ownKeys(value).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor && (descriptor.writable || descriptor.set)) {
      clone[key] = deepClone(value[key], hash);
    } else {
      Object.defineProperty(clone, key, descriptor);
    }
  });

  return clone;
}

// Verification
const original = { a: 1 };
original.self = original;
const clone = deepClone(original);
console.log(clone.self === clone); // true (circular solved)
```

### Q54: Implement a robust Promises/A+ specifications inspired custom Promise class.
```javascript
class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (value instanceof MyPromise) {
        return value.then(resolve, reject);
      }
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        this.onFulfilledCallbacks.forEach((cb) => cb());
      }
    };

    const reject = (reason) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach((cb) => cb());
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    onRejected = typeof onRejected === "function" ? onRejected : (r) => { throw r; };

    const promise2 = new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      };

      const handleRejected = () => {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      };

      if (this.state === "fulfilled") handleFulfilled();
      else if (this.state === "rejected") handleRejected();
      else {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });

    return promise2;
  }

  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      return reject(new TypeError("Chaining cycle detected"));
    }
    if (x !== null && (typeof x === "object" || typeof x === "function")) {
      let called = false;
      try {
        const then = x.then;
        if (typeof then === "function") {
          then.call(
            x,
            (y) => {
              if (called) return;
              called = true;
              this.resolvePromise(promise2, y, resolve, reject);
            },
            (r) => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } else {
          resolve(x);
        }
      } catch (err) {
        if (called) return;
        called = true;
        reject(err);
      }
    } else {
      resolve(x);
    }
  }
}

// Verification
new MyPromise((res) => res("Done")).then(data => console.log("Promise Resolved:", data));
```

### Q55: Implement a multi-argument memoize utility with a custom hash resolver.
```javascript
function memoize(fn, resolver) {
  const cache = new Map();

  return function(...args) {
    // Generate cache key using default JSON.stringify or custom resolver
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Verification
const add = (a, b) => a + b;
const memoizedAdd = memoize(add);
console.log(memoizedAdd(1, 2)); // 3 (calculated)
console.log(memoizedAdd(1, 2)); // 3 (retrieved from cache)
```

### Q56: Implement a custom polyfill for `Object.create`.
```javascript
function myObjectCreate(proto, propertiesObject) {
  if (typeof proto !== "object" && typeof proto !== "function" && proto !== null) {
    throw new TypeError("Object prototype may only be an Object or null");
  }

  // Create temporary constructor
  function F() {}
  F.prototype = proto;
  const obj = new F();

  // If prototype is null, clean the __proto__ linkage
  if (proto === null) {
    Object.setPrototypeOf(obj, null);
  }

  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }

  return obj;
}

// Verification
const protoObj = { greet() { return "Hello"; } };
const inst = myObjectCreate(protoObj);
console.log(inst.greet()); // "Hello"
```

### Q57: Find the length of the longest substring without repeating characters (O(N) sliding window).
```javascript
function lengthOfLongestSubstring(s) {
  if (typeof s !== "string") return 0;

  let maxLength = 0;
  let start = 0;
  const charIndexMap = new Map();

  for (let end = 0; end < s.length; end++) {
    const currentChar = s[end];

    if (charIndexMap.has(currentChar)) {
      // Shrink window past the last seen index of duplicate char
      start = Math.max(start, charIndexMap.get(currentChar) + 1);
    }

    charIndexMap.set(currentChar, end);
    maxLength = Math.max(maxLength, end - start + 1);
  }

  return maxLength;
}

// Verification
console.log(lengthOfLongestSubstring("abcabcbb")); // 3 ("abc")
console.log(lengthOfLongestSubstring("bbbbb")); // 1 ("b")
```
