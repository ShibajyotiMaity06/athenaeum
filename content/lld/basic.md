# LLD - Basic Interview Questions

### Q1: What is Low-Level Design (LLD) and how does it fit into the software development life cycle?
- **LLD (Object-Oriented Design)**: The process of translating business requirements and high-level architecture (HLD) into a detailed, executable blueprint containing classes, interfaces, relationships, and design patterns.
- **SDLC Fit**: It bridges the gap between **High-Level Design (HLD)** (services, databases, system architecture) and **actual coding/implementation**.

### Q2: What is the main objective of LLD?
- **Objectives**:
  - Guarantee **maintainability**, readability, and testability of the code.
  - Implement structural **SOLID principles** and standard design patterns.
  - Establish clear boundaries, class interfaces, and modular lifecycles.
  - Reduce the risk of bugs by defining rigorous interaction protocols (UML) before writing code.

### Q3: What are the primary inputs and outputs of the LLD phase?
- **Inputs**: HLD documentation, System Use Cases, Functional Requirements, Database Schemas, API contracts.
- **Outputs**: Class diagrams, Sequence diagrams, State-machine diagrams, detailed interface specifications, and database schema mappings (ERD).

### Q4: What is Object-Oriented Analysis and Design (OOAD)?
- **Analysis (OOA)**: Identifying the core business domain entities, their attributes, and operations from the requirements (e.g., identifying "User", "Order", "Cart" in e-commerce).
- **Design (OOD)**: Structuring these entities into concrete software components (classes, interfaces), assigning behaviors, and arranging their interactions.

### Q5: Explain the Single Responsibility Principle (SRP) with an LLD example.
- **SRP**: A class should have exactly **one reason to change**.
- **LLD Example**: Instead of an `Invoice` class that handles both calculations and PDF generation, split it into two:
  - `Invoice`: Manages invoice data and mathematical calculations.
  - `InvoicePDFGenerator`: Exclusively handles formatting and rendering of the PDF file.

### Q6: Explain the Open-Closed Principle (OCP) with an LLD example.
- **OCP**: Code components should be **open for extension** but **closed for modification**.
- **LLD Example**: A `PaymentProcessor` class should not use `if-else` blocks to handle credit cards, PayPal, and Stripe. Instead, create a `PaymentStrategy` interface and implement separate classes for `CreditCardPayment`, `PayPalPayment`, and `StripePayment`. To support a new payment method, write a new class without modifying `PaymentProcessor`.

### Q7: Explain the Liskov Substitution Principle (LSP) with an LLD example.
- **LSP**: Derived classes must be completely substitutable for their base classes without breaking correctness.
- **LLD Example**: An interface `Bird` with a `fly()` method should not be implemented by `Ostrich`. A proper design splits them: `Bird` (generic) and `FlyingBird` (which extends `Bird` and adds `fly()`). `Ostrich` only implements `Bird`.

### Q8: Explain the Interface Segregation Principle (ISP) with an LLD example.
- **ISP**: Clients should not be forced to implement methods they do not use.
- **LLD Example**: Instead of a bloated `MultiFunctionPrinter` interface with `print()`, `scan()`, and `fax()`, split it into three single-method interfaces: `Printer`, `Scanner`, and `FaxDevice`. A simple desk printer then only implements `Printer`.

### Q9: Explain the Dependency Inversion Principle (DIP) with an LLD example.
- **DIP**: High-level modules must depend on abstractions (interfaces), not concrete implementations.
- **LLD Example**: A `Car` class should not directly instantiate `V8Engine`. Instead, it should depend on an `Engine` interface, allowing any class implementing `Engine` (like `ElectricEngine` or `V6Engine`) to be injected at runtime.

### Q10: What are GRASP (General Responsibility Assignment Software Patterns) principles?
- **GRASP**: A set of 9 fundamental guidelines used in object-oriented design to determine **which class should be assigned which responsibility** (method or attribute).

### Q11: What is the Information Expert principle in GRASP?
- **Principle**: Assign a responsibility to the class that has the **necessary information** to fulfill it.
- **Example**: In a POS system, the class `Order` holds the list of `OrderItem` objects, so `Order` (not `POSSystem`) should be responsible for calculating the total price.

