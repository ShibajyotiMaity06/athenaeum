# JavaScript - Basic Interview Questions

## Theory Questions & Answers

### Q1: Explain the differences between Primitive and Reference types. How are they stored in memory, and how does `typeof` differ from `instanceof`?
*   **Primitive Types:** `undefined`, `null`, `boolean`, `number`, `string`, `symbol`, and `bigint`. Stored **directly in the stack** memory. They are immutable and compared by value.
*   **Reference Types:** Objects, arrays, functions, maps, and sets. Stored in the **heap memory**; the variable in the stack holds a pointer/reference to the heap location. They are mutable and compared by reference pointer.
*   **typeof:** An operator that returns a string representing the data type of an unevaluated operand. Best for primitives (e.g., `typeof "hello" === "string"`), but returns `"object"` for `null`, arrays, and plain objects.
*   **instanceof:** An operator that tests whether the prototype property of a constructor appears anywhere in the prototype chain of an object (e.g., `arr instanceof Array === true`). Only works for objects/reference types.

### Q2: What is Scope in JavaScript? Compare Global, Function, and Block scopes.
*   **Scope:** Determines the accessibility (visibility) of variables within different parts of the code.
*   **Global Scope:** Variables declared outside any function or block. Accessible from anywhere in the application.
*   **Function (Local) Scope:** Variables declared inside a function (using `var`, `let`, or `const`). Accessible only within that function.
*   **Block Scope:** Variables declared inside a block `{}` using `let` or `const`. They cannot be accessed outside that block. `var` does not respect block scope.

### Q3: Explain Hoisting and the Temporal Dead Zone (TDZ).
*   **Hoisting:** The default behavior of the JS interpreter where variable and function declarations are moved to the top of their containing scope before code execution.
*   **var hoisting:** Initialized with `undefined`. Accessible before declaration.
*   **let/const hoisting:** Hoisted but **not initialized**. Accessing them before declaration throws a `ReferenceError`.
*   **Function hoisting:** Full function declarations are hoisted, making them callable before their definition in the code. Function expressions are not.
*   **Temporal Dead Zone (TDZ):** The period between block entry and variable initialization where accessing a `let` or `const` variable throws a `ReferenceError`.

### Q4: Compare `var`, `let`, and `const` in terms of scoping, hoisting, and re-assignment.
| Feature | `var` | `let` | `const` |
| :--- | :--- | :--- | :--- |
| **Scope** | Function scope | Block scope | Block scope |
| **Hoisting** | Yes (initialized as `undefined`) | Yes (uninitialized, TDZ active) | Yes (uninitialized, TDZ active) |
| **Re-assignment** | Allowed | Allowed | Not Allowed |
| **Redeclaration** | Allowed within same scope | Not Allowed | Not Allowed |

### Q5: What is a Closure? Provide a short example of why it is useful.
*   **Closure:** A function that retains access to its lexical scope (outer variables) even when the function is executed outside that scope.
*   **Mechanism:** Created automatically when an inner function is defined inside an outer function, capturing the outer function's environment.
*   **Use Cases:** Data privacy/encapsulation (private variables), state maintenance, currying, and memoization.
*   **Example:**
    ```javascript
    function createCounter() {
      let count = 0;
      return () => ++count;
    }
    const counter = createCounter();
    console.log(counter()); // 1
    console.log(counter()); // 2
    ```

### Q6: Compare Arrow Functions and Regular Functions.
*   **this binding:** Regular functions have a dynamic `this` bound to the caller. Arrow functions have a lexical `this` inherited from their enclosing scope.
*   **arguments object:** Regular functions have access to the local `arguments` object. Arrow functions do not (use rest parameters instead).
*   **Constructor capability:** Regular functions can be called with `new` (as constructors). Arrow functions cannot and will throw a `TypeError`.
*   **prototype property:** Regular functions possess a `prototype` property. Arrow functions do not.

### Q7: Describe Event Propagation: Bubbling, Capturing, and Target phases.
*   **Capturing Phase:** Event travels down from the `window` through the DOM tree to the target element. Registers with `addEventListener(..., true)`.
*   **Target Phase:** Event reaches the actual element on which the user triggered the action.
*   **Bubbling Phase:** Event bubbles up from the target element back up to the `window` (default behavior). Registers with `addEventListener(..., false)`.

