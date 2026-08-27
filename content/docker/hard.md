# Docker - Hard Interview Questions

### Q1: Describe the container runtime stack beneath the Docker daemon.
* **Architecture**: Docker has evolved from a monolithic daemon into a modular, decoupled OCI-compliant execution stack:
  * **Docker Daemon (`dockerd`)**: Exposes the high-level API, manages images, networks, volumes, and handles authentication.
  * **Containerd**: An industry-standard container supervisor. It manages the full container lifecycle, including snapshotting, image transfers, and execution states.
  * **Containerd-Shim**: A tiny monitor process spawned for each container. It keeps the stdout/stderr streams open, reports exit codes, and maintains the container execution state even if `dockerd` or `containerd` restarts, preventing container termination.
  * **Runc**: A lightweight, CLI-based OCI runtime. It receives the bundle configuration from containerd, interacts with the Linux kernel namespaces/cgroups to spawn the isolated processes, and exits immediately.

### Q2: How does container escape occur at the kernel level? Give examples.
* **Mechanism**: Occurs when a process running inside a container bypasses namespace isolation and cgroup boundaries, gaining direct access to the host kernel or host file system.
* **CVE-2019-5736 (runc)**: An attacker with container root access overwrote the host `runc` binary during a `docker exec` execution, allowing arbitrary host execution upon subsequent runc invocations.
* **CVE-2024-21626 (runc)**: Leveraged open file descriptors pointing to the host's `/sys/fs/cgroup` directory. By changing the working directory to `/proc/self/fd/[ID]`, a process could escape the container root directory during initialization.
* **Mitigation**: Run containers with `--user` (non-root), drop dangerous capabilities, and enforce strict AppArmor/Seccomp profiles.

### Q3: Explain the inner workings of User Namespaces (userns) and UID/GID mapping.
* **Concept**: Maps the root user (UID 0) inside a container to an unprivileged, high-numbered UID (e.g., UID 100000) on the host machine.
* **Configurations**: Handled by `/etc/subuid` and `/etc/subgid` files, which define blocks of subordinate UIDs/GIDs allocated to users:
  * `dockersub:100000:65536` grants the user `dockersub` 65,536 system UIDs starting at 100000.
* **Benefit**: If a containerized process is compromised and escapes, it possesses root permissions only within its isolated namespace and is treated as an unprivileged user on the host, preventing host takeover.

### Q4: Detail the network routing path for a packet traveling from a container to the external internet.
* **Step 1 (Internal)**: The container process writes to its virtual network interface `eth0`.
* **Step 2 (Veth Pair)**: The packet travels across a **veth (Virtual Ethernet) pair**, exiting the container’s private network namespace and entering the host namespace via a virtual interface starting with `veth...`.
* **Step 3 (Bridge)**: The host `veth` interface is attached to a virtual bridge interface (like `docker0`). The bridge switches the packet to the host network stack.
* **Step 4 (Routing & iptables)**: The host kernel routes the packet. It matches a Post-Routing **NAT (Network Address Translation)** rule in `iptables` (the `MASQUERADE` target), which rewrites the packet’s source IP from the container's private IP to the host's physical network IP.
* **Step 5 (Physical NIC)**: The packet is forwarded out of the host's physical network interface card (e.g., `eth0`) to the physical gateway.

### Q5: What is the OCI specification and why is it critical?
* **Open Container Initiative (OCI)**: A governance structure established by Docker and industry partners to standardize container formats and runtimes.
* **Core Specs**:
  * **Image Specification**: Defines the base layout, layers, manifests, and configuration file format for an image.
  * **Runtime Specification**: Standardizes the execution lifecycle and filesystem bundles, ensuring any compliant runtime (e.g., runc, crun, gVisor) can run any OCI-compliant image.