### Q12: What is Creator in GRASP?
- **Principle**: Class B should be responsible for creating instances of Class A if B contains, aggregates, or closely uses A.
- **Example**: An `Order` class contains `OrderItem` instances; therefore, `Order` should be the creator of `OrderItem` objects.

### Q13: What is Controller in GRASP?
- **Principle**: Assign the responsibility of handling system events/API requests to a non-UI class that represents the overall system or a use-case scenario.
- **Example**: A `CheckoutController` class coordinates the flow of checking out instead of letting the UI window class handle database updates directly.

### Q14: What is Low Coupling in GRASP?
- **Principle**: Design classes to minimize structural dependencies on other classes.
- **Impact**: Enhances reuse, simplifies testing, and ensures changes in one class don't cause widespread breakages.

### Q15: What is High Cohesion in GRASP?
- **Principle**: Ensure that a class's responsibilities are tightly focused and closely related.
- **Impact**: Keeps classes simple, understandable, highly maintainable, and easy to reuse.

### Q16: What is Polymorphism in the context of GRASP?
- **Principle**: Use polymorphic operations instead of explicit conditional checks (`if-else` or `switch`) to handle varying behaviors based on type.

### Q17: What is Pure Fabrication in GRASP?
- **Principle**: Create a highly cohesive, artificial "helper" class that does not represent a real-world domain concept to maintain Low Coupling and High Cohesion.
- **Example**: Creating a `DatabaseLogger` class. Logging is a system requirement, not a real-world business entity.

### Q18: What is Indirection in GRASP?
- **Principle**: Assign responsibility to an intermediate object to decouple two interacting classes.
- **Example**: Placing a controller or adapter interface between a client and a third-party payment gateway.

### Q19: What is Protected Variations in GRASP?
- **Principle**: Identify points of predicted instability or variation and wrap them in a stable interface to protect surrounding code from changes.

### Q20: What are Unified Modeling Language (UML) diagrams and why are they used in LLD?
- **UML**: A standardized visual modeling language used to specify, visualize, and document software architecture.
- **LLD Use**: It acts as a universal communication medium for developers, mapping structural blueprints before code writing starts.

### Q21: What is a Class Diagram, and what are its key components?
- **Class Diagram**: A static structure diagram depicting the system's classes, attributes, methods, and relationships.
- **Key Components**: Class boxes (split into Name, Attributes, and Operations/Methods) and relationship arrows.

### Q22: Explain the representation of Association, Aggregation, and Composition in UML.
- **Association**: A solid line indicating a general relationship between classes (`A — B`).
- **Aggregation**: A solid line with an empty diamond at the container class (`A ◇— B`), indicating a weak, independent container relationship.
- **Composition**: A solid line with a filled black diamond at the container class (`A ◆— B`), indicating exclusive lifecycle ownership.

### Q23: What is the difference between Generalization and Realization in UML diagrams?
- **Generalization**: Represents class inheritance. Shown as a solid line with an empty, closed arrowhead pointing to the parent class (`A —▷ B`).
- **Realization**: Represents interface implementation. Shown as a dashed line with an empty, closed arrowhead pointing to the interface (`A ╌▷ B`).

### Q24: What is a Sequence Diagram, and what are its main elements?
- **Sequence Diagram**: An interaction diagram showing how operations are carried out over time.
- **Main Elements**: Lifelines (vertical dashed lines), Activation blocks (vertical bars indicating processing), and message arrows (solid for calls, dashed for returns).

### Q25: What is a State Machine Diagram, and when is it useful?
- **State Machine Diagram**: Depicts the lifecycles of a single object, showcasing its varying states, transitions, and event triggers.
- **Use Case**: Critical for tracking complex lifecycle transitions (e.g., an `Order` shifting from `Created` → `Paid` → `Shipped` → `Delivered`).

### Q26: What is an Activity Diagram, and how does it differ from a flowchart?
- **Activity Diagram**: A behavioral diagram showing the step-by-step control and data flow of activities.
- **Difference**: Unlike simple flowcharts, it natively supports parallel execution flows, synchronization bars (fork/join), and swimlanes partitioning actions by roles.

### Q27: What is a Use Case Diagram, and who are "actors"?
- **Use Case Diagram**: Models the functional interactions between the system's core features and external actors.
- **Actors**: External entities (human users, external hardware, or external software systems) that interact with the application.

