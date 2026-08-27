# Operating Systems - Basic Interview Questions

### Q1: What is an Operating System (OS)? What are its primary goals and functions?
An OS is system software that acts as an intermediary between computer hardware and the user/applications.
*   **Primary Goals:** Convenience for users, efficiency of hardware utilization, and execution of user programs.
*   **Core Functions:** Process management, memory management, storage/file system management, device (I/O) management, security, and error handling.

### Q2: What is the difference between Kernel Mode and User Mode?
To protect hardware integrity, the CPU executes instructions in two distinct privilege levels:
*   **User Mode (Non-privileged):** Executing user application code. Access to physical hardware, raw memory, and privileged instructions is blocked. Attempting access triggers a trap/exception.
*   **Kernel Mode (Privileged/Supervisor):** Executing core OS kernel code. The CPU has complete, unrestricted access to all hardware, physical registers, and memory addresses.

### Q3: What is a System Call? How does it work?
A system call is a programmatic interface that allows a user-mode application to safely request privileged services from the OS kernel.
*   **Mechanism:**
    1.  The user program loads arguments into designated registers.
    2.  The program executes a special instruction (e.g., `syscall` or `int 0x80`), triggering a software interrupt.
    3.  The CPU switches from User Mode to Kernel Mode and jumps to the Interrupt Vector Table (IVT).
    4.  The kernel executes the request, switches back to User Mode, and returns control.

### Q4: What is a Process and what are its different states (Process Lifecycle)?
A process is a program in execution. Its lifecycle is managed through several state transitions:
*   **New:** The process is being created.
*   **Ready:** The process is loaded into main memory and waiting to be assigned to a CPU.
*   **Running:** Instructions are being executed on the CPU.
*   **Waiting (Blocked):** The process is blocked waiting for an event or I/O completion.
*   **Terminated:** The process has finished execution.

### Q5: What is a Process Control Block (PCB)? What information does it contain?
A PCB is a data structure in kernel memory that stores all essential state metadata for a specific process, enabling multitasking:
*   **Process State:** Ready, running, waiting, etc.
*   **Program Counter (PC):** Address of the next instruction to execute.
*   **CPU Registers:** Saved register states (accumulators, index registers, stack pointers).
*   **CPU Scheduling Info:** Priority, scheduling queue pointers.
*   **Memory Management Info:** Page tables, segment tables.
*   **I/O Status Info:** List of open files, allocated I/O devices.

### Q6: What is a Thread and how does it differ from a Process?
*   **Process:** A heavy, independent unit of resource allocation with its own private address space, page tables, file descriptors, and security context. Communication between processes requires expensive IPC.
*   **Thread:** A lightweight unit of CPU utilization within a process.
*   **Shared Resources:** Threads share the parent process's address space, global variables, and file descriptors.
*   **Private Resources:** Each thread maintains its own Program Counter (PC), CPU registers, and stack.

### Q7: What is Context Switching? Why is it considered computationally expensive?
Context switching is the procedure by which the OS saves the CPU execution state of an active process/thread and loads the saved state of another ready process/thread onto the CPU core:
*   **Why it is expensive:** Saving/restoring registers, updating scheduling tables, and invalidating memory caches (such as the Translation Lookaside Buffer - TLB), causing cache misses and memory-bus stalls.

### Q8: Explain CPU Scheduling and its primary objectives.
CPU scheduling is the process by which the OS decides which ready process is allocated CPU execution time:
*   **Objectives:** Maximize CPU utilization, maximize throughput, minimize turnaround time, minimize waiting time, and minimize response time.

### Q9: Compare FCFS and Shortest Job First (SJF) scheduling.
*   **FCFS (First-Come, First-Served):** Non-preemptive; processes are scheduled in order of arrival. Simple but prone to the **Convoy Effect** (short processes wait behind a single massive process, increasing average wait time).
*   **SJF (Shortest Job First):** Schedules the process with the shortest next CPU burst. Mathematically optimal for minimizing average wait time. However, it is hard to predict future CPU burst times and can cause starvation of long processes.

