# OOPS - Basic Interview Questions

### Q1: What is Object-Oriented Programming (OOP) and how does it differ from procedural programming?
- **OOP**: A paradigm organizing software around **objects** (data combined with behavior) rather than actions or pure logic.
- **Procedural**: Organizes software sequentially around **functions** or procedures processing separate, detached data.
- **Key Differences**: OOP promotes **encapsulation**, data security, code reuse, and modularity; Procedural is prone to global state mutation and harder to maintain as systems scale.

### Q2: What is a Class and how does it differ from an Object?
- **Class**: A static blueprint, template, or **user-defined data type** that defines variables (state) and methods (behavior) common to all objects of its kind.
- **Object**: A dynamic, runtime **instance** of a class. It occupies physical memory and holds specific values for the defined variables.
- **Analogy**: A class is a house blueprint; an object is the physical house built from that blueprint.

### Q3: Explain the concept of Encapsulation and its primary benefits.
- **Definition**: The grouping of **data (attributes)** and the **methods (behavior)** that operate on that data into a single unit (class), while restricting direct access to some of the object's components.
- **Benefits**:
  - **Data Hiding**: Prevents unauthorized modifications of internal state.
  - **Flexibility/Maintainability**: Internal class implementation can change without affecting external callers.
  - **Control**: Allows validation of inputs via getter and setter methods.

### Q4: What is Abstraction in OOP, and how is it different from Encapsulation?
- **Abstraction**: The process of **hiding complex implementation details** and showing only the essential features to the outside world. It answers *what* an object does rather than *how* it does it.
- **Encapsulation**: The process of **binding data and code** together and hiding the internal details (*information hiding*).
- **Difference**: Abstraction is a design-level concept focused on reducing complexity; Encapsulation is an implementation-level concept focused on securing and hiding data.

### Q5: What is Inheritance, and what problem does it solve?
- **Definition**: A mechanism where a new class (**subclass/child**) acquires the properties and behaviors of an existing class (**superclass/parent**).
- **Problems Solved**:
  - **Code Redundancy**: Avoids rewriting common code across multiple classes.
  - **Polymorphism Support**: Establishes an "Is-A" relationship, enabling dynamic method dispatch.
  - **Extensibility**: Enhances existing functionality without modifying the original code.

### Q6: What is Polymorphism, and what are its two main types?
- **Definition**: The ability of a single interface, method, or object to take on **multiple forms** depending on the context of execution.
- **Two Main Types**:
  1. **Compile-time (Static)** Polymorphism: Resolved during compilation (e.g., method overloading, operator overloading).
  2. **Run-time (Dynamic)** Polymorphism: Resolved during execution (e.g., method overriding).

### Q7: What is compile-time (static) polymorphism? Provide examples.
- **Definition**: A mechanism where the binding of a method call to its implementation occurs during **compilation**.
- **Key Mechanisms**:
  - **Method Overloading**: Multiple methods in the same class sharing the same name but having different parameter lists (type, number, or order).
  - **Operator Overloaded**: Giving custom meaning to standard operators (like `+` or `*`) when applied to user-defined objects.

### Q8: What is run-time (dynamic) polymorphism? Provide examples.
- **Definition**: A mechanism where the binding of a method call is deferred until **execution time** based on the actual object type.
- **Key Mechanism**:
  - **Method Overriding**: A subclass providing a specific implementation of a method already declared in its superclass.
  - **Dynamic Dispatch**: The runtime environment determines which overridden method to call based on the object instance being referenced, not the reference type.

### Q9: What is an Access Modifier, and what are the standard types?
- **Definition**: Keywords that set the **accessibility/visibility scope** of classes, methods, constructors, and fields.
- **Standard Types**:
  - `private`: Accessible only within the declaring class.
  - `default` (Package-private): Accessible only within the same package/folder.
  - `protected`: Accessible within the same package and by subclasses in other packages.
  - `public`: Accessible from any other class in the application.

### Q10: What is a Constructor, and what is its purpose?
- **Definition**: A special member function called automatically when an **object of a class is instantiated**.
- **Purpose**: To initialize the object's fields and allocate necessary resources.
- **Key Characteristics**: It shares the exact name of the class and has **no return type** (not even `void`).

