# OOPS - Medium Interview Questions

### Q1: How do abstract classes and interfaces differ in terms of architectural design intent?
- **Abstract Class (Identity)**: Establishes an **"Is-A"** relationship. It represents a strict taxonomic lineage, sharing core structural state and common base implementations. Use it when subclasses are fundamentally related.
- **Interface (Capability)**: Establishes a **"Can-Do"** contract. It defines a protocol or behavioral capability that can be implemented by entirely unrelated classes. Use it to support horizontal decoupling.

### Q2: What is dynamic method dispatch, and how does the runtime resolve which method to call?
- **Definition**: The mechanism where a call to an overridden method is resolved at **runtime** instead of compile-time.
- **Resolution Process**: The runtime inspects the actual **object instance** in memory (not the reference pointer type). It uses the object's internal type metadata to lookup and execute the specific overriding method defined in that object's class.

### Q3: What is the Virtual Method Table (VTable) and how is dynamic dispatch implemented under the hood?
- **VTable**: A lookup table of function pointers created by the compiler for any class containing virtual methods. Each class has exactly one static VTable.
- **VPTR**: An implicit pointer added to the memory layout of each object instance pointing to its class's VTable.
- **Resolution**: During a virtual call, the compiled code dereferences the object's `VPTR`, navigates to the class's `VTable`, and jumps to the function pointer at the designated offset. This adds a slight runtime overhead of double-indirection.

### Q4: What is object slicing in C++, and why does it not occur in languages like Java or C#?
- **Object Slicing**: Occurs in C++ when a subclass object is assigned **by-value** to a parent class object. The subclass-specific member variables are "sliced away" because the parent object's memory footprint is too small.
- **Java/C# Exemption**: These languages handle objects exclusively **by-reference** on the heap. Assigning a subclass reference to a parent reference only copies the reference pointer, not the underlying object data.

### Q5: Explain the difference between early (static) binding and late (dynamic) binding.
- **Early Binding**: Occurs at compile-time. The compiler matches method calls directly to specific memory addresses. It is fast, highly optimizable, and applies to `static`, `private`, and `final` methods.
- **Late Binding**: Occurs at runtime. The target method is resolved dynamically using virtual tables. It supports polymorphism but incurs slight indirection overhead.

### Q6: What is delegation, and why is it often considered a superior alternative to inheritance?
- **Delegation**: A pattern where an object handles a request by passing it to a helper object instead of inheriting its class.
- **Advantages**:
  - **Runtime Flexibility**: The helper object can be swapped dynamically at runtime (inheritance is statically determined).
  - **Avoids Bloat**: The host class only exposes the specific methods it wants to, avoiding inheriting irrelevant parent APIs.

### Q7: How does multiple inheritance of interfaces avoid the Diamond Problem while multiple inheritance of classes does not?
- **Interface Inheritance**: Since traditional interfaces do not hold **state (instance variables)** or method bodies, inheriting duplicate interfaces does not cause conflicts. The implementing class must write exactly one concrete method, resolving any conflict.
- **Class Inheritance**: If multiple parent classes have identical state fields or distinct implementations, the compiler cannot safely resolve which parent field to update or which implementation to execute.

### Q8: What is the "Law of Demeter" (Principle of Least Knowledge) and how does it protect encapsulation?
- **Definition**: A design guideline stating that a method of an object should only call methods on: the object itself, its parameters, objects it creates, or its direct component properties.
- **Rule**: "Only talk to your immediate friends; don't talk to strangers" (e.g., avoid chains like `order.getCustomer().getAddress().getZipCode()`).
- **Benefit**: Prevents deep coupling, localized changes don't break distant parts of the codebase.

### Q9: What is the difference between structural typing (duck typing) and nominal typing in OOP?
- **Nominal Typing**: Type compatibility is determined by **explicit declarations** and class names (e.g., Java, C++). Class A cannot substitute Class B unless they share an explicit inheritance/interface hierarchy.
- **Structural Typing**: Type compatibility is determined by **shape and signature** (e.g., Go, TypeScript). If an object contains all methods specified by an interface, it is compatible, regardless of explicit declarations.

### Q10: What is reflection (introspection) in OOP, and what are its trade-offs?
- **Reflection**: The capability of a program to inspect, analyze, and modify its own structure and metadata (classes, methods, fields) at runtime.
- **Trade-offs**:
  - **Pros**: Highly dynamic (enables ORMs, dependency injection frameworks, and serializing tools).
  - **Cons**: Bypasses compile-time safety, incurs significant runtime performance overhead, and can compromise encapsulation by exposing private members.