### Q10: What is Round Robin (RR) scheduling?
Round Robin is a preemptive scheduling algorithm designed for time-sharing systems:
*   **Mechanism:** Each process is allocated a small, fixed unit of CPU time called a **Time Quantum** (slice), typically 10–100ms. If the process does not finish within the quantum, it is preempted and placed at the back of the ready queue.
*   **Quantum Tradeoff:** A massive quantum turns RR into FCFS; an extremely small quantum causes excessive context-switching overhead.

### Q11: What is a Deadlock? What are the 4 necessary conditions for a deadlock to occur (Coffman Conditions)?
A deadlock is a state where a set of processes are permanently blocked because each is holding a resource while waiting for another resource held by another process in the same set. All 4 conditions must hold simultaneously:
1.  **Mutual Exclusion:** At least one resource must be held in a non-shareable mode (only one process can use it at a time).
2.  **Hold and Wait:** A process must currently hold at least one resource and be waiting to acquire additional resources held by other processes.
3.  **No Preemption:** Resources cannot be forcefully taken from a process; they can only be released voluntarily.
4.  **Circular Wait:** A closed chain of processes exists, where each process waits for a resource held by the next process in the chain.

### Q12: What is the difference between Preemptive and Non-Preemptive scheduling?
*   **Preemptive:** The OS can forcefully interrupt a currently running process and allocate the CPU to another process (e.g., when a higher-priority process arrives or a time slice expires).
*   **Non-Preemptive:** Once a process is allocated the CPU, it retains control until it either completes execution or voluntarily blocks itself (e.g., waiting for I/O).

### Q13: What is Multiprogramming, Multiprocessing, and Multitasking?
*   **Multiprogramming:** Keeping multiple processes in main memory simultaneously so that the CPU always has something to execute when the active process performs I/O.
*   **Multitasking (Time-Sharing):** A logical extension of multiprogramming where the CPU switches between processes so rapidly that users can interact with each application concurrently.
*   **Multiprocessing:** A system containing two or more physical CPU cores capable of executing multiple instructions in parallel.

### Q14: What is a Microkernel and how does it differ from a Monolithic Kernel?
*   **Monolithic Kernel:** All OS services (file system, drivers, virtual memory, scheduling) run inside a single, massive kernel space. Extremely fast due to direct function calls, but a single driver crash can crash the entire system.
*   **Microkernel:** Keeps only the bare essentials (IPC, basic scheduling, low-level memory management) in kernel space. All other services (drivers, file systems) run as isolated user-space processes. Highly secure and stable, but slower due to intensive IPC message-passing overhead.

### Q15: What is the role of the bootloader in an operating system boot sequence?
The bootloader is a small program stored in non-volatile ROM (or loaded from the MBR/EFI partition) that initializes the hardware, locates the OS kernel image on storage, loads it into physical RAM, and transfers execution control to the kernel.

### Q16: What is Virtual Memory and what is its main purpose?
Virtual memory is a memory management technique that abstracts physical RAM into a large, contiguous, logical address space for each process:
*   **Purpose:** Allows executing processes that are larger than physical RAM, protects process memory spaces from being overwritten by other processes, and simplifies memory allocation during programming.

### Q17: What is Paging in memory management?
Paging is a non-contiguous memory allocation scheme that eliminates external fragmentation:
*   **Mechanism:** Physical RAM is divided into fixed-size blocks called **Frames**. A process's logical address space is divided into blocks of the identical size called **Pages**.
*   The OS maps logical pages to physical frames using a Page Table.

### Q18: What is a Page Table and what is a Page Fault?
*   **Page Table:** A per-process data structure maintained by the OS that stores the mapping between logical page numbers and physical frame numbers.
*   **Page Fault:** A hardware interrupt triggered by the Memory Management Unit (MMU) when a process attempts to access a page that is marked as "not present" in physical RAM, forcing the kernel to fetch it from secondary storage (swap/disk).

