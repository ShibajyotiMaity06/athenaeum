# Low-Level Design (LLD) - Machine Coding & Class System Problems (Part 1)

Welcome to the Low-Level Design (LLD) Machine Coding Problems Guide (Part 1). This codex covers detailed object-oriented design solutions, design pattern applications, class hierarchies, and canonical code links for top machine coding interview problems (Problems 1 to 20).

---

## Theory Questions & Answers

### Q1: Design a Parking Lot System

**Answer:**
Design a multi-floor parking lot system supporting different vehicle types, automated ticket issuance, spot allocation strategies, and payment calculation.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/parking-lot.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/parking-lot.md)
*   **Key Design Patterns:** Singleton (ParkingLot instance), Strategy Pattern (ParkingSpotAssignmentStrategy, FeeCalculationStrategy), Factory Pattern (VehicleFactory).
*   **Core Classes:** `ParkingLot`, `ParkingFloor`, `ParkingSpot` (subclasses: `CompactSpot`, `LargeSpot`, `HandicappedSpot`), `Vehicle` (subclasses: `Car`, `Truck`, `Motorcycle`), `Ticket`, `Payment`.
*   **Concurrency Handling:** Thread-safe synchronized slot booking using atomic compare-and-swap or reentrant locks to prevent double-booking the same spot.

---

### Q2: Design an Elevator System

**Answer:**
Design an elevator controller managing multiple elevator cars across a multi-story building, processing internal destination presses and external floor calls with optimal scheduling.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/elevator-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/elevator-system.md)
*   **Key Design Patterns:** State Pattern (ElevatorState: `MOVING_UP`, `MOVING_DOWN`, `IDLE`), Strategy Pattern (LOOK/SCAN Dispatcher Algorithm), Observer Pattern (Floor buttons notify Dispatcher).
*   **Core Classes:** `ElevatorController`, `ElevatorCar`, `Door`, `InternalButtonPanel`, `ExternalCallButton`, `Request` (`sourceFloor`, `destinationFloor`, `direction`).

---

### Q3: Design a Vending Machine

**Answer:**
Design a state-driven vending machine supporting item selection, cash/coin insertion, change return, and out-of-stock management.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/vending-machine.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/vending-machine.md)
*   **Key Design Patterns:** State Pattern (`IdleState`, `HasMoneyState`, `DispensingState`, `SoldOutState`), Inventory Management Pattern.
*   **Core Classes:** `VendingMachine`, `State` interface, `Inventory`, `Item`, `Coin`/`Note`, `Dispenser`.

---

### Q4: Design a Coffee Vending Machine

**Answer:**
Design an automated coffee dispenser supporting customizable recipes, dynamic toppings/condiments, and ingredient inventory tracking.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/coffee-vending-machine.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/coffee-vending-machine.md)
*   **Key Design Patterns:** Decorator Pattern (Base Coffee decorated with `MilkDecorator`, `SugarDecorator`, `CaramelDecorator`), Factory Pattern (CoffeeFactory), State Pattern.
*   **Core Classes:** `Coffee` interface, `Espresso`, `Latte`, `Cappuccino`, `CondimentDecorator`, `IngredientInventory`, `PaymentProcessor`.

---

### Q5: Design an ATM Machine

**Answer:**
Design an Automated Teller Machine (ATM) supporting card validation, PIN verification, cash withdrawal with currency denomination dispensing, balance inquiries, and transaction rollback.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/atm.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/atm.md)
*   **Key Design Patterns:** State Pattern (`IdleState`, `CardInsertedState`, `PinEnteredState`, `CashDispensedState`), Chain of Responsibility Pattern (Cash Dispenser: 2000 $\to$ 500 $\to$ 100 notes).
*   **Core Classes:** `ATM`, `CardReader`, `CashDispenser`, `BankService`, `Account`, `Transaction`.

---

### Q6: Design a Library Management System

**Answer:**
Design a catalog and lending management system supporting book borrowing, fine calculation, reservation queues, and barcode-based book identification.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/library-management-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/library-management-system.md)
*   **Key Design Patterns:** Strategy Pattern (FineCalculationStrategy), Observer Pattern (BookAvailableNotification), Factory Pattern.
*   **Core Classes:** `Library`, `BookItem`, `BookLending`, `Account` (`Member`, `Librarian`), `Fine`, `Catalog` (search by Title, Author, Category).

---

### Q7: Design Stack Overflow

