# Docker - Medium Interview Questions

### Q1: Detail the architecture of the Docker Engine.
* **Client-Server Architecture**: Composed of three primary parts:
  * **Docker Client (`docker`)**: The CLI tool that accepts user commands and communicates with the daemon over a REST API (via Unix sockets or TCP).
  * **Docker Daemon (`dockerd`)**: A background service that listens for API requests and manages Docker objects (images, containers, networks, volumes).
  * **Containerd & Runc**: The daemon relies on **containerd** (container lifecycle management) which spawns **runc** (the lightweight OCI-compliant runtime) to create and run containers.

### Q2: How does BuildKit differ from the legacy Docker builder?
* **BuildKit**: The modern, highly optimized build engine (enabled via `DOCKER_BUILDKIT=1`).
* **Advantages over legacy**:
  * **Parallel Execution**: Builds independent stages concurrently.
  * **Cache Mounts**: Supports mounting compilation caches (`RUN --mount=type=cache`) that persist between builds.
  * **Secrets Mounts**: Mounts build secrets (`RUN --mount=type=secret`) securely without baking them into final image layers.
  * **Garbage Collection**: Intelligent, automatic cleanup of intermediate build states.

### Q3: Explain how Docker image layers work and how they share space.
* **Union File System (UnionFS)**: Docker images are stacked layers where each layer represents a instruction in the `Dockerfile`.
* **Layer Immutability**: Each layer is read-only.
* **Storage Sharing**: If multiple images share the same parent layer, that layer is stored only once on disk.
* **Writable Layer**: At runtime, Docker adds a thin, writable container layer. Read operations fall back to the image layers, while modifications copy the file up to the writable layer (**Copy-on-Write**).

### Q4: Explain the HEALTHCHECK directive and its parameters.
* **Purpose**: Instructs Docker how to test a container to verify it is actively functioning (not just running as a zombie process).
* **Key Parameters**:
  * `--interval=30s`: Time between checks.
  * `--timeout=5s`: Maximum time allowed for a single check.
  * `--start-period=10s`: Initial grace period for slow-starting apps.
  * `--retries=3`: Number of consecutive failures before marking as `unhealthy`.
* **Exit Codes**: The test script must exit with `0` (healthy) or `1` (unhealthy).

### Q5: How do Docker networks handle service discovery?
* **Embedded DNS**: Docker runs an internal DNS server at `127.0.0.11` inside each container.
* **Service Name Resolution**: Within a **user-defined network**, containers resolve neighboring container IPs by using their **container names** or network aliases.
* **Limitation**: The default `bridge` network does *not* support embedded DNS and requires outdated `--link` flags.

### Q6: Explain the Linux kernel namespaces used by Docker.
* **PID Namespace**: Isolates the process ID space (container process thinks it is PID 1).
* **NET Namespace**: Isolates network interfaces, route tables, and port spaces.
* **MNT Namespace**: Isolates filesystem mount points.
* **IPC Namespace**: Isolates Inter-Process Communication (shared memory, semaphores).
* **UTS Namespace**: Isolates hostnames and NIS domain names.
* **USER Namespace**: Maps container UIDs to different host UIDs (e.g., container root maps to an unprivileged host user).

### Q7: What are Linux Control Groups (cgroups) and how does Docker use them?
* **Definition**: A kernel feature that limits, accounts for, and isolates physical resource usage.
* **Docker Application**: Used to restrict container resource limits:
  * **CPU**: Limits execution shares (`--cpu-shares`), core count (`--cpus`), or CFS quotas.
  * **Memory**: Restricts maximum RAM and swap consumption (`-m`, `--memory-swap`).
  * **Block I/O**: Throttles read/write rates to disk (`--device-read-bps`).

### Q8: What is the difference between environment variables set via ENV vs those in .env files?
* **ENV in Dockerfile**: Baked directly into the image metadata; available during both build-time and runtime for any container spawned from that image.
* **.env File in Docker Compose**: Used locally by Docker Compose to substitute variables inside the `docker-compose.yml` file itself. They do not automatically propagate inside the containers unless referenced in the `environment` block.

### Q9: What is the ONBUILD directive and when should you use it?
* **Definition**: Registers a trigger instruction (like `ONBUILD COPY . /app`) to be executed in the future when *another* image uses the current image as its base (`FROM`).
* **Use Case**: Used to create skeleton templates or parent images for application frameworks where downstream developers only need to copy their local source code.

