# Low-Level Design (LLD) - Core Concepts & Object-Oriented Principles

Welcome to the Low-Level Design (LLD) Foundations Guide. This codex provides 50 foundational low-level design and object-oriented concept questions with in-depth explanations, real-world examples, and design pattern mechanics.

---

## Theory Questions & Answers

### Q1: What is the purpose of Low-Level Design (LLD)?

**Answer:**
Low-Level Design (LLD) transforms abstract high-level architectural requirements into concrete, implementable software blueprints—specifying class structures, object relationships, design patterns, method signatures, and state transitions before writing production code.
*   **Why it matters:** It eliminates architectural ambiguity, prevents costly refactors, and ensures the codebase remains modular, unit-testable, and scalable.
*   **Real-World Example:** In designing a **Parking Lot System**, LLD defines the exact inheritance hierarchy between `Vehicle` $\to$ (`Car`, `Motorcycle`, `Truck`), the strategy pattern for `FeeCalculationStrategy`, and the thread-safe synchronization on `ParkingSpot.occupy()`.

---

### Q2: How does database indexing optimize queries in LLD data persistence?

**Answer:**
Database indexing constructs an auxiliary data structure (typically a B+ Tree, Hash Table, or GiST/GIN index) that maps key column values to their physical disk block addresses, eliminating slow $O(N)$ full table scans.
*   **Mechanism:** By maintaining sorted keys in a balanced tree, lookups, range scans, and foreign key joins drop to $O(\log N)$ disk page reads.
*   **Real-World Example:** In an e-commerce order database, adding a composite index on `(customer_id, order_date DESC)` allows the user profile page to fetch the last 10 orders in 2ms instead of scanning 50 million rows.

---

### Q3: What are the Four Pillars of OOP and their practical benefits?

**Answer:**
1.  **Encapsulation:** Bundling internal state and behaviors within a class while restricting direct access via access modifiers (`private`, `protected`). Prevents invalid state mutations (e.g., preventing a `BankAccount.balance` from becoming negative directly).
2.  **Abstraction:** Hiding complex internal implementation details behind clean, minimal public interfaces (e.g., calling `paymentGateway.charge(amount)` without exposing TLS socket handshakes).
3.  **Inheritance:** Reusing common fields and methods from a base class in derived classes to model "is-a" relationships (e.g., `SavingsAccount extends BankAccount`).
4.  **Polymorphism:** Enabling objects of different types to respond to the same method invocation with custom runtime behavior (e.g., iterating through a list of `Notification` objects and calling `send()`, where email, SMS, and push notifications execute their own logic).

---

### Q4: Why is concurrency control important in Low-Level Design?

**Answer:**
In multi-threaded environments, concurrent execution without proper synchronization leads to **race conditions, deadlocks, lost updates, and memory visibility bugs**.
*   **Mechanism:** LLD uses mutexes, read-write locks (`ReentrantReadWriteLock`), atomic variables (`AtomicInteger`), or optimistic concurrency controls (`Compare-And-Swap`).
*   **Real-World Example:** In a ticket booking system, if two threads attempt to book seat `B14` at the exact same millisecond, concurrency control ensures only one thread successfully acquires the seat lock while the other receives a `SeatAlreadyBookedException`.

---

### Q5: What are UML Behavioral Diagrams and when are they used?

**Answer:**
UML Behavioral Diagrams visualize the dynamic runtime interactions, state changes, and time-ordered message flows between system components.
*   **Primary Types:**
    *   *Sequence Diagrams:* Depict step-by-step lifecycles and asynchronous RPC/method calls between actors and services over time.
    *   *State Machine Diagrams:* Model an entity's lifecycle through discrete states and transition triggers.
    *   *Activity Diagrams:* Model complex procedural workflows and parallel execution forks (like an order fulfillment pipeline).

---

### Q6: Walk through a UML Sequence Diagram for a User Login flow.

