# LLD - Medium Interview Questions

### Q1: What is the difference between class cohesion and method cohesion in system design?
- **Class Cohesion**: The degree to which the fields and methods of a single class belong together logically. High class cohesion means all members are focused on a single responsibility.
- **Method Cohesion**: The level of focus of a single method. High method cohesion means the method performs exactly one distinct operation (does not mix formatting, validation, and calculations).

### Q2: What is the difference between syntactic coupling and semantic coupling?
- **Syntactic Coupling**: The caller depends on the **names, signatures, and types** of the called class (easily checked by compiler).
- **Semantic Coupling**: The caller depends on the **internal behavior, state transitions, or execution order** of the called class (harder to detect, causes fragile execution bugs when implementation changes).

### Q3: What are the key indicators (code smells) that signal a need for LLD refactoring?
- **Indicators**:
  - **Divergent Change**: A single class must be modified in different ways to support unrelated new requirements.
  - **Shotgun Surgery**: A single change requires making tiny edits across dozens of different classes.
  - **Feature Envy**: A method inside Class A constantly reads/writes variables of Class B instead of its own.

### Q4: What is the "Feature Envy" code smell, and how do you resolve it?
- **Feature Envy**: A class method is more interested in the data of another class than its own class's data.
- **Resolution**: Apply the **Move Method** refactoring technique. Relocate the envious method into the class whose data it is accessing, or pass the necessary data as parameters to keep logic localized.

### Q5: What is the "Long Method" code smell, and what LLD techniques reduce it?
- **Long Method**: A method that contains too many lines of code, making it hard to read, maintain, and unit test.
- **LLD Techniques**:
  - **Extract Method**: Split logical sections of the method into smaller, descriptive helper functions.
  - **Replace Temp with Query**: Replace temporary local variables with direct query methods to simplify the signature.

### Q6: What is the difference between inheritance-based polymorphism and interface-based polymorphism?
- **Inheritance-based**: Subclasses inherit concrete behaviors and fields from a parent class, overriding select parts. Harder to decouple; binds subclasses to parent implementations.
- **Interface-based**: Classes implement generic contracts (interfaces) with zero shared code/state. Highly flexible; supports complete horizontal decoupling.

### Q7: Explain the Chain of Responsibility Pattern and its LLD applicability.
- **Chain of Responsibility**: Passes a sender request along a chain of potential receiver handlers. Each handler decides either to process the request or pass it to the next handler in the chain.
- **LLD Applicability**: Used in middleware filters, security authorization checks, loggers, or multi-step request validations.

### Q8: What is the Command Pattern, and how does it support Undo/Redo operations?
- **Command**: Encapsulates a request as a self-contained object, containing all necessary details (receiver, arguments, operation).
- **Undo/Redo**: By storing concrete command objects in an execution stack (history), the system can loop backwards calling a defined `undo()` method on each command, or forwards calling `execute()` to redo.

### Q9: What is the Interpreter Pattern, and what is its main drawback?
- **Interpreter**: Establishes a class representation for a language's grammar and uses an interpreter object to parse and evaluate sentences/expressions.
- **Drawback**: Incurs massive performance overhead and memory bloat because each terminal and non-terminal symbol requires a separate object, resulting in deep, slow abstract syntax trees.

### Q10: Explain the Iterator Pattern and how it abstracts collections.
- **Iterator**: Provides a standardized way to access elements of an aggregate object sequentially without exposing its underlying representation (e.g., list, tree, graph).
- **Abstraction**: Clients only interact with a generic `Iterator` interface (with `hasNext()` and `next()`), making collection traversals independent of their internal structures.

### Q11: What is the Mediator Pattern, and how does it reduce coupling?
- **Mediator**: Restricts direct communication between objects and forces them to collaborate only through a central mediator object.
- **Coupling Reduction**: Replaces chaotic many-to-many connections between multiple classes with clean, organized one-to-many connections, localizing component dependencies.

### Q12: What is the Memento Pattern, and how does it support state rollback?
- **Memento**: Captures and externalizes an object's internal state without violating encapsulation, allowing the object to be restored to this state later.
- **Rollback**: Consists of:
  - **Originator**: The object whose state is being saved.
  - **Memento**: The value object storing the state snapshot.
  - **Caretaker**: Manages the list of mementos (history) to request state restores.

### Q13: Explain the State Design Pattern and its difference from the Strategy Pattern.
- **State**: Allows an object to alter its behavior when its internal state changes. The object will appear to change its class.
- **Difference**:
  - **State**: The states are highly aware of each other and actively trigger transitions to the next state.
  - **Strategy**: The strategies are completely independent, isolated algorithms chosen and configured by the client, with zero awareness of other strategies.

