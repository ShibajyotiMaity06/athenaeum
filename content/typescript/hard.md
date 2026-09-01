# TypeScript - Hard Interview Questions

## Theory Questions & Answers

### Q1: Detail Covariance, Contravariance, and Bivariance in TS. How does `strictFunctionTypes` affect them?
*   **Covariance (Read-only / Output):** Asserts that subtype relationship is preserved. If `Dog extends Animal`, then `() => Dog` is assignable to `() => Animal`.
*   **Contravariance (Write-only / Input):** Asserts that subtype relationship is reversed. If `Dog extends Animal`, then `(a: Animal) => void` is assignable to `(d: Dog) => void` (because the target function expects a `Dog` but can safely pass it to a handler expecting `Animal`).
*   **Bivariance:** Allows parameter assignability in both directions. Highly unsafe.
*   **`strictFunctionTypes`:** Disables bivariance checking for function arguments, forcing them to be checked contravariantly (methods, however, remain bivariant for OOP backwards compatibility).

### Q2: Explain Distributive Conditional Types. How do you disable this behavior?
*   **Distribution:** When checking a union type through a naked generic parameter (e.g., `T extends any`), the compiler evaluates the condition for each union member individually and unions the final results:
    ```typescript
    type Distribute<T> = T extends any ? T[] : never;
    type Res = Distribute<string | number>; // string[] | number[]
    ```
*   **Disabling:** Wrap the parameter in a tuple `[T]`. This forces the compiler to treat the entire union as a single consolidated check:
    ```typescript
    type NonDistribute<T> = [T] extends [any] ? T[] : never;
    type Res = NonDistribute<string | number>; // (string | number)[]
    ```

### Q3: How does TS compile deep type recursions? What is Tail-Call Optimization (TCO) for types?
*   **Recursion Limits:** TS enforces strict limits (typically 50-100 frames) to prevent compiler stack crashes.
*   **Type TCO (TS 4.5+):** Conditional types that are tail-recursive (where the recursive call is the direct, final output of a branch) are optimized under the hood. This increases recursion limits significantly (up to ~1000 frames) enabling complex compile-time parsers and state engines.

### Q4: Explain Branded / Opaque Types. How are they constructed?
*   **Definition:** Simulates nominal typing. Differentiates structurally identical primitives (e.g., `UserId` and `ProductId` are both strings but must not be interchangeable).
*   **Construction:** Intersect the primitive type with a unique, nominal literal branding tag object:
    ```typescript
    type Brand<T, B> = T & { readonly __brand: B };
    type UserId = Brand<string, "UserId">;
    ```

### Q5: Name the compiler flags triggered by the `strict` suite.
*   `noImplicitAny`: Throws error on un-inferred implicit `any` variables.
*   `strictNullChecks`: Disallows assignment of `null` or `undefined` to non-nullable variables.
*   `strictFunctionTypes`: Enforces contravariant checks on function arguments.
*   `strictBindCallApply`: Validates function arguments during `.bind()`, `.call()`, and `.apply()`.
*   `strictPropertyInitialization`: Verifies class properties are initialized in the constructor.
*   `noImplicitThis`: Enforces explicit typing of the `this` context inside functions.
*   `useUnknownInCatchVariables`: Forces `catch` block error parameters to default to `unknown` instead of `any`.

### Q6: How do you filter keys in Mapped Types?
*   **Solution:** Remap keys using `as` combined with a conditional type evaluating to `never`:
    ```typescript
    type FilterFunctions<T> = { [K in keyof T as T[K] extends Function ? K : never]: T[K] };
    ```
    Keys evaluating to `never` are automatically omitted from the generated object type.

### Q7: Explain structural subtyping edge cases with index signatures vs. exact shapes.
*   **Mismatch:** An object type with explicit properties (e.g., `{ name: string }`) is structurally compatible with an index signature `{ [key: string]: string }`. However, passing a type with an index signature to a strict target expecting only exact properties fails, as additional unknown fields may exist.

### Q8: Explain template literal string parsing in types.
*   **Mechanics:** Uses conditional types combined with the `infer` keyword inside string literal types to recursively split and parse strings at compile time (e.g., parsing path structures, SQL queries, or query strings).

### Q9: How does Type Inference work inside Array literals?
*   **Widenings:** When defining an array `[1, 2]`, TS infers it as `number[]` (widening).
*   **Tuple Inference:** Use `as const` or generic parameters constrained with `readonly any[]` to prevent widening, forcing TS to infer exact literal tuples like `readonly [1, 2]`.