### Q6: Explain the difference between Cgroups v1 and Cgroups v2.
* **Cgroups v1 (Legacy)**: Uses a multi-hierarchy model where each controller (CPU, Memory, I/O) has its own independent directory tree. This made resource coordination (like throttling write-back I/O under memory pressure) highly complex and buggy.
* **Cgroups v2 (Modern)**: Uses a single, unified hierarchy tree where processes belong to a single control group. All controllers are managed under a unified interface, allowing thread-group-level control, superior OOM-killer integration, and unified resource accounting.

### Q7: Explain the low-level differences between overlay2, btrfs, and devicemapper storage drivers.
* **overlay2**: A filesystem-level driver. Highly performant; uses page cache sharing (multiple containers share physical pages of the same file in memory). Requires a underlying filesystem (ext4/XFS) that supports `ftype=1`.
* **btrfs**: A subvolume-level driver. Uses copy-on-write at the block level. Performant for heavy writes but lacks page cache sharing across containers.
* **devicemapper**: A block-level driver utilizing thin provisioning. Writes are allocated in blocks. Slow due to high metadata transaction overhead; obsolete and removed in modern Docker engines in favor of `overlay2`.

### Q8: How does mutually authenticated TLS secure the Docker Daemon API?
* **Problem**: Exposing the Docker TCP socket (`tcp://0.0.0.0:2376`) allows anyone to execute commands as root on the host.
* **Mutual TLS (mTLS)**: Enforces cryptographic verification on both sides:
  * **Server verification**: The client verifies the Docker daemon's certificate against a trusted Certificate Authority (CA).
  * **Client verification**: The daemon verifies the client's certificate before executing commands.
  * **Implementation**: Requires configuring `tlsverify`, `tlscacert`, `tlscert`, and `tlskey` flags in `daemon.json`.

### Q9: Explain how Seccomp works inside Docker.
* **Secure Computing Mode (Seccomp)**: A Linux kernel security facility that filters the system calls (syscalls) a process can execute.
* **Default Profile**: Docker applies a default JSON-based Seccomp profile that blocks ~44 out of over 300+ syscalls (e.g., `reboot`, `mount`, `ptrace`, `kexec_load`).
* **Custom Profile**: Administrators can pass a custom JSON profile using security options (`--security-opt seccomp=/path/profile.json`) to restrict syscalls to the absolute bare minimum required by the workload.

### Q10: What is Rootless Docker and how does it function without root privileges?
* **Rootless Docker**: Runs the entire Docker daemon and container processes inside a user namespace without requiring host root access.
* **Mechanics**:
  * **User Namespaces**: Used to create nested namespaces where the unprivileged user acts as root inside the namespace.
  * **Slirp4netns**: Virtualizes the network stack in user space, translating TCP/IP packets over tap interfaces to bypass the host's privilege requirements.
  * **Fuse-overlayfs**: Implements the overlay storage driver inside user space since mounting kernel-level overlay FS requires root.

### Q11: Explain the flow of a multi-stage Docker build cache exporter like gha or registry.
* **Classic Cache**: Local only; layers are saved to `/var/lib/docker/image/overlay2/` and cannot be easily shared across CI runners.
* **BuildKit Cache Exporters**:
  * `--cache-to type=registry,ref=myrepo/cache:latest,mode=max`: Pushes the build cache (including intermediate build states and metadata) directly to a remote registry.
  * `--cache-from`: Imports this remote cache during subsequent builds, bypassing the need for local layer persistence.
  * `mode=min`: Exports only the layers utilized in the final image.
  * `mode=max`: Exports all intermediate layers, including those discarded in multi-stage builds.

### Q12: How does AppArmor integrate with Docker?
* **AppArmor**: A Linux kernel Security Module (LSM) that restricts program capabilities using per-program profiles.
* **Default Profile**: Docker automatically loads a default profile (`docker-default`) on systems supporting it (e.g., Ubuntu/Debian).
* **Restrictions**: Prevents containers from writing directly to `/proc` or `/sys` paths, mounting filesystems, or executing write operations to critical files, establishing a secondary security boundary beneath namespaces.

