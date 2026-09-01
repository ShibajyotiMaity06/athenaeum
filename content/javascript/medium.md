# JavaScript - Medium Interview Questions

## Theory Questions & Answers

### Q1: Explain the Event Loop architecture in detail. Describe execution priority between Macrotasks, Microtasks, and Browser Rendering.
*   **Event Loop:** Monitors the Call Stack. If the stack is empty, it flushes the Microtask Queue before running the next Macrotask.
*   **Macrotasks:** Timer callbacks (`setTimeout`, `setInterval`), I/O, UI rendering events, `setImmediate` (Node).
*   **Microtasks:** High-priority callbacks (`Promise.then/catch/finally`, `MutationObserver`, `queueMicrotask`, `process.nextTick` in Node).
*   **Execution Priority:** 
    1. Run a single Macrotask (e.g., initial script file execution).
    2. Run **all** microtasks in the Microtask Queue until it is completely empty. New microtasks added during execution are also run in the same cycle.
    3. Perform browser rendering updates (layout, paint, style recalculation) if a frame refresh is scheduled.
    4. Move to the next Macrotask in the queue.

### Q2: How does Prototypal Inheritance work? Compare `__proto__` and `prototype`.
*   **Prototypal Inheritance:** Objects inherit properties and methods from other objects via a prototype chain. When accessing a property, JS travels up `__proto__` links until it finds the property or reaches `null`.
*   **`__proto__`:** An accessor property on object instances pointing to their active prototype link (used for runtime lookup).
*   **`prototype`:** A property that exists **only** on constructor functions and classes. It becomes the `__proto__` of any instance created with `new`.
*   **ES6 Classes compilation:** Syntactic sugar over prototype delegation. It compiles to constructor functions with methods attached to `.prototype`.

### Q3: How is the `this` keyword resolved at runtime? List the exact priority rules.
*   **Definition:** `this` refers to the execution context. Its value is determined at call-time based on the following rules:
    1.  **`new` Binding:** If called with `new`, `this` points to the new instance.
    2.  **Explicit Binding:** If called with `.call()`, `.apply()`, or `.bind()`, `this` points to the specified object.
    3.  **Implicit Binding:** If called as a method (e.g., `obj.method()`), `this` points to `obj`.
    4.  **Default Binding:** If called stand-alone, `this` is `undefined` in strict mode, or the global object (`window`/`global`) in non-strict mode.
    5.  **Arrow Functions:** Bypass these rules; they inherit `this` lexically from their outer block scope.

### Q4: Explain Lexical Scoping and Closures under the hood. How does the execution context maintain references?
*   **Lexical Scoping:** The scope of a variable is determined by its physical position in the source code during compiling, not execution.
*   **Execution Context:** Consists of a **Variable Environment** and a **Lexical Environment**. When a function is invoked, its execution context is pushed onto the call stack.
*   **Closure under the hood:** When a function returns an inner function, the inner function holds a reference to the outer Lexical Environment via `[[Scopes]]`. This prevents the garbage collector from freeing the memory of the outer environment, maintaining access to outer variables.

### Q5: What is Currying? How does it differ from Partial Application?
*   **Currying:** A functional programming pattern that transforms a function taking multiple arguments `f(a, b, c)` into a chain of nested unary functions returning one another, e.g., `f(a)(b)(c)`.
*   **Partial Application:** Fixing a subset of arguments on a function, returning a new function that takes the *remaining* arguments, e.g., converting `f(a, b, c)` into `g(b, c)` by pre-filling `a`.

### Q6: What are Generators and Iterators in JavaScript? Detail the custom iteration contract.
*   **Iterator:** An object implementing a `next()` method returning `{ value: any, done: boolean }`.
*   **Iterable:** An object implementing `[Symbol.iterator]` that returns an Iterator.
*   **Generator:** Declared with `function*`. Returns a Generator Object that adheres to both iterable and iterator contracts.
*   **Execution Suspension:** Using the `yield` keyword, a generator suspends execution context, yielding a value, and resumes only when `.next()` is called.