### Q10: How do you optimize type definitions for faster compilation?
*   **Rule 1:** Prefer interface extension (`extends`) over intersection operators (`&`). Interfaces cache shapes inside the compiler, whereas intersections require recursive structural checks.
*   **Rule 2:** Avoid deeply nested or recursive mapped structures inside frequently used types.
*   **Rule 3:** Limit union size and prevent unnecessary distributive conditional evaluation checks.

### Q11: How do you type Web Workers and their dynamic `postMessage` structures?
*   **Solution:** Establish a strict, structured event map defining requests and responses. Restrict message transfers by wrapping the `postMessage` call inside custom, type-safe API helper channels.

### Q12: Explain Module Augmentation.
*   **Definition:** Declaring global namespace extensions or extending third-party module declarations in `.d.ts` files:
    ```typescript
    declare module "express-session" {
      interface SessionData { userId: string; }
    }
    ```
    This seamlessly merges new properties into existing third-party packages.

### Q13: Contrast stage-3 Decorators (TS 5.0+) with legacy experimental decorators.
*   **Experimental Decorators:** Execute using V8 metadata reflection, modifying classes, methods, and properties at runtime.
*   **Stage-3 Decorators:** Standard-compliant, faster execution. Receive structured `context` objects describing fields, accessors, getters, and metadata. No longer require `reflect-metadata` libraries.

### Q14: What is the `unique symbol` type?
*   **Definition:** A nominal primitive type used strictly with `const` declarations. It guarantees that the compiler treats a specific Symbol as an entirely unique type, preventing key naming conflicts.

### Q15: How do you simulate Higher-Kinded Types (HKT) in TypeScript?
*   **HKT Limit:** TS cannot pass generic types as parameters (e.g., `type M<T> = ...` where `M` is also generic).
*   **Simulation:** Use a **Defunctionalization** pattern: register target structures inside a global type registry interface, and reference those registered keys using template indices.

### Q16: Explain why `any` behaves uniquely in conditional type distribution.
*   **Behavior:** When `any` matches against conditional type constraints (`any extends T`), it behaves as a union of both branches, distributing and returning both the true and false branch results as a union type.

### Q17: Compare `any` and `unknown` compilation mechanics under the hood.
*   **any:** A top and bottom type. Resolves all checks to true, completely turning off compiler validation loops.
*   **unknown:** A top type (contains all values) but not a bottom type. Inhibits any property reads or calls, forcing the compiler to verify assertions before generating output.

### Q18: How does the compiler resolve Overload signature matches?
*   **Priority:** Checks signatures in the exact order they are declared in the file (top to bottom). The compiler binds the call site to the first compatible signature it matches, even if a subsequent signature is more precise.

### Q19: Why does ReturnType resolve overloaded function signatures to the LAST signature?
*   **Reason:** Standard compiler behavior. When conditional types match against overloaded functions, the compiler resolves compatibility checks based on the very last declared signature, ignoring previous ones.

### Q20: Explain F-Bounded Polymorphism.
*   **Definition:** A type parameter constraint that refers to the type parameter itself, enforcing complex self-referential relationships.
    ```typescript
    interface Animal<T extends Animal<T>> { clone(): T; }
    ```

### Q21: What are Abstract Constructors?
*   **Definition:** Typing abstract class constructor shapes using the `abstract new` keyword, allowing functions to accept concrete subclasses of abstract targets.
    ```typescript
    type AbstractCtor<T> = abstract new (...args: any[]) => T;
    ```

### Q22: Why does Array.prototype.filter require custom type predicates?
*   **Reason:** The compiler cannot automatically infer that a boolean predicate (e.g., `x => x !== null`) alters array member types. Developers must explicitly annotate the filter callback using type predicates (`x is string`) to narrow the output array type.

### Q23: What are Triple-Slash Directives? When are they relevant today?
*   **Definition:** XML-like tags (e.g., `/// <reference path="..." />`) placed at the top of files to manually handle declaration imports.
*   **Relevance:** Primarily used in monorepos or library configurations where bundler-free compilation requires exact type dependency sorting.

### Q24: Explain the structural compatibility of Private and Protected properties.
*   **Exception:** Unlike standard properties, `private` and `protected` class members break structural subtyping. Two classes with identical private fields are incompatible unless one extends the other.

