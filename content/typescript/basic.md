# TypeScript - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is TypeScript? Compare it with JavaScript.
*   **Definition:** TypeScript is a strongly typed, static superset of JavaScript developed by Microsoft. It compiles down to plain JavaScript.
*   **Static Typing:** Checks and validates types during compilation, whereas JavaScript resolves types dynamically at runtime.
*   **Error Detection:** Catches syntax and type-mismatch bugs in the IDE/compiler before execution.
*   **Tooling:** Provides superior IDE support (advanced autocomplete, safe refactoring, and parameter signatures).

### Q2: Compare dynamic, static, and structural typing.
*   **Dynamic Typing (JS):** Variable types are resolved at runtime. Variables can freely change types.
*   **Static Typing (TS):** Variable types are declared and enforced during compile-time. Re-assigning an incompatible type causes a compile error.
*   **Structural Typing (TS):** Types are compared based on their shape/structure rather than explicit nominal declarations (duck typing: "if it looks like a duck, it is a duck").

### Q3: Compare `any`, `unknown`, `never`, and `void` in TypeScript.
*   **any:** Turns off all compile-time type checking. Highly unsafe; permits accessing any property or calling any method.
*   **unknown:** Type-safe counterpart to `any`. Allows holding any value, but **bars any operations** (property access/calls) until the type is narrowed.
*   **void:** Indicates the complete absence of a return value (typically used for functions with side effects).
*   **never:** Represents values that will never occur (e.g., functions that throw errors or enter infinite loops).

### Q4: Compare Interfaces and Type Aliases.
*   **Declaration Merging:** Interfaces can be re-declared and automatically merge properties. Type Aliases throw "duplicate identifier" errors.
*   **Extensibility:** Interfaces extend other interfaces/types via `extends`. Type Aliases compose via intersection operators (`&`).
*   **Capabilities:** Type Aliases can describe unions, primitives, tuples, and mapped types directly. Interfaces are strictly limited to object/class shapes.

### Q5: What are Type Assertions? Why can they be dangerous?
*   **Definition:** Bypasses the compiler's automatic type inference, manually informing the compiler of a specific type (using `value as Type` or `<Type>value`).
*   **Danger:** Type assertions **do not run runtime casting/conversions**. If the runtime value does not match the asserted compile-time type, it can crash during execution with silent type mismatches.

### Q6: Compare numeric enums, string enums, and `const enum`.
*   **Numeric Enums:** Auto-increment starting at `0` (unless initialized). Supports reverse mapping (lookup keys via values).
*   **String Enums:** Each member is initialized with a string. Better for debugging as they compile to clean readable strings. No reverse mapping.
*   **const enum:** Completely erased during compilation. The compiler replaces member references in-place with their literal values, avoiding runtime object overhead.

### Q7: What are Tuples? How do they differ from standard Arrays?
*   **Arrays:** Ordered lists containing arbitrary numbers of elements of a uniform type, annotated as `number[]` or `Array<number>`.
*   **Tuples:** Fixed-length arrays where each element has a **pre-defined, specific type** at its exact index, e.g., `[string, number]`.

### Q8: Explain optional parameters (`?`) vs. default parameters.
*   **Optional (`x?: number`):** Parameter can be omitted; its value defaults to `undefined` if not passed. Must be placed after mandatory parameters.
*   **Default (`x = 10`):** Automatically initializes the parameter if omitted or passed as `undefined`. Implies optionality under the hood.

### Q9: What are Union Types (`|`)?
*   **Union Types:** Permit a variable to hold any one of several specified types, e.g., `let id: string | number`. The compiler only allows properties common to all union members until narrowed.

### Q10: What are Intersection Types (`&`)?
*   **Intersection Types:** Combine multiple types into a single new type containing **all** properties from the combined types, e.g., `type AdminUser = User & Admin`.

### Q11: Explain Literal Types in TypeScript.
*   **Literal Types:** Narrow down variable values to specific exact values (strings, numbers, or booleans), e.g., `let status: "active" | "inactive"`.

