# OOPS - Hard Interview Questions

### Q1: How does multiple inheritance work in C++ under the hood in terms of memory layouts and virtual base classes?
- **Memory Layout**: When Class C inherits from Class A and Class B, the memory layout of C contains the member variables of A, followed by the variables of B, and then the variables of C. This means there are **two distinct VPTRs** inside C (one pointing to a VTable for A, and one for B).
- **Virtual Base Classes**: To resolve duplicate grandparent fields (the Diamond Problem), C++ uses `virtual` inheritance. A virtual base class's members are placed at the very end of the object's layout, and accessing them requires a virtual-base offset lookup inside the VTable, avoiding duplicate subobjects.

### Q2: What is pointer offset adjustment in C++ multiple inheritance during upcasting?
- **Adjustment**: Under multiple inheritance, casting a derived pointer `C*` to a base pointer `B*` (where B is the second parent) requires the compiler to **add a byte offset** to the pointer address.
- **Reason**: The base subobject B does not start at the beginning of the object memory layout of C. When calling B's methods, the `this` pointer must be adjusted to point directly to B's start address; otherwise, B's methods would read A's variables as if they were B's.

### Q3: Explain Covariance, Contravariance, and Invariance in the context of generic types and method overrides.
- **Covariance**: Allows a type to be substituted with its subtype (e.g., `List<? extends Animal>`). Reading is safe because everything returned is an `Animal`, but writing is unsafe.
- **Contravariance**: Allows a type to be substituted with its supertype (e.g., `List<? super Dog>`). Writing is safe because you can write a `Dog` or its subclass, but reading only yields `Object`.
- **Invariance**: No substitutions allowed (e.g., `List<Animal>`). You can only assign exactly the declared type.

### Q4: How do compilers optimize dynamic dispatch calls via devirtualization?
- **Devirtualization**: The compiler converts a virtual method call (which requires VTable indirection) into a direct static call.
- **Analysis Techniques**:
  - **Class Hierarchy Analysis (CHA)**: Looks at the entire loaded class hierarchy to see if a virtual method is overridden by any subclasses. If only one implementation exists, it devirtualizes it.
  - **Escape Analysis**: Determines if an object escapes the local scope. If it doesn't, the compiler knows its exact type and can resolve calls statically.

### Q5: What are Monomorphic, Oligomorphic, and Megamorphic call sites in dynamic dispatch optimization?
- **Monomorphic**: A call site that encounters exactly **one** receiver type. Optimized via direct inlining.
- **Oligomorphic**: Encounters a small, fixed number of receiver types (usually up to 3 or 4). Optimized using a conditional check (MIP/Polymorphic Inline Cache).
- **Megamorphic**: Encounters a massive number of distinct receiver types. Requires falling back to the full VTable lookup, which is slow.

### Q6: Explain the "Expression Problem" and how classical OOP fails to solve it gracefully.
- **The Problem**: The challenge of extending a system in two directions: adding **new data variants** (classes) and adding **new operations** (methods) without modifying or recompiling existing code.
- **OOP Behavior**: Excels at adding new data variants (simply write a new subclass) but struggles to add new operations (requires modifying the base class and all subclasses, or using complex visitor patterns that freeze the class hierarchy).

### Q7: How does Java's JVM optimize object allocation on the Stack instead of the Heap?
- **Escape Analysis**: The JVM compiler analyzes if a newly created object's reference leaves the scope of the allocating thread or method.
- **Scalar Replacement**: If the object does not escape, the compiler avoids allocating it on the heap. Instead, it breaks the object down into its primitive fields and allocates them directly on the **execution stack or CPU registers**, eliminating garbage collection overhead.

### Q8: What are Mixins and Traits, and how do they differ from classical interfaces and classes?
- **Mixins/Traits**: Units of horizontal code reuse containing method implementations, designed to be composed into classes without forming parent-child relationships.
- **Differences**: Unlike classes, they cannot be instantiated directly. Unlike interfaces, they hold actual implementation logic. Unlike multiple inheritance, they resolve naming conflicts through linear ordering rules (mixins) or explicit developer choices (traits).