**Answer:**
A standard time-ordered sequence flow:
1.  **User $\to$ UI Client:** Submits email and password.
2.  **UI Client $\to$ AuthController:** `POST /api/v1/auth/login` payload.
3.  **AuthController $\to$ AuthService:** Invokes `authenticate(email, rawPassword)`.
4.  **AuthService $\to$ UserRepository:** `findByEmail(email)`.
5.  **UserRepository $\to$ Database:** Executes parameterized SQL query.
6.  **Database $\to$ UserRepository:** Returns `UserRecord` with `passwordHash`.
7.  **AuthService:** Validates password hash via `bcrypt.compare()`.
8.  **AuthService $\to$ TokenProvider:** Generates signed JWT access & refresh tokens.
9.  **AuthController $\to$ UI Client:** Returns HTTP 200 with HttpOnly session cookie.

---

### Q7: When and why should you use a State Diagram in LLD?

**Answer:**
State Diagrams model systems where an entity transitions through well-defined, mutually exclusive states triggered by discrete business events.
*   **Why it matters:** It prevents illegal transitions (e.g., refunding an order that was never paid).
*   **Real-World Example:** An `Order` lifecycle transitions: `CREATED` $\to$ (on payment success) $\to$ `PAID` $\to$ (on warehouse pickup) $\to$ `SHIPPED` $\to$ `DELIVERED`. If payment fails, it transitions `CREATED` $\to$ `FAILED`.

---

### Q8: What factors influence data structure selection in LLD?

**Answer:**
1.  **Access Pattern:** Frequent random lookups by key require a `HashMap` ($O(1)$) vs. ordered range traversal requiring a `TreeMap` / B-Tree ($O(\log N)$).
2.  **Insertion/Deletion Cost:** Frequent head/tail additions favor `LinkedList` / `ArrayDeque`.
3.  **Memory Overhead:** Contiguous arrays (`ArrayList`) maximize CPU L1/L2 cache locality compared to pointer-heavy node structures.
4.  **Thread Safety:** Single-threaded collections vs. lock-striped concurrent collections (e.g., `ConcurrentHashMap`).

---

### Q9: What are the benefits of Database Normalization in LLD?

**Answer:**
Normalization (1NF through 3NF/BCNF) organizes relational tables to eliminate data redundancy and anomalies:
*   *Insertion Anomaly:* Inability to record an entity without creating another unrelated record.
*   *Update Anomaly:* Inconsistent records when updating duplicated data across multiple rows.
*   *Deletion Anomaly:* Accidental loss of data when deleting an associated record.
*   **Real-World Example:** Separating `Users` and `Orders` into normalized tables prevents updating a user's address in 100 historical order rows.

---

### Q10: How do you design logging and observability for a complex application?

**Answer:**
1.  **Structured JSON Logging:** Emit logs as structured JSON objects containing timestamp, severity (`DEBUG`, `INFO`, `WARN`, `ERROR`), `trace_id`, `span_id`, and contextual metadata.
2.  **Correlation IDs:** Propagate a unique request ID across all internal method boundaries and microservices to trace the exact execution path.
3.  **Centralized Ingestion:** Use asynchronous non-blocking log appenders (Logback AsyncAppender) pushing to ELK (Elasticsearch/Logstash/Kibana) or Grafana Loki.

---

### Q11: What is Tight Coupling and why must it be avoided?

**Answer:**
Tight coupling occurs when a class depends directly on the concrete implementation of another class rather than an interface.
*   **Why avoid it:** Modifying the dependency breaks the dependent class; isolated unit testing becomes impossible because dependencies cannot be mocked.
*   **Solution:** Depend on abstractions via **Dependency Inversion** and inject instances using **Dependency Injection** (e.g., `OrderService` depends on `IPaymentProcessor`, allowing easy swapping between `StripeProcessor` and `PayPalProcessor`).

---

### Q12: What are Design Patterns and why do they matter?

**Answer:**
Design Patterns are battle-tested, standardized solutions to recurring software engineering and object-oriented design problems.
*   **Value:** They provide a shared architectural vocabulary across engineering teams, accelerate development, and ensure systems adhere to SOLID principles for maintainability, loose coupling, and high cohesion.

---

### Q13: Explain the Singleton Pattern, its use cases, and common pitfalls.