### Q28: What is a design pattern, and how are they classified?
- **Design Pattern**: A repeatable, elegant solution to a commonly occurring design problem in software development.
- **Classification**:
  - **Creational**: Deals with object creation mechanisms.
  - **Structural**: Handles assembly of classes and objects into larger structures.
  - **Behavioral**: Manages communication, responsibility, and interactions between objects.

### Q29: What are Creational Design Patterns? List them.
- **Definition**: Patterns that abstract the instantiation process, decoupling the client from specific creation logic.
- **Patterns**: Singleton, Factory Method, Abstract Factory, Builder, and Prototype.

### Q30: What are Structural Design Patterns? List them.
- **Definition**: Patterns focused on how classes and objects are composed to form larger, more flexible structures.
- **Patterns**: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, and Proxy.

### Q31: What are Behavioral Design Patterns? List them.
- **Definition**: Patterns concerned with algorithms, communications, and assignments of responsibility between objects.
- **Patterns**: Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, and Visitor.

### Q32: Explain the Singleton Design Pattern and its main purpose.
- **Singleton**: Ensures a class has exactly **one instance** in memory and provides a global access point to it.
- **Purpose**: Used to coordinate access to shared, expensive, or bottleneck resources (e.g., Database connections, Loggers, Thread pools).

### Q33: What is the Factory Method Design Pattern, and when should you use it?
- **Factory Method**: Defines an interface for creating an object but lets subclasses decide which concrete class to instantiate.
- **When to Use**: When a class cannot anticipate the exact class of objects it needs to create, or wants to delegate object creation details to subclasses.

### Q34: Explain the Abstract Factory Pattern and its difference from Factory Method.
- **Abstract Factory**: Provides an interface for creating families of related or dependent objects without specifying their concrete classes.
- **Difference**: Factory Method uses a single method and relies on inheritance (subclassing); Abstract Factory uses an object composed of multiple factory methods to build families of products.

### Q35: What is the Builder Design Pattern, and what problem does it solve?
- **Builder**: Separates the construction of a complex object from its representation, allowing the same construction process to create different representations.
- **Problem Solved**: Eliminates bloated constructors (telescoping constructors) with too many optional parameters, making client code readable and type-safe.

### Q36: Explain the Prototype Design Pattern and its typical use case.
- **Prototype**: Spawns new objects by copying/cloning an existing instance (the prototype) instead of creating them from scratch.
- **Use Case**: Used when direct object creation is highly expensive (e.g., requires database hits or heavy file system access), so duplicating an existing memory block is faster.

### Q37: What is the Adapter Design Pattern, and why is it called a wrapper?
- **Adapter**: Converts the interface of a class into another interface clients expect, enabling incompatible interfaces to collaborate.
- **Wrapper**: It is called a wrapper because it wraps an incompatible object inside a compatible adapter class that translates calls.

### Q38: Explain the Bridge Design Pattern and its decouple intent.
- **Bridge**: Decouples an abstraction from its implementation so that the two can vary independently.
- **Intent**: Replaces inheritance with composition to prevent an exponential explosion of classes when both abstractions and implementations are modified.

### Q39: What is the Composite Design Pattern, and when is it used?
- **Composite**: Composes objects into tree structures to represent part-whole hierarchies.
- **Use Case**: Allows clients to treat individual objects and compositions of objects uniformly (e.g., rendering file systems where files and folders share a common interface).

### Q40: Explain the Decorator Design Pattern and how it supports OCP.
- **Decorator**: Dynamically attaches additional responsibilities to an object at runtime.
- **OCP Support**: Provides a flexible alternative to subclassing for extending functionality without modifying the original class source code.

### Q41: What is the Facade Design Pattern, and how does it simplify clients?
- **Facade**: Provides a simplified, high-level interface to a complex subsystem of classes.
- **Benefit**: Shields the client from having to learn and manage numerous individual subsystem classes, lowering coupling.

### Q42: Explain the Flyweight Design Pattern and its memory-saving mechanism.
- **Flyweight**: Minimizes memory usage by sharing as much data as possible with other similar objects.
- **Mechanism**: Splits state into:
  - **Intrinsic**: Shared, immutable state stored within the Flyweight object.
  - **Extrinsic**: Contextual state passed to the Flyweight by the client during operations.

