# LLD - Hard Interview Questions

### Q1: How do you design an API Rate Limiter at the class level? Compare Token Bucket and Leaky Bucket models.
- **Token Bucket**: Stores tokens up to a maximum capacity. Tokens are added at a constant rate. Each request consumes a token. Allows bursts of traffic.
  - **Class Layout**: `RateLimiter` class holds `lastRefillTimestamp`, `allowedTokens`, `refillRate`, and a lock.
- **Leaky Bucket**: Requests enter a queue (bucket) and leak out at a constant processing rate. Smoothes out traffic bursts.
  - **Class Layout**: `LeakyLimiter` wraps a thread-safe blocking queue of size `capacity` with a background thread consuming requests at interval `leakRate`.

### Q2: How do you design a lock-free thread-safe concurrent queue?
- **Concept**: Bypasses heavy OS-level mutex synchronization using **Compare-And-Swap (CAS)** CPU primitives.
- **Implementation**: Employs the **Michael-Scott Queue** algorithm. Uses atomic references (`AtomicReference` in Java) for the `head` and `tail` nodes. Pushing and popping elements runs inside a CAS loop, continuously retrying until successful.

### Q3: Design a thread-safe, high-performance in-memory cache with an LRU eviction policy.
- **Data Structures**:
  - **HashMap**: Provides $O(1)$ lookup speed to locate cache keys.
  - **Doubly Linked List**: Tracks usage order in $O(1)$ time. Whenever a key is read/updated, its node is moved to the head. The tail represents the least recently used node.
- **Synchronization**: Uses a `ReentrantReadWriteLock` to permit concurrent readers while serializing write evictions.

### Q4: Design a custom Connection Pool supporting acquisition timeout configurations.
- **Key Fields**: `blockingQueue` representing available connections, `activeConnectionsCount`, `maxPoolSize`, and `lock`.
- **Acquisition Flow**: A thread requests a connection using `poll(timeout, TimeUnit)`. If the queue is empty and `activeConnectionsCount < maxPoolSize`, the pool instantiates a new connection dynamically. Otherwise, the thread blocks up to the designated timeout.

### Q5: Explain the structural design of a Multi-Level Cache (L1/L2) system.
- **L1 (In-Memory)**: Fast, small memory size (local heap).
- **L2 (Distributed)**: Slower, larger memory size (Redis/Memcached).
- **Coherence Policies**:
  - **Write-Through**: Updates both L1 and L2 immediately.
  - **Write-Back**: Updates L1 immediately and queues asynchronous updates to L2.
  - **Eviction**: Evicting from L1 does not affect L2. Evicting from L2 triggers invalidation signals to all local L1 caches.

### Q6: How do you handle concurrent seat locking in a Movie Ticket Booking System (e.g., BookMyShow)?
- **Mechanisms**:
  - **Pessimistic Locking**: Locks the database row of the selected seat during the checkout transaction. Prevents anyone else from reading or booking it, but lowers system throughput.
  - **Optimistic Locking**: Adds a `version` or `status` column. When updating, verifies if `status = AVAILABLE` and `version = currentVersion`. If a conflict is detected, the transaction aborts and the user is notified.

### Q7: Explain the low-level design of an Elevator Dispatcher coordinating multiple elevators.
- **State Representation**: Each `Elevator` holds current floor, direction (`UP`, `DOWN`, `IDLE`), and a sorted `TreeSet` of destination floors.
- **Dispatching Algorithm (FSCAN)**:
  - When a user presses a button, the `ElevatorController` analyzes all elevator distances and trajectories.
  - It assigns the call to the elevator that is moving in the same direction and has already committed to passing the caller's floor, minimizing wait times.

### Q8: Design a highly flexible, pluggable Rules Engine at the class level.
- **Class Model**:
  - `Rule` interface: Declares `boolean evaluate(Context)` and `void execute(Context)`.
  - `RuleEngine`: Holds a list of `Rule` objects sorted by priority.
  - `Context`: A map-like container object containing input state variables.
- **Execution**: The engine loops through sorted rules, evaluating predicates and executing matched behaviors dynamically.