**Answer:**
The **Singleton Pattern** ensures a class has only one instance and provides a global access point to it.
*   **Use Cases:** Database connection pools, thread pools, logging managers, and hardware driver interfaces.
*   **Implementation:** Private constructor, static instance variable, and thread-safe Double-Checked Locking.
*   **Pitfalls:** Introduces hidden global state, tightly couples caller code, violates Single Responsibility Principle, and makes unit testing difficult unless mockable via interfaces.

---

### Q14: Explain the Observer Pattern with a real-world example.

**Answer:**
The **Observer Pattern** defines a one-to-many dependency where when a subject changes state, all registered observers are notified automatically.
*   **Structure:** `Subject` maintains a list of `Observer` interfaces and exposes `registerObserver()`, `removeObserver()`, and `notifyObservers()`.
*   **Real-World Example:** In a stock trading platform, `StockTicker` (Subject) notifies `MobilePushNotifier`, `AuditLogService`, and `TraderDashboardUI` (Observers) whenever a stock price changes.

---

### Q15: Explain the Factory Method Pattern.

**Answer:**
The **Factory Method Pattern** delegates object instantiation to subclasses or dedicated factory methods, allowing client code to remain decoupled from concrete class names.
*   **Structure:** Client calls `PaymentFactory.getProcessor("UPI")` and receives an object implementing `IPaymentProcessor`.
*   **Real-World Example:** A document processing app uses a `DocumentParserFactory` to return `PDFParser`, `CSVParser`, or `WordParser` based on the file extension.

---

### Q16: Explain the Strategy Pattern with a real-world example.

**Answer:**
The **Strategy Pattern** defines a family of interchangeable algorithms, encapsulates each one into a separate class, and makes them interchangeable at runtime.
*   **Structure:** Context holds a reference to a `Strategy` interface and delegates execution.
*   **Real-World Example:** An e-commerce checkout system swaps between `FlatRateShippingStrategy`, `ExpressWeightBasedShippingStrategy`, and `FreePrimeShippingStrategy` dynamically based on the user's tier.

---

### Q17: What is the role of Interfaces in LLD?

**Answer:**
Interfaces establish formal contracts specifying *what* operations a component provides without prescribing *how* they are executed.
*   **Benefits:** Enables polymorphism, promotes loose coupling, facilitates test-driven development (TDD) via mock implementations, and satisfies the **Dependency Inversion Principle (DIP)**.

---

### Q18: How do you choose a sorting algorithm for large datasets?

**Answer:**
1.  **Fits in Memory (In-Memory Sort):**
    *   *QuickSort:* Average $O(N \log N)$, low memory overhead (in-place). Standard for primitive types.
    *   *MergeSort / TimSort:* Guaranteed $O(N \log N)$, stable. Standard for objects (Java `Arrays.sort`).
2.  **Exceeds Memory (External Sorting):**
    *   *External Merge Sort:* Splits multi-gigabyte files into memory-sized chunks, sorts each in RAM, writes temporary files to disk, and merges them using a min-heap priority queue.

---

### Q19: How do you handle API Versioning and Backward Compatibility in LLD?

**Answer:**
1.  **URI Versioning:** `/api/v1/users` vs `/api/v2/users` (most explicit and transparent).
2.  **Header Versioning:** `Accept: application/vnd.app.v2+json`.
3.  **Additive Changes Only:** When evolving models, add optional fields rather than deleting or renaming existing fields.
4.  **Deprecation Windows:** Tag old endpoints with `@Deprecated` headers (`Sunset: Wed, 11 Nov 2026 00:00:00 GMT`).

---

### Q20: How do you design secure Authentication and Authorization in distributed systems?

**Answer:**
1.  **Authentication (AuthN):** Use stateless cryptographic tokens (JWTs) signed with asymmetric keys (RS256). Passwords hashed using bcrypt/Argon2 with unique salts.
2.  **Authorization (AuthZ):** Implement **Role-Based Access Control (RBAC)** or **Attribute-Based Access Control (ABAC)** verified at the API Gateway or middleware layer.
3.  **Token Rotation:** Short-lived access tokens (15 mins) paired with HttpOnly, Secure, SameSite refresh tokens stored in Redis.