### Q43: What is the Proxy Design Pattern, and what are its different types?
- **Proxy**: Provides a placeholder or surrogate object to control access to another target object.
- **Types**:
  - **Virtual Proxy**: Defers creation of expensive objects until accessed.
  - **Protection Proxy**: Controls access rights based on client permissions.
  - **Remote Proxy**: Handles network serialization to represent objects in different memory spaces.

---

### Q44: Implement a Thread-Safe Singleton Pattern (Double-Checked Locking)
```java
public class DatabaseConnection {
    private static volatile DatabaseConnection instance;
    private DatabaseConnection() {} // Prevents direct instantiation

    public static DatabaseConnection getInstance() {
        if (instance == null) { // First check (no synchronization)
            synchronized (DatabaseConnection.class) {
                if (instance == null) { // Second check (synchronized)
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }
}
```

### Q45: Implement the Factory Method Pattern
```java
// Product
interface Document { void open(); }
class PDFDocument implements Document { public void open() { System.out.println("Opening PDF."); } }
class WordDocument implements Document { public void open() { System.out.println("Opening Word."); } }

// Creator
abstract class DocumentCreator {
    public abstract Document createDocument();
    public void openDocument() {
        Document doc = createDocument();
        doc.open();
    }
}
class PDFCreator extends DocumentCreator {
    public Document createDocument() { return new PDFDocument(); }
}
```

### Q46: Implement the Builder Pattern
```java
public class HttpRequest {
    private final String url;
    private final String method;
    private final String body;

    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.body = builder.body;
    }

    public static class Builder {
        private String url;
        private String method = "GET"; // Default value
        private String body;

        public Builder setUrl(String url) { this.url = url; return this; }
        public Builder setMethod(String method) { this.method = method; return this; }
        public Builder setBody(String body) { this.body = body; return this; }
        public HttpRequest build() { return new HttpRequest(this); }
    }
}
```

### Q47: Implement the Adapter Pattern
```java
// Target Interface expected by client
interface JsonReader { String readJson(); }

// Adaptee with incompatible interface
class XmlReader {
    public String readXml() { return "<data><name>John</name></data>"; }
}

// Adapter implementing Target
class XmlToJsonAdapter implements JsonReader {
    private final XmlReader xmlReader;
    public XmlToJsonAdapter(XmlReader xmlReader) { this.xmlReader = xmlReader; }

    public String readJson() {
        String xml = xmlReader.readXml();
        return "{ \"name\": \"John\" }"; // In practice, parses xml to json
    }
}
```

### Q48: Implement the Decorator Pattern
```java
interface Coffee { double getCost(); }
class SimpleCoffee implements Coffee { public double getCost() { return 2.0; } }

// Decorator
abstract class CoffeeDecorator implements Coffee {
    protected final Coffee decoratedCoffee;
    public CoffeeDecorator(Coffee coffee) { this.decoratedCoffee = coffee; }
    public double getCost() { return decoratedCoffee.getCost(); }
}

class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) { super(coffee); }
    public double getCost() { return super.getCost() + 0.5; }
}
```

### Q49: Implement the Observer Pattern
```java
import java.util.*;

interface Observer { void update(String news); }
class EmailSubscriber implements Observer {
    public void update(String news) { System.out.println("Received: " + news); }
}

class NewsPublisher {
    private final List<Observer> observers = new ArrayList<>();
    public void attach(Observer o) { observers.add(o); }
    public void detach(Observer o) { observers.remove(o); }
    public void notifyObservers(String news) {
        for (Observer o : observers) { o.update(news); }
    }
}
```

### Q50: Implement the Strategy Pattern
```java
interface PaymentStrategy { void pay(double amount); }
class CreditCardPayment implements PaymentStrategy {
    public void pay(double amount) { System.out.println("Paid " + amount + " via Card."); }
}
class PaypalPayment implements PaymentStrategy {
    public void pay(double amount) { System.out.println("Paid " + amount + " via PayPal."); }
}

class ShoppingCart {
    private PaymentStrategy strategy;
    public void setPaymentStrategy(PaymentStrategy strategy) { this.strategy = strategy; }
    public void checkout(double amount) { strategy.pay(amount); }
}
```
