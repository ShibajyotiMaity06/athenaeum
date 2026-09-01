# Java - Basic Interview Questions

### Q1: What is Java? Why is it considered platform-independent?
* **Java**: A high-level, class-based, object-oriented programming language.
* **Platform Independence**: Java uses a "Write Once, Run Anywhere" (WORA) model. The Java compiler (`javac`) converts source code (`.java`) into intermediate bytecode (`.class`). The **Java Virtual Machine (JVM)** interprets or compiles this bytecode into native machine code specific to the host operating system.

### Q2: Explain the differences between JDK, JRE, and JVM.
* **JVM (Java Virtual Machine)**: The execution engine that runs Java bytecode on the host OS.
* **JRE (Java Runtime Environment)**: JVM + Libraries + core files required to run compiled Java applications.
* **JDK (Java Development Kit)**: JRE + Development Tools (compiler `javac`, debugger `jdb`, packager).

### Q3: What is the JIT Compiler and how does it work?
* **JIT (Just-In-Time) Compiler**: A component of the JVM's execution engine.
* **Mechanism**: Instead of interpreting bytecode line-by-line repeatedly, JIT compiles frequently executed code blocks ("hotspots") directly into native machine code at runtime, caching it for subsequent executions to boost performance.

### Q4: List the primitive data types in Java, their sizes, and default values.
* `byte`: 1 byte, default `0`.
* `short`: 2 bytes, default `0`.
* `int`: 4 bytes, default `0`.
* `long`: 8 bytes, default `0L`.
* `float`: 4 bytes, default `0.0f`.
* `double`: 8 bytes, default `0.0d`.
* `char`: 2 bytes (Unicode), default `'\u0000'`.
* `boolean`: JVM-dependent (effectively 1 bit/byte), default `false`.

### Q5: Explain the concept of Autoboxing and Unboxing.
* **Autoboxing**: Automatic conversion of primitive types to their corresponding wrapper classes by the Java compiler (e.g., `int` to `Integer`).
* **Unboxing**: The reverse process - automatic conversion of wrapper class instances back into primitive types (e.g., `Double` to `double`).

### Q6: What is the difference between equals() and ==?
* **`==` Operator**: Compares **memory addresses (references)** for objects to see if they point to the identical location. Compares primitive values directly.
* **`equals()` Method**: Defined in `Object` class. Can be overridden to perform **value/content comparison** (e.g., comparing string text rather than physical references).

### Q7: Explain the memory areas allocated by the JVM.
* **Heap**: Stores all objects, instances, and arrays. Shared across threads.
* **Stack**: Stores local variables and partial results. Each thread has its own private stack.
* **Method Area**: Stores class structures, metadata, field/method data, and static variables.
* **PC Register**: Contains the address of the currently executing JVM instruction.
* **Native Method Stack**: Stores state for native methods (written in C/C++).

### Q8: What is Garbage Collection in Java? How does it work?
* **Garbage Collection (GC)**: An automatic JVM process that reclaims heap memory by destroying unreachable objects.
* **Mechanism**: Uses a **Mark-and-Sweep** algorithm. The JVM identifies "GC Roots" (active references), marks all reachable objects, and sweeps away unmarked, orphaned objects.

### Q9: Explain JVM Heap memory structure.
* **Young Generation**: Where new objects are created. Split into **Eden space**, **Survivor 0 (S0)**, and **Survivor 1 (S1)**. Minor GC cleans this area.
* **Old Generation (Tenured)**: Holds long-lived objects promoted from the Young Generation after surviving multiple GC cycles. Major GC cleans this.
* **Metaspace**: Replaced PermGen in Java 8. Stores class definitions and metadata in native off-heap memory.

### Q10: What is the difference between String, StringBuilder, and StringBuffer?
* **`String`**: **Immutable** character sequence. Any modification creates a new object in memory. Thread-safe.
* **`StringBuilder`**: **Mutable** character sequence. Not thread-safe, but highly performant.
* **`StringBuffer`**: **Mutable** character sequence. Thread-safe because its methods are synchronized, making it slower than `StringBuilder`.

### Q11: What is the String Constant Pool?
* **Definition**: A specialized storage area inside the JVM Heap memory.
* **Mechanism**: When a string literal is created (e.g., `String s = "abc"`), the JVM checks the pool. If "abc" exists, it returns the reference. If not, it creates a new instance in the pool. This prevents memory duplication.