---

### Q21: Why is Modular Design critical in software architecture?

**Answer:**
Modular design decomposes a monolithic codebase into discrete, loosely coupled packages with high internal cohesion.
*   **Benefits:** Teams can build, test, and refactor individual modules without risk of collateral damage to other features. Reduces build times and enables parallel feature development.

---

### Q22: Why is Low-Level Design (LLD) essential before coding?

**Answer:**
Writing code without LLD leads to fragile "spaghetti code", cyclic dependencies, missing concurrency handling, and costly architectural rewrites. LLD establishes class boundaries, data contracts, and design patterns early when changes cost minutes rather than weeks.

---

### Q23: What are the most common data structures used in LLD?

**Answer:**
*   **Arrays / Dynamic Arrays (`ArrayList`):** $O(1)$ random access, high CPU cache locality.
*   **Hash Maps / Hash Sets:** $O(1)$ average key lookups, deduplication.
*   **LinkedList / Deque:** $O(1)$ head/tail operations, used in LRU caches and task queues.
*   **Priority Queues (Binary Heaps):** $O(\log N)$ min/max extraction, used in rate limiters and schedulers.
*   **Trees (Trie, B+ Tree):** Autocomplete prefix matching, database indexing.

---

### Q24: What are the core principles of Database Schema Design?

**Answer:**
1.  **Normalization:** Normalize to 3NF to prevent write anomalies; denormalize deliberately only for read-heavy query performance.
2.  **Foreign Keys & Constraints:** Enforce referential integrity and check constraints at the database level.
3.  **Indexing:** Create B+ Tree indexes on foreign keys, unique columns, and frequent `WHERE` filter predicates.
4.  **Auditing:** Include `created_at`, `updated_at`, and `is_deleted` (soft deletes) on all tables.

---

### Q25: What is Object-Oriented Design (OOD) and why does it matter?

**Answer:**
Object-Oriented Design models a real-world domain as collaborating software objects that encapsulate data (state) and methods (behavior). OOD promotes modularity, testability, reusability, and maintainability across large engineering teams.

---

### Q26: What is Dependency Injection (DI) and what are its advantages?

**Answer:**
**Dependency Injection** is a design pattern where an object receives its dependencies from an external assembler (e.g., Spring, Guice) rather than instantiating them internally (`new Service()`).
*   **Advantages:** Eliminates hardcoded dependencies, makes components easily swappable, and allows unit tests to inject mock implementations.

---

### Q27: List and explain common UML Diagrams.

**Answer:**
1.  **Class Diagram (Structural):** Shows classes, attributes, methods, and relationships (inheritance, aggregation, composition).
2.  **Sequence Diagram (Behavioral):** Shows time-ordered method invocations between objects.
3.  **Use Case Diagram:** Depicts system boundaries and actor interactions.
4.  **State Machine Diagram:** Depicts entity lifecycle states and event transitions.
5.  **Activity Diagram:** Flowchart of business processes and parallel forks.

---

### Q28: What are Code Smells and how do you resolve them?

**Answer:**
**Code Smells** are symptoms of poor structural design that indicate deeper maintainability issues.
*   *Long Method:* Break into smaller, single-responsibility private helper methods.
*   *God Class / Large Class:* Split into cohesive domain classes following SRP.
*   *Feature Envy:* Move methods closer to the data they operate on.
*   *Duplicate Code:* Extract reusable utility classes or template methods (DRY).

---

### Q29: What are the three primary categories of Gang of Four (GoF) Design Patterns?

**Answer:**
1.  **Creational Patterns:** Focus on object creation mechanisms (Singleton, Factory Method, Abstract Factory, Builder, Prototype).
2.  **Structural Patterns:** Focus on class and object composition (Adapter, Decorator, Facade, Composite, Proxy, Bridge).
3.  **Behavioral Patterns:** Focus on communication and algorithms between objects (Observer, Strategy, Command, State, Chain of Responsibility, Iterator).