**Answer:**
Design a collaborative developer Q&A platform with questions, answers, comments, tag indexing, reputation score management, and upvoting/downvoting mechanics.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/stack-overflow.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/stack-overflow.md)
*   **Key Design Patterns:** Observer Pattern (Reputation updates), Composite Pattern (Post tree with Comments), Strategy Pattern (Search & Ranking).
*   **Core Classes:** `User`, `Question`, `Answer`, `Comment`, `Vote` (`UPVOTE`, `DOWNVOTE`), `Tag`, `Badge`.

---

### Q8: Design a Movie Ticket Booking System (BookMyShow LLD)

**Answer:**
Design a theater seat reservation system supporting multiple cinemas, auditoriums, showtimes, dynamic seat tier pricing, and temporary concurrency lock holds during checkout.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/movie-ticket-booking-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/movie-ticket-booking-system.md)
*   **Key Design Patterns:** Singleton (BookingManager), State Pattern (SeatStatus: `AVAILABLE`, `LOCKED`, `BOOKED`), Strategy Pattern (SeatLockProvider).
*   **Core Classes:** `Cinema`, `Auditorium`, `Movie`, `Show`, `Seat` (`Regular`, `VIP`), `Booking`, `Payment`.

---

### Q9: Design a Concert Ticket Booking System

**Answer:**
Design a high-concurrency ticket booking engine for massive stadium concerts with zone allocation, queuing mechanisms, and fraud prevention.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/concert-ticket-booking-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/concert-ticket-booking-system.md)
*   **Key Design Patterns:** Factory Pattern, Optimistic Locking Strategy, Observer Pattern for Waitlist notifications.
*   **Core Classes:** `Concert`, `Venue`, `TicketPool`, `BookingOrder`, `User`, `PaymentGateway`.

---

### Q10: Design a Hotel Management System

**Answer:**
Design a room reservation system supporting multiple room categories, housekeeping workflows, dynamic seasonal pricing, and check-in/check-out billing.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/hotel-management-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/hotel-management-system.md)
*   **Key Design Patterns:** Factory Pattern (RoomFactory), Strategy Pattern (PricingStrategy: PeakSeason vs Standard), State Pattern (RoomState: `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).
*   **Core Classes:** `Hotel`, `Room` (`Single`, `Double`, `Suite`), `Reservation`, `Guest`, `Bill`, `HousekeepingLog`.

---

### Q11: Design a Restaurant Management System

**Answer:**
Design a restaurant operation platform managing table reservations, digital menus, kitchen order ticketing (KOT), and split billing.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/restaurant-management-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/restaurant-management-system.md)
*   **Key Design Patterns:** Command Pattern (Order placement & KOT generation), Observer Pattern (Kitchen notifications), Decorator Pattern (Customized meal toppings).
*   **Core Classes:** `Restaurant`, `Table`, `MenuItem`, `Order`, `OrderItem`, `Bill`, `KitchenDisplay`.

---

### Q12: Design an Airline Management System

**Answer:**
Design an airline flight reservation engine supporting flights, schedules, aircraft seating configurations, passenger itineraries, and boarding pass generation.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/airline-management-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/airline-management-system.md)
*   **Key Design Patterns:** Builder Pattern (Complex Passenger Itinerary), Strategy Pattern (Dynamic Fare pricing).
*   **Core Classes:** `Airline`, `Flight`, `FlightSchedule`, `Aircraft`, `FlightSeat` (`Economy`, `Business`), `Passenger`, `Reservation`, `BoardingPass`.

---

### Q13: Design a Car Rental System (Zoomcar / Hertz)

**Answer:**
Design a vehicle rental fleet management system with reservation windows, vehicle inspection logging, dynamic insurance add-ons, and late-return penalties.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/car-rental-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/car-rental-system.md)
*   **Key Design Patterns:** Factory Pattern (Vehicle creation), Strategy Pattern (FeeCalculationStrategy), Decorator Pattern (Insurance add-ons).
*   **Core Classes:** `RentalStore`, `Vehicle` (`Hatchback`, `SUV`, `Sedan`), `Reservation`, `Customer`, `Invoice`.

---

### Q14: Design a Ride-Sharing Service like Uber (LLD / Class Level)

**Answer:**
Design the object-oriented architecture for a ride-hailing system supporting real-time driver matching, trip lifecycle states, GPS tracking, and surge pricing calculation.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/ride-sharing-service.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/ride-sharing-service.md)
*   **Key Design Patterns:** Strategy Pattern (DriverMatchingStrategy: NearestDriver vs HighestRated), State Pattern (TripState: `REQUESTED`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`), Observer Pattern (Location broadcast).
*   **Core Classes:** `Rider`, `Driver`, `Trip`, `Location` (`latitude`, `longitude`), `FareCalculator`, `MatchingManager`.

