# Java - Medium Interview Questions

### Q1: What is the difference between fail-fast and fail-safe iterators?
* **Fail-Fast**:
  * **Mechanism**: Operates directly on the collection's structure. If the collection is structurally modified (added/removed) after the iterator is created, it immediately throws `ConcurrentModificationException` using a `modCount` check.
  * **Examples**: `ArrayList`, `HashMap`, `HashSet` iterators.
* **Fail-Safe (Weakly Consistent)**:
  * **Mechanism**: Operates on a clone or snapshot of the collection, or utilizes lock-free concurrent structures. It does *not* throw exceptions if modifications occur during iteration.
  * **Examples**: `CopyOnWriteArrayList`, `ConcurrentHashMap` iterators.

### Q2: Explain how ConcurrentHashMap achieves high concurrency in Java 8.
* **Locking Mechanism**: Instead of locking the entire map (like `Hashtable` or `Collections.synchronizedMap`), it uses **Node-level synchronization** using CAS (Compare-And-Swap) for empty buckets and locks only the **head node of a specific bucket segment** during write operations.
* **Concurrency Level**: Allows concurrent read operations without locking and locks individual buckets during writes, enabling high throughput under heavy multithreaded loads.

### Q3: Explain the difference between ExecutorService.submit() and execute().
* **`execute()`**: Defined in the `Executor` interface. Accepts a `Runnable` task, returns `void` (fire-and-forget), and propagates unhandled exceptions directly to the thread's uncaught exception handler.
* **`submit()`**: Defined in `ExecutorService`. Accepts `Runnable` or `Callable` tasks, returns a `Future` object wrapping the execution state, and swallows exceptions, returning them inside the `Future.get()` call.

### Q4: Detail the parameters of ThreadPoolExecutor.
* **`corePoolSize`**: The minimum number of threads kept alive in the pool, even if they are idle.
* **`maximumPoolSize`**: The maximum number of active threads allowed to run concurrently in the pool.
* **`keepAliveTime`**: The maximum duration that excess idle threads (beyond core size) wait for new tasks before terminating.
* **`workQueue`**: The queue (`BlockingQueue`) holding tasks before they are picked up by active threads (e.g., `LinkedBlockingQueue`, `SynchronousQueue`).

### Q5: What are the different types of thread pools created by the Executors utility?
* **Fixed Thread Pool (`newFixedThreadPool(n)`)**: Uses a fixed number of threads and an unbounded queue.
* **Cached Thread Pool (`newCachedThreadPool()`)**: Spawns new threads dynamically as needed, reclaiming idle threads after 60 seconds; uses a `SynchronousQueue` (no storage capacity).
* **Single Thread Executor (`newSingleThreadExecutor()`)**: Spawns exactly one worker thread executing tasks sequentially in FIFO order.
* **Scheduled Thread Pool (`newScheduledThreadPool(n)`)**: Scheduled to execute commands after a delay or periodically.

### Q6: Explain the Fork/Join framework and its Work-Stealing algorithm.
* **Fork/Join**: Designed for parallelizing recursive divide-and-conquer tasks using `ForkJoinPool`.
* **Work-Stealing Algorithm**: Each worker thread has its own double-ended queue (deque) of tasks. If a thread finishes all its tasks, it steals tasks from the **tail** of another busy thread's deque, minimizing thread idle time and optimizing core usage.

### Q7: What is the difference between Callable and Runnable?
* **`Runnable`**: Defines a single method `run()` returning `void`, and cannot throw checked exceptions (introduced in Java 1.0).
* **`Callable`**: Defines a method `call()` returning a generic type `<V>`, and can throw checked exceptions (introduced in Java 1.5).

### Q8: Explain Future vs CompletableFuture in Java.
* **`Future`**: Represents an asynchronous computation. Checking for completion or retrieving the result requires blocking calls (`get()`) or polling (`isDone()`).
* **`CompletableFuture`**: Implements `Future` and `CompletionStage`. Supports non-blocking callbacks, functional chaining (e.g., `thenApply()`, `thenAccept()`), exceptional handling pipelines, and combining multiple async tasks together.

### Q9: What is a Deadlock? State the four conditions required for it to occur.
* **Deadlock**: A scenario where two or more threads are permanently blocked, waiting for locks held by each other.
* **Coffman Conditions**:
  * **Mutual Exclusion**: At least one resource is held in non-shareable mode.
  * **Hold and Wait**: A thread holds resources while waiting to acquire others.
  * **No Preemption**: Resources cannot be forcibly taken from a thread.
  * **Circular Wait**: A closed loop of threads exists where each waits for a resource held by the next.