### Q13: Explain the implementation of a custom Docker network plugin using CNI.
* **CNI (Container Network Interface)**: A standardized API for writing network plugins.
* **Flow**:
  * When a container starts, containerd executes the CNI plugin binary, passing the network configuration JSON and container metadata via stdin.
  * The plugin provisions virtual interfaces (e.g., veth pairs), attaches them to a bridge or virtual router, assigns IP addresses, configures IPAM (IP Address Management), and sets up host routing rules before returning the configuration metadata to containerd.

### Q14: How does standard signal propagation fail when PID 1 inside a container is a bash script?
* **Problem**: In Linux, PID 1 does not inherit default signal handlers (like exit on `SIGTERM`).
* **Bash Behavior**: If a bash script is PID 1, it executes commands as child processes. Bash does *not* automatically forward received signals (such as `SIGTERM` from `docker stop`) to its active child processes.
* **Result**: The container ignores the stop signal, blocks for 10 seconds, and is eventually forcefully terminated by **SIGKILL**, risking database or memory state corruption.
* **Fix**: Use `exec my-app-binary` to replace the shell process with the binary, or use an init process (`tini`).

### Q15: Detail the architecture of Docker Content Trust (DCT) and Notary.
* **Definition**: A security feature that cryptographically signs image layers to guarantee authenticity, integrity, and expiration freshness.
* **Notary**: Uses the **TUF (The Update Framework)** protocol, utilizing a key hierarchy:
  * **Root Key**: Master offline key used to sign target keys.
  * **Targets Key**: Signs the individual hashes of image layers.
  * **Snapshot Key**: Signs metadata, preventing mix-and-match attacks.
  * **Timestamp Key**: Signs expiration metadata, preventing replay attacks.
* **Verification**: When `DOCKER_CONTENT_TRUST=1` is set, the client refuses to pull or run any image that fails signature verification.

### Q16: How do you debug container network routing using nsenter?
* **Problem**: Containers often lack debugging tools like `ip`, `route`, or `tcpdump` for security reasons.
* **nsenter**: A host-level tool that allows entering the namespace of any target process.
* **Usage**:
  1. Retrieve the container's PID: `PID=$(docker inspect -f '{{.State.Pid}}' [container_name])`
  2. Enter the container's network namespace: `nsenter -t $PID -n ip addr` or `nsenter -t $PID -n tcpdump -i eth0`
  * **Benefit**: Allows using the host's debugging binaries directly inside the container's network namespace.

### Q17: What are the security and operational risks of mounting /var/run/docker.sock?
* **Role**: `/var/run/docker.sock` is the UNIX socket that the Docker daemon listens on for API commands.
* **Risks**:
  * Anyone with access to this socket can execute any Docker API command.
  * **Container Escape**: An attacker can launch a container with `--privileged` and host volume mounts (`-v /:/host`), gaining absolute control over the host OS.
* **Mitigation**: Use proxy agents like `socket-proxy` to filter and allow only read-only or specific API requests, or migrate to rootless execution.

### Q18: What is Docker in Docker (DinD) vs Docker outside Docker (DooD)?
* **DinD**: Runs a complete, isolated Docker daemon *inside* a container. Requires running the container with `--privileged`, which exposes severe host security risks. Used primarily for specialized CI environments.
* **DooD**: Mounts the host's Docker socket `/var/run/docker.sock` inside the container. The container client communicates with the parent host's Docker daemon. Safer than DinD but still allows container escapes if the socket is compromised.

### Q19: Explain the structural differences between Docker save/load and export/import.
* **`docker save`**:
  * Exports an **image**.
  * Preserves all history, parent-child layer links, and metadata.
  * Reconstructs the exact layer graph when imported via `docker load`.
* **`docker export`**:
  * Exports a **container's active filesystem state**.
  * Discards all parent layers, build history, and configuration metadata.
  * Imports as a flat, single-layer image via `docker import`.