### Q14: What is the Template Method Pattern, and how does it implement hook methods?
- **Template Method**: Defines the skeleton of an algorithm in a base class method, deferring select steps to subclass overrides without changing the structure.
- **Hook Methods**: Empty or default implementation steps defined in the base template that subclasses *can* optionally override to inject custom logic into specific parts of the main flow.

### Q15: Explain the Visitor Design Pattern and its double-dispatch mechanism.
- **Visitor**: Separates an algorithm from the object structure on which it operates, letting you add new operations to existing structures without modifying them.
- **Double-Dispatch**: The call is resolved based on two runtime types: the visitor being executed and the element accepting it (`element.accept(visitor)` calls `visitor.visit(this)`).

### Q16: What is the Null Object Pattern, and how does it prevent defensive null checking?
- **Null Object**: Provides a concrete class that implements a target interface but executes neutral/do-nothing behavior instead of returning `null`.
- **Prevention**: Eliminates the need to litter the codebase with redundant `if (obj != null)` checks before invoking methods.

### Q17: What are standard concurrency design patterns in LLD?
- **Patterns**:
  - **Active Object**: Decouples method execution from method invocation.
  - **Read-Write Lock**: Allows concurrent reads but exclusive writes.
  - **Double-Checked Locking**: Reduces synchronization overhead in Singleton creation.
  - **Thread Pool**: Reuses thread resources instead of spawning new ones.

### Q18: What is the Thread Pool Pattern, and how does it optimize resource utilization?
- **Thread Pool**: Maintains a queue of worker threads awaiting tasks.
- **Optimization**: Avoids the expensive system latency of spawning and destroying threads repeatedly. Limits the concurrent execution count, protecting resources from thread exhaust crash issues.

### Q19: What is the Active Object Pattern?
- **Active Object**: A pattern that decouples execution from invocation by executing methods asynchronously on a separate thread, using a request queue (Scheduler) and a placeholder (Future) for the results.

### Q20: What is the Read-Write Lock Pattern?
- **Read-Write Lock**: A concurrency pattern that permits multiple threads to read a shared resource simultaneously, but requires exclusive access for writing threads. This increases performance in read-heavy applications.

### Q21: Explain the concept of Domain-Driven Design (DDD) in the context of LLD.
- **DDD in LLD**: Focuses on structuring software components to match the concrete domain models and terminology of business experts. Avoids database-driven designs in favor of rich entity boundaries.

### Q22: What are Aggregates and Aggregate Roots in DDD?
- **Aggregate**: A logical cluster of related entities and value objects (e.g., `Order` and `OrderItem`) treated as a single data unit.
- **Aggregate Root**: The unique gatekeeper entity of the aggregate (`Order`). External classes are only permitted to reference the Aggregate Root, ensuring transaction invariants are maintained.

### Q23: What are DTOs (Data Transfer Objects), and when should you use them?
- **DTO**: An object containing data without any business logic, used solely to transfer data between system layers or over a network.
- **When to Use**: When passing data across network interfaces or decoupling domain entity structures from database tables and external API payloads.

### Q24: What is the Repository Pattern, and how does it decouple business logic?
- **Repository**: Acts as an in-memory collection interface representing database access.
- **Decoupling**: Business logic interacts with a clean collection-like API (`save()`, `find()`) rather than executing complex SQL queries, isolating the database infrastructure layer.

### Q25: Explain the difference between Unit Testing, Integration Testing, and Mocking.
- **Unit Testing**: Tests a single class/method in complete isolation.
- **Integration Testing**: Verifies correct collaboration between multiple class modules or databases.
- **Mocking**: Simulates external dependencies (classes, database connections) to facilitate fast, isolated unit testing of a target component.

### Q26: What is Test-Driven Development (TDD), and how does it influence LLD?
- **TDD**: A cycle of writing a failing test first, writing the minimal code to pass it, and then refactoring (Red-Green-Refactor).
- **Influence**: Forces developers to think about class usability and interface design before writing implementation, promoting decoupled interfaces and high testability.

### Q27: Compare Mock, Stub, Fake, and Spy.
- **Stub**: Provides hardcoded, pre-defined values to method calls.
- **Mock**: Registers expectations of method calls and verifies if those calls occurred.
- **Fake**: A fully functional but lightweight implementation (e.g., in-memory H2 database).
- **Spy**: Wraps a real object to track and record its invocation details while executing normal logic.

