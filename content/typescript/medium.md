# TypeScript - Medium Interview Questions

## Theory Questions & Answers

### Q1: Compare Index Signatures and Mapped Types.
*   **Index Signatures (`[key: string]: any`):** Define arbitrary properties on objects. Flexible, but cannot restrict keys to a specific finite union of literals.
*   **Mapped Types (`[K in Keys]: T`):** Use iteration to construct an object type based on a source union of keys. Allow dynamic property construction with full type safety.

### Q2: What are Discriminated Unions (Tagged Unions)? Why are they powerful?
*   **Definition:** A union of object types where each object has a common literal property (the "discriminated" tag).
    ```typescript
    type Shape = { kind: "circle"; radius: number } | { kind: "square"; side: number };
    ```
*   **Power:** Enables the compiler to perform complete, automatic type narrowing inside conditional or `switch` blocks based on checking the literal tag.

### Q3: How do Generics with defaults work?
*   **Definition:** Specifying a default fallback type inside generic parameters if no explicit type argument is passed during invocation.
    ```typescript
    interface Config<T = string> { value: T; }
    ```

### Q4: Compare `extends` in Type Aliases vs. Interfaces.
*   **Interfaces:** `interface A extends B {}` represents static OOP-style inheritance. If properties overlap with incompatible types, it throws a compile-time error.
*   **Type Aliases:** Used in Conditional Types (`T extends U ? X : Y`), checking if a type is assignable to/compatible with another structure. Highly dynamic.

### Q5: Explain Mapped Type modifiers (e.g., `-readonly` or `-?`).
*   **Prefix Modifiers (`+` or `-`):** Modify existing property constraints during mapping.
    *   `-readonly`: Removes `readonly` from all properties.
    *   `-?`: Removes optionality, making all properties strictly required.

### Q6: What are Template Literal Types?
*   **Definition:** String types constructed by interpolating literal unions, generating all possible combined string permutations.
    ```typescript
    type Direction = "top" | "bottom";
    type Padding = `${Direction}-padding`; // "top-padding" | "bottom-padding"
    ```

### Q7: Explain the `satisfies` operator (TS 4.9). Compare it with Type Annotations.
*   **Type Annotation (`const x: Type`):** Forces the variable to match `Type`, but widens properties to the declared type, losing specific property details.
*   **satisfies Operator (`const x satisfies Type`):** Validates that an object conforms to `Type` while retaining the most precise inferred types of the properties.

### Q8: What does the `infer` keyword do in conditional types?
*   **Definition:** Introduces a temporary generic variable inside the `extends` clause of a conditional type to let the compiler dynamically extract/infer a type from a structure.
    ```typescript
    type UnpackArray<T> = T extends (infer U)[] ? U : T;
    ```

### Q9: How do Distributive Conditional Types work?
*   **Behavior:** When conditional types check a generic parameter containing a **union type**, the compiler automatically distributes the condition across each member of the union.
    ```typescript
    type ToArray<T> = T extends any ? T[] : never;
    type Res = ToArray<string | number>; // string[] | number[]
    ```

### Q10: How do you prevent conditional distribution?
*   **Solution:** Wrap both sides of the `extends` comparison inside square brackets `[]` to form a tuple, treating the union as a single consolidated argument.
    ```typescript
    type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
    type Res = ToArrayNonDist<string | number>; // (string | number)[]
    ```

### Q11: Compare `Omit<T, K>` and `Exclude<T, U>`.
*   **Exclude<T, U>:** A utility operating on **union types**. Filters out types compatible with `U` from union `T`.
*   **Omit<T, K>:** A utility operating on **object types**. Construct a new object shape by picking properties of `T` and discarding keys in `K`. Under the hood, `Omit` uses `Exclude` on keys.

### Q12: Compare `Extract<T, U>` and `Exclude<T, U>`.
*   **Exclude:** Removes compatible types from a union.
*   **Extract:** Construct a new union type containing all members of union `T` that are assignable to union `U`.

### Q13: What do `ConstructorParameters<T>` and `InstanceType<T>` do?
*   **ConstructorParameters:** Extracts the argument types of a class constructor function as a tuple.
*   **InstanceType:** Extracts the instance return type of a class constructor function type.

### Q14: What is the `Parameters<T>` utility type?
*   **Definition:** Extracts the parameter types of a function type `T` and returns them as a structured tuple type.

### Q15: Compare `ReadonlyArray` and `as const` assertions.
*   **ReadonlyArray<T>:** Converts an array to a read-only list, preventing mutations but still allowing standard element type modifications.
*   **as const:** Recursively turns all levels of properties of objects, arrays, and tuples into immutable read-only literal types.

### Q16: What is the purpose of declaration maps (`.d.ts.map`)?
*   **Definition:** Files mapping type definitions back to their source TS files, enabling IDE "Go to Definition" commands to land in actual TS source files rather than compiled `.d.ts` declaration blocks.