### Q8: Compare `event.stopPropagation()`, `event.stopImmediatePropagation()`, and `event.preventDefault()`.
*   **stopPropagation():** Stops the event from bubbling up or capturing down further in the DOM tree, but lets other handlers on the same element execute.
*   **stopImmediatePropagation():** Stops the event propagation and immediately prevents any other event listeners registered for the same event on the same element from running.
*   **preventDefault():** Cancels the default action belonging to the event (e.g., stops a form submit or a link navigation) but does not stop propagation.

### Q9: What is Event Delegation and what are its advantages?
*   **Event Delegation:** A pattern of attaching a single event listener to a common parent element instead of attaching multiple listeners to individual child nodes.
*   **Mechanism:** Relies on event bubbling. The parent handler inspects `event.target` to identify which child was clicked.
*   **Advantages:**
    *   Saves memory by reducing the total number of event listeners.
    *   Handles dynamically added children automatically without re-binding listeners.

### Q10: Compare `null` and `undefined`.
*   **undefined:** Means a variable has been declared but has not yet been assigned a value. It is of type `"undefined"`.
*   **null:** An intentional assignment representing the complete absence of any object value. It is of type `"object"` (a historical JS bug).
*   **Equality:** `null == undefined` is `true` (loose equality checks value), but `null === undefined` is `false` (strict equality checks type and value).

### Q11: Explain the difference between `==` (Loose Equality) and `===` (Strict Equality).
*   **== (Loose):** Compares values for equality after performing implicit type conversion (coercion) if types differ.
*   **=== (Strict):** Compares both the type and the value without coercion. If types differ, it returns `false` immediately.
*   *Best Practice:* Always use `===` to prevent unexpected bugs caused by JS coercion rules.

### Q12: What is Implicit Type Coercion in JavaScript? Provide examples of numeric and string coercion.
*   **Coercion:** The automatic conversion of values from one data type to another during operations.
*   **String Coercion (Addition):** The binary `+` operator coerces operands to strings if any operand is a string.
    ```javascript
    "5" + 3 // "53"
    ```
*   **Numeric Coercion (Subtraction/Multiplication):** Other mathematical operators (`-`, `*`, `/`) coerce values to numbers.
    ```javascript
    "5" - 3 // 2
    true + 1 // 2 (true coerces to 1)
    ```

### Q13: What are Truthy and Falsy values? List the exact Falsy values in JavaScript.
*   **Falsy Values:** Values that evaluate to `false` in a boolean context. There are exactly 8 falsy values:
    1. `false`
    2. `0` (and `-0`)
    3. `0n` (BigInt zero)
    4. `""` (Empty string)
    5. `null`
    6. `undefined`
    7. `NaN`
    8. `document.all` (host-specific)
*   **Truthy Values:** Any value not explicitly in the falsy list (including empty arrays `[]`, empty objects `{}`, and the string `"false"`).

### Q14: Explain `NaN`. How do you check if a value is `NaN` safely?
*   **NaN (Not-a-Number):** A special property of the global object representing an undefined or unrepresentable numerical calculation (e.g., `0 / 0`, `parseInt("abc")`). It is of type `"number"`.
*   **Equality Oddity:** `NaN` is the only value in JavaScript that is not equal to itself (`NaN === NaN` is `false`).
*   **Checking safely:**
    *   `isNaN(val)`: Coerces the value to a number first, returning `true` for `"abc"` (unsafe).
    *   `Number.isNaN(val)`: Checks strictly if the value is a number type and is `NaN` (safe).
    *   `Object.is(val, NaN)`: Returns `true` if the value is strictly `NaN`.

### Q15: What is an Immediately Invoked Function Expression (IIFE)? Why is it used?
*   **IIFE:** A function expression that runs immediately as soon as it is defined.
*   **Syntax:**
    ```javascript
    (function() {
      // code
    })();
    ```
*   **Purpose:** To create a local scope, preventing variables from polluting the global scope, especially in legacy environments before block-scoped `let` and `const` were introduced.