### Q12: Explain the four pillars of Object-Oriented Programming (OOP).
* **Encapsulation**: Hiding internal data using private fields and exposing them via public getter/setter methods.
* **Inheritance**: Allowing a child class to inherit fields and methods from a parent class using the `extends` keyword.
* **Polymorphism**: The ability of an object to take multiple forms (Method Overloading/Overriding).
* **Abstraction**: Hiding implementation details and showing only functional definitions using interfaces and abstract classes.

### Q13: Explain Method Overloading vs Method Overriding.
* **Method Overloading**: Defining multiple methods in the *same* class with identical names but different parameter list signatures. (Compile-time/static polymorphism).
* **Method Overriding**: Re-defining a superclass method in a subclass with the *same* name, return type, and parameters. (Runtime/dynamic polymorphism).

### Q14: Can we override private or static methods in Java?
* **Private Methods**: **No**. They are not visible to subclasses, so they cannot be overridden.
* **Static Methods**: **No**. They are bound to the class rather than instances. Re-defining a static method in a subclass is called **method hiding**, not overriding.

### Q15: What is the difference between an Abstract Class and an Interface?
* **Abstract Class**: Can have instance fields, constructors, concrete methods, and multiple inheritance is not supported (can only extend one class).
* **Interface**: Can only have static final constants (no instance fields), no constructors, supports multiple inheritance, and can declare default/static concrete methods (Java 8+).

### Q16: What is the purpose of the super and this keywords?
* **`this`**: References the current class instance. Used to resolve ambiguity between instance variables and parameters.
* **`super`**: References the immediate parent class instance. Used to invoke parent constructors, fields, or overridden methods.

### Q17: Explain final, finally, and finalize.
* **`final`**: Modifier. Applied to classes (cannot be inherited), methods (cannot be overridden), or variables (value cannot be changed).
* **`finally`**: Block. Paired with try-catch to execute cleanup code regardless of whether an exception is thrown.
* **`finalize()`**: Deprecated method in `Object` class. Called by the Garbage Collector before an object is reclaimed.

### Q18: What are the access modifiers in Java and their scopes?
* **`private`**: Accessible only within the declaring class.
* **`default` (no modifier)**: Accessible within the declaring class and package.
* **`protected`**: Accessible within the package and by subclasses outside the package.
* **`public`**: Accessible from anywhere in the application.

### Q19: What is the difference between Exception and Error in Java?
* **Exception**: Represents exceptional conditions that a reasonable application should catch and handle (e.g., `IOException`). Inherits from `Throwable`.
* **Error**: Represents severe system or hardware failures that applications should not try to catch (e.g., `OutOfMemoryError`). Inherits from `Throwable`.

### Q20: Explain Checked vs Unchecked Exceptions.
* **Checked Exceptions**: Checked at compile-time. The program must handle them using try-catch or declare them using `throws` (e.g., `SQLException`).
* **Unchecked Exceptions**: Occur at runtime. Inherit from `RuntimeException` (e.g., `NullPointerException`). The compiler does not force handling.

### Q21: What is the Try-with-Resources statement?
* **Definition**: A try block that declares one or more resources (e.g., file streams, database connections).
* **Requirement**: The resource class must implement the `AutoCloseable` interface.
* **Benefit**: The JVM automatically closes all declared resources when the try block exits, preventing resource leaks and avoiding verbose finally blocks.

### Q22: Explain static variables and static methods.
* **Static Variable**: A single copy is shared across all instances of the class. Evaluated when the class is loaded.
* **Static Method**: Belongs to the class, not instances. Can access only static fields/methods directly without creating an object.

### Q23: What is the purpose of the transient keyword?
* **Serialization Avoidance**: Used on instance variables to prevent them from being serialized when saving or transmitting object states.
* **Default values**: Upon deserialization, transient fields are initialized with their default values (e.g., `null` for objects, `0` for numbers).

### Q24: What is the purpose of the volatile keyword?
* **Memory Visibility**: Guarantees that writes to a variable are written directly to main memory, and reads are fetched directly from main memory.
* **No Caching**: Prevents threads from caching variables in CPU registers, ensuring all threads see the most up-to-date value.

### Q25: Explain the core interfaces of the Java Collection Framework.
* **Collection**: The root interface.
* **List**: Ordered collection that allows duplicate elements (e.g., `ArrayList`).
* **Set**: Unordered collection that prohibits duplicates (e.g., `HashSet`).
* **Queue**: Designed for holding elements prior to processing, usually FIFO (e.g., `PriorityQueue`).
* **Map**: Key-value pair mapping; does not extend `Collection` (e.g., `HashMap`).