### Q10: Explain Thread Starvation vs Livelock.
* **Starvation**: A thread is permanently denied access to shared resources or CPU scheduling because higher-priority threads monopolize the resources.
* **Livelock**: Threads continuously change their execution states in response to each other without making actual progress, consuming CPU resources indefinitely (unlike deadlock which blocks threads).

### Q11: Explain ThreadLocal variables and their associated memory leak risk.
* **`ThreadLocal`**: Provides thread-confined variables. Each thread has its own isolated copy of the variable, accessible via `get()` and `set()`.
* **Memory Leak Risk**: ThreadLocal utilizes weak keys in `ThreadLocalMap`. If a thread runs inside an application server thread pool (like Tomcat) and is reused, the thread-local values persist unless explicitly removed using `.remove()`, causing massive classloader memory leaks.

### Q12: Compare the synchronized keyword with ReentrantLock.
* **Synchronized**: Simple, automatic lock release, but lacks flexibility (must block, cannot do try-lock, non-fair by default).
* **ReentrantLock**: Offers advanced features:
  * **`tryLock()`**: Non-blocking lock acquisition attempt with timeout capabilities.
  * **Fair Lock**: Option to grant locks to the longest-waiting thread.
  * **Interruptible**: Ability to interrupt a thread waiting for a lock (`lockInterruptibly()`).

### Q13: Explain ReadWriteLock and its typical use case.
* **ReadWriteLock**: Maintains a pair of locks: a read lock (shared) and a write lock (exclusive).
* **Behavior**: Multiple threads can acquire the read lock concurrently as long as no thread holds the write lock. Only one thread can acquire the write lock.
* **Use Case**: Highly performant for collections or data structures with frequent reads and infrequent write operations.

### Q14: What is Type Erasure in Java Generics?
* **Definition**: A compilation mechanism. The compiler replaces all generic type parameters with their bounds (or `Object` if unbounded) during compilation.
* **Impact**: Bytecode contains only standard classes/interfaces. This ensures backward compatibility with legacy non-generic code but means type arguments are not available at runtime via reflection.

### Q15: Explain PECS (Producer Extends, Consumer Super) in Generics.
* **PECS**: Rule for designing wildcard boundaries:
  * **Producer (`? extends T`)**: If your generic structure produces data (reads from it), use `extends`. Allows reading elements as `T`, but prevents writing to it (read-only).
  * **Consumer (`? super T`)**: If your generic structure consumes data (writes to it), use `super`. Allows writing elements of type `T`, but prevents reading elements as a specific type (except `Object`).

### Q16: Explain the Java Reflection API along with its pros and cons.
* **Reflection**: Allows inspect and manipulate classes, interfaces, constructors, methods, and fields at runtime.
* **Pros**: Essential for frameworks (Spring, Hibernate) for dynamic dependency injection and object mapping.
* **Cons**: Severe performance overhead (dynamic resolution bypasses optimizations), bypasses encapsulation (can access private fields), and lacks compile-time safety.

### Q17: Explain Java Serialization and the significance of serialVersionUID.
* **Serialization**: Converting an object's state into a byte stream for storage or transmission.
* **`serialVersionUID`**: A unique 64-bit identifier used to verify that the sender and receiver of a serialized object have loaded classes compatible with the serialization layout. If not declared, JVM generates one dynamically; any class structural change will alter this value, causing `InvalidClassException` during deserialization.

### Q18: What is the difference between Serializable and Externalizable?
* **`Serializable`**: Marker interface. JVM handles serialization automatically via reflection (slow, default layout).
* **`Externalizable`**: Sub-interface of `Serializable`. Requires implementing `writeExternal()` and `readExternal()`, giving developers complete, high-performance control over object layout serialization.

### Q19: Explain Internal vs External Iteration in Java.
* **External Iteration**: Developer controls *how* elements are traversed using loops or iterators (e.g., `for-each`).
* **Internal Iteration**: The collection library controls traversal internally (e.g., Java Streams `.forEach()`), allowing declarative processing and automatic multi-threaded optimization.

### Q20: What is the difference between peek() and map() in Streams?
* **`map()`**: A transform operation. Accepts a Function and returns a Stream containing transformed elements.
* **`peek()`**: A debugging helper. Accepts a Consumer, executes actions on elements without altering them, and returns the identical Stream. Primarily used for logging.