### Q19: What is Fragmentation in memory management? Compare Internal and External.
*   **Internal Fragmentation:** Occurs when physical memory is allocated in fixed-size blocks (e.g., paging), and a process requests less memory than the block size. The remaining unused memory inside the allocated block is wasted.
*   **External Fragmentation:** Occurs when total free memory space exists to satisfy a allocation request, but it is split into tiny, non-contiguous blocks scattered across physical memory, making it impossible to allocate contiguous memory.

### Q20: What is the purpose of the Idle Process in an OS?
The idle process (PID 0 in Unix-like systems) is a system process scheduled by the OS when no other ready processes are waiting to run. It typically executes low-power CPU loop instructions (like `HLT`) to conserve energy and reduce CPU temperature.

### Q21: What is an Interrupt? Compare Hardware and Software Interrupts.
An interrupt is a signal sent to the CPU by hardware or software demanding immediate attention and halting current execution:
*   **Hardware Interrupt:** Triggered by an external physical device (e.g., mouse click, keyboard press, I/O read completion) via an IRQ line.
*   **Software Interrupt (Trap/Exception):** Triggered internally by the executing program, either intentionally (system call) or due to an error (divide-by-zero, page fault, segfault).

### Q22: What is an Interrupt Service Routine (ISR)?
An ISR (also called an Interrupt Handler) is a dedicated kernel function executed in response to a specific interrupt. When an interrupt occurs, the CPU saves its state, references the **Interrupt Vector Table (IVT)** to locate the memory address of the matching ISR, executes the routine, and then restores state to resume the interrupted process.

### Q23: Explain the principles of Cache Locality.
Processor caches exploit the physical properties of program execution loop patterns:
*   **Temporal Locality:** If a memory location is accessed once, it is highly likely to be accessed again in the near future (e.g., loop counters, variables).
*   **Spatial Locality:** If a memory location is accessed, nearby memory locations are highly likely to be accessed soon (e.g., sequential array traversals, instruction streams).

### Q24: What is Thrashing in virtual memory systems?
Thrashing is a severe performance degradation state where a system spends more time executing page-replacement (disk swapping) operations than actual instruction execution. It occurs when the active working memory set of running processes exceeds the available physical RAM.

### Q25: What is a Spooler and why is spooling used?
SPOOL (Simultaneous Peripheral Operations On-Line) is a buffer management technique where data is temporarily written to secondary disk storage before being consumed by a slow physical peripheral (e.g., a printer). It prevents fast CPU processes from being blocked waiting for slow mechanical devices to complete tasks.

### Q26: What is the difference between physical addressing and logical addressing?
*   **Logical (Virtual) Address:** An address generated by the CPU from the perspective of an active process (user-space perspective).
*   **Physical Address:** The actual hardware coordinate location in physical RAM chips.
*   **Conversion:** The hardware Memory Management Unit (MMU) translates logical addresses to physical addresses at runtime using page tables.

### Q27: What is a Mutex and how does it differ from a Semaphore?
*   **Mutex (Mutual Exclusion):** A locking mechanism used to synchronize access to a shared resource. It is owner-based: only the specific thread that acquired (locked) the mutex can release (unlock) it.
*   **Semaphore:** A signaling mechanism. It does not have an owner concept. Any thread can signal (increment) or wait (decrement) on a semaphore.

### Q28: What is the difference between a Binary Semaphore and a Counting Semaphore?
*   **Binary Semaphore:** An integer value restricted to `0` and `1`. Primarily used for mutual exclusion.
*   **Counting Semaphore:** An integer value spanning an unrestricted range. It is used to control access to a finite pool of identical resources (e.g., pool of database connections), tracking how many resources are currently free.