### Q26: What is the difference between ArrayList and LinkedList?
* **`ArrayList`**: Backed by a dynamic array. Fast random access (`O(1)`), slow insertions/deletions (`O(N)`) because elements must be shifted.
* **`LinkedList`**: Backed by a doubly-linked list. Slow random access (`O(N)`), fast insertions/deletions (`O(1)`) once the element node is reached.

### Q27: How do HashMap and Hashtable differ?
* **`HashMap`**: Not synchronized (not thread-safe), allows one `null` key and multiple `null` values. Highly performant.
* **`Hashtable`**: Legacy class. Synchronized (thread-safe), prohibits `null` keys or values. Slower performance.

### Q28: What is the difference between HashSet and TreeSet?
* **`HashSet`**: Backed by a `HashMap`. Stores elements in no guaranteed order. Operations are `O(1)`. Allows `null`.
* **`TreeSet`**: Backed by a `TreeMap` (Red-Black tree). Stores elements in sorted order. Operations are `O(log N)`. Prohibits `null`.

### Q29: How does HashMap work internally in Java?
* **Hashing**: Computes `hashCode()` on the key to determine the index in an internal array (bucket).
* **Collision Resolution**: Uses a linked list in each bucket. In Java 8, if a bucket size exceeds 8 elements and total map capacity is $\geq 64$, the linked list is converted into a balanced **Red-Black Tree** to improve worst-case lookup from `O(N)` to `O(log N)`.

### Q30: What is the difference between Comparable and Comparator?
* **`Comparable`**: Defines the natural ordering of objects. Must implement `compareTo(Object o)` inside the target class.
* **`Comparator`**: Defines custom ordering. Implement `compare(Object o1, Object o2)` in an external class or lambda expression.

### Q31: What are default and static methods in Interfaces?
* **Default Methods**: Marked with the `default` keyword. Allow adding new methods to interfaces with default implementations without breaking existing class implementations.
* **Static Methods**: Utility methods bound to the interface class name itself. Cannot be overridden by implementing classes.

### Q32: What is a Lambda Expression and a Functional Interface?
* **Functional Interface**: An interface that declares exactly **one abstract method** (annotated with `@FunctionalInterface`).
* **Lambda Expression**: A compact, anonymous implementation block used to express functional interface signatures inline (e.g., `() -> System.out.println("Hello")`).

### Q33: Explain Predicate, Consumer, Supplier, and Function functional interfaces.
* **`Predicate<T>`**: Accepts `T`, returns `boolean`. (Method: `test`).
* **`Consumer<T>`**: Accepts `T`, returns `void`. (Method: `accept`).
* **`Supplier<T>`**: Accepts nothing, returns `T`. (Method: `get`).
* **`Function<T, R>`**: Accepts `T`, returns `R`. (Method: `apply`).

### Q34: What is the Stream API? Explain Intermediate vs Terminal operations.
* **Stream API**: A pipeline system designed to process collections of objects in a declarative, functional style.
* **Intermediate Operations**: Return a new Stream. They are lazy and execute only when a terminal operation is called (e.g., `filter()`, `map()`).
* **Terminal Operations**: Execute the pipeline and return a non-stream result or void (e.g., `collect()`, `forEach()`, `reduce()`).

### Q35: What is the Optional class?
* **Definition**: A container object which may or may not contain a non-null value (introduced in Java 8).
* **Purpose**: Prevents defensive null checks and mitigates `NullPointerException` errors by returning explicit optional handles.

### Q36: What is the difference between map() and flatMap() in Streams?
* **`map()`**: Transforms each element of a Stream into another element (`1:1` mapping).
* **`flatMap()`**: Flattens a Stream of Streams or complex collections into a single flat stream (`1:Many` mapping).

### Q37: How do you create and start a Thread in Java?
* **Method 1**: Extend the `Thread` class and override its `run()` method, then call `start()`.
* **Method 2**: Implement the `Runnable` interface, pass it to a `Thread` constructor, then call `start()`. (Preferred because Java supports only single class inheritance).