### Q21: Compare reduce() and collect() terminal operations.
* **`reduce()`**: Combines stream elements into a single value using immutable reduction (e.g., finding the sum or max).
* **`collect()`**: Accumulates stream elements into a mutable container (e.g., `List`, `Map`) using `Collector` implementations.

### Q22: What are short-circuiting operations in Streams?
* **Definition**: Stream operations that terminate processing as soon as a matching condition is met, without evaluating the entire stream.
* **Examples**:
  * Intermediate: `limit(n)`.
  * Terminal: `anyMatch()`, `allMatch()`, `findFirst()`, `findAny()`.

### Q23: What is a Parallel Stream? When should it be avoided?
* **Parallel Stream**: Spawns multiple threads using the shared `ForkJoinPool.commonPool()` to execute stream pipelines concurrently.
* **Avoid When**:
  * The dataset is small (overhead outweighs benefits).
  * State is shared (race conditions).
  * Operations are highly sequential or depend on element ordering.
  * Under heavy I/O workloads (blocks the shared common pool threads).

### Q24: What are the best practices for Exception Handling in Java?
* Never catch `Throwable` or generic `Exception` directly; catch specific subclasses.
* Never swallow exceptions; always log the stack trace or rethrow.
* Wrap low-level technical exceptions in meaningful custom domain-level exceptions.
* Always clean up resources using try-with-resources.

### Q25: Explain the Java Module System (Project Jigsaw) introduced in Java 9.
* **Concept**: Groups packages into self-contained modules defined via `module-info.java`.
* **Key Directives**:
  * `exports`: Declares packages visible to other modules.
  * `requires`: Declares dependency modules necessary for compilation and execution.
* **Benefits**: Strong encapsulation, reduced footprint, and faster startup.

### Q26: What features were introduced in Java 9 besides modules?
* **JShell**: An interactive REPL CLI tool.
* **Factory Methods for Collections**: Convenient initialization (e.g., `List.of()`, `Set.of()`).
* **Private methods in Interfaces**: Allows sharing helper code between default interface methods.
* **Enhanced Process API**: OS process control improvements.

### Q27: Explain Local-Variable Type Inference (var) in Java 10.
* **`var`**: Allows the compiler to infer local variable types automatically at compile-time (e.g., `var list = new ArrayList<String>()`).
* **Rules**: Can be used only for local variables with initializers. Cannot be used for method return types, instance fields, or parameters.

### Q28: What major features were introduced in Java 11?
* Native HTTP Client (standardizing async HTTP requests).
* Run Single-File Source Code (`java HelloWorld.java` directly).
* New String utility methods (`isBlank()`, `strip()`, `repeat()`).
* Support for local-variable syntax (`var`) in Lambda parameters.

### Q29: Explain Switch Expressions introduced in Java 14.
* **Feature**: Allows `switch` to act as an expression returning a value.
* **Syntax**: Uses arrow syntax (`->`) which avoids fall-through and eliminates the need for `break` statements.
* **Keyword `yield`**: Used to return a value from multi-line switch statement blocks.

### Q30: What are Text Blocks in Java 15?
* **Text Blocks**: Multi-line string literals enclosed in triple double quotes (`"""`).
* **Benefits**: Eliminates the need to escape special characters (like quotes) and preserves indentation formatting natively, ideal for SQL queries or JSON strings.

### Q31: Explain Records in Java 16.
* **`record`**: A special class declaration designed to hold immutable data.
* **Automated code**: The compiler automatically generates private final fields, constructors, getters (matching field names), `equals()`, `hashCode()`, and `toString()`, eliminating standard Lombok or boilerplate code.

### Q32: What are Sealed Classes and Interfaces in Java 17?
* **Sealed Classes**: Allows restricting which subclasses can extend or implement a class/interface using `sealed` and `permits` keywords.
* **Subclass Modifiers**: Permits subclasses must be declared as `final`, `sealed`, or `non-sealed` to maintain or loosen the hierarchy boundary.

### Q33: Explain Strong, Soft, Weak, and Phantom References.
* **Strong**: Standard object creation. Never garbage collected unless reference is set to null.
* **Soft**: Collected only when JVM is out of memory (ideal for memory caches).
* **Weak**: Collected immediately during any GC sweep if no strong references exist.
* **Phantom**: Reclaimed by GC but added to a `ReferenceQueue` to perform pre-mortem cleanup operations.