### Q16: What is a Higher-Order Function? Give a brief explanation and example.
*   **Definition:** A function that accepts other functions as arguments, returns a function, or both.
*   **Example:** Array methods like `map`, `filter`, and `reduce`, or standard decorator functions.
    ```javascript
    const multiplyBy = (factor) => (num) => num * factor;
    const double = multiplyBy(2);
    console.log(double(5)); // 10
    ```

### Q17: Compare Function Declarations and Function Expressions.
*   **Function Declaration:**
    ```javascript
    function greet() { return "Hi"; }
    ```
    Fully hoisted. Can be called before it is defined.
*   **Function Expression:**
    ```javascript
    const greet = function() { return "Hi"; };
    ```
    Hoisted based on its variable declarator (`let`, `const`, `var`). Cannot be called before assignment.

### Q18: How do you check if a variable is an Array in JavaScript? Why is `typeof` insufficient?
*   **Why `typeof` fails:** `typeof []` returns `"object"` because arrays are structurally built on objects.
*   **Correct approaches:**
    *   `Array.isArray(variable)`: Standard, modern built-in check (Returns `true`).
    *   `variable instanceof Array`: Valid, but can fail when dealing with variables crossing different browser iFrames (different execution contexts).
    *   `Object.prototype.toString.call(variable) === "[object Array]"`: Universal legacy fallback.

### Q19: What is "use strict"? Name three major restrictions it enforces.
*   **use strict:** A directive that enables strict mode, enforcing cleaner, more secure JavaScript execution.
*   **Restrictions:**
    1. Prevents accidental globals: Writing `x = 10` without declaration throws an error.
    2. Eliminates silent failures: Throws errors on writing to read-only properties or deleting undeletable properties.
    3. Secures `this`: Standalone function calls resolve `this` to `undefined` rather than the global `window`.
    4. Disallows duplicate parameter names: e.g., `function sum(a, a) {}` is a syntax error.

### Q20: What are Pure Functions? Why are they highly favored in modern JS architectures?
*   **Pure Function:** A function that:
    1. Given the same inputs, always returns the exact same output.
    2. Produces no side effects (does not alter external state, API records, global variables, or input parameters).
*   **Benefits:** Highly predictable, easily testable, cacheable (memoization-friendly), and concurrent-safe.

### Q21: What is the `arguments` object inside regular functions?
*   **Arguments Object:** An array-like, iterable object accessible inside all non-arrow functions containing the values of the arguments passed to that function.
*   **Limitations:** It lacks built-in array methods like `map`, `filter`, or `forEach`.
*   **Modern Alternative:** Use the rest parameter syntax `(...args) => {}`, which yields a real, usable array.

### Q22: Compare the Spread operator and the Rest parameter.
*   **Spread Operator (`...`):** Expands elements of an iterable (like an array or object) into individual elements or keys. Used during assignment or call arguments.
    ```javascript
    const arr = [...oldArr, 4, 5];
    ```
*   **Rest Parameter (`...`):** Collects multiple function arguments into a single, structured array. Used in function parameter declarations.
    ```javascript
    function sum(...nums) { return nums.reduce((a, b) => a + b); }
    ```

### Q23: How do you verify if an object has a specific property?
*   **`in` operator:** Checks the object and its prototype chain.
    ```javascript
    "prop" in obj // true/false
    ```
*   **`hasOwnProperty(prop)`:** Checks only the object's direct properties (ignores prototypes). Can fail if the object was created with `Object.create(null)` (no prototype).
*   **`Object.hasOwn(obj, prop)`:** Safe, modern static method replacing `hasOwnProperty`. Works on all objects.

### Q24: Compare `Object.freeze()` vs. `Object.seal()`.
*   **Object.freeze():** Prevents adding new properties, deleting existing properties, or changing property values/descriptors. Makes the object completely immutable.
*   **Object.seal():** Prevents adding or deleting properties, but allows modifying the values of existing properties if they are writable.