### Q12: How does the `readonly` modifier work in Interfaces and Types?
*   **readonly:** Marks a property as immutable after object initialization. Attempts to re-assign values to `readonly` properties cause compile-time errors.

### Q13: Explain TS class Access Modifiers: `public`, `private`, and `protected`.
*   **public (Default):** Member is accessible from anywhere.
*   **private:** Member is accessible strictly inside the declaring class. Invisible to subclasses and instances.
*   **protected:** Member is accessible inside the declaring class and its subclasses, but invisible to external instances.

### Q14: What are Parameter Properties in classes?
*   **Definition:** Shorthand syntax to declare and initialize class properties directly in the constructor parameters.
    ```typescript
    class User {
      constructor(public name: string, private age: number) {}
    }
    ```
    This automatically declares `name` and `age` as fields and assigns them from constructor arguments.

### Q15: Compare Abstract Classes and Interfaces.
*   **Abstract Classes:** Can contain both implemented methods (concrete logic) and unimplemented abstract methods. Compile to runtime JS classes.
*   **Interfaces:** Describe purely virtual structures with zero runtime existence or concrete implementations. Compile to nothing.

### Q16: Explain Duck Typing (Structural Subtyping).
*   **Concept:** TS evaluates compatibility based on the properties an object contains, not its declared class or interface name. If an object satisfies the property contract of a type, it is treated as that type.

### Q17: What is the `keyof` operator?
*   **Definition:** A type operator that returns a union of literal keys representing the property names of an object type.
    ```typescript
    type User = { id: number; name: string };
    type UserKeys = keyof User; // "id" | "name"
    ```

### Q18: What is the `typeof` operator in TypeScript?
*   **Runtime Context:** Checks types at runtime (same as standard JS).
*   **Type Context:** Extracts the TypeScript type of a variable or object structure for compilation assignments.
    ```typescript
    const config = { host: "localhost", port: 80 };
    type Config = typeof config; // { host: string, port: number }
    ```

### Q19: What is the `tsconfig.json` file? Name three key configurations.
*   **Definition:** The configuration file defining root files and compiler flags needed to compile a TS project.
*   **Key Flags:**
    *   `target`: Target JS language version (e.g., `"es2022"`).
    *   `module`: Module resolution strategy (e.g., `"commonjs"`, `"esnext"`).
    *   `strict`: Enforces broad type safety rules.

### Q20: What does the `strictNullChecks` flag do when enabled?
*   **Behavior:** Prevents assigning `null` or `undefined` to variables unless they are explicitly declared as nullable (e.g., `let x: number | null`). Prevents common runtime "null pointer" errors.

### Q21: What are Ambient Declarations and `.d.ts` files?
*   **Ambient Declarations:** Define types and variables that exist in the environment (e.g., global variables or third-party JS libraries) without emitting compiled JS.
*   **`.d.ts` (Declaration) Files:** Contain purely compile-time type definitions that describe existing JS codebases.

### Q22: What is the Non-Null Assertion Operator (`!`)?
*   **Definition:** A post-fix operator placed after a variable (e.g., `obj!.prop`) to inform the compiler that the variable is definitely not `null` or `undefined`, silencing strict-null warnings.
*   *Warning:* Use with caution; it bypasses compile-time checks without performing runtime validations.

### Q23: Explain Type Narrowing using the `typeof` guard.
*   **Definition:** Using conditional `typeof` checks (e.g., `typeof val === "string"`) within control flow statements. The compiler automatically narrows down union types inside those branches.

### Q24: Explain Type Narrowing using the `instanceof` guard.
*   **Definition:** Using conditional `instanceof` checks (e.g., `obj instanceof Date`) to narrow object union types to specific class instances within conditional blocks.

### Q25: Explain Type Narrowing using the `in` operator.
*   **Definition:** Checking property presence using the `in` operator (e.g., `"swim" in animal`) to determine which union object shape is active inside conditional blocks.

