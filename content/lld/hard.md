# Low-Level Design (LLD) - Machine Coding & Class System Problems (Part 2)

Welcome to the Low-Level Design (LLD) Machine Coding Problems Guide (Part 2). This codex covers detailed object-oriented design solutions, design pattern applications, class hierarchies, and canonical code links for top machine coding interview problems (Problems 21 to 40).

---

## Theory Questions & Answers

### Q21: Design a Rate Limiter (Token Bucket / Leaky Bucket LLD)

**Answer:**
Design an in-memory, thread-safe rate limiter supporting multiple rate limiting algorithms per user or API client.

*   **Solution Link:** [https://blog.algomaster.io/p/rate-limiting-algorithms-explained-with-code](https://blog.algomaster.io/p/rate-limiting-algorithms-explained-with-code)
*   **Key Design Patterns:** Strategy Pattern (`TokenBucketStrategy`, `LeakyBucketStrategy`, `SlidingWindowCounterStrategy`), Factory Pattern (RateLimiterFactory).
*   **Core Classes:** `RateLimiter`, `RateLimitConfig` (`capacity`, `refillRate`, `windowSeconds`), `TokenBucket`, `ClientRequest`.

---

### Q22: Design an LRU (Least Recently Used) Cache

**Answer:**
Design an in-memory key-value cache supporting $O(1)$ time complexity for both `get(key)` and `put(key, value)` with automatic eviction of the least recently used element upon reaching capacity.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/lru-cache.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/lru-cache.md)
*   **Data Structures Used:** Hash Map (for $O(1)$ key lookup) + Custom Doubly Linked List (for $O(1)$ node removal and head insertion).
*   **Core Classes:** `LRUCache`, `Node` (`key`, `val`, `prev`, `next`), `DoublyLinkedList` (`addToHead()`, `removeNode()`, `moveToHead()`, `removeTail()`).

---

### Q23: Design a Task Management System (Trello / Jira LLD)

**Answer:**
Design a project collaboration board supporting workspaces, boards, customizable columns/lists, task cards with assignees, labels, and activity history.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/task-management-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/task-management-system.md)
*   **Key Design Patterns:** Observer Pattern (Notify assignees on task changes), State Pattern (TaskStatus: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), Composite Pattern.
*   **Core Classes:** `User`, `Workspace`, `Board`, `TaskList` / `Column`, `TaskCard`, `Comment`, `ActivityLog`.

---

### Q24: Design a Course Registration System

**Answer:**
Design a university portal managing courses, professors, prerequisites validation, enrollment caps, student waitlists, and GPA grade calculation.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/course-registration-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/course-registration-system.md)
*   **Key Design Patterns:** Observer Pattern (Waitlist notifications), Strategy Pattern (PrerequisiteVerificationStrategy), Singleton Pattern.
*   **Core Classes:** `Course`, `CourseSection`, `Student`, `Professor`, `Registration`, `WaitlistQueue`, `GradeRecord`.

---

### Q25: Design a Traffic Signal Control System

**Answer:**
Design an automated four-way intersection controller supporting emergency vehicle preemption, dynamic sensor-based green duration, and pedestrian crossing requests.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/traffic-signal.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/traffic-signal.md)
*   **Key Design Patterns:** State Pattern (SignalState: `RED`, `YELLOW`, `GREEN`), Observer Pattern (Emergency vehicle sensors), Strategy Pattern (CycleTimingStrategy).
*   **Core Classes:** `TrafficController`, `Intersection`, `TrafficLight`, `Road`, `VehicleSensor`, `PedestrianButton`.

---

### Q26: Design a Chess Game

**Answer:**
Design a complete two-player turn-based Chess engine enforcing piece-specific movement rules, check/checkmate detection, castling, en passant, and game clocks.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/chess-game.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/chess-game.md)
*   **Key Design Patterns:** Factory Pattern (PieceFactory), Command Pattern (Move execution & history undo), Strategy Pattern (ValidationStrategy per piece).
*   **Core Classes:** `ChessGame`, `Board`, `Spot` (`x`, `y`), `Piece` (subclasses: `King`, `Queen`, `Rook`, `Bishop`, `Knight`, `Pawn`), `Move`, `Player` (`White`, `Black`).

---

### Q27: Design Tic Tac Toe Game