### Q7: Explain the difference between `Promise.all()`, `Promise.allSettled()`, `Promise.race()`, and `Promise.any()`.
*   **Promise.all(iterable):** Resolves when **all** promises resolve (returns array of results). Rejects instantly if **any** single promise rejects.
*   **Promise.allSettled(iterable):** Resolves when **all** promises have settled (either resolved or rejected). Returns an array of objects detailing the status and value/reason of each.
*   **Promise.race(iterable):** Settles as soon as the **first** promise settles (resolves or rejects).
*   **Promise.any(iterable):** Resolves as soon as the **first** promise resolves. Rejects with an `AggregateError` only if **all** promises reject.

### Q8: How does `async/await` work under the hood?
*   **Mechanism:** Syntactic sugar built on top of **Generators** and **Promises**.
*   **Compilation:** The compiler transforms an `async` function into a generator function. The `await` keyword acts as a `yield` point, stopping execution until the yielded Promise resolves, which then calls `.next()` automatically.
*   **Error Handling:** Permits standard synchronous `try/catch` syntax for handling asynchronous rejections.

### Q9: Why does a failed `fetch()` call not trigger a Promise rejection on HTTP errors like 404 or 500?
*   **Reason:** The Promise returned by `fetch()` only rejects on network failures or blocking issues (e.g., DNS lookup failure, CORS violations).
*   **Handling HTTP errors:** An HTTP response of 404 or 500 still completes a successful request cycle. Developers must check the `response.ok` property (which is `true` for 2xx statuses) to identify HTTP-level errors.

### Q10: Compare ES6 Modules (ESM) and CommonJS (CJS).
*   **CommonJS (Node default):** Synchronous loading. Uses `require()` and `module.exports`. Executed at runtime. Imports are copied values.
*   **ES6 Modules:** Asynchronous loading. Uses `import` and `export`. Analyzed statically at compile time (enables tree-shaking). Imports are read-only live bindings (reference links to exported values).

### Q11: Explain dynamic imports `import()` and their use cases.
*   **Definition:** An asynchronous module loading syntax returning a Promise.
*   **Use Cases:** Code-splitting, loading modules conditionally at runtime, reducing initial script bundle sizes, and lazy-loading routes or components.

### Q12: How are variables allocated in the Heap vs. the Stack inside a JS engine?
*   **Stack:** Holds primitive values and reference pointers. Fast allocation, limited capacity, LIFO order. Memory freed automatically upon execution frame exit.
*   **Heap:** Holds complex reference objects (objects, arrays, functions). Large capacity, slower access time. Memory reclaimed later by garbage collection algorithms.

### Q13: Compare `localStorage`, `sessionStorage`, and `cookies`.
| Feature | `localStorage` | `sessionStorage` | `cookies` |
| :--- | :--- | :--- | :--- |
| **Capacity** | ~5MB | ~5MB | ~4KB |
| **Lifetime** | Persistent until cleared | Tab session closure | Manual expiration date |
| **Sent to Server** | No | No | Yes, automatically on every HTTP request |
| **Security** | Susceptible to XSS | Susceptible to XSS | Can be protected with `HttpOnly` and `Secure` flags |

### Q14: Explain Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF). How do you mitigate them in JavaScript?
*   **XSS:** Attacker injects malicious scripts into trusted websites.
    *   *Mitigation:* Sanitize and escape all user input; use `textContent` instead of `innerHTML`; set a strong Content Security Policy (CSP).
*   **CSRF:** Attacker tricks a user's browser into executing unwanted actions on an authenticated app.
    *   *Mitigation:* Use anti-CSRF tokens in forms and AJAX headers; set cookie flag `SameSite=Strict` or `Lax`.

### Q15: Explain the Same-Origin Policy (SOP) and Cross-Origin Resource Sharing (CORS).
*   **SOP:** A critical security mechanism that prevents a script loaded on one origin (domain, protocol, port) from reading data from another origin.
*   **CORS:** A protocol that uses HTTP headers (e.g., `Access-Control-Allow-Origin`) to let a server explicitly permit resource requests originating from different domains, bypassing SOP restrictions safely.

