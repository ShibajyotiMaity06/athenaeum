# Operating Systems - Medium Interview Questions

### Q1: Explain the Banker's Algorithm for Deadlock Avoidance.
The Banker's Algorithm is a deadlock avoidance method used in resource-allocation systems. It simulates resource allocation and determines if the system remains in a **Safe State** before granting a request.
*   **Data Structures:**
    *   `Allocation`: 2D matrix representing resources currently allocated to each process.
    *   `Max`: 2D matrix representing the maximum resources a process may ever request.
    *   `Available`: Vector indicating the count of free resources of each type.
    *   `Need`: Calculated as $\text{Need} = \text{Max} - \text{Allocation}$.
*   **The Safety Algorithm:**
    1.  Find a process whose `Need` is less than or equal to `Available`.
    2.  If found, assume it completes execution, releases its resources ($\text{Available} = \text{Available} + \text{Allocation}$), and mark it as finished.
    3.  Repeat until all processes are finished (Safe State) or a deadlocked state is reached (Unsafe State, request denied).

### Q2: Compare Paging and Segmentation in Memory Management.
*   **Paging:**
    *   Divides logical memory into fixed-size **Pages** and physical memory into **Frames**.
    *   The division is completely invisible to the programmer.
    *   Eliminates external fragmentation but suffers from internal fragmentation.
*   **Segmentation:**
    *   Divides logical memory into variable-size **Segments** based on logical program units (e.g., main function, stack, library, objects).
    *   Visible to the programmer.
    *   Suffers from external fragmentation (requires compaction) but has zero internal fragmentation.

### Q3: Explain the Bounded-Buffer (Producer-Consumer) synchronization problem.
The Bounded-Buffer problem involves a buffer of fixed size $N$ shared by producers (creating items) and consumers (removing items):
*   **The Synchronization Challenge:** Prevent producers from adding items to a full buffer, prevent consumers from removing items from an empty buffer, and protect buffer indices from concurrent updates.
*   **Semaphore Solution:** Uses three semaphores:
    *   `mutex` (binary): Protects the critical section of buffer modification.
    *   `empty` (counting, initial $N$): Tracks remaining empty slots.
    *   `full` (counting, initial $0$): Tracks filled slots.

### Q4: Detail the Readers-Writers synchronization problem.
This problem models access to a shared resource (e.g., database) where multiple processes read and write:
*   **Rules:** Multiple readers can access the resource simultaneously, but only one writer can access it exclusively (no other readers or writers allowed).
*   **First Readers-Writers Problem (No Reader Waits):** Readers have priority. If a reader is active, subsequent readers enter immediately, which can cause starvation for writers.
*   **Second Readers-Writers Problem (No Writer Waits):** Writers have priority. Once a writer is ready, no new readers are allowed to start reading, which can cause starvation for readers.

### Q5: Explain the Dining Philosophers problem and its deadlock solutions.
Five philosophers sit around a circular table with 5 chopsticks, alternating between thinking and eating. A philosopher needs both adjacent chopsticks to eat:
*   **Deadlock Scenario:** If every philosopher sits down and simultaneously picks up their left chopstick, all right chopsticks are occupied. They will wait forever, causing a deadlock.
*   **Deadlock Solutions:**
    *   **Asymmetry:** Odd-numbered philosophers pick up their left chopstick first, while even-numbered philosophers pick up their right chopstick first.
    *   **Limit concurrency:** Allow at most 4 philosophers to sit at the table simultaneously.
    *   **State check:** A philosopher only picks up chopsticks if *both* are free (using a mutex to protect state evaluation).

### Q6: What is Belady's Anomaly and which page replacement algorithms are susceptible to it?
*   **Belady's Anomaly:** An unexpected phenomenon where the page fault rate increases when more physical memory frames are allocated to a process.
*   **Susceptible Algorithms:** Simple FIFO (First-In, First-Out) page replacement.
*   **Why it happens:** FIFO does not respect stack properties.
*   **Immune Algorithms:** Stack-based algorithms like LRU (Least Recently Used) and Optimal Page Replacement, where the set of pages in a configuration of size $N$ is always a subset of pages in a configuration of size $N+1$.