**Answer:**
Design an $N \times N$ Tic Tac Toe board game supporting $M$ players with customizable winning sequence lengths and $O(1)$ win checking per move.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/tic-tac-toe.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/tic-tac-toe.md)
*   **Key Design Patterns:** Strategy Pattern (WinningStrategy), Factory Pattern.
*   **Core Classes:** `TicTacToeGame`, `Board`, `Player`, `Piece` (`PieceX`, `PieceO`).
*   **Optimization:** Maintain row, column, and diagonal counters to check if a player has won in $O(1)$ time rather than scanning the $N \times N$ board on each turn.

---

### Q28: Design Snake and Ladder Game

**Answer:**
Design a multiplayer Snake and Ladder board game supporting arbitrary board sizes, customized snakes/ladders positions, and single/multiple dice configurations.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/snake-and-ladder.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/snake-and-ladder.md)
*   **Key Design Patterns:** Strategy Pattern (DiceRollingStrategy), Observer Pattern.
*   **Core Classes:** `SnakeAndLadderGame`, `Board`, `Cell`, `Jumper` (`Snake`, `Ladder`), `Dice`, `Player`.

---

### Q29: Design a Social Network like Facebook (Class Level)

**Answer:**
Design the object model for a social graph supporting user profiles, bidirectional friendships, follow graphs, post feeds, likes, and privacy filters.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/social-networking-service.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/social-networking-service.md)
*   **Key Design Patterns:** Observer Pattern (Feed distribution), Strategy Pattern (PrivacyStrategy: `PUBLIC`, `FRIENDS_ONLY`), Composite Pattern.
*   **Core Classes:** `User`, `Profile`, `FriendRequest`, `Post`, `Comment`, `Reaction`, `FeedManager`.

---

### Q30: Design LinkedIn (Class Level)

**Answer:**
Design professional networking software managing connections (1st, 2nd, 3rd degree), job postings, job applications, company pages, and skill endorsements.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/linkedin.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/linkedin.md)
*   **Key Design Patterns:** Strategy Pattern (RecommendationAlgorithm), Observer Pattern (Job notifications), Factory Pattern.
*   **Core Classes:** `User`, `Profile`, `Experience`, `Skill`, `JobPosting`, `JobApplication`, `Connection`.

---

### Q31: Design CricInfo (Live Cricket Scoreboard LLD)

**Answer:**
Design an object model representing live cricket matches across formats (T20, ODI, Test) tracking ball-by-ball commentary, player statistics, and run rate calculations.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/cricinfo.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/cricinfo.md)
*   **Key Design Patterns:** Observer Pattern (Scoreboard subscribers), Strategy Pattern (MatchFormat rules), State Pattern (MatchStatus: `LIVE`, `INNINGS_BREAK`, `COMPLETED`).
*   **Core Classes:** `Match`, `Innings`, `Over`, `Ball`, `Player`, `Team`, `ScoreCard`, `Commentary`.

---

### Q32: Design a Pub-Sub System (Kafka / RabbitMQ in-memory LLD)

**Answer:**
Design an in-memory, thread-safe Publish-Subscribe messaging broker supporting topics, partitioned message queues, subscriber consumer groups, and offset management.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/pub-sub-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/pub-sub-system.md)
*   **Key Design Patterns:** Observer Pattern, Producer-Consumer Pattern with blocking queues.
*   **Core Classes:** `PubSubSystem`, `Topic`, `TopicSubscriber`, `Message`, `Producer`, `Consumer`, `OffsetManager`.

---

### Q33: Design an Online Shopping System like Amazon (Class Level)

**Answer:**
Design an e-commerce platform managing product inventories, search catalogs, shopping carts, discount coupons, orders, and payment integrations.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/online-shopping-service.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/online-shopping-service.md)
*   **Key Design Patterns:** Builder Pattern (Order construction), Strategy Pattern (DiscountCouponStrategy, PaymentStrategy), Observer Pattern.
*   **Core Classes:** `Product`, `ProductCatalog`, `Cart`, `CartItem`, `Order`, `Payment`, `Shipment`.

---

### Q34: Design a Music Streaming Service like Spotify (Class Level)

**Answer:**
Design the object model for a digital audio platform managing artists, albums, songs, user playlists, playback queues, and offline downloads.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/music-streaming-service.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/music-streaming-service.md)
*   **Key Design Patterns:** Iterator Pattern (Playlist traversal), Strategy Pattern (RecommendationStrategy), State Pattern (PlaybackState: `PLAYING`, `PAUSED`, `STOPPED`).
*   **Core Classes:** `Song`, `Artist`, `Album`, `Playlist`, `User`, `PlaybackQueue`, `AudioPlayer`.