### Q28: Explain Dependency Injection (DI) and its three primary types.
- **DI**: Passing an object's dependencies to it rather than letting the object instantiate them itself.
- **Primary Types**:
  - **Constructor Injection**: Dependencies are passed via the constructor (preferred for immutability).
  - **Setter Injection**: Dependencies are passed via setter methods (allows optional dependencies).
  - **Interface Injection**: The dependency provides an injector method that the target class implements.

### Q29: What is an Inversion of Control (IoC) Container?
- **IoC Container**: A framework component (like Spring) that automates the lifecycle creation, configuration, dependency wiring, and destruction of all application objects (beans).

### Q30: What is the difference between the Service Locator Pattern and Dependency Injection?
- **Service Locator**: The class actively pulls its dependencies by querying a central locator registry (`Locator.getService(Engine.class)`).
- **Dependency Injection**: The class remains passive. Dependencies are pushed directly into it by an external configuration runner/framework.

### Q31: What is the "YAGNI" principle, and how does it prevent over-engineering?
- **YAGNI**: "You Aren't Gonna Need It".
- **Prevention**: Urges developers to write code strictly for active requirements, avoiding building complex abstract structures in anticipation of future needs that may never arise.

### Q32: Explain the "KISS" principle in LLD.
- **KISS**: "Keep It Simple, Stupid".
- **Concept**: Emphasizes that simple designs are easier to understand, test, maintain, and expand. Developers should avoid adding unnecessary design patterns where a direct solution works perfectly.

### Q33: What is "DRY" vs. "WET" code? When is duplication acceptable?
- **DRY**: "Don't Repeat Yourself". Avoid duplicate logic.
- **WET**: "Write Everything Twice" or "We Enjoy Typing".
- **Acceptable Duplication**: When two identical blocks of code represent completely separate business concepts in different bounded contexts (unifying them creates brittle coupling).

### Q34: Why does inheritance lead to fragile designs?
- **Fragility**: Tight coupling. Subclasses are deeply exposed to the parent's internal state. Changes in parent methods can silently break subclass behaviors. Composition solves this by hiding implementation details entirely.

### Q35: How does the Reflection API interact with standard OOP design constraints?
- **Reflection**: Can bypass OOP access controls (e.g., using `setAccessible(true)` on private constructors/fields), which violates encapsulation but enables frameworks to automate data mapping and dependency injection.

### Q36: Compare Structural Design Patterns and Creational Design Patterns.
- **Creational**: Focuses on managing class instantiation and object initialization, decoupling creation from usage (e.g., Builder, Factory).
- **Structural**: Focuses on how classes and interfaces are combined to form larger systems (e.g., Decorator, Composite).

### Q37: Compare the Decorator pattern and the Adapter pattern.
- **Decorator**: Enhances or adds behaviors to an object dynamically while preserving the **exact same interface**.
- **Adapter**: Alters or translates the **interface** of an object to make it compatible with a client's expected interface.

### Q38: Compare the Facade pattern and the Mediator pattern.
- **Facade**: Provides a unidirectional, simplified interface to a complex subsystem.
- **Mediator**: Manages bidirectional, collaborative communications between multiple peer components in a decoupled way.

### Q39: Compare the Proxy pattern and the Decorator pattern.
- **Proxy**: Controls or restricts access to the real object (e.g., lazy loading, security check).
- **Decorator**: Dynamically adds functional features to the object; the client is expected to call the decorated methods directly.

### Q40: Compare the Bridge pattern and the Adapter pattern.
- **Bridge**: A structural design pattern applied **upfront** to split abstraction and implementation into separate hierarchies.
- **Adapter**: Applied **retrospectively** to make existing, incompatible, unmodifiable classes work together.

### Q41: What is the difference between a Rich Domain Model and an Anemic Domain Model?
- **Rich Model**: Domain entities hold both state fields and business rules/methods, preventing services from becoming procedural controllers.
- **Anemic Model**: Entities are simple data structs; logic is entirely handled by stateless services.

### Q42: Why is "Type Safety" preferred over raw/string-based configurations in LLD?
- **Type Safety**: Catches configuration and interface implementation errors at **compile-time** rather than triggering silent failures or exceptions at runtime.

### Q43: What is a "Design Smell" vs. a "Code Smell"?
- **Code Smell**: Localized implementation issues inside a class or method (e.g., long method, duplicate code).
- **Design Smell**: Broad structural issues across classes indicating a flawed architecture (e.g., circular dependencies, violation of SOLID, fragile base class).

---