### Q9: What are the key class relationships and invariants of a Parking Lot system?
- **Classes**: `ParkingLot` (Singleton), `Floor`, `Slot` (typed: `Compact`, `Large`, `EV`), `Vehicle` (abstract), `Ticket`, and `PaymentStation`.
- **Invariants**:
  - A slot can accommodate exactly one vehicle at a time.
  - A slot type must match or exceed the vehicle size.
  - Ticket issuance increments active floor occupancies; payment settlement releases the slot and decrements occupancy.

### Q10: How do you design a distributed ID Generator (Snowflake) at the thread level?
- **ID Bit Distribution**: 64-bit ID split into: 1-bit unused, 41-bit timestamp, 10-bit generator/machine ID, 12-bit sequence number.
- **Thread Safety**: Uses a `synchronized` method or `ReentrantLock` to protect the sequence count. If multiple ID requests arrive in the exact same millisecond, the sequence increments. If sequence overflows (exceeds 4095), the thread blocks until the next millisecond.

### Q11: How would you design a Chess Game at the class level?
- **Classes**: `Board` (8x8 grid of `Spot` objects), `Spot` (holds coordinates and active `Piece`), `Piece` (abstract, defines `isValidMove()`), `Move` (source/destination spots, player, captured piece), `Player`, and `Game` (coordinates turns and tracks state like `ACTIVE`, `BLACK_WIN`, `STALEMATE`).
- **Invariants**: Validates turn orders, verifies move legality per piece class, and dry-runs moves to ensure the active player is not left in check.

### Q12: How do you design a Food Delivery System (e.g., DoorDash) class structure?
- **Classes**: `User`, `Restaurant`, `MenuItem`, `Order` (holding order items, delivery address, status), `DeliveryPartner`, and `MatchingService`.
- **Key Workflows**:
  - `Order` creation notifies the `Restaurant` to prepare food.
  - `MatchingService` coordinates GPS locations and broadcasts active deliveries to the closest available `DeliveryPartner` using a geospatial index (e.g., H3/S2).

### Q13: Design a Splitwise-like bill-splitting application.
- **Classes**: `User`, `Group`, `Expense` (total amount, paidBy user, split list), `Split` (abstract: `EqualSplit`, `ExactSplit`, `PercentageSplit`), and `BalanceTracker`.
- **Simplification Engine**: Uses a directed debt graph. Resolves total balances into a net debtor/creditor list and runs a greedy two-pointer algorithm to minimize transaction count.

### Q14: Design a task scheduler (like Cron) at the thread/class level.
- **Data Structures**: A thread-safe `PriorityBlockingQueue` ordered by `nextExecutionTime`.
- **Execution Flow**: A background loop thread calls `queue.peek()`. If `currentTime >= nextExecutionTime`, it polls the task and submits it to a thread pool. If not, it sleeps for the time difference using a condition variable to support interrupt-driven task additions.

### Q15: Design a low-level logging library (like Log4j) supporting asynchronous execution.
- **Classes**: `Logger` (client interface), `Appender` (destinations: `ConsoleAppender`, `FileAppender`), `Layout` (`PatternLayout`), and `LogEvent`.
- **Asynchronous Mechanism**: The `Logger` submits `LogEvent` items to a high-speed lock-free ring buffer (e.g., LMAX Disruptor). A background consumer thread drains the buffer, formatting and writing log data to destination appenders asynchronously.

### Q16: How do you design a Vending Machine using the State Pattern?
- **States**: `IdleState`, `HasMoneyState`, `DispensingState`, `OutOfStockState`.
- **Transitions**:
  - `insertCoin()` in `IdleState` shifts context to `HasMoneyState`.
  - `selectProduct()` verify price/stock, shifting to `DispensingState`.
  - `dispense()` releases item, returns change, and shifts back to `Idle` (or `OutOfStock`).

### Q17: Design a ride-sharing system (e.g., Uber/Lyft) LLD matching engine.
- **Classes**: `Rider`, `Driver`, `Trip`, `Location` (lat, lon), and `MatchingEngine`.
- **Geospatial Processing**: Uses spatial indexing (such as Geohash or Uber H3) to partition the coordinate plane. The matching engine queries the index for idle driver IDs in matching grid cells, sorting by driving distance.