### Q26: What are Index Signatures?
*   **Definition:** Used to annotate object types where the keys/properties are not known beforehand.
    ```typescript
    interface Dictionary {
      [key: string]: string;
    }
    ```

### Q27: Compare standard Array annotation formats.
*   **`type[]` (e.g., `string[]`):** Cleaner, standard shorthand format.
*   **`Array<type>` (e.g., `Array<string>`):** Equivalent generic format. Both compile to identical JS arrays.

### Q28: What is the `Record<K, T>` Utility Type?
*   **Definition:** A built-in mapped utility type used to describe structured object dictionaries mapping keys `K` to values `T`.
    ```typescript
    const users: Record<string, number> = { "alice": 25 };
    ```

### Q29: What are Generics in TypeScript? Why use them?
*   **Definition:** Parametrized types that act as placeholders for variable types.
*   **Purpose:** Allows building highly reusable components (functions, classes, interfaces) that maintain strict type safety and return signatures matching their actual inputs.

### Q30: What are Generic Constraints?
*   **Definition:** Restricting the types passed to a generic parameter using the `extends` keyword.
    ```typescript
    function logId<T extends { id: number }>(item: T) { console.log(item.id); }
    ```
    This guarantees that whatever type `T` is passed, it contains at least an `id` property of type `number`.

### Q31: What is the difference between `any` and `unknown` as function parameters?
*   **any:** Recommends zero safety: compiler allows passing anything and performing unchecked operations inside the function.
*   **unknown:** Safely accepts any input type but forces the developer to perform proper type narrowing before executing properties or operations inside the function.

### Q32: What are Const Assertions (`as const`)?
*   **Definition:** Modifies inferred types to their most rigid form: string/number literals become read-only literals, arrays become read-only tuples, and object properties become read-only fields.
    ```typescript
    const directions = ["up", "down"] as const; // readonly ["up", "down"] tuple
    ```

### Q33: Explain the `Pick<T, K>` Utility Type.
*   **Definition:** Constructs a new type by choosing a specific subset of property keys `K` from an existing type `T`.
    ```typescript
    type User = { id: number; name: string; age: number };
    type UserBrief = Pick<User, "id" | "name">; // { id: number; name: string }
    ```

### Q34: Explain the `Omit<T, K>` Utility Type.
*   **Definition:** Constructs a new type by picking all properties from type `T` and then removing a specific subset of keys `K`.
    ```typescript
    type UserBrief = Omit<User, "age">; // { id: number; name: string }
    ```

### Q35: Explain the `Partial<T>` Utility Type.
*   **Definition:** Constructs a new type containing all properties of type `T` but sets each of them as completely optional (`?`).

### Q36: Explain the `Required<T>` Utility Type.
*   **Definition:** Constructs a new type containing all properties of type `T` but forces each of them to be mandatory (removes optional `?` flags).

### Q37: Explain the `NonNullable<T>` Utility Type.
*   **Definition:** Constructs a new type by excluding `null` and `undefined` types from an existing union type `T`.

### Q38: What does the compiler flag `noImplicitAny` do?
*   **Behavior:** Throws compilation errors if a variable or parameter's type cannot be inferred and defaults implicitly to `any`. Forces developers to explicitly annotate types.

### Q39: What is Excess Property Checking?
*   **Behavior:** When passing an object literal directly to a function or variable type annotation, the compiler throws an error if it contains extra properties not declared in the target shape. Bypassed if the object is assigned to a variable first before assignment.

### Q40: What is the difference between `void` and `undefined` in function return declarations?
*   **void:** Declares that the return value is unimportant or will not be read.
*   **undefined:** Forces the function to return the literal value `undefined` (or use a bare `return;` statement).

### Q41: How do you declare a read-only array?
*   **Annotate as:** `readonly number[]` or `ReadonlyArray<number>`. Mutating methods (e.g., `push`, `pop`, `shift`) are completely removed from these structures.