---

### Q30: Explain all 5 SOLID Principles with concise definitions.

**Answer:**
1.  **Single Responsibility Principle (SRP):** A class should have one, and only one, reason to change.
2.  **Open/Closed Principle (OCP):** Software entities should be open for extension, but closed for modification.
3.  **Liskov Substitution Principle (LSP):** Subtypes must be substitutable for their base types without altering program correctness.
4.  **Interface Segregation Principle (ISP):** Clients should not be forced to depend on interface methods they do not use.
5.  **Dependency Inversion Principle (DIP):** High-level modules should not depend on low-level modules; both must depend on abstractions.

---

### Q31: What is the DRY (Don't Repeat Yourself) Principle?

**Answer:**
The DRY principle states that every piece of knowledge or business logic must have a single, unambiguous, authoritative representation within a system. Duplication causes maintenance nightmares where updating a business rule in one place leaves copies outdated.

---

### Q32: When should you avoid design patterns to prevent over-engineering?

**Answer:**
Design patterns should be avoided when the problem does not genuinely warrant extra abstraction. Introducing patterns prematurely adds unnecessary indirection, interfaces, and boilerplate files. Always start with simple, readable code (KISS) and refactor into patterns only when complexity and recurring variation emerge.

---

### Q33: How do design patterns manage dependencies at scale?

**Answer:**
Patterns decouple high-level business logic from concrete technical implementations by introducing intermediary interfaces, factories, and dependency injection containers. This allows swapping databases, payment processors, or third-party APIs with zero changes to core domain logic.

---

### Q34: What is the KISS (Keep It Simple, Stupid) Principle?

**Answer:**
The KISS principle dictates that systems work best when kept simple rather than made complex. Avoid clever, obscure tricks; favor clear, straightforward, easily readable code that any junior developer can maintain and debug.

---

### Q35: What is the YAGNI (You Aren't Gonna Need It) Principle?

**Answer:**
YAGNI states that a programmer should not add functionality until it is deemed necessary. Avoid building speculative features or hypothetical extension points that add maintenance overhead and are rarely used.

---

### Q36: What is the difference between Abstract Factory and Factory Method?

**Answer:**
*   **Factory Method:** Uses inheritance to create a **single product** (e.g., `createButton()`).
*   **Abstract Factory:** Uses composition to create **families of related or dependent products** without specifying their concrete classes (e.g., `GUIFactory` creates matching `Button`, `Checkbox`, and `Scrollbar` for Windows or Mac).

---

### Q37: What are the disadvantages of the Singleton Pattern?

**Answer:**
1.  Introduces global state, making state changes unpredictable across distant modules.
2.  Violates Single Responsibility Principle (manages its own lifecycle and business duty).
3.  Hampers unit testing (cannot easily inject mock singletons).
4.  Can mask bad architecture where dependencies should have been passed explicitly.

---

### Q38: What is the difference between Proxy and Decorator Patterns?

**Answer:**
*   **Proxy Pattern:** Controls and manages **access** to an object (e.g., security check, lazy loading, caching) without altering the interface or primary behavior.
*   **Decorator Pattern:** Dynamically **augments or adds new behavior** to an object at runtime (e.g., adding encryption or compression to a data stream).

---

### Q39: What problem does the Chain of Responsibility Pattern solve?

**Answer:**
It decouples the sender of a request from its potential receivers by passing the request along a sequential chain of handler objects. Each handler decides either to process the request or pass it to the next handler in the chain (e.g., an HTTP Middleware Pipeline checking Auth $\to$ Rate Limiting $\to$ CORS $\to$ Request Validation).

---

### Q40: What is the difference between Composition and Aggregation?

**Answer:**
Both are "has-a" relationships:
*   **Composition (Strong Ownership):** The child entity's lifecycle is bound to the parent. If parent is destroyed, child is destroyed (e.g., `House` and `Room`).
*   **Aggregation (Weak Ownership):** The child entity can exist independently of the parent (e.g., `Department` and `Professor`).

---