### Q9: Explain the theoretical Liskov Substitution Principle (LSP) in terms of Design by Contract (DbC).
- **DbC Requirements**:
  - **Preconditions**: Cannot be strengthened in a subclass. A subclass must accept at least everything the parent accepted.
  - **Postconditions**: Cannot be weakened in a subclass. A subclass must deliver at least everything the parent promised.
  - **Invariants**: Must be preserved. All constraints on parent state must hold true in the subclass.

### Q10: How does RTTI (Run-Time Type Information) work under the hood in unmanaged languages?
- **RTTI Internals**: When compile-time types are lost, the compiler includes a reference to a `std::type_info` descriptor inside the class VTable.
- **Execution**: Operations like `dynamic_cast` traverse the VTable to inspect this descriptor, dynamically walking up the type hierarchy to verify if a cast is valid. This metadata and traversal add runtime performance costs.

### Q11: Explain the "Fragile Base Class" problem at the binary level (ABI stability).
- **ABI Fragility**: Adding a field to a base class in C++ changes its physical memory footprint.
- **Impact**: Any compiled subclass library must be recompiled. If not, the subclass will offset-read fields from incorrect memory positions, leading to segmentation faults or memory corruption. Java avoids this by resolving field offsets dynamically at class-loading time.

### Q12: Compare Single Dispatch, Double Dispatch, and Multiple Dispatch.
- **Single Dispatch**: The method implementation is resolved using only **one runtime type** (the receiver object, e.g., `x.method(y)` resolves based on `x`).
- **Double Dispatch**: Resolves implementation based on the runtime types of **two objects** (the receiver and the argument).
- **Multiple Dispatch**: Resolves implementation based on the runtime types of **all** arguments in the method signature.

### Q13: How does the Visitor Pattern simulate Double Dispatch in single-dispatch languages?
- **Simulation**:
  - The client calls `element.accept(visitor)`. (First dispatch on `element`).
  - Inside `accept()`, the implementation calls `visitor.visit(this)`. Since `this` is a strongly typed reference, the compiler resolves the overloaded method on `visitor` statically based on the specific `element` type. (Second dispatch on `visitor`).

### Q14: What is Object-Relational Impedance Mismatch, and what are its core conceptual conflicts?
- **Conflicts**:
  - **Identity**: Relational databases use primary keys; OOP uses reference identity.
  - **Inheritance**: Databases don't have a native concept of inheritance (requires mapping tables via Single Table, Joined, or Table-Per-Class).
  - **Encapsulation**: OOP hides data; databases expose all data fields.
  - **Granularity**: OOP uses complex, nested object graphs; databases use flat tables.

### Q15: Explain Single Table vs. Joined vs. Table-Per-Class inheritance mapping in ORMs.
- **Single Table**: All classes in a hierarchy share one table. Fast queries (no joins), but database columns must be nullable, causing sparse tables.
- **Joined**: Each class has its own table. Clean database schema, but queries require complex, slow multi-table joins.
- **Table-Per-Class**: Each concrete subclass has its own self-contained table. Avoids nulls and joins for simple queries, but polymorphic queries across all subclasses require expensive `UNION` statements.

### Q16: How does "type erasure" affect generic programming in OOP languages like Java?
- **Type Erasure**: The compiler replaces all generic type parameters with their raw bounds (e.g., `Object`) during compilation, stripping the type parameters.
- **Consequences**:
  - You cannot instantiate generic types directly (`new T()`).
  - You cannot use `instanceof` with parameterized types at runtime (`list instanceof List<String>` is invalid).
  - Overloading methods with identical erased signatures is banned.