### Q18: Design a Distributed Saga Coordinator at the class level.
- **Classes**: `SagaDefinition` (holds steps), `SagaStep` (defines `execute()` and `compensate()`), and `SagaCoordinator`.
- **Execution**: The coordinator iterates through steps executing their main actions. If any step fails, the coordinator stops progress, reverses direction, and executes `compensate()` on all previously completed steps to restore system consistency.

### Q19: Design a pluggable E-Commerce Search and Filter system.
- **Classes**: `Product`, `SearchService`, and `Filter` interface (declares `boolean matches(Product)`).
- **Pluggability**: Implements the **Specification Pattern**. Combines filters (e.g., `PriceFilter`, `CategoryFilter`, `RatingFilter`) dynamically using composite specifications (`AndFilter`, `OrFilter`, `NotFilter`) without changing search algorithms.

### Q20: Design an event broker client library (like Kafka-like consumers).
- **Classes**: `KafkaConsumer`, `PartitionCoordinator`, `OffsetTracker`, and `Fetcher`.
- **Coordination**: Consumer fetches batches of records, executing callback loops. `OffsetTracker` records processed index numbers, committing them to the broker synchronously or asynchronously.

### Q21: Design a Flight Reservation System class model.
- **Classes**: `Flight`, `FlightInstance` (specific date), `Passenger`, `Reservation`, `Seat` (types, assignment status), and `Payment`.
- **Seat Booking Lock**: Applies a temporary TTL reservation lock to a seat. If payment succeeds within 10 minutes, reservation shifts to `CONFIRMED`; otherwise, lock is released.

### Q22: Design an online Book Reader (Kindle) class structure.
- **Classes**: `Library` (catalog of books), `Book`, `User`, `UserBookTracker` (current page, bookmark coordinates, last read timestamp), and `ReaderView` (formats content layout based on user display preferences).

### Q23: Design a Car Rental System LLD.
- **Classes**: `RentalStore`, `Vehicle` (Car, SUV, Truck), `VehicleInventory`, `Reservation`, `Bill`, and `Payment`.
- **Lifecycle**: `Vehicle` tracks states (`AVAILABLE`, `RENTED`, `MAINTENANCE`). Billing uses strategy-based calculations reflecting vehicle types and duration packages.

### Q24: Explain the transactional Outbox Pattern at the class level.
- **Concept**: Guarantees atomic updates to a local database and publishing to an external message broker.
- **Implementation**: The business transaction writes both the entity update and a message record into an `OutboxTable` within the same database transaction. A separate, background `OutboxPublisher` class polls the `OutboxTable` continuously, publishes the messages, and marks them as sent.

### Q25: Explain the LLD of a Workflow Engine.
- **Classes**: `Workflow`, `Activity` (steps), `WorkflowInstance`, and `Engine`.
- **Execution**: Activities are linked via directed graphs. The engine parses the active state, evaluates transitions, executes concurrent or sequential activities, and persists intermediate states to enable safe pauses/resumes.

### Q26: Design the CQRS Pattern class structure.
- **Split**: Separates write operations (Commands) from read operations (Queries).
- **Classes**:
  - **Command Side**: `CommandHandler` takes `Command` objects, executing business logic and updating state.
  - **Query Side**: `QueryHandler` takes `Query` objects, directly retrieving read-optimized views (DTOs) from a read-replica.

### Q27: Design an Asynchronous Notification Dispatch System.
- **Classes**: `NotificationRequest` (user, channel, payload), `Dispatcher`, `NotificationChannel` (implementations: `EmailChannel`, `SmsChannel`), and `DeadLetterQueue`.
- **Resilience**: The dispatcher submits requests to an internal queue. Handlers process deliveries. If a channel fails, a retry policy (exponential backoff) is triggered. Exhausted retries dump requests into a `DeadLetterQueue`.

### Q28: Design a Stack-Overflow-like Q&A System at the class level.
- **Classes**: `Question`, `Answer`, `Comment`, `User`, `Tag`, `Vote` (Upvote, Downvote), and `ReputationTracker`.
- **Associations**: `Question` holds a list of `Answer` objects and `Tag` tags. `ReputationTracker` monitors vote logs, adjusting user reputation score invariants accordingly.