### Q16: Compare script loading tags: standard, `async`, and `defer`.
*   **Standard (`<script src="...">`):** Blocks HTML parsing immediately. Fetches and executes script, then resumes HTML parsing.
*   **async:** HTML parsing is done in parallel with fetching the script. Once fetched, the script executes immediately, blocking HTML parsing. Execution order is non-guaranteed.
*   **defer:** HTML parsing is done in parallel with fetching. Script execution is deferred until HTML parsing is fully complete. Guarantees file execution order.

### Q17: What is the purpose of `DocumentFragment`?
*   **Definition:** A lightweight document object that stores a segment of DOM nodes. It is not part of the active DOM tree.
*   **Performance Benefit:** Appending children to `DocumentFragment` does not trigger DOM layout reflows or repaints. Once built, inserting the fragment into the actual DOM performs all inserts in a single layout update.

### Q18: What is Shadow DOM and how is it used?
*   **Shadow DOM:** A Web Component specification that provides encapsulated styling and markup DOM trees isolated from the main document DOM.
*   **Benefit:** Prevents styling bleed: CSS styles defined inside a Shadow DOM do not leak out, and page CSS styles do not interfere with Shadow elements.

### Q19: What is dynamic scope vs. lexical scope in Javascript?
*   **Dynamic Scope:** Variable lookup depends on the execution call stack (where the function was called). JavaScript does **not** have dynamic scoping.
*   **Lexical Scope:** Variable lookup depends on where variables and functions are defined in the physical source code (lexical structure).

### Q20: Compare `Object.assign()` and the Spread operator for object replication.
*   **Similarity:** Both perform a shallow copy of properties.
*   **Differences:**
    *   `Object.assign(target, source)` triggers setter functions on the target object. It modifies the target in-place.
    *   The Spread operator (`{...source}`) creates a completely new literal object without invoking setters. It is cleaner and more declarative.

### Q21: What are Symbols in JavaScript? Explain their uniqueness and key use cases.
*   **Definition:** A primitive data type returning a unique token. No two symbols are identical, even with the same descriptions (`Symbol('x') !== Symbol('x')`).
*   **Use Cases:** Defining private-like keys on objects that will not collide with other property keys, and preventing properties from being accessed during loops like `for...in` or standard serializations.

### Q22: What are Well-Known Symbols? Give two examples.
*   **Definition:** Pre-defined system symbols exposed by JavaScript to hook into internal language behaviors.
*   **Symbol.iterator:** A well-known symbol that makes an object iterable when assigned a generator or iterator function.
*   **Symbol.toStringTag:** Customizes the default string output returned by `Object.prototype.toString.call()`.

### Q23: Why are Bitwise Operations rarely used in daily JavaScript? What is an edge case?
*   **Reason:** JavaScript stores all numbers as 64-bit double-precision floating-point numbers. Bitwise operations coerce numbers to signed 32-bit integers, perform the bit operations, and convert them back. This introduces execution overhead.
*   **Edge Case:** Checking flag combinations (e.g., file permissions or canvas operations) where compact masks are optimal.

### Q24: What is Function Memoization?
*   **Definition:** An optimization technique that caches the return value of a pure function based on its input arguments, avoiding redundant CPU computations on identical inputs.
*   **Example:** A wrapper that saves arguments as cache keys in an internal `Map` object.

### Q25: How do you make a plain Object iterable?
*   **Mechanism:** Define a method key `[Symbol.iterator]` on the object that returns a valid iterator object containing a `next()` method, or define it as a generator function `*[Symbol.iterator]() { yield ... }`.

### Q26: Explain memory management differences between standard collections and Weak collections.
*   **Standard Collections (`Map`, `Set`):** Hold strong references to keys/values. If a key is an object, it cannot be garbage-collected even if all external references are deleted.
*   **Weak Collections (`WeakMap`, `WeakSet`):** Hold weak references to key objects. When all external references to a key object are gone, the garbage collector automatically reclaims the object and deletes its entry.