### Q17: Compare Node vs. Classic module resolution strategies.
*   **Classic (Legacy):** Looks up file imports based on folder nesting, checking relative paths iteratively up parent directories.
*   **Node (Standard):** Mimics the Node.js `require` strategy. Searches inside local folders, package files, and dives into parent `node_modules` folders.

### Q18: What are Project References in TS?
*   **Definition:** A compiler feature enabling monorepos to split a large typescript project into distinct smaller, independent sub-projects (`tsconfig` files) that build and reference one another. Optimizes build times.

### Q19: Explain the lookup sequence for `node_modules/@types`.
*   The compiler resolves third-party untyped modules by searching `@types/package` in local declarations, global workspaces, and downloading definitions from the community-driven DefinitelyTyped repository.

### Q20: Explain Covariance, Contravariance, and Bivariance in TS.
*   **Covariance:** Types retain their assignability relationships. If `Dog extends Animal`, then `List<Dog> extends List<Animal>`.
*   **Contravariance:** Assignability reverses. Used in function arguments: a function accepting `Animal` is assignable to a variable expecting a function accepting `Dog` (as the wider input is safe).
*   **Bivariance:** Allows assignability in both directions. Unsafe default for experimental compiler configurations.

### Q21: Compare Enums and Const-Asserted Objects.
*   **Enums:** Compile to actual runtime object containers (or functions). Introduce runtime overhead.
*   **Const Asserted Objects (`as const`):** Erased during compile-time. All properties are treated as read-only literal values with zero compiled runtime cost.

### Q22: What is the difference between single and double type assertions?
*   **Single (`x as String`):** Valid only if the compiler detects a structural overlap between types.
*   **Double (`x as unknown as String`):** Used to bypass compiler warnings when force-converting two completely incompatible, non-overlapping types.

### Q23: Explain Assertion Signatures (`asserts condition`).
*   **Definition:** Functions that evaluate parameters and throw errors if validation fails.
    ```typescript
    function assertIsString(val: any): asserts val is string {
      if (typeof val !== "string") throw new Error();
    }
    ```
    If this function returns without throwing, the compiler narrows `val` to `string` in subsequent code.

### Q24: What does the type `Record<string, never>` mean?
*   **Definition:** Describes an object containing zero properties. Any attempt to write properties to this type causes compile-time errors.

### Q25: Explain Indexed Access Types.
*   **Definition:** Retrieving the type of a specific nested property inside an object using bracket notation.
    ```typescript
    type User = { profile: { age: number } };
    type Age = User["profile"]["age"]; // number
    ```

### Q26: Compare TypeScript's `private` class modifier vs. ECMAScript's private hash `#`.
*   **`private` keyword:** Compile-time check only. Erased from compiled JS, leaving fields fully visible and writeable during runtime.
*   **`#` syntax:** Native JavaScript private implementation. Enforces runtime encapsulation; throwing runtime errors on external access.

### Q27: How does `never` behave in conditional union distribution?
*   **Behavior:** Since `never` represents an empty union, applying a distributive conditional type to `never` immediately yields `never` without checking the branches.

### Q28: What is the `strictBindCallApply` flag?
*   **Behavior:** Enforces that the compiler verifies the parameters and call contexts when invoking functions using native `.bind()`, `.call()`, or `.apply()`.

### Q29: What is dynamic key remapping in Mapped Types?
*   **Definition:** Customizing the names of generated keys during mapping using the `as` clause inside mapped expressions.
    ```typescript
    type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };
    ```

### Q30: What are Function Overloads?
*   **Definition:** Providing multiple signature declarations detailing a function's argument-to-return combinations, followed by a single concrete implementation that handles all signature cases safely.

### Q31: How do you type the `this` context inside functions?
*   **Solution:** Declare `this` as the first pseudo-parameter of the function (which is deleted during compilation).
    ```typescript
    function logName(this: User) { console.log(this.name); }
    ```

### Q32: Why does `Object.keys(obj)` return `string[]` instead of `(keyof T)[]`?
*   **Reason:** Structural typing. JavaScript objects can run with additional, dynamically added properties at runtime that were not annotated at compile-time. Returning `keyof T[]` would imply a complete list of keys, causing potential type safety failures.

### Q33: How does the compiler evaluate intersected functions?
*   **Behavior:** Intersecting multiple function type signatures behaves exactly like function overloads. The compiler evaluates call sites starting from the first signature declaration down the chain.

### Q34: What is the purpose of the `noImplicitThis` compiler flag?
*   **Behavior:** Throws compilation errors if a function references `this` when its type is implicitly resolved to `any`. Forces developers to explicitly declare the `this` type context.