### Q34: Explain the ClassLoader Delegation Hierarchy.
* **Bootstrap ClassLoader**: The root loader, loads core runtime classes (`java.lang.*`) from the JDK runtime.
* **Platform/Extension ClassLoader**: Loads extension APIs.
* **Application/System ClassLoader**: Loads application-level classpath and modular dependency classes.
* **Delegation Rule**: A classloader always delegates class loading requests to its parent loader before attempting to locate the class itself.

### Q35: Explain Static vs Dynamic Binding in Java.
* **Static Binding**: Occurs at compile-time. Method call is resolved based on the reference type. Used for `static`, `private`, and `final` methods.
* **Dynamic Binding**: Occurs at runtime. Method call is resolved based on the actual object instance type (polymorphic overriding resolution).

### Q36: Explain Pattern Matching for instanceof in Java 16.
* **Feature**: Combines checking type and binding variable casting in a single step, eliminating boilerplate code (e.g., `if (obj instanceof String s)` binds `s` directly).

### Q37: Explain the Java Memory Model (JMM) and Happens-Before.
* **JMM**: Defines how threads interact through memory, dictating visibility of writes.
* **Happens-Before Relationship**: A set of rules ensuring memory operations are visible to other threads. For example, a write to a `volatile` field happens-before every subsequent read of the same field.

### Q38: What is the difference between poll() and remove() in a Queue?
* **`poll()`**: Retrieves and removes the head of the queue, returning `null` if the queue is empty.
* **`remove()`**: Retrieves and removes the head, but throws `NoSuchElementException` if the queue is empty.

### Q39: What is the difference between IdentityHashMap and HashMap?
* **`HashMap`**: Compares keys using `equals()` and `hashCode()` (value equivalence).
* **`IdentityHashMap`**: Compares keys strictly using `==` (reference equality), allowing duplicate key instances if they are distinct object allocations.

### Q40: What make EnumMap and EnumSet highly performant?
* **Internal Structure**:
  * `EnumMap` is backed by a simple, pre-sized array.
  * `EnumSet` is backed by a highly optimized bit vector (usually a single `long` variable).
* **Operations**: Execute in single-digit CPU instructions, providing exceptional performance.

### Q41: Explain how WeakHashMap prevents memory leaks.
* **Weak keys**: Uses `WeakReference` for keys.
* **Collection cleanup**: If a key has no strong references elsewhere, it becomes eligible for GC. Once GC reclaims the key, the map automatically clears the associated entry from the map on subsequent operations, avoiding memory buildup.

### Q42: What is the difference between User Threads and Daemon Threads?
* **User Thread**: High-priority application thread. The JVM will not terminate as long as at least one user thread is actively running.
* **Daemon Thread**: Low-priority background service thread (e.g., GC). The JVM terminates instantly once all user threads complete, killing daemon threads in place.

### Q43: What is the purpose of System.gc() and runtime garbage collection hints?
* **System.gc()**: Sends a hint/request to the JVM to trigger garbage collection.
* **No Guarantee**: The JVM is free to ignore the request entirely, rendering the command useless for production code.

---

### Q44: How does TreeMap work internally? What extra operations does NavigableMap provide?
* TreeMap is backed by a **Red-Black tree** (self-balancing BST): get/put/remove in O(log n), keys kept sorted per Comparator/natural ordering.
* Entries are linked in insertion-of-key order, enabling ordered traversal and range views.
* **NavigableMap API**: `floorKey`, `ceilingKey`, `lowerKey`, `higherKey`, `firstEntry/lastEntry`, `pollFirstEntry/pollLastEntry`, plus subset views `headMap/tailMap/subMap` (inclusive/exclusive bounds) — perfect for "range query" workloads (leaderboards, time-window lookups).
* Costs vs HashMap: slower average ops (log n vs O(1)), no null keys, tree-node memory overhead. Choose when sorted iteration/range semantics dominate raw lookup speed.

### Q45: How does PriorityQueue work? What is its complexity profile?
* Backed by a **binary min-heap** in an array; head = least element per natural order or supplied Comparator (use `Collections.reverseOrder()` for max-heap).
* `offer()/poll()` = O(log n) sift up/down; `peek()` = O(1); `remove(Object)/contains` = O(n). Iteration order is *unordered* — only the head is guaranteed minimal.
* Classic uses: top-k problems (keep heap of size k), Dijkstra/Prim frontiers, merge k sorted lists, schedulers.
* Not thread-safe — use `PriorityBlockingQueue` concurrently. For decrease-key operations (graph algorithms) you typically re-offer entries and skip stale ones lazily.