### Q7: Explain LRU and Clock (Second Chance) page replacement algorithms.
*   **LRU (Least Recently Used):** Replaces the page in RAM that has not been accessed for the longest duration of time. Requires heavy tracking overhead (timestamp registers or a stack updated on every memory reference).
*   **Clock (Second Chance):** A low-overhead approximation of LRU.
    *   **Mechanism:** Pages are arranged in a logical circular queue with a clock hand pointing to the next candidate. Each page maintains a **Reference Bit** ($0$ or $1$).
    *   **Execution:** If the bit is $1$, the clock hand resets it to $0$ and moves to the next page (giving it a second chance). If the bit is $0$, that page is selected for replacement.

### Q8: Describe the Copy-on-Write (COW) mechanism used during process cloning.
*   **The Problem:** Traditional `fork()` duplicated the entire physical memory of the parent process into the child, which is highly inefficient if the child immediately calls `exec()`.
*   **COW Solution:** When `fork()` is called, the parent and child initially share the exact same physical memory pages. Their page table entries are marked as **Read-Only**.
*   **Trigger:** If either process attempts to write to a page, a page fault is triggered. The kernel catches the fault, makes a duplicate of that specific page in physical RAM, updates the faulting process's page table to point to the new frame with write permissions, and resumes execution.

### Q9: Compare Shared Memory and Message Passing in Inter-Process Communication.
*   **Shared Memory:**
    *   The OS maps a common physical memory region into the address space of both processes.
    *   **Performance:** Extremely fast, operating at memory-bus speeds with no kernel intervention.
    *   **Sync:** Synchronization (locks, semaphores) must be manually implemented by application code to prevent race conditions.
*   **Message Passing:**
    *   Processes exchange data by sending/receiving messages via OS kernel queues (using system calls like `msgsnd`/`msgrcv`).
    *   **Performance:** Slower due to kernel overhead and data copying (from user space to kernel, then kernel to target user space).
    *   **Sync:** Easier to implement because the OS handles queue synchronization natively.

### Q10: Explain the Multi-Level Feedback Queue (MLFQ) CPU Scheduler.
MLFQ dynamically adjusts a process's scheduling priority based on its execution history:
*   **Structure:** Consists of multiple ready queues, each with a different priority level. Queue 0 (highest priority) has a small time quantum; lower queues have larger quanta.
*   **Rules:**
    1.  A new process enters Queue 0.
    2.  If a process uses up its entire time quantum, it is demoted to the next lower-priority queue (penalizes CPU-bound processes).
    3.  If a process yields the CPU before its quantum expires (e.g., blocking for I/O), it remains in its current queue (prioritizes interactive I/O-bound processes).
    4.  **Priority Boost:** Periodically, all processes are boosted back to the highest queue to prevent starvation.

### Q11: What is Priority Inversion and how does Priority Inheritance solve it?
*   **Priority Inversion:** A scenario where a low-priority thread holds a shared resource (via a mutex) that a high-priority thread needs. A medium-priority thread that does not need the resource arrives and preempts the low-priority thread, leaving the high-priority thread blocked indefinitely.
*   **Priority Inheritance:** Resolves this by temporarily elevating the scheduling priority of the low-priority lock-holder to match the priority of the high-priority thread waiting for the lock. Once the lock is released, the low-priority thread drops back to its original priority level.