---

### Q15: Design an Online Food Delivery Service like Swiggy / DoorDash

**Answer:**
Design an end-to-end food ordering platform coordinating restaurants, menus, cart checkout, delivery partner assignment, and real-time delivery tracking.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/food-delivery-service.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/food-delivery-service.md)
*   **Key Design Patterns:** Observer Pattern (Order status updates to Customer & Delivery Agent), Strategy Pattern (DeliveryPartnerAssignmentStrategy), Factory Pattern.
*   **Core Classes:** `Restaurant`, `MenuItem`, `Cart`, `Order`, `Customer`, `DeliveryAgent`, `Payment`.

---

### Q16: Design Splitwise (Expense Sharing Application)

**Answer:**
Design an expense-sharing application supporting equal, exact, and percentage splits with debt simplification algorithms.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/splitwise.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/splitwise.md)
*   **Key Design Patterns:** Strategy Pattern (`EqualSplitStrategy`, `ExactSplitStrategy`, `PercentSplitStrategy`), Factory Pattern (SplitFactory).
*   **Core Classes:** `User`, `Group`, `Expense`, `Split` (`EqualSplit`, `ExactSplit`, `PercentSplit`), `ExpenseManager`, `BalanceSheet`.
*   **Key Algorithm:** Greedy Min-Cash-Flow algorithm using Max-Heap and Min-Heap to minimize total inter-user transactions.

---

### Q17: Design a Digital Wallet Service (Paytm / Google Pay)

**Answer:**
Design a secure digital ledger supporting peer-to-peer transfers, bank loading, balance locks, and atomic double-entry bookkeeping.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/digital-wallet-service.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/digital-wallet-service.md)
*   **Key Design Patterns:** Command Pattern (Transaction execution & rollback), Observer Pattern (Notification service), Strategy Pattern (PaymentSource).
*   **Core Classes:** `Wallet`, `Account`, `Transaction` (`DEBIT`, `CREDIT`), `LedgerEntry`, `PaymentMethod`.

---

### Q18: Design an Online Auction System (eBay LLD)

**Answer:**
Design an auction platform supporting live bidding, reserve price thresholds, proxy auto-bidding, and timer expiration management.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/online-auction-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/online-auction-system.md)
*   **Key Design Patterns:** Observer Pattern (Notify outbid users), State Pattern (AuctionState: `UPCOMING`, `ACTIVE`, `CLOSED`), Mediator Pattern.
*   **Core Classes:** `AuctionListing`, `Item`, `Bid`, `User` (`Buyer`, `Seller`), `AuctionManager`.

---

### Q19: Design an Online Stock Brokerage System (Zerodha / Robinhood)

**Answer:**
Design a brokerage platform supporting Market/Limit order placement, portfolio tracking, watchlists, and real-time market data feed ingestion.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/online-stock-brokerage-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/online-stock-brokerage-system.md)
*   **Key Design Patterns:** Observer Pattern (Stock price updates), Command Pattern (Order placement), Strategy Pattern (OrderExecutionStrategy).
*   **Core Classes:** `User`, `Account`, `Stock`, `Order` (`MarketOrder`, `LimitOrder`), `Position`, `Portfolio`, `Watchlist`.

---

### Q20: Design a Logging Framework (Log4j / Logback LLD)

**Answer:**
Design an extensible, multi-level, multi-destination logging library supporting log levels, custom formatters, and synchronous/asynchronous appenders.

*   **Solution Link:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/logging-framework.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/logging-framework.md)
*   **Key Design Patterns:** Singleton Pattern (LoggerManager), Chain of Responsibility (Log level filtering: `DEBUG` $\to$ `INFO` $\to$ `WARN` $\to$ `ERROR`), Strategy Pattern (Formatters & Appenders).
*   **Core Classes:** `Logger`, `LogLevel`, `LogMessage`, `LogAppender` (`ConsoleAppender`, `FileAppender`, `DatabaseAppender`), `LogFormatter`.