### Q41: How does the Command Pattern support Undo/Redo operations?

**Answer:**
The **Command Pattern** encapsulates a request as a standalone object containing all information needed to execute the action (receiver, method, arguments) plus an `unexecute()` / `undo()` method.
*   **Mechanism:** Commands are pushed onto an execution `HistoryStack`. When the user presses `Ctrl+Z`, the system pops the latest command and calls its `undo()` method, pushing it to the `RedoStack`.

---

### Q42: Explain Association vs. Aggregation vs. Composition.

**Answer:**
*   **Association:** General relationship where two classes know about each other (e.g., `Doctor` and `Patient`).
*   **Aggregation:** Specialized association with a "whole-part" relationship where parts exist independently (e.g., `Car` and `Wheel`).
*   **Composition:** Strict "whole-part" relationship with coincident lifecycles (e.g., `Order` and `OrderItem`).

---

### Q43: Can multiple design patterns be combined in a single application?

**Answer:**
Yes, real-world systems routinely combine patterns. For example, the **MVC (Model-View-Controller)** pattern combines **Observer** (Model notifies View of updates), **Strategy** (Controller acts as a strategy for the View), and **Composite** (Nested UI view hierarchies).

---

### Q44: What factors should you evaluate before applying a design pattern?

**Answer:**
1.  Is there a genuine recurring problem, or is simple code sufficient?
2.  Will the pattern improve testability and loose coupling?
3.  Does the team understand the pattern, or will it create cognitive overhead?
4.  Does the pattern introduce unacceptable runtime indirection or latency?

---

### Q45: What is the Null Object Pattern and what problem does it solve?

**Answer:**
The **Null Object Pattern** replaces `null` references with an object that implements the expected interface but performs a safe no-operation (no-op).
*   **Benefit:** Eliminates boilerplate `if (object != null)` checks across the codebase, preventing `NullPointerException` bugs (e.g., using a `NullLogger` when logging is disabled).

---

### Q46: What is the difference between a Static Factory Method and the Factory Pattern?

**Answer:**
*   **Static Factory Method:** A simple static method on a class that returns an instance (e.g., `LocalDate.of(2026, 8, 29)` or `Integer.valueOf("42")`). It does not involve polymorphism or subclassing.
*   **Factory Pattern:** An object-oriented design pattern utilizing inheritance or interfaces to defer instantiation to subclasses.

---

### Q47: What is the difference between Abstraction and Encapsulation?

**Answer:**
*   **Abstraction:** Focuses on **what** an object does. Hides implementation complexity behind public interfaces.
*   **Encapsulation:** Focuses on **how** to restrict access. Hides internal state data within classes using `private` variables to enforce invariants.

---

### Q48: Why is Composition generally preferred over Class Inheritance?

**Answer:**
"Favor Object Composition over Class Inheritance" (Gang of Four):
1.  **Flexibility:** Behavior can be swapped dynamically at runtime using interfaces (Strategy Pattern).
2.  **Avoids Fragile Base Class Problem:** Changes to base class methods do not silently break derived classes.
3.  **Prevents Class Explosion:** Avoids massive deep inheritance trees (e.g., `FlyingElectricAutonomousVehicle`).

---

### Q49: What is Polymorphism and what are its two primary types?

**Answer:**
**Polymorphism** allows treating objects of different derived classes through a common base interface.
1.  **Compile-Time (Static / Overloading):** Multiple methods with the same name but different parameter signatures within the same class.
2.  **Runtime (Dynamic / Overriding):** A subclass overrides a virtual method defined in its superclass/interface; the JVM resolves the exact method at runtime via virtual method tables (vtable).

---

### Q50: What is the difference between an Interface and an Abstract Class?

**Answer:**
*   **Interface:** A pure contract containing abstract method declarations. A class can implement multiple interfaces (supporting multiple inheritance of type). Best for defining capabilities across unrelated classes (e.g., `Comparable`, `Serializable`).
*   **Abstract Class:** Can contain state variables, constructors, and partial concrete method implementations. A class can only inherit from one abstract class. Best for closely related classes sharing core baseline logic.