### Q46: Explain thenApply vs thenCompose vs thenCombine in CompletableFuture.
* `thenApply(fn)` — synchronous transform of the result: `CF<T> → CF<U>`; fn returns plain U.
* `thenCompose(fn)` — flatten nested futures: fn returns `CompletableFuture<U>`, avoiding `CF<CF<U>>`. Equivalent to flatMap/monadic bind; correct choice when the transformation itself starts another async call.
* `thenCombine(other, fn)` — run two independent futures concurrently and merge both results when both complete: `cf1.thenCombine(cf2, (a, b) -> a + b)`.
* Async variants (`thenApplyAsync(fn, executor)`) control which thread executes the callback; without an executor, callbacks may run on the completing thread or the caller — a common source of surprise in benchmarks and blocking calls (never block inside a callback on the common pool).

### Q47: What are suppressed exceptions in try-with-resources?
* When both the try block and a resource's `close()` throw, the *primary* exception propagates and the close-time exception is attached as **suppressed** via `Throwable.getSuppressed()` — neither is lost.
* Without try-with-resources (manual finally close), the close exception would *replace* the business exception, hiding the real root cause.
```java
try (var in = new FileInputStream(f)) { ... } // if body throws AND close throws:
// primary   = exception from body
// suppressed= exception from close()
```
* Interview angle: logging frameworks should print suppressed chains; writing AutoCloseable resources means guarding close logic so cleanup failures don't mask failures from `close()` itself being secondary.

### Q48: How do you write custom annotations? Explain @Retention and @Target.
* Declare with `@interface`; members are methods with defaults: `String value() default "";`
* Meta-annotations configure behavior:
  * **@Retention**: `SOURCE` (compiler-only, e.g., `@Override`), `CLASS` (bytecode, not runtime-visible), `RUNTIME` (readable via reflection — required for framework annotations).
  * **@Target**: restricts placement (`TYPE`, `METHOD`, `FIELD`, `PARAMETER`, `ANNOTATION_TYPE`...); `TYPE_USE` enables typing contexts (nullness markers).
  * **@Inherited** (class inheritance visibility), **@Repeatable**, **@Documented**.
* Runtime processing: `clazz.isAnnotationPresent(X.class)`, `method.getAnnotation(X.class)`. Compile-time processing uses annotation processors (APTs) — how Lombok/MapStruct/Dagger generate code.

### Q49: How do you design an immutable class in Java? List the mandatory rules.
1. Declare the class `final` (or make constructors private + factory) so subclasses cannot reintroduce mutability.
2. Make all fields `private final`.
3. No setters; initialize everything through the constructor performing **defensive copies** of incoming mutable arguments.
4. Return **defensive copies** (or unmodifiable views) of mutable internals from getters — never expose the internal array/collection/Date.
5. Ensure methods don't mutate shared state; derive new instances instead (`withX` style).
* Benefits: inherently thread-safe (safe publication without locks), hashable caching, safe map keys, simpler reasoning/testing. Records (Java 16+) give this shape automatically but still require care with mutable components.

### Q50: State the equals/hashCode contract and the bugs that violate it.
* Contract:
  1. **Reflexive**: x.equals(x) true.
  2. **Symmetric**: x.equals(y) ⇔ y.equals(x).
  3. **Transitive**: x=y ∧ y=z ⇒ x=z.
  4. **Consistent**: repeated calls (unchanged state) same result.
  5. **Null-safe**: x.equals(null) false.
  6. **HashCode linkage**: equal objects MUST have equal hashCodes (unequal hashCodes may coincide).
* Typical violations: overriding equals without hashCode (HashMap lookups miss); asymmetric equals comparing against incompatible subclass (use `getClass()` or follow the instanceof-with-final-class pattern); using mutable fields as keys then mutating them (entry becomes unreachable); delegating to `Objects.hash` with unstable fields like timestamps.

---

## Coding & Implementation Challenges