### Q27: How does `instanceof` check objects across different iframe environments?
*   **Limit:** `instanceof` can fail. Every iframe has its own execution context with distinct global built-in constructors (e.g., `Array` in `iframeA` !== `Array` in `iframeB`).
*   **Fix:** Use class identification strings: `Object.prototype.toString.call(value) === '[object Array]'`.

### Q28: What is the difference between Packed arrays and Holey arrays in the V8 engine?
*   **Packed Arrays:** Arrays containing contiguous elements with no empty indices. Highly optimized by the JIT compiler.
*   **Holey Arrays:** Arrays containing empty spots/gaps (e.g., `const a = []; a[10] = 'x'`). V8 must search down the prototype chain to verify missing values, degrading execution speed.

### Q29: Compare dynamic parameter defaults vs. static destructuring defaults.
*   **Parameter Defaults:** `function fn(x = 1) {}` binds default values if arguments are missing or explicitly `undefined`.
*   **Destructuring Defaults:** `const { x = 1 } = obj` binds default values to variables if the matching object property is `undefined`. Both respect `undefined` but fail to trigger on `null`.

### Q30: What is the Form ValidityState API?
*   **Definition:** A standard interface exposed on HTML input elements (`input.validity`) providing boolean fields indicating validation failure states (e.g., `valueMissing`, `typeMismatch`, `patternMismatch`).

### Q31: How do you catch asynchronous errors thrown inside a `setTimeout` function?
*   **Limit:** A `try/catch` block wrapping `setTimeout` cannot catch errors thrown inside its callback. The callback runs inside a fresh execution stack after the synchronous block completes.
*   **Fix:** Place the `try/catch` block inside the async callback function itself, or return a Promise wrapper and handle errors using `.catch()`.

### Q32: Explain `console.table`, `console.time`, and `console.assert`.
*   **console.table():** Renders an array of objects or objects as a tabular grid, simplifying property inspections.
*   **console.time() / console.timeEnd():** Triggers and stops a high-resolution execution timer to measure code speed.
*   **console.assert(condition, message):** Logs the message to the console only if the passed condition evaluates to `false`.

### Q33: How does the `new` operator instantiate objects under the hood?
*   When executing `new Constructor()`:
    1. Creates a new, blank plain JavaScript object.
    2. Links this object's prototype (`__proto__`) to the constructor function's `prototype` property.
    3. Binds the constructor's `this` context to the newly created object and executes the constructor code.
    4. Returns the object unless the constructor function explicitly returns another non-primitive object.

### Q34: What is Object composition? Why is it preferred over inheritance?
*   **Composition:** Combining distinct, smaller functional objects to build complex behaviors (e.g., "has-a" relationships).
*   **Inheritance:** Extending parent classes to inherit behaviors (e.g., "is-a" relationships).
*   **Preference:** Composition prevents deep, fragile class hierarchies and avoids inheritance pollution.

### Q35: What are custom events in JavaScript? How do you create and trigger them?
*   **Definition:** Dynamic event objects created by the developer to trigger non-standard event routines.
*   **Code:**
    ```javascript
    const event = new CustomEvent("userLogin", { detail: { name: "Bob" } });
    element.dispatchEvent(event);
    ```

### Q36: Explain currying function performance and memory implications.
*   **Implication:** Currying heavily relies on closures. Each nested function maintains access to its outer lexical environment, holding references in memory. Excessive nesting can increase memory consumption if functions are retained in active scopes.

### Q37: What is the difference between shallow freezing and deep freezing an object?
*   **Shallow Freezing (`Object.freeze`):** Freezes only the top-level keys. Nested child objects can still be modified.
*   **Deep Freezing:** Recursively traverses all nested object properties and freezes each level to prevent modifications down the entire structure.