### Q11: Explain upcasting and downcasting. Under what conditions is downcasting unsafe?
- **Upcasting**: Casting a subclass reference to a superclass reference (e.g., `Animal a = new Dog()`). It is always **inherently safe** and handled implicitly because of the "Is-A" relationship.
- **Downcasting**: Casting a superclass reference back to a subclass reference. It is **unsafe** because the referenced object might not actually be of that subclass type. It requires explicit casting and can throw a runtime class cast exception.

### Q12: What are covariant return types in method overriding, and why are they useful?
- **Covariant Return Type**: A feature allowing an overriding method in a subclass to declare a **narrower return type** than the method in the parent class.
- **Usefulness**: Eliminates the need for the caller to perform explicit downcasting when invoking overridden factory or utility methods on known subclass instances.

### Q13: Why can static or private methods not be overridden in OOP?
- **Static Methods**: Belong to the **class itself**, not object instances. They are resolved via static binding at compile-time based on the reference type.
- **Private Methods**: Are completely hidden from subclasses. A subclass declaring a method with the same signature is simply creating a **new, unrelated method** (method shadowing/hiding), not overriding the parent's method.

### Q14: What is the concept of "programming to an interface, not an implementation"?
- **Definition**: Designing systems where components interact via abstract contracts (interfaces) rather than concrete, specific classes.
- **Benefit**: Decouples the client from specific implementations, allowing different concrete classes to be substituted or swapped out dynamically without altering the client code.

### Q15: What is a marker interface, and what are the modern alternatives to it?
- **Marker Interface**: An interface with zero declared methods or variables, used as a metadata tag to signal capabilities to the compiler or runtime (e.g., `Serializable`, `Cloneable`).
- **Modern Alternatives**: **Annotations/Attributes**, which offer more descriptive parameters and metadata tagging without cluttering the type hierarchy.

### Q16: What is the difference between class-based OOP and prototype-based OOP?
- **Class-Based**: Classes act as blueprints. Objects are created via instantiation of classes. The structure is fixed at compile-time (e.g., Java, C++).
- **Prototype-Based**: There are no classes. Objects are created by cloning existing objects (**prototypes**). Behavior is shared dynamically through a chain of prototypes (e.g., JavaScript).

### Q17: How do static and instance initialization blocks execute in relation to constructors during object instantiation?
- **Execution Order**:
  1. **Static Blocks**: Execute once when the class is first loaded into memory, prior to any object creation.
  2. **Instance Initialization Blocks**: Execute every time an object is instantiated, running immediately after the parent constructor but before the active child constructor's body.

### Q18: What is the "fragile base class" problem, and how can it be mitigated?
- **Problem**: Occurs when minor modifications or bug fixes in a superclass inadvertently break the behavior or assumptions of its subclasses.
- **Mitigation**: Favor composition over inheritance, mark base methods as `final` if they shouldn't be overridden, or design superclasses strictly for extension or not at all.

### Q19: Explain the difference between a nested static class and an inner (non-static) class.
- **Nested Static Class**: Behaves like any top-level class but is grouped inside another. It **does not have a reference** to the outer class instance and can only access the outer class's static members.
- **Inner Class**: Associated with a specific instance of the outer class. It holds an **implicit reference** to the outer object, allowing it to read and write all instance fields of the outer class.

### Q20: What is the purpose of the `volatile` keyword in multi-threaded OOP environments?
- **Purpose**: Signals to the runtime and CPU that an instance variable's value must always be read from and written to **main system memory**, bypassing local CPU caches. This guarantees thread visibility of object states across concurrent executions.

### Q21: What is the "escaping references" vulnerability, and how does it break encapsulation?
- **Vulnerability**: Occurs when a getter method returns a direct reference to a private mutable internal object instead of an immutable copy.
- **Impact**: External callers can bypass the class's public API to modify the internal state directly, breaking invariants and violating encapsulation.

### Q22: Why does inheritance break encapsulation, and how does composition solve this?
- **How Inheritance Breaks It**: It exposes subclass behavior to the internal details of the superclass. Subclasses depend on the precise implementation of the parent; changes to the parent can break subclass assumptions.
- **Composition Solution**: Keeps both classes isolated. The host class only interacts with the component class through its public interface, preventing internal implementation dependencies.

### Q23: What are virtual destructors, and why are they necessary in unmanaged OOP languages like C++?
- **Virtual Destructor**: A destructor declared as `virtual` in a base class.
- **Necessity**: Ensures that when a subclass object is deleted via a base class pointer, the **subclass destructor** is executed first, followed by the base destructor. Lacking this leads to resource leaks as subclass allocations are skipped.