### Q17: What is the "Circular Dependency" problem in Dependency Injection, and how is it resolved?
- **Problem**: Class A requires Class B, and Class B requires Class A. Neither can be instantiated because their constructors depend on each other.
- **Resolutions**:
  - **Lazy Initialization**: Injecting a proxy or lazy reference that resolves the target object only when first accessed.
  - **Setter Injection**: Allowing constructor execution without dependencies, and injecting dependencies later via setter methods.

### Q18: Explain how Garbage Collection algorithms handle circular references between objects.
- **Reference Counting**: Increments a counter when an object is referenced, and decrements it when dropped. **Fails** on circular references (A points to B, B points to A; both counters remain at 1, causing memory leaks).
- **Tracing (Mark-and-Sweep)**: Starts from root references (stack, static fields) and walks the active graph. Any unreachable object, even circular loops, is garbage collected.

### Q19: What is the difference between Strong, Weak, Soft, and Phantom references?
- **Strong**: Standard references. Prevents GC deallocation.
- **Soft**: Kept alive unless the JVM is running out of memory (useful for caching).
- **Weak**: Collected on the very next garbage collection cycle regardless of memory pressure.
- **Phantom**: Enqueued in a reference queue when the object is finalized, used for post-mortem cleanups instead of unreliable finalizers.

### Q20: Explain the "Anemic Domain Model" antipattern from an OOP purity perspective.
- **Purity Failure**: It splits data from behavior. Entities are dumb data containers, while services are stateless procedural scripts.
- **Drawbacks**: Violates encapsulation, turns business logic into a series of transaction scripts, and leads to code duplication across services.

### Q21: What is "Object-Oriented Analysis & Design" (OOAD) decomposition using the DDD approach?
- **Decomposition**: Identifies business boundaries using **Bounded Contexts**. Inside a context, model elements are partitioned into:
  - **Entities**: Objects with thread of identity.
  - **Value Objects**: Immutable data holders.
  - **Aggregates**: Clusters of entities and value objects bound by a root entity that enforces transactional boundaries.

### Q22: What is the "Billion Dollar Mistake" in OOP, and how do modern OOP languages mitigate it?
- **The Mistake**: The inclusion of `null` references, leading to unpredictable null-pointer exceptions at runtime.
- **Mitigation**:
  - **Type System**: Strictly separating nullable and non-nullable types at compile-time (e.g., Kotlin, Swift, TypeScript).
  - **Monads**: Using container types like `Optional` or `Maybe` to force explicit handling of missing values.

### Q23: Explain the difference between inheritance and subtyping in type theory.
- **Inheritance**: A code-sharing mechanism. It allows a class to reuse methods and fields from a parent class.
- **Subtyping**: A behavioral compatibility relationship (behavioral subtyping). It guarantees that a subtype can substitute a supertype in any execution context safely without altering program correctness. One can exist without the other.

### Q24: How does dynamic dispatch operate in prototype-based languages like JavaScript?
- **Prototype Chain**: When a method is called on an object, the engine searches the object's immediate properties.
- **Traversal**: If not found, it navigates the internal `__proto__` pointer to the prototype object, continuing up the chain until the method is found or the chain ends at `null`. This traversal is dynamic and occurs entirely at runtime.

### Q25: What is the role of a ClassLoader in Java OOP, and how does it support isolation?
- **Role**: Dynamically loads Java bytecode classes into the JVM JVM memory.
- **Delegation Model**: Uses parent-delegation (queries parent loader first).
- **Isolation**: Classes are uniquely identified by their fully-qualified name **and** the ClassLoader that loaded them. This allows hosting multiple isolated versions of the same library simultaneously.

### Q26: Explain the "Self-Registration" pattern and how it decouples factory classes from concrete products.
- **Self-Registration**: Concrete product classes register themselves with a factory class during application startup (often inside static blocks).
- **Decoupling**: The factory maintains a registry map of keys to creator functions. This allows adding new products to the codebase without modifying the factory class code, strictly adhering to the Open-Closed Principle.