### Q25: How does `JSON.stringify()` handle nested methods or `undefined` properties?
*   **Values ignored:** Object properties holding `undefined`, `function`, or `symbol` values are omitted entirely during stringification.
*   **Array elements:** These same types are converted to `null` inside array values to preserve indices.
*   **Circularity:** Throws a `TypeError: Converting circular structure to JSON`.

### Q26: Compare `Math.floor()`, `Math.ceil()`, `Math.round()`, and `Math.trunc()`.
*   **Math.floor():** Rounds down to the nearest integer.
*   **Math.ceil():** Rounds up to the nearest integer.
*   **Math.round():** Rounds to the nearest integer based on standard fractional limits (>= 0.5 rounds up, < 0.5 rounds down).
*   **Math.trunc():** Chops off the fractional part entirely, returning the integer part (acts differently from `floor` for negative numbers: `Math.floor(-1.5)` is `-2`, while `Math.trunc(-1.5)` is `-1`).

### Q27: Explain Destructuring assignment. How do you specify default values?
*   **Definition:** A syntax allowing unpacking values from arrays, or properties from objects, into distinct variables easily.
*   **Default Values:** Uses `=` to specify fallback values if the unpacked property is `undefined`.
    ```javascript
    const { name, role = "User" } = user;
    const [first, second = 10] = numbers;
    ```