### Q24: What is the Liskov Substitution Principle (LSP), and what is a classic violation of it?
- **LSP**: Subclasses must be completely substitutable for their superclasses without altering the correctness of the program.
- **Violation**: The classic **Square-Rectangle** dilemma. A `Square` inherits from `Rectangle`. `Rectangle` allows setting width and height independently. If `Square` overrides these to keep them equal, it breaks the base class assumption that changing width leaves height unchanged.

### Q25: What is the Interface Segregation Principle (ISP), and how does it prevent bloated systems?
- **ISP**: Clients should not be forced to depend on methods they do not use.
- **Solution**: Splitting large, multi-purpose interfaces into smaller, cohesive, specialized ones. This prevents implementing classes from having to write empty or throwing dummy implementations for unwanted methods.

### Q26: What is the Dependency Inversion Principle (DIP), and how does it decouple layers?
- **DIP**:
  1. High-level modules should not depend on low-level modules. Both should depend on abstractions.
  2. Abstractions should not depend on details. Details should depend on abstractions.
- **Result**: Decouples application layers, making core business logic highly portable and insulated from infrastructure changes.

### Q27: Compare pass-by-value and pass-by-reference in the context of object arguments.
- **Pass-by-Value**: Copies the actual value. For objects, this can mean copying the entire memory block (C++) or copying the **reference pointer** itself (Java/JS/C#). In Java, you cannot change which object the caller's pointer references, but you can mutate its fields.
- **Pass-by-Reference**: Passes an alias to the original variable. Modifying the variable inside the function changes the object and re-assigns the caller's reference.

### Q28: What is a Factory Method, and how does it improve object creation over constructors?
- **Factory Method**: A static or instance method that encapsulates object instantiation.
- **Advantages**:
  - Can return subclass types instead of just the exact class.
  - Can have descriptive names (constructors are forced to share the class name).
  - Can reuse cached objects instead of allocating fresh heap memory every call.

### Q29: What is object pooling, and what are its trade-offs?
- **Definition**: Pre-instantiating a fixed set of objects and keeping them in a cache (pool) for reuse instead of constantly allocating and garbage collecting them.
- **Trade-offs**:
  - **Pros**: Drastically reduces garbage collection overhead and allocation latency (critical for database connections, threads, or game entities).
  - **Cons**: Increases memory footprint, adds synchronization overhead, and requires careful resetting of object state upon return.

### Q30: What is the Single Responsibility Principle (SRP), and how do you identify a violation?
- **SRP**: A class should have **one, and only one, reason to change**.
- **Identification**: If a class performs business logic, handles database queries, and formats output strings, it has multiple responsibilities. Each distinct concern should be factored into its own class.

### Q31: How do abstract classes/interfaces enable the Open-Closed Principle (OCP)?
- **Mechanics**: By defining behaviors as abstract contracts, the system's core execution flow remains static (**closed for modification**). When new requirements arise, developers simply write new implementation classes (**open for extension**) and inject them.

### Q32: Explain the "Circle-Ellipse" dilemma in object-oriented modeling.
- **Dilemma**: Mathematically, a Circle is a specialized Ellipse. However, in OOP, if `Ellipse` has a method `stretchX()`, a `Circle` cannot support it without violating its geometric invariant (radius integrity).
- **Lesson**: Mathematical subtyping does not map directly to behavioral subtyping in software design.

### Q33: What is method hiding (shadowing), and how does it differ from overriding?
- **Method Hiding**: Occurs when a subclass defines a static method with the exact same signature as a static method in the superclass.
- **Difference**: Overriding is resolved dynamically at runtime. Hiding is resolved statically at compile-time based on the declared reference type, not the concrete instance type.

### Q34: What is the difference between association, aggregation, and composition in terms of lifecycle ownership?
- **Association**: Peer-to-peer relationship; objects are independent.
- **Aggregation**: Parent-child relationship; child can exist without parent. Parent holds pointer to child but doesn't manage its allocation.
- **Composition**: Sole ownership; child cannot exist without parent. Parent manages lifecycle (allocation/deallocation) of the child.

### Q35: Why is the `clone()` method in Java widely considered design-flawed?
- **Flaws**:
  - It does not invoke constructors, bypassing initialization logic.
  - It is defined in the `Object` class but throws a checked exception if the class doesn't implement a separate marker interface `Cloneable`.
  - It returns a shallow copy by default, forcing manual deep copy implementations.

### Q36: Explain the difference between reference identity and object equality.
- **Identity**: Verifies if two references point to the **exact same memory address** on the heap (e.g., `==` operator in Java).
- **Equality**: Verifies if two distinct objects contain **equivalent state data** based on logical comparison rules (e.g., `equals()` method in Java).

### Q37: What is the connection between `equals()` and `hashCode()` contracts?
- **Contract**: If two objects are equal according to `equals()`, they **must** return the identical hash code from `hashCode()`.
- **Failure Consequence**: Breaking this contract causes hash-based collections (like `HashMap`, `HashSet`) to lose objects or fail to locate them, leading to silent bugs.

### Q38: What is a fluent interface, and how is it constructed?
- **Definition**: An API designed to maximize readability by using **method chaining** to form readable, sentence-like calls.
- **Construction**: Achieved by returning `this` (the current object reference) from every setter or configuration method in the class.

### Q39: What is the "Active Record" pattern, and how does it model objects?
- **Active Record**: An architectural pattern where a class represents a database table, and an instance of that class represents a specific row.
- **Nature**: The object contains **both data fields and database access methods** (`save()`, `update()`, `delete()`), combining business logic with persistence.

### Q40: What is the "Data Mapper" pattern, and how does it differ from Active Record?
- **Data Mapper**: A pattern where database interaction is separated from domain objects.
- **Difference**: Domain objects are pure business objects (**POJOs/Entities**) with zero database awareness. A separate, specialized mapping layer handles moving data between the objects and the database, enforcing better separation of concerns.

### Q41: How do access modifiers influence class extensibility in API design?
- **Encapsulation vs Extensibility**: Keeping fields `private` preserves encapsulation but forces subclasses to use public APIs. Marking methods `protected` allows subclasses to access internals but exposes API details, creating fragile subclass dependencies if internals change.

### Q42: What is "Anemic Domain Model" vs "Rich Domain Model"?
- **Anemic**: Entities are data-holders with only getters/setters, while business logic resides entirely in separate service classes. Often criticized for being procedural rather than object-oriented.
- **Rich**: Entities contain both state data and the relevant business behaviors/rules, aligning with true OOP encapsulation.

### Q43: What is double dispatch, and why is it needed?
- **Definition**: A mechanism where a method call is dispatched based on the runtime types of **two objects** (the receiver and the argument).
- **Need**: Standard single dispatch only resolves polymorphic calls based on the receiver's type. Double dispatch bypasses this limitation, often implemented using the Visitor Pattern.

### Q44: What are the performance overheads associated with OOP?
- **Overheads**:
  - **Indirect Calls**: Dynamic dispatch requires pointer chasing in the VTable.
  - **Memory Footprint**: Object headers, VPTRs, and metadata overhead inflate memory.
  - **Garbage Collection**: Frequent allocation of small objects triggers collector churn.

### Q45: Compare Abstract Factory and Factory Method.
- **Factory Method**: Focuses on instantiating a **single product** using inheritance. The base class defers the exact instantiation details to subclass overrides.
- **Abstract Factory**: Focuses on instantiating families of **multiple related products** using composition. It defines an interface with multiple factory methods.

### Q46: Why are global variables/states bad in OOP, and how do we resolve them?
- **Drawbacks**: Bypasses encapsulation, creates hidden dependencies, makes unit testing in isolation impossible, and causes race conditions in multithreaded systems.
- **Resolution**: Use dependency injection to pass required configurations or service objects directly.

### Q47: What is the difference between a value object and an entity?
- **Value Object**: Defined entirely by its attributes; has **no unique identity** (e.g., `Money(50, USD)`). Two value objects with identical fields are interchangeable and are typically immutable.
- **Entity**: Defined by a **thread of continuity and unique ID** (e.g., `User(ID=55)`), which persists even if all other attributes change over time.

### Q48: What is data hiding, and how does it differ from encapsulation?
- **Encapsulation**: The packaging of data and methods together into a unified class construct.
- **Data Hiding**: Securing state access by declaring variables `private`. Encapsulation can be achieved without data hiding (e.g., having public fields), but true security requires both.

### Q49: What is the "God Class" antipattern, and how do we refactor it?
- **Antipattern**: A single, massive class that handles a disproportionate share of the system's logic, reducing other classes to simple data structures.
- **Refactoring**: Apply SRP. Analyze and break down the class's functions into logical boundaries, extracting them into cohesive, single-purpose classes.

### Q50: Can abstract classes have constructors? If yes, what is their purpose?
- **Yes**: Abstract classes can declare constructors.
- **Purpose**: Since abstract classes can hold instance states, their constructors are invoked via `super()` inside subclass constructors to initialize parent-level fields during object creation.