### Q38: Describe the lifecycle states of a Thread.
* **New**: Thread instantiated but `start()` not yet called.
* **Runnable**: Thread is executing or ready for execution in the OS queue.
* **Blocked**: Waiting to acquire a monitor lock.
* **Waiting**: Waiting indefinitely for another thread's action (`wait()`, `join()`).
* **Timed Waiting**: Waiting for a specified time (`sleep(ms)`, `wait(ms)`).
* **Terminated**: Run execution completed.

### Q39: What is the synchronized keyword and a monitor?
* **Synchronized**: Enforces mutual exclusion by allowing only one thread to execute a block or method at a time.
* **Monitor**: An internal lock associated with every object in Java. A thread must acquire the object's monitor lock before entering a synchronized section.

### Q40: What is the difference between wait() and sleep()?
* **`sleep()`**: Static method in `Thread`. Pauses execution for a specified duration without releasing acquired locks.
* **`wait()`**: Instance method in `Object`. Causes the thread to release its monitor lock and wait until notified. Must be called inside a synchronized block.

### Q41: What does the join() method do?
* **Coordination**: Forces the calling thread to pause execution and wait until the target thread completes execution before continuing.

### Q42: List the major features introduced in Java 8.
* Lambda Expressions.
* Functional Interfaces.
* Stream API.
* Optional Class.
* Default and Static methods in Interfaces.
* Date and Time API (`java.time`).
* Metaspace replacing PermGen.

### Q43: What is the difference between shallow copy and deep copy?
* **Shallow Copy**: Copies the top-level object, but nested object references still point to the identical memory addresses as the source object.
* **Deep Copy**: Recursively copies the target object along with all nested referenced objects, establishing completely independent object graphs.

---

### Q44: What are wrapper classes and why do they exist?
* Each primitive has a corresponding immutable reference type: `Integer`, `Long`, `Boolean`, `Character`, etc.
* **Why**: generics (`List<Integer>` - primitives not allowed), collections, reflection, and APIs requiring objects; they also provide utility constants/methods (`MAX_VALUE`, `parseInt`, `valueOf`).
* Autoboxing converts primitive↔wrapper implicitly. Beware: `==` between wrappers compares references (works only for the cached range -128..127 for Integer); use `.equals()`.
* Frequent boxing inside loops creates garbage and hurts performance - prefer primitives in hot paths.

### Q45: Array vs ArrayList - what are the differences?
| Aspect | Array | ArrayList |
| :--- | :--- | :--- |
| Length | Fixed at creation | Dynamic growth (~1.5x) |
| Type | Primitives + objects | Objects only (generics) |
| Performance | Direct indexing, no bounds-check overhead beyond JVM | Extra indirection, resizing copies |
| Features | `length` field only | `add/remove/contains`, iterators, streams |

* Arrays can be multi-dimensional natively (`int[][]`); ArrayList needs nested lists.
* Use arrays for fixed-size, performance-critical numeric data; ArrayList for everyday dynamic lists.

### Q46: What is a static initializer block? Describe class initialization order.
* `static { ... }` runs once when the class is initialized - ideal for initializing static fields that need logic (populating maps, loading config).
* **Order**: static fields + static blocks execute in *textual order* during class initialization (triggered by first `new`, static access, or reflection), then instance fields + instance initializer blocks in textual order, then constructor body.
* Multiple static blocks are allowed and run top-to-bottom; exceptions thrown here surface as `ExceptionInInitializerError`.
* Pitfall: initialization cycles between classes can observe default values of not-yet-initialized statics.

### Q47: Can two methods differ only by return type? What defines a method signature?
* No. The **method signature** = method name + parameter list (types, count, order) only - return type, access modifier, and throws clause are NOT part of it.
* Declaring two methods differing solely by return type is a compile error ("method already defined").
* Overloading requires genuinely different parameter lists; covariant return types apply only to *overriding*, where a subclass may narrow the return type.

### Q48: What are packages, and what is the CLASSPATH?
* A **package** namespaces types (`com.acme.orders.Service`), controls access (package-private), and organizes code physically into directories/JARs.
* **CLASSPATH** tells the JVM/classloaders where to search for `.class` files and JARs: `-cp` flag, environment variable, or module path for JPMS apps.
* Resolution: fully-qualified name → mapped to directory path or jar entry → loaded by classloader hierarchy.
* Modern builds manage this via Maven/Gradle dependency trees; manual CLASSPATH management invites duplicate-jar and version-conflict bugs.