### Q20: Detail how storage quotas are enforced on overlay2 with XFS or ext4.
* **overlay2 Quotas**: Limits the maximum write capacity of a container's writable layer.
* **Prerequisites**: The host filesystem (XFS or ext4) must be mounted with project quotas (`pquota` or `prjquota`) enabled.
* **Implementation**: Pass the option during container initialization:
  `docker run --storage-opt size=20G my-image`
* **Enforcement**: The kernel restricts writing block allocations for the container's directory path, throwing disk-full errors when the limit is hit.

### Q21: What are Distroless images and how do they differ from Alpine?
* **Distroless**: Images created by Google that contain *only* the application binary and its immediate runtime dependencies (e.g., glibc, SSL certs).
* **Differences**:
  * Unlike Alpine, they contain **no shell, package manager, or standard OS utilities** (like `ls`, `sh`, `apk`).
  * **Security**: Dramatically reduces the attack surface and vulnerabilities (CVEs) to near-zero.
  * **Debugging**: Harder to debug; requires using ephemeral debug containers or attaching via `nsenter`.

### Q22: Explain the significance of the No New Privileges flag.
* **Flag `--security-opt=no-new-privileges`**: Enforces a kernel-level rule preventing child processes from gaining more privileges than their parent.
* **Mechanism**: Disables `setuid` and `setgid` executables (like `sudo`) from escalating privileges inside the container, blocking a common privilege escalation vector.

### Q23: Why do Go binaries compiled dynamically fail inside a scratch container?
* **Problem**: Go compilation defaults to linking system shared libraries (like `libc` or `libresolv`) dynamically.
* **Failure**: When executed in `scratch` (which contains zero libraries), the dynamic linker (`ld.so`) fails to resolve dependencies, causing the OS to return a confusing "file not found" or "no such file or directory" error.
* **Fix**: Force static compilation and disable cgo:
  `CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .`

### Q24: How does Docker coordinate multi-container service discovery in an overlay network?
* **Gossip Protocol**: Docker Swarm managers use a decentralized **gossip protocol** (based on Serf) to propagate cluster state.
* **KV Store**: An internal, distributed key-value store synchronizes routing tables and IP allocations across all host daemons.
* **Routing**: Packets are routed using VXLAN tunnels across host boundaries, utilizing IP Virtual Server (IPVS) inside the kernel to load balance requests across replica tasks.

### Q25: Explain the performance bottlenecks of the userland proxy.
* **Userland Proxy (`docker-proxy`)**: Creates a user-space process for each mapped port on the host to forward TCP packets.
* **Bottleneck**: Traveling through user space introduces severe CPU scheduling overhead, context switching latency, and high memory utilization under massive concurrent connections.
* **Solution**: Disable the proxy (`"userland-proxy": false` in `daemon.json`) to force Docker to rely entirely on kernel-space `iptables` NAT rules.

### Q26: Explain how container timezone synchronization is achieved dynamically.
* **Dynamic TZ**: Mounting host `/etc/localtime` as a volume can fail if the container uses a different base OS or does not contain timezone databases.
* **Best Practice**: Pass the standard `TZ` environment variable (e.g., `-e TZ=America/New_York`) and ensure the container's package manager installs the `tzdata` package during the build phase.

### Q27: How does Docker Swarm maintain consensus and service state consistency?
* **Raft Consensus**: Swarm manager nodes implement the Raft consensus algorithm.
* **Quorum**: Requires a strict mathematical majority of manager nodes ($N/2 + 1$) to be online to accept configuration updates.
* **State**: If the quorum is lost, managers stop accepting updates, preventing split-brain scenarios where conflicting cluster states are written simultaneously.

### Q28: What causes the Docker build error: "failed to compute cache key"?
* **Causes**:
  * The file or directory specified in `COPY` or `ADD` does not exist in the defined build context.
  * The file pattern is excluded inside the `.dockerignore` file.
  * Symlinks inside the build context pointing to paths outside the context are dereferenced but inaccessible, causing BuildKit to abort.