### Q42: What is the `ReturnType<T>` Utility Type?
*   **Definition:** Extracts the return type of a function type `T`.
    ```typescript
    type Fn = () => string;
    type Res = ReturnType<Fn>; // string
    ```

### Q43: What is Nominal Typing? How is it simulated in TS?
*   **Nominal Typing:** Type systems (like Java) that compare types strictly based on their declared name, not shape.
*   **Simulation in TS:** Using branding or tagging (adding a unique literal marker property to structures to differentiate structurally identical shapes).

---

### Q44: How does TypeScript's type inference work, and when should you annotate anyway?
* Inference flows from initializers (`let x = 5` → number), return statements, contextual positions (callbacks typed by their target signature), and structural matching — most annotations in idiomatic TS are redundant.
* Widening: literal values widen to base types unless held by const/as const; parameters default to `any` only where noImplicitAny permits.
* Annotate explicitly at: exported public API boundaries (contracts stable against internal refactors), function parameters (no contextual info), delayed-initialization mutable state, and anywhere inference produces a *wider or wronger* type than intended (e.g., empty array `[]` → any[]).
* Rule of thumb popularized by style guides: annotate edges, let inference fill the middle.

### Q45: Why do `string` vs `String`, `number` vs `Number` differ?
* Lowercase names are TS **primitive types** — what actual JS values are; capitalized ones reference **wrapper object interfaces** (boxing artifacts like `toFixed` living on `Number.prototype`).
* Annotating `x: String` accepts primitives structurally but signals misunderstanding; returning `new String('a')` creates an object breaking `===` comparisons.
* Linting rules (`@typescript-eslint/no-wrapper-object-types`) ban the capitalized forms except when generically referencing the interface (rare).
* Correct mental model: methods on primitives resolve through prototype lookup at runtime; the type system just models that access — you never need wrapper-type annotations.

### Q46: What is `import type` and why does it matter?
* `import type { User } from './types'` imports purely for type positions — erased completely at compile time, guaranteed zero runtime import.
* Benefits: avoids accidentally pulling modules into bundles for side effects, breaks circular runtime dependencies that only need shapes, and communicates intent ("type-only dependency").
* Related flags: `verbatimModuleSyntax` forces explicitness (type imports must say `type`), while older `importsNotUsedAsValues`/`isolatedModules` addressed the same ambiguity era-by-era.
* Also applies to re-exports: `export type { Config }` keeps barrels side-effect-free.

### Q47: Optional property (`prop?: T`) vs prop allowed to be undefined (`prop: T | undefined`)?
* With `exactOptionalPropertyTypes: false` (default), they behave nearly identically — `{a?: number}` means number | undefined | missing.
* With the flag enabled, semantics diverge sharply: `a?: number` forbids explicitly assigning `undefined` (property must be absent or number), while `a: number | undefined` requires presence but tolerates undefined values.
* Practical impact: API boundary types modeling "field may be omitted" vs "field present but null-ish" become expressible precisely; JSON serialization code needs care (`JSON.stringify` drops undefined fields either way).
* Interview framing shows awareness that "optional" historically bundled two concepts and modern configs split them.

### Q48: What do `target` and `lib` control in tsconfig?
* `target`: downlevels emitted JavaScript syntax — ES5 transforms classes/arrow funcs destructuring into ES5 equivalents; ES2017+ passes async/await through natively; ESNext emits latest. Affects output size/performance and which syntax needs polyfills.
* `lib`: which ambient type declarations exist — `["ES2022", "DOM"]` grants `Object.hasOwn`, `Array.at`, DOM globals; omitting a lib makes newer builtins type-error even if runtime supports them.
* They're orthogonal: run new syntax in old browsers via target+polyfills, or describe modern globals without emitting anything (declaration-only projects set high targets).
* Common bug story: using `Array.prototype.flat` without adding `es2019` to lib → mysterious "Property 'flat' does not exist".