### Q49: What are varargs? What are their rules and pitfalls?
* Variable arity parameters: `int sum(int... values)` accepts zero or more ints; inside the method `values` is an `int[]`.
* Rules: at most one varargs parameter, must be last in the parameter list.
* Overload resolution prefers exact-match methods over varargs; ambiguity errors possible with boxed/widening combos.
* Pitfalls: passing a `null` varargs argument (NPE on use), heap pollution with generic varargs (`@SafeVarargs`), and hidden array allocation per call in hot paths.

### Q50: Why are Strings immutable in Java?
* **Security**: file paths, class names, network params flow through Strings; immutability prevents post-validation tampering.
* **String pool sharing**: safe interning relies on immutability - one instance serves many references without defensive copies.
* **Thread safety**: freely shareable across threads with no synchronization.
* **Hashcode caching**: the hash is computed lazily then cached, making HashMap keys fast.
* Implementation detail: `final` class (no mutable subclass), fields final; since Java 9 the backing store is a compact `byte[]` with a coder flag instead of UTF-16 char[].

---

## Coding & Implementation Challenges

### Q51: Write a functional Java method to reverse a String in-place.
```java
public class StringReverser {
    public static String reverse(String input) {
        if (input == null) return null;
        char[] characters = input.toCharArray();
        int left = 0;
        int right = characters.length - 1;
        while (left < right) {
            char temp = characters[left];
            characters[left] = characters[right];
            characters[right] = temp;
            left++;
            right--;
        }
        return new String(characters);
    }
}
```

### Q52: Implement a thread-safe Singleton pattern using Double-Checked Locking.
```java
public class ThreadSafeSingleton {
    // volatile prevents instruction reordering issues
    private static volatile ThreadSafeSingleton instance;

    private ThreadSafeSingleton() {} // Private constructor

    public static ThreadSafeSingleton getInstance() {
        if (instance == null) {
            synchronized (ThreadSafeSingleton.class) {
                if (instance == null) {
                    instance = new ThreadSafeSingleton();
                }
            }
        }
        return instance;
    }
}
```

### Q53: Implement a method to check if a String is a palindrome (ignoring case).
```java
public class PalindromeChecker {
    public static boolean isPalindrome(String text) {
        if (text == null) return false;
        String clean = text.replaceAll("[^a-zA-Z0-String]", "").toLowerCase();
        int left = 0;
        int right = clean.length() - 1;
        while (left < right) {
            if (clean.charAt(left) != clean.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}
```

### Q54: Design a simple LIFO Stack implementation using a generic Array.
```java
import java.util.EmptyStackException;

public class SimpleStack<T> {
    private T[] elements;
    private int size = 0;
    private static final int DEFAULT_CAPACITY = 10;

    @SuppressWarnings("unchecked")
    public SimpleStack() {
        elements = (T[]) new Object[DEFAULT_CAPACITY];
    }

    public void push(T val) {
        if (size == elements.length) {
            resize();
        }
        elements[size++] = val;
    }

    public T pop() {
        if (size == 0) throw new EmptyStackException();
        T val = elements[--size];
        elements[size] = null; // Prevent memory leak
        return val;
    }

    @SuppressWarnings("unchecked")
    private void resize() {
        T[] newArr = (T[]) new Object[elements.length * 2];
        System.arraycopy(elements, 0, newArr, 0, elements.length);
        elements = newArr;
    }
}
```

### Q55: Find and count duplicate characters inside a String using a Map.
```java
import java.util.HashMap;
import java.util.Map;

public class DuplicateFinder {
    public static Map<Character, Integer> findDuplicates(String str) {
        Map<Character, Integer> counts = new HashMap<>();
        if (str == null) return counts;
        for (char c : str.toCharArray()) {
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
        counts.entrySet().removeIf(entry -> entry.getValue() <= 1);
        return counts;
    }
}
```

### Q56: Write a method to check if a given integer is a Prime Number.
```java
public class PrimeVerifier {
    public static boolean isPrime(int num) {
        if (num <= 1) return false;
        if (num == 2) return true;
        if (num % 2 == 0) return false;
        for (int i = 3; i <= Math.sqrt(num); i += 2) {
            if (num % i == 0) return false;
        }
        return true;
    }
}
```

### Q57: Write a Stream API query to filter even numbers from a list and sum them.
```java
import java.util.List;

public class EvenStreamSum {
    public static int sumEvenNumbers(List<Integer> list) {
        if (list == null) return 0;
        return list.stream()
                   .filter(n -> n % 2 == 0)
                   .mapToInt(Integer::intValue)
                   .sum();
    }
}
```