### Q25: How does `strictPropertyInitialization` interact with Definite Assignment Assertions (`!`)?
*   **Behavior:** Toggles errors if class fields are not initialized. If properties are initialized asynchronously (e.g., via APIs), use `!` on the field declaration (e.g., `id!: string`) to guarantee initialization to the compiler.

### Q26: Explain the Decorator Context Object structure in TS 5.0.
*   **Properties:** Includes `kind` (type of member: "class", "method", "field", etc.), `name`, `private` (boolean), `static` (boolean), and `addInitializer` (callback to inject lifecycle hooks).

### Q27: Why does intersecting primitives (`string & number`) yield `never`?
*   **Reason:** Pure mathematical contradiction. No runtime value can be both a primitive string and a number simultaneously, so the compiler simplifies this intersection to `never`.

### Q28: How do you override node_modules libraries without editing their files?
*   **Solution:** Configure paths inside `tsconfig.json` using the `paths` compiler option mapping the target module to a local custom declaration file (`.d.ts`).

### Q29: What are intrinsic types?
*   **Definition:** Special, built-in string manipulation type utilities (e.g., `Uppercase<S>`, `Lowercase<S>`, `Capitalize<S>`) implemented directly inside the TypeScript compiler engine for speed.

### Q30: What is the `Error.captureStackTrace` API in TS?
*   **Definition:** A V8 compiler API used to capture the current execution call stack trace, attached to custom error classes while hiding constructor frames from user view.

### Q31: How do you write a compile-time length counter for Tuples?
*   **Solution:** Read the `.length` property of the tuple type:
    ```typescript
    type Length<T extends readonly any[]> = T["length"];
    ```

### Q32: Explain namespace pollution vs. Module encapsulation.
*   **Namespaces:** Group variables globally; susceptible to accidental namespace collision.
*   **Modules:** Encapsulated script scopes; export values explicitly. Favored in modern JS/TS architectures.

### Q33: How do you type recursive JSON data structures?
*   **Solution:** Define an interface that refers to itself:
    ```typescript
    interface JSONValue { [key: string]: JSONValue | string | number | boolean | null | JSONValue[]; }
    ```

### Q34: What does `noUnusedLocals` do?
*   **Behavior:** Throws compilation errors if a local variable is declared but never referenced, helping keep the compiled codebase clean.

### Q35: What is the purpose of `noImplicitReturns`?
*   **Behavior:** Throws compilation errors if a function with a declared return type has code paths that exit without explicitly returning a value (returning `undefined` implicitly).

### Q36: Compare Class types and Instance types.
*   **Class Type (`typeof MyClass`):** Represents the constructor function shape itself (including static methods).
*   **Instance Type (`MyClass`):** Represents the shape of object instances returned by instantiating the class.

### Q37: How does `this` scoping behave inside class static blocks?
*   **Behavior:** Inside ES6/TS class static blocks, the `this` keyword references the class constructor itself, rather than instance objects.

### Q38: What does the `noFallthroughCasesInSwitch` flag do?
*   **Behavior:** Throws compilation errors if a `case` block inside a `switch` statement lacks a terminal `break` or `return` statement, preventing accidental fallthrough bugs.

### Q39: Explain the `allowSyntheticDefaultImports` flag.
*   **Behavior:** Allows imports like `import React from "react"` even if the target library does not explicitly declare a default export in its types, simplifying module compilation.

### Q40: How do you declare a global utility namespace in a module?
*   **Solution:** Wrap declarations inside a `global` block within standard modules:
    ```typescript
    declare global { interface Window { customTrack: Function; } }
    ```

### Q41: What does `preserveConstEnums` do?
*   **Behavior:** Forces the compiler to keep `const enum` object definitions in the emitted JS output instead of completely erasing them, which is useful for debugging.

### Q42: How does TS handle declaration merging for functions and classes?
*   **Functions + Namespaces:** Merges functions with namespaces, letting namespaces act as custom static properties on the function object.

### Q43: Contrast method parameters in methods vs properties under `strictFunctionTypes`.
*   **Method Parameters:** Method declarations (`method(a: Type): void`) remain bivariant.
*   **Property Parameters:** Function properties (`property: (a: Type) => void`) are checked strictly contravariantly.

---