### Q11: What is a Default Constructor, and when is it provided automatically?
- **Definition**: A constructor that accepts no arguments.
- **Automatic Provision**: If a developer writes a class without defining *any* constructors, the compiler automatically injects a default, parameterless constructor.
- **Behavior**: It initializes member variables to their default values (e.g., `0`, `null`, `false`).

### Q12: What is a Parameterized Constructor?
- **Definition**: A constructor explicitly defined to accept one or more arguments.
- **Purpose**: Enables initializing custom, non-default state for different objects at the exact moment of instantiation.
- **Impact**: Declaring any parameterized constructor prevents the compiler from automatically injecting the default constructor.

### Q13: What is a Copy Constructor, and how does it differ from assignment?
- **Definition**: A constructor that instantiates a new object using an **existing object** of the same class as its source.
- **Copy Constructor**: Allocates memory and copies values into a *new* object (e.g., `MyClass obj2(obj1)`).
- **Assignment**: Overwrites the values of an *already existing* object with those of another (e.g., `obj2 = obj1`).

### Q14: What is a Destructor, and when is it invoked?
- **Definition**: A special cleanup function of a class, prefixed with `~` in languages like C++, that is called when an object goes out of scope or is explicitly deleted.
- **Purpose**: Releases system resources (file handles, database connections, dynamic memory allocations) held by the object.
- **Note**: Managed languages (like Java, C#) do not have explicit destructors, relying on **Garbage Collectors** instead.

### Q15: Explain the difference between a shallow copy and a deep copy.
- **Shallow Copy**: Copies only the immediate fields of an object. If a field is a reference pointing to an external object, the reference is copied, meaning both source and target share the same referenced memory.
- **Deep Copy**: Copies all immediate fields and recursively allocates new memory to duplicate all referenced external objects. The original and cloned objects are completely isolated.

### Q16: What is a "this" or "self" pointer/reference, and how is it used?
- **Definition**: An implicit reference or pointer that points to the **current object instance** executing the method.
- **Uses**:
  - Resolving ambiguity when instance variables and parameters have identical names.
  - Passing the current object as a parameter to other methods.
  - Returning the current object reference to enable method chaining.

### Q17: What is an Abstract Class, and can it be instantiated?
- **Definition**: A class declared with the `abstract` keyword that cannot be instantiated directly.
- **Characteristics**: It serves as a base layout for subclasses. It can contain both implemented methods and unimplemented **abstract methods**.
- **Instantiation**: Attempting to instantiate an abstract class directly throws a compilation error. It must be subclassed and its abstract methods overridden.

### Q18: What is an Interface, and how does it differ from an abstract class?
- **Interface**: A contract that defines *what* a class should do, specifying method signatures but traditionally containing zero implementation or state (though modern versions allow default methods).
- **Key Differences**:
  - **Inheritance**: A class can implement multiple interfaces but inherit from only one class.
  - **State**: Abstract classes can hold instance state (variables); interfaces cannot (only static final constants).
  - **Intent**: Abstract class is for sharing code and identity ("Is-A"); interface is for establishing a contract ("Can-Do").

### Q19: What is Single Inheritance, and how does it compare to Multiple Inheritance?
- **Single Inheritance**: A derived class inherits from **exactly one** direct parent class. It is simple, safe, and avoids ambiguity.
- **Multiple Inheritance**: A derived class inherits from **more than one** direct parent class. It is complex and can lead to structural ambiguities.

### Q20: Why do languages like Java and C# disallow Multiple Inheritance of classes?
- **The Diamond Problem**: If Class A has subclasses B and C, and Class D inherits from both B and C, the compiler cannot determine which inherited version of a method to execute if B and C override it differently.
- **Complexity**: Multiple inheritance complicates memory layouts, constructor execution orders, and pointer calculations.

### Q21: What is Hierarchical Inheritance?
- **Definition**: A structural arrangement where **multiple subclasses** inherit from a single, common superclass.
- **Use Case**: Modeling categories sharing common roots (e.g., `Dog`, `Cat`, and `Cow` inheriting from a base `Animal` class).

### Q22: What is Multilevel Inheritance?
- **Definition**: A chain of inheritance where a class inherits from a subclass, making it a grandchild of the original base class (e.g., Class C inherits from Class B, which inherits from Class A).
- **Nature**: Establishes a transitive relationship where Class C inherits features from both Class A and Class B.

### Q23: What is Hybrid Inheritance?
- **Definition**: A combination of two or more types of inheritance (e.g., mixing Multilevel and Hierarchical inheritance).
- **Challenge**: Often triggers Diamond Problem complexities if multiple inheritance of classes is involved in the hybrid design.

### Q24: What is the "Diamond Problem" in multiple inheritance, and how is it resolved?
- **Problem**: Ambiguity when a class inherits from two parent classes that both derive from a single grandparent class, resulting in duplicate grandparent members and ambiguous method overrides.
- **Resolutions**:
  - **C++**: Resolved using `virtual` inheritance, ensuring only one instance of the grandparent class is created in memory.
  - **Java/C#**: Resolved by banning multiple class inheritance outright, instead permitting multiple interface implementation.

### Q25: What is Method Overriding, and what are the rules for it?
- **Definition**: Redefining a superclass method in a subclass to provide customized behavior.
- **Rules**:
  - The subclass method must have the **identical name, parameters, and return type** (or covariant type).
  - Access visibility cannot be more restrictive than the superclass method.
  - Final, static, and private methods cannot be overridden.

### Q26: What is Method Overloading, and what are the rules for it?
- **Definition**: Creating multiple methods in the same class with identical names but different behaviors.
- **Rules**:
  - Methods must have **different parameter lists** (by count, type, or positional order).
  - Simply changing the return type or access modifier alone is **not sufficient** to overload a method and will result in compile errors.

### Q27: What is a static member variable, and where is it stored?
- **Definition**: A class-level variable shared by **all instances** of that class. There is only one copy in memory, regardless of how many objects are instantiated.
- **Storage**: Stored in a specialized static/global segment of application memory (like the Metaspace/Method Area in Java) rather than the object heap.

### Q28: What is a static member function, and what are its limitations?
- **Definition**: A method associated with the class itself, rather than with any class instance. It can be invoked directly using the class name.
- **Limitations**:
  - It cannot access non-static instance variables or call non-static instance methods.
  - It cannot use the `this` or `super` keywords, as no active instance reference exists.

### Q29: What is a virtual function/method, and why is it used?
- **Definition**: A method in a base class that can be overridden in derived classes, marked to signal that dynamic dispatch should be used.
- **Purpose**: Ensures that the compiler resolves calls to overridden methods at **runtime** using the actual object's type rather than the reference type.

### Q30: What is a pure virtual function, and what does it signify?
- **Definition**: A virtual function with no implementation in the base class (declared as `= 0` in C++).
- **Significance**: It marks the containing class as **abstract**, forcing any non-abstract subclass to provide an implementation for this function before compilation can succeed.

### Q31: What is a final or sealed class, and when should you use it?
- **Definition**: A class that has been explicitly locked to prevent other classes from inheriting from it.
- **When to Use**:
  - **Security**: Preventing untrusted subclasses from modifying critical class behaviors.
  - **Design**: For inherently complete classes (e.g., utility classes, immutable classes like `String`).

### Q32: What is a final or sealed method?
- **Definition**: A method that cannot be overridden by any derived subclasses.
- **Purpose**: Secures key algorithms inside standard classes, ensuring core behavior is preserved and cannot be tampered with or broken by inheritance.

### Q33: What is composition, and how does it differ from inheritance?
- **Composition**: A "Has-A" relationship where a complex class holds instances of other classes. The lifecycle of the held objects is **strictly tied** to the host object (e.g., a `Human` has a `Heart`; if the Human is destroyed, the Heart is too).
- **Inheritance**: An "Is-A" relationship where one class inherits behavior from a parent. Composition offers looser coupling than inheritance.

### Q34: What is aggregation, and how does it differ from composition?
- **Aggregation**: A weak "Has-A" relationship where a host object contains a reference to another object, but their lifecycles are **independent** (e.g., a `Department` has a `Professor`; if the department is deleted, the professor still exists).
- **Difference**: Composition represents exclusive ownership and shared lifecycles; Aggregation represents non-exclusive ownership and independent lifecycles.

### Q35: What is association in OOP?
- **Definition**: A general relationship between two completely separate classes that establishes how they interact or use each other.
- **Characteristics**: It can be one-to-one, one-to-many, many-to-one, or many-to-many. Association is the broad umbrella term that encompasses both aggregation and composition.

### Q36: Explain the "Is-A" vs. "Has-A" relationship.
- **Is-A**: Modeled using **Inheritance**. It represents subclassing where a child class is a specialized type of the parent class (e.g., `Car` is a `Vehicle`).
- **Has-A**: Modeled using **Composition/Aggregation**. It represents containing properties where an object contains another object as a field (e.g., `Car` has an `Engine`).

### Q37: What is an Inner Class or Nested Class?
- **Definition**: A class declared entirely within the body of another enclosing class.
- **Purpose**: Logically groups classes that are only used in one place, increases encapsulation, and allows the inner class to access private members of the outer class.

### Q38: What is an Anonymous Class?
- **Definition**: An inner class defined and instantiated simultaneously on-the-fly without an explicit name.
- **Purpose**: Used to provide brief, one-off overrides of interfaces or abstract classes without polluting the namespace with dedicated implementations.

### Q39: What is object serialization, and why is it useful?
- **Definition**: The process of converting an object's state (including its data and structure) into a byte stream.
- **Usefulness**:
  - **Persistence**: Saving object states to a file system or database.
  - **Network Transmission**: Sending objects across a network between distributed components.

### Q40: What is deserialization?
- **Definition**: The reverse of serialization; it reads a byte stream and reconstructs it back into a live, in-memory object instance.
- **Pre-requisite**: The runtime must have access to the class definition matching the serialized stream, or it will throw errors during reconstruction.

### Q41: What is a garbage collector, and how does it relate to OOP memory management?
- **Definition**: An automatic memory management component that runs in the background of virtual machines (like JVM or CLR).
- **Role in OOP**: Automatically identifies and reclaims heap memory occupied by objects that are no longer referenced by any thread, preventing developers from having to manually free memory.

### Q42: What is a memory leak, and how can it happen in OOP?
- **Definition**: A scenario where an application retains memory for objects that are no longer needed, gradually exhausting available system memory.
- **Causes in OOP**:
  - Keeping unused objects registered in global or long-lived static collections.
  - Circular references in unmanaged languages.
  - Unclosed system resources (sockets, streams) holding references.

### Q43: What is the purpose of the `super` or `base` keyword?
- **Definition**: A keyword referencing the direct parent class of the current object.
- **Uses**:
  - Calling the parent class's constructor from the subclass constructor.
  - Accessing parent class methods or variables hidden or overridden by the subclass.

### Q44: What is an instance variable, and how does it differ from a local variable?
- **Instance Variable**: Declared inside a class but outside any method. Each object has its own copy; its lifecycle is tied to the object's lifecycle.
- **Local Variable**: Declared inside a method, block, or constructor. It is created when the block is entered and destroyed upon exit, and is accessible only within that block.

### Q45: What is class-level encapsulation vs. object-level encapsulation?
- **Class-Level**: Private members of class instances are accessible by *any* other instance of the exact same class (standard behavior in languages like Java/C++).
- **Object-Level**: Private members of an instance are isolated from all other instances, even those of the same class (strictly enforced in languages like Smalltalk).

### Q46: What is the Open-Closed Principle in the context of OOP basics?
- **Definition**: Software entities (classes, modules) should be **open for extension** (can add new behaviors) but **closed for modification** (cannot edit existing verified source code).
- **Realization**: Achieved by programming against interfaces or abstract classes, allowing new implementations to be plugged in seamlessly.

### Q47: What is coupling, and why is loose coupling preferred in OOP?
- **Coupling**: The degree of direct dependency and interconnection between different classes or components.
- **Loose Coupling**: Minimizes interdependencies so that changing the internal workings of one class does not trigger cascading breakages across other classes.

### Q48: What is cohesion, and why is high cohesion preferred?
- **Cohesion**: The degree of focus and responsibility of a single class.
- **High Cohesion**: Means a class has a single, well-defined purpose and all of its fields and methods are tightly aligned with that purpose. This improves readability and reusability.

### Q49: What is a finalizer or `finalize()` method, and why is its use discouraged?
- **Definition**: A method called by the garbage collector before reclaiming an object's memory.
- **Why Discouraged**: It is non-deterministic (no guarantee *when* or *if* it will run), can degrade performance, create security vulnerabilities, and delay memory reclamation.

### Q50: Can a constructor be private? If yes, what is a practical use case?
- **Yes**: A constructor can be marked `private`.
- **Use Cases**:
  - **Singleton Pattern**: Restricting instantiation to a single static instance.
  - **Utility Classes**: Preventing instantiation of classes containing only static helper methods.
  - **Factory Methods**: Forcing object instantiation exclusively through specialized factory routines.