### Q29: Explain the impact of the kernel parameter net.ipv4.ip_forward on Docker.
* **ip_forward**: Controls whether the host kernel allows packets to be forwarded between network interfaces.
* **Docker Role**: Docker automatically enables `ip_forward=1` during daemon initialization. If disabled manually, the host refuses to forward packets between the internal bridge network (`docker0`) and the external internet interface, cutting off container outbound connectivity.

### Q30: How does the --ipc=host configuration parameter affect isolation?
* **IPC Isolation**: By default, containers use their own IPC namespace to isolate shared memory segments and semaphores.
* **IPC Host Mode**: `--ipc=host` allows the container processes to access the host’s shared memory space directly.
* **Use Case**: Necessary for high-performance applications (like database clusters or GPU processing workloads) that require zero-copy inter-process communication with host processes.

### Q31: What is the purpose of the build-time environment variable DOCKER_BUILDKIT=1?
* **Enabling BuildKit**: Tells the Docker CLI to route build commands through the modern BuildKit backend instead of the legacy build client.
* **Result**: Unlocks multi-stage parallel builds, advanced cache exporters, mounting directories as cache/secrets, and structured console output.

### Q32: What is the difference between overlay2 and overlay storage drivers?
* **overlay**: The legacy driver. Requires multiple inodes per layer, causing severe inode depletion on the host filesystem and requiring high metadata overhead.
* **overlay2**: Optimized to support up to 128 stacked layers natively using directory hard links, significantly reducing inode consumption and metadata traversal times.

### Q33: How does Docker allocate subnet pools to user-defined networks?
* **Default Allocation**: Docker allocates IP subnets from its internal pool (typically starting with `172.18.0.0/16`).
* **Custom Configuration**: To avoid collisions with existing corporate networks, subnets can be specified explicitly:
  `docker network create --subnet=192.168.10.0/24 my-net`

### Q34: What is the significance of the --read-only flag?
* **Security Hardening**: Mounts the container's root filesystem as absolute read-only.
* **Impact**: Blocks malicious processes or exploits from modifying binaries or writing malicious scripts to `/tmp`, `/var`, or `/home`.
* **Usability**: Requires pairing with writeable ephemeral RAM directories: `--read-only --tmpfs /tmp --tmpfs /var/run`.

### Q35: Explain how the kernel memory limit (--kernel-memory) operates.
* **Definition**: Limits the maximum kernel memory (e.g., page tables, stack space, socket buffers) a container can allocate.
* **Importance**: Prevents a container from mounting a denial-of-service (DoS) attack on the host by opening thousands of sockets, exhausting host kernel-space memory without hitting standard user-space memory limits.

### Q36: How does Docker handle multi-path disk volume provisioning?
* **Driver Plugins**: Docker utilizes specialized Volume Driver plugins (e.g., Portworx, NetApp Trident) that implement the Docker Volume API.
* **Action**: Dynamically provisions, attaches, and mounts block storage devices from external SAN/NAS networks directly to the host before executing container startup.

### Q37: What is the impact of running a container with the net=container:[ID] mode?
* **Namespace Sharing**: The container bypasses creating its own network namespace and attaches directly to the net namespace of the target container ID.
* **Effect**: Both containers share the identical IP address, routing table, and port space, allowing them to communicate over localhost directly (sidecar pattern).

### Q38: How can you limit disk write I/O operations per second (IOPS) for a container?
* **Flags**:
  * Limit IOPS: `--device-write-iops [device_path]:[limit]`
  * Limit BPS (Bytes per second): `--device-write-bps [device_path]:[limit]`
* **Mechanism**: Leverages the kernel's cgroups block I/O controller to throttle device queuing disciplines.

### Q39: What is the purpose of the --add-host flag?
* **DNS Override**: Dynamically injects custom IP-to-hostname mappings into the container's `/etc/hosts` file at startup (e.g., `--add-host myapi.com:192.168.1.50`).
* **Use Case**: Avoids modifying global DNS configurations during local integration testing.