### Q29: Design a Meeting Scheduler (Google Calendar) LLD.
- **Classes**: `User`, `Meeting`, `Calendar`, `Interval` (start, end time), and `Scheduler`.
- **Double Booking Avoidance**: `Scheduler` queries individual user calendars for interval overlaps. If all required attendees are free, the meeting reservation completes; otherwise, an scheduling conflict error is returned.

### Q30: Design an Electronic Voting Machine (EVM) LLD.
- **Classes**: `BallotUnit` (receives input), `ControlUnit` (authorizes votes), `Candidate`, `VoteStore`, and `AuditTrailPrinter`.
- **Invariants**: Ballot remains locked until authorised by the poll officer's ControlUnit. Each click registers exactly one vote, flashes a confirmation LED, and locks itself again immediately.

### Q31: Design Google Docs Operational Transformation (OT) class structure.
- **Classes**: `Document`, `Operation` (types: `INSERT`, `DELETE`, `RETAIN`), and `OTEngine`.
- **Mechanism**: When two client operations collide, the `OTEngine` transforms operation parameters dynamically (`transform(Op1, Op2)`) so both client copies converge onto the identical visual state.

### Q32: Design a URL Shortener (TinyURL) Client-Side LLD.
- **Classes**: `UrlEncoder` (Base62 hashing), `UrlRepository`, `CacheManager`, and `RedirectController`.
- **Flow**: `RedirectController` intercepts short URL requests, queries the `CacheManager` first (fast path), falling back to the database, and performs an HTTP 301 Permanent Redirect on cache hits.

### Q33: Design an Online Auction System (eBay) LLD.
- **Classes**: `Auction`, `Item`, `Seller`, `Bidder`, `Bid` (amount, timestamp), and `BiddingEngine`.
- **Concurrency**: Employs optimistic locking on the auction's `currentMaxBid` to reject outdated incoming bid submissions instantly.

### Q34: Design a Social Network Feed Generator LLD.
- **Classes**: `User`, `Post`, `FollowRelationship`, and `FeedService`.
- **Feed Types**:
  - **Pull Model**: Feed generated on-the-fly when user logs in by querying posts from all followed users.
  - **Push Model**: Posting a message actively writes it into the pre-allocated feed caches (Redis) of all followers (fan-out).

### Q35: Design a Library Management System LLD.
- **Classes**: `Book`, `BookLendingInstance`, `Member`, `Librarian`, `FineCalculator`, and `BookReservation`.
- **Invariants**: Checks active loan limits of members before lending. Calculates overdue fines during book returns using an active strategy pattern.

### Q36: Design a Web Crawler class structure.
- **Classes**: `UrlQueue` (FIFO queue with priority scoring), `Fetcher` (downloads page contents), `Parser` (extracts links), `UrlFilter` (removes duplicates), and `StorageEngine`.
- **Mechanism**: Multiple worker threads poll the `UrlQueue`, fetch, parse links, filter them against a Bloom Filter, and push new unique links back to the queue.

### Q37: Design an ATM Machine LLD.
- **Classes**: `Atm` (Singleton), `CardReader`, `Screen`, `CashDispenser`, `Keypad`, `Transaction` (Withdrawal, Deposit, BalanceInquiry), and `BankService`.
- **Flow**: Card validation → PIN entry → Bank verification → Cash release (updating dispenser physical counts) → Transaction logging.

### Q38: Design an Instant Messaging System (WhatsApp) Client LLD.
- **Classes**: `Message` (payload, metadata, status: `SENT`, `DELIVERED`, `READ`), `User`, `Chat`, `ConnectionManager`, and `LocalDatabase`.
- **Flow**: Local writes first (offline support) → dynamic queue push → background syncing threads.

### Q39: Design a Stock Brokerage Matching Engine LLD.
- **Classes**: `Order` (types: `LIMIT`, `MARKET`; actions: `BUY`, `SELL`), `OrderBook`, `MatchingEngine`, and `Trade`.
- **Matching Mechanism**: `OrderBook` maintains two priority queues: buyers sorted descending by price, and sellers sorted ascending. The engine continuously matches top bids when price criteria cross.

### Q40: Design Google Drive Client LLD.
- **Classes**: `FileManager`, `FileMetadata`, `ChunkProcessor` (splits files into block chunks), `Hasher` (SHA-256 deduplication), and `SyncService` (background upload daemon).