### Q38: Explain the `super` keyword inside Javascript subclasses.
*   **Use Cases:**
    *   Inside constructors: `super(...args)` invokes the parent class constructor and must be called before accessing `this`.
    *   Inside methods: `super.methodName()` references and invokes methods on the parent class.

### Q39: What is method chaining? How is it implemented in JavaScript classes?
*   **Definition:** Invoking multiple methods on a single object in a continuous statement (e.g., `obj.setVal(5).calc()`).
*   **Implementation:** Every chain-capable method in the class must return `this` (the object instance) at the end of its execution block.

### Q40: What is raw performance impact of `eval()`? Why is its usage discouraged?
*   **Performance:** `eval()` forces the JIT compiler to halt optimizations. It cannot predict variables or scopes, dropping back to slower interpreted execution.
*   **Security:** High vulnerability to script injection attacks if user inputs are parsed through it.

### Q41: Explain `globalThis`. Why was it introduced?
*   **Definition:** A universal built-in variable pointing to the global environment container.
*   **Purpose:** Standardizes accessing the global object across different environments (browsers use `window`/`self`, Node.js uses `global`, web workers use `self`).

### Q42: What is dynamic object property naming?
*   **Definition:** Defining object literal properties dynamically at declaration using square brackets containing an expression.
    ```javascript
    const key = "name";
    const user = { [key]: "Alice" };
    ```

### Q43: How does `navigator.sendBeacon()` work? When should it be used?
*   **Definition:** An asynchronous method to transmit small chunks of diagnostic data to a web server over HTTP.
*   **Use Cases:** Sending analytic telemetry during page unload events. It guarantees delivery without delaying page transitions or blocking browser unload pipelines.

---