### Q27: How does memory layout alignment affect the sizing of class instances in unmanaged OOP?
- **Alignment**: Compilers align member variables to memory addresses matching multiples of their size (e.g., 4-byte integers on 4-byte boundaries).
- **Padding**: If variables are declared out of size order, the compiler inserts unused padding bytes, inflating the class size. Ordering members from largest to smallest minimizes padding.

### Q28: What is the "Tell, Don't Ask" principle, and how does it prevent procedural styles?
- **Principle**: Tell objects what action to perform instead of querying their internal state (asking), making decisions externally, and then updating their state.
- **Impact**: Keeps data and processing logic localized inside the object, reinforcing encapsulation and preventing classes from decaying into simple data structures.

### Q29: What is "Dynamic Proxy" generation in modern OOP frameworks?
- **Definition**: The generation of a class implementing a set of interfaces at **runtime** in memory.
- **Use Case**: Intercepts calls to target objects, allowing frameworks to insert cross-cutting concerns (logging, transaction management, security checks) without modifying actual class source code.

### Q30: What is "Object Slicing" in C++ during pointer casting vs. value casting?
- **Value Casting**: Assigning a subclass instance to a base class variable by-value physically slices off subclass members.
- **Pointer/Reference Casting**: Casting base pointers to subclass pointers does not slice memory, but if the pointer doesn't actually point to a subclass instance, accessing subclass fields triggers undefined memory reads.

### Q31: What are covariant and contravariant method overrides, and how are they restricted?
- **Return Types**: Can be **covariant** (more specific), as the caller expecting a parent type can safely accept the subclass return type.
- **Arguments**: Can only be **contravariant** (more general), but most languages enforce invariance on parameters. If a subclass method expects a more specific parameter type, it cannot substitute the parent method because it cannot handle all inputs the parent method could.

### Q32: What is the theoretical problem behind subclassing an immutable class?
- **The Problem**: Subclassing can introduce **mutable fields** or override methods to read from mutable state, breaking the guarantee of immutability.
- **Mitigation**: Mark immutable classes as `final` or `sealed` to prevent any subtyping that could compromise their thread-safe, immutable guarantees.

### Q33: Explain "Interface Bloat" and how it impacts class maintainability.
- **Bloat**: Occurs when an interface is continually expanded with non-essential methods, forcing all implementing classes to provide boilerplate implementations.
- **Mitigation**: Apply ISP. Extract specialized methods into auxiliary interfaces or use modern default interface methods sparingly.

### Q34: How do "Default Methods" in modern interfaces impact the diamond problem?
- **Conflict**: If a class implements two interfaces that both declare default implementations for the exact same method signature, a compiler error occurs.
- **Resolution**: The implementing class must override the conflicting method and explicitly designate which interface's method to delegate to (e.g., `InterfaceA.super.method()`).

### Q35: What is the "Fragile Base Class" compilation issue in C++ (fragile binary interface)?
- **Issue**: C++ resolves member variables using hardcoded byte offsets from the object's start pointer.
- **Impact**: If a base class adds a new variable, all offsets change, making pre-compiled binaries of subclasses read corrupt memory.

### Q36: Why is dynamic dispatch slower than static dispatch?
- **Reasons**:
  - **Indirection**: Requires traversing the object pointer to find the VPTR, dereferencing to the VTable, and dereferencing again to the function.
  - **Inlining Blockers**: Compilers struggle to inline virtual methods because the exact target isn't known until runtime, preventing critical code-flow optimizations.

### Q37: What is the "Object Identity vs. Logical Equality" issue in ORMs?
- **Issue**: Two distinct in-memory objects might represent the same database row.
- **Implication**: If placed in a set, both would coexist, breaking business logic constraints. ORM entities must override `equals` and `hashCode` to compare database primary keys rather than raw memory addresses.