### Q41: Explain multi-threaded cache invalidation coherence.
- **Coherence**: Uses a central coordinator implementing the **Directory Protocol** or **Bus Snooping**. When a write occurs on thread local caches, the controller broadcasts invalidation messages to all other active caches instantly.

### Q42: What is Zero-Copy in I/O Client LLD?
- **Zero-Copy**: Bypasses copying data between kernel space and user space buffers during I/O operations. Uses direct memory mapping (`transferTo()` in Java NIO) to move files directly from the disk cache to the network socket buffer.

### Q43: Design a Security Protection Proxy with Cryptographic verification.
- **Classes**: `SecureServiceProxy` wrapping `RealService`.
- **Mechanism**: The proxy intercepts method requests, validates digital signatures or JWT tokens inside the headers, and only delegates processing to the `RealService` if the security check is cleared.

---

### Q44: Implement a Thread-Safe, High-Performance LRU Cache
```java
import java.util.*;
import java.util.concurrent.locks.*;

public class LRUCache<K, V> {
    private class Node {
        K key; V val; Node prev, next;
        Node(K k, V v) { this.key = k; this.val = v; }
    }

    private final int capacity;
    private final Map<K, Node> map = new HashMap<>();
    private Node head, tail;
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();

    public LRUCache(int capacity) { this.capacity = capacity; }

    public V get(K key) {
        rwLock.writeLock().lock();
        try {
            if (!map.containsKey(key)) return null;
            Node node = map.get(key);
            remove(node);
            addToHead(node);
            return node.val;
        } finally { rwLock.writeLock().unlock(); }
    }

    public void put(K key, V val) {
        rwLock.writeLock().lock();
        try {
            if (map.containsKey(key)) {
                Node node = map.get(key);
                node.val = val;
                remove(node);
                addToHead(node);
            } else {
                if (map.size() >= capacity) {
                    map.remove(tail.key);
                    remove(tail);
                }
                Node newNode = new Node(key, val);
                map.put(key, newNode);
                addToHead(newNode);
            }
        } finally { rwLock.writeLock().unlock(); }
    }

    private void remove(Node n) {
        if (n.prev != null) n.prev.next = n.next; else head = n.next;
        if (n.next != null) n.next.prev = n.prev; else tail = n.prev;
    }
    private void addToHead(Node n) {
        n.next = head; n.prev = null;
        if (head != null) head.prev = n;
        head = n;
        if (tail == null) tail = head;
    }
}
```

### Q45: Implement an API Rate Limiter using Token Bucket Algorithm
```java
public class TokenBucketLimiter {
    private final long capacity;
    private final double refillRatePerMs;
    private double tokens;
    private long lastRefillTimestamp;

    public TokenBucketLimiter(long capacity, double tokensPerSec) {
        this.capacity = capacity;
        this.refillRatePerMs = tokensPerSec / 1000.0;
        this.tokens = capacity;
        this.lastRefillTimestamp = System.currentTimeMillis();
    }

    public synchronized boolean allowRequest() {
        refill();
        if (tokens >= 1.0) {
            tokens -= 1.0;
            return true;
        }
        return false;
    }

    private void refill() {
        long now = System.currentTimeMillis();
        double tokensToAdd = (now - lastRefillTimestamp) * refillRatePerMs;
        tokens = Math.min(capacity, tokens + tokensToAdd);
        lastRefillTimestamp = now;
    }
}
```

### Q46: Implement a Custom Thread Pool from Scratch
```java
import java.util.concurrent.*;

public class CustomThreadPool {
    private final BlockingQueue<Runnable> taskQueue;
    private final WorkerThread[] workers;

    public CustomThreadPool(int threadCount, int maxTasks) {
        taskQueue = new LinkedBlockingQueue<>(maxTasks);
        workers = new WorkerThread[threadCount];
        for (int i = 0; i < threadCount; i++) {
            workers[i] = new WorkerThread();
            workers[i].start();
        }
    }

    public void execute(Runnable task) throws InterruptedException { taskQueue.put(task); }

    private class WorkerThread extends Thread {
        public void run() {
            while (true) {
                try {
                    Runnable task = taskQueue.take();
                    task.run();
                } catch (InterruptedException e) { break; }
            }
        }
    }
}
```