### Q28: What are Template Literals and Tagged Templates?
*   **Template Literals:** Strings wrapped in backticks (`` ` ``) allowing multi-line text and expression interpolation using `${expression}`.
*   **Tagged Templates:** A advanced form where you parse template literals using a function. The function receives the literal string segments as an array along with the interpolated values.
    ```javascript
    function myTag(strings, ...values) { return strings[0] + values[0].toUpperCase(); }
    myTag`Hello ${name}`;
    ```

### Q29: Compare a `Set` and an `Array`.
*   **Set:** Collection of unique values. Values cannot be accessed by index. Searching for value presence is highly optimized (O(1) average time complexity using hashing).
*   **Array:** Ordered list of values allowing duplicates. Elements are accessed by numeric index (O(1) lookup). Searching for value presence requires scanning (O(N) unless sorted).

### Q30: Compare a `Map` and a standard `Object`.
*   **Map:** Keys can be any type (including functions or objects). Preserves key insertion order. Easy to retrieve size directly via `.size`. Iterable.
*   **Object:** Keys must be strings or symbols. Does not reliably preserve insertion order for all keys. Size must be calculated manually. Not directly iterable.

### Q31: Compare the array methods `slice()` and `splice()`.
*   **slice(start, end):** Copies a portion of an array into a new array. Non-mutating.
*   **splice(start, deleteCount, ...items):** Adds, removes, or replaces elements directly in the original array. Mutating. Returns an array of deleted elements.

### Q32: Compare array methods `indexOf()` and `includes()`.
*   **indexOf(val):** Returns the first index of the element, or `-1` if not found. Uses strict equality (`===`) so it cannot find `NaN`.
*   **includes(val):** Returns `true` or `false`. Uses `SameValueZero` algorithm, meaning it can correctly identify if `NaN` is in the array.

### Q33: Compare `find()`, `findIndex()`, and `filter()`.
*   **find(callback):** Returns the value of the **first** element that satisfies the testing condition. Returns `undefined` if none match.
*   **findIndex(callback):** Returns the index of the **first** element that satisfies the testing condition. Returns `-1` if none match.
*   **filter(callback):** Evaluates all elements, returning a **new array** containing all elements that satisfy the condition.

### Q34: Compare string methods `slice()` and `substring()`.
*   **Both:** Extract a section of a string and return it as a new string.
*   **Differences with negative indexes:**
    *   `slice(start, end)`: Treats negative parameters as offsets from the end of the string.
    *   `substring(start, end)`: Treats negative parameters as `0` and swaps parameters if `start > end`.

### Q35: How do default parameters work? What is their evaluation scope?
*   **Mechanism:** Allows formal parameters to be initialized with default values if no value or `undefined` is passed.
*   **Scope:** Evaluated at function call time from left to right. Parameters on the right can reference already evaluated parameters on their left.
    ```javascript
    function multiply(x, y = x * 2) { return x * y; }
    ```

### Q36: Explain Logical Operators: `&&`, `||`, and `??` (Nullish Coalescing).
*   **`&&` (AND):** Returns the first falsy operand, or the last operand if all are truthy.
*   **`||` (OR):** Returns the first truthy operand, or the last operand if all are falsy.
*   **`??` (Nullish Coalescing):** Returns the right-hand operand only if the left-hand operand is `null` or `undefined`. Allows `0` and `""` to pass through as valid values.

### Q37: Compare inline event handlers, DOM property handlers, and `addEventListener`.
*   **Inline (HTML):** e.g., `<button onclick="doSomething()">`. Bad practice: mixes markup and logic, hard to maintain.
*   **DOM Property:** e.g., `element.onclick = fn`. Limit: allows only one listener per event. Overwrites previous handlers.
*   **addEventListener:** e.g., `element.addEventListener('click', fn)`. Best practice: supports multiple listeners, works with capture/bubble, and can be removed easily.

### Q38: What is the difference between BOM (Browser Object Model) and DOM (Document Object Model)?
*   **DOM:** The structured object representation of the active HTML document (nodes and elements), managed via the `document` object.
*   **BOM:** The interface representing the browser window container outside of the page content. Includes objects like `window`, `navigator`, `history`, `screen`, and `location`.

### Q39: Explain Object property descriptors: `value`, `writable`, `enumerable`, and `configurable`.
*   **value:** The actual data value stored in the property.
*   **writable:** If `true`, the property's value can be changed.
*   **enumerable:** If `true`, the property shows up in loops (`for...in`) and key extractions (`Object.keys()`).
*   **configurable:** If `true`, the property's descriptor can be modified, and the property can be deleted.

### Q40: What is the difference between `window` and `document`?
*   **window:** The global execution context and browser window object. Represents the entire tab containing the page.
*   **document:** A property of `window`. Represents the actual HTML document loaded inside that window.

### Q41: Name the built-in Error types in JavaScript.
*   **RangeError:** Numeric value or parameter is outside its valid range (e.g., `new Array(-1)`).
*   **ReferenceError:** Accessing an undeclared or uninitialized variable (e.g., TDZ variables).
*   **SyntaxError:** Code violates the syntax rules of JavaScript (e.g., `const x = ;`).
*   **TypeError:** An operand or argument passed to a function is incompatible with the expected type (e.g., `"str".sort()`).
*   **URIError:** Incorrect use of global URI handling functions (e.g., `decodeURI('%')`).

### Q42: What is the difference between deep copying and shallow copying of objects?
*   **Shallow Copy:** Copies the top-level values. Nested objects or arrays keep their original reference pointers. Modifying a nested property in the copy affects the original object.
*   **Deep Copy:** Recursively copies all levels of values. Creating separate, completely independent objects. Changes do not propagate to the original.

### Q43: How does the `delete` operator work? What can and cannot be deleted?
*   **How it works:** Removes a property from an object. If no other references exist, the property memory is cleared.
*   **Can be deleted:** Dynamically added object properties.
*   **Cannot be deleted:** Global variables declared with `var`, `let`, or `const`, functions, or non-configurable properties (like predefined mathematical functions on `Math`).

---

### Q44: What is the difference between a statement and an expression?
*   **Expression:** Any valid unit of code that resolves to a **value** - `2 + 3`, `user.name`, `() => {}`, ternaries, function calls.
*   **Statement:** An instruction performing an action; it may *contain* expressions but does not itself produce a value - `if`, `for`, `while`, `switch`, declarations.
*   Consequences: expressions can be embedded anywhere a value fits (`const x = cond ? f() : g();`) while statements cannot (no `const x = if (...) ...`). Template literals, arrow function bodies and comma operators exploit expression-ness.
*   Functional style (ternary chains, IIFEs returning values, logical operators as conditionals) exists precisely to convert statement logic into composable expressions.

### Q45: How many ways can you convert a string to a number? Compare them.
*   **`Number(str)`**: full-string conversion; returns `NaN` on any trailing garbage (`Number("42px") → NaN`); handles hex `"0x1F"`, decimal point, empty string → `0`.
*   **`parseInt(str, radix)`**: parses leading integer characters then stops (`parseInt("42px") → 42`); always pass radix 10 for safety. Trims whitespace first.
*   **`parseFloat()`**: same but keeps decimals; no radix concept.
*   **Unary `+str`**: identical semantics to `Number()` but shortest syntax; common in code golf and hot paths.
*   Edge cases worth mentioning in interviews: `Number("") === 0` vs `Number(" ") === 0` but `parseInt(" ") === NaN`; BigInt suffix errors; `Number(null) === 0` vs `Number(undefined) === NaN`.

### Q46: What is optional chaining (`?.`) and how does it behave?
*   `obj?.prop`, `obj?.[expr]`, `fn?.(args)` short-circuit to `undefined` the moment the left side is `null`/`undefined` instead of throwing TypeError.
*   Chains short-circuit entirely: `a?.b.c.d()` never evaluates `.c.d` if `a` is nullish - safe deep access without `&&` pyramids.
*   Pairs with nullish coalescing for defaults: `const city = user?.address?.city ?? 'Unknown';`
*   Gotchas: it does NOT guard against intermediate non-null objects lacking the property (only nullish checks); assignment targets are invalid (`a?.b = 1` throws); overuse hides genuine bugs where data should exist.

### Q47: Compare `for...in` and `for...of`.
*   **`for...in`** iterates enumerable **string keys** of an object - includes inherited enumerable properties (use `Object.hasOwnProperty`/`Object.keys` to filter). Works on plain objects; on arrays it yields index strings ("0","1") plus any added props - an anti-pattern.
*   **`for...of`** iterates **values** of any iterable via the iterator protocol (`Symbol.iterator`): arrays, strings, Maps, Sets, NodeList, generators. Cannot be used on plain objects unless you make them iterable.
*   Both support `break/continue/return`; `for...of` supports `await` inside async loops, `for...in` does not meaningfully.
*   Rule of thumb: keys of data structures → `for...in` (rarely), sequences → `for...of`, transformations → array methods.

### Q48: Explain named exports vs default exports in ES Modules.
*   **Named exports**: many per module, imported by exact name with braces `{ export const x }` / `import { x } from`. Refactor-safe (IDE renames work), tree-shaking friendly, explicit origin at call site.
*   **Default export**: one per module, importable under any local name (`import Anything from './mod'`) - that anonymity breaks auto-imports/grep and invites inconsistent naming across a codebase.
*   A module can mix both: `import React, { useState } from 'react'`.
*   Re-exporting patterns: `export * from './utils'`, `export { default as Button } from './Button'` used to build barrel files/index modules.
*   Team-style note: many style guides prefer named exports everywhere except entry components/classes.

### Q49: What are callbacks? Why did Promises emerge from their problems?
*   A **callback** is a function passed as an argument to be invoked later - the original async primitive (`setTimeout(fn, 100)`, `el.addEventListener('click', fn)`, Node error-first callbacks `(err, result)`).
*   **Problems at scale**:
    *   **Inversion of control** - you hand your continuation to third-party code that may call it twice, never, or synchronously.
    *   **Callback hell** - sequential async steps nest rightward into unreadable pyramids.
    *   **Error handling fragmentation** - every level must check/receive `err`; try/catch cannot cross async boundaries.
*   Promises fix this: values are first-class (call-safety guaranteed once-settled), chains flatten sequencing, and a single `.catch()` handles any upstream failure.

### Q50: What are getter/setter accessors? When are they useful?
*   Properties backed by functions: `get fullName() { return this.first + ' ' + this.last }` - read like properties but compute dynamically; `set` intercepts writes.
*   Defined in object literals or via `Object.defineProperty(obj, prop, { get, set, enumerable, configurable })` (class fields use `get`/`set` keywords).
*   **Use cases**: computed/derived values without method-call syntax, validation/transformation on write (range clamping, normalization), lazy evaluation with caching, backward-compatible API evolution (swap a data field for an accessor invisibly).
*   Caveats: accessors hide computation cost behind innocent-looking property reads (profiling surprise), setters that throw create surprising assignment failures, and JSON serialization uses only enumerable data properties unless getters are enumerated too.

---

## Coding & Implementation Challenges

### Q51: Implement a custom polyfill for `Array.prototype.map`.
```javascript
Array.prototype.myMap = function(callback, thisArg) {
  if (this == null) throw new TypeError("Cannot read property 'myMap' of null or undefined");
  if (typeof callback !== "function") throw new TypeError(callback + " is not a function");

  const O = Object(this);
  const len = O.length >>> 0;
  const result = new Array(len);

  for (let i = 0; i < len; i++) {
    if (i in O) {
      result[i] = callback.call(thisArg, O[i], i, O);
    }
  }
  return result;
};

// Verification
console.log([1, 2, 3].myMap(x => x * 2)); // [2, 4, 6]
```

### Q52: Implement a custom polyfill for `Array.prototype.filter`.
```javascript
Array.prototype.myFilter = function(callback, thisArg) {
  if (this == null) throw new TypeError("Cannot read property 'myFilter' of null or undefined");
  if (typeof callback !== "function") throw new TypeError(callback + " is not a function");

  const O = Object(this);
  const len = O.length >>> 0;
  const result = [];

  for (let i = 0; i < len; i++) {
    if (i in O) {
      if (callback.call(thisArg, O[i], i, O)) {
        result.push(O[i]);
      }
    }
  }
  return result;
};

// Verification
console.log([1, 2, 3, 4].myFilter(x => x % 2 === 0)); // [2, 4]
```

### Q53: Implement a custom polyfill for `Array.prototype.reduce`.
```javascript
Array.prototype.myReduce = function(callback, initialValue) {
  if (this == null) throw new TypeError("Cannot read property 'myReduce' of null or undefined");
  if (typeof callback !== "function") throw new TypeError(callback + " is not a function");

  const O = Object(this);
  const len = O.length >>> 0;
  let k = 0;
  let accumulator;

  if (arguments.length >= 2) {
    accumulator = initialValue;
  } else {
    let kPresent = false;
    while (k < len && !kPresent) {
      kPresent = k in O;
      if (kPresent) {
        accumulator = O[k];
      }
      k++;
    }
    if (!kPresent) {
      throw new TypeError("Reduce of empty array with no initial value");
    }
  }

  for (; k < len; k++) {
    if (k in O) {
      accumulator = callback(accumulator, O[k], k, O);
    }
  }
  return accumulator;
};

// Verification
console.log([1, 2, 3, 4].myReduce((acc, curr) => acc + curr, 0)); // 10
```

### Q54: Write a basic, clean `debounce` utility.
```javascript
function debounce(func, delay) {
  let timeoutId = null;

  return function(...args) {
    const context = this;
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

// Verification
const log = debounce(() => console.log("Debounced!"), 100);
log(); log(); log(); // Only "Debounced!" will be logged once after 100ms
```

### Q55: Write a basic, clean `throttle` utility.
```javascript
function throttle(func, limit) {
  let inThrottle = false;

  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Verification
const logThrottled = throttle(() => console.log("Throttled!"), 100);
logThrottled(); logThrottled(); // Logs immediately once, ignores second execution within 100ms
```

### Q56: Write a highly optimized function to verify if a string is a palindrome.
```javascript
function isPalindrome(str) {
  if (typeof str !== "string") return false;
  
  // Clean string: remove non-alphanumeric characters and lowercase
  const cleanStr = str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  let left = 0;
  let right = cleanStr.length - 1;

  while (left < right) {
    if (cleanStr[left] !== cleanStr[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

// Verification
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("hello")); // false
```

### Q57: Write a function to find the first non-repeated character in a string.
```javascript
function firstNonRepeatedChar(str) {
  if (typeof str !== "string" || str.length === 0) return null;

  const charCount = new Map();

  // Populate frequency map
  for (const char of str) {
    charCount.set(char, (charCount.get(char) || 0) + 1);
  }

  // Find first character with count 1
  for (const char of str) {
    if (charCount.get(char) === 1) {
      return char;
    }
  }

  return null;
}

// Verification
console.log(firstNonRepeatedChar("swiss")); // "w"
console.log(firstNonRepeatedChar("racecar")); // null
```