### Q44: What are const type parameters (TS 5.0) and what problem do they solve?
* `<const T>` infers literal/tuple types *without* requiring `as const` at every call site: `function firstOf<const T extends readonly unknown[]>(arr: T): T[number]` - `firstOf(['a','b'])` infers `readonly ['a','b']`, not `string[]`.
* Motivation: generic helpers over literal data (event-name registries, route tables, typed query builders) previously forced awkward `as const` sprinkling or lost precision.
* Semantics: affects inference only (like contextual as-const), not assignability rules; object literals get readonly properties, arrays become readonly tuples, literals stop widening.
* Interplay notes: combines with `extends readonly unknown[]` bounds; doesn't affect non-generic contexts; supersedes many `DeepReadonlyLiteral` hack utilities.

### Q45: What do explicit variance annotations (`in`/`out`) add in TS 4.7+?
* Interfaces may declare variance intent: `interface Source<out T> { get(): T }`, `interface Sink<in T> { put(v: T): void }` - compiler verifies structural usage actually matches, erroring at declaration if not.
* Benefits: faster checking (skip structural variance computation for annotated params - measurable in big monorepos), dramatically better error messages at misuse sites (variance mismatch reported where the wrong assignment happens, with the offending property named).
* Rules: `out`=covariant (output positions only), `in`=contravariant (input positions), `in out`=invariant; method-position bivariance still applies separately (annotations govern property/function-property positions).
* Adoption guidance: library authors annotate public generic interfaces first - internal types rarely need it; mismatches surface latent unsoundness worth fixing.

### Q46: How do interface declarations merge, and what conflicts error vs overload?
* Non-function members with identical names must be **identical types**, else compile error (`Subsequent property declarations must have the same type`).
* Function members merge into **overloads** - later interfaces' signatures appear first in resolution order (reverse declaration order quirk).
* Same-named interfaces across modules merge only within shared scope (global augmentations collide dangerously); namespace+interface merging composes statics onto shapes.
* Practical consequences: patching third-party types relies on merging being additive; defensive library design uses `type` aliases (no merging) to lock shapes; linters ban global interface augmentation outside dedicated `.d.ts` files to prevent invisible coupling.

### Q47: Explain the mixin typing pattern end-to-end.
* Mixins layer behavior over arbitrary base classes via constructor-typed generics:
```ts
type Constructor<T = {}> = new (...args: any[]) => T;
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    created = new Date();
    stamp() { return this.created.toISOString(); }
  };
}
class User { name = ''; }
const User2 = Timestamped(User);
new User2().stamp();          // fully typed, including created/stamp
```
* Key mechanics: constrained generic preserves the incoming constructor shape; returned class expression extends it, adding members; chained mixins compose (`Timestamped(SoftDelete(Activatable(Base)))`) with intersection-flavored member accumulation.
* Pitfalls: private/protected members don't flow through structural bases cleanly (use protected-by-convention or symbol keys), decorator-style metadata ordering issues, and nominal identity loss (two mixed chains aren't assignable) - sometimes branded tokens restore safety.

### Q48: How can template literal types encode state machines?
* Combine literal unions, template interpolation, and conditional mapping to type valid transitions:
```ts
type State = 'idle' | 'loading' | 'error';
type Event = 'FETCH' | 'RESOLVE' | 'REJECT';
type Transition = `${State} --${Event}--> ${State}`;
const table: Transition[] = ['idle --FETCH--> loading', 'loading --RESOLVE--> idle'];
// @ts-expect-error invalid edge:
table.push('idle --RESOLVE--> loading');
```
* Escalations: mapped transition records keyed by templated keys (`{ [K in `${State}_${Event}`]?: State }`), path-typed routers (`/${string}/${number}`), SQL/query DSL fragments, and i18n key trees derived from message catalogs.
* Limits: combinatorial explosion inflates check times on large graphs; error messages degrade; runtime guarantees still require the actual reducer/table - types constrain authors, not execution.

### Q49: How do `isolatedModules` and type elision interact under single-file transpilers?
* Transpilers (esbuild/swc/babel) process file-by-file - no whole-program type info to decide whether an imported binding is type-only; `isolatedModules: true` makes TS reject constructs whose meaning depends on cross-file analysis (const enums re-exported, classes-as-types ambiguities, re-exporting types without `export type`).
* Elision rules: plain `import { Foo } from './x'` used only in type positions would traditionally drop the import during emit - impossible decision for single-file tools, hence the mandate for explicit `import type`/`export type`.
* Failure modes when ignored: runtime crashes importing modules with side effects, bundler dead-code misjudgments, dual-package hazards in ESM/CJS interop.
* Modern baseline: enable isolatedModules everywhere, add verbatimModuleSyntax for stricter clarity, and treat const enum usage as deprecated in library surfaces.