### Q49: How do you annotate function types — alias, inline, or interface?
```ts
type Handler = (req: Request) => Promise<Response>;      // type alias (most common)
interface Handler2 { (req: Request): Promise<Response>; } // callable interface (can merge/overload)
function route(path: string, cb: (req: Request) => Promise<Response>) {} // inline
```
* Aliases win for readability/reuse; callable interfaces add overloads + declaration merging; inline suits one-off callbacks.
* Parameter names in type signatures are documentation-only (positional binding), but great IDE hints.
* Related syntax: optional/rest/default params mirror value syntax (`(a?: T, ...rest: U[]) => V`); `this: X` first-param annotates call context.

### Q50: How do you type callback parameters correctly?
* Contextual typing usually fills them: `[1,2,3].map(n => n * 2)` — n inferred number because map's signature declares it; writing `(n: number)` manually is noise.
* Annotate when: storing the callback before passing (no context yet), exposing public APIs (consumers' DX), or accepting intentionally loose inputs (`(err: unknown)`).
* Return types: prefer letting async fns infer, but fix public ones (`Promise<Result>`) so implementation drift fails loudly rather than rippling through consumers.
* Watch contravariance: a callback typed `(e: Event) => void` may be passed where `(e: MouseEvent) => void` is expected (params bivariant in method positions, checked strictly elsewhere under strictFunctionTypes) — subtle source of unsafe handlers.

---

## Coding & Implementation Challenges

### Q51: Design a Generic, Type-Safe API Response Structure.
```typescript
export interface ApiError {
  code: string;
  message: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
}

export interface ApiResponseSuccess<T> {
  status: "success";
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiResponseFailure {
  status: "error";
  error: ApiError;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseFailure;

// Verification Test
const res: ApiResponse<string[]> = {
  status: "success",
  data: ["Post A", "Post B"],
};
```

### Q52: Implement a Type-Safe Fluent Configuration Builder.
```typescript
interface ServerConfig {
  host: string;
  port: number;
}

class ServerBuilder<HasHost extends boolean = false, HasPort extends boolean = false> {
  private config: Partial<ServerConfig> = {};

  private constructor(config?: Partial<ServerConfig>) {
    if (config) this.config = config;
  }

  static start(): ServerBuilder<false, false> {
    return new ServerBuilder();
  }

  setHost(host: string): ServerBuilder<true, HasPort> {
    return new ServerBuilder<true, HasPort>({ ...this.config, host });
  }

  setPort(port: number): ServerBuilder<HasHost, true> {
    return new ServerBuilder<HasHost, true>({ ...this.config, port });
  }

  build(this: ServerBuilder<true, true>): ServerConfig {
    return this.config as ServerConfig;
  }
}

// Verification
const server = ServerBuilder.start().setHost("localhost").setPort(8080).build();
```

### Q53: Implement the standard `MyReadonly<T>` utility type using Mapped Types.
```typescript
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Verification Test
interface User {
  name: string;
}
type ReadonlyUser = MyReadonly<User>; // { readonly name: string }
```

### Q54: Implement the standard `MyPartial<T>` utility type from scratch.
```typescript
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// Verification Test
interface User {
  id: number;
  name: string;
}
type OptionalUser = MyPartial<User>; // { id?: number; name?: string }
```

### Q55: Implement the standard `MyPick<T, K>` utility type from scratch.
```typescript
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Verification Test
interface Todo {
  title: string;
  completed: boolean;
  priority: number;
}
type TodoPreview = MyPick<Todo, "title" | "completed">; // { title: string; completed: boolean }
```

### Q56: Write a complete Type Guard function verifying if a value is a string.
```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// Verification Test
const input: unknown = "Hello";
if (isString(input)) {
  console.log(input.toUpperCase()); // Safe to use string methods
}
```

### Q57: Write a helper function that infers exact tuple literal values instead of standard array types.
```typescript
function tuple<T extends any[]>(...args: T): T {
  return args;
}

// Verification Test
const pair = tuple("id", 42); // Type inferred as: [string, number] instead of (string | number)[]
```