### Q40: What are the differences between Hyper-V and Windows Server containers?
* **Windows Server Containers**: Share the host Windows kernel directly, offering high performance and density (similar to Linux containers).
* **Hyper-V Containers**: Run each container inside an optimized, lightweight Hyper-V virtual machine with its own Windows kernel, providing complete hypervisor-level isolation at the cost of higher startup overhead.

### Q41: Explain how eBPF can be used to audit Docker container operations.
* **eBPF (Extended Berkeley Packet Filter)**: Runs secure programs inside the host kernel sandboxed environment.
* **Usage**: By monitoring kernel system calls (like `sys_enter_clone` or `sys_enter_execve`) and filtering by container cgroup IDs, eBPF agents can trace container process execution, file I/O, and network packets with near-zero overhead and absolute tamper-resistance.

### Q42: What causes a "No space left on device" error during build when the host has ample free space?
* **Inode Exhaustion**: The underlying filesystem has run out of index nodes (inodes) due to creating millions of tiny files or intermediate layers, even though physical byte capacity remains available.
* **Docker cleanup**: Solved by executing `docker system prune -a --volumes` to delete old dangling layers and reclaim inodes.

### Q43: What does the --pid=host flag do?
* **Namespace Sharing**: Merges the container's PID namespace with the host's PID namespace.
* **Effect**: The container can see and interact with all processes running on the host machine.
* **Risk**: Allows the container process to send signals (like SIGKILL) to critical host processes, destroying host stability.

### Q44: How does Docker Notary protect against replay attacks?
* **Timestamp Key**: Notary generates a timestamp file containing expiration data signed by a short-lived **timestamp key**.
* **Effect**: The client validates the timestamp expiration during every pull request. If an attacker intercepts the request and attempts to serve an old, vulnerable image, the client rejects it because the timestamp file has expired.

### Q45: Explain what happens when you force delete an image (docker rmi -f).
* **Untagging**: If the image tag is pointing to layers shared by other images, Docker only removes the specified tag.
* **Force Deletion**: If forced, Docker forcefully deletes the tag and its associated read-only layers. If another container is running on those layers, it can cause severe runtime instability or dynamic linkage crashes.

### Q46: How does Docker Compose resolve configuration inheritance?
* **Mechanism**: Compose parses configurations hierarchically:
  * **Extends**: Dynamically inherits services from alternative YAML files.
  * **Includes**: Imports complete, independent compose files.
  * **Result**: Generates a unified, merged configuration file that resolves variable interpolations and overrides sequentially.

### Q47: What does the --mount flag do that -v does not?
* **Structure**: `--mount` uses a more explicit, verbose key-value syntax (e.g., `--mount type=bind,source=/src,target=/dst`).
* **Safety**: `--mount` throws a hard error and aborts startup if the host source path does not exist, whereas `-v` silently creates a new empty directory on the host, which can mask bugs.

### Q48: How does the kernel process memory.limit_in_bytes prevent memory exhaustion?
* **Enforcement**: Cgroups monitors the aggregate memory consumption of all processes inside the container's control group path.
* **Throttling**: When usage approaches `memory.limit_in_bytes`, the kernel attempts to reclaim page caches. If unsuccessful, it invokes the OOM Killer to protect the rest of the host system.

### Q49: Explain the impact of the --oom-kill-disable flag.
* **OOM Disable**: Instructs the kernel not to invoke the Out-Of-Memory Killer on processes inside the container.
* **Risk**: If the container runs out of memory, processes will hang indefinitely waiting for memory allocations, and it can destabilize the host if other cgroups attempt to compete for the remaining physical memory.

### Q50: How do you configure a custom registry proxy-cache?
* **Configuration**: Define the `registry-mirrors` block inside the daemon configuration file `/etc/docker/daemon.json`:
  ```json
  {
    "registry-mirrors": ["https://my-private-mirror.io"]
  }
  ```
* **Effect**: When pulling public images, the engine routes requests through the local private mirror first, caching layers locally and reducing external network bandwidth consumption.