---

### Q35: Design a Meeting / Conference Room Scheduler

**Answer:**
Design a calendar and room booking engine supporting time-slot reservation, conflict detection, recurring meetings, and room equipment filtering.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/hotel-management-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/hotel-management-system.md) *(Adapts the room booking and interval overlap check pattern).*
*   **Key Design Patterns:** Strategy Pattern (ConflictCheckStrategy), Observer Pattern (Meeting invites), Interval Tree / Range Set data structures.
*   **Core Classes:** `MeetingRoom`, `Meeting`, `Interval` (`startTime`, `endTime`), `User`, `SchedulerManager`.

---

### Q36: Design a URL Shortener (Class Level: ID Generation + Repository Pattern)

**Answer:**
Design the class-level architecture for a URL shortening engine supporting Base62 encoding, custom aliases, collision resolution, and persistent repository abstraction.

*   **Solution Link:** [https://blog.algomaster.io/p/design-a-url-shortener](https://blog.algomaster.io/p/design-a-url-shortener)
*   **Key Design Patterns:** Strategy Pattern (`Base62Strategy`, `MD5HashStrategy`), Repository Pattern (`IUrlRepository`), Singleton Pattern (`IdGenerator`).
*   **Core Classes:** `UrlShortenerService`, `UrlMapping`, `IdGenerator`, `IUrlRepository`, `AnalyticsTracker`.

---

### Q37: Design a File System / Directory Structure (Composite Pattern)

**Answer:**
Design an in-memory hierarchical file system supporting files, directories, nested structures, permissions, and recursive path operations (`mkdir`, `ls`, `cat`, `rm`).

*   **Solution Link:** [https://algomaster.io/learn/lld/composite](https://algomaster.io/learn/lld/composite) *(Composite pattern is the canonical approach for file and folder trees).*
*   **Key Design Patterns:** Composite Pattern (`FileSystemNode` base component $\to$ Leaf: `File`, Composite: `Directory`).
*   **Core Classes:** `FileSystemNode` (`name`, `size`, `permissions`), `File` (`content`), `Directory` (`List<FileSystemNode> children`).

---

### Q38: Design a Notification / Alert System (Observer Pattern)

**Answer:**
Design an event-driven notification hub supporting multi-channel delivery (Email, SMS, Push, Slack), user preference filtering, and rate limiting.

*   **Solution Link:** [https://algomaster.io/learn/lld/observer](https://algomaster.io/learn/lld/observer)
*   **Key Design Patterns:** Observer Pattern, Strategy Pattern (ChannelDeliveryStrategy), Factory Pattern (NotificationFactory), Decorator Pattern (Template formatting).
*   **Core Classes:** `NotificationService`, `NotificationMessage`, `NotificationChannel` (`EmailChannel`, `SMSChannel`, `PushChannel`), `UserPreference`.

---

### Q39: Design a Deck of Cards / Generic Card Game Engine

**Answer:**
Design an extensible object model for playing card games (Blackjack, Poker, Solitaire) with deck shuffling, dealing mechanics, and hand evaluation.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems)
*   **Key Design Patterns:** Strategy Pattern (HandEvaluationStrategy), Template Method Pattern (Game loop: `deal()`, `playTurn()`, `determineWinner()`).
*   **Core Classes:** `Card`, `Suit` (`HEARTS`, `DIAMONDS`, `CLUBS`, `SPADES`), `Rank`, `Deck`, `Hand`, `CardGame`.

---

### Q40: Design a Distributed Logging System (Machine Coding)

**Answer:**
Design a distributed logging daemon running on client hosts that batches, buffers, compresses, and forwards log events to a central ingest server.

*   **Solution Link:** [https://github.com/prashantRmishra/MachineCoding](https://github.com/prashantRmishra/MachineCoding) *(See Distributed Logging System module).*
*   **Key Design Patterns:** Producer-Consumer Pattern with RingBuffer, Strategy Pattern (BatchingStrategy), Chain of Responsibility (Log filters).
*   **Core Classes:** `DistributedLogger`, `LogBuffer`, `LogBatch`, `NetworkTransporter`, `SinkConfiguration`.

---

### Complete Machine Coding Reference Index

Bookmark the comprehensive community repository of solved Low-Level Design problems:
*   [Awesome Low-Level Design GitHub Repository](https://github.com/ashishps1/awesome-low-level-design)