### Q29: Explain the difference between starvation and deadlock.
*   **Deadlock:** A state where two or more processes are permanently blocked in a circular wait, unable to proceed unless the OS manually intervenes (e.g., killing a process).
*   **Starvation (Liveliness issue):** A process is ready to run but is delayed indefinitely because scheduling algorithms continually allocate resources to higher-priority processes. The process is not blocked, but it never gets CPU time.

### Q30: What is the difference between a program and a process?
*   **Program:** A passive, static entity stored on disk containing a compiled set of instructions (e.g., an executable file).
*   **Process:** An active, dynamic entity loaded into memory, containing execution state (registers, stack, heap, and PC) and utilizing system resources.

### Q31: What is the purpose of the ready queue and wait queue?
*   **Ready Queue:** Stores pointers to all PCBs of processes that are loaded into RAM and ready for CPU execution.
*   **Wait (Blocked) Queue:** Holds pointers to PCBs of processes that cannot execute because they are waiting for a specific event, such as I/O completion, a timer, or a resource signal.

### Q32: What is a Dispatcher in CPU scheduling?
The dispatcher is the module that physically transfers execution control of the CPU to the process selected by the short-term scheduler:
*   **Duties:** Context switching, switching to User Mode, and jumping to the correct instruction address in the user program to resume execution.
*   **Latency:** The time taken by the dispatcher to stop one process and start another is called **Dispatch Latency**.

### Q33: What is the critical section problem?
The critical section is a code segment inside a process where shared resources (variables, files, databases) are accessed and updated. The problem is to design a protocol ensuring that only one process executes in its critical section at any given time, preventing data inconsistency.

### Q34: What is a race condition and how can it be avoided?
A race condition is an undesirable situation where the output of a system depends on the execution sequence or timing of concurrent threads/processes:
*   **Avoidance:** Enforcing mutual exclusion in critical sections using synchronization tools like mutexes, semaphores, or monitors.

### Q35: What is a Spinlock and when is it preferred over a Mutex?
A spinlock is a lock where a thread repeatedly polls a lock variable in a busy-waiting loop (`while(locked)`) until it becomes available:
*   **Preference:** Preferred in multi-core systems when the lock is held for very short durations, as it avoids the expensive context-switching overhead of blocking and waking a thread.

### Q36: What is Inter-Process Communication (IPC)? Why is it needed?
IPC is a set of programming mechanisms provided by the OS that allow distinct processes to communicate and share data safely:
*   **Why it is needed:** Processes have isolated address spaces. To coordinate, they must use OS-controlled IPC channels like shared memory, message queues, pipes, sockets, or signals.

### Q37: What is a zombie process and how is it reaped?
A zombie process is a process that has completed execution (via `exit`), but its entry still remains in the OS process table:
*   **Why it exists:** The entry is kept so the parent process can read the exit status code.
*   **Reaping:** The parent process must call `wait()` or `waitpid()` to read the status, allowing the kernel to purge the zombie entry.

### Q38: What is an orphan process and how does the OS handle it?
An orphan process is a running process whose parent process has terminated or crashed:
*   **OS Handling:** In Unix-like systems, the orphaned process is automatically adopted by the system initialization process, **`init` (PID 1)** or **`systemd`**, which regularly calls `wait()` to reap the orphan when it eventually terminates.

### Q39: What is the difference between a command-line interface (CLI) and a graphical user interface (GUI) shell?
*   **CLI:** A text-based shell interface where users type commands that are parsed and executed by the OS interpreter. Low resource overhead, highly scriptable.
*   **GUI:** A visual shell interface using windows, icons, and menus, translating user clicks/gestures into OS-level system instructions. High resource overhead, user-friendly.

### Q40: What is a file system and what are its primary duties?
A file system is a logical structure and set of metadata used by the OS to organize, store, retrieve, and track files on physical storage devices:
*   **Duties:** Mapping logical file blocks to physical disk sectors, directory structuring, access control/permissions, and tracking free/used disk blocks.