### Q10: How does Docker handle volume mounting when the target container directory is not empty?
* **Named Volume Mounting**: If an empty named volume is mounted to a container directory containing files, Docker **copies** those files up into the volume, preserving them.
* **Bind Mounting**: If a host path is bind-mounted over a non-empty container directory, the container's existing files are **hidden/masked** by the host directory's contents, showing only the host files.

### Q11: Explain the overlay2 storage driver.
* **Mechanism**: A UnionFS implementation that utilizes page-cache sharing and page-level merging to mount multiple directories (layers) as a single unified view.
* **Directories**:
  * `lowerdir`: Read-only image layers.
  * `upperdir`: Writable container layer.
  * `merged`: The unified filesystem directory visible inside the container.
  * `workdir`: Internal directory used for transaction control.

### Q12: Explain the differences between ARG and ENV scoping.
* **ARG Scoping**:
  * Declared *before* `FROM`: Only available in the `FROM` line itself.
  * Declared *after* `FROM`: Available only within that specific build stage. Disappears at runtime.
* **ENV Scoping**: Available throughout all stages from its point of definition onward and persists in the final running container.

### Q13: What are Docker contexts and why are they used?
* **Definition**: A Docker mechanism to easily manage and switch CLI connections between multiple Docker engines (e.g., local host, remote VM, cloud environments, or Kubernetes clusters).
* **Command**: `docker context use [context_name]` changes the active target of the CLI client instantly.

### Q14: How does the depends_on directive behave in Docker Compose?
* **Control Startup Order**: Specifies the sequence in which container services are created and started (e.g., `db` starts before `web`).
* **Limitation**: Only controls the starting sequence of the *processes*; it does not verify if the target service is actually "ready" or healthy unless paired with a `service_healthy` condition.

### Q15: How can you drop or add specific Linux capabilities to a container?
* **Default State**: Containers run with a restricted set of default capabilities (no raw socket access, no direct hardware control).
* **Modifying Capabilities**:
  * `--cap-drop`: Removes privileges (e.g., `--cap-drop=NET_RAW` prevents ping attacks).
  * `--cap-add`: Grants specific privileges (e.g., `--cap-add=SYS_ADMIN` for mounting operations).
* **Best Practice**: Drop all capabilities and add back only what is explicitly required (`--cap-drop=all --cap-add=CHOWN`).

### Q16: What is a Docker Swarm and how does it compare to Kubernetes?
* **Docker Swarm**: Docker's native container orchestration tool. Simple, easy to configure, integrated natively into the CLI, but limited in scalability and advanced scheduling.
* **Kubernetes (K8s)**: An industry-standard orchestrator. Complex, highly extensible, supports advanced deployment strategies, declarative self-healing, but requires significant setup and operational overhead.

### Q17: What is the difference between Docker Secrets and Docker Configs?
* **Docker Secrets**: Securely stores and encrypts sensitive data (passwords, SSL certs, private keys). Decrypted and mounted to `/run/secrets/` inside the container in-memory only (tmpfs).
* **Docker Configs**: Stores non-sensitive configuration data (e.g., `nginx.conf`, app properties). Mounted unencrypted to the container filesystem.
* **Availability**: Both natively require Docker Swarm mode or Compose integration to function.

### Q18: Explain the difference between json-file and journald logging drivers.
* **json-file (default)**: Writes container standard streams to JSON files on the host disk under `/var/lib/docker/containers/`. Can cause disk space exhaustion if not configured with log rotation (`max-size`, `max-file`).
* **journald**: Routes container logs directly to the host's system-wide `journald` service, delegating rotation and storage to systemd.

### Q19: What is Docker Buildx?
* **Tool**: A Docker CLI plugin that extends the `docker build` command with full BuildKit capabilities.
* **Use Case**: Enables **multi-platform builds** (e.g., building ARM64 and AMD64 images simultaneously using QEMU emulation) and caching to remote repositories.

### Q20: How do you mount a volume as read-only and why?
* **Syntax**: Append `:ro` to the volume or bind-mount argument (e.g., `-v /host/path:/container/path:ro`).
* **Why**: Enforces **immutability** on host files, preventing a compromised container from writing malicious code or altering configuration files on the host.

### Q21: What is the purpose of docker-compose.override.yml?
* **Automatic Merging**: Docker Compose automatically merges `docker-compose.yml` and `docker-compose.override.yml` when executed.
* **Use Case**: Used to define development-specific overrides (like debugging ports, local bind mounts, and verbose logging) without modifying the base production file.