### Q50: How do you type a Result/Either pattern for explicit error handling?
```ts
type Ok<T>  = { readonly ok: true;  value: T };
type Err<E> = { readonly ok: false; error: E };
type Result<T, E = Error> = Ok<T> | Err<E>;

function parse(json: string): Result<Config, SyntaxError> {
  try { return { ok: true, value: JSON.parse(json) as Config }; }
  catch (e) { return { ok: false, error: e as SyntaxError }; }
}
const r = parse(input);
if (!r.ok) { /* r.error narrowed */ } else { /* r.value narrowed */ }
```
* Discriminant `ok` drives exhaustive narrowing; helpers (`map`, `andThen/flatMap`, `unwrapOr`) compose pipelines without throwing through stack frames - errors become values in signatures, visible to callers and enforced at every hop.
* Contrast with exceptions: invisible in type signatures, un-enumerable failure modes; Result trades ergonomics (no early throws) for total function honesty - libraries like neverthrow/zod formalize it.
* Advanced: differentiate error unions (`Result<T, ParseErr | NetworkErr>`), accumulate validation errors via Either-left lists, and keep thrown exceptions for truly exceptional invariant violations only.

---

## Coding & Implementation Challenges

### Q51: Implement a type-safe nested object Property Getter/Setter generator.
```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type Accessors<T> = Getters<T> & Setters<T>;

// Verification
interface Config { port: number; host: string; }
type ServerAccess = Accessors<Config>; // Contains getPort, setPort, getHost, setHost
```

### Q52: Implement a compile-time Query String Parser type.
```typescript
type ParseQueryString<S extends string> = S extends ""
  ? {}
  : S extends `${infer Pair}&${infer Rest}`
  ? ParsePair<Pair> & ParseQueryString<Rest>
  : ParsePair<S>;

type ParsePair<P extends string> = P extends `${infer K}=${infer V}`
  ? { [Key in K]: V }
  : {};

// Verification
type Query = ParseQueryString<"name=bob&age=25">; // { name: "bob" } & { age: "25" }
```

### Q53: Implement `ExtractRouteParams` to extract path parameter types.
```typescript
type ExtractRouteParams<T extends string> = T extends `${string}/:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractRouteParams<Rest>
  : T extends `${string}/:${infer Param}`
  ? { [K in Param]: string }
  : {};

// Verification
type Params = ExtractRouteParams<"/user/:id/posts/:postId">; // { id: string } & { postId: string }
```

### Q54: Implement a Tail-Recursive List Flattener type.
```typescript
type Flatten<T extends any[], Acc extends any[] = []> = T extends [infer Head, ...infer Tail]
  ? Head extends any[]
    ? Flatten<Tail, Flatten<Head, Acc>>
    : Flatten<Tail, [...Acc, Head]>
  : Acc;

// Verification
type Flat = Flatten<[1, [2, [3, 4]]]>; // [1, 2, 3, 4]
```

### Q55: Implement `UnionToIntersection<U>` from scratch.
```typescript
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

// Verification
type Intersected = UnionToIntersection<{ a: 1 } | { b: 2 }>; // { a: 1 } & { b: 2 }
```

### Q56: Create `DeepOmit<T, Path>` that omits nested keys using dot-notation paths.
```typescript
type DeepOmit<T, Path extends string> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? { [K in keyof T]: K extends Key ? DeepOmit<T[K], Rest> : T[K] }
    : T
  : Path extends keyof T
  ? Omit<T, Path>
  : T;

// Verification
interface Org { user: { info: { name: string; age: number } } }
type Trimmed = DeepOmit<Org, "user.info.age">; // Org without age in nested info
```

### Q57: Create a type-safe nominal brand helper and validation check.
```typescript
declare const brand: unique symbol;

type Brand<T, TBrand> = T & { readonly [brand]: TBrand };

type Usd = Brand<number, "USD">;
type Eur = Brand<number, "EUR">;

function makeUsd(n: number): Usd { return n as Usd; }
function makeEur(n: number): Eur { return n as Eur; }

const wallet = makeUsd(100);
// const errorCheck: Eur = wallet; // Compile Error! USD brand is not assignable to EUR brand.
```