### Q12: Detail the four methods of handling Deadlocks.
1.  **Prevention:** Proactively design the system to eliminate at least one of the 4 Coffman conditions (e.g., requiring processes to request all resources at once to eliminate "Hold and Wait").
2.  **Avoidance:** Dynamically evaluate resource requests using current state allocation to ensure the system never enters an unsafe state (e.g., Banker's Algorithm).
3.  **Detection & Recovery:** Allow deadlocks to occur, run detection algorithms (like resource allocation graphs), and recover by terminating deadlocked processes or preempting resources.
4.  **Ignorance (Ostrich Algorithm):** Pretend deadlocks never happen. Used by most general-purpose OSs (Windows, Linux, macOS) because deadlocks are rare, and prevention/avoidance are computationally expensive.

### Q13: Compare Disk Scheduling Algorithms.
Disk scheduling optimizes the movement of the physical hard drive's read/write head:
*   **SSTF (Shortest Seek Time First):** Services the request closest to the current head position. Minimizes head movement but can cause starvation for distant requests.
*   **SCAN (Elevator):** The head moves continuously in one direction to the end of the disk, servicing requests along the way, then reverses direction.
*   **C-SCAN (Circular SCAN):** Moves in one direction servicing requests, but when it reaches the end, it immediately returns to the start without servicing requests on the return path, providing uniform waiting times.
*   **LOOK / C-LOOK:** Variants of SCAN/C-SCAN that reverse direction (or return to start) as soon as there are no further requests ahead, preventing useless sweeps to the very edge of the disk.

### Q14: Explain the differences between Named and Unnamed Pipes.
*   **Unnamed (Anonymous) Pipes:** Created in kernel memory via system calls (e.g., `pipe`). They have no representation on the file system and are strictly limited to communication between a parent process and its direct children (sharing the pipe's file descriptors).
*   **Named Pipes (FIFOs):** Represented as physical files in the file system directory tree. Any unrelated processes can open this file and communicate bidirectionally, and the pipe persists even after processes terminate.

### Q15: Compare ULT and KLT across Threading Models.
*   **User-Level Threads (ULT):** Managed entirely by user-space libraries. The kernel is unaware of them. Fast context switching, but if one ULT blocks for I/O, the kernel blocks the entire parent process.
*   **Kernel-Level Threads (KLT):** Managed directly by the OS kernel. Blocking one thread does not affect others, but context switching is slower because it requires system calls.
*   **Threading Models:**
    *   **Many-to-One (M:1):** Many ULTs map to a single KLT. Fast but lacks multi-core parallelism and suffers from I/O blocking.
    *   **One-to-One (1:1):** Each ULT maps to a private KLT. Standard model in Linux and Windows; supports true multi-core parallel execution.
    *   **Many-to-Many (M:N):** Multiplexes many ULTs over a smaller or equal number of KLTs. Complex to implement but highly flexible.

### Q16: How do Multi-Level Page Tables save memory?
*   **The Problem:** On a 32-bit system with 4KB pages, a flat single-level page table requires $2^{20}$ entries. If each entry is 4 bytes, every process needs 4MB of contiguous physical RAM for its page table, even if it only uses 100KB of virtual memory.
*   **The Solution:** Multi-level page tables organize the table hierarchically (e.g., Page Directory pointing to Page Tables).
*   **Memory Savings:** The OS only allocates physical frames for the top-level Page Directory. Inner-level page tables are only allocated when their corresponding virtual address ranges are actively mapped and used, saving massive amounts of RAM.

### Q17: What is a TLB Shootdown?
In multi-core (symmetric multiprocessing) systems, each core has its own private TLB cache. If one core modifies a page table entry (e.g., updating a mapping or freeing memory), the TLB entries on other CPU cores become stale.
*   **TLB Shootdown:** The core making the change must issue an Inter-Processor Interrupt (IPI) to all other cores, forcing them to flush their local TLBs to guarantee memory coherence. This is highly expensive due to core synchronization stalls.

### Q18: Compare Memory-Mapped I/O and Port-Mapped I/O.
*   **Memory-Mapped I/O:** The control registers and memory buffers of physical devices are mapped directly into the system's physical address space. Standard memory-access CPU instructions (like `MOV`) are used to read/write device registers. Consumes physical memory address range.
*   **Port-Mapped I/O (Isolated I/O):** Devices are mapped to a separate, dedicated address space called I/O ports. Accessing these registers requires specialized CPU instructions (like `IN` and `OUT` in x86).

### Q19: Explain the concept of Memory-Mapped Files (mmap).
Memory-mapped files allow an application to map the contents of a disk file directly into its virtual memory address space.
*   **Mechanism:** The application can read or write file data by accessing memory pointers directly, bypassing explicit `read`/`write` system calls.
*   **Benefits:** Drastically reduces user-space to kernel-space buffer copy overhead and enables highly efficient file sharing between distinct processes.

### Q20: What are the requirements for a valid solution to the Critical Section problem?
Any software or hardware solution to the critical section problem must satisfy three strict criteria:
1.  **Mutual Exclusion:** If process $P_i$ is executing in its critical section, no other processes can execute in their critical sections for that shared resource.
2.  **Progress:** If no process is executing in its critical section and some processes want to enter, only those processes not executing in their remainder sections can participate in deciding which process enters next, and this decision cannot be postponed indefinitely.
3.  **Bounded Waiting:** There must be a limit on the number of times other processes can enter their critical sections after a process has made a request to enter and before that request is granted, preventing starvation.

### Q21: Explain Test-and-Set and Compare-and-Swap (CAS) instructions.
Both are atomic, hardware-supported CPU instructions used to implement low-level synchronization primitives without interrupts:
*   **Test-and-Set:** Reads a memory variable, sets its value to `true`, and returns the original value in a single, indivisible hardware operation.
*   **Compare-and-Swap (CAS):** Accepts three arguments: a memory location ($V$), the expected old value ($A$), and a new value ($B$). It atomically checks if $V == A$. If true, it updates $V$ to $B$ and returns true. If false, it leaves $V$ unchanged and returns false.

### Q22: Describe the file allocation methods: Contiguous, Linked, and Indexed.
*   **Contiguous Allocation:** Files are stored in continuous physical disk blocks. Highly efficient sequential and random access, but prone to severe external fragmentation and file-growth limitations.
*   **Linked Allocation:** Each file is a linked list of disk blocks, where each block contains a pointer to the next block. Eliminates external fragmentation and supports dynamic file growth, but suffers from terrible random-access speeds and vulnerability to pointer corruption.
*   **Indexed Allocation:** Every file has an **Index Block** containing pointers to all its physical data blocks. Supports fast random access, has zero external fragmentation, but has disk overhead for small files due to index block allocation.

### Q23: How does the OS manage a Directory Structure?
Directories are special files containing mappings between user-readable filenames and physical metadata identifiers (like Inodes):
*   **Single-Level:** All files are in a single directory. Leads to naming conflicts and scalability issues.
*   **Two-Level:** Each user has their own private directory. Resolves naming conflicts but lacks organization.
*   **Tree-Structured:** A hierarchical directory tree (root, directories, subdirectories, and files). Standard model; supports paths and clean organizational boundaries.

### Q24: What is a Journaling File System?
A journaling file system prevents data corruption by maintaining a dedicated transaction log called a **Journal**:
*   **Mechanism:** Before writing any changes to the main file system structures, the OS writes the pending metadata changes to the journal first.
*   **Recovery:** If the system crashes mid-write (due to a power failure), the OS reads the journal during boot and either replays the completed journal transactions (roll-forward) or discards incomplete ones (roll-back), restoring integrity in seconds without scanning the whole disk.

### Q25: Compare Hard Links and Soft (Symbolic) Links.
*   **Hard Link:** A directory entry that points directly to an existing Inode number on disk.
    *   **Behavior:** A hard link is identical to the original file. Deleting the original file does not delete the data as long as the hard link's reference count is greater than zero. Cannot cross file system boundaries or link directories.
*   **Soft (Symbolic) Link:** A distinct file that contains the text path of another file as its payload.
    *   **Behavior:** It acts like a shortcut. If the original file is deleted, the soft link becomes a "dangling link" pointing to a non-existent path. Can link directories and cross physical file systems.

### Q26: Compare Hard Real-Time and Soft Real-Time Systems.
*   **Hard Real-Time:** Missing a single deadline leads to catastrophic system failure, hardware damage, or loss of life (e.g., pacemaker, airbag deployment, flight control systems). Virtual memory and paging are usually disabled to guarantee deterministic timing.
*   **Soft Real-Time:** Missing deadlines degrades performance but is not catastrophic (e.g., video streaming, audio playback). The OS prioritizes real-time tasks but does not guarantee strict determinism.

### Q27: Describe RM and EDF scheduling in RTOS.
*   **Rate-Monotonic (RM):** Static, preemptive scheduling. Priorities are assigned based on the frequency of tasks: tasks with the shortest periods are assigned the highest priority. Optimal for static scheduling.
*   **Earliest-Deadline-First (EDF):** Dynamic scheduling. Priorities are updated at runtime: the task with the closest absolute deadline is assigned the highest priority. Can achieve up to 100% CPU utilization, but is mathematically complex and unstable under overload.

### Q28: How does the OS handle asynchronous signals?
Asynchronous signals (e.g., SIGINT, SIGSEGV) notify processes of asynchronous events:
1.  **Generation:** An event (keyboard interrupt, hardware fault) generates a signal.
2.  **Delivery:** The kernel registers the pending signal in the target process's PCB.
3.  **Handling:** When the process transitions from Kernel Mode to User Mode, the kernel intercepts execution and forces it to execute either:
    *   A default handler (e.g., terminate process, core dump).
    *   An ignore handler (no-op).
    *   A custom user-defined **Signal Handler** registered in user space.

### Q29: Compare blocking, non-blocking, and asynchronous I/O.
*   **Blocking I/O:** The calling thread is suspended (placed in the wait queue) until the I/O operation completes and data is copied to user space.
*   **Non-Blocking I/O:** The system call returns immediately. If data is not ready, it returns an error code (e.g., `EWOULDBLOCK`). The thread must continuously poll the socket.
*   **Asynchronous I/O:** The thread initiates the I/O and returns immediately. The kernel performs the I/O entirely in the background. Once finished, the kernel notifies the thread via a callback or signal.

### Q30: What is the working set model and how does it prevent thrashing?
The working set model is based on program locality:
*   **Working Set ($W_i$):** The set of pages actively accessed by process $P_i$ during the most recent $\Delta$ page references.
*   **The Principle:** The OS tracks the sum of all working sets ($D = \sum |W_i|$). If $D$ exceeds total available physical RAM frames, the OS suspends/swaps out an entire process to free up frames, ensuring remaining processes have their full working sets in RAM, completely preventing thrashing.

### Q31: What is POSIX and why is it important?
POSIX (Portable Operating System Interface) is a set of IEEE standards defining a uniform developer API (including system calls, shell commands, and thread management) for Unix-like operating systems. It guarantees that source code written for one compliant system (e.g., macOS) compiles and runs on another (e.g., Linux).

### Q32: Explain the difference between thread-safe and non-thread-safe functions.
*   **Thread-Safe:** A function that can be executed concurrently by multiple threads without causing race conditions or data corruption. It avoids accessing shared global state or protects shared state using internal synchronization (locks).
*   **Non-Thread-Safe:** Modifies static variables or global states without locking. Executing it concurrently leads to unpredictable corruption.

### Q33: How does Linux organize processes?
Linux groups processes to manage scheduling and signal delivery:
*   **PID:** Unique identifier for each individual process.
*   **PPID:** The ID of the parent process that created it.
*   **PGID (Process Group ID):** Groups related processes (e.g., a shell pipeline: `ls | grep foo`). Signals can be sent to an entire process group at once.
*   **SID (Session ID):** Groups multiple process groups into a single terminal session (e.g., shell login session).

### Q34: What is disk fragmentation and how does defragmentation resolve it?
Disk fragmentation occurs over time as files are written, modified, and deleted, causing their physical blocks to become scattered non-contiguously across the storage platter:
*   **Defragmentation:** A system utility that reads scattered physical blocks and consolidates them back into contiguous sectors, reducing mechanical hard drive read head movement and speeding up sequential access.

### Q35: What is the Page Cache in operating systems?
The page cache is a kernel-managed RAM buffer used to cache physical disk file blocks. When a program reads a file, the OS loads the blocks into the page cache in RAM first. Subsequent reads are served from RAM, drastically reducing expensive disk I/O operations.

### Q36: Compare a trap, an exception, and a system call.
*   **System Call:** An intentional, programmed software instruction executed by a user program to request kernel services.
*   **Trap:** A broader term representing any synchronous CPU transfer of execution to the kernel. Includes system calls and exceptions.
*   **Exception:** An unintentional, synchronous error triggered by the CPU during instruction execution (e.g., page fault, divide-by-zero, segfault).

### Q37: Compare DMA and Interrupt-driven I/O.
*   **Interrupt-Driven I/O:** The CPU initiates an I/O read and switches to another process. For every single byte or word read, the device controller interrupts the CPU, forcing it to copy the data from device buffer registers into RAM. Highly CPU-intensive for large transfers.
*   **DMA (Direct Memory Access):** The CPU delegates the entire transfer to a dedicated hardware DMA controller, specifying the source, destination, and transfer size. The DMA controller transfers blocks of data directly from the device to RAM over the system bus without CPU intervention, triggering only a single interrupt when the entire block transfer completes.

### Q38: Explain the Windows NT Hybrid Kernel architecture.
The Windows NT kernel is a hybrid design combining monolithic speed and microkernel safety:
*   **The Structure:** Key subsystems (like the file system, network stack, and graphics driver) run inside the privileged kernel space as part of a single execution image to bypass slow microkernel message-passing overhead. However, the system architecture maintains a modular microkernel-like logical structure with strictly defined interfaces.

### Q39: What happens physically on disk blocks during file deletion?
When a file is deleted (e.g., using `rm` or `unlink`), the OS does not overwrite or erase the actual data payload sectors on disk (which would be slow):
*   **The Process:** The OS removes the file name entry from the parent directory block, decrements the file's Inode reference count, and marks the file's data blocks as "free" in its free-space bitmap, making those blocks available to be overwritten by future write operations.

### Q40: Detail `fork()`, `exec()`, and `wait()` system calls.
In Unix-like systems, process creation is split into three phases:
*   **`fork()`:** Clones the active process. Creates an identical child process with a duplicate PCB and address space. Returns `0` to the child, and returns the child's PID to the parent.
*   **`exec()`:** Overwrites the calling process's memory space, code segment, and registers with a completely new executable image from disk, starting its execution.
*   **`wait()`:** Suspends the parent process until its child process terminates, reading the child's exit status and preventing zombies.

### Q41: Explain how a Semaphore blocks threads without busy waiting.
To avoid busy waiting (spinning), semaphores maintain an internal state queue:
```
struct Semaphore {
    int value;
    struct ProcessQueue *queue;
}
```
*   **`wait()` (P operation):** Decrements `value`. If `value < 0`, the calling thread is removed from the CPU, its PCB is appended to the semaphore's internal `queue`, and its state is set to Blocked.
*   **`signal()` (V operation):** Increments `value`. If `value <= 0`, the kernel pops a blocked process from the `queue` and transitions its state to Ready.

### Q42: What is a Monitor in synchronization?
A monitor is a high-level programming language construct providing safe concurrent access to shared data structures:
*   **Mechanism:** Encapsulates private variables and public procedures. Only one thread can be active inside the monitor at any given time (mutual exclusion is enforced automatically by the compiler).
*   **Condition Variables:** Threads block inside the monitor using `wait()` and are woken up using `signal()` on explicit condition variables.

### Q43: Define Turnaround, Waiting, and Response Time.
*   **Turnaround Time:** The total time elapsed from the moment a process is submitted to the moment it completes execution ($\text{Turnaround} = \text{Completion Time} - \text{Arrival Time}$).
*   **Waiting Time:** The cumulative time a process spends waiting in the ready queue ($\text{Waiting} = \text{Turnaround} - \text{Burst/Execution Time}$).
*   **Response Time:** The time from process submission to its very first scheduled CPU execution.

### Q44: Compare logical and physical disk partitioning.
*   **Physical Partitioning:** Dividing a single physical hard drive into separate, isolated logical disks (partitions like C: and D: or `/dev/sda1` and `/dev/sda2`) defined in a partition table (MBR or GPT).
*   **Logical Partitioning (LVM):** Creates an abstract layer over physical drives, pooling multiple distinct hard drives into logical volume groups. Allows dynamic resizing of partitions at runtime without formatting.

### Q45: Compare Swapping and Paging.
*   **Swapping:** A high-level memory management operation where an entire process's complete address space (all its pages and data) is moved out of RAM onto secondary disk storage to free up physical memory.
*   **Paging:** A granular memory management operation where only individual, inactive pages (typically 4KB) are moved between RAM and disk, allowing most of the process to remain active in memory.

### Q46: What is a Page Directory?
In a multi-level paging scheme, the page directory is the top-level table. The base address of the page directory is loaded into a dedicated CPU register (like `CR3` in x86). Each entry in the directory points to the physical address of a secondary page table, which contains the final logical-to-physical frame coordinates.

### Q47: Describe Peterson's Solution and its modern limitations.
Peterson's Solution is a classic software-based synchronization protocol for two processes:
*   **Mechanism:** Uses a `turn` variable and a boolean array `flag[2]` to coordinate entry into the critical section.
*   **Modern Limitations:** Peterson's algorithm assumes sequential instruction execution. Modern CPUs use out-of-order execution and memory-access pipelining, which reorders operations and breaks the algorithm unless explicit **Memory Barrier (Fence)** instructions are inserted.

### Q48: Compare Hardware-Managed and Software-Managed TLBs.
*   **Hardware-Managed:** On a TLB miss, the CPU hardware MMU itself traverses the multi-level page tables in RAM to find the physical mapping and updates the TLB. Fast, but hardcoded to a specific page table structure.
*   **Software-Managed:** On a TLB miss, the MMU triggers a quick hardware trap. The kernel catches the trap and runs a dedicated TLB exception handler routine to locate the mapping in software and load it. Slower but highly flexible.

### Q49: What is the role of the I/O Scheduler?
The I/O scheduler manages and reorders physical block storage read/write requests (e.g., using algorithms like BFQ or Kyber in Linux). It groups adjacent block requests and reorders queues to minimize mechanical head seek times and guarantee fairness across processes.

### Q50: What is Swap Space and how is it managed?
Swap space is a dedicated region on disk (a raw partition or swap file) used as an extension of physical RAM:
*   **Management:** When RAM is full, the OS moves inactive virtual memory pages to swap space. Swapping is managed directly by the kernel's page-out daemon, which maps virtual pages to physical block offsets on the swap partition, bypassing the standard file system to optimize speeds.