### Q22: How can you update a running container's resource limits without stopping it?
* **Command**: `docker update`.
* **Application**: Can dynamically alter CPU shares, limits, and memory limits on a live container (e.g., `docker update --memory 1g --cpus 2 [container_name]`).

### Q23: What does the --privileged flag do? Why should it be avoided?
* **Privileged Mode**: Gives the container root process access to all host devices and disables cgroup limits and namespace protections.
* **Risk**: Allows the container process to mount the host hard drive directly, meaning any container escape compromise instantly translates to full host machine take-over.

### Q24: What is a zombie process in a container and how do you prevent it?
* **Zombie Process**: An exited child process whose exit status hasn't been reaped by its parent process.
* **Cause**: Occurs when the container's PID 1 process (e.g., a simple node or python app) is not designed to act as an init daemon and reap dead processes.
* **Prevention**: Use the `--init` flag during execution or add a lightweight init wrapper like `tini` inside the Dockerfile.

### Q25: Explain the difference between host-to-container port mapping and Userland Proxy.
* **Userland Proxy**: A user-space helper daemon (`docker-proxy`) spawned by Docker for each mapped port to route traffic from host to container.
* **Iptables NAT**: Modern engines bypass the userland proxy by configuring native kernel-level Network Address Translation (NAT) rules via `iptables`. This is faster and uses fewer host resources.

### Q26: What happens when a container runs out of memory?
* **OOM Killer**: The Linux kernel Out-Of-Memory (OOM) Killer terminates the offending process.
* **Container Exit**: If the primary PID 1 process is killed, the container exits immediately with code **137** (indicating it was terminated by SIGKILL).

### Q27: How can you connect a single container to multiple Docker networks?
* **Method**: First, launch the container on one network. Then, execute `docker network connect [network_name] [container_name]` to attach it to secondary networks.
* **Result**: The container gains a network interface and an IP address in each connected network, allowing it to act as a secure gateway.

### Q28: How does the docker manifest command work?
* **Multi-Arch Images**: Combines multiple images compiled for different CPU architectures (e.g., `amd64`, `arm64`, `386`) under a single image tag.
* **Clients**: When a client pulls the tag, Docker references the manifest and automatically retrieves only the layer stack matching the client's architecture.

### Q29: What is the purpose of the sysctls configuration parameter in Docker?
* **Kernel Tuning**: Allows modifying namespaced Linux kernel parameters (like network stack queue limits or IP forwarding) inside the container at runtime (e.g., `sysctls: net.core.somaxconn=1024`).

### Q30: How can you pass credentials during image build without baking them into layers?
* **BuildKit Secrets Mount**:
  * In Dockerfile: `RUN --mount=type=secret,id=my_key curl -u $(cat /run/secrets/my_key) http://example.com`
  * Build command: `docker build --secret id=my_key,src=~/.secrets/key.txt -t my-image .`
  * **Benefit**: The key is mounted only in memory during the execution of that specific layer and never written to the image history.

### Q31: What is gVisor and how does it interface with Docker?
* **gVisor**: A sandboxed container runtime developed by Google that virtualizes the Linux kernel.
* **Security**: It intercepts all container system calls and runs them in user space, isolating containerized processes from direct host kernel access, mitigating zero-day kernel exploits.

### Q32: Explain the behavior of the overlay network driver.
* **Multi-Host Routing**: Enables secure communication between containers running on completely different host machines in a cluster.
* **Technology**: Uses VXLAN (Virtual Extensible LAN) encapsulation to create a secure virtual overlay network across physical hosts without manual routing rules.

### Q33: Why does ordering of lines in a Dockerfile matter for cache performance?
* **Cache Invalidation**: Docker checks cache sequentially. Once a layer changes (e.g., a source code file is modified in `COPY . .`), that layer and **all subsequent layers** are invalidated and must rebuild.
* **Optimization**: Place infrequently changed steps (like installing system libraries or package descriptors) at the top, and frequently changed code modifications at the very bottom.

### Q34: What is the purpose of the docker network prune command?
* **Cleanup**: Deletes all unused networks that are not currently associated with at least one running or stopped container, reclaiming internal routing resources.

### Q35: How do you configure Docker log rotation globally?
* **Configuration**: Define limits inside the host's `/etc/docker/daemon.json` configuration file:
  ```json
  {
    "log-driver": "json-file",
    "log-opts": {
      "max-size": "10m",
      "max-file": "3"
    }
  }
  ```