### Q51: Implement a Thread-Safe Bounded Blocking Queue using ReentrantLock.
```java
import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class BoundedBlockingQueue<T> {
    private final Queue<T> queue = new LinkedList<>();
    private final int capacity;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    public BoundedBlockingQueue(int capacity) {
        this.capacity = capacity;
    }

    public void put(T item) throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (queue.size() == capacity) {
                notFull.await(); // wait for space
            }
            queue.add(item);
            notEmpty.signalAll(); // notify consumers
        } finally {
            lock.unlock();
        }
    }

    public T take() throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (queue.isEmpty()) {
                notEmpty.await(); // wait for items
            }
            T item = queue.poll();
            notFull.signalAll(); // notify producers
            return item;
        } finally {
            lock.unlock();
        }
    }
}
```

### Q52: Find the length of the longest substring without repeating characters.
```java
import java.util.HashSet;
import java.util.Set;

public class LongestSubstring {
    public static int findLongestSubstringLength(String s) {
        if (s == null || s.isEmpty()) return 0;
        int maxLen = 0, left = 0, right = 0;
        Set<Character> seen = new HashSet<>();
        while (right < s.length()) {
            if (!seen.contains(s.charAt(right))) {
                seen.add(s.charAt(right));
                maxLen = Math.max(maxLen, right - left + 1);
                right++;
            } else {
                seen.remove(s.charAt(left));
                left++;
            }
        }
        return maxLen;
    }
}
```

### Q53: Implement a Custom Functional Interface and demonstrate its usage.
```java
public class CustomFunctionalInterface {
    
    @FunctionalInterface
    public interface StringTransformer {
        String transform(String input);
    }

    public static String processString(String str, StringTransformer transformer) {
        if (str == null) return null;
        return transformer.transform(str);
    }

    public static void main(String[] args) {
        // Lambda implementation to convert string to uppercase and add exclamation
        String result = processString("hello", s -> s.toUpperCase() + "!");
        System.out.println(result); // Outputs: HELLO!
    }
}
```

### Q54: Combine results of two Asynchronous CompletableFuture tasks.
```java
import java.util.concurrent.CompletableFuture;

public class FutureCombiner {
    public static CompletableFuture<String> fetchCombinedData() {
        CompletableFuture<String> task1 = CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(100); } catch (InterruptedException e) {}
            return "User Profile Info";
        });

        CompletableFuture<String> task2 = CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(150); } catch (InterruptedException e) {}
            return "Order History Details";
        });

        // Combine task1 and task2 outputs using thenCombine()
        return task1.thenCombine(task2, (res1, res2) -> res1 + " | " + res2);
    }
}
```

### Q55: Group Employees by Department and list their names using Stream API.
```java
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class StreamGrouping {
    public static class Employee {
        private final String name;
        private final String department;

        public Employee(String name, String department) {
            this.name = name;
            this.department = department;
        }
        public String getName() { return name; }
        public String getDepartment() { return department; }
    }

    public static Map<String, List<String>> groupNamesByDept(List<Employee> employees) {
        if (employees == null) return Map.of();
        return employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.mapping(Employee::getName, Collectors.toList())
            ));
    }
}
```

### Q56: Write a generic method to merge two arrays of any object type.
```java
import java.lang.reflect.Array;

public class ArrayMerger {
    @SuppressWarnings("unchecked")
    public static <T> T[] mergeArrays(T[] arr1, T[] arr2) {
        if (arr1 == null || arr2 == null) {
            throw new IllegalArgumentException("Arrays cannot be null");
        }
        int totalLength = arr1.length + arr2.length;
        T[] merged = (T[]) Array.newInstance(arr1.getClass().getComponentType(), totalLength);
        System.arraycopy(arr1, 0, merged, 0, arr1.length);
        System.arraycopy(arr2, 0, merged, arr1.length, arr2.length);
        return merged;
    }
}
```

### Q57: Implement Custom Exception demonstrating AutoCloseable usage.
```java
public class ExceptionChallenge {
    
    public static class CustomResourceException extends Exception {
        public CustomResourceException(String message) {
            super(message);
        }
    }

    public static class DummyConnection implements AutoCloseable {
        private final boolean forceFailure;

        public DummyConnection(boolean forceFailure) {
            this.forceFailure = forceFailure;
        }

        public void performAction() throws CustomResourceException {
            if (forceFailure) {
                throw new CustomResourceException("Action execution failed inside resource");
            }
        }

        @Override
        public void close() {
            // Auto close logic
            System.out.println("Resource automatically closed.");
        }
    }

    public static void execute(boolean fail) throws Exception {
        try (DummyConnection conn = new DummyConnection(fail)) {
            conn.performAction();
        }
    }
}
```