### Q35: Explain the `Awaited<T>` Utility Type.
*   **Definition:** Extracts the unwrapped resolved value of a Promise (or nested chain of promises).
    ```typescript
    type Result = Awaited<Promise<Promise<number>>>; // number
    ```

### Q36: What is the `Constructor<T>` type pattern?
*   **Definition:** Standard generic interface representing class constructors that instantiate type `T`.
    ```typescript
    type Constructor<T> = new (...args: any[]) => T;
    ```

### Q37: How do you check if a type is exactly `any` in TS?
*   **Solution:** Leverage the unique behavior of `any` which can assign to any type, but also receives any type.
    ```typescript
    type IsExactlyAny<T> = 0 extends (1 & T) ? true : false;
    ```

### Q38: What are the compile-time differences between `null` and `undefined`?
*   **`undefined`:** Represents values that are missing or uninitialized.
*   **`null`:** Represents a deliberate placeholder for an empty or non-existent value. Both are distinct unless `strictNullChecks` is toggled off.

### Q39: What is the `NonNullable<T>` utility under the hood?
*   **Compilation:** Implemented as a conditional type:
    ```typescript
    type NonNullable<T> = T extends null | undefined ? never : T;
    ```

### Q40: How does TS handle circular type definitions?
*   **Behavior:** TS permits circular type references inside interfaces, type aliases with index signatures, and functions. However, it throws errors if structural depth recursion limits (typically 50-100 levels) are exceeded.

### Q41: Explain the `exactOptionalPropertyTypes` configuration.
*   **Behavior:** When toggled on, properties declared as optional (e.g., `x?: number`) cannot be explicitly assigned the value `undefined`. It must either be assigned a `number` or completely omitted.

### Q42: What does `noPropertyAccessFromIndexSignature` do?
*   **Behavior:** Enforces that accessing fields declared strictly via index signatures must be written using bracket notation (`obj['prop']`) instead of dot notation (`obj.prop`), preventing structural key typos.

### Q43: How do template literals parse numeric indexes?
*   **Behavior:** Inside string templates, template types convert numeric index representations automatically. Combining string templates with numeric types generates safe, structured indexing patterns.

---

### Q44: How does the `assertNever` pattern enforce exhaustiveness?
* For a discriminated union handled in a switch, a final `default: return assertNever(value)` case compiles only when every member was handled above - adding a new variant then breaks compilation here first, pointing exactly where updates are needed.
```ts
function assertNever(x: never): never { throw new Error('Unhandled: ' + JSON.stringify(x)); }
type Shape = Circle | Square | Triangle;
switch (shape.kind) {
  case 'circle': ...
  case 'square': ...
  case 'triangle': ...
  default: return assertNever(shape); // narrows to never iff all cases done
}
```
* Works because after removing all members via discriminant checks, remaining type is `never`; any unhandled member leaks into the argument and triggers the error.
* Superior to silent defaults: forgetting a case becomes a compile error, not a production fall-through bug. Same idea powers exhaustive reducers and message-protocol dispatch tables.

### Q45: Explain the `K extends keyof T` generic idiom.
* Constraining a second type param to another's keys ties arguments together precisely:
```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
getProp({ age: 42 }, 'age');   // returns number - exact key tracked
```
* Without the constraint, keys degrade to `string` and returns to `any`; with it, typos fail compilation and results stay precise via indexed access.
* Composes upward: `setProp<T, K extends keyof T>(o: T, k: K, v: T[K])`, mapped utilities (`{ [P in K]: T[P] }`), and event maps (`on<E extends keyof Events>(e: E, cb: (p: Events[E]) => void)`) - the backbone of type-safe dictionaries, ORMs and emitter APIs.

### Q46: What are user-defined type guards and what contract must they obey?
* Functions asserting a predicate: `function isError(e: unknown): e is Error { return e instanceof Error; }` - inside guarded branches the parameter narrows accordingly.
* The boolean-returning body is unchecked: TS trusts your runtime test matches the declared narrowing - lying here plants landmines (narrowed-but-wrong types downstream).
* Prefer deriving from real checks (in/instanceof/discriminants); for complex validation combine with schema libraries (zod parse results typed directly, avoiding hand-written guards entirely).
* Sibling feature: assertion signatures `function assertIsUser(v: unknown): asserts v is User` - throws instead of returning false, useful for validate-or-throw flows.

### Q47: How do utility types compose in practice?
* Layered transformations read like pipelines: `Readonly<Partial<Point>>` (all-optional immutable draft), `Required<Pick<User,'email'|'name'>>`, `Record<Permission, Omit<Role,'id'>>`.
* Composition beats bespoke mapped types when intent is declarative - reviewers instantly see Partial→Required flow versus decoding nested conditionals.
* Know the interplay gotchas: `Partial<Readonly<T>>` order matters visually but distributes identically; `Omit` built on Pick/Exclude loses index signatures (documented limitation); `NonNullable<A|B>` prunes unions before mapping.
* Senior signal: recognizing when a three-line composed type replaces a twenty-line hand-rolled conditional - plus when complexity demands a named intermediate type for error messages.