### Q44: How does error propagation work through Promise chains?
*   Each `.then(onFulfilled, onRejected)` returns a **new** promise; a rejection flows down the chain skipping every `onFulfilled` until the first rejection handler appears - afterwards the chain resumes normally (the rejection is considered handled and downstream receives that handler's return value).
*   Errors thrown synchronously inside handlers convert into rejections of the next link, so `throw` composes uniformly with async failures.
*   Placement matters: `.catch()` recovers only upstream failures; steps chained after it always run. Multiple sibling `.catch` calls on the same promise do not chain - attach one terminal handler per branch.
*   Anti-patterns: swallowing errors by returning a value from catch without re-throwing when recovery is impossible; forgetting to `await` async functions inside handlers (their rejection becomes `unhandledrejection`); mixing callbacks and promises in one flow.

### Q45: How does AbortController cancel fetch operations? Detail the flow.
```js
const ctrl = new AbortController();
fetch('/api/search', { signal: ctrl.signal })
  .catch(e => { if (e.name === 'AbortError') { /* expected */ } });
ctrl.abort('user navigated away');
```
*   The controller owns an `AbortSignal`; passing `signal` links the request. Calling `abort()` rejects the pending promise immediately and stops the body download - critical for typeahead cancellation and React unmount cleanup (saves bandwidth, battery, server load).
*   One signal can serve many operations: `addEventListener('abort', ...)` listeners, streams, and event handlers all honor it - a single switch cancels a whole logical unit of work.
*   Modern helpers: `AbortSignal.timeout(ms)` builds auto-aborting signals for deadlines; `signal.throwIfAborted()` lets hand-rolled async code participate in cancellation; the optional `abort(reason)` surfaces through `signal.reason` for richer diagnostics.

### Q46: Debounce vs throttle - compare precisely and give use cases.
*   **Debounce**: fires only after activity *stops* for N ms; every incoming event resets the timer → exactly-once-at-the-end behavior. Use: search-as-you-type API calls, autosave, resize-end recalculations.
*   **Throttle**: fires at most once per N ms window while events keep arriving (leading/trailing edge variants) → periodic sampling under sustained load. Use: scroll/pointermove handlers, analytics batching, drag tracking.
*   Decision rule: "I only care about the final settled state" → debounce; "I need regular updates during continuous activity" → throttle.
*   Implementation cores differ: debounce keeps one timeout handle and clears+resets it; throttle compares timestamps or uses a boolean lock released by a scheduled timeout. Production utilities also preserve `this`/arguments and expose `.cancel()/.flush()`.

---

### Q47: What happens during a recursion stack overflow? How do trampolines help?
*   Every synchronous call pushes a frame (locals + return address) onto the fixed-size call stack (~10-15k frames deep typically). Exhaustion throws `RangeError: Maximum call stack size exceeded`.
*   Mitigations:
    1.  **Rewrite iteratively** using an explicit loop/stack data structure.
    2.  **Trampoline**: the recursive function returns a *thunk* (`() => nextStep`) instead of calling directly; a driver loop invokes thunks until a real value appears - stack depth stays constant because each thunk returns before the next executes.
    ```js
    const trampoline = fn => (...args) => {
      let result = fn(...args);
      while (typeof result === 'function') result = result();
      return result;
    };
    ```
    3.  **Generators/async boundaries**: yielding or awaiting between steps drains queues and resets frames naturally.
*   Note: ES6-specified proper tail calls would remove the need for self-recursion, but only JavaScriptCore (Safari) ships it - V8/SpiderMonkey intentionally did not, citing debugging/stacktrace costs.

### Q48: Explain function composition and pipe utilities.
*   **Composition** builds pipelines from single-purpose functions: `compose(f, g)(x) = f(g(x))` (right-to-left, math convention); `pipe(f, g)(x) = g(f(x))` (left-to-right reading order).
```js
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const slugify = pipe(str => str.trim(), s => s.toLowerCase(), s => s.replace(/\s+/g, '-'));
```
*   Benefits: declarative data flow, trivially testable units, no intermediate variables, mirrors Unix pipes.
*   Advanced concerns: stages are expected to be unary - multi-argument steps break the chain (curry them or pass tuples); async composition requires reducing over promise chains; debugging benefits from `tap`/logging stages inserted mid-pipeline.

### Q49: How do you design custom Error classes properly?
```js
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';   // survives minification
    this.status = status;
    this.details = details;
    if (Error.captureStackTrace) Error.captureStackTrace(this, HttpError);
  }
}
```
*   Extend `Error` rather than plain objects to preserve `.stack`, correct `instanceof`, and console rendering.
*   Set `this.name` explicitly (default would be "Error" once transpiled); attach machine-readable fields (`status`, `code`) so handlers branch on type, not message strings.
*   Consider an error taxonomy: base AppError → HttpError / ValidationError / DomainError, enabling centralized middleware mapping (error → HTTP status) and safe client-facing messages.
*   When rethrowing/wrapping, preserve cause chains (`{ cause: err }` option in ES2022) instead of losing the original stack.

### Q50: How do circular imports behave in ES Modules?
*   ESM links modules via live bindings before evaluation; circular references are therefore legal but can observe **partially evaluated** modules.
*   Execution order: depth-first traversal of the module graph runs bodies once each; on a cycle, the entry that started traversal resumes first, so the other module sees its exports as TDZ bindings (`let/const/class`) or default-initialized (`function` declarations hoisted fully).
*   Classic symptom: `Cannot access 'X' before initialization` when module A's top-level code *uses* B's const during A's own evaluation, while B imports back from A. Function declarations survive cycles because they're initialized early.
*   Fixes: extract shared logic into a third module (dependency inversion), defer usage inside functions (call time > eval time), or convert one direction into dependency injection. Bundlers warn but cannot always fix semantic hazards.

---

## Coding & Implementation Challenges

### Q51: Implement a custom polyfill for `Promise.all`.
```javascript
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    // Handle iterable non-arrays safely
    const arrayPromises = Array.from(promises);
    const results = [];
    let completedCount = 0;

    if (arrayPromises.length === 0) {
      return resolve([]);
    }

    arrayPromises.forEach((promise, index) => {
      // Resolve wrapping values that are not native promises
      Promise.resolve(promise)
        .then((value) => {
          results[index] = value;
          completedCount++;
          if (completedCount === arrayPromises.length) {
            resolve(results);
          }
        })
        .catch(reject); // Reject immediately on any error
    });
  });
}

// Verification
const p1 = Promise.resolve(10);
const p2 = 20;
const p3 = new Promise((res) => setTimeout(() => res(30), 100));
myPromiseAll([p1, p2, p3]).then(console.log); // [10, 20, 30]
```

### Q52: Implement a custom polyfill for `Promise.race`.
```javascript
function myPromiseRace(promises) {
  return new Promise((resolve, reject) => {
    for (const promise of promises) {
      Promise.resolve(promise).then(resolve, reject);
    }
  });
}

// Verification
const delay = (ms, val) => new Promise(res => setTimeout(() => res(val), ms));
myPromiseRace([delay(100, "slow"), delay(50, "fast")]).then(console.log); // "fast"
```

### Q53: Implement a custom polyfill for `Promise.allSettled`.
```javascript
function myPromiseAllSettled(promises) {
  return new Promise((resolve) => {
    const arrayPromises = Array.from(promises);
    const results = [];
    let completedCount = 0;

    if (arrayPromises.length === 0) {
      return resolve([]);
    }

    arrayPromises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((value) => {
          results[index] = { status: "fulfilled", value };
        })
        .catch((reason) => {
          results[index] = { status: "rejected", reason };
        })
        .finally(() => {
          completedCount++;
          if (completedCount === arrayPromises.length) {
            resolve(results);
          }
        });
    });
  });
}

// Verification
myPromiseAllSettled([Promise.resolve(1), Promise.reject("error")]).then(console.log);
// [{status: "fulfilled", value: 1}, {status: "rejected", reason: "error"}]
```

### Q54: Implement a custom polyfill for `Function.prototype.bind`.
```javascript
Function.prototype.myBind = function(context, ...boundArgs) {
  const targetFn = this;
  if (typeof targetFn !== "function") {
    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
  }

  return function BoundFunction(...activeArgs) {
    if (this instanceof BoundFunction) {
      return new targetFn(...boundArgs, ...activeArgs);
    }
    return targetFn.apply(context, [...boundArgs, ...activeArgs]);
  };
};

// Verification
const obj = { num: 42 };
function getNum(prefix) { return `${prefix}: ${this.num}`; }
const bound = getNum.myBind(obj, "Value");
console.log(bound()); // "Value: 42"
```

### Q55: Implement a recursive depth-based Array Flattener.
```javascript
function flattenArray(arr, depth = 1) {
  if (depth < 1) return arr.slice();

  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) {
      acc.push(...flattenArray(val, depth - 1));
    } else {
      acc.push(val);
    }
    return acc;
  }, []);
}

// Verification
const nested = [1, [2, [3, [4]]]];
console.log(flattenArray(nested, 2)); // [1, 2, 3, [4]]
```

### Q56: Implement a basic Pub/Sub Event Emitter class.
```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  subscribe(eventName, fn) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName).add(fn);

    // Return unsubscribe function
    return () => {
      const subs = this.events.get(eventName);
      if (subs) {
        subs.delete(fn);
        if (subs.size === 0) this.events.delete(eventName);
      }
    };
  }

  emit(eventName, ...args) {
    const subs = this.events.get(eventName);
    if (subs) {
      subs.forEach((fn) => fn(...args));
    }
  }
}

// Verification
const emitter = new EventEmitter();
const unsub = emitter.subscribe("greet", name => console.log(`Hello, ${name}`));
emitter.emit("greet", "Alice"); // "Hello, Alice"
unsub();
emitter.emit("greet", "Bob"); // No log
```

### Q57: Implement a simple Object deep clone utility (basic version, handles arrays and nesting).
```javascript
function simpleDeepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => simpleDeepClone(item));
  }

  const copy = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = simpleDeepClone(obj[key]);
    }
  }
  return copy;
}

// Verification
const original = { a: 1, b: { c: 2 } };
const clone = simpleDeepClone(original);
clone.b.c = 99;
console.log(original.b.c); // 2 (independent)
```