### Q38: What is the "Circle-Ellipse" problem from the perspective of class invariants?
- **Invariants**:
  - Ellipse invariant: semi-major and semi-minor axes can vary independently.
  - Circle invariant: radius is uniform in all axes.
- **Conflict**: A Circle subclass inherits the ability to modify axes independently, which violates its own radius invariant. Hence, Circle is not a valid behavioral subtype of Ellipse.

### Q39: What is "Object Relational Mapping" (ORM) N+1 query problem, and how is it related to OOP navigation?
- **Problem**: Navigating an object graph lazily (e.g., looping `order.getCustomer().getName()`) triggers 1 query to fetch N orders, and then N separate database queries to fetch each customer's details.
- **Resolution**: Use eager loading (joins) or batch fetching to pull the entire graph in one step.

### Q40: What is the difference between a virtual method call and a non-virtual method call at the assembly level?
- **Non-Virtual**: Compiles to a direct `call [FunctionAddress]` instruction.
- **Virtual**: Compiles to an indirect call:
  1. Load object pointer into register `eax`.
  2. Load VPTR from `[eax]` into `ebx`.
  3. Load function pointer from `[ebx + Offset]` into `ecx`.
  4. Execute `call ecx`.

### Q41: Explain the "Law of Demeter" violation in fluent builder patterns.
- **Non-Violation**: Standard builder chains (e.g., `builder.setName().setAge().build()`) do not violate the Law of Demeter. They return intermediate builder states of the same transaction context, not navigating unrelated internal objects.

### Q42: What is "Constructive Destructive" ordering in deep inheritance hierarchies?
- **Ordering**:
  - **Construction**: Executed from top to bottom (Base class constructor runs first, then subclasses).
  - **Destruction**: Executed from bottom to top (Subclass destructor runs first, then base class cleans up).

### Q43: What is "Symmetric vs. Asymmetric" comparison in object equality?
- **Symmetric**: If `x.equals(y)` is true, `y.equals(x)` must be true.
- **Violation**: When comparing subclass and superclass objects. A subclass equals check might verify subclass-specific fields, while the superclass only checks base fields, breaking symmetry.

### Q44: What is the "Expression Problem" in multi-paradigm languages?
- **Resolution**: Multi-paradigm languages combine OOP and functional features (like pattern matching and traits) to allow adding both new data structures and new operations cleanly.

### Q45: What is "Devirtualization" and how does Monomorphic Inline Caching speed it up?
- **Monomorphic Inline Cache**: The runtime records the exact receiver type of a virtual call site. If subsequent executions encounter the same type, it jumps directly to the cached method address, bypassing VTable lookup entirely.

### Q46: Why does composition promote testability over inheritance?
- **Testability**: Composition allows dependencies to be mocked easily using interfaces. Inheritance binds classes statically, making it impossible to mock base class behaviors during subclass unit testing.

### Q47: What is the "Fragile Base Class" issue in Java, and how does the JVM handle it?
- **JVM Resolution**: Java does not use hardcoded byte offsets in binaries. It compiles references to symbolic names. At runtime, the class loader resolves symbolic references to concrete offsets, allowing safe base class updates.

### Q48: What is "Object Pooling" fragmentation?
- **Fragmentation**: When pooled objects are checked out and returned with varying internal capacities (e.g., a pooled StringBuilder that has grown to 10MB). This leads to memory bloat if objects are not shrunk or reset on return.

### Q49: What is the difference between static nested classes and inner classes in terms of memory overhead?
- **Inner Class**: Holds an implicit pointer to the outer class instance. This pointer adds 4 to 8 bytes to every object instance and can prevent the outer object from being garbage collected, causing silent memory leaks.
- **Static Nested**: No implicit pointer exists; no memory overhead or retention risks.

### Q50: How do "Cohesion" and "Coupling" relate to the "Single Responsibility Principle"?
- **Relationship**: Adhering to SRP guarantees high cohesion (since the class does only one thing) and promotes loose coupling (since it depends on minimal, well-defined boundaries of other components).