### Q48: What are labeled and variadic tuple types?
* Labels document positions without changing structure: `type Range = [start: number, end: number]` - pure DX improvement in hover tooltips/signatures.
* Rest elements model prefixes/suffixes: `type Args = [name: string, ...opts: Option[]]` - variadic tuples.
* Generic tuple manipulation unlocks typed helpers: concatenation `[...T, ...U]`, `Head<T> = T extends [infer F, ...any[]] ? F : never`, typed `curry`/`zip` implementations preserving exact arities and element types through spreads.
* Combined with `as const` data, enables typed routing tables/config matrices where literal arrays become precise tuple contracts.

### Q49: What are TypeScript decorators (fundamentals)?
* Special syntax `@expr` attaching behavior to classes/methods/accessors/properties/parameters - evaluated as functions receiving metadata about the decorated target.
* Legacy experimental (`experimentalDecorators` + emitDecoratorMetadata): the NestJS/Angular/TypeORM ecosystem standard; relies on design-time type metadata emission for DI containers.
* Stage-3 standard decorators (TS 5 default): different signatures, `context` object (kind, name, static/private flags, addInitializer), composable wrappers returning replacement functions; no reflect-metadata requirement.
* Mental model: decorators = higher-order functions at class-definition time enabling cross-cutting concerns (@log, @cached, @route registration, validation binding) without touching business logic.

### Q50: What does `verbatimModuleSyntax` change, and why adopt it?
* Forces import/export statements to survive emission *exactly as written*: `import type` required for type-only imports; plain imports of types remain as runtime imports (potentially importing modules solely for side effects).
* Replaces the confusing trio (`importsNotUsedAsValues`, `isolatedModules` partial behaviors, `preserveValueImports`) with one predictable rule aligned with bundlers/esbuild/swc single-file transpilers that cannot know whether an import is a type.
* Migration effects: existing ambiguous imports start erroring - mechanical fixes (`import type` additions), often surfacing genuine accidental side-effect imports (bundle-size wins).
* Adopt alongside `isolatedModules: true` for transpiler-compatible correctness; pair with lint rules auto-fixing specifiers during codemods.

---

## Coding & Implementation Challenges

### Q51: Implement a custom type helper `MyOmit<T, K>` without standard utilities.
```typescript
type MyOmit<T, K extends keyof any> = {
  [P in Exclude<keyof T, K>]: T[P];
};

// Verification
interface Todo { id: number; title: string; completed: boolean; }
type CleanTodo = MyOmit<Todo, "completed">; // { id: number; title: string }
```

### Q52: Implement `MyExclude<T, U>` from scratch.
```typescript
type MyExclude<T, U> = T extends U ? never : T;

// Verification
type Colors = "red" | "green" | "blue";
type Selected = MyExclude<Colors, "red">; // "green" | "blue"
```

### Q53: Create a type utility `GetOptionalKeys<T>` extracting optional keys as a union.
```typescript
type GetOptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// Verification
interface User { id: number; name?: string; age?: number; }
type Opts = GetOptionalKeys<User>; // "name" | "age"
```

### Q54: Implement a mapped type helper `DeepReadonly<T>`.
```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends Function
    ? T[K]
    : T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

// Verification
interface State { data: { count: number }; }
type Immut = DeepReadonly<State>; // data is nested deep-readonly
```

### Q55: Implement a type-safe Event Emitter in TS.
```typescript
type EventMap = Record<string, any[]>;

class TypedEventEmitter<T extends EventMap> {
  private listeners = new Map<keyof T, Set<Function>>();

  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((fn) => fn(...args));
    }
  }
}

// Verification
type Events = { login: [user: string]; score: [pts: number, bonus: boolean] };
const emitter = new TypedEventEmitter<Events>();
emitter.on("login", (user) => console.log(user)); // Typed as string
```

### Q56: Create `ObjectPaths<T>` listing dot-notation string paths.
```typescript
type ObjectPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}` | `${K}.${ObjectPaths<T[K]> & string}`
        : `${K}`;
    }[keyof T & string]
  : never;

// Verification
interface Meta { user: { name: string; info: { age: number } } }
type Paths = ObjectPaths<Meta>; // "user" | "user.name" | "user.info" | "user.info.age"
```

### Q57: Write a polymorphic overloaded function to query user records.
```typescript
interface DB {
  (id: number): string;
  (ids: number[]): string[];
}

const query: DB = (idInput: any): any => {
  return Array.isArray(idInput)
    ? idInput.map((id) => `User_${id}`)
    : `User_${idInput}`;
};

// Verification
const single: string = query(1);
const multiple: string[] = query([1, 2]);
```