* **Effect**: Restricts each container to a maximum of 3 log files of 10MB each, rotating old files automatically.

### Q36: What is a MACVLAN network driver?
* **Direct Access**: Assigns a unique MAC address to each container, making the container appear as a physical network interface directly attached to the host's physical network router.
* **Use Case**: Useful for legacy applications that must bypass virtualization layers and have dedicated real IPs on the company LAN.

### Q37: How do you retrieve only the IP address of a container using docker inspect?
* **Go Templating**: Use the format engine flag:
  `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' [container_name]`
* **Benefit**: Isolates and outputs only the raw IP address without requiring manual parsing of the massive JSON payload.

### Q38: Explain the difference between docker rm -f and docker rm.
* **docker rm**: Only removes stopped containers. Fails if the container is currently running.
* **docker rm -f**: Forces removal of a running container by sending a **SIGKILL** to stop its active processes before deleting it.

### Q39: What is the Docker daemon configuration file?
* **daemon.json**: The primary configuration file located at `/etc/docker/daemon.json` (Linux) or `C:\ProgramData\docker\config\daemon.json` (Windows).
* **Role**: Configures critical parameters like DNS servers, default storage drivers, TLS endpoints, registry mirrors, and default resource allocations.

### Q40: What happens to a running container if the Docker daemon crashes or restarts?
* **Default**: All containers stop immediately because the parent management daemon dies.
* **Live Restore**: If `live-restore` is set to `true` in `/etc/docker/daemon.json`, the containers will remain running and active even while the daemon restarts or upgrades.

### Q41: Explain the purpose of the macvlan vs ipvlan network drivers.
* **macvlan**: Assigns a unique MAC address and IP address to each container. Requires the host network switch to support promisc mode.
* **ipvlan**: Shares the host's MAC address but assigns unique IP addresses to each container. Useful when switches limit the number of active MAC addresses.

### Q42: What is the purpose of the ARG directive before the FROM directive?
* **Scope**: Defining an `ARG` before `FROM` makes that variable available *only* to select the base image version (e.g., `ARG TAG=alpine` -> `FROM $TAG`). It is out of scope for any commands inside the build stages unless re-declared.

### Q43: How do you mount a temporary directory in RAM inside a container?
* **Flag `--tmpfs`**: Mounts a folder directly inside the host's system memory (RAM) instead of writing to disk:
  `docker run -d --tmpfs /tmp my-image`
* **Benefit**: Extreme read/write speeds for temp files, and ensures data is destroyed immediately when the container stops.

### Q44: What is the difference between a user-defined bridge network and the default bridge network?
* **Default Bridge**: Does not support DNS resolution (names must be linked manually); insecure since all containers share the same network block.
* **User-Defined Bridge**: Enables automated internal DNS resolution; offers complete isolation between containers; supports dynamic adjustments without container downtime.

### Q45: Explain what happens when a build cache is invalidated.
* **Downward Invalidation**: Once a specific line's inputs change, Docker invalidates that line's cache. All instructions defined *after* that point are evaluated from scratch, completely ignoring any existing cached states.

### Q46: How do you configure Docker Compose to pull the newest version of images?
* **Command**: Run `docker-compose pull` before calling `docker-compose up`.
* **Effect**: Forces Compose to contact the registry and download the absolute newest tags of the services, bypassing local cached image versions.

### Q47: What does the container status Restarting indicate?
* **Diagnostic**: Indicates that the container process is continuously crashing immediately upon startup, and the engine is trying to re-execute it according to its configured restart policy (such as `always`).

### Q48: How do you build an image from a Dockerfile located in a non-standard path?
* **Flag `-f`**: Pass the file location explicitly:
  `docker build -f /path/to/custom.Dockerfile -t my-app .`
* **Context**: The build context remains the directory specified at the end of the command (`.`).

### Q49: What is the purpose of the docker-compose profiles?
* **Selective Starting**: Allows grouping services under named profiles (e.g., `profiles: ["debug"]`).
* **Effect**: Services under a profile are not started by default during `docker-compose up` unless explicitly enabled via the `--profile` flag or an environment variable.

### Q50: How do you configure a container to synchronize its time with the host?
* **Mechanism**: On Linux, mount the host's timezone configurations as read-only volumes:
  `-v /etc/timezone:/etc/timezone:ro -v /etc/localtime:/etc/localtime:ro`
* **Result**: Container processes read the identical timezone files, matching host clock offsets exactly.