### Q44: Implement the Chain of Responsibility Pattern
```java
abstract class Logger {
    protected int level;
    protected Logger nextLogger;

    public void setNextLogger(Logger nextLogger) { this.nextLogger = nextLogger; }
    public void logMessage(int level, String message) {
        if (this.level <= level) { write(message); }
        if (nextLogger != null) { nextLogger.logMessage(level, message); }
    }
    protected abstract void write(String message);
}

class ConsoleLogger extends Logger {
    public ConsoleLogger(int level) { this.level = level; }
    protected void write(String message) { System.out.println("Console: " + message); }
}
class ErrorLogger extends Logger {
    public ErrorLogger(int level) { this.level = level; }
    protected void write(String message) { System.err.println("Error: " + message); }
}
```

### Q45: Implement the Command Pattern with Undo/Redo features
```java
import java.util.Stack;

interface Command { void execute(); void undo(); }

class TextEditor {
    private String text = "";
    public void write(String newText) { text += newText; }
    public void setText(String text) { this.text = text; }
    public String getText() { return text; }
}

class WriteCommand implements Command {
    private final TextEditor editor;
    private final String textToWrite;
    private String previousText;

    public WriteCommand(TextEditor editor, String text) { this.editor = editor; this.textToWrite = text; }
    public void execute() { previousText = editor.getText(); editor.write(textToWrite); }
    public void undo() { editor.setText(previousText); }
}

class CommandHistory {
    private final Stack<Command> undoStack = new Stack<>();
    public void executeCommand(Command c) { c.execute(); undoStack.push(c); }
    public void undo() { if (!undoStack.isEmpty()) { undoStack.pop().undo(); } }
}
```

### Q46: Implement the Mediator Pattern
```java
import java.util.*;

interface ChatMediator { void sendMessage(String msg, User user); void addUser(User user); }
abstract class User {
    protected ChatMediator mediator;
    protected String name;
    public User(ChatMediator med, String name) { this.mediator = med; this.name = name; }
    public abstract void send(String msg);
    public abstract void receive(String msg);
}

class ChatMediatorImpl implements ChatMediator {
    private final List<User> users = new ArrayList<>();
    public void addUser(User user) { users.add(user); }
    public void sendMessage(String msg, User sender) {
        for (User u : users) { if (u != sender) { u.receive(msg); } }
    }
}

class ConcreteUser extends User {
    public ConcreteUser(ChatMediator med, String name) { super(med, name); }
    public void send(String msg) { mediator.sendMessage(msg, this); }
    public void receive(String msg) { System.out.println(name + " received: " + msg); }
}
```

### Q47: Implement the State Design Pattern
```java
interface State { void handle(Context context); }
class Context {
    private State state;
    public Context() { state = new StartState(); }
    public void setState(State state) { this.state = state; }
    public void request() { state.handle(this); }
}

class StartState implements State {
    public void handle(Context c) { System.out.println("Start State."); c.setState(new StopState()); }
}
class StopState implements State {
    public void handle(Context c) { System.out.println("Stop State."); c.setState(new StartState()); }
}
```

### Q48: Implement the Template Method Pattern
```java
abstract class DataParser {
    // Template Method
    public final void parseData() { readData(); processData(); writeData(); }
    protected abstract void readData();
    protected abstract void processData();
    private void writeData() { System.out.println("Writing data to database."); }
}

class JsonDataParser extends DataParser {
    protected void readData() { System.out.println("Reading JSON file."); }
    protected void processData() { System.out.println("Processing JSON structure."); }
}
```

### Q49: Implement the Visitor Design Pattern
```java
interface Shape { void accept(ShapeVisitor visitor); }
interface ShapeVisitor { void visit(Circle circle); }

class Circle implements Shape {
    public double radius = 5.0;
    public void accept(ShapeVisitor visitor) { visitor.visit(this); }
}

class AreaCalculator implements ShapeVisitor {
    public double totalArea = 0;
    public void visit(Circle circle) { totalArea += Math.PI * Math.pow(circle.radius, 2); }
}
```

### Q50: Implement the Proxy Pattern with Caching
```java
interface Image { void display(); }
class RealImage implements Image {
    private final String filename;
    public RealImage(String filename) { this.filename = filename; loadFromDisk(); }
    private void loadFromDisk() { System.out.println("Loading " + filename); }
    public void display() { System.out.println("Displaying " + filename); }
}

class ProxyImage implements Image {
    private RealImage realImage;
    private final String filename;
    public ProxyImage(String filename) { this.filename = filename; }

    public void display() {
        if (realImage == null) { realImage = new RealImage(filename); } // Caching/Lazy loading
        realImage.display();
    }
}
```