### Q47: Implement a concurrent Connection Pool
```java
import java.util.concurrent.*;

public class ConnectionPool {
    private final BlockingQueue<Connection> pool;
    private final int maxSize;
    private int createdCount = 0;

    public ConnectionPool(int maxSize) {
        this.maxSize = maxSize;
        this.pool = new LinkedBlockingQueue<>(maxSize);
    }

    public Connection acquire(long timeoutMs) throws Exception {
        Connection conn = pool.poll(timeoutMs, TimeUnit.MILLISECONDS);
        if (conn == null) {
            synchronized (this) {
                if (createdCount < maxSize) {
                    conn = new Connection();
                    createdCount++;
                    return conn;
                }
            }
            throw new TimeoutException("Connection acquisition timed out.");
        }
        return conn;
    }

    public void release(Connection conn) {
        if (conn != null) pool.offer(conn);
    }

    public static class Connection { /* Mock database connection methods */ }
}
```

### Q48: Implement an Elevator Dispatcher Coordinator
```java
import java.util.*;

enum Direction { UP, DOWN, IDLE }

class Elevator {
    int id; int currentFloor = 0;
    Direction dir = Direction.IDLE;
    final TreeSet<Integer> destinations = new TreeSet<>();
    public Elevator(int id) { this.id = id; }
}

public class ElevatorDispatcher {
    private final List<Elevator> elevators = new ArrayList<>();

    public ElevatorDispatcher(int elevatorCount) {
        for (int i = 0; i < elevatorCount; i++) { elevators.add(new Elevator(i)); }
    }

    public Elevator dispatchRequest(int floor, Direction direction) {
        Elevator bestElevator = null;
        int minDistance = Integer.MAX_VALUE;

        for (Elevator e : elevators) {
            int distance = Math.abs(e.currentFloor - floor);
            boolean onTheWay = (e.dir == Direction.UP && floor >= e.currentFloor && direction == Direction.UP) ||
                               (e.dir == Direction.DOWN && floor <= e.currentFloor && direction == Direction.DOWN) ||
                               e.dir == Direction.IDLE;

            if (onTheWay && distance < minDistance) {
                minDistance = distance;
                bestElevator = e;
            }
        }

        if (bestElevator == null) { bestElevator = elevators.get(0); } // Fallback
        bestElevator.destinations.add(floor);
        bestElevator.dir = (bestElevator.currentFloor < floor) ? Direction.UP : Direction.DOWN;
        return bestElevator;
    }
}
```

### Q49: Implement a Parking Lot Billing & Slot Allocation Engine
```java
import java.util.*;

enum VehicleSize { COMPACT, LARGE }

class Slot {
    int id; VehicleSize size; boolean isOccupied = false;
    Slot(int id, VehicleSize s) { this.id = id; this.size = s; }
}

public class ParkingEngine {
    private final List<Slot> slots = new ArrayList<>();

    public synchronized Slot allocateSlot(VehicleSize size) {
        for (Slot s : slots) {
            if (!s.isOccupied && s.size.ordinal() >= size.ordinal()) {
                s.isOccupied = true;
                return s;
            }
        }
        return null; // No available slot matching size
    }

    public synchronized void releaseSlot(Slot s) { s.isOccupied = false; }

    public double calculateFee(long hours) {
        return Math.max(2.0, hours * 3.0); // Flat-rate policy
    }
}
```

### Q50: Implement a Thread-Safe Event Broker (Publisher-Subscriber)
```java
import java.util.*;
import java.util.concurrent.*;

public class EventBroker {
    private final Map<String, List<BlockingQueue<String>>> topicConsumers = new ConcurrentHashMap<>();

    public void createTopic(String topic) {
        topicConsumers.putIfAbsent(topic, new CopyOnWriteArrayList<>());
    }

    public void subscribe(String topic, BlockingQueue<String> consumerQueue) {
        if (topicConsumers.containsKey(topic)) {
            topicConsumers.get(topic).add(consumerQueue);
        }
    }

    public void publish(String topic, String message) {
        if (topicConsumers.containsKey(topic)) {
            for (BlockingQueue<String> queue : topicConsumers.get(topic)) {
                queue.offer(message); // Concurrent safe non-blocking publish
            }
        }
    }
}
```