### Q41: What is an Inode in Unix-like file systems?
An Inode (index node) is a data structure on disk representing a file system object. It stores all metadata about a file *except* its actual name and data payload:
*   **Attributes:** File size, physical block locations, owner ID, group ID, permissions (rwx), access/creation timestamps, and hard link count.

### Q42: Compare FAT32, NTFS, and ext4 file systems.
*   **FAT32:** Legacy, simple file allocation table; no built-in file permissions, maximum single file size limit of 4 GB, and maximum volume size of 8 TB.
*   **NTFS (Windows):** Advanced journaling file system; supports granular file permissions, compression, encryption (EFS), disk quotas, and massive file sizes.
*   **ext4 (Linux):** Highly robust journaling file system; uses extents to reduce fragmentation, supports fast file checking, block allocation optimizations, and high scalability.

### Q43: What is RAID and what are the basic levels?
Redundant Array of Independent Disks (RAID) combines multiple physical hard drives into a single logical unit to provide redundancy, performance, or both:
*   **RAID 0 (Striping):** Splits data across drives. High read/write speed, zero redundancy (one drive failure destroys all data).
*   **RAID 1 (Mirroring):** Duplicates data on two drives. High redundancy, but storage efficiency is cut in half.
*   **RAID 5 (Striping + Distributed Parity):** Requires at least 3 drives. Balances speed, redundancy, and efficiency. Can survive a single drive failure.

### Q44: What is the difference between logical formatting and physical formatting?
*   **Physical (Low-Level) Formatting:** Usually performed by the manufacturer; divides the disk platters into physical sectors, tracks, and cylinders, and writes sector markers.
*   **Logical (High-Level) Formatting:** Performed by the OS user; writes a blank file system structure (FAT, NTFS, ext4) onto a disk partition, preparing it to store files.

### Q45: Explain the difference between compile-time, load-time, and execution-time address binding.
*   **Compile-Time:** If the exact memory location is known beforehand, absolute addresses are generated during compilation. Requires recompiling if starting location changes.
*   **Load-Time:** The compiler generates relocatable addresses. The loader binds these to physical memory locations when the program is loaded into RAM.
*   **Execution-Time:** Memory locations can shift during execution (e.g., swapping). Address binding is delayed until CPU instructions are run, requiring hardware MMU support.

### Q46: What is a Translation Lookaside Buffer (TLB)?
A TLB is a high-speed hardware cache located inside the CPU MMU. It stores recently used logical-to-physical address translation mappings from the page tables. It drastically speeds up virtual memory accesses by bypassing expensive RAM-based page table walks.

### Q47: What is the purpose of the Memory Management Unit (MMU)?
The MMU is a dedicated hardware component inside the CPU. Its primary purpose is to perform real-time translation of virtual (logical) memory addresses generated by the CPU into physical RAM coordinates, while enforcing memory protection and page-level security policies.

### Q48: What is the difference between SMP and AMP?
*   **SMP (Symmetric Multiprocessing):** Multiple identical CPU cores share physical memory and access a single, shared instance of the OS kernel. No core has a privileged role; they share scheduling loads symmetrically.
*   **AMP (Asymmetric Multiprocessing):** A master-slave architecture. A designated master CPU core runs the OS kernel and delegates specific tasks or applications to slave cores, which can have different hardware architectures.

### Q49: What is a Device Driver?
A device driver is specialized system software that acts as a translator between the operating system kernel and a specific hardware peripheral. It exposes a standardized API to the kernel while executing device-specific hardware register commands.

### Q50: Compare cooperative and preemptive multitasking.
*   **Cooperative Multitasking:** The active process determines when to yield control back to the OS scheduler. If a process hangs or is poorly programmed, it freezes the entire operating system.
*   **Preemptive Multitasking:** The OS uses hardware timer interrupts to forcefully preempt the running process after its time slice expires, ensuring fair CPU distribution and preventing system freezes.
